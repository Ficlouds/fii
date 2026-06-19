import type { FiSessions } from './agentSession';

export type SessionGroupId = string;

export enum SessionDefaultGroup {
  Default = 'default',
  Pinned = 'pinned',
}

export interface SessionGroupItem extends SessionGroupItemBase {
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionGroupItemBase {
  id: string;
  name: string;
  sort?: number | null;
}

export type SessionGroups = SessionGroupItem[];

export interface CustomSessionGroup extends SessionGroupItem {
  children: FiSessions;
}

export type FiSessionGroups = SessionGroupItem[];
