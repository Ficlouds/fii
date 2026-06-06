'use client';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Search, X } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

import { useGlobalStore } from '@/store/global';
import { useIsDark } from '@/hooks/useIsDark';
import { useChatStore } from '@/store/chat';
import { useHomeStore } from '@/store/home';
import { homeRecentSelectors } from '@/store/home/selectors';

import { CommandMenuProvider, useCommandMenuContext } from './CommandMenuContext';
import { useCommandMenu } from './useCommandMenu';

dayjs.extend(relativeTime);

const CLOSE_ANIMATION_DURATION = 150;

const fmt = (d: Date | string) => {
  const date = dayjs(d);
  const now = dayjs();
  if (date.isSame(now, 'day')) return date.fromNow();
  if (date.isSame(now.subtract(1, 'day'), 'day')) return 'Yesterday';
  if (date.isAfter(now.subtract(7, 'day'))) return date.format('dddd');
  return date.format('MMM D, YYYY');
};

const CommandMenuContent = memo<{ isClosing: boolean; onClose: () => void }>(({ isClosing, onClose }) => {
  const { hasSearch, isSearching, searchResults } = useCommandMenu();
  const { search, setSearch, setTypeFilter } = useCommandMenuContext();
  const isDark = useIsDark();
  const recents = useHomeStore(homeRecentSelectors.recents);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const searchConvResults = searchResults.filter((r: any) => r.type === 'topic' || r.type === 'message');
  const recentItems = (recents || []).map((r: any) => ({
    agentId: r.agentId,
    createdAt: r.updatedAt || r.createdAt,
    id: r.id,
    title: r.title,
    type: 'topic',
  }));
  const results = hasSearch ? searchConvResults : [];

  const handleSelect = (result: any) => {
    const topicId = result.type === 'topic' ? result.id : result.topicId;
    useChatStore.setState({
      activeAgentId: result.agentId || null,
      activeTopicId: topicId || null,
    });
    onClose();
  };

  const bg = isDark ? '#1e1e1d' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const textPrimary = isDark ? '#ffffff' : '#111111';
  const textSecondary = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

  return (
    <div
      onClick={onClose}
      style={{
        animation: isClosing ? 'fiOut 0.15s ease-out forwards' : 'fiIn 0.15s ease-out',
        background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)',
        display: 'flex',
        inset: 0,
        justifyContent: 'center',
        paddingTop: 80,
        position: 'fixed',
        zIndex: 9999,
      }}
    >
      <style>{`
        @keyframes fiIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fiOut { from { opacity: 1; } to { opacity: 0; } }
        .fi-result-item:hover { background: ${hoverBg} !important; }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: bg,
          borderRadius: 16,
          boxShadow: isDark
            ? '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)'
            : '0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: hasSearch && results.length > 0 ? '65vh' : 'auto',
          overflow: hasSearch && results.length > 0 ? 'hidden' : 'visible',
          width: 'min(540px, 92vw)',
        }}
      >
        {/* Search input */}
        <div style={{
          alignItems: 'center',
          borderBottom: `1px solid ${border}`,
          display: 'flex',
          gap: 12,
          padding: '14px 18px',
        }}>
          <Search size={17} style={{ color: textSecondary, flexShrink: 0 }} />
          <input
            ref={inputRef}
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: textPrimary,
              flex: 1,
              fontSize: 15,
              minWidth: 0,
              outline: 'none',
            }}
          />
          {search ? (
            <button
              onClick={() => setSearch('')}
              style={{
                alignItems: 'center',
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                border: 'none',
                borderRadius: '50%',
                color: textSecondary,
                cursor: 'pointer',
                display: 'flex',
                flexShrink: 0,
                height: 20,
                justifyContent: 'center',
                width: 20,
              }}
            >
              <X size={11} />
            </button>
          ) : (
            <kbd
              onClick={onClose}
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                borderRadius: 5,
                color: textSecondary,
                cursor: 'pointer',
                fontSize: 11,
                padding: '2px 7px',
              }}
            >ESC</kbd>
          )}
        </div>

        {/* Section label - only show when searching */}
        {hasSearch && (
          <div style={{ color: textSecondary, fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', padding: '10px 18px 4px', textTransform: 'uppercase' }}>
            {isSearching ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
          </div>
        )}

        {/* Results list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {results.length === 0 && !isSearching && hasSearch && (
            <div style={{ color: textSecondary, fontSize: 13, padding: '20px 18px', textAlign: 'center' }}>
              No conversations found
            </div>
          )}

          {results.map((r: any) => (
            <div
              key={r.id}
              className="fi-result-item"
              onClick={() => handleSelect(r)}
              style={{
                alignItems: 'center',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                gap: 12,
                margin: '2px 8px',
                padding: '10px 12px',
                transition: 'background 0.1s',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: textPrimary,
                  fontSize: 14,
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {r.title || 'Untitled'}
                </div>
              </div>
              <div style={{ color: textSecondary, flexShrink: 0, fontSize: 12 }}>
                {r.createdAt ? fmt(r.createdAt) : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const CommandMenu = memo(() => {
  const [open, setOpen] = useGlobalStore((s) => [s.status.showCommandMenu, s.updateSystemStatus]);
  const [mounted, setMounted] = useState(false);
  const [appRoot, setAppRoot] = useState<HTMLElement | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (open) { setIsVisible(true); setIsClosing(false); } }, [open]);
  useEffect(() => {
    if (!mounted) return;
    const el = document.querySelector('.ant-app') as HTMLElement;
    if (el) { setAppRoot(el); return; }
    const obs = new MutationObserver(() => {
      const f = document.querySelector('.ant-app') as HTMLElement;
      if (f) { setAppRoot(f); obs.disconnect(); }
    });
    obs.observe(document.body, { childList: true });
    setTimeout(() => { obs.disconnect(); setAppRoot((p) => p || document.body); }, 2000);
    return () => obs.disconnect();
  }, [mounted]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setOpen({ showCommandMenu: false });
      setIsVisible(false);
      setIsClosing(false);
    }, CLOSE_ANIMATION_DURATION);
  }, [isClosing, setOpen]);

  if (!mounted || !isVisible || !appRoot) return null;

  return createPortal(
    <CommandMenuProvider pathname={location.pathname} onClose={handleClose}>
      <CommandMenuContent isClosing={isClosing} onClose={handleClose} />
    </CommandMenuProvider>,
    appRoot,
  );
});

CommandMenu.displayName = 'CommandMenu';
export default CommandMenu;
