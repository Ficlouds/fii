'use client';

import { memo, useState } from 'react';
import { Search } from 'lucide-react';
import { KLAVIS_SERVER_TYPES } from '@/../packages/const/src/klavis';
import { createKlavisSkillDetailModal } from '@/features/SkillStore/SkillDetail';
import { useIsDark } from '@/hooks/useIsDark';
import { useToolStore } from '@/store/tool';
import SettingHeader from '../features/SettingHeader';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'google', label: 'Google' },
  { id: 'microsoft', label: 'Microsoft' },
  { id: 'communication', label: 'Communication' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'crm', label: 'CRM & Sales' },
  { id: 'storage', label: 'Storage' },
];

const CATEGORY_MAP: Record<string, string[]> = {
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
  const servers = useToolStore((s: any) => s.servers ?? []);

  const bg = isDark ? '#1f1f1e' : '#f9f8f7';
  const cardBg = isDark ? '#2c2c2b' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const text = isDark ? '#ffffff' : '#111111';
  const textSub = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';

  const filtered = KLAVIS_SERVER_TYPES.filter((s) => {
    const matchSearch = !search.trim() ||
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || (CATEGORY_MAP[activeCategory] ?? []).includes(s.identifier);
    return matchSearch && matchCat;
  });

  const isConnected = (id: string) =>
    servers.some((s: any) => s.identifier === id && s.status === 'connected');

  return (
    <>
      <SettingHeader title="Connect" />
      <div style={{ padding: '0 24px 24px', overflowY: 'auto', flex: 1 }}>
        <p style={{ color: textSub, fontSize: 13, margin: '0 0 20px' }}>
          Connect Fi to your apps via secure OAuth login — no API keys needed.
        </p>

        <div style={{ alignItems: 'center', background: cardBg, border: `1px solid ${border}`, borderRadius: 10, display: 'flex', gap: 8, marginBottom: 16, padding: '8px 14px' }}>
          <Search size={14} style={{ color: textSub }} />
          <input placeholder="Search connectors..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: text, flex: 1, fontSize: 13, outline: 'none' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: textSub, cursor: 'pointer', fontSize: 16, padding: 0 }}>×</button>}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              style={{ background: activeCategory === cat.id ? (isDark ? '#fff' : '#111') : 'transparent', border: `1px solid ${activeCategory === cat.id ? 'transparent' : border}`, borderRadius: 20, color: activeCategory === cat.id ? (isDark ? '#111' : '#fff') : text, cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '5px 14px' }}>
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {filtered.map((server) => {
            const connected = isConnected(server.identifier);
            return (
              <div key={server.identifier} onClick={() => createKlavisSkillDetailModal({ serverType: server })}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                style={{ alignItems: 'center', background: cardBg, border: `1px solid ${connected ? 'rgba(74,222,128,0.4)' : border}`, borderRadius: 12, cursor: 'pointer', display: 'flex', gap: 12, padding: '14px 16px', transition: 'box-shadow 0.15s' }}>
                <div style={{ alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: 8, display: 'flex', flexShrink: 0, height: 40, justifyContent: 'center', width: 40 }}>
                  {typeof server.icon === 'string'
                    ? <img src={server.icon} alt={server.label} style={{ height: 24, objectFit: 'contain', width: 24 }} onError={(e: any) => { e.target.style.display = 'none'; }} />
                    : <server.icon size={24} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
                    <span style={{ color: text, fontSize: 13, fontWeight: 600 }}>{server.label}</span>
                    {connected && <span style={{ background: 'rgba(74,222,128,0.15)', borderRadius: 6, color: '#4ade80', fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>Connected</span>}
                  </div>
                  <div style={{ color: textSub, fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {server.description.slice(0, 60)}{server.description.length > 60 ? '...' : ''}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); createKlavisSkillDetailModal({ serverType: server }); }}
                  style={{ background: connected ? 'transparent' : (isDark ? '#fff' : '#111'), border: connected ? `1px solid ${border}` : 'none', borderRadius: 16, color: connected ? textSub : (isDark ? '#111' : '#fff'), cursor: 'pointer', flexShrink: 0, fontSize: 11, fontWeight: 600, padding: '5px 12px', whiteSpace: 'nowrap' }}>
                  {connected ? 'Manage' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && <div style={{ color: textSub, fontSize: 13, padding: '40px 0', textAlign: 'center' }}>No connectors found</div>}
      </div>
    </>
  );
});

ConnectPage.displayName = 'ConnectPage';
export default ConnectPage;
