'use client';

import { Flexbox } from '@lobehub/ui';
import { ChevronDown } from 'lucide-react';
import { memo, useState } from 'react';

const AGENTS = [
  { id: 'athena', label: 'Athena', description: 'Smart & Creative' },
  { id: 'zeus', label: 'Zeus', description: 'Powerful & Fast' },
  { id: 'horus', label: 'Horus', description: 'Precise & Analytical' },
];

const AgentSelector = memo(() => {
  const [selected, setSelected] = useState(AGENTS[0]);
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          alignItems: 'center',
          background: 'transparent',
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: 20,
          color: '#111',
          cursor: 'pointer',
          display: 'flex',
          fontSize: 13,
          fontWeight: 500,
          gap: 4,
          padding: '4px 10px 4px 12px',
          transition: 'background 0.15s',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {selected.label}
        <ChevronDown size={14} style={{ opacity: 0.6 }} />
      </button>

      {open && (
        <>
          <div
            style={{ bottom: 0, left: 0, position: 'fixed', right: 0, top: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 12,
              bottom: 'calc(100% + 8px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              left: 0,
              minWidth: 180,
              overflow: 'hidden',
              position: 'absolute',
              zIndex: 100,
            }}
          >
            {AGENTS.map((agent) => (
              <div
                key={agent.id}
                onClick={() => { setSelected(agent); setOpen(false); }}
                style={{
                  alignItems: 'center',
                  background: selected.id === agent.id ? 'rgba(0,0,0,0.04)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 1,
                  padding: '10px 14px',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = selected.id === agent.id ? 'rgba(0,0,0,0.04)' : 'transparent')}
              >
                <span style={{ color: '#111', fontSize: 14, fontWeight: 500 }}>{agent.label}</span>
                <span style={{ color: '#888', fontSize: 12 }}>{agent.description}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export default AgentSelector;
