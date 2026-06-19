import type { BuiltinInspector } from '@ficlouds/types';

import { FiAgentApiName } from '../../types';
import { AnalyzeVisualMediaInspector } from './AnalyzeVisualMedia';
import { CallSubAgentInspector } from './CallSubAgent';
import { CallSubAgentsInspector } from './CallSubAgents';
import { ClearTodosInspector } from './ClearTodos';
import { CreatePlanInspector } from './CreatePlan';
import { CreateTodosInspector } from './CreateTodos';
import { UpdatePlanInspector } from './UpdatePlan';
import { UpdateTodosInspector } from './UpdateTodos';

/**
 * Lobe Agent Inspector Components Registry
 *
 * Inspector components customize the title/header area
 * of tool calls in the conversation UI.
 */
export const FiAgentInspectors: Record<string, BuiltinInspector> = {
  [FiAgentApiName.analyzeVisualMedia]: AnalyzeVisualMediaInspector as BuiltinInspector,
  [FiAgentApiName.callSubAgent]: CallSubAgentInspector as BuiltinInspector,
  [FiAgentApiName.callSubAgents]: CallSubAgentsInspector as BuiltinInspector,
  [FiAgentApiName.clearTodos]: ClearTodosInspector as BuiltinInspector,
  [FiAgentApiName.createPlan]: CreatePlanInspector as BuiltinInspector,
  [FiAgentApiName.createTodos]: CreateTodosInspector as BuiltinInspector,
  [FiAgentApiName.updatePlan]: UpdatePlanInspector as BuiltinInspector,
  [FiAgentApiName.updateTodos]: UpdateTodosInspector as BuiltinInspector,
};
