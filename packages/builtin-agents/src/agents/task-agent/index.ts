import { TaskIdentifier } from '@ficlouds/builtin-tool-task';
import { DEFAULT_PROVIDER } from '@ficlouds/business-const';
import { DEFAULT_MODEL } from '@ficlouds/const';

import type { BuiltinAgentDefinition } from '../../types';
import { BUILTIN_AGENT_SLUGS } from '../../types';
import { systemRoleTemplate } from './systemRole';

export const TASK_AGENT: BuiltinAgentDefinition = {
  avatar: '/avatars/lobe-ai.png',
  persist: {
    model: DEFAULT_MODEL,
    provider: DEFAULT_PROVIDER,
  },
  runtime: (ctx) => ({
    plugins: [TaskIdentifier, ...(ctx.plugins || [])],
    systemRole: systemRoleTemplate,
  }),
  slug: BUILTIN_AGENT_SLUGS.taskAgent,
};
