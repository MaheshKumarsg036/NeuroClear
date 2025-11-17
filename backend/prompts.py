"""Prompt templates and helpers for NeuroClear support modes."""
from __future__ import annotations

from enum import Enum
from textwrap import dedent


class SupportMode(str, Enum):
    """Supported accessibility rewrite modes."""

    ADHD = "adhd"
    AUTISM = "autism"
    DYSLEXIA = "dyslexia"
    ANXIETY = "anxiety"
    ELDERLY = "elderly"

    @property
    def label(self) -> str:
        return self.value.capitalize()


MODE_INSTRUCTIONS: dict[SupportMode, str] = {
    SupportMode.ADHD: dedent(
        """
        - Break information into concise steps or bullet points.
        - Surface action items, deadlines, and required tools up front.
        - Keep sentences short and energetic, with clear verbs.
        """
    ).strip(),
    SupportMode.AUTISM: dedent(
        """
        - Use literal, explicit language with zero idioms or figurative phrasing.
        - Explain any implied context directly and remove ambiguity.
        - Maintain predictable structure with labeled sections.
        """
    ).strip(),
    SupportMode.DYSLEXIA: dedent(
        """
        - Prefer simple vocabulary and sentences under 15 words when possible.
        - Use ample whitespace, headings, and numbered lists.
        - Highlight key terms with brief definitions.
        """
    ).strip(),
    SupportMode.ANXIETY: dedent(
        """
        - Maintain a calm, reassuring tone that avoids alarming verbs.
        - Provide predictable ordering: overview, steps, what to do if stuck.
        - Remove catastrophic language; emphasize available support resources.
        """
    ).strip(),
    SupportMode.ELDERLY: dedent(
        """
        - Use familiar vocabulary and define technical terms inline.
        - Favor slightly longer explanations over abbreviations.
        - Provide gentle step-by-step guidance with context for why it matters.
        """
    ).strip(),
}


def build_prompt(mode: SupportMode, document_text: str) -> str:
    """Return the full prompt for Gemini given a mode and raw document text."""
    if not document_text or not document_text.strip():
        raise ValueError("document_text must contain text to rewrite")

    doc = document_text.strip()
    instructions = MODE_INSTRUCTIONS[mode]

    return dedent(
        f"""
        You are NeuroClear, an accessibility rewriting agent that tailors documents for neurodiverse readers.
        Rewrite the provided document for the {mode.label} profile.

        Mode-specific guidance:
        {instructions}

        Output policy:
        - Respond with compact JSON that strictly matches this schema:
          {{
            "rewrite": "string",
            "highlights": ["string", "string"],
            "reading_time_minutes": integer
          }}
        - "rewrite" must be multi-paragraph plain text optimized for the reader profile.
        - Provide 2-4 highlight bullets summarizing the most actionable ideas.
        - Estimate reading_time_minutes assuming 180 words per minute and always round up to the nearest whole minute.
        - If content is unsafe or missing, set "rewrite" to an apology and explain the limitation.

        Document to transform:
        <<<
        {doc}
        >>>
        """
    ).strip()
