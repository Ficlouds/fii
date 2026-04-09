'use client';

import { Flexbox } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, Suspense } from 'react';

import ToolAuthAlert from '@/routes/(main)/agent/features/Conversation/AgentWelcome/ToolAuthAlert';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import AgentInfo from './AgentInfo';
import OpeningQuestions from './OpeningQuestions';
import AgentRecentTopics from './RecentTopics';
import AgentTaskList from './TaskList';

const AgentHome = memo(() => {
  const openingQuestions = useAgentStore(agentSelectors.openingQuestions, isEqual);

  return (
    <>
      <Flexbox flex={1} />
      <Flexbox gap={32} width={'100%'} style={{ paddingBottom: 'max(4vh, 16px)' }}>
        <AgentInfo />
        {openingQuestions.length > 0 && <OpeningQuestions questions={openingQuestions} />}
        <ToolAuthAlert />
        <Suspense>
          <AgentRecentTopics />
        </Suspense>
        <Suspense>
          <AgentTaskList />
        </Suspense>
      </Flexbox>
    </>
  );
});

export default AgentHome;
