"""
Fi Docling Bridge — document text extraction
=================================================
Extracts clean, structured text from PDF, Word, Excel, and PowerPoint
files. Part of Fi's document processing pipeline (master doc Part 9):

    PDF/Word/Excel text → Docling (IBM, 95%+ accuracy)
    Scanned document → Tesseract OCR → then Docling
    Images inside doc → Gemini 3.1 Flash → text description

This bridge handles the text-extraction step. Image-within-document
description (via Gemini) is a separate step, wired in afterward.

Run with:
    .venvs/docling/bin/uvicorn main:app --host 0.0.0.0 --port 8006
"""

import tempfile
from pathlib import Path

from docling.document_converter import DocumentConverter
from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel

app = FastAPI(title="Fi Docling Bridge", version="1.0.0")

print("[Fi Docling] Initializing converter...")
converter = DocumentConverter()
print("[Fi Docling] Ready.")

SUPPORTED_EXTENSIONS = {
    ".pdf", ".docx", ".doc", ".xlsx", ".xls", ".pptx", ".ppt", ".html", ".md",
}


class ExtractResponse(BaseModel):
    success: bool
    text: str | None = None
    error: str | None = None
    page_count: int | None = None


@app.get("/health")
def health():
    return {"status": "ok", "service": "fi-docling-bridge"}


@app.post("/extract", response_model=ExtractResponse)
async def extract_document(file: UploadFile = File(...)):
    """
    Extracts text content from an uploaded document (PDF, Word, Excel,
    PowerPoint). Returns clean markdown-formatted text.
    """
    extension = Path(file.filename or "").suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        return ExtractResponse(
            success=False,
            error=f"Unsupported file type: {extension}. Supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))}",
        )

    try:
        with tempfile.NamedTemporaryFile(suffix=extension, delete=False) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        result = converter.convert(tmp_path)
        text = result.document.export_to_markdown()
        page_count = len(result.document.pages) if hasattr(result.document, "pages") else None

        Path(tmp_path).unlink(missing_ok=True)

        return ExtractResponse(success=True, text=text, page_count=page_count)

    except Exception as e:
        return ExtractResponse(success=False, error=str(e))
