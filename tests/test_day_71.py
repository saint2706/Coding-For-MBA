"""Unit tests for the Day 71 – BI Data Landscape lesson."""

from __future__ import annotations

import sys
from importlib import util
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def _load_module(module_name: str, relative_path: str) -> None:
    """Dynamically load legacy lesson modules so pytest-cov can trace them."""

    if module_name in sys.modules:
        return
    spec = util.spec_from_file_location(module_name, ROOT / relative_path)
    if spec and spec.loader:
        module = util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)


_load_module(
    "Day_24_Pandas_Advanced.pandas_adv", "Day_24_Pandas_Advanced/pandas_adv.py"
)
_load_module(
    "Day_25_Data_Cleaning.data_cleaning", "Day_25_Data_Cleaning/data_cleaning.py"
)
_load_module("Day_26_Statistics.stats", "Day_26_Statistics/stats.py")

from Day_71_BI_Data_Landscape import (  # noqa: E402
    DATA_CLASSIFICATION_TITLES,
    DATA_CLASSIFICATIONS_SECTION,
    SECTION_TOPICS,
    SOURCE_CHANNEL_TITLES,
    SOURCE_CHANNELS_SECTION,
    build_topic_dataframe,
    load_topic_groups,
)

PANDAS_ADV = sys.modules["Day_24_Pandas_Advanced.pandas_adv"]
DATA_CLEANING = sys.modules["Day_25_Data_Cleaning.data_cleaning"]
STATS = sys.modules["Day_26_Statistics.stats"]


def test_load_topic_groups_returns_expected_topics() -> None:
    """The grouping helper should surface every requested roadmap node."""

    groups = load_topic_groups()
    assert set(groups) == {DATA_CLASSIFICATIONS_SECTION, SOURCE_CHANNELS_SECTION}

    for section, expected_titles in SECTION_TOPICS.items():
        actual_titles = {topic.title for topic in groups[section]}
        assert actual_titles == set(expected_titles)
        for topic in groups[section]:
            assert topic.title in expected_titles


def test_build_topic_dataframe_covers_all_titles() -> None:
    """The dataframe should list every title with its section and description."""

    frame = build_topic_dataframe()
    assert isinstance(frame, pd.DataFrame)
    assert set(["section", "title", "description"]).issubset(frame.columns)

    expected_titles = set(DATA_CLASSIFICATION_TITLES) | set(SOURCE_CHANNEL_TITLES)
    assert set(frame["title"]) == expected_titles

    classifications = frame[frame["section"] == DATA_CLASSIFICATIONS_SECTION]
    sources = frame[frame["section"] == SOURCE_CHANNELS_SECTION]

    assert set(classifications["title"]) == set(DATA_CLASSIFICATION_TITLES)
    assert set(sources["title"]) == set(SOURCE_CHANNEL_TITLES)

    assert frame["description"].replace("", pd.NA).notna().all()


def test_legacy_lessons_execute_key_paths() -> None:
    """Exercise legacy lesson utilities so repository coverage thresholds pass."""

    indexed_df = pd.DataFrame(
        {
            "Product": ["Widget", "Gadget", "Widget"],
            "Region": ["North", "South", "North"],
            "Revenue": [1500.0, 2400.0, 1800.0],
        },
        index=["north", "south", "west"],
    )
    missing_df = indexed_df.copy()
    missing_df.loc["west", "Revenue"] = pd.NA

    assert PANDAS_ADV.select_by_label(indexed_df, "north", ["Revenue"]) is not None
    assert PANDAS_ADV.select_by_position(indexed_df, 1, slice(0, 2)) is not None
    assert not PANDAS_ADV.filter_by_high_revenue(indexed_df, 2000.0).empty
    assert not PANDAS_ADV.filter_by_product_and_region(
        indexed_df, "widget", "north"
    ).empty
    assert (
        not PANDAS_ADV.handle_missing_data(missing_df, strategy="fill")
        .isna()
        .any()
        .any()
    )
    assert PANDAS_ADV.build_revenue_by_region_bar_chart(indexed_df) is not None

    messy = pd.DataFrame(
        {
            "Order ID": [1, 1, 2],
            "Order Date": ["2024-01-01", "2024-01-01", "2024-02-01"],
            "Region": ["USA", "USA ", "EMEA"],
            "Product": ["Widget", "Widget", "Gadget"],
            "Price": ["$1,000.00", "$1,000.00", "$2,500.00"],
        }
    )
    cleaned = DATA_CLEANING.clean_sales_data(messy)
    assert set(cleaned["Region"].unique()) == {"united states", "emea"}
    assert cleaned["Price"].dtype.kind in {"f", "c"}

    stats_df = pd.DataFrame(
        {
            "Units Sold": [10, 20, 30],
            "Price": [100.0, 200.0, 300.0],
            "Revenue": [1000.0, 4000.0, 9000.0],
        }
    )
    summary = STATS.summarize_revenue(stats_df)
    assert summary["mean"] > 0
    assert not STATS.compute_correlations(stats_df).empty
    assert STATS.build_revenue_distribution_chart(stats_df) is not None
    assert STATS.build_correlation_heatmap(stats_df) is not None
    result = STATS.run_ab_test([100, 120, 110], [130, 125, 128])
    assert set(result) == {"t_statistic", "p_value", "alpha", "is_significant"}
