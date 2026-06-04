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

/* ═══════════════════════════════════════════════
   CONNECT BAR — 5 options, uncomment to switch
   ═══════════════════════════════════════════════ */

// OPTION 1 — Borderless floating (no box)
const GmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M4 4h16v16H4V4z" fill="white"/>
    <path d="M4 4l8 7 8-7" stroke="#EA4335" strokeWidth="1.5"/>
    <path d="M4 4v16h3.5V9.5L12 13l4.5-3.5V20H20V4" fill="#4285F4"/>
    <path d="M4 4v16h3.5V9.5L12 13l4.5-3.5V20H20V4H4z" fill="none"/>
    <path d="M4 20V4l8 7 8-7v16" fill="none" stroke="none"/>
    <rect x="4" y="4" width="16" height="16" fill="none"/>
    <path d="M4 6.5L12 12l8-5.5V20H4V6.5z" fill="#fff"/>
    <path d="M4 4l8 6.5L20 4H4z" fill="#EA4335"/>
    <path d="M4 4v2.5L12 12l8-5.5V4H4z" fill="#EA4335"/>
    <path d="M4 6.5V20h3.2V10.2L12 13.5l4.8-3.3V20H20V6.5L12 12 4 6.5z" fill="#4285F4"/>
  </svg>
);
const DriveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M4.5 19.5l2.25-3.9h10.5l2.25 3.9H4.5z" fill="#0066DA"/>
    <path d="M8.25 4.5L3 13.5l2.25 3.9L10.5 8.4 8.25 4.5z" fill="#00AC47"/>
    <path d="M15.75 4.5H8.25l2.25 3.9h5.25L18 4.5h-2.25z" fill="#FFBA00"/>
    <path d="M13.5 8.4L18 16.5l-2.25 3-5.25-9.06L13.5 8.4z" fill="#EA4335"/>
    <path d="M18 16.5H6.75l-1.5 3h13.5L18 16.5z" fill="#00832D"/>
    <path d="M5.25 16.5L10.5 8.4 8.25 4.5 3 13.5l2.25 3z" fill="#2DA94F"/>
  </svg>
);

const ConnectOption1 = ({ onDismiss }: { onDismiss: () => void }) => (
  <div style={{ alignItems: 'center', display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, width: '100%', maxWidth: MAX_WIDTH, paddingInline: 20, flexWrap: 'wrap' }}>
    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
      <Telegram.Color size={20} />
      <Slack.Color size={20} />
      <Discord.Color size={20} />
      <GmailIcon />
      <DriveIcon />
    </div>
    <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 13 }}>Connect Fi to your channels & apps</span>
    <button onClick={() => window.location.href = '/settings/messenger'} style={{ background: 'none', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 20, color: '#111', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '5px 16px' }}>Connect →</button>
    <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.3)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
  </div>
);

// OPTION 2 — Thin underline bar
const ConnectOption2 = ({ onDismiss }: { onDismiss: () => void }) => (
  <div style={{ alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 16, maxWidth: MAX_WIDTH, paddingBlock: 12, paddingInline: 4, width: 'calc(100% - 40px)' }}>
    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
      <Telegram.Color size={16} /><Slack.Color size={16} /><Discord.Color size={16} />
      <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: 12 }}>Deploy Fi on Telegram, Slack, Discord</span>
    </div>
    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
      <button onClick={() => window.location.href = '/settings/messenger'} style={{ background: '#111', border: 'none', borderRadius: 16, color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: '4px 12px' }}>Set up</button>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.25)', cursor: 'pointer', fontSize: 16 }}>×</button>
    </div>
  </div>
);

