'use client';

import { memo, useEffect } from 'react';

import { useAgentStore } from '@/store/agent';
import { useChatStore } from '@/store/chat';
import { useTaskStore } from '@/store/task';
import { taskDetailSelectors } from '@/store/task/selectors';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

export const syncTaskAgentContext = (agentId?: string | null) => {
  const nextAgentId = agentId ?? undefined;

  useAgentStore.getState().setActiveAgentId(nextAgentId);
  useChatStore.setState(
    {
      activeAgentId: nextAgentId,
      activeGroupId: undefined,
      activeThreadId: undefined,
      activeTopicId: undefined,
    },
    false,
    'TaskAgentContextSync/syncAgentId',
  );
};

const TaskAgentContextSync = memo(() => {
  const isLogin = useUserStore(authSelectors.isLogin);
  const agentId = useTaskStore(taskDetailSelectors.activeTaskAgentId);
  const useFetchAgentConfig = useAgentStore((s) => s.useFetchAgentConfig);

  useEffect(() => {
    syncTaskAgentContext(agentId);
  }, [agentId]);

  useFetchAgentConfig(isLogin, agentId ?? '');

  return null;
});

TaskAgentContextSync.displayName = 'TaskAgentContextSync';

export default TaskAgentContextSync;
