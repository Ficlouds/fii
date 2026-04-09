import { ClockIcon } from 'lucide-react';
import { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';

import NeuralNetworkLoading from '@/components/NeuralNetworkLoading';
import { useInitRecents } from '@/hooks/useInitRecents';
import { useHomeStore } from '@/store/home';
import { homeRecentSelectors } from '@/store/home/selectors';

import GroupBlock from '../components/GroupBlock';
import RecentsList from './List';

const Recents = memo(() => {
  const { t } = useTranslation('common');
  const recents = useHomeStore(homeRecentSelectors.recents);
  const isInit = useHomeStore(homeRecentSelectors.isRecentsInit);
  const { isRevalidating } = useInitRecents();

  // After loaded, if no data, don't render
  if (isInit && (!recents || recents.length === 0)) {
    return null;
  }

  return (
    <GroupBlock
      action={isRevalidating && <NeuralNetworkLoading size={14} />}
      icon={ClockIcon}
      title={t('recents')}
    >
      <Suspense fallback={null}>
        <RecentsList />
      </Suspense>
    </GroupBlock>
  );
});

export default Recents;
