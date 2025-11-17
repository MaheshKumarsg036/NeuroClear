"""Gemini LLM client wrapper.

Provides a thin class for streaming responses from the Gemini Flash model.
"""
from __future__ import annotations

from typing import Generator, Optional
import os
from pathlib import Path

from google import genai
from google.genai import types
from dotenv import load_dotenv


load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env", override=False)


# Define safety settings to block violence and NSFW content.
SAFETY_SETTINGS = [
    types.SafetySetting(
        category="HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold="BLOCK_MEDIUM_AND_ABOVE",
    ),
    types.SafetySetting(
        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold="BLOCK_MEDIUM_AND_ABOVE",
    ),
]


class GeminiLLMClient:
    """High-level helper for streaming completions from Gemini Flash."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-flash-latest") -> None:
        self._api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self._api_key:
            raise ValueError("GEMINI_API_KEY is not set; export it or pass api_key explicitly.")

        self._client = genai.Client(api_key=self._api_key)
        self._model = model
        self._config = types.GenerateContentConfig(safety_settings=SAFETY_SETTINGS)

    def stream_generate(self, prompt: str) -> Generator[str, None, None]:
        """Yield response chunks for a given prompt."""
        stream = self._client.models.generate_content_stream(
            model=self._model,
            contents=prompt,
            config=self._config,
        )
        for chunk in stream:
            text = getattr(chunk, "text", None)
            if text:
                yield text

    def generate(self, prompt: str) -> str:
        """Return the full response for the supplied prompt."""
        response = self._client.models.generate_content(
            model=self._model,
            contents=prompt,
            config=self._config,
        )
        return response.text or ""
