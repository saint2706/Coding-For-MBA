"""Tests for the Day 80 BI Data Quality and Governance lesson utilities."""

import os
import sys

import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Day_80_BI_Data_Quality_and_Governance import (
    build_data_quality_scorecard,
    build_governance_scorecard,
    load_topic_groups,
)

EXPECTED_GROUPS: dict[str, set[str]] = {
    "Data quality dimensions": {
        "Accuracy",
        "Coherence",
        "Interpretability",
        "Timeliness",
        "Relevance",
        "Accessibility",
    },
    "Governance & ethics": {
        "Data Quality",
        "Data Lineage",
        "Privacy",
        "Ethical Data Use",
        "Bias Recognition",
        "Mitigation Strategies",
        "GDPR",
        "CCPA",
    },
}


def test_load_topic_groups_matches_expected_titles() -> None:
    grouped = load_topic_groups()
    assert set(grouped) == set(EXPECTED_GROUPS)
    for group, expected_titles in EXPECTED_GROUPS.items():
        titles = {topic.title for topic in grouped[group]}
        assert titles == expected_titles


def test_data_quality_scorecard_includes_all_dimensions() -> None:
    scorecard = build_data_quality_scorecard()
    assert isinstance(scorecard, pd.DataFrame)
    assert set(scorecard["dimension"]) == EXPECTED_GROUPS["Data quality dimensions"]
    assert scorecard["dimension"].duplicated().sum() == 0
    for column in ("metric", "threshold", "checklist"):
        assert column in scorecard.columns
        assert (
            scorecard[column]
            .apply(lambda value: isinstance(value, str) and value.strip() != "")
            .all()
        )


def test_governance_scorecard_covers_roadmap_topics() -> None:
    scorecard = build_governance_scorecard()
    assert isinstance(scorecard, pd.DataFrame)
    assert set(scorecard["domain"]) == EXPECTED_GROUPS["Governance & ethics"]
    assert scorecard["domain"].duplicated().sum() == 0
    for column in ("control_focus", "evidence", "checklist"):
        assert column in scorecard.columns
        assert (
            scorecard[column]
            .apply(lambda value: isinstance(value, str) and value.strip() != "")
            .all()
        )
