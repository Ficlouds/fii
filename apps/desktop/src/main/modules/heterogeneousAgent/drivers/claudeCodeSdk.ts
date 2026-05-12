import type { SDKUserMessage } from '@anthropic-ai/claude-agent-sdk';
import { query } from '@anthropic-ai/claude-agent-sdk';
import type { MessageParam } from '@anthropic-ai/sdk/resources';
import { normalizeImage } from '@lobechat/heterogeneous-agents/spawn';

import type {
  HeterogeneousAgentDriver,
  HeterogeneousAgentImageAttachment,
  HeterogeneousAgentPushPriority,
  HeterogeneousAgentPushUserMessageParams,
  HeterogeneousAgentStartStreamParams,
  HeterogeneousAgentStreamHandle,
} from '../types';

/**
 * Build the user-message content blocks consumed by `query()`. The SDK
 * expects Anthropic's `MessageParam.content` shape — a `text` block plus one
 * `image` block per attachment, with the image bytes inlined as base64. We
 * fetch + cache via the shared `normalizeImage` helper (same one the spawn
 * path uses for Codex `--image <file>`) but skip `materializeImageToPath`:
 * the SDK doesn't take filesystem paths, it embeds the bytes in the JSON
 * control message.
 *
 * Failures are escalated to the caller so a partially-attached prompt never
 * reaches the model — matches the existing `resolveCliImagePaths` contract.
 */
type ContentBlock = Exclude<MessageParam['content'], string>[number];

const buildUserContent = async (
  prompt: string,
  imageList: HeterogeneousAgentImageAttachment[] | undefined,
  cacheDir: string,
): Promise<ContentBlock[]> => {
  const content: ContentBlock[] = [];
  if (prompt && prompt.length > 0) content.push({ text: prompt, type: 'text' });
  if (!imageList?.length) return content;

  const results = await Promise.allSettled(
    imageList.map((image) =>
      normalizeImage({ id: image.id, type: 'url', url: image.url }, { cacheDir }),
    ),
  );

  const failures: string[] = [];
  for (const [index, result] of results.entries()) {
    const imageId = imageList[index]?.id ?? `image-${index + 1}`;
    if (result.status === 'fulfilled') {
      content.push({
        source: {
          data: result.value.buffer.toString('base64'),
          // SDK MessageParam restricts media types to the four formats CC
          // accepts natively. `normalizeImage` returns a broader string from
          // the raw response; cast at the boundary — upstream validation
          // already ensured the type is image/* with one of these subtypes.
          media_type: result.value.mediaType as
            | 'image/gif'
            | 'image/jpeg'
            | 'image/png'
            | 'image/webp',
          type: 'base64',
        },
        type: 'image',
      });
      continue;
    }
    const reason = result.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    failures.push(`${imageId}: ${message}`);
  }

  if (failures.length > 0) {
    throw new Error(`Failed to attach image(s) to Claude Code SDK: ${failures.join('; ')}`);
  }

  return content;
};

