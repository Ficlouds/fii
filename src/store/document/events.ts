/**
 * Document mutation event bus.
 *
 * Emits when a `documents` row has been mutated by a client-initiated write
 * (UI action or a client-side tool-executor dispatch). Listeners receive the
 * affected `documentId` so they can narrow reactions to a single open editor
 * instead of blindly refreshing after every chat turn.
 *
 * Not wired to server-only tool executions — those don't pass through the
 * client service layer. If you need that coverage, hook the `tool_end` event
 * in `gatewayEventHandler` as well.
 */

export type DocumentChangeOperation =
  | 'edit'
  | 'create'
  | 'remove'
  | 'rename'
  | 'copy'
  | 'upsert'
  | 'updateLoadRule';

export interface DocumentChangeEvent {
  agentId?: string;
  /**
   * The `documents.id` of the mutated row.
   *
   * Optional because server-side tool executions only expose the
   * `agent_documents.id` at the point where we observe the write, not the
   * underlying `documents.id` that the editor is keyed on. When undefined,
   * treat the event as a broadcast — listeners should refresh whichever
   * document they currently display.
   */
  documentId?: string;
  operation: DocumentChangeOperation;
}

type Listener = (event: DocumentChangeEvent) => void;

const listeners = new Set<Listener>();

export const documentEvents = {
  emit: (event: DocumentChangeEvent): void => {
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('[documentEvents] listener threw', error);
      }
    }
  },

  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
