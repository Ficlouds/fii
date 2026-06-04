'use client';

import { ChevronDown } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const AGENTS = [
  { id: 'athena', label: 'Athena', description: 'Smart & Creative' },
  { id: 'zeus', label: 'Zeus', description: 'Powerful & Fast' },
  { id: 'horus', label: 'Horus', description: 'Precise & Analytical' },
];

interface AgentSelectorProps {
  incognito?: boolean;
}

const AgentSelector = memo<AgentSelectorProps>(({ incognito = false }) => {
  const [selected, setSelected] = useState(AGENTS[0]);
  const [open, setOpen] = useState(false);
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

  const fg = incognito ? '#ffffff' : '#111111';
  const fgSub = incognito ? 'rgba(255,255,255,0.5)' : '#888';
  const borderColor = incognito ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)';
  const dropBg = incognito ? '#1c1c1e' : '#fff';
  const dropBorder = incognito ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const hoverBg = incognito ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';

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
              boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
              left: coords.left,
              minWidth: 180,
              overflow: 'hidden',
              position: 'fixed',
              top: coords.top,
              transform: 'translateY(-100%)',
              zIndex: 9999,
            }}
          >
            {AGENTS.map((agent) => (
              <div
                key={agent.id}
                onClick={() => { setSelected(agent); setOpen(false); }}
                style={{
                  background: selected.id === agent.id ? hoverBg : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  padding: '10px 14px',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = selected.id === agent.id ? hoverBg : 'transparent')}
              >
                <span style={{ color: fg, fontSize: 14, fontWeight: 500 }}>{agent.label}</span>
                <span style={{ color: fgSub, fontSize: 12 }}>{agent.description}</span>
              </div>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
});

export default AgentSelector;
