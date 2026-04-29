// @vitest-environment node
import { createAdapter } from '@lobechat/heterogeneous-agents';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MessageModel } from '@/database/models/message';

import { CloudCCMessagePersistence } from './messagePersistence';

vi.mock('@lobechat/heterogeneous-agents', () => ({
  createAdapter: vi.fn(),
}));

vi.mock('@/database/models/message', () => ({
  MessageModel: vi.fn(),
}));

describe('CloudCCMessagePersistence', () => {
  const mockCreate = vi.fn();
  const mockQuery = vi.fn();
  const mockUpdate = vi.fn();
  const mockUpdateMetadata = vi.fn();
  const mockUpdatePluginState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(MessageModel).mockImplementation(
      () =>
        ({
          create: mockCreate,
          query: mockQuery,
          update: mockUpdate,
          updateMetadata: mockUpdateMetadata,
          updatePluginState: mockUpdatePluginState,
        }) as any,
    );
  });

  it('reuses the existing assistant message for the first ingested step', async () => {
    mockQuery.mockResolvedValue([]);

    vi.mocked(createAdapter).mockReturnValue({
      adapt: vi
        .fn()
        .mockReturnValueOnce([
          {
            data: { model: 'claude-sonnet-4-6', provider: 'cloud-claude-code' },
            type: 'stream_start',
          },
        ])
        .mockReturnValueOnce([
          {
            data: { chunkType: 'text', content: 'Hello from Cloud CC' },
            type: 'stream_chunk',
          },
        ]),
      flush: vi.fn().mockReturnValue([]),
      sessionId: 'cc-session-1',
    } as any);

    const persistence = new CloudCCMessagePersistence(
      {} as any,
      'user-1',
      'topic-1',
      'agent-1',
      'assistant-existing',
    );

    const result = await persistence.processBatch([{ type: 'assistant' }, { type: 'assistant' }]);

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith('assistant-existing', {
      content: 'Hello from Cloud CC',
      model: 'claude-sonnet-4-6',
    });
    expect(result).toEqual({
      assistantMessageId: 'assistant-existing',
      sessionId: 'cc-session-1',
      toolMessageIds: [],
    });
  });

  it('ignores subagent-only batches so they do not mutate the main assistant', async () => {
    mockQuery.mockResolvedValue([]);

    vi.mocked(createAdapter).mockReturnValue({
      adapt: vi
        .fn()
        .mockReturnValueOnce([
          {
            data: {
              chunkType: 'text',
              content: 'subagent summary',
              subagent: {
                parentToolCallId: 'toolu-parent',
                subagentMessageId: 'msg-sub-1',
              },
            },
            type: 'stream_chunk',
          },
        ])
        .mockReturnValueOnce([
          {
            data: {
              content: 'tool result',
              subagent: { parentToolCallId: 'toolu-parent' },
              toolCallId: 'toolu-child',
            },
            type: 'tool_result',
          },
        ]),
      flush: vi.fn().mockReturnValue([]),
      sessionId: 'cc-session-subagent',
    } as any);

    const persistence = new CloudCCMessagePersistence(
      {} as any,
      'user-1',
      'topic-1',
      'agent-1',
      'assistant-existing',
    );

    const result = await persistence.processBatch([{ type: 'assistant' }, { type: 'user' }]);

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockUpdateMetadata).not.toHaveBeenCalled();
    expect(result).toEqual({
      assistantMessageId: 'assistant-existing',
      sessionId: 'cc-session-subagent',
      toolMessageIds: [],
    });
  });

  it('chains later main-agent steps after the latest persisted message', async () => {
    mockQuery.mockResolvedValue([{ id: 'assistant-prev' }, { id: 'tool-prev' }]);

    mockCreate.mockResolvedValue({ id: 'assistant-step-2' });

    vi.mocked(createAdapter).mockReturnValue({
      adapt: vi
        .fn()
        .mockReturnValueOnce([
          {
            data: { model: 'claude-sonnet-4-6', provider: 'cloud-claude-code' },
            type: 'stream_start',
          },
        ])
        .mockReturnValueOnce([
          {
            data: { chunkType: 'text', content: 'Final answer' },
            type: 'stream_chunk',
          },
        ]),
      flush: vi.fn().mockReturnValue([]),
      sessionId: 'cc-session-step-2',
    } as any);

    const persistence = new CloudCCMessagePersistence({} as any, 'user-1', 'topic-1', 'agent-1');

    const result = await persistence.processBatch([{ type: 'assistant' }, { type: 'assistant' }]);

    expect(mockCreate).toHaveBeenCalledWith({
      agentId: 'agent-1',
      content: '',
      model: 'claude-sonnet-4-6',
      parentId: 'tool-prev',
      provider: 'cloud-claude-code',
      role: 'assistant',
      topicId: 'topic-1',
    });
    expect(mockUpdate).toHaveBeenCalledWith('assistant-step-2', {
      content: 'Final answer',
      model: 'claude-sonnet-4-6',
    });
    expect(result).toEqual({
      assistantMessageId: 'assistant-step-2',
      sessionId: 'cc-session-step-2',
      toolMessageIds: [],
    });
  });

  it('pre-registers tools on the assistant before creating tool rows', async () => {
    mockQuery.mockResolvedValue([]);

    mockCreate
      .mockResolvedValueOnce({ id: 'assistant-step-1' })
      .mockResolvedValueOnce({ id: 'tool-msg-1' });

    vi.mocked(createAdapter).mockReturnValue({
      adapt: vi
        .fn()
        .mockReturnValueOnce([
          {
            data: { model: 'claude-sonnet-4-6', provider: 'cloud-claude-code' },
            type: 'stream_start',
          },
        ])
        .mockReturnValueOnce([
          {
            data: {
              chunkType: 'tools_calling',
              toolsCalling: [
                {
                  apiName: 'WebFetch',
                  arguments: '{"url":"https://github.com/lobehub/lobehub"}',
                  id: 'tool-call-1',
                  identifier: 'claude-code',
                  type: 'default',
                },
              ],
            },
            type: 'stream_chunk',
          },
        ])
        .mockReturnValueOnce([
          {
            data: {
              toolCalling: {
                apiName: 'WebFetch',
                arguments: '{"url":"https://github.com/lobehub/lobehub"}',
                id: 'tool-call-1',
                identifier: 'claude-code',
                type: 'default',
              },
            },
            type: 'tool_start',
          },
        ]),
      flush: vi.fn().mockReturnValue([]),
      sessionId: 'cc-session-tools',
    } as any);

    await new CloudCCMessagePersistence({} as any, 'user-1', 'topic-1', 'agent-1').processBatch([
      { type: 'assistant' },
      { type: 'assistant' },
      { type: 'assistant' },
    ]);

    expect(mockUpdate).toHaveBeenNthCalledWith(
      1,
      'assistant-step-1',
      expect.objectContaining({
        model: 'claude-sonnet-4-6',
        tools: [
          expect.objectContaining({
            apiName: 'WebFetch',
            id: 'tool-call-1',
          }),
        ],
      }),
    );
    expect(mockCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        parentId: 'assistant-step-1',
        role: 'tool',
        tool_call_id: 'tool-call-1',
      }),
    );
  });
});
