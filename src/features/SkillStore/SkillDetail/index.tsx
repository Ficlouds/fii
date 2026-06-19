'use client';

import { createModal } from '@lobehub/ui';
import { t } from 'i18next';
import { type Klavis } from 'klavis';

import { BuiltinAgentSkillDetailContent } from './BuiltinAgentSkillDetailContent';
import { BuiltinSkillDetailContent } from './BuiltinSkillDetailContent';
import { KlavisSkillDetailContent } from './KlavisSkillDetailContent';
import { FiSkillDetailContent } from './FiSkillDetailContent';

export interface CreateBuiltinAgentSkillDetailModalOptions {
  identifier: string;
}

export const createBuiltinAgentSkillDetailModal = ({
  identifier,
}: CreateBuiltinAgentSkillDetailModalOptions) =>
  createModal({
    children: <BuiltinAgentSkillDetailContent identifier={identifier} />,
    destroyOnHidden: true,
    footer: null,
    title: t('dev.title.skillDetails', { ns: 'plugin' }),
    width: 800,
  });

export interface CreateBuiltinSkillDetailModalOptions {
  identifier: string;
}

export const createBuiltinSkillDetailModal = ({
  identifier,
}: CreateBuiltinSkillDetailModalOptions) =>
  createModal({
    children: <BuiltinSkillDetailContent identifier={identifier} />,
    destroyOnHidden: true,
    footer: null,
    title: t('dev.title.skillDetails', { ns: 'plugin' }),
    width: 800,
  });

export interface CreateKlavisSkillDetailModalOptions {
  identifier: string;
  serverName: Klavis.McpServerName;
}

export const createKlavisSkillDetailModal = ({
  identifier,
  serverName,
}: CreateKlavisSkillDetailModalOptions) =>
  createModal({
    children: <KlavisSkillDetailContent identifier={identifier} serverName={serverName} />,
    destroyOnHidden: true,
    footer: null,
    title: t('dev.title.skillDetails', { ns: 'plugin' }),
    width: 800,
  });

export interface CreateFiSkillDetailModalOptions {
  identifier: string;
}

export const createFiSkillDetailModal = ({
  identifier,
}: CreateFiSkillDetailModalOptions) =>
  createModal({
    children: <FiSkillDetailContent identifier={identifier} />,
    destroyOnHidden: true,
    footer: null,
    title: t('dev.title.skillDetails', { ns: 'plugin' }),
    width: 800,
  });
