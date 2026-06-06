'use client';

import { KLAVIS_SERVER_TYPES, type KlavisServerType } from '@/../packages/const/src/klavis';
import { Avatar, Icon } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { CheckCircle2, Loader2, PlugZap, SquareArrowOutUpRight } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

import { createKlavisSkillDetailModal } from '@/features/SkillStore/SkillDetail';
import { useIsDark } from '@/hooks/useIsDark';
import { useToolStore } from '@/store/tool';
import { klavisStoreSelectors } from '@/store/tool/selectors';
import { KlavisServerStatus } from '@/store/tool/slices/klavisStore';

import SettingHeader from '../features/SettingHeader';

// ─── Categories ──────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  communication: 'Communication',
  crm: 'CRM & Sales',
  developer: 'Developer',
  productivity: 'Productivity',
  project: 'Project Management',
  social: 'Social & Media',
};

const IDENTIFIER_TO_CATEGORY: Record<string, string> = {
  'airtable': 'productivity',
  'cal-com': 'productivity',
  'clickup': 'project',
  'confluence': 'project',
  'dropbox': 'productivity',
  'figma': 'developer',
  'gmail': 'communication',
  'google-calendar': 'productivity',
  'google-docs': 'productivity',
  'google-drive': 'productivity',
  'google-sheets': 'productivity',
  'hubspot': 'crm',
  'jira': 'project',
  'onedrive': 'productivity',
  'outlook-mail': 'communication',
  'salesforce': 'crm',
  'slack': 'communication',
  'supabase': 'developer',
  'whatsapp': 'communication',
  'youtube': 'social',
  'zendesk': 'crm',
};

// ─── Connector Card ───────────────────────────────────────────────────────────

interface ConnectorCardProps {
  isDark: boolean;
  serverType: KlavisServerType;
}

const ConnectorCard = memo<ConnectorCardProps>(({ serverType, isDark }) => {
  const server = useToolStore(klavisStoreSelectors.getServerByIdentifier(serverType.identifier));
  const [busy, setBusy] = useState(false);

  const isConnected = server?.status === KlavisServerStatus.CONNECTED;
  const isPending = server?.status === KlavisServerStatus.PENDING_AUTH;

  const handleClick = () => {
    createKlavisSkillDetailModal({
      identifier: serverType.identifier,
      serverName: serverType.serverName,
    });
  };

  const renderIcon = () => {
    const { icon, label } = serverType;
    if (typeof icon === 'string') {
      return <Avatar alt={label} avatar={icon} size={40} />;
    }
    return <Icon fill={cssVar.colorText} icon={icon} size={40} />;
  };

  const statusBadge = isConnected ? (
    <span style={{
      alignItems: 'center',
      background: isDark ? 'rgba(52,199,89,0.15)' : 'rgba(52,199,89,0.12)',
      borderRadius: 20,
      color: '#34C759',
      display: 'inline-flex',
      fontSize: 11,
      fontWeight: 600,
      gap: 4,
      padding: '2px 8px',
    }}>
      <CheckCircle2 size={11} />
      Connected
    </span>
  ) : isPending ? (
    <span style={{
      background: isDark ? 'rgba(255,159,10,0.15)' : 'rgba(255,159,10,0.12)',
      borderRadius: 20,
      color: '#FF9F0A',
      fontSize: 11,
      fontWeight: 600,
      padding: '2px 8px',
    }}>
      Needs auth
    </span>
  ) : null;

  return (
    <div
      style={{
        background: isDark ? '#2c2c2b' : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
        borderRadius: 16,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        padding: 20,
        transition: 'box-shadow 0.15s ease, transform 0.1s ease',
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = isDark
          ? '0 4px 20px rgba(0,0,0,0.4)'
          : '0 4px 20px rgba(0,0,0,0.1)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Icon + status row */}
      <div style={{ alignItems: 'flex-start', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ opacity: isConnected ? 1 : 0.85 }}>{renderIcon()}</div>
        {statusBadge}
      </div>

      {/* Name */}
      <div style={{
        color: isDark ? (isConnected ? '#ffffff' : 'rgba(255,255,255,0.9)') : (isConnected ? '#111111' : '#111111'),
        fontSize: 15,
        fontWeight: 600,
        marginBottom: 6,
      }}>
        {serverType.label}
      </div>

      {/* Description */}
      <div style={{
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
        display: '-webkit-box',
        flex: 1,
        fontSize: 13,
        lineHeight: 1.5,
        marginBottom: 16,
        overflow: 'hidden',
      }}>
        {serverType.description}
      </div>

      {/* Connect button */}
      <button
        style={{
          alignItems: 'center',
          background: isConnected
            ? (isDark ? 'rgba(52,199,89,0.12)' : 'rgba(52,199,89,0.08)')
            : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
          border: isConnected
            ? '1px solid rgba(52,199,89,0.3)'
            : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'),
          borderRadius: 8,
          color: isConnected ? '#34C759' : (isDark ? 'rgba(255,255,255,0.8)' : '#333'),
          cursor: 'pointer',
          display: 'flex',
          fontSize: 13,
          fontWeight: 600,
          gap: 6,
          justifyContent: 'center',
          padding: '8px 12px',
          transition: 'background 0.15s ease',
          width: '100%',
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        {busy ? (
          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
        ) : isConnected ? (
          <CheckCircle2 size={14} />
        ) : (
          <SquareArrowOutUpRight size={14} />
        )}
        {isConnected ? 'Manage' : isPending ? 'Authorize' : 'Connect'}
      </button>
    </div>
  );
});

ConnectorCard.displayName = 'ConnectorCard';

// ─── Main Page ────────────────────────────────────────────────────────────────

const ConnectPage = memo(() => {
  const isDark = useIsDark();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const connectedCount = useToolStore((s) => klavisStoreSelectors.getConnectedServers(s).length);

  const filtered = useMemo(() => {
    let list: KlavisServerType[] = KLAVIS_SERVER_TYPES;
    if (activeCategory !== 'all') {
      list = list.filter((s) => IDENTIFIER_TO_CATEGORY[s.identifier] === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.label.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, activeCategory]);

  const categories = Object.entries(CATEGORY_LABELS);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <SettingHeader
        title="Connect"
        extra={
          <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
            <PlugZap size={16} style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
            <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', fontSize: 13 }}>
              {KLAVIS_SERVER_TYPES.length} integrations
            </span>
          </div>
        }
      />

      {/* Search + filters */}
      <div style={{ marginBottom: 24 }}>
        <input
          placeholder="Search integrations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: isDark ? '#2c2c2b' : '#ffffff',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            borderRadius: 10,
            color: isDark ? '#ffffff' : '#111',
            fontSize: 14,
            marginBottom: 16,
            outline: 'none',
            padding: '10px 14px',
            width: '100%',
          }}
        />

        {/* Category pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {categories.map(([key, label]) => {
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                style={{
                  background: isActive
                    ? (isDark ? 'rgba(255,255,255,0.15)' : '#111')
                    : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                  border: 'none',
                  borderRadius: 20,
                  color: isActive
                    ? (isDark ? '#ffffff' : '#ffffff')
                    : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)'),
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  padding: '6px 14px',
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ alignItems: 'center', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)', display: 'flex', flex: 1, fontSize: 14, justifyContent: 'center' }}>
          No integrations found
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        }}>
          {filtered.map((serverType) => (
            <ConnectorCard key={serverType.identifier} isDark={isDark} serverType={serverType} />
          ))}
        </div>
      )}
    </div>
  );
});

ConnectPage.displayName = 'ConnectPage';
export default ConnectPage;
