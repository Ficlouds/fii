'use client';

import { cssVar, createStaticStyles } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import { type ReactNode } from 'react';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useNavLayout } from '@/hooks/useNavLayout';
import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '@/features/User/UserAvatar';
import UserPanel from '@/features/User/UserPanel';

const EXPANDED_WIDTH = 220;
const COLLAPSED_WIDTH = 56;

const styles = createStaticStyles(({ css, cssVar }) => ({
  panel: css`
    flex-shrink: 0;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #fcfcfc;
    border-right: 1px solid rgba(0,0,0,0.06);
    transition: width 0.2s ease;
  `,
  inner: css`
    position: relative;
    overflow: hidden;
    flex: 1;
    width: 100%;
    min-height: 0;
  `,
  layer: css`
    position: absolute;
    inset: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    max-height: 100%;
  `,
  collapsedPanel: css`
    flex-shrink: 0;
    height: 100%;
    width: ${COLLAPSED_WIDTH}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fcfcfc;
    border-right: 1px solid rgba(0,0,0,0.06);
    cursor: pointer;
    padding-top: 12px;
    padding-bottom: 12px;
    gap: 4px;
    transition: width 0.2s ease;
    &:hover { background: #f7f7f7; }
  `,
  collapsedIcon: css`
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: rgba(0,0,0,0.45);
    transition: background 0.15s, color 0.15s;
    &:hover {
      background: rgba(0,0,0,0.06);
      color: #111;
    }
  `,
}));

interface NavPanelDraggableProps {
  activeContent: {
    key: string;
    node: ReactNode;
  };
}

export const NavPanelDraggable = memo<NavPanelDraggableProps>(({ activeContent }) => {
  const [expand, togglePanel] = useGlobalStore((s) => [
    systemStatusSelectors.showLeftPanel(s),
    s.toggleLeftPanel,
  ]);
  const { topNavItems } = useNavLayout();
  const tab = useActiveTabKey();
  const navigate = useNavigate();

  if (!expand) {
    return (
      <div
        className={styles.collapsedPanel}
        onClick={() => togglePanel(true)}
        title="Expand sidebar"
      >
        {/* Fi logo */}
        <div style={{ marginBottom: 8, marginTop: 4 }}>
          <img src="/logos/fi-icon.svg" alt="Fi" style={{ height: 22, width: 'auto' }} />
        </div>

        {/* Nav icons */}
        {topNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.key;
          return (
            <div
              key={item.key}
              className={styles.collapsedIcon}
              title={item.title}
              style={{
                background: isActive ? 'rgba(0,0,0,0.06)' : undefined,
                color: isActive ? '#111' : undefined,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (item.onClick) item.onClick();
                else if (item.url) navigate(item.url);
                togglePanel(true);
              }}
            >
              {Icon && <Icon size={18} />}
            </div>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Expand chevron */}
        <div className={styles.collapsedIcon} title="Expand sidebar">
          <ChevronRight size={16} />
        </div>

        {/* User avatar */}
        <UserPanel>
          <div className={styles.collapsedIcon} style={{ marginTop: 4 }}>
            <UserAvatar size={28} />
          </div>
        </UserPanel>
      </div>
    );
  }

  return (
    <div className={styles.panel} style={{ width: EXPANDED_WIDTH }}>
      <div className={styles.inner}>
        <div className={styles.layer} key={activeContent.key}>
          {activeContent.node}
        </div>
      </div>
    </div>
  );
});
