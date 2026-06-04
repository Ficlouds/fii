'use client';

import { memo } from 'react';
import SideBarHeaderLayout from '@/features/NavPanel/SideBarHeaderLayout';
import Nav from './components/Nav';

const Header = memo(() => {
  return (
    <>
      <SideBarHeaderLayout
        left={
          <img
            src="/logos/fi-icon.svg"
            alt="Fi"
            style={{
              height: 22,
              marginBottom: 12,
              marginLeft: -4,
              marginTop: 12,
              objectFit: 'contain',
              width: 'auto',
            }}
          />
        }
        showBack={false}
      />
      <Nav />
    </>
  );
});

export default Header;
