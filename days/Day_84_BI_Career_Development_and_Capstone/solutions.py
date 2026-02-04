"""Utilities for Day 84 – BI Career Development and Capstone."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Mapping, MutableMapping

from mypackage.bi_curriculum import BiTopic, group_topics_by_titles

CAREER_ASSET_TITLES: list[str] = [
    "Building Your Portfolio",
    "Portfolio presentation",
    "Open-Source Projects",
    "BI Competitions",
    "BI Communities",
    "Conferences & Webinars",
    "Networking",
    "Professional Development",
    "Certifications",
]

JOB_READINESS_TITLES: list[str] = [
    "Resume optimization",
    "Interview preparation",
    "Salary negotiation strategies",
    "Job Preparation",
]

ROADMAP_GROUPS: Mapping[str, list[str]] = {
    "Career assets": CAREER_ASSET_TITLES,
    "Job readiness": JOB_READINESS_TITLES,
}


@dataclass(slots=True)
class ChecklistItem:
    """A simple representation of a learner checklist item."""

    title: str
    status: str = "Not started"
    notes: str = ""

    def to_dict(self) -> dict[str, str]:
        """Return a serializable representation of the checklist item."""

        return {"title": self.title, "status": self.status, "notes": self.notes}


def load_career_topics(
    *, groups: Mapping[str, Iterable[str]] = ROADMAP_GROUPS
) -> dict[str, list[BiTopic]]:
    """Return the roadmap topics grouped for the capstone."""

    return group_topics_by_titles(groups)


def _build_checklist(topics: Iterable[BiTopic]) -> list[ChecklistItem]:
    """Create checklist items from BI topics."""

    return [ChecklistItem(title=topic.title) for topic in topics]


def generate_checklists(
    *, groups: Mapping[str, Iterable[str]] = ROADMAP_GROUPS
) -> dict[str, list[ChecklistItem]]:
    """Return checklist templates for career assets and job readiness."""

    grouped_topics = load_career_topics(groups=groups)
    return {group: _build_checklist(topics) for group, topics in grouped_topics.items()}


def _checklists_to_serializable(
    checklists: Mapping[str, Iterable[ChecklistItem]],
) -> dict[str, list[dict[str, str]]]:
    """Convert checklist dataclasses into JSON serializable dictionaries."""

    payload: MutableMapping[str, list[dict[str, str]]] = {}
    for group, items in checklists.items():
        payload[group] = [item.to_dict() for item in items]
    return dict(payload)


def serialize_checklists(
    checklists: Mapping[str, Iterable[ChecklistItem]] | None = None,
    *,
    groups: Mapping[str, Iterable[str]] = ROADMAP_GROUPS,
    path: str | Path | None = None,
    indent: int = 2,
) -> str:
    """Return JSON for the grouped checklists and optionally persist it."""

    resolved = (
        checklists if checklists is not None else generate_checklists(groups=groups)
    )
    serializable = _checklists_to_serializable(resolved)
    json_text = json.dumps(serializable, indent=indent)
    if path is not None:
        destination = Path(path)
        destination.write_text(json_text, encoding="utf-8")
    return json_text


__all__ = [
    "CAREER_ASSET_TITLES",
    "JOB_READINESS_TITLES",
    "ChecklistItem",
    "generate_checklists",
    "load_career_topics",
    "serialize_checklists",
]
