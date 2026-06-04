'use client';
import { Discord, Slack, Telegram } from '@lobehub/ui/icons';
import { EyeOffIcon } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';
import InputArea from './InputArea';

const INCOGNITO_KEY = 'fi-incognito-mode';
const CONNECT_DISMISSED_KEY = 'fi-connect-banner-dismissed';

const Home = memo(() => {
  const isLogin = useUserStore(authSelectors.isLogin);
  const [incognito, setIncognito] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(INCOGNITO_KEY) === 'true') setIncognito(true);
    if (localStorage.getItem(CONNECT_DISMISSED_KEY) === 'true') setBannerDismissed(true);
  }, []);

  const toggleIncognito = useCallback(() => {
    setIncognito((prev) => {
      const next = !prev;
      localStorage.setItem(INCOGNITO_KEY, String(next));
      return next;
    });
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
    localStorage.setItem(CONNECT_DISMISSED_KEY, 'true');
  }, []);

  return (
    <div
      style={{
        alignItems: 'center',
        background: '#f9f8f7',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh',
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Incognito icon — top right, icon only */}
      <button
        onClick={toggleIncognito}
        title={incognito ? 'Incognito on — click to disable' : 'Enable incognito mode'}
        style={{
          alignItems: 'center',
          background: incognito ? 'rgba(0,0,0,0.08)' : 'transparent',
          border: 'none',
          borderRadius: 8,
          color: incognito ? '#111' : 'rgba(0,0,0,0.35)',
          cursor: 'pointer',
          display: 'flex',
          padding: 6,
          position: 'absolute',
          right: 16,
          top: 16,
          transition: 'all 0.15s',
        }}
      >
        <EyeOffIcon size={16} />
      </button>

      {/* Fi logo */}
      <div
        style={{
          color: '#111',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: '-2px',
          marginBottom: 24,
          userSelect: 'none',
        }}
      >
        Fi
      </div>

      {/* Input pill — Grok style, rounded, single row */}
      <div style={{ maxWidth: 680, padding: '0 16px', width: '100%' }}>
        <InputArea incognito={incognito} />
      </div>

      {/* Connect Now banner — Grok style */}
      {!bannerDismissed && (
        <div
          style={{
            alignItems: 'center',
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 14,
            display: 'flex',
            gap: 12,
            justifyContent: 'space-between',
            marginTop: 16,
            maxWidth: 680,
            padding: '12px 16px',
            width: 'calc(100% - 32px)',
          }}
        >
          <div style={{ alignItems: 'center', display: 'flex', gap: 6, flexShrink: 0 }}>
            <Telegram.Color size={24} />
            <Slack.Color size={24} />
            <Discord.Color size={24} />
          </div>
          <div style={{ flex: 1, paddingInline: 10 }}>
            <div style={{ color: '#111', fontSize: 13, fontWeight: 600 }}>Connect Now</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12, marginTop: 1 }}>
              Connect Fi to Telegram, Slack, Discord and more
            </div>
          </div>
          <div style={{ alignItems: 'center', display: 'flex', flexShrink: 0, gap: 8 }}>
            <button
              onClick={dismissBanner}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(0,0,0,0.4)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                padding: '4px 8px',
              }}
            >
              Dismiss
            </button>
            <button
              onClick={() => (window.location.href = '/settings/messenger')}
              style={{
                background: '#111',
                border: 'none',
                borderRadius: 20,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 18px',
              }}
            >
              Connect
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default Home;
