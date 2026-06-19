// Executor (client-side — depends on app stores/services)
export { fiAgentExecutor } from './executor';

// Inspector components (customized tool call headers)
export { FiAgentInspectors } from './Inspector';

// Render components (read-only snapshots)
export type { TodoListRenderState } from './Render';
export {
  CallSubAgentRender,
  CallSubAgentsRender,
  CreatePlan,
  FiAgentRenders,
  PlanCard,
  TodoListRender,
  TodoListUI,
} from './Render';

// Streaming components (real-time tool execution feedback)
export {
  CallSubAgentsStreaming,
  CallSubAgentStreaming,
  CreatePlanStreaming,
  FiAgentStreamings,
} from './Streaming';

// Intervention components (interactive editing)
export {
  AddTodoIntervention,
  ClearTodosIntervention,
  CreatePlanIntervention,
  FiAgentInterventions,
} from './Intervention';

// Reusable components
export type { SortableTodoListProps, TodoListItem } from './components';
export { SortableTodoList } from './components';

// Re-export types and manifest for convenience
export { FiAgentManifest } from '../manifest';
export * from '../types';
