import { Flexbox } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { type FC, type PropsWithChildren } from 'react';
import { useMemo, useRef } from 'react';

import { isDesktop } from '@/const/version';
import { useIsDark } from '@/hooks/useIsDark';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { getDarwinMajorVersion, isMacOSWithLargeWindowBorders } from '@/utils/platform';

import { LayoutContainerContext } from './DesktopLayoutContainer/LayoutContainerContext';
import { styles } from './DesktopLayoutContainer/style';

const DesktopLayoutContainer: FC<PropsWithChildren> = ({ children }) => {
  const innerContainerRef = useRef<HTMLDivElement>(null);
  const isDarkMode = useIsDark();
  const [expand] = useGlobalStore((s) => [systemStatusSelectors.showLeftPanel(s)]);
  const SIDEBAR_EXPANDED = 260;
  const SIDEBAR_COLLAPSED = 48;

  // CSS variables for dynamic styling
  const outerCssVariables = useMemo<Record<string, string>>(
    () => ({
      '--container-padding-left': '0px',
      '--container-padding-top': '0px',
    }),
    [expand, isDesktop],
  );

  const innerCssVariables = useMemo<Record<string, string>>(() => {
    const darwinMajorVersion = getDarwinMajorVersion();

    const borderRadius = darwinMajorVersion >= 25 ? '12px' : cssVar.borderRadius;
    const borderBottomRightRadius =
      darwinMajorVersion >= 26 || isMacOSWithLargeWindowBorders() ? '12px' : borderRadius;

    return {
      '--container-border-bottom-right-radius': borderBottomRightRadius,
      '--container-border-color': isDarkMode ? cssVar.colorBorderSecondary : cssVar.colorBorder,
      '--container-border-radius': borderRadius,
    };
  }, [isDarkMode]);

  return (
    <div style={{ flex: 1, height: '100%', minWidth: 0, overflow: 'hidden', position: 'relative', width: '100%' }}>
      <div ref={innerContainerRef} style={{ background: 'var(--ant-color-bg-container)', height: '100%', overflow: 'hidden', position: 'absolute', inset: 0 }}>
        <LayoutContainerContext value={innerContainerRef}>{children}</LayoutContainerContext>
      </div>
    </div>
  );
};
export default DesktopLayoutContainer;
