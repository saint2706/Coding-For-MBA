"""Utilities for the Day 70 BI Metrics and Data Literacy lesson."""

from __future__ import annotations

from typing import Dict, Iterable, Mapping

import pandas as pd
from mypackage.bi_curriculum import BiTopic, topics_by_titles

SECTION_TITLES: Mapping[str, list[str]] = {
    "Metric design": [
        "Metrics and KPIs",
        "Types of Data Analysis",
        "Descriptive Analysis",
        "Predictive Analysis",
    ],
    "Data typing": [
        "Variables and Data Types",
        "Categorical vs Numerical",
    ],
    "Descriptive statistics": [
        "Mode",
        "Mean",
        "Median",
    ],
    "Inferential readiness": [
        "Correlation vs Causation",
        "Confidence Intervals",
        "Inferential Statistics",
    ],
}

TOPIC_DESCRIPTIONS: Mapping[str, str] = {
    "Metrics and KPIs": (
        "Frame how KPIs connect to business objectives and translate strategy into "
        "trackable metrics."
    ),
    "Types of Data Analysis": (
        "Introduce the major analysis families so analysts can choose the right lens "
        "for each question."
    ),
    "Descriptive Analysis": (
        "Explain summarizing past performance to contextualize KPI baselines and "
        "historical trends."
    ),
    "Predictive Analysis": (
        "Highlight forecasting techniques that extend KPI planning beyond current "
        "snapshots."
    ),
    "Variables and Data Types": (
        "Clarify how variable structures influence metric aggregation and modeling "
        "decisions."
    ),
    "Categorical vs Numerical": (
        "Reinforce data typing nuances that determine valid calculations and visual "
        "encodings."
    ),
    "Mode": (
        "Define the most frequent categorical outcome to capture common customer or "
        "operational states."
    ),
    "Mean": (
        "Explain the arithmetic average as a baseline indicator for continuous KPIs."
    ),
    "Median": (
        "Show how the midpoint guards against skew when profiling revenue or cycle "
        "time metrics."
    ),
    "Correlation vs Causation": (
        "Stress the analytical discipline needed to interpret related metrics without "
        "overstating causal claims."
    ),
    "Confidence Intervals": (
        "Equip analysts with interval estimates to communicate metric uncertainty and "
        "sampling error."
    ),
    "Inferential Statistics": (
        "Connect hypothesis testing foundations to BI experimentation and advanced "
        "forecasting."
    ),
}


def load_topics(
    *, sections: Mapping[str, Iterable[str]] = SECTION_TITLES
) -> Dict[str, list[BiTopic]]:
    """Return roadmap topics grouped by the requested sections."""

    grouped_topics: Dict[str, list[BiTopic]] = {}
    for section, titles in sections.items():
        grouped_topics[section] = topics_by_titles(list(titles))
    return grouped_topics


def build_topic_dataframe(
    *,
    sections: Mapping[str, Iterable[str]] = SECTION_TITLES,
    descriptions: Mapping[str, str] = TOPIC_DESCRIPTIONS,
) -> pd.DataFrame:
    """Return a DataFrame describing the BI metrics and data literacy taxonomy."""

    records: list[dict[str, str]] = []
    for section, topics in load_topics(sections=sections).items():
        for topic in topics:
            records.append(
                {
                    "section": section,
                    "title": topic.title,
                    "description": descriptions.get(topic.title, ""),
                }
            )
    frame = pd.DataFrame(records, columns=["section", "title", "description"])
    if frame.empty:
        return frame
    deduped = frame.drop_duplicates(subset=["title"], keep="first").reset_index(
        drop=True
    )
    return deduped


__all__ = ["build_topic_dataframe", "load_topics"]
