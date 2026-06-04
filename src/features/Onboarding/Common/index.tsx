'use client';

import { memo, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/user';

const ROLES = [
  'Software Engineer', 'Product Manager', 'Designer', 'Data Scientist',
  'Marketing', 'Finance', 'Legal', 'Operations', 'Student', 'Entrepreneur', 'Other',
];

const CommonOnboardingPage = memo(() => {
  const [step, setStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [telemetry, setTelemetry] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [roleOpen, setRoleOpen] = useState(false);
  const navigate = useNavigate();
  const updateGeneralConfig = useUserStore((s) => s.updateGeneralConfig);
  const setOnboardingStep = useUserStore((s) => s.setOnboardingStep);

  const finish = useCallback(async () => {
    updateGeneralConfig({ telemetry });
    await setOnboardingStep(99);
    navigate('/');
  }, [telemetry, updateGeneralConfig, setOnboardingStep, navigate]);

  const f: React.CSSProperties = {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    minHeight: '100vh',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 24px',
  };

  const logo: React.CSSProperties = {
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: '-1px',
    color: '#000',
    position: 'absolute',
    top: 32,
    left: 40,
  };

  const inner: React.CSSProperties = {
    width: '100%',
    maxWidth: 400,
  };

  const q: React.CSSProperties = {
    fontSize: 30,
    fontWeight: 600,
    color: '#000',
    letterSpacing: '-0.8px',
    lineHeight: 1.2,
    marginBottom: 10,
  };

  const hint: React.CSSProperties = {
    fontSize: 15,
    color: '#999',
    lineHeight: 1.6,
    marginBottom: 32,
  };

  const primaryBtn = (on: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '14px',
    background: on ? '#000' : '#ececec',
    color: on ? '#fff' : '#bbb',
    border: 'none',
    borderRadius: 100,
    fontSize: 15,
    fontWeight: 600,
    cursor: on ? 'pointer' : 'not-allowed',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  });

  const checkRow = (checked: boolean, onChange: (v: boolean) => void, label: React.ReactNode) => (
    <label style={{ display: 'flex', gap: 14, cursor: 'pointer', marginBottom: 18, alignItems: 'flex-start' }}>
      <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
          style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer', margin: 0 }} />
        <div style={{
          width: 20, height: 20, borderRadius: 5,
          border: `2px solid ${checked ? '#000' : '#d0d0d0'}`,
          background: checked ? '#000' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}>
          {checked && <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>}
        </div>
      </div>
      <span style={{ fontSize: 14, color: '#444', lineHeight: 1.6 }}>{label}</span>
    </label>
  );

  return (
    <div style={{ ...f, position: 'relative' }}>
      <div style={logo}>Fi</div>

      <div style={inner}>

        {/* Step 1 — Terms */}
        {step === 1 && <>
          <div style={q}>Let's get started</div>
          <div style={hint}>Please review and accept to continue.</div>
          {checkRow(termsAccepted, setTermsAccepted,
            <span>I agree to Fi's <a href="/terms" style={{ color: '#000', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>Terms of Service</a> and confirm I am at least 13 years old.</span>
          )}
          {checkRow(privacyAccepted, setPrivacyAccepted,
            <span>I accept the <a href="/privacy" style={{ color: '#000', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>Privacy Policy</a>.</span>
          )}
          <div style={{ height: 12 }} />
          <button style={primaryBtn(termsAccepted && privacyAccepted)}
            disabled={!termsAccepted || !privacyAccepted}
            onClick={() => setStep(2)}>
            Continue
          </button>
        </>}

        {/* Step 2 — Values */}
        {step === 2 && <>
          <div style={q}>Before your first chat</div>
          <div style={hint}>A few things to know.</div>
          {[
            { t: 'No ads, ever', d: "Fi won't show you ads or let advertisers influence responses." },
            { t: 'Private by default', d: 'Your conversations are yours. We never sell your data.' },
          ].map((item) => (
            <div key={item.t} style={{ paddingBlock: 16, borderBottom: '1px solid #f2f2f2' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 3 }}>{item.t}</div>
              <div style={{ fontSize: 14, color: '#999', lineHeight: 1.55 }}>{item.d}</div>
            </div>
          ))}
          <div style={{ paddingBlock: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 3 }}>Help improve Fi</div>
              <div style={{ fontSize: 14, color: '#999' }}>Share anonymous data. Change anytime.</div>
            </div>
            <div onClick={() => setTelemetry(!telemetry)} style={{
              width: 44, height: 26, borderRadius: 100,
              background: telemetry ? '#000' : '#e0e0e0',
              cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0, marginLeft: 16,
            }}>
              <div style={{
                position: 'absolute', top: 4, left: telemetry ? 22 : 4,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
              }} />
            </div>
          </div>
          <button style={primaryBtn(true)} onClick={() => setStep(3)}>Continue</button>
        </>}

        {/* Step 3 — Name */}
        {step === 3 && <>
          <div style={q}>What's your name?</div>
          <div style={hint}>So Fi knows what to call you.</div>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setStep(4)}
            placeholder="Enter your name"
            style={{
              width: '100%', padding: '14px 18px', fontSize: 15,
              border: '1.5px solid #e8e8e8', borderRadius: 12,
              outline: 'none', fontFamily: 'inherit', color: '#111',
              marginBottom: 14, boxSizing: 'border-box', background: '#fafafa',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#000'; e.target.style.background = '#fff'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e8e8e8'; e.target.style.background = '#fafafa'; }}
          />
          <button style={primaryBtn(!!name.trim())} disabled={!name.trim()} onClick={() => setStep(4)}>Continue</button>
          <button onClick={() => setStep(4)} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: '#bbb', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginTop: 6 }}>
            Skip
          </button>
        </>}

        {/* Step 4 — Role dropdown */}
        {step === 4 && <>
          <div style={q}>What kind of work do you do?</div>
          <div style={hint}>Helps Fi tailor its responses to your context.</div>

          {/* Custom dropdown */}
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <div
              onClick={() => setRoleOpen(!roleOpen)}
              style={{
                padding: '14px 18px',
                border: `1.5px solid ${roleOpen ? '#000' : '#e8e8e8'}`,
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fafafa',
                fontSize: 15,
                color: role ? '#111' : '#bbb',
                userSelect: 'none',
                transition: 'border-color 0.15s',
              }}
            >
              <span>{role || 'Select your role'}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: roleOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                <path d="M4 6L8 10L12 6" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {roleOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                maxHeight: 280, overflowY: 'auto', zIndex: 100,
              }}>
                {ROLES.map((r, i) => (
                  <div key={r}
                    onClick={() => { setRole(r); setRoleOpen(false); }}
                    style={{
                      padding: '13px 18px',
                      fontSize: 15,
                      color: role === r ? '#000' : '#444',
                      fontWeight: role === r ? 600 : 400,
                      cursor: 'pointer',
                      borderBottom: i < ROLES.length - 1 ? '1px solid #f5f5f5' : 'none',
                      background: role === r ? '#fafafa' : '#fff',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = role === r ? '#fafafa' : '#fff')}
                  >
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button style={primaryBtn(true)} onClick={finish}>Get started</button>
          <button onClick={finish} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: '#bbb', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginTop: 6 }}>
            Skip
          </button>
        </>}

      </div>
    </div>
  );
});

CommonOnboardingPage.displayName = 'CommonOnboardingPage';
export default CommonOnboardingPage;
