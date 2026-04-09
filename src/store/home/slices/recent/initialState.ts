import { type RecentItem } from '@/server/routers/lambda/recent';
import { type FileListItem } from '@/types/files';
import { type RecentTopic } from '@/types/topic';

export interface RecentState {
  isRecentPagesInit: boolean;
  isRecentResourcesInit: boolean;
  isRecentTopicsInit: boolean;
  isRecentsInit: boolean;
  recentPages: any[];
  recentResources: FileListItem[];
  recentTopics: RecentTopic[];
  recents: RecentItem[];
}

export const initialRecentState: RecentState = {
  isRecentPagesInit: false,
  isRecentResourcesInit: false,
  isRecentTopicsInit: false,
  isRecentsInit: false,
  recentPages: [],
  recentResources: [],
  recentTopics: [],
  recents: [],
};
