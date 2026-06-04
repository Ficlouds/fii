'use client';
import { Discord, Slack, Telegram } from '@lobehub/ui/icons';
import { memo, useCallback, useEffect, useState } from 'react';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';
import InputArea from './InputArea';

const INCOGNITO_KEY = 'fi-incognito-mode';
const CONNECT_DISMISSED_KEY = 'fi-connect-banner-dismissed';

// Google Incognito SVG icon
const IncognitoIcon = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill={color} opacity="0" />
    <path d="M17.06 9.94C16.5 8.77 15.35 8 14 8c-.74 0-1.4.25-1.96.64L14 10.59V13h-2.59l-4-4 .01-.01C6.56 9.74 6 10.8 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-.76-.15-1.48-.41-2.14l-.53.08zM12 7l-3-3h2V2h2v2h2l-3 3z" fill={color} opacity="0"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 4.5L8.5 8H10v1.5c-.83 0-1.5.67-1.5 1.5S9.17 12.5 10 12.5h4c.83 0 1.5-.67 1.5-1.5S14.83 9.5 14 9.5V8h1.5L12 4.5zM10.75 9.5h2.5V8h-2.5v1.5z" fill={color} opacity="0"/>
    <g>
      <path d="M12 3L8 8h2v1c-1.1 0-2 .9-2 2s.9 2 2 2h4c1.1 0 2-.9 2-2s-.9-2-2-2V8h2l-4-5z" fill={color}/>
      <circle cx="10" cy="11" r="0.75" fill={color === 'currentColor' ? '#f9f8f7' : '#1c1c1e'}/>
      <circle cx="14" cy="11" r="0.75" fill={color === 'currentColor' ? '#f9f8f7' : '#1c1c1e'}/>
    </g>
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
      {/* Incognito icon — top right, Google incognito style */}
      <button
        onClick={toggleIncognito}
        title={incognito ? 'Incognito on — click to disable' : 'Enable incognito mode'}
        style={{
          alignItems: 'center',
          background: incognito ? 'rgba(0,0,0,0.10)' : 'transparent',
          border: 'none',
          borderRadius: 8,
          color: incognito ? '#111' : 'rgba(0,0,0,0.32)',
          cursor: 'pointer',
          display: 'flex',
          padding: 7,
          position: 'absolute',
          right: 20,
          top: 16,
          transition: 'all 0.15s',
        }}
      >
        <IncognitoIcon size={20} color={incognito ? '#111' : 'rgba(0,0,0,0.32)'} />
      </button>

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

      {/* Input — centered, wider */}
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
  );
});

export default Home;
