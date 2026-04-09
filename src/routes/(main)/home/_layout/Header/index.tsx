'use client';

import { memo } from 'react';

import SideBarHeaderLayout from '@/features/NavPanel/SideBarHeaderLayout';

import InboxButton from './components/InboxButton';
import Nav from './components/Nav';
import User from './components/User';

const Header = memo(() => {
  return (
    <>
      <SideBarHeaderLayout
        left={<User />}
        showBack={false}
        right={
          <>
            <InboxButton />
          </>
        }
      />
      <Nav />
    </>
  );
});

export default Header;
