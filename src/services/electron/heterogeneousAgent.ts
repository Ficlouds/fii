import { ensureElectronIpc } from '@/utils/electron/ipc';

/**
 * Renderer-side service for managing heterogeneous agent processes via Electron IPC.
 */
class HeterogeneousAgentService {
  private get ipc() {
    return ensureElectronIpc();
  }

  async startSession(params: {
    agentType?: string;
    args?: string[];
    command: string;
    cwd?: string;
    env?: Record<string, string>;
    resumeSessionId?: string;
  }) {
    return this.ipc.heterogeneousAgent.startSession(params);
  }

  async sendPrompt(
    sessionId: string,
    prompt: string,
    operationId: string,
    imageList?: Array<{ id: string; url: string }>,
    /**
     * Streaming-input pivot semantics (LOBE-8804). Only honoured by the
     * SDK driver when there's already a live channel for this session:
     *
     * - `'soft'` — the in-flight tool finishes, the model's pending verbal
     *   reply is dropped, and this prompt drives a fresh turn (SDK
     *   `priority: 'now'`). This is the "drop reply, pivot" case.
     * - `'hard'` — the active tool_use is aborted with a synthetic
     *   rejection and this prompt drives a fresh turn (SDK
     *   `handle.interrupt()` + push).
     * - `undefined` — first prompt of a session, or follow-up that didn't
     *   originate from a running op. No special handling.
     */
    interruptMode?: 'soft' | 'hard',
  ) {
    return this.ipc.heterogeneousAgent.sendPrompt({
      imageList,
      interruptMode,
      operationId,
      prompt,
      sessionId,
    });
  }

  async cancelSession(sessionId: string) {
    return this.ipc.heterogeneousAgent.cancelSession({ sessionId });
  }

  async stopSession(sessionId: string) {
    return this.ipc.heterogeneousAgent.stopSession({ sessionId });
  }

  async getSessionInfo(sessionId: string) {
    return this.ipc.heterogeneousAgent.getSessionInfo({ sessionId });
  }

  /**
   * Submit the user's answer (or cancellation) for a pending CC
   * AskUserQuestion intervention. The main process routes it to the
   * matching MCP bridge so the blocked tool handler can return to CC.
   */
  async submitIntervention(params: {
    cancelReason?: 'timeout' | 'user_cancelled';
    cancelled?: boolean;
    operationId: string;
    result?: unknown;
    toolCallId: string;
  }) {
    return this.ipc.heterogeneousAgent.submitIntervention(params);
  }
}

export const heterogeneousAgentService = new HeterogeneousAgentService();
