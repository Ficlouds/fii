import {
  ChatInput,
  ChatInputActionBar,
  Editor,
  SendButton,
  useEditor,
} from '@lobehub/editor/react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useEnterToSend } from '@/hooks/useEnterToSend';
import { useTaskStore } from '@/store/task';
import { taskDetailSelectors } from '@/store/task/selectors';

interface TaskChatInputProps {
  /** Invoked after a message has been sent (e.g. to close a drawer). */
  onAfterSend?: () => void;
  taskId: string;
}

const TaskChatInput = memo<TaskChatInputProps>(({ taskId, onAfterSend }) => {
  const { t } = useTranslation('chat');
  const editor = useEditor();
  const runTask = useTaskStore((s) => s.runTask);
  const canRun = useTaskStore(taskDetailSelectors.canRunActiveTask);
  const [submitting, setSubmitting] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const shouldSendOnEnter = useEnterToSend();

  const handleSubmit = useCallback(async () => {
    const trimmed = String(editor?.getDocument?.('markdown') ?? '').trim();
    if (!trimmed || submitting || !canRun) return;
    setSubmitting(true);
    try {
      await runTask(taskId, { prompt: trimmed });
      editor?.cleanDocument?.();
      setHasContent(false);
      onAfterSend?.();
    } finally {
      setSubmitting(false);
    }
  }, [taskId, editor, runTask, submitting, canRun, onAfterSend]);

  return (
    <ChatInput
      maxHeight={200}
      minHeight={40}
      footer={
        <ChatInputActionBar
          left={null}
          style={{ paddingRight: 8 }}
          right={
            <SendButton
              disabled={(!hasContent || !canRun) && !submitting}
              loading={submitting}
              shape={'round'}
              title={t('taskDetail.sendMessage')}
              type={'primary'}
              onClick={handleSubmit}
            />
          }
        />
      }
    >
      <Editor
        content={''}
        editor={editor}
        enablePasteMarkdown={false}
        markdownOption={false}
        placeholder={t('taskDetail.commentPlaceholder')}
        type={'text'}
        variant={'chat'}
        onChange={(ed) => {
          setHasContent(!ed?.isEmpty);
        }}
        onPressEnter={({ event }) => {
          if (shouldSendOnEnter(event)) {
            handleSubmit();
            return true;
          }
        }}
      />
    </ChatInput>
  );
});

TaskChatInput.displayName = 'TaskChatInput';

export default TaskChatInput;
