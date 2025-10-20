from __future__ import annotations

import pytest

from mypackage.bi_curriculum import (
    SUPPORTED_NODE_TYPES,
    BiTopic,
    group_topics_by_titles,
    index_topics_by_title,
    load_bi_topics,
    topics_by_titles,
)


def test_load_bi_topics_returns_supported_nodes():
    topics = load_bi_topics()
    assert topics, "Expected to load at least one BI topic"
    assert all(isinstance(topic, BiTopic) for topic in topics)
    assert {topic.kind for topic in topics}.issubset(SUPPORTED_NODE_TYPES)


def test_index_topics_by_title_is_case_insensitive():
    topics = load_bi_topics()
    index = index_topics_by_title(topics)
    assert "what is bi?" in index
    assert index["what is bi?"].title == "What is BI?"


def test_topics_by_titles_returns_matching_topics():
    topics = load_bi_topics()
    result = topics_by_titles(["What is BI?", "Skills"], topics=topics)
    assert [topic.title for topic in result] == ["What is BI?", "Skills"]


def test_topics_by_titles_raises_for_missing_topic():
    with pytest.raises(KeyError):
        topics_by_titles(["Nonexistent Topic"])


def test_group_topics_by_titles_batches_results():
    mapping = group_topics_by_titles(
        {
            "Foundations": ["What is BI?", "Skills"],
            "Data": ["What is Data?"],
        }
    )
    assert list(mapping.keys()) == ["Foundations", "Data"]
    assert [topic.title for topic in mapping["Foundations"]] == [
        "What is BI?",
        "Skills",
    ]
    assert mapping["Data"][0].title == "What is Data?"
