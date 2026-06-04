'use client';

import { type ChatInputProps } from '@lobehub/editor/react';
import { ChatInput, ChatInputActionBar } from '@lobehub/editor/react';
import { Center, Flexbox, Skeleton, Text } from '@lobehub/ui';
import { createStaticStyles, cx } from 'antd-style';
import { type ReactNode, use, useEffect, useRef, useState } from 'react';
import { memo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { useChatInputStore } from '@/features/ChatInput/store';
import { LayoutContainerContext } from '@/routes/(main)/_layout/DesktopLayoutContainer/LayoutContainerContext';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { fileChatSelectors, useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import { type ActionToolbarProps } from '../ActionBar';
import ActionBar from '../ActionBar';
import InputEditor from '../InputEditor';
import { useSkillDrop } from '../InputEditor/ActionTag/useSkillDrop';
import { type PlaceholderVariant } from '../InputEditor/Placeholder';
import RuntimeConfig from '../RuntimeConfig';
import SendArea from '../SendArea';
import TypoBar from '../TypoBar';
import ContextContainer from './ContextContainer';

const ROTATING = [
  'What do you want to know?',
  'How can I help you today?',
  'Ask me anything...',
  'Start a task or explore an idea...',
  'What are you working on?',
];

const styles = createStaticStyles(({ css, cssVar }) => ({
  container: css`
    .show-on-hover { opacity: 0; }
    &:hover .show-on-hover { opacity: 1; }
  `,
  footnote: css`font-size: 10px;`,
  fullscreen: css`
    position: absolute; z-index: 100; inset: 0;
    width: 100%; height: 100%; margin-block-start: 0;
    background: ${cssVar.colorBgContainer};
  `,
  inputFullscreen: css`border: none; border-radius: 0 !important;`,
  hiddenEditor: css`
    position: absolute !important;
    opacity: 0 !important;
    pointer-events: none !important;
    height: 0 !important;
    min-height: 0 !important;
    overflow: hidden !important;
    padding: 0 !important;
    margin: 0 !important;
  `,
}));

interface DesktopChatInputProps extends ActionToolbarProps {
  actionBarStyle?: React.CSSProperties;
  extentHeaderContent?: ReactNode;
  hidden?: boolean;
  inputContainerProps?: ChatInputProps;
  isConfigLoading?: boolean;
  leftContent?: ReactNode;
  placeholder?: ReactNode;
  placeholderVariant?: PlaceholderVariant;
  rightContent?: ReactNode;
  runtimeConfigSlot?: ReactNode;
  sendAreaPrefix?: ReactNode;
  showFootnote?: boolean;
  showRuntimeConfig?: boolean;
}

const DesktopChatInput = memo<DesktopChatInputProps>(
  ({
    showFootnote,
    showRuntimeConfig = true,
    runtimeConfigSlot,
    inputContainerProps,
    extentHeaderContent,
    actionBarStyle,
    borderRadius,
    extraActionItems,
    dropdownPlacement,
    hidden,
    isConfigLoading = false,
    leftContent,
    placeholder,
    placeholderVariant,
    rightContent,
    sendAreaPrefix,
  }) => {
    const { t } = useTranslation('chat');
    const layoutContainerRef = use(LayoutContainerContext);
    const [, updateSystemStatus] = useGlobalStore((s) => [
      systemStatusSelectors.chatInputHeight(s),
      s.updateSystemStatus,
    ]);
    const hasContextSelections = useFileStore(fileChatSelectors.chatContextSelectionHasItem);
    const hasFiles = useFileStore(fileChatSelectors.chatUploadFileListHasItem);
    const [slashMenuRef, expand, showTypoBar, editor, leftActions] = useChatInputStore((s) => [
      s.slashMenuRef,
      s.expand,
      s.showTypoBar,
      s.editor,
      s.leftActions,
    ]);
    const chatKey = useChatStore(chatSelectors.currentChatKey);
    const setExpand = useChatInputStore((s) => s.setExpand);
    const skillDrop = useSkillDrop();

    // Rotating placeholder state
    const [rotIdx, setRotIdx] = useState(0);
    const [rotVisible, setRotVisible] = useState(true);
    const [hasText, setHasText] = useState(false);

    useEffect(() => {
      if (editor) editor.focus();
      setExpand(false);
    }, [chatKey, editor, setExpand]);

    useEffect(() => {
      const interval = setInterval(() => {
        setRotVisible(false);
        setTimeout(() => {
          setRotIdx((p) => (p + 1) % ROTATING.length);
          setRotVisible(true);
        }, 250);
      }, 3000);
      return () => clearInterval(interval);
    }, []);

    const shouldShowContextContainer =
      leftActions.flat().includes('fileUpload') || hasContextSelections || hasFiles;
    const contextContainerNode = shouldShowContextContainer && <ContextContainer />;

    const loadingLeftSlot = isConfigLoading ? (
      <Flexbox horizontal align="center" gap={6} paddingInline={4}>
        <Skeleton.Button active shape="circle" size="small" style={{ height: 28, width: 28 }} />
        <Skeleton.Button active shape="circle" size="small" style={{ height: 28, width: 28 }} />
      </Flexbox>
    ) : null;

    const loadingRightSlot = isConfigLoading ? (
      <Skeleton.Button active shape="round" size="small" style={{ height: 32, minWidth: 64, width: 64 }} />
    ) : null;

    // Rotating placeholder shown inline next to + button
    const inlinePlaceholder = !hasText && !expand && (
      <span
        onClick={() => editor?.focus()}
        style={{
          color: 'rgba(0,0,0,0.35)',
          cursor: 'text',
          fontSize: 15,
          opacity: rotVisible ? 1 : 0,
          paddingInline: 4,
          pointerEvents: 'auto',
          transition: 'opacity 0.25s ease',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 340,
          flex: 1,
        }}
      >
        {ROTATING[rotIdx]}
      </span>
    );

    const content = (
      <Flexbox
        className={cx(styles.container, expand && styles.fullscreen)}
        gap={0}
        paddingBlock={0}
        style={{ display: hidden ? 'none' : undefined, position: 'relative' }}
        onDragOver={skillDrop.onDragOver}
        onDrop={skillDrop.onDrop}
      >
        <ChatInput
          data-testid="chat-input"
          defaultHeight={0}
          fullscreen={expand}
          maxHeight={200}
          minHeight={0}
          resize={false}
          slashMenuRef={slashMenuRef}
          footer={
            <ChatInputActionBar
              style={actionBarStyle ?? { paddingInline: 8, paddingBlock: 6 }}
              left={
                loadingLeftSlot ??
                leftContent ?? (
                  <Flexbox horizontal align="center" gap={4} style={{ flex: 1, overflow: 'hidden' }}>
                    <ActionBar
                      borderRadius={borderRadius}
                      dropdownPlacement={dropdownPlacement}
                      extraActionItems={extraActionItems}
                    />
                    {inlinePlaceholder}
                  </Flexbox>
                )
              }
              right={
                loadingRightSlot ??
                rightContent ??
                (sendAreaPrefix ? (
                  <Flexbox horizontal align={'center'} gap={6}>
                    {sendAreaPrefix}
                    <SendArea />
                  </Flexbox>
                ) : (
                  <SendArea />
                ))
              }
            />
          }
          header={
            <Flexbox gap={0}>
              {extentHeaderContent}
              {showTypoBar && <TypoBar />}
              {contextContainerNode}
            </Flexbox>
          }
          onSizeChange={(height) => {
            updateSystemStatus({ chatInputHeight: height });
            setHasText(height > 10);
          }}
          {...inputContainerProps}
          className={cx(
            expand ? styles.inputFullscreen : styles.hiddenEditor,
            inputContainerProps?.className,
          )}
        >
          <InputEditor placeholder={placeholder} placeholderVariant={placeholderVariant} />
        </ChatInput>
        {runtimeConfigSlot ?? (showRuntimeConfig && <RuntimeConfig />)}
        {showFootnote && !expand && (
          <Center style={{ pointerEvents: 'none', zIndex: 100 }}>
            <Text className={styles.footnote} type={'secondary'}>
              {t('input.disclaimer')}
            </Text>
          </Center>
        )}
      </Flexbox>
    );

    if (expand && layoutContainerRef.current)
      return createPortal(content, layoutContainerRef.current);

    return content;
  },
);

DesktopChatInput.displayName = 'DesktopChatInput';

export default DesktopChatInput;
