'use client';
import { memo, useCallback, useEffect, useState } from 'react';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';
import InputArea from './InputArea';

const INCOGNITO_KEY = 'fi-incognito-mode';

const Home = memo(() => {
  const isLogin = useUserStore(authSelectors.isLogin);
  const [incognito, setIncognito] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(INCOGNITO_KEY);
    if (saved === 'true') setIncognito(true);
  }, []);

  const toggleIncognito = useCallback(() => {
    setIncognito((prev) => {
      const next = !prev;
      localStorage.setItem(INCOGNITO_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        background: incognito ? '#0a0a0a' : undefined,
        transition: 'background 0.3s ease',
      }}
    >
      {/* Share button top right */}
      <div style={{ position: 'absolute', top: 16, right: 20 }}>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
          }}
          style={{
            alignItems: 'center',
            background: 'transparent',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 20,
            color: incognito ? '#fff' : '#111',
            cursor: 'pointer',
            display: 'flex',
            fontSize: 13,
            fontWeight: 500,
            gap: 6,
            padding: '5px 14px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Share
        </button>
      </div>

      {/* Fi logo */}
      <div
        style={{
          color: incognito ? '#fff' : '#111',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 60,
          fontWeight: 700,
          letterSpacing: '-2px',
          marginBottom: 32,
          transition: 'color 0.3s ease',
          userSelect: 'none',
        }}
      >
        {incognito ? '🕵️ Fi' : 'Fi'}
      </div>

      {/* Input */}
      <div style={{ width: '100%', maxWidth: 680, padding: '0 16px' }}>
        <InputArea incognito={incognito} />
      </div>

      {/* Incognito toggle */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={toggleIncognito}
          style={{
            alignItems: 'center',
            background: incognito ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: 'none',
            borderRadius: 20,
            color: incognito ? '#aaa' : 'rgba(0,0,0,0.35)',
            cursor: 'pointer',
            display: 'flex',
            fontSize: 12,
            fontWeight: 500,
            gap: 5,
            padding: '4px 12px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = incognito ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = incognito ? 'rgba(255,255,255,0.08)' : 'transparent')}
        >
          <svg fill="none" height="13" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="13">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {incognito ? 'Incognito on — history & memory off' : 'Incognito mode'}
        </button>
      </div>

      {/* Bot Channel banner — like Grok connectors */}
      <div
        style={{
          alignItems: 'center',
          background: incognito ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${incognito ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
          borderRadius: 14,
          display: 'flex',
          gap: 12,
          justifyContent: 'space-between',
          marginTop: 24,
          maxWidth: 680,
          padding: '12px 16px',
          width: 'calc(100% - 32px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 20 }}>🤖</div>
          <div>
            <div style={{ color: incognito ? '#fff' : '#111', fontSize: 13, fontWeight: 600 }}>
              Create your own Bot Channel
            </div>
            <div style={{ color: incognito ? '#888' : 'rgba(0,0,0,0.45)', fontSize: 12, marginTop: 1 }}>
              Build and deploy custom AI agents on any platform
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            style={{
              background: 'transparent',
              border: `1px solid ${incognito ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
              borderRadius: 20,
              color: incognito ? '#aaa' : 'rgba(0,0,0,0.45)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              padding: '4px 12px',
            }}
            onClick={() => {}}
          >
            Dismiss
          </button>
          <button
            style={{
              background: incognito ? '#fff' : '#111',
              border: 'none',
              borderRadius: 20,
              color: incognito ? '#111' : '#fff',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 14px',
            }}
            onClick={() => window.location.href = '/settings/advanced'}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
});

export default Home;
