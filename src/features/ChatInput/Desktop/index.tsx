'use client';

import { type ChatInputProps } from '@lobehub/editor/react';
import { ChatInput } from '@lobehub/editor/react';
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
    const [chatInputHeight, updateSystemStatus] = useGlobalStore((s) => [
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

    const [rotIdx, setRotIdx] = useState(0);
    const [rotVisible, setRotVisible] = useState(true);
    const [focused, setFocused] = useState(false);
    const [hasText, setHasText] = useState(false);

    useEffect(() => {
      if (editor) editor.focus();
      setExpand(false);
    }, [chatKey, editor, setExpand]);

    useEffect(() => {
      const iv = setInterval(() => {
        setRotVisible(false);
        setTimeout(() => {
          setRotIdx((p) => (p + 1) % ROTATING.length);
          setRotVisible(true);
        }, 250);
      }, 3000);
      return () => clearInterval(iv);
    }, []);

    const shouldShowContextContainer =
      leftActions.flat().includes('fileUpload') || hasContextSelections || hasFiles;

    const showPlaceholder = !focused && !hasText && !expand;

    const content = (
      <Flexbox
        className={cx(styles.container, expand && styles.fullscreen)}
        gap={0}
        paddingBlock={0}
        style={{ display: hidden ? 'none' : undefined }}
        onDragOver={skillDrop.onDragOver}
        onDrop={skillDrop.onDrop}
      >
        {/* Single row bar */}
        <Flexbox
          horizontal
          align="center"
          gap={0}
          style={{
            minHeight: 52,
            padding: '0 4px',
            position: 'relative',
            width: '100%',
          }}
          onClick={() => {
            editor?.focus();
            setFocused(true);
          }}
        >
          {/* Left: + button */}
          {isConfigLoading ? (
            <Flexbox horizontal align="center" gap={6} paddingInline={4}>
              <Skeleton.Button active shape="circle" size="small" style={{ height: 28, width: 28 }} />
            </Flexbox>
          ) : (
            leftContent ?? (
              <ActionBar
                borderRadius={borderRadius}
                dropdownPlacement={dropdownPlacement}
                extraActionItems={extraActionItems}
              />
            )
          )}

          {/* Center: rotating placeholder OR real editor */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              position: 'relative',
              paddingInline: 8,
            }}
          >
            {/* Rotating placeholder — shown when not focused and no text */}
            {showPlaceholder && (
              <div
                style={{
                  color: 'rgba(0,0,0,0.38)',
                  fontSize: 15,
                  left: 8,
                  opacity: rotVisible ? 1 : 0,
                  pointerEvents: 'none',
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  transition: 'opacity 0.25s ease',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  right: 8,
                }}
              >
                {ROTATING[rotIdx]}
              </div>
            )}

            {/* Real editor — always mounted, hidden when not focused + no text */}
            <div
              style={{
                opacity: showPlaceholder ? 0 : 1,
                pointerEvents: showPlaceholder ? 'none' : 'auto',
                transition: 'opacity 0.15s ease',
              }}
              onFocus={() => setFocused(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setFocused(false);
                }
              }}
            >
              <ChatInput
                data-testid="chat-input"
                defaultHeight={chatInputHeight || 24}
                fullscreen={expand}
                maxHeight={200}
                minHeight={24}
                resize={false}
                slashMenuRef={slashMenuRef}
                footer={null}
                header={
                  <Flexbox gap={0}>
                    {extentHeaderContent}
                    {showTypoBar && <TypoBar />}
                    {shouldShowContextContainer && <ContextContainer />}
                  </Flexbox>
                }
                onSizeChange={(height) => {
                  updateSystemStatus({ chatInputHeight: height });
                  setHasText(height > 30);
                }}
                {...inputContainerProps}
                className={cx(expand && styles.inputFullscreen, inputContainerProps?.className)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  borderRadius: 0,
                  ...inputContainerProps?.style,
                }}
              >
                <InputEditor placeholder={placeholder} placeholderVariant={placeholderVariant} />
              </ChatInput>
            </div>
          </div>

          {/* Right: agent selector + mic + send */}
          {isConfigLoading ? (
            <Skeleton.Button active shape="round" size="small" style={{ height: 32, minWidth: 64, width: 64 }} />
          ) : (
            rightContent ?? (
              sendAreaPrefix ? (
                <Flexbox horizontal align={'center'} gap={6}>
                  {sendAreaPrefix}
                  <SendArea />
                </Flexbox>
              ) : (
                <SendArea />
              )
            )
          )}
        </Flexbox>

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
