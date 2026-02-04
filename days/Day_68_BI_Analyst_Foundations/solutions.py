"""Utilities for the Day 68 BI Analyst Foundations lesson."""

from __future__ import annotations

from typing import Dict, List, Mapping

import pandas as pd
from mypackage.bi_curriculum import BiTopic, topics_by_titles

FOUNDATION_SECTION = "Foundations"
FOUNDATION_TITLES: List[str] = [
    "Introduction",
    "What is BI?",
    "Why BI Matters?",
    "Responsibilities",
    "Skills",
    "BI Analyst vs Other Roles",
]

TOPIC_DESCRIPTIONS: Mapping[str, str] = {
    "Introduction": (
        "Orient the cohort to the BI Analyst roadmap and how Day 68 frames the "
        "rest of Phase 5."
    ),
    "What is BI?": (
        "Define business intelligence as the practice of transforming raw data into "
        "insights for operational and strategic decisions."
    ),
    "Why BI Matters?": (
        "Summarize the business value of BI for growth, efficiency, and governance "
        "initiatives."
    ),
    "Responsibilities": (
        "Outline the day-to-day analyst duties across discovery, modeling, "
        "reporting, and stakeholder alignment."
    ),
    "Skills": (
        "Call out the technical, analytical, and communication skills required to "
        "deliver BI outcomes."
    ),
    "BI Analyst vs Other Roles": (
        "Contrast the analyst role with data scientists, engineers, and product "
        "managers to clarify collaboration touchpoints."
    ),
}


def load_topics(*, section: str = FOUNDATION_SECTION) -> Dict[str, List[BiTopic]]:
    """Return BI roadmap topics grouped under the requested section name."""

    topics = topics_by_titles(FOUNDATION_TITLES)
    return {section: topics}


def build_topic_dataframe(
    *,
    section: str = FOUNDATION_SECTION,
    descriptions: Mapping[str, str] = TOPIC_DESCRIPTIONS,
) -> pd.DataFrame:
    """Return a pandas DataFrame describing the BI foundations topics."""

    grouped_topics = load_topics(section=section)
    records: list[dict[str, str]] = []
    for group, topics in grouped_topics.items():
        for topic in topics:
            records.append(
                {
                    "section": group,
                    "title": topic.title,
                    "description": descriptions.get(topic.title, ""),
                }
            )
    return pd.DataFrame(records, columns=["section", "title", "description"])


__all__ = ["build_topic_dataframe", "load_topics"]
