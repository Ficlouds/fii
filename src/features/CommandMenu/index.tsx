'use client';

import { Command } from 'cmdk';
import dayjs from 'dayjs';
import { MessageSquare, Search, X } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';

import { SESSION_CHAT_TOPIC_URL } from '@/const/url';
import { useGlobalStore } from '@/store/global';
import { useIsDark } from '@/hooks/useIsDark';
import { useHomeStore } from '@/store/home';
import { homeRecentSelectors } from '@/store/home/selectors';

import { CommandMenuProvider, useCommandMenuContext } from './CommandMenuContext';
import { useCommandMenu } from './useCommandMenu';

const CLOSE_ANIMATION_DURATION = 150;

const fmt = (d: Date | string) => {
  const date = dayjs(d);
  const now = dayjs();
  if (date.isSame(now, 'day')) return date.fromNow?.() || 'Today';
  if (date.isSame(now.subtract(1, 'day'), 'day')) return 'Yesterday';
  if (date.isAfter(now.subtract(7, 'day'))) return date.format('dddd');
  if (date.isAfter(now.subtract(30, 'day'))) return date.format('MMM D');
  return date.format('MMM D, YYYY');
};

const groupByDate = (items: any[]) => {
  const groups: Record<string, any[]> = {};
  const now = dayjs();
  for (const item of items) {
    const date = dayjs(item.createdAt);
    let group: string;
    if (date.isSame(now, 'day')) group = 'Today';
    else if (date.isSame(now.subtract(1, 'day'), 'day')) group = 'Yesterday';
    else if (date.isAfter(now.subtract(7, 'day'))) group = 'Last 7 Days';
    else if (date.isAfter(now.subtract(30, 'day'))) group = 'Last 30 Days';
    else group = 'Older';
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
  }
  return groups;
};

const ORDER = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Older'];

