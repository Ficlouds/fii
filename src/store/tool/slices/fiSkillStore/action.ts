import { getFiSkillProviderById } from '@ficlouds/const';
import { produce } from 'immer';
import { type SWRResponse } from 'swr';
import useSWR from 'swr';

import { toolsClient } from '@/libs/trpc/client';
import { type StoreSetter } from '@/store/types';
import { setNamespace } from '@/utils/storeDebug';

import { type ToolStore } from '../../store';
import { type FiSkillStoreState } from './initialState';
import {
  type CallFiSkillToolParams,
  type CallFiSkillToolResult,
  type FiSkillServer,
  type FiSkillTool,
} from './types';
import { FiSkillStatus } from './types';

const n = setNamespace('fiSkillStore');

/**
 * Fi Skill Store Actions
 */

type Setter = StoreSetter<ToolStore>;
export const createFiSkillStoreSlice = (set: Setter, get: () => ToolStore, _api?: unknown) =>
  new FiSkillStoreActionImpl(set, get, _api);

export class FiSkillStoreActionImpl {
  readonly #get: () => ToolStore;
  readonly #set: Setter;

  constructor(set: Setter, get: () => ToolStore, _api?: unknown) {
    void _api;
    this.#set = set;
    this.#get = get;
  }

  callFiSkillTool = async (
    params: CallFiSkillToolParams,
  ): Promise<CallFiSkillToolResult> => {
    const { provider, toolName, args, topicId } = params;
    const toolId = `${provider}:${toolName}`;

    this.#set(
      produce((draft: FiSkillStoreState) => {
        draft.fiSkillExecutingToolIds.add(toolId);
      }),
      false,
      n('callFiSkillTool/start'),
    );

    try {
      const response = await toolsClient.market.connectCallTool.mutate({
        args,
        provider,
        toolName,
        topicId,
      });

      this.#set(
        produce((draft: FiSkillStoreState) => {
          draft.fiSkillExecutingToolIds.delete(toolId);
        }),
        false,
        n('callFiSkillTool/success'),
      );

