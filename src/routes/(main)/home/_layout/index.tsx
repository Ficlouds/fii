import { Flexbox } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Activity, type FC, type ReactNode, useEffect, useMemo, useState } from 'react';
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
  const [hasActivated, setHasActivated] = useState(isHomeRoute);
  const content = children ?? <Outlet />;

  useEffect(() => {
    if (isHomeRoute) setHasActivated(true);
  }, [isHomeRoute]);

  const cssVariables = useMemo<Record<string, string>>(
    () => ({
      '--content-bg-secondary': theme.colorBgContainerSecondary,
    }),
    [theme.colorBgContainerSecondary],
  );

  if (!hasActivated) return null;

  return (
    <div style={{ height: '100%', position: 'relative', width: '100%' }}>
      {/* Content area - full width, doesn't move */}
      <div
        style={{
          bottom: 0,
          left: 0,
          overflow: 'hidden',
          position: 'absolute',
          right: 0,
          top: 0,
        }}
        className={isDarkMode ? styles.contentDark : styles.contentLight}
      >
        {content}
      </div>
      {/* Sidebar - overlays on top of content */}
      <div style={{ height: '100%', left: 0, position: 'absolute', top: 0, zIndex: 10 }}>
        <Sidebar />
      </div>
      <HomeAgentIdSync />
      <RecentHydration />
    </div>
  );
};

export default Layout;
