"""Utilities for working with the Phase 5 Business Intelligence roadmap."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Mapping, Sequence

DEFAULT_DATA_PATH = (
    Path(__file__).resolve().parent.parent / "data" / "bi_analyst_roadmap.json"
)
SUPPORTED_NODE_TYPES = {"title", "section", "topic", "subtopic"}


@dataclass(frozen=True, slots=True)
class BiTopic:
    """Normalized representation of a Business Intelligence roadmap node."""

    id: str
    title: str
    kind: str
    links: tuple[tuple[str, str], ...] = ()
    color: str | None = None

    @property
    def normalized_title(self) -> str:
        """Return a casefolded title for lookup operations."""

        return self.title.casefold()


def load_bi_topics(path: str | Path | None = None) -> list[BiTopic]:
    """Load BI topics from the developer-roadmap dataset."""

    candidate = Path(path) if path else DEFAULT_DATA_PATH
    payload = json.loads(candidate.read_text(encoding="utf-8"))
    topics: list[BiTopic] = []
    for node in payload.get("nodes", []):
        kind = node.get("type")
        if kind not in SUPPORTED_NODE_TYPES:
            continue
        data = node.get("data") or {}
        label = data.get("label")
        if not isinstance(label, str):
            continue
        links: list[tuple[str, str]] = []
        for link in data.get("links", []) or []:
            label_text = link.get("label")
            url_text = link.get("url")
            if isinstance(label_text, str) and isinstance(url_text, str):
                links.append((label_text, url_text))
        topics.append(
            BiTopic(
                id=str(node.get("id", "")),
                title=" ".join(label.split()),
                kind=str(kind),
                links=tuple(links),
                color=data.get("color") or data.get("backgroundColor"),
            )
        )
    return topics


def index_topics_by_title(topics: Iterable[BiTopic]) -> dict[str, BiTopic]:
    """Return a case-insensitive index of topics keyed by their titles."""

    index: dict[str, BiTopic] = {}
    for topic in topics:
        key = topic.normalized_title
        index.setdefault(key, topic)
    return index


def topics_by_titles(
    titles: Sequence[str],
    *,
    topics: Iterable[BiTopic] | None = None,
    path: str | Path | None = None,
) -> list[BiTopic]:
    """Return the topics matching the provided titles."""

    topic_iterable = list(topics) if topics is not None else load_bi_topics(path)
    index = index_topics_by_title(topic_iterable)
    resolved: list[BiTopic] = []
    missing: list[str] = []
    for title in titles:
        candidate = index.get(title.casefold())
        if candidate is None:
            missing.append(title)
        else:
            resolved.append(candidate)
    if missing:
        unique_missing = ", ".join(dict.fromkeys(missing))
        raise KeyError(f"Topics not found: {unique_missing}")
    return resolved


def group_topics_by_titles(
    groups: Mapping[str, Sequence[str]],
    *,
    topics: Iterable[BiTopic] | None = None,
    path: str | Path | None = None,
) -> dict[str, list[BiTopic]]:
    """Map group names to lists of topics using title lookups."""

    topic_iterable = list(topics) if topics is not None else load_bi_topics(path)
    index = index_topics_by_title(topic_iterable)
    grouped: dict[str, list[BiTopic]] = {}
    missing: list[str] = []
    for group, titles in groups.items():
        grouped[group] = []
        for title in titles:
            candidate = index.get(title.casefold())
            if candidate is None:
                missing.append(title)
            else:
                grouped[group].append(candidate)
    if missing:
        unique_missing = ", ".join(dict.fromkeys(missing))
        raise KeyError(f"Topics not found: {unique_missing}")
    return grouped


__all__ = [
    "BiTopic",
    "DEFAULT_DATA_PATH",
    "SUPPORTED_NODE_TYPES",
    "group_topics_by_titles",
    "index_topics_by_title",
    "load_bi_topics",
    "topics_by_titles",
]
