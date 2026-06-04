'use client';
import { Discord, Slack, Telegram } from '@lobehub/ui/icons';
import { EyeOffIcon } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';
import InputArea from './InputArea';

const INCOGNITO_KEY = 'fi-incognito-mode';
const CONNECT_DISMISSED_KEY = 'fi-connect-banner-dismissed';

const PLATFORMS = [
  { id: 'telegram', label: 'Telegram', icon: <Telegram.Color size={28} /> },
  { id: 'slack', label: 'Slack', icon: <Slack.Color size={28} /> },
  { id: 'discord', label: 'Discord', icon: <Discord.Color size={28} /> },
];

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
  const fgSub = incognito ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
  const borderColor = incognito ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const inputBg = incognito ? '#1a1a1a' : '#f9f8f7';
  const inputBorder = incognito ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';

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
          marginBottom: 28,
          transition: 'color 0.3s ease',
          userSelect: 'none',
        }}
      >
        Fi
      </div>

      {/* Input wrapper — incognito overrides background via inline style on wrapper */}
      <div
        style={{
          maxWidth: 680,
          padding: '0 16px',
          width: '100%',
        }}
      >
        <div
          style={{
            background: inputBg,
            border: `1px solid ${inputBorder}`,
            borderRadius: 28,
            boxShadow: incognito ? '0 1px 6px rgba(0,0,0,0.4)' : '0 1px 6px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}
        >
          <InputArea incognito={incognito} inputBg={inputBg} fg={fg} fgSub={fgSub} />
        </div>

        {/* Below input: incognito icon only */}
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 6,
            justifyContent: 'center',
            marginTop: 10,
          }}
        >
          <button
            onClick={toggleIncognito}
            title={incognito ? 'Incognito on — history & memory paused' : 'Enable incognito mode'}
            style={{
              alignItems: 'center',
              background: incognito ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: 'none',
              borderRadius: 20,
              color: incognito ? '#fff' : fgSub,
              cursor: 'pointer',
              display: 'flex',
              fontSize: 11,
              fontWeight: 500,
              gap: 4,
              padding: '3px 10px',
              transition: 'all 0.15s',
            }}
          >
            <EyeOffIcon size={13} />
            {incognito ? 'Incognito on' : 'Incognito'}
          </button>
        </div>
      </div>

      {/* Connect banner — LobeChat style */}
      {!bannerDismissed && (
        <div
          style={{
            background: incognito ? '#111' : '#fff',
            border: `1px solid ${borderColor}`,
            borderRadius: 14,
            marginTop: 20,
            maxWidth: 680,
            padding: '12px 16px',
            width: 'calc(100% - 32px)',
          }}
        >
          {/* Banner header row */}
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 16 }}>📡</span>
              <span style={{ color: fg, fontSize: 13, fontWeight: 600 }}>
                Connect your Bot Channel
              </span>
            </div>
            <button
              onClick={dismissBanner}
              style={{
                background: 'transparent',
                border: 'none',
                color: fgSub,
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
                padding: '0 2px',
              }}
            >
              ×
            </button>
          </div>

          {/* Platform icons row */}
          <div style={{ alignItems: 'center', display: 'flex', gap: 10, marginBottom: 12 }}>
            {PLATFORMS.map((p) => (
              <div
                key={p.id}
                title={p.label}
                onClick={() => (window.location.href = '/settings/messenger')}
                style={{
                  alignItems: 'center',
                  background: incognito ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${borderColor}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: '8px 12px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = incognito
                    ? 'rgba(255,255,255,0.10)'
                    : 'rgba(0,0,0,0.07)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = incognito
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.04)')
                }
              >
                {p.icon}
                <span style={{ color: fgSub, fontSize: 11 }}>{p.label}</span>
              </div>
            ))}
            <div
              onClick={() => (window.location.href = '/settings/messenger')}
              style={{
                alignItems: 'center',
                background: 'transparent',
                border: `1px dashed ${borderColor}`,
                borderRadius: 10,
                color: fgSub,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                fontSize: 11,
                gap: 4,
                padding: '8px 12px',
              }}
            >
              <span style={{ fontSize: 20 }}>+</span>
              <span>More</span>
            </div>
          </div>

          {/* CTA */}
          <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: fgSub, fontSize: 12 }}>
              Deploy Fi across Telegram, Slack, Discord and more
            </span>
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
                padding: '5px 16px',
              }}
            >
              Set up
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default Home;
