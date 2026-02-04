"""Utility helpers for the Day 37 conclusion recap artifacts.

The functions in this module return plain Python data structures so they can
be easily unit tested or repurposed by downstream tooling. A small CLI is
provided to render the recap in the terminal for quick reference.
"""

from __future__ import annotations

from argparse import ArgumentParser, Namespace
from typing import Iterable, List, Sequence


def get_recap_checklist() -> List[str]:
    """Return the high-level checklist summarising the program highlights."""

    return [
        "Review the Python foundations covered across the 50-day journey.",
        "Revisit data analytics workflows, from cleaning through visualization.",
        "Connect the dots between statistical thinking and business strategy.",
        "Reflect on automation opportunities identified during the lessons.",
    ]


def get_next_steps() -> List[dict]:
    """Return recommended actions after completing the curriculum."""

    return [
        {
            "title": "Build a portfolio project",
            "description": (
                "Apply the analytics-to-insights pipeline on a business dataset "
                "and document the impact for stakeholders."
            ),
        },
        {
            "title": "Deepen machine learning skills",
            "description": (
                "Experiment with supervised and unsupervised models using the "
                "frameworks introduced in later lessons."
            ),
        },
        {
            "title": "Share knowledge with peers",
            "description": (
                "Host a lunch-and-learn or internal workshop to reinforce your "
                "understanding and surface collaboration ideas."
            ),
        },
    ]


def _format_checklist(checklist: Sequence[str]) -> Iterable[str]:
    for item in checklist:
        yield f" - {item}"


def _format_next_steps(next_steps: Sequence[dict]) -> Iterable[str]:
    for index, step in enumerate(next_steps, start=1):
        title = step.get("title", f"Step {index}")
        description = step.get("description", "")
        if description:
            yield f"{index}. {title}: {description}"
        else:
            yield f"{index}. {title}"


def build_parser() -> ArgumentParser:
    parser = ArgumentParser(
        description=(
            "Render the Coding for MBA Day 37 recap including the core "
            "checklist and suggested next steps."
        )
    )
    parser.add_argument(
        "--section",
        choices=("checklist", "next-steps", "all"),
        default="all",
        help="Choose which recap section to display.",
    )
    return parser


def _render(section: str) -> str:
    if section == "checklist":
        lines = ["Day 37 Recap Checklist:", *_format_checklist(get_recap_checklist())]
    elif section == "next-steps":
        lines = [
            "Recommended Next Steps:",
            *_format_next_steps(get_next_steps()),
        ]
    else:
        lines = [
            "Day 37 Recap Checklist:",
            *_format_checklist(get_recap_checklist()),
            "",
            "Recommended Next Steps:",
            *_format_next_steps(get_next_steps()),
        ]
    return "\n".join(lines)


def main(argv: Sequence[str] | None = None) -> None:
    """Entry point for the command line interface."""

    parser = build_parser()
    args: Namespace = parser.parse_args(list(argv) if argv is not None else None)
    print(_render(args.section))


if __name__ == "__main__":
    main()
