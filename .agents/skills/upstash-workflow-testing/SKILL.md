---
name: upstash-workflow-testing
description: Local testing guide for Upstash Workflow endpoints via the QStash dev server. Use when verifying workflow handlers end-to-end, debugging why a workflow step isn't firing, inspecting step-level logs and outputs, or triggering a dry-run from curl. Triggers on 'test workflow locally', 'smoke test workflow', 'qstash dev server', 'workflow dry run', 'debug workflow step'.
---

# Upstash Workflow Local Testing

How to trigger, observe, and debug Upstash Workflow endpoints against the local QStash dev server — **without** writing unit tests.

## TL;DR

Workflow endpoints reject raw curl (signature verification). To test locally:

1. **Publish via QStash dev server** at `localhost:8080`, not directly to your handler
2. **Query workflow logs** via `/v2/workflows/logs?workflowRunId=...` — NOT `/v2/events` (events only lists direct publishes, not workflow-internal step publishes)

## Prerequisites

The `.env` file already ships dev defaults:

```bash
QSTASH_URL="http://localhost:8080"
QSTASH_TOKEN="eyJVc2VySUQiOiJkZWZhdWx0VXNlciIs..." # dev default token
QSTASH_CURRENT_SIGNING_KEY="sig_..."
QSTASH_NEXT_SIGNING_KEY="sig_..."
```

Dev startup (`bun run dev`) boots both the Next.js server and a local QStash dev server. Verify:

```bash
lsof -i :3011 # Next.js
lsof -i :8080 # QStash dev server
```

If QStash isn't up: `brew install upstash/qstash/qstash-cli && qstash dev` (or check the dev startup script).

## 1. Trigger a workflow

Publish to QStash dev server, which signs + forwards to your handler:

```bash
TOKEN="$(grep '^QSTASH_TOKEN=' .env | cut -d '"' -f2)"
TARGET="http://localhost:3011/api/workflows/memory-user-memory/cron/hourly"

curl -X POST "http://localhost:8080/v2/publish/$TARGET" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true, "baseUrl": "http://localhost:3011"}'
# → {"messageId":"msg_..."}
```

For dry-run, always pass `"dryRun": true` in the body. The handler should return stats without triggering downstream L2/L3 pipelines.

## 2. Observe execution

### Workflow logs (authoritative source)

```bash
# List recent runs (all workflows)
curl -s "http://localhost:8080/v2/workflows/logs" \
  -H "Authorization: Bearer $TOKEN" | jq '.runs[] | {id: .workflowRunId, url: .workflowUrl, state: .workflowState}'

# Inspect a specific run
WFR="wfr_xxxxxxxxxxxxxxxxx"
curl -s "http://localhost:8080/v2/workflows/logs?workflowRunId=$WFR" \
  -H "Authorization: Bearer $TOKEN" | jq '.runs[0].steps'
```

Each step entry includes:

- `stepName` — what you passed to `context.run('<name>', ...)`
- `stepType` — `Initial` | `Run` | `Call` | `Invoke` | `SleepFor` | etc.
- `state` — `STEP_SUCCESS` | `STEP_FAILED` | `STEP_RETRY`
- `out` — JSON-serialized return value of the step (base64 in some fields)
- `messageId` — underlying QStash message for that step

Run-level `workflowState`:

- `RUN_SUCCESS` — all steps completed
- `RUN_FAILED` — a step hit max retries
- `RUN_CANCELED` — explicitly canceled

### Events (direct-publish only — NOT step-level)

```bash
curl -s "http://localhost:8080/v2/events?count=50" \
  -H "Authorization: Bearer $TOKEN" | jq '.events[] | {state, url, messageId}'
```

`/v2/events` only shows messages you publish to QStash directly (the initial trigger, plus any `client.trigger(...)` calls from inside a `context.run`). It does **NOT** show internal workflow-step messages that `serve()` publishes to itself — for those, use `/v2/workflows/logs`.

If you trigger pipeline A → B and only see A's messages in `/v2/events`, that usually means A's handler published correctly but B hasn't been inspected by workflow logs yet. Query `/v2/workflows/logs` for B's workflowRunId instead.

## 3. Common failure modes

### a. 500 "Upstash-Signature header is not passed"

You curl'd the handler directly. Publish via `http://localhost:8080/v2/publish/<target>` instead.

### b. Handler runs but no downstream workflow fires

