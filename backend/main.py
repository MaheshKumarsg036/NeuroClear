"""Minimal CLI entry point for exercising the GeminiLLMClient."""
from __future__ import annotations

import argparse
import sys

from llm_client import GeminiLLMClient


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Stream a Gemini LLM response for a prompt.")
    parser.add_argument(
        "prompt",
        nargs="?",
        default="Hello Gemini!",
        help="Prompt to send to the Gemini model.",
    )
    parser.add_argument(
        "--model",
        default="gemini-flash-latest",
        help="Gemini model name to target (default: gemini-flash-latest).",
    )
    parser.add_argument(
        "--no-stream",
        action="store_true",
        help="Set to print the full response after completion instead of streaming chunks.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    client = GeminiLLMClient(model=args.model)

    if args.no_stream:
        print(client.generate(args.prompt))
        return 0

    for chunk in client.stream_generate(args.prompt):
        print(chunk, end="")
    print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
