'use client';

import { memo, useMemo } from 'react';

import { type ActionKeys } from '@/features/ChatInput';
import { ChatInput, useConversationStore } from '@/features/Conversation';
import { useIsDark } from '@/hooks/useIsDark';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { aiChatSelectors } from '@/store/chat/selectors';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import { useSendMenuItems } from './useSendMenuItems';

const leftActions: ActionKeys[] = ['plus'];
const rightActions: ActionKeys[] = ['modelLabel', 'stt'];

const MainChatInput = memo(() => {
  const isDevMode = useUserStore((s) => userGeneralSettingsSelectors.config(s).isDevMode);
  const sendMenuItems = useSendMenuItems();
  const isDark = useIsDark();
  const loading = useChatStore(aiChatSelectors.isCurrentSendMessageLoading);
  const stopGenerating = useConversationStore((s) => s.stopGenerating);
  const isAgentConfigLoading = useAgentStore(agentSelectors.isAgentConfigLoading);

  const inputContainerProps = useMemo(
    () => ({
      resize: false,
      style: {
        background: isDark ? '#2c2c2b' : '#ffffff',
        border: isDark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(0,0,0,0.06)',
        borderRadius: 32,
        boxShadow: '0 2px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        color: isDark ? '#ececec' : '#111111',
        maxHeight: 200,
        minHeight: 69,
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto' as const,
        transition: 'background 0.25s ease, color 0.25s ease',
        width: '100%',
      },
    }),
    [isDark],
  );

  return (
    <ChatInput
      
      allowExpand={false}
      showEditorInline
      disableFollowUpVariant
      inputContainerProps={inputContainerProps}
      isConfigLoading={isAgentConfigLoading}
      leftActions={leftActions}
      rightActions={rightActions}
      showRuntimeConfig={false}
      {...(isDevMode
        ? { sendMenu: { items: sendMenuItems } }
        : {
            sendButtonProps: {
              disabled: loading,
              generating: loading,
              onStop: stopGenerating,
              shape: 'round',
            },
          })}
      onEditorReady={(instance) => {
        useChatStore.setState({ mainInputEditor: instance });
      }}
    />
  );
});

MainChatInput.displayName = 'MainChatInput';
export default MainChatInput;
