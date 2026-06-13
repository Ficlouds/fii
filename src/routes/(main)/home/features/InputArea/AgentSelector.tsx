'use client';

import { ChevronDown } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { useIsDark } from '@/hooks/useIsDark';
import { createPortal } from 'react-dom';

const AGENTS = [
  {
    id: 'horus',
    label: 'F1.8',
    description: 'Fast & Everyday',
    model: 'Llama 3.3 70B',
    provider: 'Meta',
    context: '128K tokens',
    pricing: { input: '$0.10', output: '$0.20' },
    abilities: ['Fast responses', 'Daily chat', 'Multilingual'],
  },
  {
    id: 'athena',
    label: 'F2.7',
    description: 'Smart & Balanced',
    model: 'DeepSeek V4 Flash',
    provider: 'DeepSeek',
    context: '1M tokens',
    pricing: { input: '$0.14', output: '$0.28' },
    abilities: ['Tool calling', 'Code', 'Analysis'],
  },
  {
    id: 'zeus',
    label: 'F3.6',
    description: 'Powerful & Deep',
    model: 'DeepSeek V4 Pro',
    provider: 'DeepSeek',
    context: '1M tokens',
    pricing: { input: '$0.435', output: '$0.87' },
    abilities: ['Deep reasoning', 'Complex coding', 'Research'],
  },
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
  const fg = isDark ? '#ffffff' : '#111111';
  const fgSub = isDark ? 'rgba(255,255,255,0.5)' : '#888';
  const fgMuted = isDark ? 'rgba(255,255,255,0.35)' : '#aaa';
  const borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)';
  const dropBg = isDark ? '#2c2c2b' : '#fff';
  const dropBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
  const activeBg = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const accentColor = isDark ? '#7c6ff7' : '#5b4ff5';
  const detailBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';

  const hoveredAgent = AGENTS.find(a => a.id === hoveredId) || selected;

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
        <ChevronDown size={14} style={{ opacity: 1, color: fg }} />
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
              borderRadius: 14,
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
              display: 'flex',
              left: coords.left,
              overflow: 'hidden',
              position: 'fixed',
              top: coords.top,
              transform: 'translateY(-100%)',
              zIndex: 9999,
            }}
          >
            {/* Left — model list */}
            <div style={{ borderRight: `1px solid ${dividerColor}`, minWidth: 160, padding: '8px 0' }}>
              {AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => { setSelected(agent); setOpen(false); }}
                  onMouseEnter={() => setHoveredId(agent.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    alignItems: 'center',
                    background: selected.id === agent.id ? activeBg : hoveredId === agent.id ? hoverBg : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 10,
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    transition: 'background 0.1s',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ color: fg, fontSize: 14, fontWeight: 600 }}>{agent.label}</span>
                    <span style={{ color: fgSub, fontSize: 11 }}>{agent.description}</span>
                  </div>
                  {selected.id === agent.id && (
                    <div style={{ background: accentColor, borderRadius: 4, height: 6, width: 6 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Right — model details */}
            <div style={{ padding: '14px 16px', width: 220 }}>
              <div style={{ color: fg, fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                {hoveredAgent.model}
              </div>
              <div style={{ color: fgSub, fontSize: 11, marginBottom: 12 }}>
                by {hoveredAgent.provider}
              </div>

              {/* Context */}
              <div style={{ background: detailBg, borderRadius: 8, marginBottom: 8, padding: '8px 10px' }}>
                <div style={{ color: fgMuted, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase' }}>
                  Context Length
                </div>
                <div style={{ color: fg, fontSize: 13, fontWeight: 500 }}>{hoveredAgent.context}</div>
              </div>

              {/* Abilities */}
              <div style={{ background: detailBg, borderRadius: 8, marginBottom: 8, padding: '8px 10px' }}>
                <div style={{ color: fgMuted, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 6, textTransform: 'uppercase' }}>
                  Abilities
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {hoveredAgent.abilities.map((a) => (
                    <div key={a} style={{ alignItems: 'center', color: fgSub, display: 'flex', fontSize: 12, gap: 6 }}>
                      <div style={{ background: accentColor, borderRadius: '50%', flexShrink: 0, height: 5, opacity: 0.8, width: 5 }} />
                      {a}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div style={{ background: detailBg, borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ color: fgMuted, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 6, textTransform: 'uppercase' }}>
                  Pricing / 1M tokens
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: fgSub, fontSize: 12 }}>Input</span>
                    <span style={{ color: fg, fontSize: 12, fontWeight: 500 }}>{hoveredAgent.pricing.input}</span>
                  </div>
                  <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: fgSub, fontSize: 12 }}>Output</span>
                    <span style={{ color: fg, fontSize: 12, fontWeight: 500 }}>{hoveredAgent.pricing.output}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
});

export default AgentSelector;
