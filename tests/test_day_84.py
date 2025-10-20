"""Tests for the Day 84 BI Career Development and Capstone utilities."""

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Day_84_BI_Career_Development_and_Capstone import (
    CAREER_ASSET_TITLES,
    JOB_READINESS_TITLES,
    ChecklistItem,
    generate_checklists,
    load_career_topics,
    serialize_checklists,
)

EXPECTED_GROUPS = {"Career assets", "Job readiness"}


def test_load_career_topics_matches_roadmap_titles() -> None:
    grouped = load_career_topics()
    assert set(grouped) == EXPECTED_GROUPS
    assert {topic.title for topic in grouped["Career assets"]} == set(
        CAREER_ASSET_TITLES
    )
    assert {topic.title for topic in grouped["Job readiness"]} == set(
        JOB_READINESS_TITLES
    )


def test_generate_checklists_contains_all_titles() -> None:
    checklists = generate_checklists()
    assert set(checklists) == EXPECTED_GROUPS
    career_items = checklists["Career assets"]
    readiness_items = checklists["Job readiness"]

    assert all(isinstance(item, ChecklistItem) for item in career_items)
    assert all(isinstance(item, ChecklistItem) for item in readiness_items)

    assert {item.title for item in career_items} == set(CAREER_ASSET_TITLES)
    assert {item.title for item in readiness_items} == set(JOB_READINESS_TITLES)


def test_serialize_checklists_round_trip(tmp_path: Path) -> None:
    checklists = generate_checklists()
    destination = tmp_path / "career_checklists.json"
    json_text = serialize_checklists(checklists, path=destination)

    payload = json.loads(json_text)
    assert set(payload) == EXPECTED_GROUPS

    assert [entry["title"] for entry in payload["Career assets"]] == CAREER_ASSET_TITLES
    assert [
        entry["title"] for entry in payload["Job readiness"]
    ] == JOB_READINESS_TITLES

    saved = json.loads(destination.read_text(encoding="utf-8"))
    assert saved == payload

    for group_entries in payload.values():
        for entry in group_entries:
            assert set(entry) == {"title", "status", "notes"}
            assert entry["status"] == "Not started"
            assert entry["notes"] == ""
