import { type MenuProps } from '@lobehub/ui';
import {
  AccordionItem,
  Flexbox,
  Icon,
  Text,
} from '@lobehub/ui';
import {
  Hash,
  LucideCheck,
} from 'lucide-react';
import { memo, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import NeuralNetworkLoading from '@/components/NeuralNetworkLoading';
import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { useInitRecents } from '@/hooks/useInitRecents';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useHomeStore } from '@/store/home';
import { homeRecentSelectors } from '@/store/home/selectors';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';

import RecentsList from './List';

interface RecentsProps {
  itemKey: string;
}

const Recents = memo<RecentsProps>(({ itemKey }) => {
  const { t } = useTranslation('common');
  const recents = useHomeStore(homeRecentSelectors.recents);
  const isInit = useHomeStore(homeRecentSelectors.isRecentsInit);
  const isLogin = useUserStore(authSelectors.isLogin);
  const { isRevalidating } = useInitRecents();

  const [recentPageSize, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.recentPageSize(s),
    s.updateSystemStatus,
  ]);

  const dropdownMenu = useMemo(() => {
    const pageSizeOptions = [5, 10, 15, 20];
    return pageSizeOptions.map((size) => ({
      icon: recentPageSize === size ? <Icon icon={LucideCheck} /> : <div />,
      key: `pageSize-${size}`,
      label: t('pageSizeItem', { count: size }),
      onClick: () => updateSystemStatus({ recentPageSize: size }),
    })) as MenuProps['items'];
  }, [recentPageSize, updateSystemStatus, t]);

  if (!isLogin) return null;
  if (isInit && (!recents || recents.length === 0)) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', marginBottom: 8, marginInline: 16 }} />
    <AccordionItem
      itemKey={itemKey}
      paddingBlock={4}
      paddingInline={'20px 4px'}
      style={{ paddingLeft: 0 }}
      title={
        <Flexbox horizontal align="center" gap={4}>
          <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
            {t('recents')}
          </Text>
          {isRevalidating && <NeuralNetworkLoading size={14} />}
        </Flexbox>
      }
    >
      <Suspense fallback={<SkeletonList rows={3} />}>
        <RecentsList />
      </Suspense>
    </AccordionItem>
    </div>
  );
});

export default Recents;
