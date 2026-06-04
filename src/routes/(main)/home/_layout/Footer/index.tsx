'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import UserAvatar from '@/features/User/UserAvatar';
import UserPanel from '@/features/User/UserPanel';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';

const SidebarFooter = memo(() => {
  const [nickname, username] = useUserStore((s) => [
    userProfileSelectors.nickName(s),
    userProfileSelectors.username(s),
  ]);
  const isSignedIn = useUserStore(authSelectors.isLogin);

  const displayName = nickname || username || 'Guest';

  return (
    <UserPanel>
      <Flexbox
        horizontal
        align="center"
        gap={10}
        style={{
          borderTop: '1px solid rgba(0,0,0,0.06)',
          cursor: 'pointer',
          margin: '0 8px',
          padding: '10px 8px',
          borderRadius: 10,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <UserAvatar size={28} />
        <Flexbox style={{ overflow: 'hidden' }}>
          <span
            style={{
              color: '#111',
              fontSize: 13,
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {isSignedIn ? displayName : 'Sign in'}
          </span>
        </Flexbox>
      </Flexbox>
    </UserPanel>
  );
});

export default SidebarFooter;
