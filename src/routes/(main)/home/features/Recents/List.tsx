import { Flexbox } from '@lobehub/ui';
import { memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { taskDetailPath } from '@/features/AgentTasks/shared/taskDetailPath';
import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useActiveConversationStore } from '@/store/home/activeConversation';
import { useHomeStore } from '@/store/home';
import { homeRecentSelectors } from '@/store/home/selectors';

import RecentListItem from './Item';

const GROUP_LABEL_STYLE = {
  color: 'rgba(0,0,0,0.35)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  padding: '8px 10px 2px', paddingLeft: 10,

  textTransform: 'uppercase' as const,
};

const isToday = (date: Date): boolean => {
  const now = new Date();
  const d = new Date(date);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const RecentsList = memo(() => {
  const recents = useHomeStore(homeRecentSelectors.recents);
  const isInit = useHomeStore(homeRecentSelectors.isRecentsInit);
  const recentPageSize = useGlobalStore(systemStatusSelectors.recentPageSize);
  const setConversation = useActiveConversationStore((s) => s.setConversation);
  const displayItems = useMemo(() => recents.slice(0, recentPageSize), [recents, recentPageSize]);

  const getRecentRoute = useCallback((item: (typeof displayItems)[number]) => {
    if (item.type !== 'task') return item.routePath;
    const taskId = item.id;
    if (!taskId) return item.routePath;
    return taskDetailPath(taskId, item.agentId ?? undefined);
  }, []);

  const { todayItems, earlierItems } = useMemo(() => {
    const todayItems = displayItems.filter((item) => isToday(item.updatedAt));
    const earlierItems = displayItems.filter((item) => !isToday(item.updatedAt));
    return { earlierItems, todayItems };
  }, [displayItems]);

  if (!isInit) {
    return <SkeletonList rows={3} />;
  }

  const renderItem = (item: (typeof displayItems)[number]) => {
    // Topic items load in-page — no navigation
    if (item.type === 'topic' && item.agentId) {
      return (
        <div
          key={`${item.type}-${item.id}`}
          style={{ cursor: 'pointer' }}
          onClick={() => setConversation({ agentId: item.agentId!, topicId: item.id })}
        >
          <RecentListItem {...item} />
        </div>
      );
    }

    // Documents/tasks still navigate (they're not conversations)
    return (
      <Link
        key={`${item.type}-${item.id}`}
        style={{ color: 'inherit', textDecoration: 'none' }}
        to={getRecentRoute(item)}
      >
        <RecentListItem {...item} />
      </Link>
    );
  };

  return (
    <Flexbox gap={1} style={{ paddingInline: '0px 4px' }}>
      {todayItems.length > 0 && (
        <>
          <div style={GROUP_LABEL_STYLE}>Today</div>
          {todayItems.map(renderItem)}
        </>
      )}
      {earlierItems.length > 0 && (
        <>
          <div style={GROUP_LABEL_STYLE}>Earlier</div>
          {earlierItems.map(renderItem)}
        </>
      )}
      {todayItems.length === 0 && earlierItems.length === 0 && displayItems.map(renderItem)}
    </Flexbox>
  );
});

export default RecentsList;
