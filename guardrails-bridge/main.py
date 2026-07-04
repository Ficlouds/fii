"""
Fi Guardrails Bridge — output quality enforcement
=====================================================
Checks Fi's generated responses against the rules in the master doc's
Part 11 (Fi Personality System) before they reach the user. If a
response violates a rule (e.g. starts with "Certainly!"), this signals
the caller to discard it and request a regeneration.

This does NOT call the LLM itself — it's a pure validation layer that
sits between "DeepSeek generated a response" and "show it to the user."

Run with:
    .venvs/guardrails-ai/bin/uvicorn main:app --host 0.0.0.0 --port 8007
"""

import re

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Fi Guardrails Bridge", version="1.0.0")

# From master doc Part 11 — Fi system prompt, "Never say" list
FORBIDDEN_PHRASES = [
    "certainly!",
    "of course!",
    "absolutely!",
    "great question!",
    "fascinating!",
    "i'd be happy to help!",
    "i hope this helps!",
    "feel free to ask!",
    "is there anything else i can help with?",
    "is there anything else?",
]

# Words flagged as overused/robotic per master doc
FORBIDDEN_WORDS = ["genuinely", "honestly", "straightforward"]

# Patterns that suggest unsolicited bullet-pointing of emotional content
# (heuristic: 3+ bullets immediately following emotional keywords)
EMOTIONAL_KEYWORDS = [
    "stress", "anxious", "anxiety", "grief", "depress", "sad",
    "lonely", "overwhelm", "hurt", "scared", "worried",
]


class ValidationRequest(BaseModel):
    response_text: str
    user_message: str = ""


class ValidationResponse(BaseModel):
    is_valid: bool
    violations: list[str]
    should_regenerate: bool


@app.get("/health")
def health():
    return {"status": "ok", "service": "fi-guardrails-bridge"}


@app.post("/validate", response_model=ValidationResponse)
async def validate_response(req: ValidationRequest):
    text = req.response_text
    text_lower = text.lower()
    violations = []

    # Check 1: Forbidden opening phrases (check first ~50 chars, where
    # these almost always appear if present at all)
    opening = text_lower[:80]
    for phrase in FORBIDDEN_PHRASES:
        if phrase in opening:
            violations.append(f"forbidden_opening_phrase: '{phrase}'")

    # Check 2: Forbidden words anywhere in the response
    for word in FORBIDDEN_WORDS:
        if re.search(rf"\b{word}\b", text_lower):
            violations.append(f"forbidden_word: '{word}'")

    # Check 3: Bullet-pointing emotional topics (heuristic)
    user_lower = req.user_message.lower()
    user_is_emotional = any(kw in user_lower for kw in EMOTIONAL_KEYWORDS)
    response_has_bullets = text.count("\n- ") >= 3 or text.count("\n* ") >= 3
    if user_is_emotional and response_has_bullets:
        violations.append("bullets_on_emotional_topic")

    # Check 4: Excessive bold (more than one bolded phrase)
    bold_count = text.count("**") // 2
    if bold_count > 1:
        violations.append(f"excessive_bold: {bold_count} bolded phrases (max 1)")

    is_valid = len(violations) == 0

    return ValidationResponse(
        is_valid=is_valid,
        violations=violations,
        # Only force regeneration for the more serious violations —
        # opening phrases and emotional-topic bullets are the clearest
        # signals of a genuinely robotic/wrong response.
        should_regenerate=any(
            v.startswith("forbidden_opening_phrase") or v == "bullets_on_emotional_topic"
            for v in violations
        ),
    )