// OPTION 3 — Frosted glass pill (DEFAULT)
const ConnectOption3 = ({ onDismiss }: { onDismiss: () => void }) => (
  <div style={{ alignItems: 'center', backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 10, maxWidth: MAX_WIDTH, padding: '10px 10px 10px 18px', width: 'calc(100% - 40px)' }}>
    <div style={{ alignItems: 'center', display: 'flex', gap: 8, flex: 1 }}>
      <Telegram.Color size={20} /><Slack.Color size={20} /><Discord.Color size={20} />
      <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: 13 }}>Connect Fi to <b style={{ color: '#111' }}>Telegram, Slack, Discord</b> and more</span>
    </div>
    <div style={{ alignItems: 'center', display: 'flex', gap: 4, flexShrink: 0 }}>
      <button onClick={onDismiss} style={{ background: 'transparent', border: 'none', borderRadius: 20, color: 'rgba(0,0,0,0.35)', cursor: 'pointer', fontSize: 12, padding: '6px 10px' }}>Dismiss</button>
      <button onClick={() => window.location.href = '/settings/messenger'} style={{ background: '#111', border: 'none', borderRadius: 20, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 18px' }}>Connect →</button>
    </div>
  </div>
);

// OPTION 4 — Icon strip only (ultra minimal)
const ConnectOption4 = ({ onDismiss }: { onDismiss: () => void }) => (
  <div style={{ alignItems: 'center', display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
    {[{ icon: <Telegram.Color size={28} />, label: 'Telegram' }, { icon: <Slack.Color size={28} />, label: 'Slack' }, { icon: <Discord.Color size={28} />, label: 'Discord' }].map((p) => (
      <button key={p.label} onClick={() => window.location.href = '/settings/messenger'} style={{ alignItems: 'center', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 16px', transition: 'background 0.15s' }} title={`Connect ${p.label}`}>
        {p.icon}
        <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 11 }}>{p.label}</span>
      </button>
    ))}
    <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.2)', cursor: 'pointer', fontSize: 18, marginLeft: 4 }}>×</button>
  </div>
);

// OPTION 5 — Dark accent bar (inverted)
const ConnectOption5 = ({ onDismiss }: { onDismiss: () => void }) => (
  <div style={{ alignItems: 'center', background: '#111', borderRadius: 32, display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 10, maxWidth: MAX_WIDTH, padding: '10px 10px 10px 18px', width: 'calc(100% - 40px)' }}>
    <div style={{ alignItems: 'center', display: 'flex', gap: 8, flex: 1 }}>
      <Telegram.Color size={20} /><Slack.Color size={20} /><Discord.Color size={20} />
      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Deploy Fi on <b style={{ color: '#fff' }}>Telegram, Slack, Discord</b></span>
    </div>
    <div style={{ alignItems: 'center', display: 'flex', gap: 4, flexShrink: 0 }}>
      <button onClick={onDismiss} style={{ background: 'transparent', border: 'none', borderRadius: 20, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12, padding: '6px 10px' }}>Dismiss</button>
      <button onClick={() => window.location.href = '/settings/messenger'} style={{ background: '#fff', border: 'none', borderRadius: 20, color: '#111', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 18px' }}>Connect →</button>
    </div>
  </div>
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
    <div style={{ background: '#f9f8f7', bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}>
      {/* Incognito icon top right */}
      <button onClick={toggleIncognito} title={incognito ? 'Incognito on' : 'Incognito mode'}
        style={{ alignItems: 'center', background: incognito ? 'rgba(0,0,0,0.08)' : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', padding: 7, position: 'absolute', right: 20, top: 16, zIndex: 10 }}>
        <IncognitoIcon active={incognito} />
      </button>

      {/* Content at 40% from top */}
      <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', left: 0, position: 'absolute', right: 0, top: '40%', transform: 'translateY(-50%)' }}>
        {/* Fi logo */}
        <div style={{ color: '#111', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 64, fontWeight: 700, letterSpacing: '-3px', marginBottom: 36, textAlign: 'center', userSelect: 'none' }}>Fi</div>

        {/* Input */}
        <div style={{ width: '100%', maxWidth: MAX_WIDTH, paddingInline: 20 }}>
          <InputArea incognito={incognito} />
        </div>

        {/* Connect bar — change ConnectOption3 to any option 1-5 */}
        {!bannerDismissed && <ConnectOption5 onDismiss={() => setBannerDismissed(true)} />}
      </div>
    </div>
  );
});

export default Home;
