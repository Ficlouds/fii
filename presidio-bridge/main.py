"""
Fi Presidio Bridge — PII detection and masking
==================================================
Detects and masks personally identifiable information (names, emails,
phone numbers, locations, etc.) in user messages before they're stored
or sent to the LLM. Replaces LLM Guard's Anonymize scanner.

Why the switch: LLM Guard's creator company (Protect AI) was acquired
by Palo Alto Networks, and there's been no new release in ~13 months —
a real maintenance risk flag found via research. Presidio (Microsoft,
MIT license) is actively maintained (latest release March 2026) and is
the confirmed best-in-class open-source PII tool. It also doesn't share
LLM Guard's bug where "deepseek" gets word-split into fragments ("deep"
+ "seek") and falsely flagged as a person's name.

Run with:
    .venvs/presidio/bin/uvicorn main:app --host 127.0.0.1 --port 8004

LOCAL ONLY (127.0.0.1) — not exposed to the internet.
"""

from fastapi import FastAPI
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from pydantic import BaseModel

app = FastAPI(title="Fi Presidio Bridge", version="1.0.0")

print("[Fi Presidio] Loading analyzer engine...")
analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()
print("[Fi Presidio] Ready.")


class ScanRequest(BaseModel):
    text: str


class ScanResponse(BaseModel):
    has_pii: bool
    sanitized_text: str
    entities_found: list[str]


@app.get("/health")
def health():
    return {"status": "ok", "service": "fi-presidio-bridge"}


@app.post("/scan", response_model=ScanResponse)
def scan_text(req: ScanRequest):
    """
    Detects and masks PII in the given text. Returns the sanitized
    version (safe to store/forward) and which entity types were found.
    """
    results = analyzer.analyze(text=req.text, language="en")
    anonymized = anonymizer.anonymize(text=req.text, analyzer_results=results)

    return ScanResponse(
        has_pii=len(results) > 0,
        sanitized_text=anonymized.text,
        entities_found=[r.entity_type for r in results],
    )
