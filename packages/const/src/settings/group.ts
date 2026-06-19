import type {
  FiGroupChatConfig,
  FiGroupFullConfig,
  FiGroupMetaConfig,
} from '@ficlouds/types';

export const DEFAULT_CHAT_GROUP_CHAT_CONFIG: FiGroupChatConfig = {
  allowDM: true,
  openingMessage: '',
  openingQuestions: [],
  revealDM: false,
  systemPrompt: '',
};

export const DEFAULT_CHAT_GROUP_META_CONFIG: FiGroupMetaConfig = {
  description: '',
  title: '',
};

export const DEFAULT_CHAT_GROUP_CONFIG: FiGroupFullConfig = {
  chat: DEFAULT_CHAT_GROUP_CHAT_CONFIG,
  meta: DEFAULT_CHAT_GROUP_META_CONFIG,
};
