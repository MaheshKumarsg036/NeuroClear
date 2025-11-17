"""Agentic orchestration modeled after Google ADK patterns."""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, List, Type

from llm_client import GeminiLLMClient
from prompts import SupportMode, build_prompt


@dataclass(slots=True)
class AgentRunArtifact:
    """Raw data returned by a support agent."""

    mode: SupportMode
    prompt: str
    response: str


class BaseSupportAgent(ABC):
    """Abstract agent definition mirroring Google ADK's agent contract."""

    mode: SupportMode

    def __init__(self, client: GeminiLLMClient) -> None:
        self._client = client

    @abstractmethod
    def build_prompt(self, document_text: str) -> str:  # pragma: no cover - small wrapper
        """Return the prompt this agent should send to Gemini."""

    def run(self, document_text: str) -> AgentRunArtifact:
        prompt = self.build_prompt(document_text)
        response = self._client.generate(prompt)
        return AgentRunArtifact(mode=self.mode, prompt=prompt, response=response)


class GoogleADKAgent(BaseSupportAgent):
    """Google ADK-style agent."""

    def build_prompt(self, document_text: str) -> str:
        return build_prompt(self.mode, document_text)


class ADHDRewriterAgent(GoogleADKAgent):
    mode = SupportMode.ADHD


class AutismRewriterAgent(GoogleADKAgent):
    mode = SupportMode.AUTISM


class DyslexiaRewriterAgent(GoogleADKAgent):
    mode = SupportMode.DYSLEXIA


class AnxietyRewriterAgent(GoogleADKAgent):
    mode = SupportMode.ANXIETY


class ElderlyRewriterAgent(GoogleADKAgent):
    mode = SupportMode.ELDERLY


AGENT_TYPES: List[Type[BaseSupportAgent]] = [
    ADHDRewriterAgent,
    AutismRewriterAgent,
    DyslexiaRewriterAgent,
    AnxietyRewriterAgent,
    ElderlyRewriterAgent,
]


class AgentOrchestrator:
    """Coordinates multiple mode-specific agents similar to a Google ADK mesh."""

    def __init__(self, client: GeminiLLMClient | None = None) -> None:
        self._client = client or GeminiLLMClient()
        self._agents: Dict[SupportMode, BaseSupportAgent] = {
            agent_type.mode: agent_type(self._client) for agent_type in AGENT_TYPES
        }

    def route(self, mode: SupportMode) -> BaseSupportAgent:
        return self._agents[mode]

    def run(self, mode: SupportMode, document_text: str) -> AgentRunArtifact:
        agent = self.route(mode)
        return agent.run(document_text)
