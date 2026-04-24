import { describe, expect, it } from 'vitest';

import {
  calculateConversationSpacerHeight,
  CONVERSATION_SPACER_ID,
  getConversationSpacerScrollEffect,
} from './useConversationSpacer';

describe('useConversationSpacer helpers', () => {
  it('should calculate the remaining spacer height behind the latest assistant message', () => {
    expect(calculateConversationSpacerHeight(800, 200, 80)).toBe(520);
  });

  it('should clamp spacer height to zero when content already fills the viewport', () => {
    expect(calculateConversationSpacerHeight(800, 300, 600)).toBe(0);
  });

  it('should keep the reserved spacer id stable', () => {
    expect(CONVERSATION_SPACER_ID).toBe('__conversation_spacer__');
  });

  it('should cancel pin retries without shrinking the spacer while AI is still streaming', () => {
    expect(
      getConversationSpacerScrollEffect({
        delta: -24,
        hasPrevOffset: true,
        isAIGenerating: true,
        isMounted: true,
        isUserScrollIntent: true,
      }),
    ).toEqual({
      cancelPin: true,
      shrinkSpacer: false,
    });
  });

  it('should both cancel pin retries and shrink the spacer after streaming stops', () => {
    expect(
      getConversationSpacerScrollEffect({
        delta: -24,
        hasPrevOffset: true,
        isAIGenerating: false,
        isMounted: true,
        isUserScrollIntent: true,
      }),
    ).toEqual({
      cancelPin: true,
      shrinkSpacer: true,
    });
  });

  it('should keep pin retries for programmatic upward scroll while AI is still streaming', () => {
    expect(
      getConversationSpacerScrollEffect({
        delta: -24,
        hasPrevOffset: true,
        isAIGenerating: true,
        isMounted: true,
        isUserScrollIntent: false,
      }),
    ).toEqual({
      cancelPin: false,
      shrinkSpacer: false,
    });
  });

  it('should not shrink the spacer for programmatic upward scroll after streaming stops', () => {
    expect(
      getConversationSpacerScrollEffect({
        delta: -24,
        hasPrevOffset: true,
        isAIGenerating: false,
        isMounted: true,
        isUserScrollIntent: false,
      }),
    ).toEqual({
      cancelPin: false,
      shrinkSpacer: false,
    });
  });
});
