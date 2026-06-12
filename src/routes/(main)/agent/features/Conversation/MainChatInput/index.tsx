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

const []: ActionKeys[] = ['contextWindow'];
const []: ActionKeys[] = ['promptTransform', 'contextWindow'];

/**
 * MainChatInput
 *
 * Custom ChatInput implementation for main chat page.
 * Uses ChatInput from @/features/Conversation which handles all send logic
 * including error alerts display.
 * Only adds MessageFromUrl for desktop mode.
 */
const MainChatInput = memo(() => {
  const isDevMode = useUserStore((s) => userGeneralSettingsSelectors.config(s).isDevMode);
  const sendMenuItems = useSendMenuItems();
  const isDark = useIsDark();
  const loading = useChatStore(aiChatSelectors.isCurrentSendMessageLoading);
  const stopGenerating = useConversationStore((s) => s.stopGenerating);

  const isAgentConfigLoading = useAgentStore(agentSelectors.isAgentConfigLoading);

  const leftActions: ActionKeys[] = useMemo(() => ['plus'], []);
  const rightActions: ActionKeys[] = useMemo(() => ['modelLabel', 'stt'], []);

  const inputContainerProps = useMemo(
    () => ({
      style: {
        background: isDark ? '#2c2c2b' : '#ffffff',
        border: isDark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(0,0,0,0.06)',
        borderRadius: 12,
        boxShadow: 'none',
        minHeight: 69, maxHeight: 200,
        transition: 'background 0.25s ease, color 0.25s ease',
        width: '100%',
      },
    }),
    [isDark],
  );

  return (
    <ChatInput
      skipScrollMarginWithList
      inputContainerProps={inputContainerProps}
      isConfigLoading={isAgentConfigLoading}
      leftActions={leftActions}
      rightActions={rightActions}
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
        // Sync to global ChatStore for compatibility with other features
        useChatStore.setState({ mainInputEditor: instance });
      }}
    />
  );
});

MainChatInput.displayName = 'MainChatInput';

export default MainChatInput;
