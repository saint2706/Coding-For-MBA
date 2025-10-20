"""Tests for the Day 69 BI Strategy and Stakeholders utilities."""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Day_69_BI_Strategy_and_Stakeholders import build_topic_dataframe, load_topics

EXPECTED_OPERATING_MODELS = {
    "Types of BI Operations",
    "Stakeholder Identification",
    "Key Business Functions",
}
EXPECTED_STRATEGY_TIERS = {"Operational BI", "Tactical BI", "Strategic BI"}


def test_load_topics_groups_operating_models_and_strategy_tiers() -> None:
    grouped = load_topics()
    assert set(grouped.keys()) == {"Operating models", "Strategy tiers"}
    assert {
        topic.title for topic in grouped["Operating models"]
    } == EXPECTED_OPERATING_MODELS
    assert {
        topic.title for topic in grouped["Strategy tiers"]
    } == EXPECTED_STRATEGY_TIERS


def test_build_topic_dataframe_includes_all_titles() -> None:
    frame = build_topic_dataframe()
    assert set(frame["title"]) == EXPECTED_OPERATING_MODELS | EXPECTED_STRATEGY_TIERS
    assert set(frame["section"]) == {"Operating models", "Strategy tiers"}
    assert frame["description"].str.len().min() > 0
