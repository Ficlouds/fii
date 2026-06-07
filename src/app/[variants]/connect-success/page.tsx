'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ConnectSuccessPage() {
  const params = useSearchParams();
  const app = params.get('oauth_success') || params.get('connected_account_id') || 'App';
  const [status, setStatus] = useState<'success' | 'error'>('success');

  useEffect(() => {
    try {
      localStorage.setItem('fi:oauth-success', JSON.stringify({
        provider: app,
        timestamp: Date.now()
      }));
    } catch {}

    const timer = setTimeout(() => {
      window.close();
      setTimeout(() => {
        window.location.href = '/connect';
      }, 500);
    }, 1500);

    return () => clearTimeout(timer);
  }, [app]);

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0f0f0e', color: 'white',
      flexDirection: 'column', gap: '16px', margin: 0, padding: 0
    }}>
      <div style={{
        width: 64, height: 64, background: '#22c55e', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, flexShrink: 0
      }}>&#10003;</div>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>Connected to Fi</h2>
      <p style={{ margin: 0, opacity: 0.5, fontSize: 13 }}>Closing this window...</p>
    </div>
  );
}
