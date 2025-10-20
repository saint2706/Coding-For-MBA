"""Utilities for the Day 71 – BI Data Landscape lesson."""

from __future__ import annotations

from typing import Mapping, Sequence

import pandas as pd

from mypackage.bi_curriculum import BiTopic, group_topics_by_titles

DATA_CLASSIFICATIONS_SECTION = "Data classifications"
DATA_CLASSIFICATION_TITLES: Sequence[str] = [
    "Types of data",
    "Structured",
    "Unstructured",
    "Semistructured",
    "What is Data?",
]

SOURCE_CHANNELS_SECTION = "Source channels"
SOURCE_CHANNEL_TITLES: Sequence[str] = [
    "Data Sources",
    "Databases",
    "Web",
    "Mobile Apps",
    "Cloud",
    "APIs",
    "IoT",
]

SECTION_TOPICS: Mapping[str, Sequence[str]] = {
    DATA_CLASSIFICATIONS_SECTION: DATA_CLASSIFICATION_TITLES,
    SOURCE_CHANNELS_SECTION: SOURCE_CHANNEL_TITLES,
}

TOPIC_DESCRIPTIONS: Mapping[str, str] = {
    "Types of data": "Overview of how business intelligence teams categorize data assets.",
    "Structured": "Relational and tabular datasets with rigid schema definitions.",
    "Unstructured": "Free-form text, media, and documents requiring qualitative processing.",
    "Semistructured": "Flexible data with markers such as JSON or XML, blending structure and text.",
    "What is Data?": "Framing data as recorded facts and events captured by business systems.",
    "Data Sources": "Inventory of upstream systems that collect or generate business data.",
    "Databases": "Transactional or analytical repositories providing structured records.",
    "Web": "Public and partner-facing digital channels supplying external context.",
    "Mobile Apps": "Customer or field applications emitting behavioral and operational signals.",
    "Cloud": "Hosted platforms and storage services centralizing enterprise data.",
    "APIs": "Programmatic interfaces for exchanging data between systems in real time.",
    "IoT": "Sensor and device networks streaming telemetry from the physical world.",
}


def load_topic_groups(
    sections: Mapping[str, Sequence[str]] = SECTION_TOPICS,
) -> dict[str, list[BiTopic]]:
    """Return BI roadmap topics grouped by the requested section titles."""

    return group_topics_by_titles(sections)


def build_topic_dataframe(
    *,
    sections: Mapping[str, Sequence[str]] = SECTION_TOPICS,
    descriptions: Mapping[str, str] = TOPIC_DESCRIPTIONS,
) -> pd.DataFrame:
    """Return a dataframe summarizing Day 71 roadmap topics and descriptions."""

    grouped_topics = load_topic_groups(sections)
    records: list[dict[str, str]] = []
    for section, topics in grouped_topics.items():
        for topic in topics:
            records.append(
                {
                    "section": section,
                    "title": topic.title,
                    "description": descriptions.get(topic.title, ""),
                }
            )
    frame = pd.DataFrame(records, columns=["section", "title", "description"])
    if not frame.empty:
        frame = frame.sort_values(by=["section", "title"], kind="stable").reset_index(
            drop=True
        )
    return frame


__all__ = [
    "DATA_CLASSIFICATIONS_SECTION",
    "DATA_CLASSIFICATION_TITLES",
    "SECTION_TOPICS",
    "SOURCE_CHANNELS_SECTION",
    "SOURCE_CHANNEL_TITLES",
    "TOPIC_DESCRIPTIONS",
    "build_topic_dataframe",
    "load_topic_groups",
]
