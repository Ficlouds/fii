import { create } from 'zustand';

export interface ActiveConversation {
  agentId: string;
  topicId: string;
}

interface ActiveConversationStore {
  conversation: ActiveConversation | null;
  setConversation: (ctx: ActiveConversation | null) => void;
}

export const useActiveConversationStore = create<ActiveConversationStore>((set) => ({
  conversation: null,
  setConversation: (conversation) => set({ conversation }),
}));
