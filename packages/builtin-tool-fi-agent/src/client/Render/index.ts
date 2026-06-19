import { FiAgentApiName } from '../../types';
import CallSubAgentRender from './CallSubAgent';
import CallSubAgentsRender from './CallSubAgents';
import CreatePlan from './CreatePlan';
import TodoListRender from './TodoList';

/**
 * Lobe Agent Tool Render Components Registry
 *
 * Sub-agent dispatch operations render a card showing the dispatched
 * task(s). Plan operations render the PlanCard UI. Todo operations
 * share a single TodoList render.
 */
export const FiAgentRenders = {
  [FiAgentApiName.callSubAgent]: CallSubAgentRender,
  [FiAgentApiName.callSubAgents]: CallSubAgentsRender,

  // Plan operations render the PlanCard UI
  [FiAgentApiName.createPlan]: CreatePlan,
  [FiAgentApiName.updatePlan]: CreatePlan,

  // All todo operations render the same TodoList UI
  [FiAgentApiName.clearTodos]: TodoListRender,
  [FiAgentApiName.createTodos]: TodoListRender,
  [FiAgentApiName.updateTodos]: TodoListRender,
};

export { default as CallSubAgentRender } from './CallSubAgent';
export { default as CallSubAgentsRender } from './CallSubAgents';
export { default as CreatePlan, PlanCard } from './CreatePlan';
export type { TodoListRenderState } from './TodoList';
export { default as TodoListRender, TodoListUI } from './TodoList';
