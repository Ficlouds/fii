'use client';

import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/user';

const ROLES = [
  'Software Engineer', 'Product Manager', 'Designer', 'Data Scientist',
  'Marketing', 'Finance', 'Operations', 'Student', 'Other',
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

  const wrap: React.CSSProperties = {
    fontFamily: 'Inter, system-ui, sans-serif',
    minHeight: '100vh',
    background: '#fafaf9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 24px',
  };

  const inner: React.CSSProperties = {
    width: '100%',
    maxWidth: 420,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  };

  const h1: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 600,
    color: '#111',
    letterSpacing: '-0.8px',
    lineHeight: 1.25,
    marginBottom: 12,
  };

  const sub: React.CSSProperties = {
    fontSize: 15,
    color: '#888',
    lineHeight: 1.65,
    marginBottom: 36,
  };

  const primaryBtn = (active: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '13px 20px',
    background: active ? '#111' : '#e4e4e4',
    color: active ? '#fff' : '#b0b0b0',
    border: 'none',
    borderRadius: 100,
    fontSize: 15,
    fontWeight: 600,
    cursor: active ? 'pointer' : 'not-allowed',
    fontFamily: 'Inter, system-ui, sans-serif',
    letterSpacing: '-0.2px',
    transition: 'background 0.15s',
    marginTop: 4,
  });

  const ghostBtn: React.CSSProperties = {
    width: '100%',
    padding: '11px 20px',
    background: 'none',
    border: 'none',
    color: '#aaa',
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    marginTop: 4,
  };

  const checkRow = (checked: boolean, onChange: (v: boolean) => void, label: React.ReactNode) => (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer', marginBottom: 20, width: '100%' }}>
      <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
          style={{ opacity: 0, position: 'absolute', width: 20, height: 20, cursor: 'pointer', margin: 0 }} />
        <div style={{
          width: 20, height: 20, borderRadius: 5,
          border: checked ? '2px solid #111' : '2px solid #ccc',
          background: checked ? '#111' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}>
          {checked && <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>}
        </div>
      </div>
      <span style={{ fontSize: 15, color: '#333', lineHeight: 1.55 }}>{label}</span>
    </label>
  );

  return (
    <div style={wrap}>
      <div style={inner}>

        {/* Fi wordmark — always visible */}
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1.2px', color: '#111', marginBottom: 56 }}>Fi</div>

        {/* Step 1 — Terms */}
        {step === 1 && <>
          <div style={h1}>Let's get you started</div>
          <div style={sub}>Review and accept the following to continue.</div>
          {checkRow(termsAccepted, setTermsAccepted,
            <span>I agree to Fi's <a href="/terms" style={{ color: '#111', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>Terms of Service</a> and confirm I am at least 13 years of age.</span>
          )}
          {checkRow(privacyAccepted, setPrivacyAccepted,
            <span>I have read and accept the <a href="/privacy" style={{ color: '#111', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>Privacy Policy</a>.</span>
          )}
          <button style={primaryBtn(termsAccepted && privacyAccepted)} disabled={!termsAccepted || !privacyAccepted} onClick={() => setStep(2)}>
            Continue
          </button>
        </>}

        {/* Step 2 — Values */}
        {step === 2 && <>
          <div style={h1}>Before your first chat</div>
          <div style={sub}>A few things to know about Fi.</div>
          <div style={{ width: '100%', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { t: 'No ads, ever', d: "Fi won't show you ads or let advertisers influence what it says." },
              { t: 'Your data stays yours', d: 'Conversations are private. We never sell your data to third parties.' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '18px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 4 }}>{item.t}</div>
                <div style={{ fontSize: 14, color: '#888', lineHeight: 1.55 }}>{item.d}</div>
              </div>
            ))}
            <div style={{ padding: '18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, paddingRight: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 4 }}>Help improve Fi</div>
                <div style={{ fontSize: 14, color: '#888', lineHeight: 1.55 }}>Allow anonymous usage data. You can change this anytime in settings.</div>
              </div>
              <div onClick={() => setTelemetry(!telemetry)} style={{
                width: 44, height: 26, borderRadius: 100,
                background: telemetry ? '#111' : '#ddd',
                cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', top: 4, left: telemetry ? 22 : 4,
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
            </div>
          </div>
          <button style={primaryBtn(true)} onClick={() => setStep(3)}>Continue</button>
        </>}

        {/* Step 3 — Name */}
        {step === 3 && <>
          <div style={h1}>What's your name?</div>
          <div style={sub}>So Fi knows what to call you.</div>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setStep(4)}
            placeholder="Your name"
            style={{
              width: '100%', padding: '13px 16px', fontSize: 15,
              border: '1.5px solid #e0e0e0', borderRadius: 10, outline: 'none',
              fontFamily: 'Inter, system-ui, sans-serif', color: '#111', marginBottom: 16,
              boxSizing: 'border-box', background: '#fff',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#111'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          <button style={primaryBtn(!!name.trim())} disabled={!name.trim()} onClick={() => setStep(4)}>Continue</button>
          <button style={ghostBtn} onClick={() => setStep(4)}>Skip for now</button>
        </>}

        {/* Step 4 — Role */}
        {step === 4 && <>
          <div style={h1}>What kind of work do you do?</div>
          <div style={sub}>Helps Fi tailor its responses to you.</div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
            {ROLES.map(r => (
              <div key={r} onClick={() => setRole(r)} style={{
                padding: '13px 16px',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: role === r ? 600 : 400,
                cursor: 'pointer',
                border: role === r ? '1.5px solid #111' : '1.5px solid #ebebeb',
                background: role === r ? '#111' : '#fff',
                color: role === r ? '#fff' : '#333',
                transition: 'all 0.15s',
              }}>
                {r}
              </div>
            ))}
          </div>
          <button style={primaryBtn(true)} onClick={finish}>Get started with Fi</button>
          <button style={ghostBtn} onClick={finish}>Skip</button>
        </>}

      </div>
    </div>
  );
});

CommonOnboardingPage.displayName = 'CommonOnboardingPage';
export default CommonOnboardingPage;
