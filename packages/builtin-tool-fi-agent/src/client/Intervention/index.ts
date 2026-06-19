import type { BuiltinIntervention } from '@ficlouds/types';

import { FiAgentApiName } from '../../types';
import AddTodoIntervention from './AddTodo';
import ClearTodosIntervention from './ClearTodos';
import CreatePlanIntervention from './CreatePlan';

/**
 * Lobe Agent Intervention Components Registry
 *
 * Intervention components allow users to review and modify tool parameters
 * before the tool is executed.
 */
export const FiAgentInterventions: Record<string, BuiltinIntervention> = {
  [FiAgentApiName.clearTodos]: ClearTodosIntervention as BuiltinIntervention,
  [FiAgentApiName.createPlan]: CreatePlanIntervention as BuiltinIntervention,
  [FiAgentApiName.createTodos]: AddTodoIntervention as BuiltinIntervention,
};

export { default as AddTodoIntervention } from './AddTodo';
export { default as ClearTodosIntervention } from './ClearTodos';
export { default as CreatePlanIntervention } from './CreatePlan';
