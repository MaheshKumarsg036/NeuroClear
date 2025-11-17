"""FastAPI application exposing NeuroClear PDF transformation endpoint."""
from __future__ import annotations

import io
import json
import math
import re
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PyPDF2 import PdfReader

from adk_agents import AgentOrchestrator
from prompts import SupportMode

app = FastAPI(title="NeuroClear Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_orchestrator = AgentOrchestrator()


@app.get("/health", response_class=JSONResponse)
def health() -> dict[str, str]:
    return {"status": "ok"}


def _extract_pdf_text(pdf_bytes: bytes) -> tuple[str, int]:
    if not pdf_bytes:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Uploaded PDF is empty.")

    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
    except Exception as exc:  # pragma: no cover - defensive against malformed PDFs
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unable to parse PDF file.") from exc

    pages = len(reader.pages)
    if pages == 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No pages found in PDF.")

    chunks: list[str] = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        if page_text:
            chunks.append(page_text.strip())

    document_text = "\n\n".join(chunks).strip()
    if not document_text:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unable to extract text from PDF.")

    return document_text, pages


def _attempt_json_parse(raw_output: str) -> dict[str, Any] | None:
    try:
        return json.loads(raw_output)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", raw_output)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                return None
    return None


def _estimate_reading_minutes(word_count: int) -> int:
    return max(1, math.ceil(word_count / 180))


def _normalize_result(raw_output: str, source_text: str) -> dict[str, Any]:
    parsed = _attempt_json_parse(raw_output)
    if not parsed:
        return {
            "rewrite": raw_output.strip() or "Model returned an empty response.",
            "highlights": [],
            "reading_time_minutes": _estimate_reading_minutes(len(source_text.split())),
        }

    parsed.setdefault("rewrite", raw_output.strip())
    parsed.setdefault("highlights", [])
    parsed.setdefault("reading_time_minutes", _estimate_reading_minutes(len(source_text.split())))

    if not isinstance(parsed["highlights"], list):
        parsed["highlights"] = [str(parsed["highlights"])]

    return parsed


@app.post("/api/v1/pdf-transform", response_class=JSONResponse)
async def transform_pdf(
    mode: SupportMode = Form(..., description="Accessibility mode to apply."),
    pdf: UploadFile = File(..., description="PDF document to rewrite."),
) -> dict[str, Any]:
    if pdf.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Only PDF uploads are supported.")

    pdf_bytes = await pdf.read()
    document_text, pages = _extract_pdf_text(pdf_bytes)
    agent_artifact = _orchestrator.run(mode, document_text)
    raw_output = agent_artifact.response
    result = _normalize_result(raw_output, document_text)

    return {
        "status": "ok",
        "mode": mode.value,
        "agent": agent_artifact.mode.value,
        "pages": pages,
        "characters": len(document_text),
        "prompt_tokens": len(agent_artifact.prompt.split()),
        "result": result,
    }
