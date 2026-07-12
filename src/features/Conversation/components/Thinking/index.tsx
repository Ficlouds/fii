import { Accordion, AccordionItem, ScrollArea } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { memo, useEffect, useRef, useState } from 'react';

import MarkdownMessage from '@/features/Conversation/Markdown';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { type ChatCitationItem } from '@/types/index';

import Title from './Title';

const styles = createStaticStyles(({ css, cssVar }) => ({
  contentScroll: css`
    max-height: min(40vh, 320px);
    padding-block-end: 8px;
    padding-inline: 8px;
    color: ${cssVar.colorTextDescription};

    article * {
      color: ${cssVar.colorTextDescription};
    }
  `,
  scrollRoot: css`
    border-radius: 0;
    background: transparent;
  `,
  // Fade-out wrapper — fades the entire thinking block when response starts
  fadeWrapper: css`
    transition: opacity 600ms ease-out;

    &.fading {
      pointer-events: none;
      opacity: 0;
    }
  `,
}));

interface ThinkingProps {
  citations?: ChatCitationItem[];
  content?: string | ReactNode;
  duration?: number;
  style?: CSSProperties;
  thinking?: boolean;
  thinkingAnimated?: boolean;
}

const Thinking = memo<ThinkingProps>((props) => {
  const { content, duration, thinking, citations, thinkingAnimated } = props;
  const [showDetail, setShowDetail] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { ref, handleScroll } = useAutoScroll<HTMLDivElement>({
    deps: [content, showDetail],
    enabled: thinking && showDetail,
    threshold: 120,
  });

  useEffect(() => {
    if (thinking) {
      // Thinking started — show block immediately
      setVisible(true);
      setFading(false);
      setShowDetail(true);
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
    } else {
      // Thinking ended — fade out smoothly then hide
      setShowDetail(false);
      setFading(true);
      fadeTimerRef.current = setTimeout(() => {
        setVisible(false);
        setFading(false);
      }, 650); // slightly longer than CSS transition
    }
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [thinking]);

  if (!visible) return null;

  return (
    <div className={`${styles.fadeWrapper} ${fading ? 'fading' : ''}`}>
      <Accordion
        expandedKeys={showDetail ? ['thinking'] : []}
        gap={8}
        onExpandedChange={(keys) => setShowDetail(keys.length > 0)}
      >
        <AccordionItem
          itemKey={'thinking'}
          paddingBlock={4}
          paddingInline={4}
          title={<Title duration={duration} showDetail={showDetail} thinking={thinking} />}
        >
          <ScrollArea
            disableContentFit
            scrollFade
            className={styles.scrollRoot}
            contentProps={{
              style: {
                color: 'inherit',
                display: 'block',
                fontSize: 'inherit',
                gap: 0,
                lineHeight: 'inherit',
              },
            }}
            viewportProps={{
              className: styles.contentScroll,
              ref: ref as RefObject<HTMLDivElement>,
              onScroll: handleScroll,
            }}
          >
            {typeof content === 'string' ? (
              <MarkdownMessage
                animated={thinkingAnimated}
                citations={citations}
                style={{ overflow: 'unset' }}
                variant={'chat'}
              >
                {content}
              </MarkdownMessage>
            ) : (
              content
            )}
          </ScrollArea>
        </AccordionItem>
      </Accordion>
    </div>
  );
});

export default Thinking;
