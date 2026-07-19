'use client';

import { memo, useEffect, useState } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'fi_cookie_consent';

type CookieSettings = {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
};

const defaultSettings: CookieSettings = {
  essential: true,
  analytics: false,
  preferences: false,
};

const CookieConsent = memo(() => {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>(defaultSettings);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const save = (s: CookieSettings) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(s));
    // Wire to PostHog consent
    if (typeof window !== 'undefined' && (window as any).posthog) {
      if (s.analytics) {
        (window as any).posthog.opt_in_capturing();
      } else {
        (window as any).posthog.opt_out_capturing();
      }
    }
    setVisible(false);
  };

  const acceptAll = () => save({ essential: true, analytics: true, preferences: true });
  const rejectAll = () => save({ essential: true, analytics: false, preferences: false });
  const saveCustom = () => save(settings);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 0 24px',
      fontFamily: 'Manrope, -apple-system, sans-serif',
    }}>
      <div style={{
        width: 'calc(100% - 48px)', maxWidth: 560,
        background: '#fff', borderRadius: 20,
        padding: '28px 28px 24px',
        boxShadow: '0 8px 48px rgba(0,0,0,0.15)',
      }}>

        {!showCustomize ? (
          <>
            {/* Main banner */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
                Fi uses cookies
              </p>
              <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.6 }}>
                We use cookies to keep you signed in, remember your preferences, and understand how Fi is used.
                {' '}<Link href="/privacy" style={{ color: '#111', textDecoration: 'underline', fontSize: 13 }}>Privacy Policy</Link>
                {' '}and{' '}
                <Link href="/terms" style={{ color: '#111', textDecoration: 'underline', fontSize: 13 }}>Terms of Service</Link>.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={acceptAll}
                style={{
                  flex: 1, height: 42, borderRadius: 10, border: 'none',
                  background: '#111', color: '#fff', fontSize: 14,
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                  minWidth: 120,
                }}
              >
                Accept all
              </button>
              <button
                onClick={rejectAll}
                style={{
                  flex: 1, height: 42, borderRadius: 10,
                  border: '1px solid rgba(0,0,0,0.15)',
                  background: '#fff', color: '#111', fontSize: 14,
                  fontWeight: 500, cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                  minWidth: 120,
                }}
              >
                Reject all
              </button>
              <button
                onClick={() => setShowCustomize(true)}
                style={{
                  flex: 1, height: 42, borderRadius: 10,
                  border: '1px solid rgba(0,0,0,0.15)',
                  background: '#fff', color: '#111', fontSize: 14,
                  fontWeight: 500, cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                  minWidth: 120,
                }}
              >
                Customize
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Customize panel */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
                Cookie preferences
              </p>
              <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
                Choose which cookies Fi can use.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>

              {/* Essential */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f9f9f9', borderRadius: 12 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 2px' }}>Essential</p>
                  <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Sign in, security, core features. Always on.</p>
                </div>
                <div style={{ width: 36, height: 20, borderRadius: 20, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 3px', opacity: 0.5, cursor: 'not-allowed' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff' }} />
                </div>
              </div>

              {/* Analytics */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f9f9f9', borderRadius: 12 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 2px' }}>Analytics</p>
                  <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Helps us understand how Fi is used to improve it.</p>
                </div>
                <div
                  onClick={() => setSettings(s => ({ ...s, analytics: !s.analytics }))}
                  style={{ width: 36, height: 20, borderRadius: 20, background: settings.analytics ? '#111' : '#ddd', display: 'flex', alignItems: 'center', justifyContent: settings.analytics ? 'flex-end' : 'flex-start', padding: '0 3px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff' }} />
                </div>
              </div>

              {/* Preferences */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f9f9f9', borderRadius: 12 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 2px' }}>Preferences</p>
                  <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Remembers your theme, language, and settings.</p>
                </div>
                <div
                  onClick={() => setSettings(s => ({ ...s, preferences: !s.preferences }))}
                  style={{ width: 36, height: 20, borderRadius: 20, background: settings.preferences ? '#111' : '#ddd', display: 'flex', alignItems: 'center', justifyContent: settings.preferences ? 'flex-end' : 'flex-start', padding: '0 3px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff' }} />
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowCustomize(false)}
                style={{
                  height: 42, padding: '0 20px', borderRadius: 10,
                  border: '1px solid rgba(0,0,0,0.15)',
                  background: '#fff', color: '#111', fontSize: 14,
                  fontWeight: 500, cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                }}
              >
                Back
              </button>
              <button
                onClick={saveCustom}
                style={{
                  flex: 1, height: 42, borderRadius: 10, border: 'none',
                  background: '#111', color: '#fff', fontSize: 14,
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                }}
              >
                Save preferences
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

CookieConsent.displayName = 'CookieConsent';
export default CookieConsent;
