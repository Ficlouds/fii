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

  const pillBg = incognito ? '#1c1c1e' : '#e8e8e6';
  const pillBorder = incognito ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid transparent';
  const pillColor = incognito ? '#ffffff' : '#111111';

  const inputContainerProps = useMemo(
    () => ({
      minHeight: 56,
      resize: false,
      style: {
        background: pillBg,
        backdropFilter: 'none',
        border: pillBorder,
        borderRadius: 32,
        boxShadow: 'none',
        color: pillColor,
        transition: 'background 0.25s ease, border 0.25s ease, color 0.25s ease',
      },
    }),
    [pillBg, pillBorder, pillColor],
  );

  return (
    /* Outer pill wrapper — this is what user sees */
    <div
      style={{
        background: pillBg,
        border: pillBorder,
        borderRadius: 32,
        boxSizing: 'border-box',
        color: pillColor,
        overflow: 'hidden',
        transition: 'background 0.25s ease, border 0.25s ease, color 0.25s ease',
        width: '100%',
      }}
    >
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
    </div>
  );
};

export default InputArea;