The `qstashClient` passed to `serve()` or used by your `triggerXxx` helper probably doesn't honor `QSTASH_URL`. **Both clients must point at the dev server.**

`@upstash/qstash`'s `Client` uses **`baseUrl`** in the config object (NOT `url`) and also reads `QSTASH_URL` from env automatically:

```ts
// ✅ Correct
new Client({ token, baseUrl: process.env.QSTASH_URL });

// ⚠️ Works too (env var fallback) but explicit is safer
new Client({ token });
```

`@upstash/workflow`'s `Client` — used by `MemoryExtractionWorkflowService` and similar trigger helpers — forwards to the same QStash client internally.

### c. `triggerXxx()` returns `{workflowRunId}` but `/v2/events` shows nothing

`/v2/events` only lists direct publishes. A `client.trigger()` call publishes to QStash's workflow API, which creates a run log entry (visible via `/v2/workflows/logs`) plus its own initial QStash message. Always cross-check with `/v2/workflows/logs` before concluding the trigger failed.

### d. Dry-run path still cascades to L2

Means the handler read `dryRun` from the wrong field. For our codebase the convention is to put `dryRun: true` at the **top level** of the body; the L1 handler reads it off `context.requestPayload` directly (not via `normalizeMemoryExtractionPayload`, which strips unknown fields). When in doubt, `appendFileSync('/tmp/<wf>-debug.log', ...)` inside the handler to log the exact payload received.

### e. You need to see handler logs but can't access dev server stdout

Dev is usually started in the background. When you can't tail stdout, drop a **temporary** file logger into the handler:

```ts
import { appendFileSync } from 'node:fs';

appendFileSync('/tmp/wf-debug.log', `[${new Date().toISOString()}] <message>\n`);
```

Delete before committing. Also consider `verbose: true` on the `serve()` options — that routes @upstash/workflow's internal tracing to console (which, again, you need stdout access for).

## 4. End-to-end smoke recipes

### Dry-run the entire hourly cron dispatcher

```bash
TOKEN=$(grep '^QSTASH_TOKEN=' .env | cut -d '"' -f2)
TARGET='http://localhost:3011/api/workflows/memory-user-memory/cron/hourly'
MSG=$(curl -s -X POST "http://localhost:8080/v2/publish/$TARGET" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"dryRun": true, "baseUrl": "http://localhost:3011"}' \
  | jq -r .messageId)

# Follow the cron/hourly run to completion (polls until RUN_SUCCESS or RUN_FAILED)
while :; do
  STATE=$(curl -s "http://localhost:8080/v2/workflows/logs" \
    -H "Authorization: Bearer $TOKEN" \
    | jq -r --arg url "$TARGET" '.runs[] | select(.workflowUrl == $url) | .workflowState' | head -1)
  echo "state: $STATE"
  [[ "$STATE" == "RUN_SUCCESS" || "$STATE" == "RUN_FAILED" ]] && break
  sleep 2
done
```

Expected on success: two child workflow runs appear in `/v2/workflows/logs` — one at `/topics/process-users`, one at `/persona/process-users`. Each should also reach `RUN_SUCCESS` in dry-run (L1 returns stats; no L2 triggered).

### Directly target a single L1 (skip the cron dispatcher)

```bash
TARGET='http://localhost:3011/api/workflows/memory-user-memory/topics/process-users'
curl -X POST "http://localhost:8080/v2/publish/$TARGET" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"dryRun": true, "baseUrl": "http://localhost:3011", "mode": "workflow"}'
```

Then query logs for that workflow run — should complete in 1–2 steps with stats in the final step's `out`.

## 5. What NOT to do

- ❌ Unit-testing the handler by constructing a fake `WorkflowContext`. The workflow runtime does step caching, replay, and QStash round-trips that you can't realistically mock. Integration via QStash dev server is faster and more accurate.
- ❌ Bypassing signature verification by clearing `QSTASH_*_SIGNING_KEY` env. Dev QStash signs requests — leaving verification on catches misconfigured receivers.
- ❌ Relying on `/v2/events` as the full picture of a workflow run. Use `/v2/workflows/logs` for step-level truth.

## References

- Upstash QStash local dev: <https://upstash.com/docs/qstash/howto/local-development>
- Workflow basics (serve/context/run): <https://upstash.com/docs/workflow/basics/context>
- Related skill: `upstash-workflow` (implementation patterns)
