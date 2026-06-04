import { useMemo } from 'react';
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
  const { loading, send, agentId } = useSend();
  useInitAgentConfig(agentId);
  const isAgentConfigLoading = useAgentStore((s) =>
    agentByIdSelectors.isAgentConfigLoadingById(agentId ?? '')(s),
  );
  const resolvedAgentId = agentId ?? '';
  const model = useAgentStore((s) => agentByIdSelectors.getAgentModelById(resolvedAgentId)(s));
  const provider = useAgentStore((s) =>
    agentByIdSelectors.getAgentModelProviderById(resolvedAgentId)(s),
  );
  const { handleUploadFiles } = useUploadFiles({ model, provider });

  const inputContainerProps = useMemo(
    () => ({
      minHeight: 52,
      resize: false,
      style: {
        background: incognito ? '#1c1c1e' : '#e8e8e6',
        border: incognito ? '1.5px solid rgba(255,255,255,0.10)' : 'none',
        borderRadius: 28,
        boxShadow: 'none',
        color: incognito ? '#ffffff' : '#111111',
        transition: 'background 0.25s ease, color 0.25s ease',
        width: '100%',
      },
    }),
    [incognito],
  );

  return (
    <div style={{ width: '100%' }}>
      {incognito && (
        <style>{`
          [data-testid="chat-input"] * { color: #ffffff !important; }
          [data-testid="chat-input"] svg { color: #ffffff !important; }
          [data-testid="chat-input"] .ant-dropdown-trigger { 
            color: #ffffff !important; 
            border-color: rgba(255,255,255,0.2) !important; 
          }
        `}</style>
      )}
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
            disabled: loading || isAgentConfigLoading,
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
            dropdownPlacement="top"
            inputContainerProps={inputContainerProps}
            showRuntimeConfig={false}
          />
        </ChatInputProvider>
      </DragUploadZone>
    </div>
  );
};

export default InputArea;
