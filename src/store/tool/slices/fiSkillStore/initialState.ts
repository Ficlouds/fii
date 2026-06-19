import { type FiSkillServer } from './types';

/**
 * Fi Skill Store state interface
 *
 * NOTE: All connection states and tool data are fetched in real-time from Market API, not stored in local database
 */
export interface FiSkillStoreState {
  /** Set of executing tool call IDs */
  fiSkillExecutingToolIds: Set<string>;
  /** Set of loading Provider IDs */
  fiSkillLoadingIds: Set<string>;
  /** List of connected Fi Skill Servers */
  fiSkillServers: FiSkillServer[];
}

/**
 * Fi Skill Store initial state
 */
export const initialFiSkillStoreState: FiSkillStoreState = {
  fiSkillExecutingToolIds: new Set(),
  fiSkillLoadingIds: new Set(),
  fiSkillServers: [],
};
