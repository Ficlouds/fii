import { Flexbox } from '@lobehub/ui';
import { MoreHorizontalIcon } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { taskDetailPath } from '@/features/AgentTasks/shared/taskDetailPath';
import NavItem from '@/features/NavPanel/components/NavItem';
import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useHomeStore } from '@/store/home';
import { homeRecentSelectors } from '@/store/home/selectors';

import AllRecentsDrawer from './AllRecentsDrawer';
import RecentListItem from './Item';

const GROUP_LABEL_STYLE = {
  color: 'rgba(0,0,0,0.35)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  padding: '8px 12px 2px',
  paddingLeft: 48,
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
  const { t } = useTranslation('chat');
  const recents = useHomeStore(homeRecentSelectors.recents);
  const isInit = useHomeStore(homeRecentSelectors.isRecentsInit);
  const recentPageSize = useGlobalStore(systemStatusSelectors.recentPageSize);
  const [drawerOpen, openDrawer, closeDrawer] = useHomeStore((s) => [
    s.allRecentsDrawerOpen,
    s.openAllRecentsDrawer,
    s.closeAllRecentsDrawer,
  ]);

  const displayItems = useMemo(() => recents.slice(0, recentPageSize), [recents, recentPageSize]);
  const hasMore = recents.length > recentPageSize;

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

  const renderItem = (item: (typeof displayItems)[number]) => (
    <Link
      key={`${item.type}-${item.id}`}
      style={{ color: 'inherit', textDecoration: 'none' }}
      to={getRecentRoute(item)}
    >
      <RecentListItem {...item} />
    </Link>
  );

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
      {hasMore && (
        <NavItem icon={MoreHorizontalIcon} title={t('input.more')} onClick={openDrawer} />
      )}
      <AllRecentsDrawer open={drawerOpen} onClose={closeDrawer} />
    </Flexbox>
  );
});

export default RecentsList;
