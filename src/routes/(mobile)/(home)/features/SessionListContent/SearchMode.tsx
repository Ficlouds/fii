import { memo, useMemo } from 'react';

import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { useSessionStore } from '@/store/session';
import { type FiAgentSession, type FiSessions } from '@/types/session';
import { FiSessionType } from '@/types/session';

import SkeletonList from '../SkeletonList';
import SessionList from './List';

const SearchMode = memo(() => {
  const [sessionSearchKeywords, useSearchSessions] = useSessionStore((s) => [
    s.sessionSearchKeywords,
    s.useSearchSessions,
  ]);

  const isMobile = useServerConfigStore(serverConfigSelectors.isMobile);

  const { data, isLoading } = useSearchSessions(sessionSearchKeywords);

  const filteredData = useMemo(() => {
    if (!data) return data;

    if (isMobile) {
      return data.filter((session: FiSessions[0]) => session.type !== FiSessionType.Group);
    }

    return data.filter(
      (session: FiSessions[0]) =>
        session.type !== FiSessionType.Agent || !(session as FiAgentSession).config?.virtual,
    );
  }, [data, isMobile]);

  return isLoading ? (
    <SkeletonList />
  ) : (
    <SessionList dataSource={filteredData} showAddButton={false} />
  );
});

SearchMode.displayName = 'SessionSearchMode';

export default SearchMode;
