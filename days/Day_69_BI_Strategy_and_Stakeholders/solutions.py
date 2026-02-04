"""Topic helpers for the Day 69 BI Strategy and Stakeholders lesson."""

from __future__ import annotations

from typing import Dict, List, Mapping, Sequence

import pandas as pd
from mypackage.bi_curriculum import BiTopic, group_topics_by_titles

OPERATING_MODEL_SECTION = "Operating models"
STRATEGY_TIER_SECTION = "Strategy tiers"

TOPIC_GROUPS: Mapping[str, Sequence[str]] = {
    OPERATING_MODEL_SECTION: [
        "Types of BI Operations",
        "Stakeholder Identification",
        "Key Business Functions",
    ],
    STRATEGY_TIER_SECTION: [
        "Operational BI",
        "Tactical BI",
        "Strategic BI",
    ],
}

TOPIC_DESCRIPTIONS: Mapping[str, str] = {
    "Types of BI Operations": (
        "Frame how BI teams deliver value across centralized, federated, and hybrid "
        "operating models."
    ),
    "Stakeholder Identification": (
        "Coach analysts to document personas, influence levels, and decision rights "
        "before building artifacts."
    ),
    "Key Business Functions": (
        "Highlight finance, marketing, operations, and executive rhythms that rely "
        "on BI insights."
    ),
    "Operational BI": (
        "Align dashboards and alerts with frontline managers who need real-time "
        "support."
    ),
    "Tactical BI": (
        "Equip business partners with weekly and monthly reviews that translate "
        "performance into initiatives."
    ),
    "Strategic BI": (
        "Focus leadership on long-range bets, portfolio management, and scenario "
        "planning."
    ),
}


def load_topics(
    *, groups: Mapping[str, Sequence[str]] = TOPIC_GROUPS
) -> Dict[str, List[BiTopic]]:
    """Return roadmap topics grouped into BI operating and strategy tiers."""

    return {group: topics for group, topics in group_topics_by_titles(groups).items()}


def build_topic_dataframe(
    *,
    groups: Mapping[str, Sequence[str]] = TOPIC_GROUPS,
    descriptions: Mapping[str, str] = TOPIC_DESCRIPTIONS,
) -> pd.DataFrame:
    """Create a DataFrame summarizing Day 69 BI strategy topics."""

    grouped_topics = load_topics(groups=groups)
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
    return pd.DataFrame(records, columns=["section", "title", "description"])


__all__ = ["build_topic_dataframe", "load_topics"]
