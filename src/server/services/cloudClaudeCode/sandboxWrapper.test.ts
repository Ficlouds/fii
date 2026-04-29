// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { buildSandboxWrapperCommand } from './sandboxWrapper';

describe('buildSandboxWrapperCommand', () => {
  it('cuts main-agent batches on stream_event message_start boundaries', () => {
    const command = buildSandboxWrapperCommand({
      agentId: 'agent-1',
      prompt: 'summarize this repo',
      topicId: 'topic-1',
    });

    expect(command).toContain('streamEventMessageId');
    expect(command).toContain('message_start');
    expect(command).toContain('nextMainMessageId = streamEventMessageId || assistantMessageId');
    expect(command).toContain('let processing = Promise.resolve()');
    expect(command).toContain('then(() => processLine(raw))');
  });

  it('posts structured debug logs when debug mode is enabled', () => {
    const command = buildSandboxWrapperCommand({
      agentId: 'agent-1',
      assistantMessageId: 'assistant-1',
      prompt: 'summarize this repo',
      topicId: 'topic-1',
    });

    expect(command).toContain('LOBEHUB_CLOUD_CC_DEBUG');
    expect(command).toContain('function postDebug(phase, payload)');
    expect(command).toContain('/trpc/lambda/cloudClaudeCode.debugLog');
    expect(command).toContain('/trpc/lambda/cloudClaudeCode.updateRunStatus');
    expect(command).toContain('postRunStatus');
    expect(command).toContain('completed');
    expect(command).toContain('boundary');
    expect(command).toContain('flush:start');
  });
});
