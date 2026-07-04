"""
Fi Security Bridge — LLM Guard HTTP wrapper
=============================================
Exposes LLM Guard's input/output scanners over a local HTTP API
so the Next.js app (Fi) can call them without needing a Python runtime.

Run with:
    .venvs/llm-guard/bin/uvicorn main:app --host 127.0.0.1 --port 8001

This service is meant to run LOCALLY ONLY (127.0.0.1) — it is not
exposed to the internet. Fi's Next.js backend calls it server-side.
"""

from fastapi import FastAPI
from pydantic import BaseModel
from llm_guard.input_scanners import PromptInjection, Anonymize, Toxicity as InputToxicity
from llm_guard.output_scanners import Toxicity as OutputToxicity, Sensitive
from llm_guard.vault import Vault
from llm_guard import scan_prompt, scan_output

app = FastAPI(title="Fi Security Bridge", version="1.0.0")

# Shared vault for anonymization (lets us de-anonymize later if needed)
vault = Vault()

# AI model/product names that must never be tagged as PERSON entities by
# Presidio's NER model. Presidio/spaCy frequently mis-classifies lowercase
# AI brand names (deepseek, claude, gpt, etc.) as personal names.
#
# The DeBERTa NER model (Isotonic/deberta-v3-base_finetuned_ai4privacy_v2)
# tokenizes multi-syllable names into sub-word spans before classification, so
# Presidio's allow_list must contain every sub-word fragment the model emits —
# not just the full brand name.  The fragments below were verified by running
# the analyzer against each brand name and inspecting result start/end offsets:
#
#   deepseek  -> "deep", "seek"
#   openai    -> "open", "ai"
#   chatgpt   -> "chat", "gp", "t"
#   claude    -> "cla", "ude"
#   gemini    -> "gem", "ini"
#   mistral   -> "mist", "ral"
#   llama     -> "llama"
#   grok      -> "gro", "k"
#   copilot   -> (clean — no false positive observed)
#   gpt       -> (clean — no false positive observed)
#
# Presidio's allow_list does exact case-sensitive matching against the
# extracted span text, so fragments must be lowercase (brand names are
# always written lowercase in the prompts we care about).
_AI_BRAND_NAMES: list[str] = [
    # deepseek
    "deepseek", "deep", "seek",
    # openai
    "openai", "open", "ai",
    # chatgpt
    "chatgpt", "chat", "gp", "t",
    # claude
    "claude", "cla", "ude",
    # gemini
    "gemini", "gem", "ini",
    # mistral
    "mistral", "mist", "ral",
    # llama
    "llama",
    # grok
    "grok", "gro", "k",
    # these are clean but included for completeness
    "copilot", "gpt",
]

# ---- Scanner setup (loaded once at startup, reused for every request) ----
input_scanners = [
    PromptInjection(),
    Anonymize(vault, allowed_names=_AI_BRAND_NAMES),
    InputToxicity(),
]

output_scanners = [
    OutputToxicity(),
    Sensitive(),
]


class ScanInputRequest(BaseModel):
    prompt: str


class ScanInputResponse(BaseModel):
    is_safe: bool
    sanitized_prompt: str
    risk_scores: dict
    triggered_scanners: list[str]


class ScanOutputRequest(BaseModel):
    prompt: str
    output: str


class ScanOutputResponse(BaseModel):
    is_safe: bool
    sanitized_output: str
    risk_scores: dict
    triggered_scanners: list[str]


@app.get("/health")
def health():
    return {"status": "ok", "service": "fi-security-bridge"}


@app.post("/scan/input", response_model=ScanInputResponse)
def scan_input(req: ScanInputRequest):
    """
    Scan a user's message BEFORE it reaches the LLM.
    Catches: prompt injection, PII (auto-masked), toxic language.
    """
    sanitized_prompt, results_valid, results_score = scan_prompt(
        input_scanners, req.prompt
    )

    is_safe = all(results_valid.values())
    triggered = [name for name, valid in results_valid.items() if not valid]

    return ScanInputResponse(
        is_safe=is_safe,
        sanitized_prompt=sanitized_prompt,
        risk_scores=results_score,
        triggered_scanners=triggered,
    )


@app.post("/scan/output", response_model=ScanOutputResponse)
def scan_output_endpoint(req: ScanOutputRequest):
    """
    Scan the LLM's response BEFORE it's shown to the user.
    Catches: toxic output, leaked sensitive data.
    """
    sanitized_output, results_valid, results_score = scan_output(
        output_scanners, req.prompt, req.output
    )

    is_safe = all(results_valid.values())
    triggered = [name for name, valid in results_valid.items() if not valid]

    return ScanOutputResponse(
        is_safe=is_safe,
        sanitized_output=sanitized_output,
        risk_scores=results_score,
        triggered_scanners=triggered,
    )
