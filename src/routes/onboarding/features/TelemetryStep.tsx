'use client';

import { Button, Flexbox } from '@lobehub/ui';
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
    <Flexbox gap={32} style={{ maxWidth: 480, width: '100%', margin: '0 auto' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 48,
          fontWeight: 800,
          letterSpacing: '-2px',
          fontFamily: 'Inter, system-ui, sans-serif',
          marginBottom: 8,
        }}>
          Fi
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 8 }}>
          Welcome to Fi
        </div>
        <div style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>
          Your intelligent AI assistant. Before you get started,<br />
          please review and accept our policies.
        </div>
      </div>

      {/* Feature highlights */}
      <div style={{
        background: '#f9f8f7',
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        {[
          { icon: '⚡', title: 'Powerful AI', desc: 'Access cutting-edge AI models for any task' },
          { icon: '🔒', title: 'Private & Secure', desc: 'Your conversations are encrypted and private' },
          { icon: '🎯', title: 'Built for You', desc: 'Fi learns and adapts to your workflow' },
        ].map((item) => (
          <div key={item.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{item.title}</div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Checkboxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          {
            checked: termsAccepted,
            onChange: setTermsAccepted,
            label: 'I agree to the',
            link: 'Terms of Service',
            href: '/terms',
            required: true,
          },
          {
            checked: privacyAccepted,
            onChange: setPrivacyAccepted,
            label: 'I have read and accept the',
            link: 'Privacy Policy',
            href: '/privacy',
            required: true,
          },
          {
            checked: telemetry,
            onChange: setTelemetry,
            label: 'Help improve Fi by sharing anonymous usage data',
            link: '',
            href: '',
            required: false,
          },
        ].map((item, i) => (
          <label key={i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            cursor: 'pointer',
            fontSize: 14,
            color: '#333',
            lineHeight: 1.5,
          }}>
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => item.onChange(e.target.checked)}
              style={{
                width: 16,
                height: 16,
                marginTop: 2,
                flexShrink: 0,
                accentColor: '#000',
                cursor: 'pointer',
              }}
            />
            <span>
              {item.label}{' '}
              {item.link && (
                <a href={item.href} style={{ color: '#000', fontWeight: 600, textDecoration: 'underline' }}>
                  {item.link}
                </a>
              )}
              {item.required && <span style={{ color: '#e05c5c', marginLeft: 2 }}>*</span>}
            </span>
          </label>
        ))}
      </div>

      {/* CTA Button */}
      <div>
        <button
          disabled={!canProceed || isNavigating}
          onClick={handleStart}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: canProceed ? '#000' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 600,
            cursor: canProceed ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {isNavigating ? 'Getting started...' : 'Get Started with Fi'}
        </button>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#999', marginTop: 12 }}>
          * Required to use Fi
        </div>
      </div>
    </Flexbox>
  );
});

TelemetryStep.displayName = 'TelemetryStep';
export default TelemetryStep;
