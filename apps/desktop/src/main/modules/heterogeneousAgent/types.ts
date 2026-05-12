import type { CanUseTool } from '@anthropic-ai/claude-agent-sdk';

export interface HeterogeneousAgentImageAttachment {
  id: string;
  url: string;
}

export interface HeterogeneousAgentBuildPlan {
  args: string[];
  stdinPayload?: string;
}

export interface HeterogeneousAgentBuildPlanHelpers {
  buildClaudeStreamJsonInput: (
    prompt: string,
    imageList: HeterogeneousAgentImageAttachment[],
  ) => Promise<string>;
  resolveCliImagePaths: (imageList: HeterogeneousAgentImageAttachment[]) => Promise<string[]>;
}

export interface HeterogeneousAgentBuildPlanParams {
  args: string[];
  helpers: HeterogeneousAgentBuildPlanHelpers;
  imageList: HeterogeneousAgentImageAttachment[];
  prompt: string;
  resumeSessionId?: string;
}

export interface HeterogeneousAgentStartStreamParams extends HeterogeneousAgentBuildPlanParams {
  /**
   * Aborted by the controller on cancelSession / stopSession / app quit. The
   * driver MUST react by killing its underlying transport (e.g. SDK
   * `query.close()` via the wrapped `AbortController`) so the iterator
   * settles.
   */
  abortSignal: AbortSignal;
  /**
   * Writable cache directory for image attachments (rooted under
   * `appStoragePath`, NOT the workspace `cwd`). The controller owns the
   * location so cached bytes stay inside the desktop app's own storage —
   * keeping read-only workspaces functional and avoiding hidden cache folders
   * inside the user's project.
   */
  cacheDir: string;
  /**
   * SDK permission callback. The controller wires this end-to-end:
   * - `AskUserQuestion`: emit `agent_intervention_request` and await the
   *   user's submission via the `submitIntervention` IPC, then return
   *   `{ behavior: 'allow', updatedInput: { questions, answers } }` so the
   *   CLI synthesises a `tool_result` containing the user's pick.
   * - Other built-in tools (Bash / Write / Edit / ...): currently auto-allow
   *   (matching the previous `--permission-mode bypassPermissions` behavior);
   *   per-tool approval UI lands in a follow-up.
   * The driver passes this straight to `query()`'s `canUseTool` option.
   */
  canUseTool?: CanUseTool;
  /** Working directory for the spawned subprocess. */
  cwd: string;
  /** Forwarded environment (proxy + per-session env). */
  env?: Record<string, string>;
  /** Stderr callback — controller writes this to the trace `stderr.log`. */
  onStderr?: (chunk: string) => void;
  /**
   * Absolute path to the user-installed `claude` (or `codex`) executable.
   * **Required** for SDK-backed drivers. Passing it is the desktop's
   * deliberate gate against the SDK silently falling back to its bundled
   * 200MB platform binary — the install hook (`apps/desktop/.pnpmfile.cjs`)
   * already strips those optional deps, but we double-belt by enforcing
   * this at the call site.
   */
  pathToClaudeCodeExecutable: string;
}

/**
 * Priority for a follow-up user message pushed via {@link
 * HeterogeneousAgentStreamHandle.pushUserMessage}. Mirrors the SDK's
 * `SDKUserMessage.priority` field but defined here so the IPC / controller
 * layer doesn't need to import the SDK types.
 *
 * - `undefined`: first prompt or no-special-handling push. SDK starts a new
 *   turn as soon as the channel produces; if a turn is in-flight, behaves
 *   like `'later'`.
 * - `'now'`: SDK lets the in-flight tool finish, then aborts the model's
 *   pending reply and starts a new turn with this message. Used for the
 *   "soft" interrupt — user wants to pivot, doesn't care about the prior
 *   turn's verbal answer. **Verified in LOBE-8747 spike.**
 * - `'later'`: queues the message strictly after the in-flight turn fully
 *   completes (including the model's reply). Currently unused by LobeHub
 *   — kept for completeness.
 *
 * `'next'` is deliberately **not** exposed: it makes the SDK merge two
 * prompts into a single assistant turn, which is invisible-to-the-user
 * behavior we don't want.
 */
export type HeterogeneousAgentPushPriority = 'now' | 'later';

export interface HeterogeneousAgentPushUserMessageParams {
  /** Image attachments accompanying this user message. */
  imageList: HeterogeneousAgentImageAttachment[];
  /** SDK priority — see {@link HeterogeneousAgentPushPriority}. */
  priority?: HeterogeneousAgentPushPriority;
  /** Text prompt for this turn. */
  prompt: string;
}

export interface HeterogeneousAgentStreamHandle {
  /** Close the underlying transport and release resources. Idempotent. */
  close: () => void;
  /**
   * Cooperative interrupt (e.g. SDK `query.interrupt()`); for cancellation
   * use the `abortSignal` passed at start time. Used by the "hard" interrupt
   * path — `interrupt()` then `pushUserMessage()` lands a synthetic
   * tool_result rejection for any in-flight tool_use, then continues with
   * the new user message in a fresh turn.
   */
  interrupt?: () => Promise<void>;
  /** Pre-parsed provider events ready to feed `AgentSdkEventPipeline.process`. */
  messages: AsyncIterable<unknown>;
  /**
   * Push a follow-up user message into the same long-lived query session
   * (streaming-input mode). The handle creates the SDK channel on first
   * `startStream` and reuses it across every subsequent call. Drivers that
   * don't support streaming-input may omit this.
   */
  pushUserMessage?: (params: HeterogeneousAgentPushUserMessageParams) => Promise<void>;
}

/**
 * Per-agent transport contract.
 *
 * Two mutually-exclusive flows; a driver implements exactly one:
 *
 * - {@link buildSpawnPlan}: legacy spawn-and-pipe path. Driver returns the
 *   CLI args + optional stdin payload; the controller spawns a child
 *   process, frames stdout via {@link AgentStreamPipeline}, and adapter
 *   conversion runs on the parsed JSONL. Codex still uses this.
 * - {@link startStream}: SDK-backed path. Driver returns an async iterable
 *   of already-parsed provider messages plus an interrupt/close handle;
 *   the controller pumps them through {@link AgentSdkEventPipeline} (which
 *   reuses the same adapter — message shapes are identical).
 *
 * Driver authors MUST implement at least one. The controller picks the
 * SDK path when `startStream` is present.
 */
export interface HeterogeneousAgentDriver {
  buildSpawnPlan?: (
    params: HeterogeneousAgentBuildPlanParams,
  ) => Promise<HeterogeneousAgentBuildPlan>;
  startStream?: (
    params: HeterogeneousAgentStartStreamParams,
  ) => Promise<HeterogeneousAgentStreamHandle>;
}
