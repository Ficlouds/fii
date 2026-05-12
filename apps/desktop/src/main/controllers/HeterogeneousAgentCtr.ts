import type { ChildProcess } from 'node:child_process';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { access, appendFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Readable, Writable } from 'node:stream';
import { finished as streamFinished } from 'node:stream/promises';

import type { CanUseTool } from '@anthropic-ai/claude-agent-sdk';
import type {
  AgentInterventionRequestData,
  AgentInterventionResponseData,
  AgentStreamEvent,
} from '@lobechat/agent-gateway-client';
import type { HeterogeneousAgentSessionError } from '@lobechat/electron-client-ipc';
import {
  CLAUDE_CODE_CLI_INSTALL_COMMANDS,
  CLAUDE_CODE_CLI_INSTALL_DOCS_URL,
  CODEX_CLI_INSTALL_COMMANDS,
  CODEX_CLI_INSTALL_DOCS_URL,
  HeterogeneousAgentSessionErrorCode,
} from '@lobechat/electron-client-ipc';
import type { AgentContentBlock } from '@lobechat/heterogeneous-agents/spawn';
import {
  AgentSdkEventPipeline,
  AgentStreamPipeline,
  buildAgentInput,
  materializeImageToPath,
  normalizeImage,
} from '@lobechat/heterogeneous-agents/spawn';
import { app as electronApp, BrowserWindow } from 'electron';

import { getHeterogeneousAgentDriver } from '@/modules/heterogeneousAgent';
import type {
  HeterogeneousAgentImageAttachment,
  HeterogeneousAgentStreamHandle,
} from '@/modules/heterogeneousAgent/types';
import { buildProxyEnv } from '@/modules/networkProxy/envBuilder';
import { detectHeterogeneousCliCommand } from '@/modules/toolDetectors';
import { createLogger } from '@/utils/logger';

import { ControllerModule, IpcMethod } from './index';

const logger = createLogger('controllers:HeterogeneousAgentCtr');
const CODEX_RESUME_THREAD_NOT_FOUND_PATTERNS = [
  /no conversation found/i,
  /thread .*not found/i,
  /conversation .*not found/i,
  /resume.*not found/i,
] as const;
const CLI_AUTH_REQUIRED_PATTERNS = [
  /failed to authenticate/i,
  /invalid authentication credentials/i,
  /authentication[_ ]error/i,
  /not authenticated/i,
  /\bunauthorized\b/i,
  /\b401\b/,
] as const;
const CODEX_RESUME_CWD_MISMATCH_PATTERNS = [
  /working directory/i,
  /\bcwd\b/i,
  /different directory/i,
  /directory.*mismatch/i,
] as const;

/** Directory under appStoragePath for caching downloaded files */
const FILE_CACHE_DIR = 'heteroAgent/files';
const CLI_TRACE_DIR = '.heerogeneous-tracing';
const CODEX_STDERR_STATUS_LINE = 'Reading prompt from stdin...';
const CODEX_WARN_LOG_PATTERN = /^\d{4}-\d{2}-\d{2}T\S+\s+WARN\s+/;
const CODEX_LOG_PATTERN = /^\d{4}-\d{2}-\d{2}T\S+\s+(?:DEBUG|ERROR|INFO|TRACE|WARN)\s+/;
const CLI_ERROR_LINE_PATTERN = /^(?:error:|Error:|Usage:)/;

// ─── IPC types ───

interface StartSessionParams {
  /** Agent type key (e.g., 'claude-code'). Defaults to 'claude-code'. */
  agentType?: string;
  /** Additional CLI arguments */
  args?: string[];
  /** Command to execute */
  command: string;
  /** Working directory */
  cwd?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Session ID to resume (for multi-turn) */
  resumeSessionId?: string;
}

interface StartSessionResult {
  sessionId: string;
}

interface SendPromptParams {
  /** Image attachments to include in the prompt (downloaded from url, cached by id) */
  imageList?: HeterogeneousAgentImageAttachment[];
  /**
   * How this push should treat any turn that is already in flight on the
   * SDK channel. Only meaningful on follow-up prompts in streaming-input
   * mode (LOBE-8804); the first prompt of a session ignores this flag.
   *
   * - `'soft'` → push with SDK `priority: 'now'`. In-flight tool finishes
   *   naturally, but the model's pending verbal reply is dropped and the
   *   new prompt drives a fresh turn. This matches the renderer-side
   *   "queue while running, drop in-flight reply on send" UX.
   * - `'hard'` → `handle.interrupt()` then push. The active tool_use is
   *   cancelled and the SDK injects a synthetic tool_result rejection so
   *   the next turn's history stays well-formed.
   * - `undefined` → plain push, no priority. Used for the first turn or
   *   for follow-ups that didn't originate from a running operation.
   */
  interruptMode?: 'soft' | 'hard';
  /**
   * Renderer-side operation id stamped onto every emitted `AgentStreamEvent`.
   * Required: producer-side conversion is the V3 contract — by the time events
   * reach the renderer they must already carry the operation they belong to.
   */
  operationId: string;
  prompt: string;
  sessionId: string;
}

interface CancelSessionParams {
  sessionId: string;
}

interface SubmitInterventionParams {
  cancelled?: boolean;
  /** When set, signals user-cancelled or timeout — the bridge resolves with isError. */
  cancelReason?: 'timeout' | 'user_cancelled';
  /** Operation id stamped on the request the renderer is responding to. */
  operationId: string;
  /** Structured user answer; ignored when `cancelled` is true. */
  result?: unknown;
  /** Correlation key carried on the original `agent_intervention_request`. */
  toolCallId: string;
}

interface StopSessionParams {
  sessionId: string;
}

interface GetSessionInfoParams {
  sessionId: string;
}

interface SessionInfo {
  agentSessionId?: string;
}

// ─── Internal session tracking ───

/**
 * Per-turn promise carried by {@link AgentSession.pendingTurns}.
 *
 * Streaming-input mode (LOBE-8804) packs multiple LobeHub-side operations
 * into one long-lived SDK `query()`. Each `sendPrompt` IPC call registers
 * an entry here and awaits its resolution; the background pump shifts the
 * pending op queue on every `system:init` and resolves the entry on the
 * matching `result` event so each renderer-side `sendPrompt` blocks until
 * *its* turn finishes (not until the entire session ends).
 */
interface SdkPendingTurn {
  reject: (err: Error) => void;
  resolve: () => void;
}

