'use client';
import { Discord, Slack, Telegram } from '@lobehub/ui/icons';
import { memo, useCallback, useEffect, useState } from 'react';
import InputArea from './InputArea';

const INCOGNITO_KEY = 'fi-incognito-mode';

const IncognitoIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 4.5L7 9h3.5v1.5H9A2.5 2.5 0 006.5 13 2.5 2.5 0 009 15.5h6A2.5 2.5 0 0017.5 13 2.5 2.5 0 0015 10.5h-1.5V9H17l-5-4.5z"
      fill={active ? '#111' : 'rgba(0,0,0,0.32)'}
    />
    <circle cx="9.5" cy="13" r="1" fill="#f9f8f7" />
    <circle cx="14.5" cy="13" r="1" fill="#f9f8f7" />
  </svg>
);

const Home = memo(() => {
  const [incognito, setIncognito] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(INCOGNITO_KEY) === 'true') setIncognito(true);
  }, []);

  const toggleIncognito = useCallback(() => {
    setIncognito((prev) => {
      const next = !prev;
      localStorage.setItem(INCOGNITO_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <div style={{
      background: '#f9f8f7',
      bottom: 0, left: 0, position: 'absolute', right: 0, top: 0,
    }}>
      {/* Incognito icon top right */}
      <button
        onClick={toggleIncognito}
        title={incognito ? 'Incognito on' : 'Incognito mode'}
        style={{
          alignItems: 'center',
          background: incognito ? 'rgba(0,0,0,0.08)' : 'transparent',
          border: 'none', borderRadius: 8, cursor: 'pointer',
          display: 'flex', padding: 7,
          position: 'absolute', right: 20, top: 16, zIndex: 10,
        }}
      >
        <IncognitoIcon active={incognito} />
      </button>

      {/* Centered content */}
      <div style={{
        alignItems: 'center', display: 'flex', flexDirection: 'column',
        height: '100%', justifyContent: 'center', paddingBottom: 60, width: '100%',
      }}>
        {/* Fi logo */}
        <div style={{
          color: '#111', fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 60, fontWeight: 700, letterSpacing: '-2px',
          marginBottom: 32, textAlign: 'center', userSelect: 'none',
        }}>Fi</div>

        {/* Input — Grok width */}
        <div style={{ width: '100%', maxWidth: 780, paddingInline: 20 }}>
          <InputArea incognito={incognito} />
        </div>

        {/* Connect Now banner */}
        {!bannerDismissed && (
          <div style={{
            alignItems: 'center', background: '#fff',
            border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16,
            display: 'flex', gap: 12, justifyContent: 'space-between',
            marginTop: 16, maxWidth: 780,
            padding: '12px 18px', width: 'calc(100% - 40px)',
          }}>
            <div style={{ alignItems: 'center', display: 'flex', gap: 6, flexShrink: 0 }}>
              <Telegram.Color size={24} />
              <Slack.Color size={24} />
              <Discord.Color size={24} />
            </div>
            <div style={{ flex: 1, paddingInline: 12 }}>
              <div style={{ color: '#111', fontSize: 13, fontWeight: 600 }}>Connect Now</div>
              <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12, marginTop: 1 }}>
                Connect Fi to Telegram, Slack, Discord and more
              </div>
            </div>
            <div style={{ alignItems: 'center', display: 'flex', flexShrink: 0, gap: 8 }}>
              <button onClick={() => setBannerDismissed(true)} style={{
                background: 'transparent', border: 'none',
                color: 'rgba(0,0,0,0.4)', cursor: 'pointer',
                fontSize: 13, fontWeight: 500, padding: '4px 8px',
              }}>Dismiss</button>
              <button onClick={() => (window.location.href = '/settings/messenger')} style={{
                background: '#111', border: 'none', borderRadius: 20,
                color: '#fff', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, padding: '6px 18px',
              }}>Connect</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Home;
