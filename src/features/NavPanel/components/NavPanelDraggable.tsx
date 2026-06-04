'use client';

import { createStaticStyles } from 'antd-style';
import { ClockIcon, ZapIcon, FolderIcon, BoxIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import UserAvatar from '@/features/User/UserAvatar';
import UserPanel from '@/features/User/UserPanel';

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 56;

// Map key to icon for collapsed view
const KEY_ICON_MAP: Record<string, any> = {
  search: SearchIcon,
  newchat: PlusIcon,
  connect: ZapIcon,
  projects: FolderIcon,
  artifacts: BoxIcon,
  recents: ClockIcon,
};

const styles = createStaticStyles(({ css }) => ({
  panel: css`
    flex-shrink: 0;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #fcfcfc;
    border-right: 1px solid rgba(0,0,0,0.06);
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
    gap: 2px;
    &:hover { background: #f5f5f5; }
  `,
  collapsedIcon: css`
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: rgba(0,0,0,0.6);
    transition: background 0.15s, color 0.15s;
    &:hover {
      background: rgba(0,0,0,0.07);
      color: #111;
    }
  `,
}));

interface NavPanelDraggableProps {
  activeContent: { key: string; node: ReactNode };
}

const COLLAPSED_KEYS = ['search', 'newchat', 'connect', 'projects', 'artifacts', 'recents'];

export const NavPanelDraggable = memo<NavPanelDraggableProps>(({ activeContent }) => {
  const [expand, togglePanel] = useGlobalStore((s) => [
    systemStatusSelectors.showLeftPanel(s),
    s.toggleLeftPanel,
  ]);
  const tab = useActiveTabKey();
  const navigate = useNavigate();

  if (!expand) {
    return (
      <div
        className={styles.collapsedPanel}
        onClick={() => togglePanel(true)}
        title="Click to expand"
      >
        {/* Fi logo */}
        <div style={{ marginBottom: 12, marginTop: 4 }}>
          <img src="/logos/fi-icon.svg" alt="Fi" style={{ height: 22, width: 'auto' }} />
        </div>

        {/* Nav icons */}
        {COLLAPSED_KEYS.map((key) => {
          const Icon = KEY_ICON_MAP[key];
          if (!Icon) return null;
          const isActive = tab === key;
          return (
            <div
              key={key}
              className={styles.collapsedIcon}
              title={key.charAt(0).toUpperCase() + key.slice(1)}
              style={{
                background: isActive ? 'rgba(0,0,0,0.07)' : undefined,
                color: isActive ? '#111' : undefined,
              }}
              onClick={(e) => {
                e.stopPropagation();
                togglePanel(true);
              }}
            >
              <Icon size={18} />
            </div>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User avatar */}
        <UserPanel>
          <div className={styles.collapsedIcon}>
            <UserAvatar size={28} style={{ borderRadius: "50%" }} />
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
