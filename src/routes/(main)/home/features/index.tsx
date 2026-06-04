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

  const bg = incognito ? '#0a0a0a' : '#f9f8f7';
  const fg = incognito ? '#fff' : '#111';
  const fgSub = incognito ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.38)';
  const inputBg = incognito ? '#141414' : '#f9f8f7';
  const inputBorder = incognito ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)';

  return (
    <div
      style={{
        alignItems: 'center',
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh',
        transition: 'background 0.3s ease',
        width: '100%',
      }}
    >
      {/* Fi logo */}
      <div
        style={{
          color: fg,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: '-2px',
          marginBottom: 24,
          transition: 'color 0.3s ease',
          userSelect: 'none',
        }}
      >
        Fi
      </div>

      {/* Input — flat, no card, no shadow, no border-radius wrapper */}
      <div style={{ maxWidth: 680, width: '100%', padding: '0 16px' }}>
        <div
          style={{
            background: inputBg,
            border: `1.5px solid ${inputBorder}`,
            borderRadius: 16,
            transition: 'all 0.3s ease',
          }}
        >
          <InputArea incognito={incognito} inputBg={inputBg} fg={fg} fgSub={fgSub} />
        </div>

        {/* Incognito toggle — icon + minimal label */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <button
            onClick={toggleIncognito}
            title={incognito ? 'Incognito on' : 'Incognito mode'}
            style={{
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: 20,
              color: incognito ? 'rgba(255,255,255,0.5)' : fgSub,
              cursor: 'pointer',
              display: 'flex',
              fontSize: 11,
              fontWeight: 500,
              gap: 4,
              padding: '3px 8px',
            }}
          >
            <EyeOffIcon size={12} />
            {incognito ? 'Incognito on' : 'Incognito'}
          </button>
        </div>
      </div>

      {/* Connect Now banner — exactly like Grok "Connectors are now available" */}
      {!bannerDismissed && (
        <div
          style={{
            alignItems: 'center',
            background: incognito ? '#1a1a1a' : '#fff',
            border: `1px solid ${incognito ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: 14,
            display: 'flex',
            gap: 12,
            justifyContent: 'space-between',
            marginTop: 16,
            maxWidth: 680,
            padding: '10px 14px',
            width: 'calc(100% - 32px)',
          }}
        >
          {/* Left: platform icons */}
          <div style={{ alignItems: 'center', display: 'flex', gap: 4, flexShrink: 0 }}>
            <Telegram.Color size={22} />
            <Slack.Color size={22} />
            <Discord.Color size={22} />
          </div>

          {/* Center: text */}
          <div style={{ flex: 1, paddingInline: 8 }}>
            <div style={{ color: fg, fontSize: 13, fontWeight: 600 }}>
              Connect Now
            </div>
            <div style={{ color: fgSub, fontSize: 12, marginTop: 1 }}>
              Connect Fi to Telegram, Slack, Discord and more
            </div>
          </div>

          {/* Right: dismiss + connect */}
          <div style={{ alignItems: 'center', display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={dismissBanner}
              style={{
                background: 'transparent',
                border: 'none',
                color: fgSub,
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
                background: incognito ? '#fff' : '#111',
                border: 'none',
                borderRadius: 20,
                color: incognito ? '#111' : '#fff',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 16px',
                whiteSpace: 'nowrap',
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
