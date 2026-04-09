'use client';

import { CreateBotIcon } from '@lobehub/ui/icons';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import NavItem from '@/features/NavPanel/components/NavItem';

import { useCreateMenuItems } from '../hooks';

const NewAgentButton = memo(() => {
  const { t } = useTranslation('chat');
  const { createAgent, isMutatingAgent } = useCreateMenuItems();

  const handleClick = useCallback(() => {
    createAgent();
  }, [createAgent]);

  return (
    <NavItem
      icon={CreateBotIcon}
      loading={isMutatingAgent}
      title={t('newAgent')}
      onClick={handleClick}
    />
  );
});

export default NewAgentButton;
