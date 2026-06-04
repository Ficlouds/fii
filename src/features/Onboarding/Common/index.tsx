'use client';

import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/user';

const ROLES = [
  'Software Engineer', 'Product Manager', 'Designer', 'Data Scientist',
  'Marketing', 'Sales', 'Finance', 'Operations', 'Student', 'Other',
];

const CommonOnboardingPage = memo(() => {
  const [step, setStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [telemetry, setTelemetry] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();
  const updateGeneralConfig = useUserStore((s) => s.updateGeneralConfig);
  const setOnboardingStep = useUserStore((s) => s.setOnboardingStep);

  const finish = useCallback(async () => {
    updateGeneralConfig({ telemetry });
    await setOnboardingStep(99);
    navigate('/');
  }, [telemetry, updateGeneralConfig, setOnboardingStep, navigate]);

  const s: React.CSSProperties = {
    fontFamily: 'Inter, system-ui, sans-serif',
    minHeight: '100vh',
    background: '#fafaf9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
  };

  const card: React.CSSProperties = {
    width: '100%',
    maxWidth: 440,
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #ebebeb',
    padding: '40px 40px 36px',
  };

  const title: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 600,
    color: '#111',
    letterSpacing: '-0.5px',
    marginBottom: 8,
  };

  const subtitle: React.CSSProperties = {
    fontSize: 14,
    color: '#888',
    lineHeight: 1.6,
    marginBottom: 28,
  };

  const btn = (active: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px 20px',
    background: active ? '#111' : '#e8e8e8',
    color: active ? '#fff' : '#aaa',
    border: 'none',
    borderRadius: 100,
    fontSize: 14,
    fontWeight: 600,
    cursor: active ? 'pointer' : 'not-allowed',
    fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'all 0.15s',
    marginTop: 8,
  });

  const checkRow = (checked: boolean, onChange: (v: boolean) => void, label: React.ReactNode) => (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 16 }}>
      <div style={{ position: 'relative', flexShrink: 0, marginTop: 1 }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
          style={{ opacity: 0, position: 'absolute', width: 18, height: 18, cursor: 'pointer', margin: 0 }} />
        <div style={{
          width: 18, height: 18, borderRadius: 4,
          border: checked ? '2px solid #111' : '2px solid #ddd',
          background: checked ? '#111' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}>
          {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>}
        </div>
      </div>
      <span style={{ fontSize: 14, color: '#444', lineHeight: 1.5 }}>{label}</span>
    </label>
  );

  return (
    <div style={s}>
      {/* Logo */}
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-1.5px', color: '#111', marginBottom: 32 }}>Fi</div>

      <div style={card}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{
              height: 3, flex: 1, borderRadius: 100,
              background: i <= step ? '#111' : '#eee',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Step 1 — Terms */}
        {step === 1 && <>
          <div style={title}>Before you begin</div>
          <div style={subtitle}>Please review and accept our policies to continue.</div>
          {checkRow(termsAccepted, setTermsAccepted,
            <span>I agree to Fi's <a href="/terms" style={{ color: '#111', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}>Terms of Service</a></span>
          )}
          {checkRow(privacyAccepted, setPrivacyAccepted,
            <span>I accept the <a href="/privacy" style={{ color: '#111', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}>Privacy Policy</a></span>
          )}
          <button style={btn(termsAccepted && privacyAccepted)} disabled={!termsAccepted || !privacyAccepted} onClick={() => setStep(2)}>
            Continue
          </button>
        </>}

        {/* Step 2 — Values */}
        {step === 2 && <>
          <div style={title}>A few things to know</div>
          <div style={subtitle}>What you can expect from Fi.</div>
          {[
            { t: 'No ads, ever', d: "Fi won't show you ads or let advertisers influence responses." },
            { t: 'Private by default', d: 'Your conversations are yours. We never sell your data.' },
          ].map(item => (
            <div key={item.t} style={{ padding: '14px 16px', border: '1px solid #f0f0f0', borderRadius: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 3 }}>{item.t}</div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>{item.d}</div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: '1px solid #f0f0f0', borderRadius: 10, marginBottom: 20, marginTop: 4 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 2 }}>Help improve Fi</div>
              <div style={{ fontSize: 13, color: '#888' }}>Share anonymous usage data. Change anytime.</div>
            </div>
            <div onClick={() => setTelemetry(!telemetry)} style={{
              width: 44, height: 24, borderRadius: 100,
              background: telemetry ? '#111' : '#ddd',
              cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 3, left: telemetry ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s',
              }} />
            </div>
          </div>
          <button style={btn(true)} onClick={() => setStep(3)}>Continue</button>
        </>}

        {/* Step 3 — Name */}
        {step === 3 && <>
          <div style={title}>What's your name?</div>
          <div style={subtitle}>So Fi knows what to call you.</div>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(4)}
            placeholder="Enter your name"
            style={{
              width: '100%', padding: '12px 16px', fontSize: 15,
              border: '1.5px solid #e0e0e0', borderRadius: 10, outline: 'none',
              fontFamily: 'Inter, system-ui, sans-serif', color: '#111', marginBottom: 16,
              boxSizing: 'border-box', background: '#fff',
            }}
          />
          <button style={btn(!!name.trim())} disabled={!name.trim()} onClick={() => setStep(4)}>Continue</button>
          <button onClick={() => setStep(4)} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#aaa', fontSize: 13, cursor: 'pointer', marginTop: 4 }}>
            Skip
          </button>
        </>}

        {/* Step 4 — Role */}
        {step === 4 && <>
          <div style={title}>What kind of work do you do?</div>
          <div style={subtitle}>Helps Fi tailor responses to your context.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {ROLES.map(r => (
              <div key={r} onClick={() => setRole(r)} style={{
                padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', border: role === r ? '1.5px solid #111' : '1.5px solid #eee',
                background: role === r ? '#111' : '#fff', color: role === r ? '#fff' : '#444',
                transition: 'all 0.15s', textAlign: 'center',
              }}>
                {r}
              </div>
            ))}
          </div>
          <button style={btn(true)} onClick={finish}>Get started</button>
        </>}
      </div>
    </div>
  );
});

CommonOnboardingPage.displayName = 'CommonOnboardingPage';
export default CommonOnboardingPage;
