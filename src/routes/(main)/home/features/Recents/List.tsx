import { Flexbox } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { memo } from 'react';
import { Link } from 'react-router-dom';

import { useHomeStore } from '@/store/home';
import { homeRecentSelectors } from '@/store/home/selectors';

import RecentListItem from './Item';

const RecentsList = memo(() => {
  const recents = useHomeStore(homeRecentSelectors.recents);
  const isInit = useHomeStore(homeRecentSelectors.isRecentsInit);

  if (!isInit) {
    return (
      <Flexbox gap={8}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton.Input active block key={i} size="small" />
        ))}
      </Flexbox>
    );
  }

  return (
    <Flexbox gap={2}>
      {recents.map((item) => (
        <Link
          key={`${item.type}-${item.id}`}
          to={item.routePath}
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          <RecentListItem {...item} />
        </Link>
      ))}
    </Flexbox>
  );
});

export default RecentsList;
