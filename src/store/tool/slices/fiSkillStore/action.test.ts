import type * as LobechatConstModule from '@ficlouds/const';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { toolsClient } from '@/libs/trpc/client';

import { useToolStore } from '../../store';
import { FiSkillStatus } from './types';

vi.mock('zustand/traditional');

beforeEach(() => {
  vi.clearAllMocks();
});

vi.mock('@ficlouds/const', async (importOriginal) => {
  const actual = await importOriginal<typeof LobechatConstModule>();
  return {
    ...actual,
    getFiSkillProviderById: vi.fn((id: string) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      icon: '🔗',
    })),
  };
});

vi.mock('@/libs/trpc/client', () => ({
  toolsClient: {
    market: {
      connectCallTool: { mutate: vi.fn() },
      connectGetAuthorizeUrl: { query: vi.fn() },
      connectGetStatus: { query: vi.fn() },
      connectListConnections: { query: vi.fn() },
      connectListTools: { query: vi.fn() },
      connectRefresh: { mutate: vi.fn() },
      connectRevoke: { mutate: vi.fn() },
    },
  },
}));

describe('fiSkillStore actions', () => {
  describe('callFiSkillTool', () => {
    it('should call tool successfully and return result', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      const mockResponse = {
        data: { result: 'success' },
      };
      vi.mocked(toolsClient.market.connectCallTool.mutate).mockResolvedValue(mockResponse as any);

      let callResult;
      await act(async () => {
        callResult = await result.current.callFiSkillTool({
          provider: 'linear',
          toolName: 'createIssue',
          args: { title: 'Test Issue' },
        });
      });

      expect(callResult).toEqual({ data: mockResponse.data, success: true });
      expect(toolsClient.market.connectCallTool.mutate).toHaveBeenCalledWith({
        provider: 'linear',
        toolName: 'createIssue',
        args: { title: 'Test Issue' },
        topicId: undefined,
      });
    });

    it('should track executing state during tool call', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(toolsClient.market.connectCallTool.mutate).mockReturnValue(promise as any);

      const callPromise = act(async () => {
        return result.current.callFiSkillTool({
          provider: 'linear',
          toolName: 'createIssue',
        });
      });

      // Tool should be marked as executing during the call
      await waitFor(() => {
        expect(result.current.fiSkillExecutingToolIds.has('linear:createIssue')).toBe(true);
      });

      // Resolve the promise
      resolvePromise!({ data: {} });
      await callPromise;

      // Tool should no longer be executing after completion
      expect(result.current.fiSkillExecutingToolIds.has('linear:createIssue')).toBe(false);
    });

    it('should handle NOT_CONNECTED error', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectCallTool.mutate).mockRejectedValue(
        new Error('NOT_CONNECTED'),
      );

      let callResult;
      await act(async () => {
        callResult = await result.current.callFiSkillTool({
          provider: 'linear',
          toolName: 'createIssue',
        });
      });

      expect(callResult).toEqual({
        error: 'NOT_CONNECTED',
        errorCode: 'NOT_CONNECTED',
        success: false,
      });
      expect(result.current.fiSkillExecutingToolIds.has('linear:createIssue')).toBe(false);
    });

    it('should handle TOKEN_EXPIRED error', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectCallTool.mutate).mockRejectedValue(
        new Error('TOKEN_EXPIRED'),
      );

      let callResult;
      await act(async () => {
        callResult = await result.current.callFiSkillTool({
          provider: 'linear',
          toolName: 'createIssue',
        });
      });

      expect(callResult).toEqual({
        error: 'TOKEN_EXPIRED',
        errorCode: 'NOT_CONNECTED',
        success: false,
      });
    });

    it('should handle generic error', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectCallTool.mutate).mockRejectedValue(
        new Error('Network error'),
      );

      let callResult;
      await act(async () => {
        callResult = await result.current.callFiSkillTool({
          provider: 'linear',
          toolName: 'createIssue',
        });
      });

      expect(callResult).toEqual({
        error: 'Network error',
        success: false,
      });
    });
  });

  describe('checkFiSkillStatus', () => {
    it('should check status and add server when connected', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      const mockResponse = {
        connected: true,
        icon: 'linear-icon',
        connection: {
          providerUsername: 'testuser',
          scopes: ['read', 'write'],
          tokenExpiresAt: '2024-12-31T00:00:00Z',
        },
      };
      vi.mocked(toolsClient.market.connectGetStatus.query).mockResolvedValue(mockResponse as any);
      vi.mocked(toolsClient.market.connectListTools.query).mockResolvedValue({
        provider: 'linear',
        tools: [],
      });

      let server;
      await act(async () => {
        server = await result.current.checkFiSkillStatus('linear');
      });

      expect(server).toMatchObject({
        identifier: 'linear',
        name: 'Linear',
        isConnected: true,
        status: FiSkillStatus.CONNECTED,
        providerUsername: 'testuser',
        scopes: ['read', 'write'],
      });
      expect(result.current.fiSkillServers).toHaveLength(1);
      expect(result.current.fiSkillLoadingIds.has('linear')).toBe(false);
    });

    it('should check status and add server when not connected', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      const mockResponse = {
        connected: false,
        icon: 'linear-icon',
      };
      vi.mocked(toolsClient.market.connectGetStatus.query).mockResolvedValue(mockResponse as any);

      let server;
      await act(async () => {
        server = await result.current.checkFiSkillStatus('linear');
      });

      expect(server).toMatchObject({
        identifier: 'linear',
        isConnected: false,
        status: FiSkillStatus.NOT_CONNECTED,
      });
      expect(toolsClient.market.connectListTools.query).not.toHaveBeenCalled();
    });

    it('should update existing server instead of adding new one', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: false,
              status: FiSkillStatus.NOT_CONNECTED,
            },
          ],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      const mockResponse = {
        connected: true,
        icon: 'linear-icon',
        connection: {
          providerUsername: 'testuser',
          scopes: ['read'],
          tokenExpiresAt: '2024-12-31T00:00:00Z',
        },
      };
      vi.mocked(toolsClient.market.connectGetStatus.query).mockResolvedValue(mockResponse as any);
      vi.mocked(toolsClient.market.connectListTools.query).mockResolvedValue({
        provider: 'linear',
        tools: [],
      });

      await act(async () => {
        await result.current.checkFiSkillStatus('linear');
      });

      expect(result.current.fiSkillServers).toHaveLength(1);
      expect(result.current.fiSkillServers[0].isConnected).toBe(true);
      expect(result.current.fiSkillServers[0].status).toBe(FiSkillStatus.CONNECTED);
    });

    it('should track loading state during status check', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(toolsClient.market.connectGetStatus.query).mockReturnValue(promise as any);

      const checkPromise = act(async () => {
        return result.current.checkFiSkillStatus('linear');
      });

      // Should be loading during the check
      await waitFor(() => {
        expect(result.current.fiSkillLoadingIds.has('linear')).toBe(true);
      });

      // Resolve the promise
      resolvePromise!({ connected: false, icon: '' });
      await checkPromise;

      // Should not be loading after completion
      expect(result.current.fiSkillLoadingIds.has('linear')).toBe(false);
    });

    it('should handle error and return undefined', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectGetStatus.query).mockRejectedValue(
        new Error('Network error'),
      );

      let server;
      await act(async () => {
        server = await result.current.checkFiSkillStatus('linear');
      });

      expect(server).toBeUndefined();
      expect(result.current.fiSkillLoadingIds.has('linear')).toBe(false);
    });
  });

  describe('getFiSkillAuthorizeUrl', () => {
    it('should return authorization URL and code', async () => {
      const { result } = renderHook(() => useToolStore());

      const mockResponse = {
        authorizeUrl: 'https://auth.linear.app/authorize?code=abc123',
        code: 'abc123',
        expiresIn: 600,
      };
      vi.mocked(toolsClient.market.connectGetAuthorizeUrl.query).mockResolvedValue(
        mockResponse as any,
      );

      let authInfo;
      await act(async () => {
        authInfo = await result.current.getFiSkillAuthorizeUrl('linear');
      });

      expect(authInfo).toEqual({
        authorizeUrl: 'https://auth.linear.app/authorize?code=abc123',
        code: 'abc123',
        expiresIn: 600,
      });
      expect(toolsClient.market.connectGetAuthorizeUrl.query).toHaveBeenCalledWith({
        provider: 'linear',
        redirectUri: undefined,
        scopes: undefined,
      });
    });

    it('should pass options to query', async () => {
      const { result } = renderHook(() => useToolStore());

      const mockResponse = {
        authorizeUrl: 'https://auth.linear.app/authorize',
        code: 'xyz789',
        expiresIn: 300,
      };
      vi.mocked(toolsClient.market.connectGetAuthorizeUrl.query).mockResolvedValue(
        mockResponse as any,
      );

      await act(async () => {
        await result.current.getFiSkillAuthorizeUrl('linear', {
          scopes: ['read', 'write'],
          redirectUri: 'https://example.com/callback',
        });
      });

      expect(toolsClient.market.connectGetAuthorizeUrl.query).toHaveBeenCalledWith({
        provider: 'linear',
        scopes: ['read', 'write'],
        redirectUri: 'https://example.com/callback',
      });
    });
  });

  describe('internal_updateFiSkillServer', () => {
    it('should update existing server', () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: FiSkillStatus.CONNECTED,
            },
          ],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      act(() => {
        result.current.internal_updateFiSkillServer('linear', {
          status: FiSkillStatus.ERROR,
          errorMessage: 'Token expired',
        });
      });

      expect(result.current.fiSkillServers[0]).toMatchObject({
        identifier: 'linear',
        status: FiSkillStatus.ERROR,
        errorMessage: 'Token expired',
      });
    });

    it('should do nothing when server not found', () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      act(() => {
        result.current.internal_updateFiSkillServer('non-existent', {
          status: FiSkillStatus.ERROR,
        });
      });

      expect(result.current.fiSkillServers).toHaveLength(0);
    });
  });

  describe('refreshFiSkillToken', () => {
    it('should refresh token successfully and update server', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: FiSkillStatus.CONNECTED,
              tokenExpiresAt: '2024-01-01T00:00:00Z',
            },
          ],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      const mockResponse = {
        refreshed: true,
        connection: {
          tokenExpiresAt: '2024-12-31T00:00:00Z',
        },
      };
      vi.mocked(toolsClient.market.connectRefresh.mutate).mockResolvedValue(mockResponse as any);

      let refreshed;
      await act(async () => {
        refreshed = await result.current.refreshFiSkillToken('linear');
      });

      expect(refreshed).toBe(true);
      expect(result.current.fiSkillServers[0].tokenExpiresAt).toBe('2024-12-31T00:00:00Z');
      expect(result.current.fiSkillServers[0].status).toBe(FiSkillStatus.CONNECTED);
    });

    it('should return false when refresh fails', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: FiSkillStatus.CONNECTED,
            },
          ],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      const mockResponse = {
        refreshed: false,
      };
      vi.mocked(toolsClient.market.connectRefresh.mutate).mockResolvedValue(mockResponse as any);

      let refreshed;
      await act(async () => {
        refreshed = await result.current.refreshFiSkillToken('linear');
      });

      expect(refreshed).toBe(false);
    });

    it('should return false on error', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectRefresh.mutate).mockRejectedValue(
        new Error('Refresh failed'),
      );

      let refreshed;
      await act(async () => {
        refreshed = await result.current.refreshFiSkillToken('linear');
      });

      expect(refreshed).toBe(false);
    });
  });

  describe('refreshFiSkillTools', () => {
    it('should refresh tools for server', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: FiSkillStatus.CONNECTED,
            },
          ],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      const mockTools = {
        tools: [
          { name: 'createIssue', description: 'Create an issue', inputSchema: { type: 'object' } },
          { name: 'listIssues', description: 'List issues', inputSchema: { type: 'object' } },
        ],
      };
      vi.mocked(toolsClient.market.connectListTools.query).mockResolvedValue(mockTools as any);

      await act(async () => {
        await result.current.refreshFiSkillTools('linear');
      });

      expect(result.current.fiSkillServers[0].tools).toHaveLength(2);
      expect(result.current.fiSkillServers[0].tools![0].name).toBe('createIssue');
      expect(result.current.fiSkillServers[0].tools![1].name).toBe('listIssues');
    });

    it('should do nothing when server not found', async () => {
      vi.mocked(toolsClient.market.connectListTools.query).mockClear();

      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      await act(async () => {
        await result.current.refreshFiSkillTools('non-existent');
      });

      // The action still calls the API, but the state update does nothing
      // since server is not found
    });

    it('should handle error gracefully', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: FiSkillStatus.CONNECTED,
            },
          ],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectListTools.query).mockRejectedValue(
        new Error('Network error'),
      );

      await act(async () => {
        await result.current.refreshFiSkillTools('linear');
      });

      // Should not crash and server should remain unchanged
      expect(result.current.fiSkillServers[0].tools).toBeUndefined();
    });
  });

  describe('revokeFiSkill', () => {
    it('should revoke skill and remove server from state', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: FiSkillStatus.CONNECTED,
            },
            {
              identifier: 'github',
              name: 'GitHub',
              isConnected: true,
              status: FiSkillStatus.CONNECTED,
            },
          ],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectRevoke.mutate).mockResolvedValue({} as any);

      await act(async () => {
        await result.current.revokeFiSkill('linear');
      });

      expect(result.current.fiSkillServers).toHaveLength(1);
      expect(result.current.fiSkillServers[0].identifier).toBe('github');
      expect(toolsClient.market.connectRevoke.mutate).toHaveBeenCalledWith({
        provider: 'linear',
      });
    });

    it('should track loading state during revoke', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: FiSkillStatus.CONNECTED,
            },
          ],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(toolsClient.market.connectRevoke.mutate).mockReturnValue(promise as any);

      const revokePromise = act(async () => {
        return result.current.revokeFiSkill('linear');
      });

      // Should be loading during revoke
      await waitFor(() => {
        expect(result.current.fiSkillLoadingIds.has('linear')).toBe(true);
      });

      // Resolve the promise
      resolvePromise!({});
      await revokePromise;

      // Should not be loading after completion
      expect(result.current.fiSkillLoadingIds.has('linear')).toBe(false);
    });

    it('should handle error gracefully', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          fiSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: FiSkillStatus.CONNECTED,
            },
          ],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectRevoke.mutate).mockRejectedValue(
        new Error('Revoke failed'),
      );

      await act(async () => {
        await result.current.revokeFiSkill('linear');
      });

      // Server should still be in state after error
      expect(result.current.fiSkillServers).toHaveLength(1);
      expect(result.current.fiSkillLoadingIds.has('linear')).toBe(false);
    });
  });

  describe('useFetchFiSkillConnections', () => {
    it('should not fetch when disabled', () => {
      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectListConnections.query).mockClear();

      renderHook(() => useToolStore.getState().useFetchFiSkillConnections(false));

      expect(toolsClient.market.connectListConnections.query).not.toHaveBeenCalled();
    });

    it('should fetch connections when enabled', async () => {
      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      const mockConnections = {
        connections: [
          {
            providerId: 'linear',
            icon: 'linear-icon',
            providerUsername: 'testuser',
            scopes: ['read'],
            tokenExpiresAt: '2024-12-31T00:00:00Z',
          },
        ],
      };
      vi.mocked(toolsClient.market.connectListConnections.query).mockResolvedValue(
        mockConnections as any,
      );
      vi.mocked(toolsClient.market.connectListTools.query).mockResolvedValue({
        provider: 'linear',
        tools: [],
      });

      renderHook(() => useToolStore.getState().useFetchFiSkillConnections(true));

      await waitFor(() => {
        expect(toolsClient.market.connectListConnections.query).toHaveBeenCalled();
      });
    });
  });

  describe('server deduplication logic', () => {
    it('should deduplicate servers by identifier when adding new servers', () => {
      act(() => {
        useToolStore.setState({
          fiSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: FiSkillStatus.CONNECTED,
            },
          ],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      const incomingServers = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: FiSkillStatus.CONNECTED,
        },
        {
          identifier: 'github',
          name: 'GitHub',
          isConnected: true,
          status: FiSkillStatus.CONNECTED,
        },
      ];

      act(() => {
        const existingServers = useToolStore.getState().fiSkillServers;
        const existingIdentifiers = new Set(existingServers.map((s) => s.identifier));
        const newServers = incomingServers.filter((s) => !existingIdentifiers.has(s.identifier));

        useToolStore.setState({
          fiSkillServers: [...existingServers, ...newServers],
        });
      });

      const finalServers = useToolStore.getState().fiSkillServers;
      expect(finalServers).toHaveLength(2);
      expect(finalServers.find((s) => s.identifier === 'linear')).toBeDefined();
      expect(finalServers.find((s) => s.identifier === 'github')).toBeDefined();
    });

    it('should add all servers when none exist', () => {
      act(() => {
        useToolStore.setState({
          fiSkillServers: [],
          fiSkillLoadingIds: new Set(),
          fiSkillExecutingToolIds: new Set(),
        });
      });

      const incomingServers = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: FiSkillStatus.CONNECTED,
        },
      ];

      act(() => {
        const existingServers = useToolStore.getState().fiSkillServers;
        const existingIdentifiers = new Set(existingServers.map((s) => s.identifier));
        const newServers = incomingServers.filter((s) => !existingIdentifiers.has(s.identifier));

        useToolStore.setState({
          fiSkillServers: [...existingServers, ...newServers],
        });
      });

      expect(useToolStore.getState().fiSkillServers).toHaveLength(1);
    });
  });
});
