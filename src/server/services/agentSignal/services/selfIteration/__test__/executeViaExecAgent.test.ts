// @vitest-environment node
import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';
import { RequestTrigger } from '@lobechat/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AiAgentService } from '@/server/services/aiAgent';

import type { ExecuteSelfIterationContext } from '../execute';
import { executeViaExecAgent } from '../executeViaExecAgent';

const mockExecAgent = vi.fn();

beforeEach(() => {
  mockExecAgent.mockReset();
  vi.spyOn(AiAgentService.prototype, 'execAgent').mockImplementation(mockExecAgent);
});

const buildContext = (
  overrides: Partial<ExecuteSelfIterationContext> = {},
): ExecuteSelfIterationContext => ({
  agentId: 'agent_1',
  reviewWindowEnd: '2026-05-25T00:00:00.000Z',
  reviewWindowStart: '2026-05-24T00:00:00.000Z',
  userId: 'user_1',
  ...overrides,
});

describe('executeViaExecAgent', () => {
  it('enqueues a self-iteration run via the unified execAgent path', async () => {
    mockExecAgent.mockResolvedValue({
      operationId: 'op_run_1',
      success: true,
    });

    const result = await executeViaExecAgent({
      agentId: 'agent_1',
      context: buildContext(),
      db: {} as never,
      maxSteps: 6,
      sourceId: 'src_1',
      userId: 'user_1',
    });

    expect(result).toEqual({ enqueued: true, operationId: 'op_run_1' });
    expect(mockExecAgent).toHaveBeenCalledTimes(1);

    const call = mockExecAgent.mock.calls[0][0];
    expect(call.slug).toBe(BUILTIN_AGENT_SLUGS.selfIteration);
    expect(call.trigger).toBe(RequestTrigger.AgentSignal);
    expect(call.maxSteps).toBe(6);
    expect(call.autoStart).toBe(true);
    expect(call.appContext).toEqual({ scope: 'agent-signal', suppressSignal: true });
    expect(typeof call.prompt).toBe('string');
    expect(call.prompt.length).toBeGreaterThan(0);
  });

  it('defaults mode to "review" when omitted', async () => {
    mockExecAgent.mockResolvedValue({ operationId: 'op_2', success: true });

    await executeViaExecAgent({
      agentId: 'agent_2',
      context: buildContext(),
      db: {} as never,
      maxSteps: 4,
      sourceId: 'src_2',
      userId: 'user_2',
    });

    expect(mockExecAgent.mock.calls[0][0].prompt).toContain('review');
  });

  it('propagates the caller-supplied window over the context defaults', async () => {
    mockExecAgent.mockResolvedValue({ operationId: 'op_3', success: true });

    await executeViaExecAgent({
      agentId: 'agent_3',
      context: buildContext({ reviewWindowStart: 'CTX_START', reviewWindowEnd: 'CTX_END' }),
      db: {} as never,
      maxSteps: 4,
      sourceId: 'src_3',
      userId: 'user_3',
      window: {
        end: 'CALLER_END',
        localDate: '2026-05-25',
        start: 'CALLER_START',
        timezone: 'Asia/Shanghai',
      },
    });

    const prompt = mockExecAgent.mock.calls[0][0].prompt;
    expect(prompt).toContain('Review window: CALLER_START to CALLER_END');
  });

  it('falls back to context.reviewWindow* when no window is provided', async () => {
    mockExecAgent.mockResolvedValue({ operationId: 'op_3b', success: true });

    await executeViaExecAgent({
      agentId: 'agent_3b',
      context: buildContext({
        reviewWindowEnd: 'CTX_END_ONLY',
        reviewWindowStart: 'CTX_START_ONLY',
      }),
      db: {} as never,
      maxSteps: 4,
      sourceId: 'src_3b',
      userId: 'user_3b',
    });

    const prompt = mockExecAgent.mock.calls[0][0].prompt;
    expect(prompt).toContain('Review window: CTX_START_ONLY to CTX_END_ONLY');
  });

  it('surfaces enqueue failure without throwing', async () => {
    mockExecAgent.mockResolvedValue({
      error: 'queue unavailable',
      operationId: 'op_failed',
      success: false,
    });

    const result = await executeViaExecAgent({
      agentId: 'agent_4',
      context: buildContext(),
      db: {} as never,
      maxSteps: 4,
      sourceId: 'src_4',
      userId: 'user_4',
    });

    expect(result).toEqual({
      enqueued: false,
      error: 'queue unavailable',
      operationId: 'op_failed',
    });
  });
});