const CommandMenuContent = memo<{ isClosing: boolean; onClose: () => void }>(({ isClosing, onClose }) => {
  const { hasSearch, isSearching, searchResults } = useCommandMenu();
  const isDark = useIsDark();
  const { search, setSearch } = useCommandMenuContext();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<any>(null);
  const recents = useHomeStore(homeRecentSelectors.recents);

  // Show search results when typing, otherwise show recents
  const searchConvResults = searchResults.filter((r: any) => r.type === 'topic' || r.type === 'message');
  const recentItems = (recents || []).map((r: any) => ({
    agentId: r.agentId,
    createdAt: r.updatedAt || r.createdAt,
    description: r.description,
    id: r.id,
    title: r.title,
    type: 'topic',
  }));
  const convResults = hasSearch ? searchConvResults : recentItems;
  const grouped = groupByDate(convResults);

  const handleSelect = (result: any) => {
    if (result.type === 'topic') {
      result.agentId
        ? navigate(SESSION_CHAT_TOPIC_URL(result.agentId, result.id))
        : navigate(`/chat?topic=${result.id}`);
    } else {
      result.topicId && result.agentId
        ? navigate(`${SESSION_CHAT_TOPIC_URL(result.agentId, result.topicId)}#${result.id}`)
        : navigate(`/chat#${result.id}`);
    }
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        animation: isClosing ? 'fiOut 0.15s ease-out forwards' : 'fiIn 0.15s ease-out',
        background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)',
        display: 'flex',
        inset: 0,
        position: 'fixed',
        zIndex: 9999,
      }}
    >
      <style>{`
        @keyframes fiIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fiOut { from { opacity: 1; } to { opacity: 0; } }
        .fi-search-item:hover { background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'} !important; }
        .fi-search-item.active { background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} !important; }
      `}</style>

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDark ? '#1a1a19' : '#ffffff',
          borderRadius: 16,
          boxShadow: isDark ? '0 8px 60px rgba(0,0,0,0.5)' : '0 8px 60px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          height: 'min(680px, 85vh)',
          left: '50%',
          overflow: 'hidden',
          position: 'absolute',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(860px, 92vw)',
        }}
      >
        {/* Search input */}
        <div style={{ alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 12, padding: '16px 20px' }}>
          <Search size={18} style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', flexShrink: 0 }} />
          <input
            autoFocus
            maxLength={500}
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
            style={{ background: 'transparent', border: 'none', color: '#111', flex: 1, fontSize: 16, minWidth: 0, outline: 'none' }}
          />
          {search ? (
            <button onClick={() => setSearch('')} style={{ alignItems: 'center', background: 'rgba(0,0,0,0.07)', border: 'none', borderRadius: '50%', color: '#666', cursor: 'pointer', display: 'flex', height: 20, justifyContent: 'center', width: 20 }}>
              <X size={11} />
            </button>
          ) : (
            <kbd onClick={onClose} style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderRadius: 5, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)', cursor: 'pointer', fontSize: 11, padding: '2px 7px' }}>ESC</kbd>
          )}
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left: list */}
          <div style={{ background: isDark ? '#1a1a19' : '#ffffff', borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`, flex: '0 0 340px', overflowY: 'auto', padding: '8px 0' }}>
            {!hasSearch && convResults.length === 0 && (
              <div style={{ color: 'rgba(0,0,0,0.3)', fontSize: 13, padding: '40px 20px', textAlign: 'center' }}>
                No recent conversations
              </div>
            )}
            {isSearching && (
              <div style={{ color: 'rgba(0,0,0,0.3)', fontSize: 13, padding: '40px 20px', textAlign: 'center' }}>
                Searching...
              </div>
            )}
            {ORDER.map((group) => {
              const items = grouped[group];
              if (!items?.length) return null;
              return (
                <div key={group}>
                  <div style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', padding: '12px 16px 4px', textTransform: 'uppercase' }}>{group}</div>
                  {items.map((r: any) => (
                    <div
                      key={r.id}
                      className={`fi-search-item${selected?.id === r.id ? ' active' : ''}`}
                      onClick={() => handleSelect(r)}
                      onMouseEnter={() => setSelected(r)}
                      style={{ alignItems: 'center', borderRadius: 8, cursor: 'pointer', display: 'flex', gap: 10, margin: '1px 8px', padding: '8px 10px' }}
                    >
                      <MessageSquare size={14} style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: isDark ? '#ffffff' : '#111', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title || 'Untitled'}</div>
                      </div>
                      <div style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)', flexShrink: 0, fontSize: 11 }}>{r.createdAt ? fmt(r.createdAt) : ''}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Right: preview */}
          <div style={{ alignItems: 'center', background: isDark ? '#2c2c2a' : '#fafafa', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
            {selected ? (
              <div style={{ padding: 24, width: '100%' }}>
                <div style={{ color: isDark ? '#ffffff' : '#111', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{selected.title || 'Untitled'}</div>
                <div style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 13, marginBottom: 16 }}>{selected.createdAt ? dayjs(selected.createdAt).format('D MMMM YYYY') : ''}</div>
                {selected.description && <div style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', fontSize: 14, lineHeight: 1.6 }}>{selected.description}</div>}
                <button
                  onClick={() => handleSelect(selected)}
                  style={{ background: isDark ? 'rgba(255,255,255,0.15)' : '#111', border: isDark ? '1px solid rgba(255,255,255,0.2)' : 'none', borderRadius: 20, color: isDark ? '#ffffff' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginTop: 20, padding: '8px 20px' }}
                >
                  Open conversation →
                </button>
              </div>
            ) : (
              <div style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)', fontSize: 13 }}>Select a conversation to preview</div>
            )}
          </div>
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
    const obs = new MutationObserver(() => { const f = document.querySelector('.ant-app') as HTMLElement; if (f) { setAppRoot(f); obs.disconnect(); } });
    obs.observe(document.body, { childList: true });
    setTimeout(() => { obs.disconnect(); setAppRoot((p) => p || document.body); }, 2000);
    return () => obs.disconnect();
  }, [mounted]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => { setOpen({ showCommandMenu: false }); setIsVisible(false); setIsClosing(false); }, CLOSE_ANIMATION_DURATION);
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
