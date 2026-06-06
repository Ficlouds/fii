'use client';

import { Search } from 'lucide-react';
import { memo, useState } from 'react';
import { useIsDark } from '@/hooks/useIsDark';
import { KLAVIS_SERVER_TYPES } from '@/../packages/const/src/klavis';
import { createKlavisSkillDetailModal } from '@/features/SkillStore/SkillDetail';
import { useToolStore } from '@/store/tool';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'google', label: 'Google' },
  { id: 'microsoft', label: 'Microsoft' },
  { id: 'communication', label: 'Communication' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'crm', label: 'CRM & Sales' },
  { id: 'storage', label: 'Storage' },
];

const CATEGORY_MAP = {
  google: ['gmail', 'google-calendar', 'google-drive', 'google-docs', 'google-sheets'],
  microsoft: ['onedrive', 'outlook-mail'],
  communication: ['slack', 'whatsapp', 'youtube', 'zendesk'],
  productivity: ['clickup', 'jira', 'confluence', 'airtable', 'figma', 'cal-com'],
  crm: ['hubspot', 'salesforce', 'zendesk'],
  storage: ['google-drive', 'onedrive', 'dropbox'],
};

const ConnectPage = memo(() => {
  const isDark = useIsDark();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const installedKlavis = useToolStore((s) => s.installedKlavisServers ?? []);

  const bg = isDark ? '#1f1f1e' : '#f9f8f7';
  const cardBg = isDark ? '#2c2c2b' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const text = isDark ? '#ffffff' : '#111111';
  const textSub = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';

  const filtered = KLAVIS_SERVER_TYPES.filter((s) => {
    const matchSearch = !search.trim() ||
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || CATEGORY_MAP[activeCategory]?.includes(s.identifier);
    return matchSearch && matchCat;
  });

  const isConnected = (id) =>
    installedKlavis.some((s) => s.identifier === id && s.status === 'active');

  return (
    <div style={{ background: bg, height: '100%', overflowY: 'auto', padding: '32px 40px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: text, fontSize: 24, fontWeight: 700, margin: 0 }}>Connect</h1>
        <p style={{ color: textSub, fontSize: 14, margin: '6px 0 0' }}>
          Connect Fi to your apps. All integrations use OAuth — just log in, no API keys needed.
        </p>
      </div>

      <div style={{ alignItems: 'center', background: cardBg, border: `1px solid ${border}`, borderRadius: 12, display: 'flex', gap: 10, marginBottom: 20, padding: '10px 16px' }}>
        <Search size={15} style={{ color: textSub, flexShrink: 0 }} />
        <input
          placeholder="Search connectors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: text, flex: 1, fontSize: 14, outline: 'none' }}
        />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: textSub, cursor: 'pointer', fontSize: 18, padding: 0 }}>×</button>}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            style={{ background: activeCategory === cat.id ? (isDark ? '#ffffff' : '#111') : 'transparent', border: `1px solid ${activeCategory === cat.id ? 'transparent' : border}`, borderRadius: 20, color: activeCategory === cat.id ? (isDark ? '#111' : '#fff') : text, cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: '6px 16px' }}>
            {cat.label}
          </button>
        ))}
      </div>

      <div style={{ color: textSub, fontSize: 12, marginBottom: 16 }}>{filtered.length} connector{filtered.length !== 1 ? 's' : ''}</div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {filtered.map((server) => {
          const connected = isConnected(server.identifier);
          return (
            <div key={server.identifier}
              onClick={() => createKlavisSkillDetailModal({ serverType: server })}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              style={{ alignItems: 'center', background: cardBg, border: `1px solid ${connected ? (isDark ? 'rgba(74,222,128,0.35)' : 'rgba(22,163,74,0.25)') : border}`, borderRadius: 14, cursor: 'pointer', display: 'flex', gap: 14, padding: '16px 18px', transition: 'transform 0.15s, box-shadow 0.15s' }}>
              <div style={{ alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: 10, display: 'flex', flexShrink: 0, height: 46, justifyContent: 'center', width: 46 }}>
                {typeof server.icon === 'string' ? (
                  <img src={server.icon} alt={server.label} style={{ height: 28, objectFit: 'contain', width: 28 }} onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <server.icon size={28} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
                  <span style={{ color: text, fontSize: 14, fontWeight: 600 }}>{server.label}</span>
                  {connected && <span style={{ background: isDark ? 'rgba(74,222,128,0.15)' : 'rgba(22,163,74,0.1)', borderRadius: 8, color: isDark ? '#4ade80' : '#16a34a', fontSize: 10, fontWeight: 700, padding: '2px 7px' }}>Connected</span>}
                </div>
                <div style={{ color: textSub, fontSize: 12, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{server.description.slice(0, 65)}{server.description.length > 65 ? '...' : ''}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); createKlavisSkillDetailModal({ serverType: server }); }}
                style={{ background: connected ? 'transparent' : (isDark ? '#ffffff' : '#111'), border: connected ? `1px solid ${border}` : 'none', borderRadius: 20, color: connected ? textSub : (isDark ? '#111' : '#fff'), cursor: 'pointer', flexShrink: 0, fontSize: 12, fontWeight: 600, padding: '6px 16px', whiteSpace: 'nowrap' }}>
                {connected ? 'Manage' : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <div style={{ color: textSub, fontSize: 14, padding: '60px 0', textAlign: 'center' }}>No connectors found{search ? ` for "${search}"` : ''}</div>}
    </div>
  );
});

ConnectPage.displayName = 'ConnectPage';
export default ConnectPage;
