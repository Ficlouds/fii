'use client';
import { Flexbox } from '@lobehub/ui';
import { MessageSquarePlusIcon, SearchIcon } from 'lucide-react';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import NavItem from '@/features/NavPanel/components/NavItem';
import { useGlobalStore } from '@/store/global';

const Nav = memo(() => {
  const toggleCommandMenu = useGlobalStore((s) => s.toggleCommandMenu);
  return (
    <Flexbox gap={1} paddingInline={4}>
      <div onClick={() => toggleCommandMenu(true)} style={{ cursor: 'pointer' }}>
        <NavItem icon={SearchIcon} title="Search" />
      </div>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <NavItem icon={MessageSquarePlusIcon} title="New Chat" />
      </Link>
    </Flexbox>
  );
});

export default Nav;
