'use client';

import { memo } from 'react';
import { useIsDark } from '@/hooks/useIsDark';
import { useChatStore } from '@/store/chat';
import SideBarHeaderLayout from '@/features/NavPanel/SideBarHeaderLayout';
import Nav from './components/Nav';

const FiLogo = ({ height = 22 }: { height?: number }) => {
  const isDark = useIsDark();
  const resetChat = () => {
    useChatStore.setState({ activeTopicId: undefined, activeAgentId: undefined });
  };
  return (
    <img
      src={isDark ? '/logos/fi-icon-white.svg' : '/logos/fi-icon-black.svg'}
      alt="Fi"
      onClick={resetChat}
      style={{ cursor: 'pointer', height, marginBottom: 12, marginLeft: 2, marginTop: 20, objectFit: 'contain', width: 'auto' }}
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