interface AgentSession {
  agentSessionId?: string;
  agentType: string;
  args: string[];
  /**
   * Cancel handle for the in-flight turn. Spawn-based agents (Codex) leave
   * this unset and rely on `process` + `killProcessTree`; SDK-driven agents
   * (Claude Code) set this to `handle.interrupt` once the SDK pump is up so
   * `cancelSession` aborts only the current turn — the channel + query stay
   * alive for the next pushed user message. `stopSession` instead closes the
   * whole handle via {@link sdkHandle}.
   */
  cancel?: () => void;
  /**
   * True when *we* initiated the kill (cancelSession / stopSession / before-quit).
   * The `exit` handler uses this to route signal-induced non-zero exits through
   * the `complete` broadcast instead of surfacing them as runtime errors —
   * SIGINT(130) / SIGTERM(143) / SIGKILL(137) from our own kill paths are
   * intentional, not agent failures. SDK-path equivalent: an `AbortError`
   * thrown by the iterator is treated as a clean shutdown.
   */
  cancelledByUs?: boolean;
  /**
   * Op ids cancelled by the user mid-turn via {@link cancelSession}. The
   * pump emits the SDK's terminal `result` (which downgrades to a clean
   * `heteroAgentSessionComplete` broadcast for these ids) and clears the
   * entry on the way out.
   */
  cancelledTurnOps?: Set<string>;
  command: string;
  /** Op currently consuming SDK output (between `system:init` and `result`). */
  currentTurnOp?: string;
  cwd?: string;
  env?: Record<string, string>;
  /**
   * Op ids waiting for their `system:init` boundary, in push order. The
   * pump shifts the head on every `init` to update which `operationId` the
   * pipeline stamps onto subsequent events.
   */
  pendingTurnOpQueue?: string[];
  /**
   * Per-turn completion futures keyed by `operationId`. Resolved by the
   * background pump on the matching `result`; rejected if the pump dies
   * before the turn lands or {@link stopSession} tears down the session
   * while a turn is in flight.
   */
  pendingTurns?: Map<string, SdkPendingTurn>;
  process?: ChildProcess;
  resumeSessionId?: string;
  /**
   * SDK driver handle returned by `driver.startStream`. Persisted on the
   * session record so follow-up `sendPrompt` calls can `pushUserMessage`
   * into the same channel instead of starting a new `query()`. Cleared in
   * {@link stopSession} / pump teardown after `handle.close()`.
   */
  sdkHandle?: HeterogeneousAgentStreamHandle;
  /**
   * Pipeline for the currently active SDK turn. Recreated at every
   * `system:init` so adapter-local step state starts clean for the next
   * LobeHub operation while the underlying SDK query stays alive.
   */
  sdkPipeline?: AgentSdkEventPipeline;
  /** Background pump promise; settled once the SDK iterator drains. */
  sdkPump?: Promise<void>;
  /** Stderr buffer shared across turns so error reporting has full context. */
  sdkStderr?: string[];
  /** Stream trace session shared across turns so each turn appends to one log. */
  sdkTrace?: CliTraceSession;
  sessionId: string;
}

type SessionErrorPayload = HeterogeneousAgentSessionError | string;

interface CliTraceSession {
  dir: string;
  writeQueue: Promise<void>;
}

/**
 * External Agent Controller — manages external agent CLI processes via Electron IPC.
 *
 * Agent-agnostic: delegates spawn-plan construction and stdout framing to a
 * per-agent driver so Claude Code, Codex, and future CLIs can differ in
 * prompt transport, resume semantics, and raw stream shape without turning
 * this controller into a giant `switch`.
 *
 * Lifecycle: startSession → sendPrompt → (heteroAgentEvent broadcasts) → stopSession
 */
interface InterventionPendingEntry {
  /** Identifier (e.g. 'claude-code') for trace/log context. */
  identifier: string;
  /** Resolves the SDK `canUseTool` callback with the user's answer. */
  resolve: (response: AgentInterventionResponseData) => void;
}

/**
 * 5-minute wall-clock budget for an unanswered intervention. Matches the
 * deadline LOBE-8725's bridge used so renderer-side timeout UX is unchanged.
 * After the deadline the controller resolves with `{ cancelled: true,
 * cancelReason: 'timeout' }` and the SDK returns a deny payload to the CLI.
 */
const INTERVENTION_TIMEOUT_MS = 5 * 60 * 1000;

export default class HeterogeneousAgentCtr extends ControllerModule {
  static override readonly groupName = 'heterogeneousAgent';

  private sessions = new Map<string, AgentSession>();
  /**
   * Per-operation pending intervention map. Keyed by `operationId` so the
   * `submitIntervention` IPC can route an answer back to the right
   * `canUseTool` callback regardless of which `sessionId` it belongs to (one
   * session can fire many ops over its lifetime). Inner key is `toolCallId`.
   */
  private opIdToInterventions = new Map<string, Map<string, InterventionPendingEntry>>();

  private resolveSessionCommand(session: AgentSession): string {
    const resolvedCommand = session.command.trim();
    if (resolvedCommand) return resolvedCommand;

    return session.agentType === 'codex' ? 'codex' : 'claude';
  }

  private buildCodexCliMissingError(session: AgentSession): HeterogeneousAgentSessionError {
    const command = this.resolveSessionCommand(session);

    return {
      agentType: 'codex',
      code: HeterogeneousAgentSessionErrorCode.CliNotFound,
      command,
      docsUrl: CODEX_CLI_INSTALL_DOCS_URL,
      installCommands: CODEX_CLI_INSTALL_COMMANDS,
      message: `Codex CLI was not found. Install it and make sure \`${command}\` can be executed.`,
    };
  }

  private buildClaudeCodeCliMissingError(session: AgentSession): HeterogeneousAgentSessionError {
    const command = this.resolveSessionCommand(session);

    return {
      agentType: 'claude-code',
      code: HeterogeneousAgentSessionErrorCode.CliNotFound,
      command,
      docsUrl: CLAUDE_CODE_CLI_INSTALL_DOCS_URL,
      installCommands: CLAUDE_CODE_CLI_INSTALL_COMMANDS,
      message: `Claude Code CLI was not found. Install it and make sure \`${command}\` can be executed.`,
    };
  }

  private buildCliMissingError(session: AgentSession): HeterogeneousAgentSessionError | undefined {
    switch (session.agentType) {
      case 'claude-code': {
        return this.buildClaudeCodeCliMissingError(session);
      }
      case 'codex': {
        return this.buildCodexCliMissingError(session);
      }
      default: {
        return;
      }
    }
  }

  private buildCliAuthRequiredError(
    session: AgentSession,
    stderr: string,
  ): HeterogeneousAgentSessionError | undefined {
    const command = this.resolveSessionCommand(session);

    switch (session.agentType) {
      case 'claude-code': {
        return {
          agentType: 'claude-code',
          code: HeterogeneousAgentSessionErrorCode.AuthRequired,
          command,
          docsUrl: CLAUDE_CODE_CLI_INSTALL_DOCS_URL,
          message:
            'Claude Code could not authenticate. Sign in again or refresh its credentials, then retry.',
          stderr,
        };
      }
      case 'codex': {
        return {
          agentType: 'codex',
          code: HeterogeneousAgentSessionErrorCode.AuthRequired,
          command,
          docsUrl: CODEX_CLI_INSTALL_DOCS_URL,
          message:
            'Codex could not authenticate. Sign in again or refresh its credentials, then retry.',
          stderr,
        };
      }
      default: {
        return;
      }
    }
  }

  private getErrorMessage(error: unknown): string | undefined {
    return typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : typeof error === 'object' &&
            error &&
            'message' in error &&
            typeof error.message === 'string'
          ? error.message
          : undefined;
  }

  private buildCodexResumeError(
    code:
      | typeof HeterogeneousAgentSessionErrorCode.ResumeCwdMismatch
      | typeof HeterogeneousAgentSessionErrorCode.ResumeThreadNotFound,
    stderr: string,
    session: AgentSession,
  ): HeterogeneousAgentSessionError {
    const message =
      code === HeterogeneousAgentSessionErrorCode.ResumeCwdMismatch
        ? 'The saved Codex thread can only be resumed from its original working directory.'
        : 'The saved Codex thread could not be found, so it can no longer be resumed.';

    return {
      agentType: 'codex',
      code,
      command: session.command,
      message,
      resumeSessionId: session.resumeSessionId,
      stderr,
      workingDirectory: session.cwd,
    };
  }

  private getCodexResumeError(
    error: unknown,
    session: AgentSession,
  ): HeterogeneousAgentSessionError | undefined {
    if (session.agentType !== 'codex' || !session.resumeSessionId) return;

    const message = this.getErrorMessage(error);

    if (!message) return;

    if (CODEX_RESUME_CWD_MISMATCH_PATTERNS.some((pattern) => pattern.test(message))) {
      return this.buildCodexResumeError(
        HeterogeneousAgentSessionErrorCode.ResumeCwdMismatch,
        message,
        session,
      );
    }

    if (CODEX_RESUME_THREAD_NOT_FOUND_PATTERNS.some((pattern) => pattern.test(message))) {
      return this.buildCodexResumeError(
        HeterogeneousAgentSessionErrorCode.ResumeThreadNotFound,
        message,
        session,
      );
    }
  }

