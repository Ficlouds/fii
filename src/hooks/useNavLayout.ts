import { PlusIcon, SearchIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalStore } from '@/store/global';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
export interface NavItem {
  hidden?: boolean;
  icon: any;
  isNew?: boolean;
  key: string;
  onClick?: () => void;
  title: string;
  url?: string;
}
export interface NavLayout {
  bottomMenuItems: NavItem[];
  footer: {
    hideGitHub: boolean;
    layout: 'expanded' | 'compact';
    showEvalEntry: boolean;
    showSettingsEntry: boolean;
  };
  topNavItems: NavItem[];
  userPanel: {
    showDataImporter: boolean;
    showMemory: boolean;
  };
}
export const useNavLayout = (): NavLayout => {
  const { t } = useTranslation('common');
  const toggleCommandMenu = useGlobalStore((s) => s.toggleCommandMenu);
  const { hideGitHub } = useServerConfigStore(featureFlagsSelectors);
  const topNavItems = useMemo(
    () => [
      {
        icon: SearchIcon,
        key: 'search',
        onClick: () => toggleCommandMenu(true),
        title: t('tab.search'),
      },
      {
        icon: PlusIcon,
        key: 'newchat',
        url: '/',
        title: 'New Chat',
      },
    ] as NavItem[],
    [t, toggleCommandMenu],
  );
  const bottomMenuItems = useMemo(() => [] as NavItem[], []);
  const footer = useMemo(
    () => ({
      hideGitHub: !!hideGitHub,
      layout: 'compact' as const,
      showEvalEntry: false,
      showSettingsEntry: true,
    }),
    [hideGitHub],
  );
  const userPanel = useMemo(
    () => ({ showDataImporter: false, showMemory: true }),
    [],
  );
  return { bottomMenuItems, footer, topNavItems, userPanel };
};
