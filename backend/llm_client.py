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


class GeminiLLMClient:
    """High-level helper for streaming completions from Gemini Flash."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-flash-latest") -> None:
        self._api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self._api_key:
            raise ValueError("GEMINI_API_KEY is not set; export it or pass api_key explicitly.")

        self._client = genai.Client(api_key=self._api_key)
        self._model = model

    def stream_generate(self, prompt: str) -> Generator[str, None, None]:
        """Yield response chunks for a given prompt."""
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            )
        ]

        config = types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=-1),
            image_config=types.ImageConfig(image_size="1K"),
        )

        for chunk in self._client.models.generate_content_stream(
            model=self._model,
            contents=contents,
            config=config,
        ):
            text = getattr(chunk, "text", "") or ""
            if text:
                yield text

    def generate(self, prompt: str) -> str:
        """Return the full response for the supplied prompt."""
        return "".join(self.stream_generate(prompt))
