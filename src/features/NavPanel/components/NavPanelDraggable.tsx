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
const COLLAPSED_WIDTH = 48;

const KEY_ICON_MAP: Record<string, any> = {
  search: SearchIcon,
  newchat: PlusIcon,
  connect: ZapIcon,
  projects: FolderIcon,
  artifacts: BoxIcon,
  recents: ClockIcon,
};

const KEY_LABEL_MAP: Record<string, string> = {
  search: 'Search',
  newchat: 'New Chat',
  connect: 'Connect',
  projects: 'Projects',
  artifacts: 'Artifacts',
  recents: 'Recents',
};

const COLLAPSED_KEYS = ['search', 'newchat', 'connect', 'projects', 'artifacts', 'recents'];

const styles = createStaticStyles(({ css }) => ({
  wrapper: css`
    flex-shrink: 0;
    height: 100%;
    background: #fcfcfc;
    border-right: 1px solid rgba(0,0,0,0.06);
    transition: width 0.25s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 100;
  `,
  inner: css`
    position: absolute;
    inset: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: ${EXPANDED_WIDTH}px;
  `,
  collapsedOverlay: css`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 12px;
    padding-bottom: 12px;
    gap: 2px;
    cursor: pointer;
    width: ${COLLAPSED_WIDTH}px;
  `,
  collapsedIcon: css`
    position: relative;
    width: 36px;
    height: 36px;
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
    &:hover .tooltip {
      opacity: 1;
      transform: translateX(0);
    }
  `,
  tooltip: css`
    opacity: 0;
    transform: translateX(-4px);
    transition: opacity 0.15s, transform 0.15s;
    position: fixed;
    left: ${COLLAPSED_WIDTH + 8}px;
    background: #111;
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
    z-index: 9999;
  `,
}));

interface NavPanelDraggableProps {
  activeContent: { key: string; node: ReactNode };
}

export const NavPanelDraggable = memo<NavPanelDraggableProps>(({ activeContent }) => {
  const [expand, togglePanel] = useGlobalStore((s) => [
    systemStatusSelectors.showLeftPanel(s),
    s.toggleLeftPanel,
  ]);
  const tab = useActiveTabKey();
  const navigate = useNavigate();

  return (
    <div
      className={styles.wrapper}
      style={{ width: expand ? EXPANDED_WIDTH : COLLAPSED_WIDTH, transition: 'width 0.15s ease' }}
    >
      {/* Expanded content */}
      <div
        className={styles.inner}
        style={{
          opacity: expand ? 1 : 0,
          pointerEvents: expand ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        {activeContent.node}
      </div>

      {/* Collapsed overlay */}
      {!expand && (
        <div
          className={styles.collapsedOverlay}
          onClick={() => togglePanel(true)}
        >
          <div style={{ marginBottom: 12, marginTop: 4 }}>
            <img src="/logos/fi-icon.svg" alt="Fi" style={{ height: 20, width: 'auto' }} />
          </div>

          {COLLAPSED_KEYS.map((key) => {
            const Icon = KEY_ICON_MAP[key];
            if (!Icon) return null;
            const isActive = tab === key;
            return (
              <div
                key={key}
                className={styles.collapsedIcon}
                onClick={(e) => { e.stopPropagation(); togglePanel(true); }}
              >
                <Icon size={17} style={{ color: isActive ? '#111' : undefined }} />
                <span className={`tooltip ${styles.tooltip}`}>{KEY_LABEL_MAP[key]}</span>
              </div>
            );
          })}

          <div style={{ flex: 1 }} />

          <UserPanel>
            <div className={styles.collapsedIcon} onClick={(e) => e.stopPropagation()}>
              <UserAvatar size={26} style={{ borderRadius: '50%' }} />
            </div>
          </UserPanel>
        </div>
      )}
    </div>
  );
});
