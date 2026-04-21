'use client';

import { EditorProvider, useEditor } from '@lobehub/editor/react';
import { Flexbox } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import type { CSSProperties } from 'react';
import { memo, useEffect, useRef } from 'react';

import { DiffAllToolbar, EditorCanvas as SharedEditorCanvas } from '@/features/EditorCanvas';
import WideScreenContainer from '@/features/WideScreenContainer';
import { useRegisterFilesHotkeys } from '@/hooks/useHotkeys';
import { documentHistoryQueueService } from '@/services/documentHistoryQueue';
import { pageAgentRuntime } from '@/store/tool/slices/builtin/executors/lobe-page-agent';
import { StyleSheet } from '@/utils/styles';

import TitleSection, { type TitleSectionProps } from './TitleSection';

const styles = StyleSheet.create({
  contentWrapper: {
    display: 'flex',
    overflowY: 'auto',
    position: 'relative',
  },
  editorContainer: {
    minWidth: 0,
    position: 'relative',
  },
  editorContent: {
    overflowY: 'auto',
    paddingBlock: 16,
    position: 'relative',
  },
  root: {
    background: cssVar.colorBgContainer,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export interface TopicCanvasProps extends TitleSectionProps {
  agentId?: string;
  documentId?: string;
  placeholder?: string;
  style?: CSSProperties;
  topicId?: string | null;
}

type PageAgentEditor = NonNullable<Parameters<typeof pageAgentRuntime.setEditor>[0]>;

const TopicCanvasPageAgentBridge = memo<
  Pick<TopicCanvasProps, 'documentId' | 'onTitleChange' | 'title'>
>(({ documentId, onTitleChange, title }) => {
  const editor = useEditor();
  const pageAgentEditor = editor as unknown as PageAgentEditor | undefined;
  const titleRef = useRef(title ?? '');
  const onTitleChangeRef = useRef(onTitleChange);

  useEffect(() => {
    titleRef.current = title ?? '';
  }, [title]);

  useEffect(() => {
    onTitleChangeRef.current = onTitleChange;
  }, [onTitleChange]);

  useEffect(() => {
    if (pageAgentEditor) {
      pageAgentRuntime.setEditor(pageAgentEditor);
    }

    return () => {
      pageAgentRuntime.setEditor(null);
    };
  }, [pageAgentEditor]);

  useEffect(() => {
    pageAgentRuntime.setCurrentDocId(documentId);
    pageAgentRuntime.setTitleHandlers(
      (nextTitle) => {
        titleRef.current = nextTitle;
        onTitleChangeRef.current?.(nextTitle);
      },
      () => titleRef.current,
    );
    pageAgentRuntime.setBeforeMutateHandler(() => {
      if (!documentId || !editor) return;

      try {
        const editorData = editor.getDocument('json');
        documentHistoryQueueService.enqueue({
          documentId,
          editorData: JSON.stringify(editorData),
          saveSource: 'llm_call',
        });
      } catch (error) {
        console.error('[TopicCanvas] Failed to capture history snapshot before mutation:', error);
      }
    });

    return () => {
      pageAgentRuntime.setCurrentDocId(undefined);
      pageAgentRuntime.setTitleHandlers(null, null);
      pageAgentRuntime.setBeforeMutateHandler(null);
      void documentHistoryQueueService.flush();
    };
  }, [documentId, editor]);

  return null;
});

TopicCanvasPageAgentBridge.displayName = 'TopicCanvasPageAgentBridge';

const TopicCanvasBody = memo<TopicCanvasProps>(
  ({ placeholder, style, title, documentId, onTitleChange }) => {
    const editor = useEditor();

    useRegisterFilesHotkeys();

    return (
      <>
        <TopicCanvasPageAgentBridge
          documentId={documentId}
          title={title}
          onTitleChange={onTitleChange}
        />
        <Flexbox
          horizontal
          height={'100%'}
          style={styles.contentWrapper}
          width={'100%'}
          onClick={() => editor?.focus()}
        >
          <Flexbox flex={1} height={'100%'} style={styles.editorContainer}>
            <WideScreenContainer wrapperStyle={{ cursor: 'text' }}>
              <Flexbox flex={1} style={styles.editorContent}>
                <TitleSection title={title} onTitleChange={onTitleChange} />
                <SharedEditorCanvas
                  documentId={documentId}
                  editor={editor}
                  placeholder={placeholder}
                  sourceType={'notebook'}
                  style={style}
                />
              </Flexbox>
            </WideScreenContainer>
            {documentId && editor && <DiffAllToolbar documentId={documentId} editor={editor} />}
          </Flexbox>
        </Flexbox>
      </>
    );
  },
);

TopicCanvasBody.displayName = 'TopicCanvasBody';

/**
 * TopicCanvas
 *
 * Document canvas for a Topic. Mirrors PageEditor's editor-region layout but
 * without the page chrome (header, title, right panel). Renders an empty
 * editor; topic-document data wiring (fetch/auto-save) is intentionally
 * deferred.
 */
const TopicCanvas = memo<TopicCanvasProps>((props) => {
  return (
    <Flexbox flex={1} height={'100%'} style={styles.root} width={'100%'}>
      <EditorProvider>
        <TopicCanvasBody {...props} />
      </EditorProvider>
    </Flexbox>
  );
});

TopicCanvas.displayName = 'TopicCanvas';

export default TopicCanvas;
