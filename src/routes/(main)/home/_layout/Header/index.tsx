'use client';

import { memo } from 'react';
import { useIsDark } from '@/hooks/useIsDark';
import SideBarHeaderLayout from '@/features/NavPanel/SideBarHeaderLayout';
import Nav from './components/Nav';

const FiLogo = ({ height = 22 }: { height?: number }) => {
  const isDark = useIsDark();
  return (
    <img
      src={isDark ? '/logos/fi-icon-white.svg' : '/logos/fi-icon-black.svg'}
      alt="Fi"
      style={{ height, marginBottom: 12, marginLeft: 2, marginTop: 12, objectFit: 'contain', width: 'auto' }}
    />
  );
};

const Header = memo(() => {
  return (
    <>
      <SideBarHeaderLayout
        left={
          <FiLogo height={22} />
        }
        showBack={false}
        showTogglePanelButton={true}
      />
      <Nav />
    </>
  );
});

export default Header;
