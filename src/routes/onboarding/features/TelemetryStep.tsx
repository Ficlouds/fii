'use client';

import { memo, useCallback, useRef, useState } from 'react';
import { useUserStore } from '@/store/user';

interface TelemetryStepProps {
  onNext: () => void;
}

const TelemetryStep = memo<TelemetryStepProps>(({ onNext }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [telemetry, setTelemetry] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = useRef(false);
  const updateGeneralConfig = useUserStore((s) => s.updateGeneralConfig);

  const handleStart = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsNavigating(true);
    updateGeneralConfig({ telemetry });
    onNext();
  }, [updateGeneralConfig, onNext, telemetry]);

  const canProceed = termsAccepted && privacyAccepted;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '48px 24px',
      fontFamily: 'Inter, system-ui, sans-serif',
      background: '#fff',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: '-2.5px',
            color: '#000',
            lineHeight: 1,
            marginBottom: 20,
          }}>
            Fi
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#000', marginBottom: 10, letterSpacing: '-0.5px' }}>
            Welcome
          </div>
          <div style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>
            Before you continue, please review our terms and privacy policy.
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#f0f0f0', marginBottom: 32 }} />

        {/* Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
          {[
            {
              checked: termsAccepted,
              onChange: setTermsAccepted,
              text: 'I agree to the ',
              linkText: 'Terms of Service',
              href: '/terms',
              required: true,
            },
            {
              checked: privacyAccepted,
              onChange: setPrivacyAccepted,
              text: 'I accept the ',
              linkText: 'Privacy Policy',
              href: '/privacy',
              required: true,
            },
            {
              checked: telemetry,
              onChange: setTelemetry,
              text: 'Share anonymous usage data to help improve Fi',
              linkText: '',
              href: '',
              required: false,
            },
          ].map((item, i) => (
            <label key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              cursor: 'pointer',
            }}>
              <div style={{ position: 'relative', flexShrink: 0, marginTop: 1 }}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.onChange(e.target.checked)}
                  style={{ opacity: 0, position: 'absolute', width: 18, height: 18, cursor: 'pointer', margin: 0 }}
                />
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: item.checked ? '2px solid #000' : '2px solid #d0d0d0',
                  background: item.checked ? '#000' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {item.checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 14, color: '#333', lineHeight: 1.5 }}>
                {item.text}
                {item.linkText && (
                  <a href={item.href} style={{ color: '#000', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                    {item.linkText}
                  </a>
                )}
              </span>
            </label>
          ))}
        </div>

        {/* Button */}
        <button
          disabled={!canProceed || isNavigating}
          onClick={handleStart}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: canProceed ? '#000' : '#e8e8e8',
            color: canProceed ? '#fff' : '#aaa',
            border: 'none',
            borderRadius: 100,
            fontSize: 15,
            fontWeight: 600,
            cursor: canProceed ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '-0.2px',
          }}
        >
          {isNavigating ? 'Getting started...' : 'Continue'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 16 }}>
          You must accept the Terms and Privacy Policy to use Fi
        </div>
      </div>
    </div>
  );
});

TelemetryStep.displayName = 'TelemetryStep';
export default TelemetryStep;
