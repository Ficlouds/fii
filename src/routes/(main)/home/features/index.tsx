'use client';
import { memo, useEffect, useState } from 'react';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';
import InputArea from './InputArea';
import Recents from './Recents';

const Home = memo(() => {
  const isLogin = useUserStore(authSelectors.isLogin);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        width: '100%',
        padding: '0 24px',
      }}
    >
      {/* Big Fi logo — fades out on first message via router navigation */}
      <div
        style={{
          fontSize: 60,
          fontWeight: 700,
          letterSpacing: '-2px',
          marginBottom: 32,
          fontFamily: 'Inter, system-ui, sans-serif',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
          userSelect: 'none',
        }}
      >
        Fi
      </div>

      {/* Input */}
      <div style={{ width: '100%', maxWidth: 760 }}>
        <InputArea />
      </div>

      {/* Recents */}
      {isLogin && (
        <div style={{ width: '100%', maxWidth: 760, marginTop: 40 }}>
          <Recents />
        </div>
      )}
    </div>
  );
});

export default Home;