const parseExtraArgs = (args: string[]): Record<string, string | null> => {
  // The SDK's `extraArgs` is `{ [argName]: string | null }`. `null` means
  // boolean flag (no value), string means flag + value. Map a flat argv-style
  // list to that shape, dropping the `--` prefix.
  const out: Record<string, string | null> = {};
  for (let i = 0; i < args.length; i++) {
    const raw = args[i];
    if (!raw?.startsWith('--')) continue;
    const key = raw.slice(2);
    const next = args[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = null;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
};

/**
 * Deferred async iterable channel. Producer calls `push(msg)`; the consumer
 * iterates via `iterator()`. Pending `next()` calls resolve on the next
 * push; `close()` signals end-of-stream. Used to feed `SDKUserMessage`s
 * into `query({ prompt: channel.iterator() })` from the LobeHub controller,
 * which only sees the handle (not the channel).
 *
 * Streaming-input mode (LOBE-8804): the channel survives across multiple
 * LobeHub-side turns/operations within one CC session, so each follow-up
 * `sendPrompt` IPC call lands on the SAME live CC subprocess and reuses
 * the SDK's prompt cache instead of paying respawn + cache_creation tax.
 */
interface PushChannel {
  close: () => void;
  iterator: () => AsyncGenerator<SDKUserMessage, void>;
  push: (msg: SDKUserMessage) => void;
}

const createPushChannel = (): PushChannel => {
  const queue: SDKUserMessage[] = [];
  const waiters: Array<(result: IteratorResult<SDKUserMessage>) => void> = [];
  let closed = false;

  return {
    close() {
      if (closed) return;
      closed = true;
      while (waiters.length > 0) {
        const w = waiters.shift();
        w?.({ done: true, value: undefined });
      }
    },
    async *iterator() {
      while (true) {
        if (queue.length > 0) {
          yield queue.shift()!;
          continue;
        }
        if (closed) return;
        const result = await new Promise<IteratorResult<SDKUserMessage>>((resolve) =>
          waiters.push(resolve),
        );
        if (result.done) return;
        yield result.value;
      }
    },
    push(msg) {
      if (closed) {
        throw new Error('claudeCodeSdk push channel is closed');
      }
      if (waiters.length > 0) {
        waiters.shift()?.({ done: false, value: msg });
      } else {
        queue.push(msg);
      }
    },
  };
};

const buildSdkUserMessage = async (
  prompt: string,
  imageList: HeterogeneousAgentImageAttachment[] | undefined,
  cacheDir: string,
  priority: HeterogeneousAgentPushPriority | undefined,
): Promise<SDKUserMessage> => {
  const content = await buildUserContent(prompt, imageList, cacheDir);
  return {
    message: { content, role: 'user' },
    parent_tool_use_id: null,
    ...(priority ? { priority } : {}),
    type: 'user',
  };
};

export const claudeCodeSdkDriver: HeterogeneousAgentDriver = {
  async startStream(
    params: HeterogeneousAgentStartStreamParams,
  ): Promise<HeterogeneousAgentStreamHandle> {
    const {
      abortSignal,
      args,
      cacheDir,
      canUseTool,
      cwd,
      env,
      imageList,
      onStderr,
      pathToClaudeCodeExecutable,
      prompt,
      resumeSessionId,
    } = params;

    if (!pathToClaudeCodeExecutable) {
      // Fail loudly. The SDK would otherwise look for its bundled platform
      // binary (which `apps/desktop/.pnpmfile.cjs` strips on install) and
      // exit with a confusing ENOENT.
      throw new Error(
        'claudeCodeSdk: pathToClaudeCodeExecutable is required (refusing to fall back to bundled binary)',
      );
    }

    // `cacheDir` must point at the desktop app's storage (e.g.
    // `<appStoragePath>/heteroAgent/files`) — NOT the workspace `cwd`. URL
    // image sources write through `normalizeImage`, and a workspace-rooted
    // cache would (a) pollute the user's project with a hidden folder and
    // (b) fail outright on read-only workspaces.
    const channel = createPushChannel();
    const firstMessage = await buildSdkUserMessage(prompt, imageList, cacheDir, undefined);
    channel.push(firstMessage);

    const ac = new AbortController();
    const onAbort = () => ac.abort();
    if (abortSignal.aborted) ac.abort();
    else abortSignal.addEventListener('abort', onAbort, { once: true });

    const extraArgs = parseExtraArgs(args);

    const q = query({
      prompt: channel.iterator(),
      options: {
        abortController: ac,
        // canUseTool wires CC's `AskUserQuestion` to LobeHub's intervention UI
        // (the controller builds the callback). With `bypassPermissions` mode
        // below, the SDK still fires this callback specifically for
        // `AskUserQuestion`, but skips it for regular tools — matching the
        // "auto-allow everything except clarifying questions" UX.
        canUseTool,
        cwd,
        env,
        extraArgs,
        // Mirror current spawn behavior: --include-partial-messages on so the
        // chat bubble streams text/thinking deltas instead of waiting for the
        // full block.
        includePartialMessages: true,
        pathToClaudeCodeExecutable,
        permissionMode: 'bypassPermissions',
        resume: resumeSessionId,
        // Don't load filesystem settings (~/.claude/, .claude/) — the desktop
        // app's CC sessions are scoped to the workspace `cwd` and shouldn't
        // pick up the user's personal CLAUDE.md / agents / hooks. Matches the
        // current spawn path which doesn't pass --settings.
        settingSources: [],
        stderr: onStderr,
      },
    });

    const cleanup = () => {
      abortSignal.removeEventListener('abort', onAbort);
    };

    const pushUserMessage = async (
      pushParams: HeterogeneousAgentPushUserMessageParams,
    ): Promise<void> => {
      const msg = await buildSdkUserMessage(
        pushParams.prompt,
        pushParams.imageList,
        cacheDir,
        pushParams.priority,
      );
      channel.push(msg);
    };

    return {
      close: () => {
        cleanup();
        channel.close();
        try {
          q.close();
        } catch {
          // close() may throw if the iterator already settled; ignore.
        }
      },
      interrupt: async () => {
        // streaming-input mode supports `interrupt()` for the "hard" path —
        // it aborts the current turn cleanly, injects a synthetic
        // tool_result rejection for any in-flight tool_use so history stays
        // well-formed, and leaves the query receptive to the next pushed
        // user message. Spawn-mode fallback (single-prompt-per-query) would
        // need `ac.abort()` instead, but that path no longer applies here
        // because the controller always uses `pushUserMessage` for follow-ups.
        try {
          await q.interrupt();
        } catch {
          // `interrupt()` rejects if the query has already terminated —
          // benign; the next push will start a fresh turn anyway.
        }
      },
      messages: q,
      pushUserMessage,
    };
  },
};
