import type { AgentItem, FiAgentConfig } from '../agent';
import type { NewChatGroupAgent } from '../agentGroup';
import type { MetaData } from '../meta';

export const CHAT_GROUP_SESSION_ID_PREFIX = 'cg_' as const;

export const isChatGroupSessionId = (id?: string | null): id is string =>
  typeof id === 'string' && id.startsWith(CHAT_GROUP_SESSION_ID_PREFIX);

export enum FiSessionType {
  Agent = 'agent',
  Group = 'group',
}

/**
 * Extended group member that includes both relation data and agent details
 */
export type GroupMemberWithAgent = NewChatGroupAgent & AgentItem;

/**
 * Lobe Agent Session
 */
export interface FiAgentSession {
  config: FiAgentConfig;
  createdAt: Date;
  group?: string;
  id: string;
  /** Market agent identifier for published agents */
  marketIdentifier?: string;
  meta: MetaData;
  model: string;
  pinned?: boolean;
  tags?: string[];
  type: FiSessionType.Agent;
  updatedAt: Date;
}

/**
 * Group chat (not confuse with session group)
 */
export interface LobeGroupSession {
  createdAt: Date;
  group?: string;
  id: string; // Start with CHAT_GROUP_SESSION_ID_PREFIX
  members?: GroupMemberWithAgent[];
  meta: MetaData;
  pinned?: boolean;
  tags?: string[];
  type: FiSessionType.Group;
  updatedAt: Date;
}

export interface FiAgentSettings {
  /**
   * Language model agent configuration
   */
  config: FiAgentConfig;
  meta: MetaData;
}

// Union type for all session types
export type FiSession = FiAgentSession | LobeGroupSession;

export type FiSessions = FiSession[];
