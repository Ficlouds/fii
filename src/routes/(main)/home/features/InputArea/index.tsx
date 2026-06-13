import { useMemo } from 'react';
import { useIsDark } from '@/hooks/useIsDark';
import DragUploadZone, { useUploadFiles } from '@/components/DragUploadZone';
import { type ActionKeys } from '@/features/ChatInput';
import { ChatInputProvider, DesktopChatInput } from '@/features/ChatInput';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { useSend } from './useSend';

const leftActions: ActionKeys[] = ['plus'];
const rightActions: ActionKeys[] = ['modelLabel', 'stt'];

interface InputAreaProps {
  incognito?: boolean;
}

const InputArea = ({ incognito = false }: InputAreaProps) => {
  const { loading, send, agentId } = useSend(); console.log("[Fi] InputArea mounted, agentId:", agentId);
  const isDark = useIsDark();
  useInitAgentConfig(agentId);
  const resolvedAgentId = agentId ?? '';
  const model = useAgentStore((s) => agentByIdSelectors.getAgentModelById(resolvedAgentId)(s));
  const provider = useAgentStore((s) =>
    agentByIdSelectors.getAgentModelProviderById(resolvedAgentId)(s),
  );
  const { handleUploadFiles } = useUploadFiles({ model, provider });

  const inputContainerProps = useMemo(
    () => ({
      resize: false,
      style: {
        background: isDark ? '#2c2c2b' : '#ffffff',
        border: isDark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(0,0,0,0.06)',
        borderRadius: 32,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        color: isDark ? '#ececec' : '#111111',
        minHeight: 69, maxHeight: 200,
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.25s ease, color 0.25s ease',
        width: '100%',
      },
    }),
    [incognito, isDark],
  );

  return (
    <div style={{ position: 'relative', width: '100%' }}>

      <DragUploadZone style={{ width: '100%' }} onUploadFiles={handleUploadFiles}>
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
            disabled: loading,
            generating: loading,
            onStop: () => {},
            shape: 'round',
          }}
          onSend={send}
          onMarkdownContentChange={(content) => {
            useChatStore.setState({ inputMessage: content });
          }}
        >
          <DesktopChatInput
            dropdownPlacement="topLeft"
            inputContainerProps={inputContainerProps}
            showEditorInline
            showRuntimeConfig={false}
          />
        </ChatInputProvider>
      </DragUploadZone>
    </div>
  );
};

export default InputArea;
