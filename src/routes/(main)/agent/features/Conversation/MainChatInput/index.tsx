'use client';

import { memo, useMemo } from 'react';

import { type ActionKeys } from '@/features/ChatInput';
import { ChatInputProvider, DesktopChatInput } from '@/features/ChatInput';
import { useIsDark } from '@/hooks/useIsDark';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { useConversationStore } from '@/features/Conversation';
import { aiChatSelectors } from '@/store/chat/selectors';

const leftActions: ActionKeys[] = ['plus'];
const rightActions: ActionKeys[] = ['modelLabel', 'stt'];

const MainChatInput = memo(() => {
  const isDark = useIsDark();
  const isAgentConfigLoading = useAgentStore(agentSelectors.isAgentConfigLoading);
  const loading = useChatStore(aiChatSelectors.isCurrentSendMessageLoading);
  const stopGenerating = useConversationStore((s) => s.stopGenerating);
  const sendMessage = useConversationStore((s) => s.sendMessage);
  const agentId = useConversationStore((s) => s.context?.agentId);

  const inputContainerProps = useMemo(
    () => ({
      resize: false,
      style: {
        background: isDark ? '#2c2c2b' : '#ffffff',
        border: isDark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(0,0,0,0.06)',
        borderRadius: 32,
        boxShadow: 'none',
        color: isDark ? '#ececec' : '#111111',
        maxHeight: 200,
        minHeight: 60,
        overflowY: 'auto' as const,
        transition: 'background 0.25s ease, color 0.25s ease',
        width: '100%',
      },
    }),
    [isDark],
  );

  return (
    <ChatInputProvider
      agentId={agentId}
      allowExpand={false}
      leftActions={leftActions}
      rightActions={rightActions}
      slashPlacement="bottom"
      chatInputEditorRef={(instance) => {
        if (!instance) return;
        useChatStore.setState({ mainInputEditor: instance });
      }}
      sendButtonProps={{
        disabled: loading || isAgentConfigLoading,
        generating: loading,
        onStop: stopGenerating,
        shape: 'round',
      }}
      onSend={async ({ getMarkdownContent, getEditorData }) => {
        const message = getMarkdownContent?.() ?? '';
        if (!message.trim()) return;
        await sendMessage({ message });
      }}
      onMarkdownContentChange={(content) => {
        useChatStore.setState({ inputMessage: content });
      }}
    >
      <DesktopChatInput
        dropdownPlacement="topLeft"
        inputContainerProps={inputContainerProps}
        placeholderVariant="default"
        showRuntimeConfig={false}
      />
    </ChatInputProvider>
  );
});

MainChatInput.displayName = 'MainChatInput';
export default MainChatInput;