      return { data: response.data, success: true };
    } catch (error) {
      console.error('[FiSkill] Failed to call tool:', error);

      this.#set(
        produce((draft: FiSkillStoreState) => {
          draft.fiSkillExecutingToolIds.delete(toolId);
        }),
        false,
        n('callFiSkillTool/error'),
      );

      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('NOT_CONNECTED') || errorMessage.includes('TOKEN_EXPIRED')) {
        return {
          error: errorMessage,
          errorCode: 'NOT_CONNECTED',
          success: false,
        };
      }

      return {
        error: errorMessage,
        success: false,
      };
    }
  };

  checkFiSkillStatus = async (provider: string): Promise<FiSkillServer | undefined> => {
    this.#set(
      produce((draft: FiSkillStoreState) => {
        draft.fiSkillLoadingIds.add(provider);
      }),
      false,
      n('checkFiSkillStatus/start'),
    );

    try {
      const response = await toolsClient.market.connectGetStatus.query({ provider });
      // Get provider config from local definition for correct display name
      const providerConfig = getFiSkillProviderById(provider);

      const server: FiSkillServer = {
        cachedAt: Date.now(),
        icon: response.icon,
        identifier: provider,
        isConnected: response.connected,
        // Use local config label (e.g., "Linear") instead of API's providerName
        name: providerConfig?.label || provider,
        providerUsername: response.connection?.providerUsername,
        scopes: response.connection?.scopes,
        status: response.connected
          ? FiSkillStatus.CONNECTED
          : FiSkillStatus.NOT_CONNECTED,
        tokenExpiresAt: response.connection?.tokenExpiresAt,
      };

      this.#set(
        produce((draft: FiSkillStoreState) => {
          const existingIndex = draft.fiSkillServers.findIndex(
            (s) => s.identifier === provider,
          );
          if (existingIndex >= 0) {
            draft.fiSkillServers[existingIndex] = server;
          } else {
            draft.fiSkillServers.push(server);
          }
          draft.fiSkillLoadingIds.delete(provider);
        }),
        false,
        n('checkFiSkillStatus/success'),
      );

      if (server.isConnected) {
        this.#get().refreshFiSkillTools(provider);
      }

      return server;
    } catch (error) {
      console.error('[FiSkill] Failed to check status:', error);

      this.#set(
        produce((draft: FiSkillStoreState) => {
          draft.fiSkillLoadingIds.delete(provider);
        }),
        false,
        n('checkFiSkillStatus/error'),
      );

      return undefined;
    }
  };

  getFiSkillAuthorizeUrl = async (
    provider: string,
    options?: { redirectUri?: string; scopes?: string[] },
  ): Promise<{ authorizeUrl: string; code: string; expiresIn: number }> => {
    const response = await toolsClient.market.connectGetAuthorizeUrl.query({
      provider,
      redirectUri: options?.redirectUri,
      scopes: options?.scopes,
    });

    return {
      authorizeUrl: response.authorizeUrl,
      code: response.code,
      expiresIn: response.expiresIn,
    };
  };

  internal_updateFiSkillServer = (
    provider: string,
    update: Partial<FiSkillServer>,
  ): void => {
    this.#set(
      produce((draft: FiSkillStoreState) => {
        const serverIndex = draft.fiSkillServers.findIndex((s) => s.identifier === provider);
        if (serverIndex >= 0) {
          draft.fiSkillServers[serverIndex] = {
            ...draft.fiSkillServers[serverIndex],
            ...update,
          };
        }
      }),
      false,
      n('internal_updateFiSkillServer'),
    );
  };

  refreshFiSkillToken = async (provider: string): Promise<boolean> => {
    try {
      const response = await toolsClient.market.connectRefresh.mutate({ provider });

      if (response.refreshed) {
        this.#get().internal_updateFiSkillServer(provider, {
          status: FiSkillStatus.CONNECTED,
          tokenExpiresAt: response.connection?.tokenExpiresAt,
        });
      }

      return response.refreshed;
    } catch (error) {
      console.error('[FiSkill] Failed to refresh token:', error);
      return false;
    }
  };

  refreshFiSkillTools = async (provider: string): Promise<void> => {
    try {
      const response = await toolsClient.market.connectListTools.query({ provider });

      this.#set(
        produce((draft: FiSkillStoreState) => {
          const serverIndex = draft.fiSkillServers.findIndex((s) => s.identifier === provider);
          if (serverIndex >= 0) {
            draft.fiSkillServers[serverIndex].tools = response.tools as FiSkillTool[];
          }
        }),
        false,
        n('refreshFiSkillTools/success'),
      );
    } catch (error) {
      console.error('[FiSkill] Failed to refresh tools:', error);
    }
  };

  revokeFiSkill = async (provider: string): Promise<void> => {
    this.#set(
      produce((draft: FiSkillStoreState) => {
        draft.fiSkillLoadingIds.add(provider);
      }),
      false,
      n('revokeFiSkill/start'),
    );

    try {
      await toolsClient.market.connectRevoke.mutate({ provider });

      this.#set(
        produce((draft: FiSkillStoreState) => {
          draft.fiSkillServers = draft.fiSkillServers.filter(
            (s) => s.identifier !== provider,
          );
          draft.fiSkillLoadingIds.delete(provider);
        }),
        false,
        n('revokeFiSkill/success'),
      );
    } catch (error) {
      console.error('[FiSkill] Failed to revoke:', error);

      this.#set(
        produce((draft: FiSkillStoreState) => {
          draft.fiSkillLoadingIds.delete(provider);
        }),
        false,
        n('revokeFiSkill/error'),
      );
    }
  };

  useFetchFiSkillConnections = (enabled: boolean): SWRResponse<FiSkillServer[]> => {
    return useSWR<FiSkillServer[]>(
      enabled ? 'fetchFiSkillConnections' : null,
      async () => {
        const response = await toolsClient.market.connectListConnections.query();

        // Debug logging

        return response.connections.map((conn: any) => {
          // Debug logging for each connection

          // Get provider config from local definition for correct display name
          const providerConfig = getFiSkillProviderById(conn.providerId);
          return {
            cachedAt: Date.now(),
            icon: conn.icon,
            identifier: conn.providerId,
            isConnected: true,
            // Use local config label (e.g., "Linear") instead of API's providerName (which is user's name on that service)
            name: providerConfig?.label || conn.providerId,
            providerUsername: conn.providerUsername,
            scopes: conn.scopes,
            status: FiSkillStatus.CONNECTED,
            tokenExpiresAt: conn.tokenExpiresAt,
          };
        });
      },
      {
        fallbackData: [],
        onSuccess: (data) => {
          if (data.length > 0) {
            this.#set(
              produce((draft: FiSkillStoreState) => {
                const existingIds = new Set(draft.fiSkillServers.map((s) => s.identifier));
                const newServers = data.filter((s) => !existingIds.has(s.identifier));
                draft.fiSkillServers = [...draft.fiSkillServers, ...newServers];
              }),
              false,
              n('useFetchFiSkillConnections'),
            );

            for (const server of data) {
              this.#get().refreshFiSkillTools(server.identifier);
            }
          }
        },
        revalidateOnFocus: false,
      },
    );
  };

  useFetchProviderTools = (provider: string | undefined): SWRResponse<FiSkillTool[]> => {
    return useSWR<FiSkillTool[]>(
      provider ? `lobehub-skill-tools-${provider}` : null,
      async () => {
        const response = await toolsClient.market.connectListTools.query({ provider: provider! });
        return (response.tools || []).map((tool: any) => ({
          description: tool.description,
          inputSchema: tool.inputSchema,
          name: tool.name,
        }));
      },
      {
        fallbackData: [],
        revalidateOnFocus: false,
      },
    );
  };
}

export type FiSkillStoreAction = Pick<
  FiSkillStoreActionImpl,
  keyof FiSkillStoreActionImpl
>;
