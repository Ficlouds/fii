'use client';
import { Button, Input } from 'antd';
import { useEffect, useRef, useState } from 'react';
import AuthCard from '../../../../features/AuthCard';

interface SignInOtpStepProps {
  email: string;
  loading: boolean;
  onBack: () => void;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
}

export const SignInOtpStep = ({ email, loading, onBack, onVerify, onResend }: SignInOtpStepProps) => {
  const [code, setCode] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowInput(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  const handleResend = async () => {
    setResending(true);
    await onResend();
    setResending(false);
  };

  return (
    <AuthCard>
      {!showInput ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12, textAlign: 'center', color: '#111' }}>
            We sent you a code.
          </h1>
          <p style={{ color: '#666', fontSize: 15, marginBottom: 4 }}>Check your inbox at</p>
          <p style={{ color: '#111', fontSize: 15, fontWeight: 500 }}>{email}</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8, textAlign: 'center', color: '#111' }}>
            Almost there.
          </h1>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 24, textAlign: 'left', lineHeight: 1.7 }}>
            We just sent a 6-digit code to <span style={{ color: '#111', fontWeight: 500 }}>{email}</span>. Enter it below to sign in. It should arrive in the next few minutes. If you don't see it, check your spam folder.
          </p>
          <Input
            ref={inputRef}
            maxLength={6}
            placeholder=""
            size="large"
            style={{ textAlign: 'center', fontSize: 28, fontWeight: 400, letterSpacing: 12, borderRadius: 12, height: 42, marginBottom: 16, border: '1.5px solid rgba(0,0,0,0.15)', boxShadow: 'none' }}
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setCode(val);
              setError('');
              if (val.length === 6) onVerify(val).catch(() => setError('That code is incorrect. Please try again.'));
            }}
          />
          {error && (
            <p style={{ color: '#c00', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>
          )}
          <Button block disabled={code.length !== 6} loading={loading} size="large" type="primary" style={{ marginBottom: 16 }} onClick={async () => {
              setError('');
              try { await onVerify(code); } catch { setError('That code is incorrect. Please try again.'); }
            }}>
            Continue
          </Button>
          <p style={{ color: '#999', fontSize: 13, marginBottom: 8 }}>
            Didn't receive it?{' '}
            <button style={{ color: '#111', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }} onClick={handleResend} disabled={resending}>
              {resending ? 'Sending...' : 'send again.'}
            </button>
          </p>
          <button style={{ color: '#444', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginTop: 8 }} onClick={onBack}>
            ← Use a different email
          </button>
        </div>
      )}
    </AuthCard>
  );
};
