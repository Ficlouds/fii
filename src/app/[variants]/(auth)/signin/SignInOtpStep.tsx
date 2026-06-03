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
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>
            To continue, click the link sent to
          </h1>
          <p style={{ color: '#555', fontSize: 15, marginBottom: 8 }}>{email}</p>
          <p style={{ color: '#555', fontSize: 15 }}>Enter verification code</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
            Enter the verification code sent to
          </h1>
          <p style={{ color: '#555', fontSize: 14, marginBottom: 24 }}>{email}</p>
          <Input
            ref={inputRef}
            maxLength={6}
            placeholder="000000"
            size="large"
            style={{ textAlign: 'center', fontSize: 24, fontWeight: 600, letterSpacing: 8, borderRadius: 100, height: 52, marginBottom: 16, border: '1px solid rgba(0,0,0,0.18)' }}
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setCode(val);
              if (val.length === 6) onVerify(val);
            }}
          />
          <Button block disabled={code.length !== 6} loading={loading} size="large" type="primary" style={{ marginBottom: 16 }} onClick={() => onVerify(code)}>
            Verify
          </Button>
          <p style={{ color: '#999', fontSize: 13, marginBottom: 8 }}>
            Not seeing the email in your inbox?{' '}
            <button style={{ color: '#000', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }} onClick={handleResend} disabled={resending}>
              {resending ? 'Sending...' : 'Try sending again.'}
            </button>
          </p>
          <button style={{ color: '#999', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginTop: 8 }} onClick={onBack}>
            ← Back
          </button>
        </div>
      )}
    </AuthCard>
  );
};
