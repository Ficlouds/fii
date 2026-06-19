'use client';

import { getFiSkillProviderById } from '@ficlouds/const';
import { type ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useToolStore } from '@/store/tool';
import { fiSkillStoreSelectors } from '@/store/tool/selectors';
import { FiSkillStatus } from '@/store/tool/slices/fiSkillStore/types';

import { type DetailContextValue } from './DetailContext';
import { DetailContext } from './DetailContext';

interface FiDetailProviderProps {
  children: ReactNode;
  identifier: string;
}

export const FiDetailProvider = ({ children, identifier }: FiDetailProviderProps) => {
  const { t } = useTranslation(['setting']);

  const config = useMemo(() => getFiSkillProviderById(identifier), [identifier]);

  const fiSkillServers = useToolStore(fiSkillStoreSelectors.getServers);

  const serverState = useMemo(
    () => fiSkillServers.find((s) => s.identifier === identifier),
    [identifier, fiSkillServers],
  );

  const isConnected = useMemo(
    () => serverState?.status === FiSkillStatus.CONNECTED,
    [serverState],
  );

  const useFetchProviderTools = useToolStore((s) => s.useFetchProviderTools);
  const { data: tools = [], isLoading: toolsLoading } = useFetchProviderTools(identifier);

  if (!config) return null;

  const { author, authorUrl, description, icon, readme, label } = config;

  const localizedDescription = t(`tools.fiSkill.providers.${identifier}.description`, {
    defaultValue: description,
  });
  const localizedReadme = t(`tools.fiSkill.providers.${identifier}.readme`, {
    defaultValue: readme,
  });

  const value: DetailContextValue = {
    author,
    authorUrl,
    config,
    description,
    icon,
    identifier,
    isConnected,
    label,
    localizedDescription,
    localizedReadme,
    readme,
    tools,
    toolsLoading,
  };

  return <DetailContext value={value}>{children}</DetailContext>;
};
