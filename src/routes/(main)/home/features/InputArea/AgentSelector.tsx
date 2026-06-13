'use client';

import { ChevronDown } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { useIsDark } from '@/hooks/useIsDark';
import { createPortal } from 'react-dom';

const AGENTS = [
  { id: 'horus', label: 'F1.8', sub: 'Efficient. Everyday use.', warn: false, group: 'default' },
  { id: 'athena', label: 'F2.7', sub: 'Consumes limits faster', warn: true, group: 'advanced' },
  { id: 'zeus', label: 'F3.6', sub: 'Maximised. Consumes limits faster', warn: true, group: 'advanced' },
];

interface AgentSelectorProps {
  incognito?: boolean;
}

const AgentSelector = memo<AgentSelectorProps>(({ incognito = false }) => {
  const [selected, setSelected] = useState(AGENTS[0]);
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.top - 8, left: rect.left });
    }
    setOpen(!open);
  };

  useEffect(() => {
    if (!open) return;
    const handle = () => setOpen(false);
    window.addEventListener('scroll', handle, true);
    return () => window.removeEventListener('scroll', handle, true);
  }, [open]);

  const isDark = useIsDark();
  const fg = isDark ? '#ececec' : '#111111';
  const fgSub = isDark ? 'rgba(255,255,255,0.38)' : '#888888';
  const fgWarn = isDark ? 'rgba(255,255,255,0.38)' : '#888888';
  const borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)';
  const dropBg = isDark ? '#252524' : '#ffffff';
  const dropBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.05)' : '#f7f7f7';
  const dividerColor = isDark ? 'rgba(255,255,255,0.07)' : '#ebebeb';

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        style={{
          alignItems: 'center',
          background: 'transparent',
          border: `1px solid ${borderColor}`,
          borderRadius: 20,
          color: fg,
          cursor: 'pointer',
          display: 'flex',
          fontSize: 13,
          fontWeight: 500,
          gap: 4,
          padding: '4px 10px 4px 12px',
          transition: 'all 0.15s',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        {selected.label}
        <ChevronDown size={14} style={{ opacity: 0.6, color: fg }} />
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <>
          <div
            style={{ bottom: 0, left: 0, position: 'fixed', right: 0, top: 0, zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              background: dropBg,
              border: `1px solid ${dropBorder}`,
              borderRadius: 12,
              boxShadow: isDark
                ? '0 8px 32px rgba(0,0,0,0.45)'
                : '0 8px 32px rgba(0,0,0,0.10)',
              left: coords.left,
              minWidth: 210,
              overflow: 'hidden',
              position: 'fixed',
              top: coords.top,
              transform: 'translateY(-100%)',
              zIndex: 9999,
            }}
          >
            {AGENTS.map((agent, index) => {
              const isSelected = selected.id === agent.id;
              const isHovered = hoveredId === agent.id;
              const showDivider = index > 0 && AGENTS[index - 1].group !== agent.group;

              return (
                <div key={agent.id}>
                  {showDivider && (
                    <div style={{ background: dividerColor, height: '0.5px', margin: '3px 0' }} />
                  )}
                  <div
                    onClick={() => { setSelected(agent); setOpen(false); }}
                    onMouseEnter={() => setHoveredId(agent.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      background: isHovered ? hoverBg : 'transparent',
                      cursor: 'pointer',
                      padding: '9px 14px',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{
                      color: fg,
                      fontSize: 14,
                      fontWeight: isSelected ? 500 : 400,
                      marginBottom: 2,
                    }}>
                      {agent.label}
                    </div>
                    <div style={{
                      color: agent.warn ? fgWarn : fgSub,
                      fontSize: 11,
                      fontWeight: 400,
                      lineHeight: 1.4,
                    }}>
                      {agent.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </>
  );
});

export default AgentSelector;
