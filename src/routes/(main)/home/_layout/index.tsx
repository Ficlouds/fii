import { Flexbox } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { type FC, type ReactNode, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useIsDark } from '@/hooks/useIsDark';

import HomeAgentIdSync from './HomeAgentIdSync';
import RecentHydration from './RecentHydration';
import Sidebar from './Sidebar';
import { styles } from './style';

interface LayoutProps {
  children?: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const isDarkMode = useIsDark();
  const theme = useTheme();
  const { pathname } = useLocation();
  const isHomeRoute = pathname === '/';
  const content = children ?? <Outlet />;

  const cssVariables = useMemo<Record<string, string>>(
    () => ({
      '--content-bg-secondary': theme.colorBgContainerSecondary,
    }),
    [theme.colorBgContainerSecondary],
  );

  return (
    <>
      {/* Register sidebar content via portal - no layout impact */}
      <Sidebar />
      {/* Hidden via display:none on non-home routes so React state (chat) is preserved
          but the home content doesn't cover the route Outlet */}
      <Flexbox
        className={isDarkMode ? styles.contentDark : styles.contentLight}
        flex={1}
        height={'100%'}
        style={{ ...cssVariables, display: isHomeRoute ? undefined : 'none', transition: 'width 0.15s ease, flex 0.15s ease' }}
        width={'100%'}
      >
        {content}
      </Flexbox>
      <HomeAgentIdSync />
      <RecentHydration />
    </>
  );
};

export default Layout;
