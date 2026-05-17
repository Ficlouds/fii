/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAgentStore } from '@/store/agent';
import { initialState as initialAgentState } from '@/store/agent/initialState';
import { useChatStore } from '@/store/chat';
import { initialState as initialChatState } from '@/store/chat/initialState';

import { syncTaskAgentContext } from './TaskAgentContextSync';

vi.hoisted(() => {
  const storage = {
    clear: vi.fn(),
    getItem: vi.fn(() => null),
    removeItem: vi.fn(),
    setItem: vi.fn(),
  };

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage,
  });
});

describe('syncTaskAgentContext', () => {
  beforeEach(() => {
    useAgentStore.setState(initialAgentState, false);
    useChatStore.setState(
      {
        ...initialChatState,
        activeAgentId: 'agent-a',
        activeGroupId: 'group-a',
        activeThreadId: 'thread-a',
        activeTopicId: 'topic-a',
      },
      false,
    );
  });

  it('syncs task assignee agent into agent and chat contexts', () => {
    syncTaskAgentContext('agent-b');

    expect(useAgentStore.getState().activeAgentId).toBe('agent-b');
    expect(useChatStore.getState().activeAgentId).toBe('agent-b');
    expect(useChatStore.getState().activeGroupId).toBeUndefined();
    expect(useChatStore.getState().activeThreadId).toBeUndefined();
    expect(useChatStore.getState().activeTopicId).toBeUndefined();
  });

  it('clears stale agent context for an unassigned task', () => {
    syncTaskAgentContext(null);

    expect(useAgentStore.getState().activeAgentId).toBeUndefined();
    expect(useChatStore.getState().activeAgentId).toBeUndefined();
  });
});
