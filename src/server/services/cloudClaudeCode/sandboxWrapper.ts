/**
 * Generate the inline Node.js script that runs inside the sandbox.
 *
 * The script:
 * 1. Spawns `claude` CLI with stream-json output
 * 2. Reads stdout line by line
 * 3. Detects step boundaries (assistant message.id changes)
 * 4. POSTs each step's lines to the TRPC ingest endpoint via curl-style HTTP
 *
 * The script is injected via `runCommand` as `node -e "<script>"`.
 * Environment variables (LOBEHUB_JWT, LOBEHUB_SERVER, CLAUDE_CODE_OAUTH_TOKEN)
 * are injected by preprocessLhCommand or directly via runCommand env.
 */
export function buildSandboxWrapperCommand(params: {
  agentId: string;
  assistantMessageId?: string;
  prompt: string;
  resumeSessionId?: string;
  topicId: string;
}): string {
  const { topicId, agentId, assistantMessageId, prompt, resumeSessionId } = params;

  const escapeForSingleQuotedJs = (value: string) =>
    value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");

  // Escape single quotes in prompt for safe embedding in JS string
  const escapedPrompt = escapeForSingleQuotedJs(prompt);
  const escapedAgentId = escapeForSingleQuotedJs(agentId);
  const escapedAssistantMessageId = assistantMessageId
    ? escapeForSingleQuotedJs(assistantMessageId)
    : '';
  const escapedResumeSessionId = resumeSessionId
    ? escapeForSingleQuotedJs(resumeSessionId)
    : undefined;
  const escapedTopicId = escapeForSingleQuotedJs(topicId);

  const resumeArgs = escapedResumeSessionId ? `'--resume', '${escapedResumeSessionId}',` : '';

  // The inline Node.js script that runs inside the sandbox
  const script = `
const { spawn } = require('child_process');
const { createInterface } = require('readline');
const http = require('http');
const https = require('https');

const SERVER = process.env.LOBEHUB_SERVER || 'https://app.lobehub.com';
const JWT = process.env.LOBEHUB_JWT || '';
const DEBUG_ENABLED = process.env.LOBEHUB_CLOUD_CC_DEBUG === '1';
const TOPIC_ID = '${escapedTopicId}';
const AGENT_ID = '${escapedAgentId}';
const INITIAL_ASSISTANT_MESSAGE_ID = '${escapedAssistantMessageId}';
const RUN_ID = [
  TOPIC_ID,
  AGENT_ID,
  INITIAL_ASSISTANT_MESSAGE_ID || 'no-assistant',
  String(Date.now()),
].join(':');

function postTrpc(path, input) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      json: input,
    });
    const url = new URL(SERVER + path);
    const mod = url.protocol === 'https:' ? https : http;
    const req = mod.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Oidc-Auth': JWT,
      },
    }, (res) => {
      let data = '';
      res.on('data', (d) => data += d);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          console.error('POST failed:', path, res.statusCode, data.slice(0, 200));
        }
        resolve(data);
      });
    });
    req.on('error', (e) => { console.error('POST error:', path, e.message); resolve(''); });
    req.write(body);
    req.end();
  });
}

function post(lines, assistantMessageId) {
  return postTrpc('/trpc/lambda/cloudClaudeCode.ingest', {
    topicId: TOPIC_ID,
    agentId: AGENT_ID,
    ...(assistantMessageId ? { assistantMessageId } : {}),
    lines,
  });
}

async function postDebug(phase, payload) {
  if (!DEBUG_ENABLED) return;

  await postTrpc('/trpc/lambda/cloudClaudeCode.debugLog', {
    topicId: TOPIC_ID,
    agentId: AGENT_ID,
    phase,
    payload,
    runId: RUN_ID,
  });
}

async function postRunStatus(status, errorMessage) {
  if (!INITIAL_ASSISTANT_MESSAGE_ID) return;

  await postTrpc('/trpc/lambda/cloudClaudeCode.updateRunStatus', {
    topicId: TOPIC_ID,
    agentId: AGENT_ID,
    assistantMessageId: INITIAL_ASSISTANT_MESSAGE_ID,
    ...(errorMessage ? { errorMessage } : {}),
    runId: RUN_ID,
    status,
  });
}

const args = [
  '-p', '${escapedPrompt}',
  '--output-format', 'stream-json',
  '--verbose',
  '--include-partial-messages',
  '--allowedTools', 'WebFetch,WebSearch',
  '--permission-mode', 'acceptEdits',
  ${resumeArgs}
];

const child = spawn('claude', args, {
  env: { ...process.env },
  stdio: ['inherit', 'pipe', 'inherit'],
});

const rl = createInterface({ input: child.stdout });
let buffer = [];
let curMsgId;
let initialAssistantMessageId = INITIAL_ASSISTANT_MESSAGE_ID || undefined;
let stepCount = 0;
let processing = Promise.resolve();

async function flush(lines) {
  if (!lines.length) return;
  stepCount++;
  const assistantMessageId = initialAssistantMessageId;
  initialAssistantMessageId = undefined;
  await postDebug('flush:start', {
    assistantMessageId: assistantMessageId || null,
    bufferLength: lines.length,
    firstLineType: lines[0]?.type || null,
    lastLineType: lines[lines.length - 1]?.type || null,
    stepCount,
  });
  await post(lines, assistantMessageId);
  await postDebug('flush:done', {
    assistantMessageId: assistantMessageId || null,
    bufferLength: lines.length,
    stepCount,
  });
  console.error('Step ' + stepCount + ': ' + lines.length + ' events posted');
}

async function processLine(raw) {
  let line;
  try { line = JSON.parse(raw); } catch { return; }
  const streamEventMessageId =
    line.type === 'stream_event' &&
    !line.parent_tool_use_id &&
    line.event?.type === 'message_start' &&
    line.event?.message?.id
      ? line.event.message.id
      : undefined;
  const isSubagentAssistant =
    line.type === 'assistant' &&
    !!line.parent_tool_use_id &&
    line.message &&
    line.message.id;
  const assistantMessageId =
    !isSubagentAssistant &&
    line.type === 'assistant' &&
    line.message &&
    line.message.id
      ? line.message.id
      : undefined;
  const nextMainMessageId = streamEventMessageId || assistantMessageId;
  const eventType =
    line.type === 'stream_event' && line.event && line.event.type
      ? line.event.type
      : undefined;

  await postDebug('line', {
    assistantMessageId: assistantMessageId || null,
    bufferLength: buffer.length,
    curMsgId: curMsgId || null,
    eventType: eventType || null,
    isSubagentAssistant,
    lineType: line.type || null,
    nextMainMessageId: nextMainMessageId || null,
    parentToolUseId: line.parent_tool_use_id || null,
    stepCount,
    streamEventMessageId: streamEventMessageId || null,
  });

  if (nextMainMessageId) {
    if (curMsgId && nextMainMessageId !== curMsgId) {
      const prev = buffer;
      buffer = [line];
      await postDebug('boundary', {
        flushedBufferLength: prev.length,
        fromMessageId: curMsgId,
        nextMainMessageId,
        stepCount,
      });
      await flush(prev);
    } else {
      buffer.push(line);
    }
    curMsgId = nextMainMessageId;
  } else {
    buffer.push(line);
  }
}

rl.on('line', (raw) => {
  processing = processing
    .then(() => processLine(raw))
    .catch((error) => {
      console.error('Line processing error:', error && error.message ? error.message : error);
    });
});

child.on('close', () => {
  processing = processing
    .then(async () => {
      await postDebug('close:start', {
        bufferLength: buffer.length,
        curMsgId: curMsgId || null,
        stepCount,
      });
      await flush(buffer);
      await postRunStatus('completed');
      await postDebug('close:done', {
        curMsgId: curMsgId || null,
        stepCount,
      });
      console.error('Done: ' + stepCount + ' step(s)');
    })
    .catch((error) => {
      console.error('Close processing error:', error && error.message ? error.message : error);
    });
});
`.trim();

  // Return as node -e command
  return `node -e '${script.replaceAll("'", "'\\''")}'`;
}
