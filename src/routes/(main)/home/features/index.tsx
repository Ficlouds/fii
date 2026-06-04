'use client';
import { Discord, Slack, Telegram } from '@lobehub/ui/icons';
import { memo, useCallback, useEffect, useState } from 'react';
import InputArea from './InputArea';

const INCOGNITO_KEY = 'fi-incognito-mode';
const MAX_WIDTH = 860;

const IncognitoIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 4.5L7 9h3.5v1.5H9A2.5 2.5 0 006.5 13 2.5 2.5 0 009 15.5h6A2.5 2.5 0 0017.5 13 2.5 2.5 0 0015 10.5h-1.5V9H17l-5-4.5z"
      fill={active ? '#111' : 'rgba(0,0,0,0.32)'} />
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
      window.dispatchEvent(new Event('storage'));
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

      {/* Content — positioned at 40% from top (slightly above center like Grok) */}
      <div style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        left: 0,
        position: 'absolute',
        right: 0,
        top: '38%',
        transform: 'translateY(-50%)',
      }}>
        {/* Fi logo */}
        <div style={{
          color: '#111',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: '-3px',
          marginBottom: 36,
          textAlign: 'center',
          userSelect: 'none',
        }}>Fi</div>

        {/* Input pill */}
        <div style={{ width: '100%', maxWidth: MAX_WIDTH, paddingInline: 20 }}>
          <InputArea incognito={incognito} />
        </div>

        {/* Connect Now — sleek pill design */}
        {!bannerDismissed && (
          <div style={{
            alignItems: 'center',
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 32,
            display: 'flex',
            gap: 0,
            justifyContent: 'space-between',
            marginTop: 12,
            maxWidth: MAX_WIDTH,
            padding: '10px 10px 10px 16px',
            width: 'calc(100% - 40px)',
          }}>
            {/* Left: icons + text */}
            <div style={{ alignItems: 'center', display: 'flex', gap: 10, flex: 1 }}>
              <div style={{ alignItems: 'center', display: 'flex', gap: 4, flexShrink: 0 }}>
                <Telegram.Color size={20} />
                <Slack.Color size={20} />
                <Discord.Color size={20} />
              </div>
              <span style={{ color: 'rgba(0,0,0,0.55)', fontSize: 13 }}>
                Connect Fi to <strong style={{ color: '#111', fontWeight: 600 }}>Telegram, Slack, Discord</strong> and deploy your AI everywhere
              </span>
            </div>
            {/* Right: dismiss + connect pill */}
            <div style={{ alignItems: 'center', display: 'flex', flexShrink: 0, gap: 4 }}>
              <button onClick={() => setBannerDismissed(true)} style={{
                background: 'transparent', border: 'none',
                color: 'rgba(0,0,0,0.35)', cursor: 'pointer',
                fontSize: 12, padding: '6px 10px',
                borderRadius: 20,
              }}>Dismiss</button>
              <button onClick={() => (window.location.href = '/settings/messenger')} style={{
                alignItems: 'center',
                background: '#111',
                border: 'none',
                borderRadius: 20,
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                fontSize: 13,
                fontWeight: 600,
                gap: 4,
                padding: '8px 18px',
              }}>
                Connect →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Home;
