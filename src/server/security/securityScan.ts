/**
 * Fi Security Scanner — calls the local LLM Guard bridge service
 * to check user messages for prompt injection, PII, and toxicity
 * before they reach the LLM provider.
 *
 * The bridge service must be running at SECURITY_BRIDGE_URL
 * (default: http://127.0.0.1:8001) — see /security-bridge/main.py
 */

const SECURITY_BRIDGE_URL = process.env.SECURITY_BRIDGE_URL || 'http://127.0.0.1:8001';

interface ScanInputResult {
  is_safe: boolean;
  risk_scores: Record<string, number>;
  sanitized_prompt: string;
  triggered_scanners: string[];
}

export interface SecurityScanResult {
  /** Whether the message passed all checks */
  isSafe: boolean;
  /** The message with PII masked (if any was found) — use this instead of the original */
  sanitizedContent: string;
  /** Which scanners flagged the message, if any */
  triggeredScanners: string[];
}

/**
 * Scans a single piece of text content for security issues.
 * Fails open (returns isSafe: true) if the bridge is unreachable,
 * so a bridge outage never takes down chat entirely — but logs loudly
 * so you notice and fix it.
 */
export async function scanUserMessage(content: string): Promise<SecurityScanResult> {
  try {
    const res = await fetch(`${SECURITY_BRIDGE_URL}/scan/input`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: content }),
      // Don't let a slow/dead bridge hang the whole chat request
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.error(`[Fi Security] Bridge returned ${res.status}, failing open`);
      return { isSafe: true, sanitizedContent: content, triggeredScanners: [] };
    }

    const result = (await res.json()) as ScanInputResult;

    return {
      isSafe: result.is_safe,
      sanitizedContent: result.sanitized_prompt,
      triggeredScanners: result.triggered_scanners,
    };
  } catch (error) {
    // Bridge down, network error, timeout, etc. — fail open, log it
    console.error('[Fi Security] Bridge unreachable, failing open:', error);
    return { isSafe: true, sanitizedContent: content, triggeredScanners: [] };
  }
}

interface ScanOutputResult {
  has_identity_leak: boolean;
  is_safe: boolean;
  triggered_patterns: string[];
}

export interface OutputScanResult {
  hasIdentityLeak: boolean;
  isSafe: boolean;
  triggeredPatterns: string[];
}

/**
 * Scans Fi's response for identity leaks before it reaches the user.
 * This is the last safety net — catches "I am DeepSeek" type responses
 * regardless of what language or attack caused them.
 * Fails open (lets response through) if bridge is unreachable.
 */
export async function scanFiOutput(
  response: string,
  userMessage: string = '',
): Promise<OutputScanResult> {
  try {
    const res = await fetch(`${SECURITY_BRIDGE_URL}/scan/output`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response, user_message: userMessage }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.error(`[Fi Security] Output scan bridge returned ${res.status}, failing open`);
      return { isSafe: true, hasIdentityLeak: false, triggeredPatterns: [] };
    }

    const result = (await res.json()) as ScanOutputResult;

    return {
      isSafe: result.is_safe,
      hasIdentityLeak: result.has_identity_leak,
      triggeredPatterns: result.triggered_patterns,
    };
  } catch (error) {
    console.error('[Fi Security] Output scan unreachable, failing open:', error);
    return { isSafe: true, hasIdentityLeak: false, triggeredPatterns: [] };
  }
}

const PROMPT_GUARD_URL = process.env.PROMPT_GUARD_URL || 'http://174.129.39.26:8003';

interface PromptGuardResult {
  confidence: number;
  is_safe: boolean;
  threat_type: string | null;
}

export interface PromptGuardScanResult {
  confidence: number;
  isSafe: boolean;
  threatType: string | null;
}

/**
 * Multilingual injection and jailbreak detector.
 * Llama Prompt Guard 2 86M — covers English, French, German,
 * Hindi, Italian, Portuguese, Spanish, Thai natively.
 * Runs before message reaches DeepSeek. Fails open so a bridge
 * outage never breaks chat entirely.
 */
