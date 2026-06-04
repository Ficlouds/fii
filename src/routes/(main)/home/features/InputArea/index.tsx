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

interface InputAreaProps {
  fg?: string;
  fgSub?: string;
  incognito?: boolean;
  inputBg?: string;
}

const InputArea = ({ incognito = false, inputBg, fg }: InputAreaProps) => {
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

  const bg = inputBg ?? (incognito ? '#141414' : '#f9f8f7');

  const inputContainerProps = useMemo(
    () => ({
      minHeight: 44,
      resize: false,
      style: {
        background: bg,
        backdropFilter: 'none',
        border: 'none',
        borderRadius: 16,
        boxShadow: 'none',
        color: fg ?? (incognito ? '#fff' : '#111'),
        outline: 'none',
      },
    }),
    [bg, fg, incognito],
  );

  return (
    <Flexbox style={{ width: '100%' }}>
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
