import type { BuiltinStreaming } from '@ficlouds/types';

import { FiAgentApiName } from '../../types';
import { CallSubAgentStreaming } from './CallSubAgent';
import { CallSubAgentsStreaming } from './CallSubAgents';
import { CreatePlanStreaming } from './CreatePlan';

/**
 * Lobe Agent Streaming Components Registry
 *
 * Streaming components render tool calls while they are still
 * executing, allowing real-time feedback to users.
 */
export const FiAgentStreamings: Record<string, BuiltinStreaming> = {
  [FiAgentApiName.callSubAgent]: CallSubAgentStreaming as BuiltinStreaming,
  [FiAgentApiName.callSubAgents]: CallSubAgentsStreaming as BuiltinStreaming,
  [FiAgentApiName.createPlan]: CreatePlanStreaming as BuiltinStreaming,
};

export { CallSubAgentStreaming } from './CallSubAgent';
export { CallSubAgentsStreaming } from './CallSubAgents';
export { CreatePlanStreaming } from './CreatePlan';
