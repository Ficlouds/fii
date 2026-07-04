"""
Fi Qwen3Guard Bridge — output content safety check
======================================================
Checks Fi's GENERATED RESPONSE for genuinely harmful content before
showing it to the user. Replaces GLiGuard after hands-on testing showed
GLiGuard misses phishing/social-engineering content (classified a real
phishing email template as "safe"). Qwen3Guard-0.6B correctly caught it
in the same test, alongside violence and illegal-acts cases.

Why this model specifically: independently verified (not just the
creator's own claims) — scored 78.3 F1 on the Poly-Guard independent
benchmark, beating ShieldGemma-9B's 56.8, while being ~15x smaller.
Confirmed working on this exact machine: ~1.3-1.8s per check, correct
on all 3 hands-on test cases (violence, benign, phishing).

Run with:
    .venvs/presidio/bin/uvicorn main:app --host 127.0.0.1 --port 8005

LOCAL ONLY (127.0.0.1) — not exposed to the internet.
"""

import re

import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer

app = FastAPI(title="Fi Qwen3Guard Bridge", version="1.0.0")

MODEL_ID = "Qwen/Qwen3Guard-Gen-0.6B"

print("[Fi Qwen3Guard] Loading model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float32,
    device_map="cpu",
)
print("[Fi Qwen3Guard] Model loaded, ready.")

SAFETY_LINE_RE = re.compile(r"Safety:\s*(Safe|Unsafe|Controversial)", re.IGNORECASE)


class CheckRequest(BaseModel):
    user_message: str
    assistant_response: str


class CheckResponse(BaseModel):
    is_safe: bool
    raw_result: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "fi-qwen3guard-bridge"}


@app.post("/check", response_model=CheckResponse)
def check_response(req: CheckRequest):
    """
    Checks if Fi's response (given the user's message as context)
    contains genuinely harmful content, including phishing/scam content.
    """
    messages = [
        {"role": "user", "content": req.user_message},
        {"role": "assistant", "content": req.assistant_response},
    ]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
    inputs = tokenizer(text, return_tensors="pt")

    with torch.no_grad():
        output = model.generate(**inputs, max_new_tokens=50, do_sample=False)

    result = tokenizer.decode(
        output[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True
    )

    match = SAFETY_LINE_RE.search(result)
    label = match.group(1).lower() if match else "unknown"

    # Treat "controversial" as unsafe — better to be cautious on ambiguous cases
    is_safe = label == "safe"

    return CheckResponse(is_safe=is_safe, raw_result=result)
