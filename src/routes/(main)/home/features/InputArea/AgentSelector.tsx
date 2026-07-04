'use client';

import { ChevronDown } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { useIsDark } from '@/hooks/useIsDark';
import { createPortal } from 'react-dom';
import { useAgentStore } from '@/store/agent';

// Real model + provider mapping. F1.8 routes to Groq directly (Llama 4
// Scout has native vision built in -- never calls Gemini, so users on
// the cheap tier never silently incur a backend Gemini call for images).
// F2.7/F3.6 route to DeepSeek directly; Gemini is only ever invoked for
// these two tiers specifically, by the document/image pipeline, because
// DeepSeek has no native vision at all -- that is a justified, necessary
// call, not a hidden cost shift.
// All three tiers route through Fi's own internal "fimodels" provider,
// which points at Fi's LiteLLM server -- never directly at Groq,
// DeepSeek, or Gemini. This guarantees the underlying provider name
// never reaches the frontend (settings UI, error messages, "bring your
// own API key" prompts, etc).
const AGENTS = [
  {
    id: 'horus',
    label: 'F1.8',
    model: 'llama-4-scout',
    provider: 'fimodels',
    sub: 'Efficient. Everyday use.',
    warn: false,
    group: 'default',
  },
  {
    id: 'athena',
    label: 'F2.7',
    model: 'deepseek-v4-flash',
    provider: 'fimodels',
    sub: 'Consumes limits faster',
    warn: true,
    group: 'advanced',
  },
  {
    id: 'zeus',
    label: 'F3.6',
    model: 'deepseek-v4-pro',
    provider: 'fimodels',
    sub: 'Maximised. Consumes limits faster',
    warn: true,
    group: 'advanced',
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
  const updateAgentConfig = useAgentStore((s) => s.updateAgentConfig);

  // Sync the default selection (F1.8) to the agent's actual config on
  // mount. Without this, F1.8 -- being the pre-selected default -- never
  // fires handleSelect at all unless the user clicks away and back,
  // leaving the backend on whatever model/provider it had before (which
  // could be DEEPSEEK_PROXY or any stale value), even though the UI
  // visually shows F1.8 as selected.
  useEffect(() => {
    void updateAgentConfig({ model: selected.model, provider: selected.provider });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (agent: (typeof AGENTS)[number]) => {
    // eslint-disable-next-line no-console
    console.log('[Fi AgentSelector] handleSelect fired:', agent.label, agent.model, agent.provider);
    setSelected(agent);
    setOpen(false);
    // Persist the real model + provider to the agent's actual config --
    // this is what the chat backend reads to decide which model to call.
    // Previously this only updated local display state and never
    // reached the backend, so every tier silently used the same default
    // model regardless of what the dropdown showed.
    void updateAgentConfig({ model: agent.model, provider: agent.provider });
  };

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
                    onClick={() => handleSelect(agent)}
                    onMouseEnter={() => setHoveredId(agent.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      background: isSelected ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : isHovered ? hoverBg : 'transparent',
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
