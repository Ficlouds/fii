'use client';
import { Discord, Slack, Telegram } from '@lobehub/ui/icons';
import { memo, useCallback, useEffect, useState } from 'react';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';
import InputArea from './InputArea';

const INCOGNITO_KEY = 'fi-incognito-mode';
const CONNECT_DISMISSED_KEY = 'fi-connect-banner-dismissed';

const IncognitoIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 4.5L7 9h3.5v1.5H9A2.5 2.5 0 006.5 13 2.5 2.5 0 009 15.5h6A2.5 2.5 0 0017.5 13 2.5 2.5 0 0015 10.5h-1.5V9H17l-5-4.5z"
      fill={active ? '#111' : 'rgba(0,0,0,0.35)'}
    />
    <circle cx="9.5" cy="13" r="1" fill={active ? '#f9f8f7' : '#f9f8f7'} />
    <circle cx="14.5" cy="13" r="1" fill={active ? '#f9f8f7' : '#f9f8f7'} />
  </svg>
);

const Home = memo(() => {
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
        background: '#f9f8f7',
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
      }}
    >
      {/* Incognito icon top right */}
      <button
        onClick={toggleIncognito}
        title={incognito ? 'Incognito on' : 'Incognito mode'}
        style={{
          alignItems: 'center',
          background: incognito ? 'rgba(0,0,0,0.08)' : 'transparent',
          border: 'none',
          borderRadius: 8,
          color: incognito ? '#111' : 'rgba(0,0,0,0.32)',
          cursor: 'pointer',
          display: 'flex',
          padding: 7,
          position: 'absolute',
          right: 20,
          top: 16,
          zIndex: 10,
        }}
      >
        <IncognitoIcon active={incognito} />
      </button>

      {/* Centered content */}
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          paddingBottom: 80,
          width: '100%',
        }}
      >
        {/* Fi logo */}
        <div
          style={{
            color: '#111',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 60,
            fontWeight: 700,
            letterSpacing: '-2px',
            marginBottom: 32,
            userSelect: 'none',
          }}
        >
          Fi
        </div>

        {/* Input pill */}
        <div style={{ maxWidth: 760, padding: '0 24px', width: '100%' }}>
          <InputArea incognito={incognito} />
        </div>

        {/* Connect Now banner */}
        {!bannerDismissed && (
          <div
            style={{
              alignItems: 'center',
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 16,
              display: 'flex',
              gap: 12,
              justifyContent: 'space-between',
              marginTop: 20,
              maxWidth: 760,
              padding: '14px 20px',
              width: 'calc(100% - 48px)',
            }}
          >
            <div style={{ alignItems: 'center', display: 'flex', gap: 6, flexShrink: 0 }}>
              <Telegram.Color size={26} />
              <Slack.Color size={26} />
              <Discord.Color size={26} />
            </div>
            <div style={{ flex: 1, paddingInline: 12 }}>
              <div style={{ color: '#111', fontSize: 14, fontWeight: 600 }}>Connect Now</div>
              <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12, marginTop: 2 }}>
                Connect Fi to Telegram, Slack, Discord and more
              </div>
            </div>
            <div style={{ alignItems: 'center', display: 'flex', flexShrink: 0, gap: 10 }}>
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
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '7px 20px',
                }}
              >
                Connect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Home;