export async function scanWithPromptGuard(content: string): Promise<PromptGuardScanResult> {
  try {
    const res = await fetch(`${PROMPT_GUARD_URL}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error(`[Fi Prompt Guard] Bridge returned ${res.status}, failing open`);
      return { isSafe: true, threatType: null, confidence: 0 };
    }

    const result = (await res.json()) as PromptGuardResult;
    return {
      isSafe: result.is_safe,
      threatType: result.threat_type,
      confidence: result.confidence,
    };
  } catch (error) {
    console.error('[Fi Prompt Guard] Bridge unreachable, failing open:', error);
    return { isSafe: true, threatType: null, confidence: 0 };
  }
}

// Pre-written varied blocked responses. Sounds like Fi, never like a server error.
// Static variants mean zero async failure risk and instant response.
const BLOCKED_RESPONSES = [
  'That one is not something I can help with. What else is on your mind?',
  'Happy to help, just not with that particular message. What else can I do for you?',
  'That falls outside what I can work with. Got something else?',
  'Not something I am able to assist with. What would you like to tackle instead?',
  'That is a bit outside my lane. What else can I help you with today?',
  'I will have to pass on that one. What else are you working on?',
  'That one I cannot take on. What else can I help you with?',
  'Outside what I can help with, but happy to jump into something else. What do you need?',
  'That is not something Fi can assist with. What else is going on?',
  'I am going to have to skip that one. What else can I help you with?',
  'That message is outside what I can work with. Anything else on your list?',
  'Not able to help with that one specifically. What else would you like to explore?',
];

/**
 * Returns a natural, friendly Fi response when a message is blocked
 * by any security layer. Randomly picks from pre-written variants so
 * it never sounds scripted, never sounds like a crashed server.
 */
export function generateBlockedResponse(): string {
  const index = Math.floor(Math.random() * BLOCKED_RESPONSES.length);
  return BLOCKED_RESPONSES[index] as string;
}

const UNICODE_NORMALIZER_URL = process.env.UNICODE_NORMALIZER_URL || 'http://174.129.39.26:8009';

/**
 * Normalizes input text before scanning:
 * - Strips zero-width and invisible Unicode characters
 * - NFKC normalization (folds fullwidth, homoglyphs)
 * - Decodes Base64 and ROT13 encoded attacks
 * Runs before every other scanner so attacks cannot hide behind encoding.
 * Fails open so a bridge outage never breaks chat.
 */
export async function normalizeInput(text: string): Promise<string> {
  try {
    const res = await fetch(`${UNICODE_NORMALIZER_URL}/normalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return text;

    const result = (await res.json()) as { normalized: string; was_modified: boolean };
    if (result.was_modified) {
      console.warn('[Fi Unicode] Input normalized before scanning');
    }
    return result.normalized;
  } catch {
    return text;
  }
}

const IMAGE_PROCESSOR_URL = process.env.IMAGE_PROCESSOR_URL || 'http://174.129.39.26:8010';

/**
 * Strips EXIF metadata and re-encodes images before they reach Gemini.
 * Destroys steganographic payloads embedded in image pixels or metadata.
 * Fails open so a bridge outage never breaks image uploads.
 */
export async function preprocessImage(
  imageBase64: string,
  mediaType: string = 'image/jpeg',
): Promise<{ imageBase64: string; mediaType: string }> {
  try {
    const res = await fetch(`${IMAGE_PROCESSOR_URL}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64, media_type: mediaType }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return { imageBase64, mediaType };

    const result = (await res.json()) as { image_base64: string; media_type: string };
    return { imageBase64: result.image_base64, mediaType: result.media_type };
  } catch {
    return { imageBase64, mediaType };
  }
}

const MEMORY_BRIDGE_URL = process.env.MEMORY_BRIDGE_URL || 'http://174.129.39.26:8008';

export interface MemoryResult {
  id: string;
  memory: string;
  salience: number;
  score: number;
  sensitivity: string;
}

/**
 * Retrieves relevant memories for a user based on their current message.
 * Returns top memories sorted by relevance and salience combined.
 * Fails open — if memory bridge is unreachable, Fi responds without memory context.
 */
export async function retrieveUserMemories(
  userId: string,
  query: string,
  limit: number = 5,
): Promise<MemoryResult[]> {
  try {
    const res = await fetch(`${MEMORY_BRIDGE_URL}/memory/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, query, limit }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { results: MemoryResult[] };
    return data.results || [];
  } catch {
    return [];
  }
}

/**
 * Saves conversation memories after a chat turn completes.
 * Extracts facts from the conversation and stores in Mem0.
 * Runs asynchronously — never blocks the chat response.
 */
export async function saveConversationMemory(
  userId: string,
  messages: { role: string; content: string }[],
): Promise<void> {
  try {
    await fetch(`${MEMORY_BRIDGE_URL}/memory/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, messages, sensitivity: 'factual' }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    // Fail silently — memory save never blocks chat
  }
}

// ── LlamaFirewall Input Scanner ──────────────────────────────────────────────
// Runs on Fi's FastAPI bridge — adds regex + LlamaFirewall PromptGuard layer
// on top of the existing fi-prompt-guard (86M) and fi-llm-guard checks.

const FI_FASTAPI_URL = process.env.FI_FASTAPI_URL || 'http://174.129.39.26:8008';
const FI_API_KEY = process.env.FI_API_KEY || '0gw1eTGuCyE64Q9jswo-NnzX7tzq49zdaO6msc1w47g';

export interface LlamaFirewallResult {
  confidence: number;
  isSafe: boolean;
  method: string;
  threatType: string | null;
}

export async function scanWithLlamaFirewall(content: string): Promise<LlamaFirewallResult> {
  try {
    const res = await fetch(`${FI_FASTAPI_URL}/scan/input`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Fi-API-Key': FI_API_KEY,
      },
      body: JSON.stringify({ message: content }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error(`[Fi LlamaFirewall] Bridge returned ${res.status}, failing open`);
      return { isSafe: true, threatType: null, confidence: 0, method: 'error' };
    }

    const result = await res.json();
    return {
      isSafe: result.is_safe,
      threatType: result.threat_type,
      confidence: result.confidence,
      method: result.method,
    };
  } catch (error) {
    console.error('[Fi LlamaFirewall] Bridge unreachable, failing open:', error);
    return { isSafe: true, threatType: null, confidence: 0, method: 'error' };
  }
}

// ── Fi Guardrails — Identity Probe Interceptor ────────────────────────────────
// Detects identity probes ("are you DeepSeek?") and returns natural Fi response
// Only called when message contains identity signals — zero overhead on normal messages

const FI_GUARDRAILS_URL = process.env.FI_GUARDRAILS_URL || 'http://174.129.39.26:8002';

export interface GuardrailsResult {
  intercepted: boolean;
  response: string | null;
}

export async function checkWithFiGuardrails(content: string): Promise<GuardrailsResult> {
  try {
    const res = await fetch(`${FI_GUARDRAILS_URL}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return { intercepted: false, response: null };
    }

    const result = await res.json();
    return {
      intercepted: result.intercepted === true,
      response: result.response || null,
    };
  } catch (error) {
    console.error('[Fi Guardrails] Unreachable, failing open:', error);
    return { intercepted: false, response: null };
  }
}

// ── Multi-Turn Attack Scanner ─────────────────────────────────────────────────
export interface MultiTurnResult {
  checked: boolean;
  isAttack: boolean;
  reason: string;
}

export async function scanMultiTurn(
  userId: string,
  content: string,
  role: string = 'user',
): Promise<MultiTurnResult> {
  try {
    const res = await fetch(`${FI_FASTAPI_URL}/scan/multiturn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Fi-API-Key': FI_API_KEY,
      },
      body: JSON.stringify({ user_id: userId, message: content, role }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return { isAttack: false, checked: false, reason: 'error' };
    }

    const result = await res.json();
    return {
      isAttack: result.is_attack === true,
      checked: result.checked === true,
      reason: result.reason || '',
    };
  } catch (error) {
    console.error('[Fi MultiTurn] Scan failed, failing open:', error);
    return { isAttack: false, checked: false, reason: 'error' };
  }
}
