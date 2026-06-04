import { Flexbox } from '@lobehub/ui';
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

const InputArea = () => {
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
        borderRadius: 28,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.06)',
        background: '#f9f8f7',
        backdropFilter: 'none',
      },
    }),
    [],
  );

  return (
    <Flexbox gap={16} style={{ marginBottom: 16 }}>
      <DragUploadZone
        style={{ position: 'relative', zIndex: 1 }}
        onUploadFiles={handleUploadFiles}
      >
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
            dropdownPlacement="bottomLeft"
            inputContainerProps={inputContainerProps}
            showRuntimeConfig={false}
          />
        </ChatInputProvider>
      </DragUploadZone>
    </Flexbox>
  );
};

export default InputArea;
