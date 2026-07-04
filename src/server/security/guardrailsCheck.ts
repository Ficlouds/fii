/**
 * Fi Guardrails Check — calls the local NeMo Guardrails bridge service
 * to check user messages against conversation rules (e.g. identity
 * protection) BEFORE they reach the LLM provider.
 *
 * The bridge service must be running at GUARDRAILS_BRIDGE_URL
 * (default: http://127.0.0.1:8002) — see /guardrails-bridge/main.py
 */

const GUARDRAILS_BRIDGE_URL = process.env.GUARDRAILS_BRIDGE_URL || 'http://127.0.0.1:8002';

interface GuardrailsCheckResult {
  intercepted: boolean;
  response: string | null;
}

/**
 * Checks a user message against Fi's conversation rules.
 * Fails open (returns intercepted: false) if the bridge is unreachable,
 * so a bridge outage never takes down chat entirely — but logs loudly
 * so you notice and fix it.
 */
export async function checkGuardrails(content: string): Promise<GuardrailsCheckResult> {
  try {
    const res = await fetch(`${GUARDRAILS_BRIDGE_URL}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn('[Fi Guardrails] Bridge returned non-OK status:', res.status);
      return { intercepted: false, response: null };
    }

    return (await res.json()) as GuardrailsCheckResult;
  } catch (error) {
    console.warn('[Fi Guardrails] Bridge unreachable, failing open:', error);
    return { intercepted: false, response: null };
  }
}
