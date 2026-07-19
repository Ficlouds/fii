'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCard from '@/features/AuthCard';
import { Button } from 'antd';

const generateNumericCode = (token: string): string => {
  // Generate a 6-digit numeric code from the token
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 900000 + 100000).toString();
};

export default function MagicLinkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const token = searchParams.get('token') || '';

  useEffect(() => {
    if (token) {
      setCode(generateNumericCode(token));
    } else {
      router.replace('/signin');
    }
  }, [token, router]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AuthCard title="Your sign-in code">
      <p style={{ fontSize: 14, color: '#666', textAlign: 'center', margin: '0 0 24px' }}>
        Enter this code in the Fi app to complete sign in.
      </p>

      {/* Numeric code display */}
      <div
        onClick={handleCopy}
        style={{
          background: '#f5f5f3',
          borderRadius: 12,
          padding: '28px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 16,
          border: '2px solid transparent',
          transition: 'border-color 0.2s',
        }}
      >
        <div style={{
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: 12,
          color: '#111',
          fontFamily: 'monospace',
        }}>
          {code}
        </div>
        <p style={{ fontSize: 12, color: '#aaa', margin: '8px 0 0' }}>
          {copied ? 'Copied.' : 'Tap to copy'}
        </p>
      </div>

      <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', margin: '0 0 20px' }}>
        This code expires in 10 minutes and can only be used once.
      </p>

      <Button
        block
        size="large"
        onClick={() => router.replace('/signin')}
        style={{ marginTop: 8 }}
      >
        Back to sign in
      </Button>
    </AuthCard>
  );
}
