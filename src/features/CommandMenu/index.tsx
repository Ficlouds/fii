'use client';

import { Command } from 'cmdk';
import { Search, X } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { useGlobalStore } from '@/store/global';
import { useCommandMenu } from './useCommandMenu';
import { CommandMenuProvider, useCommandMenuContext } from './CommandMenuContext';
import SearchResults from './SearchResults';

const CLOSE_ANIMATION_DURATION = 150;

const CommandMenuContent = memo<{ isClosing: boolean; onClose: () => void }>(({ isClosing, onClose }) => {
  const { hasSearch, isSearching, searchQuery, searchResults, typeFilter } = useCommandMenu();
  const { search, setSearch, setTypeFilter } = useCommandMenuContext();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [search]);

  return (
    <div
      onClick={onClose}
      style={{
        alignItems: 'flex-start',
        animation: isClosing ? 'fiSearchFadeOut 0.15s ease-out forwards' : 'fiSearchFadeIn 0.15s ease-out',
        background: 'rgba(249,248,247,0.97)',
        display: 'flex',
        inset: 0,
        justifyContent: 'center',
        paddingTop: 100,
        position: 'fixed',
        zIndex: 9999,
      }}
    >
      <style>{`
        @keyframes fiSearchFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fiSearchFadeOut { from { opacity: 1; } to { opacity: 0; } }
        [cmdk-item] { cursor: pointer; }
        [cmdk-item][aria-selected='true'] { background: rgba(0,0,0,0.04); border-radius: 10px; }
        [cmdk-item]:hover { background: rgba(0,0,0,0.03); border-radius: 10px; }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 20,
          boxShadow: '0 4px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '60vh',
          overflow: 'hidden',
          width: 'min(680px, 92vw)',
        }}
      >
        <Command
          shouldFilter={false}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { e.preventDefault(); onClose(); }
          }}
        >
          {/* Search input */}
          <div style={{ alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: 14, padding: '20px 24px' }}>
            <Search size={20} style={{ color: 'rgba(0,0,0,0.3)', flexShrink: 0 }} />
            <Command.Input
              autoFocus
              maxLength={500}
              placeholder="Search your conversations..."
              value={search}
              onValueChange={setSearch}
              style={{ background: 'transparent', border: 'none', color: '#111', flex: 1, fontSize: 18, fontWeight: 400, minWidth: 0, outline: 'none' }}
            />
            {search ? (
              <button onClick={() => setSearch('')} style={{ alignItems: 'center', background: 'rgba(0,0,0,0.07)', border: 'none', borderRadius: '50%', color: 'rgba(0,0,0,0.45)', cursor: 'pointer', display: 'flex', flexShrink: 0, height: 22, justifyContent: 'center', width: 22 }}>
                <X size={12} />
              </button>
            ) : (
              <kbd style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 6, color: 'rgba(0,0,0,0.3)', fontSize: 11, padding: '3px 8px' }}>ESC</kbd>
            )}
          </div>

          {/* Results */}
          <Command.List ref={listRef} style={{ maxHeight: 'calc(60vh - 72px)', overflowY: 'auto', padding: '8px' }}>
            {!hasSearch && (
              <div style={{ color: 'rgba(0,0,0,0.3)', fontSize: 13, padding: '40px 20px', textAlign: 'center' }}>
                Start typing to search your conversations
              </div>
            )}
            {hasSearch && (
              <SearchResults
                isLoading={isSearching}
                results={searchResults}
                searchQuery={searchQuery}
                typeFilter={typeFilter}
                onClose={onClose}
                onSetTypeFilter={setTypeFilter}
              />
            )}
          </Command.List>
        </Command>
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

  useEffect(() => {
    if (open) { setIsVisible(true); setIsClosing(false); }
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const el = document.querySelector('.ant-app') as HTMLElement;
    if (el) { setAppRoot(el); return; }
    const obs = new MutationObserver(() => {
      const found = document.querySelector('.ant-app') as HTMLElement;
      if (found) { setAppRoot(found); obs.disconnect(); }
    });
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
ENDOFFILEcat > "/Users/cts13677/Desktop/f/src/features/CommandMenu/index.tsx" << 'ENDOFFILE'
'use client';

import { Command } from 'cmdk';
import { Search, X } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { useGlobalStore } from '@/store/global';
import { useCommandMenu } from './useCommandMenu';
import { CommandMenuProvider, useCommandMenuContext } from './CommandMenuContext';
import SearchResults from './SearchResults';

const CLOSE_ANIMATION_DURATION = 150;

const CommandMenuContent = memo<{ isClosing: boolean; onClose: () => void }>(({ isClosing, onClose }) => {
  const { hasSearch, isSearching, searchQuery, searchResults, typeFilter } = useCommandMenu();
  const { search, setSearch, setTypeFilter } = useCommandMenuContext();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [search]);

  return (
    <div
      onClick={onClose}
      style={{
        alignItems: 'flex-start',
        animation: isClosing ? 'fiSearchFadeOut 0.15s ease-out forwards' : 'fiSearchFadeIn 0.15s ease-out',
        background: 'rgba(249,248,247,0.97)',
        display: 'flex',
        inset: 0,
        justifyContent: 'center',
        paddingTop: 100,
        position: 'fixed',
        zIndex: 9999,
      }}
    >
      <style>{`
        @keyframes fiSearchFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fiSearchFadeOut { from { opacity: 1; } to { opacity: 0; } }
        [cmdk-item] { cursor: pointer; }
        [cmdk-item][aria-selected='true'] { background: rgba(0,0,0,0.04); border-radius: 10px; }
        [cmdk-item]:hover { background: rgba(0,0,0,0.03); border-radius: 10px; }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 20,
          boxShadow: '0 4px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '60vh',
          overflow: 'hidden',
          width: 'min(680px, 92vw)',
        }}
      >
        <Command
          shouldFilter={false}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { e.preventDefault(); onClose(); }
          }}
        >
          {/* Search input */}
          <div style={{ alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: 14, padding: '20px 24px' }}>
            <Search size={20} style={{ color: 'rgba(0,0,0,0.3)', flexShrink: 0 }} />
            <Command.Input
              autoFocus
              maxLength={500}
              placeholder="Search your conversations..."
              value={search}
              onValueChange={setSearch}
              style={{ background: 'transparent', border: 'none', color: '#111', flex: 1, fontSize: 18, fontWeight: 400, minWidth: 0, outline: 'none' }}
            />
            {search ? (
              <button onClick={() => setSearch('')} style={{ alignItems: 'center', background: 'rgba(0,0,0,0.07)', border: 'none', borderRadius: '50%', color: 'rgba(0,0,0,0.45)', cursor: 'pointer', display: 'flex', flexShrink: 0, height: 22, justifyContent: 'center', width: 22 }}>
                <X size={12} />
              </button>
            ) : (
              <kbd style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 6, color: 'rgba(0,0,0,0.3)', fontSize: 11, padding: '3px 8px' }}>ESC</kbd>
            )}
          </div>

          {/* Results */}
          <Command.List ref={listRef} style={{ maxHeight: 'calc(60vh - 72px)', overflowY: 'auto', padding: '8px' }}>
            {!hasSearch && (
              <div style={{ color: 'rgba(0,0,0,0.3)', fontSize: 13, padding: '40px 20px', textAlign: 'center' }}>
                Start typing to search your conversations
              </div>
            )}
            {hasSearch && (
              <SearchResults
                isLoading={isSearching}
                results={searchResults}
                searchQuery={searchQuery}
                typeFilter={typeFilter}
                onClose={onClose}
                onSetTypeFilter={setTypeFilter}
              />
            )}
          </Command.List>
        </Command>
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

  useEffect(() => {
    if (open) { setIsVisible(true); setIsClosing(false); }
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const el = document.querySelector('.ant-app') as HTMLElement;
    if (el) { setAppRoot(el); return; }
    const obs = new MutationObserver(() => {
      const found = document.querySelector('.ant-app') as HTMLElement;
      if (found) { setAppRoot(found); obs.disconnect(); }
    });
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
