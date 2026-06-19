'use client';

import { getFiSkillProviderById } from '@ficlouds/const';
import { type Klavis } from 'klavis';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useToolStore } from '@/store/tool';
import { klavisStoreSelectors, fiSkillStoreSelectors } from '@/store/tool/selectors';
import { KlavisServerStatus } from '@/store/tool/slices/klavisStore';
import { FiSkillStatus } from '@/store/tool/slices/fiSkillStore/types';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 15_000;

interface UseSkillConnectOptions {
  identifier: string;
  serverName?: Klavis.McpServerName;
  type: 'klavis' | 'lobehub';
}

export const useSkillConnect = ({ identifier, serverName, type }: UseSkillConnectOptions) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWaitingAuth, setIsWaitingAuth] = useState(false);

  const oauthWindowRef = useRef<Window | null>(null);
  const windowCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fi skill hooks
  const checkFiStatus = useToolStore((s) => s.checkFiSkillStatus);
  const revokeLobehubConnect = useToolStore((s) => s.revokeFiSkill);
  const getAuthorizeUrl = useToolStore((s) => s.getFiSkillAuthorizeUrl);
  const fiServer = useToolStore(fiSkillStoreSelectors.getServerByIdentifier(identifier));

  // Klavis hooks
  const userId = useUserStore(userProfileSelectors.userId);
  const createKlavisServer = useToolStore((s) => s.createKlavisServer);
  const refreshKlavisServerTools = useToolStore((s) => s.refreshKlavisServerTools);
  const removeKlavisServer = useToolStore((s) => s.removeKlavisServer);
  const klavisServer = useToolStore(klavisStoreSelectors.getServerByIdentifier(identifier));

  const cleanup = useCallback(() => {
    if (windowCheckIntervalRef.current) {
      clearInterval(windowCheckIntervalRef.current);
      windowCheckIntervalRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    oauthWindowRef.current = null;
    setIsWaitingAuth(false);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    const connected =
      type === 'lobehub'
        ? fiServer?.status === FiSkillStatus.CONNECTED
        : klavisServer?.status === KlavisServerStatus.CONNECTED;

    if (connected && isWaitingAuth) {
      cleanup();
    }
  }, [type, fiServer?.status, klavisServer?.status, isWaitingAuth, cleanup]);

  // Listen for OAuth success message from popup window (for Fi skills)
  useEffect(() => {
    if (type !== 'lobehub') return;

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (
        event.data?.type === 'LOBEHUB_SKILL_AUTH_SUCCESS' &&
        event.data?.provider === identifier
      ) {
        cleanup();
        await checkFiStatus(identifier);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [type, identifier, cleanup, checkFiStatus]);

  const startFallbackPolling = useCallback(
    (serverIdOrName: string) => {
      if (pollIntervalRef.current) return;

      pollIntervalRef.current = setInterval(async () => {
        try {
          if (type === 'lobehub') {
            await checkFiStatus(serverIdOrName);
          } else {
            await refreshKlavisServerTools(serverIdOrName);
          }
        } catch (error) {
          console.error('[SkillStore] Failed to check status:', error);
        }
      }, POLL_INTERVAL_MS);

      pollTimeoutRef.current = setTimeout(() => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setIsWaitingAuth(false);
      }, POLL_TIMEOUT_MS);
    },
    [type, checkFiStatus, refreshKlavisServerTools],
  );

  const startWindowMonitor = useCallback(
    (oauthWindow: Window, serverIdOrName: string) => {
      windowCheckIntervalRef.current = setInterval(async () => {
        try {
          if (oauthWindow.closed) {
            if (windowCheckIntervalRef.current) {
              clearInterval(windowCheckIntervalRef.current);
              windowCheckIntervalRef.current = null;
            }
            oauthWindowRef.current = null;
            // Check status and then reset waiting state
            if (type === 'lobehub') {
              await checkFiStatus(serverIdOrName);
            } else {
              await refreshKlavisServerTools(serverIdOrName);
            }
            setIsWaitingAuth(false);
          }
        } catch {
          if (windowCheckIntervalRef.current) {
            clearInterval(windowCheckIntervalRef.current);
            windowCheckIntervalRef.current = null;
          }
          startFallbackPolling(serverIdOrName);
        }
      }, 500);
    },
    [type, checkFiStatus, refreshKlavisServerTools, startFallbackPolling],
  );

  const openOAuthWindow = useCallback(
    (oauthUrl: string, serverIdOrName: string) => {
      cleanup();
      setIsWaitingAuth(true);

      const oauthWindow = window.open(oauthUrl, '_blank', 'width=600,height=700');
      if (oauthWindow) {
        oauthWindowRef.current = oauthWindow;
        startWindowMonitor(oauthWindow, serverIdOrName);
      } else {
        startFallbackPolling(serverIdOrName);
      }
    },
    [cleanup, startWindowMonitor, startFallbackPolling],
  );

  // Handle connect for Fi
  const handleLobehubConnect = useCallback(async () => {
    if (fiServer?.isConnected) return;

    setIsConnecting(true);
    try {
      const provider = getFiSkillProviderById(identifier);
      if (!provider) return;

      // Skip redirectUri on desktop (app:// protocol) since the system browser can't navigate to it
      const redirectUri = window.location.protocol.startsWith('http')
        ? `${window.location.origin}/oauth/callback/success?provider=${encodeURIComponent(identifier)}`
        : undefined;
      const { authorizeUrl } = await getAuthorizeUrl(identifier, { redirectUri });
      openOAuthWindow(authorizeUrl, identifier);
    } catch (error) {
      console.error('[SkillStore] Failed to get authorize URL:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [identifier, fiServer?.isConnected, getAuthorizeUrl, openOAuthWindow]);

  // Handle connect for Klavis
  const handleKlavisConnect = useCallback(async () => {
    if (!userId || !serverName) return;
    if (klavisServer) return;

    setIsConnecting(true);
    try {
      const newServer = await createKlavisServer({
        identifier,
        serverName,
        userId,
      });

      if (newServer) {
        if (newServer.isAuthenticated) {
          await refreshKlavisServerTools(newServer.identifier);
        } else if (newServer.oauthUrl) {
          openOAuthWindow(newServer.oauthUrl, newServer.identifier);
        }
      }
    } catch (error) {
      console.error('[SkillStore] Failed to connect server:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [
    userId,
    serverName,
    klavisServer,
    identifier,
    createKlavisServer,
    refreshKlavisServerTools,
    openOAuthWindow,
  ]);

  const handleConnect = type === 'lobehub' ? handleLobehubConnect : handleKlavisConnect;

  const handleDisconnect = useCallback(async () => {
    if (type === 'lobehub' && fiServer) {
      await revokeLobehubConnect(fiServer.identifier);
    } else if (type === 'klavis' && klavisServer) {
      await removeKlavisServer(klavisServer.identifier);
    }
  }, [type, fiServer, klavisServer, revokeLobehubConnect, removeKlavisServer]);

  const isConnected =
    type === 'lobehub'
      ? fiServer?.status === FiSkillStatus.CONNECTED
      : klavisServer?.status === KlavisServerStatus.CONNECTED;

  return {
    handleConnect,
    handleDisconnect,
    isConnected,
    isConnecting: isConnecting || isWaitingAuth,
  };
};
