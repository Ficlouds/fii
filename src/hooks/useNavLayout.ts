import { BoxIcon, BotIcon, FolderIcon, PlusIcon, SearchIcon, ZapIcon } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGlobalStore } from '@/store/global';
import { useActiveConversationStore } from '@/store/home/activeConversation';
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
  const setConversation = useActiveConversationStore((s) => s.setConversation);
  const navigate = useNavigate();
  const handleNewChat = useCallback(() => setConversation(null), [setConversation]);
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
        onClick: handleNewChat,
        url: '/',
        title: 'New Chat',
      },
      {
        icon: ZapIcon,
        key: 'connect',
        onClick: () => navigate('/connect'),
        url: '/connect',
        title: 'Connect',
      },
      {
        icon: FolderIcon,
        key: 'projects',
        url: '/chat',
        title: 'Projects',
      },
      {
        icon: BoxIcon,
        key: 'artifacts',
        url: '/artifact',
        title: 'Artifacts',
      },
      {
        icon: BotIcon,
        key: 'automate',
        onClick: () => navigate('/automate'),
        url: '/automate',
        title: 'Automate',
      },
    ] as NavItem[],
    [t, toggleCommandMenu, handleNewChat],
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