  private getCliAuthRequiredError(
    error: unknown,
    session: AgentSession,
  ): HeterogeneousAgentSessionError | undefined {
    const message = this.getErrorMessage(error);

    if (!message || !CLI_AUTH_REQUIRED_PATTERNS.some((pattern) => pattern.test(message))) return;

    return this.buildCliAuthRequiredError(session, message);
  }

  private getSessionErrorPayload(error: unknown, session: AgentSession): SessionErrorPayload {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'ENOENT') {
      const cliMissingError = this.buildCliMissingError(session);
      if (cliMissingError) return cliMissingError;
    }

    const resumeError = this.getCodexResumeError(error, session);
    if (resumeError) return resumeError;

    const authRequiredError = this.getCliAuthRequiredError(error, session);
    if (authRequiredError) return authRequiredError;

    return error instanceof Error ? error.message : String(error);
  }

  private getRelevantCodexStderr(stderr: string): string {
    const keptLines: string[] = [];
    let droppingWarnBlock = false;

    for (const line of stderr.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === CODEX_STDERR_STATUS_LINE) {
        continue;
      }

      if (CODEX_WARN_LOG_PATTERN.test(trimmed)) {
        droppingWarnBlock = true;
        continue;
      }

      if (CODEX_LOG_PATTERN.test(trimmed)) {
        droppingWarnBlock = false;
        keptLines.push(line);
        continue;
      }

      if (droppingWarnBlock && !CLI_ERROR_LINE_PATTERN.test(trimmed)) {
        continue;
      }

      droppingWarnBlock = false;
      keptLines.push(line);
    }

    return keptLines.join('\n').trim();
  }

  private getExitErrorMessage(
    code: number | null,
    session: AgentSession,
    stderrOutput: string,
  ): string {
    const relevantStderr =
      session.agentType === 'codex' ? this.getRelevantCodexStderr(stderrOutput) : stderrOutput;

    return relevantStderr || `Agent exited with code ${code}`;
  }

  private async getSpawnPreflightError(
    session: AgentSession,
  ): Promise<HeterogeneousAgentSessionError | undefined> {
    const defaultCommand =
      session.agentType === 'claude-code'
        ? 'claude'
        : session.agentType === 'codex'
          ? 'codex'
          : undefined;
    if (!defaultCommand) return;

    const command = this.resolveSessionCommand(session);
    const status =
      command === defaultCommand
        ? await this.app.toolDetectorManager?.detect?.(defaultCommand, true)
        : await detectHeterogeneousCliCommand(
            session.agentType === 'claude-code' ? 'claude-code' : 'codex',
            command,
          );
    const cliMissingError = this.buildCliMissingError(session);

    if (!status || status.available || !cliMissingError) return;

    return cliMissingError;
  }

  private get shouldTraceCliOutput(): boolean {
    return process.env.NODE_ENV !== 'test' && !electronApp.isPackaged;
  }

  private formatTraceTimestamp(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');

    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
      '-',
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds()),
    ].join('');
  }

  private sanitizeTracePathSegment(value: string): string {
    const sanitized = value
      .replaceAll(path.sep, '-')
      .replaceAll(/[^\w.-]+/g, '-')
      .replaceAll(/^-+|-+$/g, '')
      .slice(0, 80);

    return sanitized || 'unknown';
  }

  private getAttachmentTraceSummary(image: HeterogeneousAgentImageAttachment) {
    let urlKind = 'unknown';

    try {
      urlKind = new URL(image.url).protocol.replace(/:$/, '') || urlKind;
    } catch {
      urlKind = image.url.startsWith('data:') ? 'data' : 'unknown';
    }

    return {
      id: image.id,
      urlKind,
    };
  }

  private async createCliTraceSession({
    cliArgs,
    cwd,
    imageList,
    session,
    stdinPayload,
  }: {
    cliArgs: string[];
    cwd: string;
    imageList: HeterogeneousAgentImageAttachment[];
    session: AgentSession;
    stdinPayload?: string;
  }): Promise<CliTraceSession | undefined> {
    if (!this.shouldTraceCliOutput) return;

    // Don't materialize the cwd via mkdir — if the caller passed a stale or
    // typo'd path, we want spawn() to fail loudly instead of silently running
    // the agent in an empty auto-created directory.
    try {
      await access(cwd);
    } catch {
      return;
    }

    const createdAt = new Date();
    const rootDir = path.join(cwd, CLI_TRACE_DIR);
    const agentDir = path.join(rootDir, this.sanitizeTracePathSegment(session.agentType));
    const traceId = `${this.formatTraceTimestamp(createdAt)}-${this.sanitizeTracePathSegment(
      session.sessionId,
    )}`;
    const dir = path.join(agentDir, traceId);

    try {
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(rootDir, '.last-live-trace'), `${dir}\n`);
      await writeFile(path.join(dir, 'stdout.jsonl'), '');
      await writeFile(path.join(dir, 'stderr.log'), '');
      if (stdinPayload !== undefined) {
        await writeFile(path.join(dir, 'stdin.txt'), '');
      }
      await writeFile(
        path.join(dir, 'meta.json'),
        `${JSON.stringify(
          {
            agentSessionId: session.agentSessionId,
            agentType: session.agentType,
            args: cliArgs,
            attachments: imageList.map((image) => this.getAttachmentTraceSummary(image)),
            command: session.command,
            createdAt: createdAt.toISOString(),
            cwd,
            envKeys: session.env ? Object.keys(session.env).sort() : [],
            resumeSessionId: session.resumeSessionId,
            sessionId: session.sessionId,
            stdinBytes: stdinPayload === undefined ? 0 : Buffer.byteLength(stdinPayload),
            stdinFile: stdinPayload === undefined ? undefined : 'stdin.txt',
            stderrFile: 'stderr.log',
            stdoutFile: 'stdout.jsonl',
          },
          null,
          2,
        )}\n`,
      );

      return { dir, writeQueue: Promise.resolve() };
    } catch (error) {
      logger.warn('Failed to initialize CLI trace directory:', error);
    }
  }

  private queueCliTraceWrite(
    trace: CliTraceSession | undefined,
    write: () => Promise<void>,
  ): Promise<void> | undefined {
    if (!trace) return;

    trace.writeQueue = trace.writeQueue.then(write).catch((error) => {
      logger.warn('Failed to write CLI trace file:', error);
    });

    return trace.writeQueue;
  }

  private appendCliTraceFile(
    trace: CliTraceSession | undefined,
    fileName: string,
    data: Buffer | string,
  ): Promise<void> | undefined {
    if (!trace) return;

    const filePath = path.join(trace.dir, fileName);

    return this.queueCliTraceWrite(trace, () => appendFile(filePath, data));
  }

  private writeCliTraceFile(
    trace: CliTraceSession | undefined,
    fileName: string,
    data: string,
  ): Promise<void> | undefined {
    if (!trace) return;

    const filePath = path.join(trace.dir, fileName);

    return this.queueCliTraceWrite(trace, () => writeFile(filePath, data));
  }

  private writeCliTraceJson(
    trace: CliTraceSession | undefined,
    fileName: string,
    payload: unknown,
  ): Promise<void> | undefined {
    return this.writeCliTraceFile(trace, fileName, `${JSON.stringify(payload, null, 2)}\n`);
  }

  private async flushCliTrace(trace: CliTraceSession | undefined): Promise<void> {
    await trace?.writeQueue;
  }

  // ─── Broadcast ───

  private broadcast<T>(channel: string, data: T) {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, data);
      }
    }
  }

  // ─── AskUserQuestion via SDK canUseTool (LOBE-8746) ───

  /**
   * Build the SDK `canUseTool` callback that the driver passes straight
   * into `query({ options: { canUseTool } })`. Closes over `operationId`
   * / `sessionId` so the matching `submitIntervention` IPC can route the
   * user's answer back here.
   *
   * Tool routing:
   * - `AskUserQuestion`: emit `agent_intervention_request` on the wire +
   *   register a pending entry keyed by `tool_use_id`; the IPC resolves it.
   *   Returns `{ behavior: 'allow', updatedInput: { questions, answers } }`
   *   on success so the CLI synthesises the tool_result. On cancel/timeout
   *   returns `{ behavior: 'deny', message: ... }`.
   * - Everything else: auto-allow with the original input. Per-tool
   *   approval UI lands in a follow-up; `permissionMode: 'bypassPermissions'`
   *   means the SDK shouldn't even ask us for these today (but we handle
   *   it defensively in case the policy changes).
   */
  private buildCanUseToolCallback(
    operationId: string | (() => string | undefined),
    sessionId: string,
    agentType: string,
  ): CanUseTool {
    return async (toolName, input, callbackOptions) => {
      if (toolName !== 'AskUserQuestion') {
        return { behavior: 'allow', updatedInput: input };
      }

      const currentOperationId = typeof operationId === 'function' ? operationId() : operationId;
      if (!currentOperationId) {
        return {
          behavior: 'deny',
          message: 'No active LobeHub operation is available for this question.',
        };
      }

      const toolCallId =
        typeof callbackOptions.toolUseID === 'string' ? callbackOptions.toolUseID : randomUUID();
      const deadline = Date.now() + INTERVENTION_TIMEOUT_MS;
      const identifier = agentType === 'claude-code' ? 'claude-code' : agentType;

      const requestEvent: AgentStreamEvent = {
        data: {
          apiName: 'askUserQuestion',
          arguments: JSON.stringify(input ?? {}),
          deadline,
          identifier,
          toolCallId,
        } satisfies AgentInterventionRequestData,
        operationId: currentOperationId,
        stepIndex: 0,
        timestamp: Date.now(),
        type: 'agent_intervention_request',
      };
      this.broadcast('heteroAgentEvent', { event: requestEvent, sessionId });

      const answer = await new Promise<AgentInterventionResponseData>((resolve) => {
        let pending = this.opIdToInterventions.get(currentOperationId);
        if (!pending) {
          pending = new Map();
          this.opIdToInterventions.set(currentOperationId, pending);
        }
        const settle = (response: AgentInterventionResponseData) => {
          clearTimeout(timeoutHandle);
          callbackOptions.signal.removeEventListener('abort', onAbort);
          pending?.delete(toolCallId);
          if (pending?.size === 0) this.opIdToInterventions.delete(currentOperationId);
          resolve(response);
        };

        const onAbort = () =>
          settle({ cancelReason: 'session_ended', cancelled: true, toolCallId });
        callbackOptions.signal.addEventListener('abort', onAbort, { once: true });

        const timeoutHandle = setTimeout(() => {
          settle({ cancelReason: 'timeout', cancelled: true, toolCallId });
        }, INTERVENTION_TIMEOUT_MS);

        pending.set(toolCallId, {
          identifier,
          resolve: settle,
        });
      });

      // Mirror the terminal state on the wire so a renderer that hasn't yet
      // received the user's submission (e.g. timeout / session_ended) can
      // flip its UI out of the `pending` state.
      const responseEvent: AgentStreamEvent = {
        data: {
          cancelReason: answer.cancelReason,
          cancelled: answer.cancelled,
          result: answer.result,
          toolCallId,
        } satisfies AgentInterventionResponseData,
        operationId: currentOperationId,
        stepIndex: 0,
        timestamp: Date.now(),
        type: 'agent_intervention_response',
      };
      this.broadcast('heteroAgentEvent', { event: responseEvent, sessionId });

      if (answer.cancelled) {
        const reason = answer.cancelReason ?? 'user_cancelled';
        const message =
          reason === 'timeout'
            ? 'No answer received within the wait window; the user did not respond. Continue without their input or ask in plain text.'
            : reason === 'session_ended'
              ? 'The session was ended before the user could respond.'
              : 'The user cancelled the question.';
        return { behavior: 'deny', message };
      }

      // Success path: the SDK requires `updatedInput` to be the same shape
      // as the original AskUserQuestion input plus an `answers` field. The
      // `result` should already be `{ questions, answers }`; we fall back
      // to merging in case the renderer only sent the answers map.
      const result = (answer.result ?? {}) as Record<string, unknown>;
      const updatedInput = 'questions' in result ? result : { ...input, answers: result };
      return { behavior: 'allow', updatedInput };
    };
  }

  /**
   * Tear down every pending intervention for an op (success, error, or
   * cancel exit path). Each entry resolves with `session_ended` so the SDK
   * `canUseTool` callback returns a deny payload and the CLI continues
   * past the unanswered tool_use cleanly.
   */
  private cleanupInterventionsForOp(operationId: string): void {
    const pending = this.opIdToInterventions.get(operationId);
    if (!pending) return;
    for (const [toolCallId, entry] of pending) {
      entry.resolve({ cancelReason: 'session_ended', cancelled: true, toolCallId });
    }
    this.opIdToInterventions.delete(operationId);
  }

  private isSdkInitMessage(message: unknown): boolean {
    return (
      !!message &&
      typeof message === 'object' &&
      (message as { subtype?: unknown; type?: unknown }).type === 'system' &&
      (message as { subtype?: unknown; type?: unknown }).subtype === 'init'
    );
  }

  private isSdkResultMessage(message: unknown): boolean {
    return (
      !!message && typeof message === 'object' && (message as { type?: unknown }).type === 'result'
    );
  }

  private registerSdkPendingTurn(session: AgentSession, operationId: string): Promise<void> {
    session.pendingTurns ??= new Map();
    session.pendingTurnOpQueue ??= [];

    if (session.pendingTurns.has(operationId)) {
      throw new Error(`SDK turn is already pending: ${operationId}`);
    }

    const promise = new Promise<void>((resolve, reject) => {
      session.pendingTurns?.set(operationId, { reject, resolve });
    });
    session.pendingTurnOpQueue.push(operationId);

    return promise;
  }

  private removeSdkPendingTurn(session: AgentSession, operationId: string): void {
    session.pendingTurns?.delete(operationId);
    const queueIndex = session.pendingTurnOpQueue?.indexOf(operationId) ?? -1;
    if (queueIndex >= 0) session.pendingTurnOpQueue?.splice(queueIndex, 1);
  }

  private settleSdkPendingTurn(session: AgentSession, operationId: string, error?: Error): void {
    const pending = session.pendingTurns?.get(operationId);
    this.removeSdkPendingTurn(session, operationId);
    session.cancelledTurnOps?.delete(operationId);
    this.cleanupInterventionsForOp(operationId);

    if (!pending) return;
    if (error) pending.reject(error);
    else pending.resolve();
  }

  private settleAllSdkPendingTurns(session: AgentSession, error?: Error): void {
    const operationIds = [...(session.pendingTurns?.keys() ?? [])];
    for (const operationId of operationIds) {
      this.settleSdkPendingTurn(session, operationId, error);
    }
    session.pendingTurnOpQueue = [];
    session.currentTurnOp = undefined;
  }

  private takeNextSdkTurnOperationId(session: AgentSession): string | undefined {
    const queued = session.pendingTurnOpQueue?.shift();
    if (queued) return queued;
    return session.currentTurnOp ?? session.pendingTurns?.keys().next().value;
  }

  // ─── File cache ───

  private get fileCacheDir(): string {
    return path.join(this.app.appStoragePath, FILE_CACHE_DIR);
  }

  /**
   * Convert a desktop image attachment list into shared content blocks. Each
   * attachment's id is preserved as the cache key so repeated prompts hit the
   * same on-disk entries.
   */
  private toImageContentBlocks(
    imageList: HeterogeneousAgentImageAttachment[],
  ): AgentContentBlock[] {
    return imageList.map((image) => ({
      source: { id: image.id, type: 'url', url: image.url },
      type: 'image',
    }));
  }

  /**
   * Build a Claude Code stream-json user message with text + base64 images.
   * Delegates to the shared `buildAgentInput`; the desktop wrapper exists only
   * to preserve the helper signature consumed by existing drivers.
   */
  private async buildStreamJsonInput(
    prompt: string,
    imageList: HeterogeneousAgentImageAttachment[] = [],
  ): Promise<string> {
    const blocks: AgentContentBlock[] = [];
    if (prompt && prompt.length > 0) blocks.push({ text: prompt, type: 'text' });
    blocks.push(...this.toImageContentBlocks(imageList));

    const plan = await buildAgentInput('claude-code', blocks, { cacheDir: this.fileCacheDir });
    return plan.stdin;
  }

  /**
   * Materialize image attachments into stable filesystem paths for path-mode
   * agents (Codex `--image <file>`). Fails the prompt if any image cannot be
   * fetched / decoded — partially-attached prompts confuse the agent more
   * than they help.
   */
  private async resolveCliImagePaths(
    imageList: HeterogeneousAgentImageAttachment[] = [],
  ): Promise<string[]> {
    if (imageList.length === 0) return [];

    const cacheDir = this.fileCacheDir;
    const results = await Promise.allSettled(
      imageList.map(async (image) => {
        const normalized = await normalizeImage(
          { id: image.id, type: 'url', url: image.url },
          { cacheDir },
        );
        return materializeImageToPath(normalized, cacheDir);
      }),
    );

    const imagePaths: string[] = [];
    const failures: string[] = [];

    for (const [index, result] of results.entries()) {
      const imageId = imageList[index]?.id ?? `image-${index + 1}`;

      if (result.status === 'fulfilled') {
        imagePaths.push(result.value);
        continue;
      }

      const message = this.getErrorMessage(result.reason) || 'Unknown error';
      logger.error(`Failed to materialize image ${imageId} for CLI:`, result.reason);
      failures.push(`${imageId}: ${message}`);
    }

    if (failures.length > 0) {
      throw new Error(`Failed to attach image(s) to CLI: ${failures.join('; ')}`);
    }

    return imagePaths;
  }

  // ─── IPC methods ───

  /**
   * Create a session (stores config, process spawned on sendPrompt).
   */
  @IpcMethod()
  async startSession(params: StartSessionParams): Promise<StartSessionResult> {
    const agentType = params.agentType || 'claude-code';
    getHeterogeneousAgentDriver(agentType);

    // Streaming-input reuse (LOBE-8804): if the renderer is resuming a CC
    // session whose SDK channel is still live in this controller, return
    // that existing renderer-side sessionId so the follow-up sendPrompt
    // pushes onto the same `query()` instead of respawning the CLI with
    // `--resume`. Each renderer-side `sendMessage` mints a fresh sessionId
    // (the executor calls `startSession` per op), so without this branch
    // the controller never sees `session.sdkHandle` set on the new entry
    // and falls back to spawn-mode equivalence.
    //
    // Match by agentType + cwd + resumeSessionId so two parallel topics
    // don't collide on the same `agentSessionId` once one happens to
    // recycle a CC session id.
    if (params.resumeSessionId) {
      for (const [, existing] of this.sessions) {
        if (
          existing.agentType === agentType &&
          existing.sdkHandle?.pushUserMessage &&
          existing.sdkPump &&
          existing.agentSessionId === params.resumeSessionId &&
          (existing.cwd ?? '') === (params.cwd ?? '')
        ) {
          logger.info('Session reused (live SDK channel):', {
            agentType,
            sessionId: existing.sessionId,
            agentSessionId: existing.agentSessionId,
          });
          return { sessionId: existing.sessionId };
        }
      }
    }

    const sessionId = randomUUID();
    this.sessions.set(sessionId, {
      // If resuming, pre-set the agent session ID so sendPrompt adds --resume
      agentSessionId: params.resumeSessionId,
      agentType,
      args: params.args || [],
      command: params.command,
      cwd: params.cwd,
      env: params.env,
      sessionId,
      resumeSessionId: params.resumeSessionId,
    });

    logger.info('Session created:', { agentType, sessionId });
    return { sessionId };
  }

  /**
   * Send a prompt to an agent session.
   *
   * Spawns the CLI process with preset flags. Pipes each stdout chunk through
   * the shared `AgentStreamPipeline` (JSONL → adapter → toStreamEvent) and
   * broadcasts the resulting `AgentStreamEvent`s on `heteroAgentEvent`.
   */
  @IpcMethod()
  async sendPrompt(params: SendPromptParams): Promise<void> {
    const session = this.sessions.get(params.sessionId);
    if (!session) throw new Error(`Session not found: ${params.sessionId}`);

    const driver = getHeterogeneousAgentDriver(session.agentType);
    const canReuseSdkStream = !!driver.startStream && !!session.sdkHandle?.pushUserMessage;

    if (!canReuseSdkStream) {
      const preflightError = await this.getSpawnPreflightError(session);
      if (preflightError) {
        this.broadcast('heteroAgentSessionError', {
          error: preflightError,
          sessionId: session.sessionId,
        });
        throw new Error(preflightError.message);
      }
    }

    // SDK-backed transport (Claude Code): the driver pumps already-parsed
    // provider messages, no child process to babysit here. `runSdkStream`
    // broadcasts its own session-error and rethrows so the renderer's IPC
    // promise rejects, matching the spawn path. Codex still goes through
    // the spawn path below.
    if (driver.startStream) {
      await this.runSdkStream(session, params, driver);
      return;
    }

    if (!driver.buildSpawnPlan) {
      throw new Error(
        `Driver for ${session.agentType} implements neither startStream nor buildSpawnPlan`,
      );
    }

    const spawnPlan = await driver.buildSpawnPlan({
      args: session.args,
      helpers: {
        buildClaudeStreamJsonInput: (prompt, imageList) =>
          this.buildStreamJsonInput(prompt, imageList),
        resolveCliImagePaths: (imageList) => this.resolveCliImagePaths(imageList),
      },
      imageList: params.imageList ?? [],
      prompt: params.prompt,
      resumeSessionId: session.agentSessionId,
    });

    // Fall back to the user's Desktop so the process never inherits the
    // Electron parent's cwd (which is `/` when launched from Finder).
    const cwd = session.cwd || electronApp.getPath('desktop');
    const traceSession = await this.createCliTraceSession({
      cliArgs: spawnPlan.args,
      cwd,
      imageList: params.imageList ?? [],
      session,
      stdinPayload: spawnPlan.stdinPayload,
    });
    const useStdin = spawnPlan.stdinPayload !== undefined;
    const cliArgs = spawnPlan.args;

    return new Promise<void>((resolve, reject) => {
      logger.info('Spawning agent:', session.command, cliArgs.join(' '), `(cwd: ${cwd})`);

      // `detached: true` on Unix puts the child in a new process group so we
      // can SIGINT/SIGKILL the whole tree (claude + any tool subprocesses)
      // via `process.kill(-pid, sig)` on cancel. Without this, SIGINT to just
      // the claude binary can leave bash/grep/etc. tool children running and
      // the CLI hung waiting on them. Windows has different semantics — use
      // taskkill /T /F there; no detached flag needed.
      // Forward the user's proxy settings to the CLI. The main-process undici
      // dispatcher doesn't reach child processes — they need env vars.
      const proxyEnv = buildProxyEnv(this.app.storeManager.get('networkProxy'));

      const proc = spawn(session.command, cliArgs, {
        cwd,
        detached: process.platform !== 'win32',
        env: { ...process.env, ...proxyEnv, ...session.env },
        stdio: [useStdin ? 'pipe' : 'ignore', 'pipe', 'pipe'],
      });

      // In stdin mode, write the prepared payload and close stdin.
      if (useStdin && spawnPlan.stdinPayload !== undefined && proc.stdin) {
        void this.writeCliTraceFile(traceSession, 'stdin.txt', spawnPlan.stdinPayload);
        const stdin = proc.stdin as Writable;
        stdin.write(spawnPlan.stdinPayload, () => {
          stdin.end();
        });
      }

      session.process = proc;

      // Producer-side conversion (V3 contract): JSONL framing + adapter +
      // toStreamEvent all run inside the shared pipeline, so renderer + future
      // server `heteroIngest` see the same `AgentStreamEvent` wire shape with
      // no per-consumer adapter. The pipeline auto-wires the Codex
      // file-change line-stat tracker when `agentType === 'codex'`, so this
      // controller stays agent-agnostic.
      const pipeline = new AgentStreamPipeline({
        agentType: session.agentType,
        operationId: params.operationId,
      });
      let stdoutBroadcastQueue: Promise<void> = Promise.resolve();

      const broadcastPipelineBatch = (produce: () => ReturnType<AgentStreamPipeline['push']>) => {
        stdoutBroadcastQueue = stdoutBroadcastQueue
          .then(async () => {
            const events = await produce();
            // Adapter-extracted CC/Codex session id powers `--resume` on the
            // next prompt; surface it through the existing `getSessionInfo`
            // IPC by mirroring the freshest value onto the session record.
            if (pipeline.sessionId && pipeline.sessionId !== session.agentSessionId) {
              session.agentSessionId = pipeline.sessionId;
            }
            for (const event of events) {
              this.broadcast('heteroAgentEvent', {
                event,
                sessionId: session.sessionId,
              });
            }
          })
          .catch((error) => {
            logger.error('Failed to broadcast agent stream batch:', error);
          });
      };

      // Stream stdout events through the producer pipeline.
      const stdout = proc.stdout as Readable;
      stdout.on('data', (chunk: Buffer) => {
        void this.appendCliTraceFile(traceSession, 'stdout.jsonl', chunk);
        broadcastPipelineBatch(() => pipeline.push(chunk));
      });
      stdout.on('end', () => {
        broadcastPipelineBatch(() => pipeline.flush());
      });

      // Capture stderr
      const stderrChunks: string[] = [];
      const stderr = proc.stderr as Readable;
      stderr.on('data', (chunk: Buffer) => {
        void this.appendCliTraceFile(traceSession, 'stderr.log', chunk);
        stderrChunks.push(chunk.toString('utf8'));
      });

      proc.on('error', (err) => {
        logger.error('Agent process error:', err);
        void this.writeCliTraceJson(traceSession, 'process-error.json', {
          message: err.message,
          name: err.name,
        });
        void this.flushCliTrace(traceSession);
        const sessionError = this.getSessionErrorPayload(err, session);
        this.broadcast('heteroAgentSessionError', {
          error: sessionError,
          sessionId: session.sessionId,
        });
        reject(new Error(typeof sessionError === 'string' ? sessionError : sessionError.message));
      });

      proc.on('exit', (code, signal) => {
        // Node may emit `'exit'` BEFORE stdio finishes draining (documented:
        // child_process docs note "stdio streams might still be open" at exit
        // time). Wait for stdout to fully end/close so the `stdout.on('end')`
        // handler has scheduled `pipeline.flush()` onto `stdoutBroadcastQueue`,
        // THEN wait for the queue itself to settle. Without this two-step
        // gate, trailing flushed events (final synthesized tool_end /
        // tool_result) would race against — and lose to — the
        // `heteroAgentSessionComplete` broadcast, leaving renderer-side
        // persistence to finalize on incomplete state.
        const stdoutDrained = streamFinished(stdout, { writable: false }).catch(() => {
          /* end / close / error are all "done"; we still want to settle. */
        });

        void stdoutDrained
          .then(() => stdoutBroadcastQueue)
          .finally(async () => {
            void this.writeCliTraceJson(traceSession, 'exit.json', {
              code,
              finishedAt: new Date().toISOString(),
              signal,
            });
            await this.flushCliTrace(traceSession);

            logger.info('Agent process exited:', { code, sessionId: session.sessionId, signal });
            session.process = undefined;

            // If *we* killed it (cancel / stop / before-quit), treat the non-zero
            // exit as a clean shutdown — surfacing it as an error would make a
            // user-initiated cancel look like an agent failure, and an Electron
            // shutdown affecting OTHER running CC sessions would pollute their
            // topics with a misleading "Agent exited with code 143" message.
            if (session.cancelledByUs) {
              this.broadcast('heteroAgentSessionComplete', { sessionId: session.sessionId });
              resolve();
              return;
            }

            if (code === 0) {
              this.broadcast('heteroAgentSessionComplete', { sessionId: session.sessionId });
              resolve();
            } else {
              const stderrOutput = stderrChunks.join('').trim();
              const errorMsg = this.getExitErrorMessage(code, session, stderrOutput);
              const sessionError = this.getSessionErrorPayload(errorMsg, session);
              this.broadcast('heteroAgentSessionError', {
                error: sessionError,
                sessionId: session.sessionId,
              });
              reject(
                new Error(typeof sessionError === 'string' ? sessionError : sessionError.message),
              );
            }
          });
      });
    });
  }

  /**
   * SDK-backed transport for Claude Code. The driver yields parsed provider
   * messages directly (no JSONL framing); we pump them through
   * `AgentSdkEventPipeline` (same adapter as the spawn path) and broadcast
   * the resulting `AgentStreamEvent`s.
   *
   * Streaming-input mode keeps the SDK `query()` alive at session scope.
   * Each `sendPrompt` registers a per-turn promise, pushes a user message
   * through the driver's channel, and resolves when that turn's `result`
   * arrives. `cancelSession` interrupts only the current turn; `stopSession`
   * / app quit close the whole SDK handle.
   *
   * The SDK doesn't fall back to its bundled platform binary because
   * `apps/desktop/.pnpmfile.cjs` strips those optional deps at install — we
   * also require `pathToClaudeCodeExecutable` at the driver boundary so a
   * missing system `claude` surfaces as `CliNotFound` instead of a confusing
   * ENOENT from somewhere inside the SDK.
   */
  private async runSdkStream(
    session: AgentSession,
    params: SendPromptParams,
    driver: ReturnType<typeof getHeterogeneousAgentDriver>,
  ): Promise<void> {
    if (session.sdkHandle?.pushUserMessage && session.sdkPump) {
      // Translate LobeHub's interruptMode to the right SDK control surface.
      // Hard: interrupt() before push — aborts the active tool_use with a
      // synthetic rejection so the next turn's history is well-formed.
      // Soft: push with priority='now' — lets the tool finish, drops the
      // model's in-flight verbal reply, pivots to the new prompt.
      // Undefined: plain push (first prompt or no running op to pivot from).
      let pushPriority: 'now' | 'later' | undefined;
      if (params.interruptMode === 'hard') {
        // Mark the about-to-be-aborted turn so its terminal `result` doesn't
        // surface as an error toast; the user initiated this cancel via the
        // hard-interrupt enqueue.
        const interruptedOp = session.currentTurnOp ?? session.pendingTurnOpQueue?.[0];
        if (interruptedOp) {
          session.cancelledTurnOps ??= new Set();
          session.cancelledTurnOps.add(interruptedOp);
        }
        try {
          await session.sdkHandle.interrupt?.();
        } catch (err) {
          logger.warn('handle.interrupt threw on hard push (continuing):', err);
        }
      } else if (params.interruptMode === 'soft') {
        pushPriority = 'now';
      }

      const pendingTurn = this.registerSdkPendingTurn(session, params.operationId);
      try {
        await session.sdkHandle.pushUserMessage({
          imageList: params.imageList ?? [],
          priority: pushPriority,
          prompt: params.prompt,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        this.removeSdkPendingTurn(session, params.operationId);
        this.cleanupInterventionsForOp(params.operationId);
        throw error;
      }

      await pendingTurn;
      return;
    }

    const cwd = session.cwd || electronApp.getPath('desktop');
    const command = this.resolveSessionCommand(session);
    const cliStatus = await detectHeterogeneousCliCommand(
      session.agentType === 'claude-code' ? 'claude-code' : 'codex',
      command,
    );
    if (!cliStatus?.available || !cliStatus.path) {
      const sessionError =
        this.buildCliMissingError(session) ?? `Claude Code CLI not found: ${command}`;
      this.broadcast('heteroAgentSessionError', {
        error: sessionError,
        sessionId: session.sessionId,
      });
      throw new Error(typeof sessionError === 'string' ? sessionError : sessionError.message);
    }

    const proxyEnv = buildProxyEnv(this.app.storeManager.get('networkProxy'));
    const env = { ...process.env, ...proxyEnv, ...session.env };

    const traceSession = await this.createCliTraceSession({
      cliArgs: session.args,
      cwd,
      imageList: params.imageList ?? [],
      session,
      stdinPayload: undefined,
    });
    const pendingTurn = this.registerSdkPendingTurn(session, params.operationId);

    const ac = new AbortController();
    session.cancel = () => ac.abort();
    const stderrChunks: string[] = [];

    logger.info(
      'Starting SDK stream:',
      session.agentType,
      `(cwd: ${cwd}, claude: ${cliStatus.path})`,
    );

    const canUseTool = this.buildCanUseToolCallback(
      () => session.currentTurnOp ?? session.pendingTurnOpQueue?.[0] ?? params.operationId,
      session.sessionId,
      session.agentType,
    );

    let handle;
    try {
      handle = await driver.startStream!({
        abortSignal: ac.signal,
        args: session.args,
        // Pin image caching to the desktop's own storage. The workspace `cwd`
        // is off-limits — it may be read-only and we don't litter user
        // projects with hidden cache folders.
        cacheDir: this.fileCacheDir,
        canUseTool,
        cwd,
        env,
        helpers: {
          buildClaudeStreamJsonInput: (prompt, imageList) =>
            this.buildStreamJsonInput(prompt, imageList),
          resolveCliImagePaths: (imageList) => this.resolveCliImagePaths(imageList),
        },
        imageList: params.imageList ?? [],
        onStderr: (chunk) => {
          void this.appendCliTraceFile(traceSession, 'stderr.log', chunk);
          stderrChunks.push(chunk);
        },
        pathToClaudeCodeExecutable: cliStatus.path,
        prompt: params.prompt,
        resumeSessionId: session.agentSessionId,
      });
    } catch (err) {
      session.cancel = undefined;
      logger.error('SDK startStream failed:', err);
      this.removeSdkPendingTurn(session, params.operationId);
      this.cleanupInterventionsForOp(params.operationId);
      void this.writeCliTraceJson(traceSession, 'process-error.json', {
        message: err instanceof Error ? err.message : String(err),
        name: err instanceof Error ? err.name : 'Error',
      });
      await this.flushCliTrace(traceSession);
      const sessionError = this.getSessionErrorPayload(err, session);
      this.broadcast('heteroAgentSessionError', {
        error: sessionError,
        sessionId: session.sessionId,
      });
      throw new Error(typeof sessionError === 'string' ? sessionError : sessionError.message, {
        cause: err,
      });
    }

    session.sdkHandle = handle;
    session.sdkStderr = stderrChunks;
    session.sdkTrace = traceSession;
    session.cancel = () => {
      const operationId = session.currentTurnOp ?? session.pendingTurnOpQueue?.[0];
      if (operationId) {
        session.cancelledTurnOps ??= new Set();
        session.cancelledTurnOps.add(operationId);
      }
      void handle.interrupt?.();
    };

    // Same ordering guarantee as the spawn path: serialize broadcast batches
    // so events emitted from in-flight `process()` calls land before flush()'s
    // final batch — `pipeline.process` is synchronous today but the chain is
    // free + keeps the codepaths shaped alike.
    let broadcastQueue: Promise<void> = Promise.resolve();
    const enqueueBatch = (
      events: ReturnType<AgentSdkEventPipeline['process']>,
      pipeline: AgentSdkEventPipeline,
    ) => {
      if (events.length === 0) return;
      broadcastQueue = broadcastQueue.then(() => {
        if (pipeline.sessionId && pipeline.sessionId !== session.agentSessionId) {
          session.agentSessionId = pipeline.sessionId;
        }
        for (const event of events) {
          this.broadcast('heteroAgentEvent', { event, sessionId: session.sessionId });
        }
      });
    };

    session.sdkPump = (async () => {
      try {
        for await (const message of handle.messages) {
          void this.appendCliTraceFile(
            traceSession,
            'messages.jsonl',
            `${JSON.stringify(message)}\n`,
          );

          if (this.isSdkInitMessage(message)) {
            const operationId = this.takeNextSdkTurnOperationId(session);
            if (operationId) {
              session.currentTurnOp = operationId;
              session.sdkPipeline = new AgentSdkEventPipeline({
                agentType: session.agentType,
                operationId,
              });
            }
          }

          if (!session.sdkPipeline) {
            const operationId =
              session.currentTurnOp ??
              session.pendingTurns?.keys().next().value ??
              params.operationId;
            session.currentTurnOp = operationId;
            session.sdkPipeline = new AgentSdkEventPipeline({
              agentType: session.agentType,
              operationId,
            });
          }

          const pipeline = session.sdkPipeline;
          const currentOperationId = session.currentTurnOp;
          const isTurnResult = this.isSdkResultMessage(message);
          const shouldSuppressCancelledError =
            !!currentOperationId && !!session.cancelledTurnOps?.has(currentOperationId);
          const events = pipeline
            .process(message)
            .filter((event) => !(shouldSuppressCancelledError && event.type === 'error'));
          enqueueBatch(events, pipeline);

          if (isTurnResult) {
            await broadcastQueue;
            if (currentOperationId) {
              this.settleSdkPendingTurn(session, currentOperationId);
            }
            session.currentTurnOp = undefined;
            session.sdkPipeline = undefined;
            this.broadcast('heteroAgentSessionComplete', { sessionId: session.sessionId });
          }
        }

        if (session.sdkPipeline) enqueueBatch(session.sdkPipeline.flush(), session.sdkPipeline);
        await broadcastQueue;

        void this.writeCliTraceJson(traceSession, 'exit.json', {
          cancelledByUs: !!session.cancelledByUs,
          finishedAt: new Date().toISOString(),
        });
        await this.flushCliTrace(traceSession);
        this.settleAllSdkPendingTurns(
          session,
          new Error('Claude Code SDK stream ended before the pending turn completed.'),
        );
      } catch (err) {
        await broadcastQueue.catch(() => {
          /* already logged */
        });

        // AbortError or cancelledByUs → clean shutdown (mirrors the spawn path's
        // signal-induced-exit treatment so user cancels and Electron quits don't
        // pollute topics with misleading "Agent error" messages).
        const isAbort =
          err instanceof Error &&
          (err.name === 'AbortError' || /aborted|cancelled/i.test(err.message));
        if (session.cancelledByUs || isAbort) {
          void this.writeCliTraceJson(traceSession, 'exit.json', {
            cancelledByUs: true,
            finishedAt: new Date().toISOString(),
            reason: 'abort',
          });
          await this.flushCliTrace(traceSession);
          this.settleAllSdkPendingTurns(session);
          this.broadcast('heteroAgentSessionComplete', { sessionId: session.sessionId });
        } else {
          logger.error('SDK stream iterator error:', err);
          void this.writeCliTraceJson(traceSession, 'process-error.json', {
            message: err instanceof Error ? err.message : String(err),
            name: err instanceof Error ? err.name : 'Error',
            stderrTail: stderrChunks.join('').slice(-1000),
          });
          await this.flushCliTrace(traceSession);
          const sessionError = this.getSessionErrorPayload(err, session);
          this.broadcast('heteroAgentSessionError', {
            error: sessionError,
            sessionId: session.sessionId,
          });
          const error = new Error(
            typeof sessionError === 'string' ? sessionError : sessionError.message,
            { cause: err },
          );
          this.settleAllSdkPendingTurns(session, error);
        }
      } finally {
        session.cancel = undefined;
        try {
          handle.close();
        } catch (closeErr) {
          logger.warn('SDK handle close error:', closeErr);
        }
        if (session.sdkHandle === handle) {
          session.sdkHandle = undefined;
          session.sdkPump = undefined;
          session.sdkPipeline = undefined;
          session.sdkStderr = undefined;
          session.sdkTrace = undefined;
        }
      }
    })();
    void session.sdkPump.catch(() => {
      /* pump settles pending turn promises itself */
    });

    await pendingTurn;
  }

  /**
   * Get session info (agent's internal session ID for multi-turn resume).
   */
  @IpcMethod()
  async getSessionInfo(params: GetSessionInfoParams): Promise<SessionInfo> {
    const session = this.sessions.get(params.sessionId);
    return { agentSessionId: session?.agentSessionId };
  }

  /**
   * Signal the whole process tree spawned by this session.
   *
   * On Unix the child was spawned with `detached: true`, so negating the pid
   * signals the process group — reaching tool subprocesses (bash, grep, etc.)
   * that would otherwise orphan after a parent-only kill. Falls back to the
   * direct signal if the group kill raises (ESRCH when the leader is already
   * gone). On Windows we shell out to `taskkill /T /F` which walks the tree.
   */
  private killProcessTree(proc: ChildProcess, signal: NodeJS.Signals): void {
    if (!proc.pid || proc.killed) return;

    if (process.platform === 'win32') {
      try {
        spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' });
      } catch (err) {
        logger.warn('taskkill failed:', err);
      }
      return;
    }

    try {
      process.kill(-proc.pid, signal);
    } catch {
      try {
        proc.kill(signal);
      } catch {
        // already exited
      }
    }
  }

  /**
   * Cancel an ongoing session.
   *
   * SDK path (CC): call `session.cancel` (the SDK `AbortController.abort`),
   * which makes the iterator throw `AbortError` — `runSdkStream`'s catch
   * routes that through `heteroAgentSessionComplete`.
   *
   * Spawn path (Codex): SIGINT the process tree, escalate to SIGKILL after
   * 2s if the CLI hasn't exited.
   */
  @IpcMethod()
  async cancelSession(params: CancelSessionParams): Promise<void> {
    const session = this.sessions.get(params.sessionId);
    if (!session) return;

    if (session.sdkHandle?.interrupt) {
      const operationId = session.currentTurnOp ?? session.pendingTurnOpQueue?.[0];
      if (operationId) {
        session.cancelledTurnOps ??= new Set();
        session.cancelledTurnOps.add(operationId);
      }
      try {
        await session.sdkHandle.interrupt();
      } catch (err) {
        logger.warn('SDK interrupt handle threw:', err);
      }
      return;
    }

    if (session.cancel) {
      session.cancelledByUs = true;
      try {
        session.cancel();
      } catch (err) {
        logger.warn('SDK cancel handle threw:', err);
      }
      return;
    }

    if (!session.process || session.process.killed) return;
    session.cancelledByUs = true;
    const proc = session.process;
    this.killProcessTree(proc, 'SIGINT');
    setTimeout(() => {
      if (session.process === proc && !proc.killed) {
        logger.warn('Session did not exit after SIGINT, escalating to SIGKILL:', params.sessionId);
        this.killProcessTree(proc, 'SIGKILL');
      }
    }, 2000);
  }

  /**
   * Stop and clean up a session.
   */
  @IpcMethod()
  async stopSession(params: StopSessionParams): Promise<void> {
    const session = this.sessions.get(params.sessionId);
    if (!session) return;

    if (session.sdkHandle) {
      session.cancelledByUs = true;
      try {
        session.sdkHandle.close();
      } catch (err) {
        logger.warn('SDK handle close threw on stopSession:', err);
      }
      this.settleAllSdkPendingTurns(session);
    } else if (session.cancel) {
      session.cancelledByUs = true;
      try {
        session.cancel();
      } catch (err) {
        logger.warn('SDK cancel handle threw on stopSession:', err);
      }
    } else if (session.process && !session.process.killed) {
      session.cancelledByUs = true;
      const proc = session.process;
      this.killProcessTree(proc, 'SIGTERM');
      setTimeout(() => {
        if (session.process === proc && !proc.killed) {
          this.killProcessTree(proc, 'SIGKILL');
        }
      }, 3000);
    }

    this.sessions.delete(params.sessionId);
  }

  @IpcMethod()
  async respondPermission(): Promise<void> {
    // No-op for CLI mode (permissions handled by --permission-mode flag)
  }

  /**
   * Renderer → main: deliver the user's answer to a pending CC AskUserQuestion
   * (or signal cancellation). Resolves the SDK `canUseTool` callback's
   * pending Promise, the SDK CLI returns the `tool_result` to the model.
   *
   * Idempotent — late submissions for already-resolved tool calls are no-ops.
   * No-op when called for an unknown op; the pending map may have been
   * cleaned up already (op finished / cancelled).
   */
  @IpcMethod()
  async submitIntervention(params: SubmitInterventionParams): Promise<void> {
    const pending = this.opIdToInterventions.get(params.operationId);
    const entry = pending?.get(params.toolCallId);
    if (!entry) {
      logger.warn(
        'submitIntervention: no active intervention for',
        params.operationId,
        params.toolCallId,
      );
      return;
    }
    entry.resolve({
      cancelReason: params.cancelled ? (params.cancelReason ?? 'user_cancelled') : undefined,
      cancelled: params.cancelled,
      result: params.result,
      toolCallId: params.toolCallId,
    });
  }

  /**
   * Cleanup on app quit. `before-quit` covers the user-driven Cmd+Q /
   * `app.quit()` path; SIGTERM / SIGINT cover external kills (test
   * harnesses, OS shutdown) where Electron's lifecycle events never fire.
   */
  afterAppReady() {
    electronApp.on('before-quit', () => {
      for (const [, session] of this.sessions) {
        if (session.sdkHandle) {
          session.cancelledByUs = true;
          try {
            session.sdkHandle.close();
          } catch {
            /* handle may already be closed — fine */
          }
          this.settleAllSdkPendingTurns(session);
        } else if (session.cancel) {
          session.cancelledByUs = true;
          try {
            session.cancel();
          } catch {
            /* abort handle may already be cleared — fine */
          }
        } else if (session.process && !session.process.killed) {
          session.cancelledByUs = true;
          this.killProcessTree(session.process, 'SIGTERM');
        }
      }
      // Resolve any still-pending interventions with `session_ended` so the
      // SDK callback returns a deny payload and the SDK transport settles
      // without leaving the renderer's intervention UI on `pending`.
      for (const operationId of this.opIdToInterventions.keys()) {
        this.cleanupInterventionsForOp(operationId);
      }
      this.sessions.clear();
    });

    const onSignal = (signal: NodeJS.Signals) => {
      // Defer to Electron's normal quit flow so the rest of the app gets a
      // chance to tear down. The `before-quit` handler above is idempotent.
      try {
        electronApp.quit();
      } catch {
        /* during late shutdown app.quit may throw — fine */
      }
      // Last-resort exit if Electron is wedged and won't quit on its own.
      setTimeout(() => process.exit(signal === 'SIGINT' ? 130 : 143), 1000).unref();
    };
    process.on('SIGTERM', onSignal);
    process.on('SIGINT', onSignal);
  }
}
