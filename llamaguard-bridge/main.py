"""
Fi GLiGuard Bridge — output content safety check
======================================================
Checks Fi's GENERATED RESPONSE for genuinely harmful content before
showing it to the user. Self-hosted equivalent of the AutoDefense
concept — catching cases where a clean-looking input somehow produces
a harmful output anyway.

Uses Fastino's GLiGuard (300M params) — per Fastino's published
benchmarks across nine safety datasets, GLiGuard matches or exceeds
the accuracy of decoder-based guard models 23-90x its size (including
ShieldGemma-27B, LlamaGuard4-12B, NemoGuard-8B), while running up to
16-20x faster. It uses a single non-autoregressive forward pass
(classification) rather than token-by-token generation, which is why
it's dramatically faster on resource-constrained hardware than
generative safety models like ShieldGemma or Llama Guard.

Self-hosted: no rate limits, no external API, no data leaves this
machine.

Run with:
    .venvs/llama-guard/bin/uvicorn main:app --host 127.0.0.1 --port 8003

LOCAL ONLY (127.0.0.1) — not exposed to the internet.
"""

from fastapi import FastAPI
from gliner2 import GLiNER2
from pydantic import BaseModel

app = FastAPI(title="Fi GLiGuard Bridge", version="1.0.0")

MODEL_ID = "fastino/gliguard-LLMGuardrails-300M"

print("[Fi GLiGuard] Loading model...")
model = GLiNER2.from_pretrained(MODEL_ID)
print("[Fi GLiGuard] Model loaded, ready.")

SAFETY_LABELS = ["safe", "unsafe"]


class CheckRequest(BaseModel):
    user_message: str
    assistant_response: str


class CheckResponse(BaseModel):
    is_safe: bool
    label: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "fi-gliguard-bridge"}


@app.post("/check", response_model=CheckResponse)
def check_response(req: CheckRequest):
    """
    Checks if Fi's response (given the user's message as context)
    contains genuinely harmful content.
    """
    text = f"Prompt: {req.user_message}\nResponse: {req.assistant_response}"

    result = model.classify_text(text, {"response_safety": SAFETY_LABELS})
    label = result.get("response_safety", "safe")

    return CheckResponse(is_safe=(label == "safe"), label=label)
