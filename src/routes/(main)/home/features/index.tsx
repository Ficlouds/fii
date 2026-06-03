'use client';
import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';
import InputArea from './InputArea';
import Recents from './Recents';

const Home = memo(() => {
  const isLogin = useUserStore(authSelectors.isLogin);
  return (
    <Flexbox
      align="center"
      gap={0}
      style={{
        minHeight: '60vh',
        justifyContent: 'center',
        paddingTop: '10vh',
      }}
    >
      {/* Big Fi logo like Grok */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: '-2px',
          marginBottom: 40,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        Fi
      </div>

      {/* Input area */}
      <div style={{ width: '100%', maxWidth: 700 }}>
        <InputArea />
      </div>

      {/* Recent chats below input */}
      {isLogin && (
        <div style={{ width: '100%', maxWidth: 700, marginTop: 32 }}>
          <Recents />
        </div>
      )}
    </Flexbox>
  );
});
export default Home;
