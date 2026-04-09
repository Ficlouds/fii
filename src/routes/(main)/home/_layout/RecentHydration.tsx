import { memo } from 'react';

import { useInitRecentPage } from '@/hooks/useInitRecentPage';
import { useInitRecentResource } from '@/hooks/useInitRecentResource';
import { useInitRecentTopic } from '@/hooks/useInitRecentTopic';
import { useInitRecents } from '@/hooks/useInitRecents';

const RecentHydration = memo(() => {
  useInitRecentTopic();
  useInitRecentResource();
  useInitRecentPage();
  useInitRecents();

  return null;
});

export default RecentHydration;
