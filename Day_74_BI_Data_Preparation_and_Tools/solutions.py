"""Utility functions for Day 74: BI Data Preparation and Tools."""

from __future__ import annotations

from typing import Callable, Dict, Iterable, List, Sequence, Tuple

import pandas as pd

DATA_QUALITY_TOPICS: Sequence[str] = (
    "Duplicates",
    "Missing Values",
    "Outliers",
    "Data Transformation Techniques",
    "Exploratory Data Analysis (EDA)",
)

TOOLING_TOPICS: Sequence[str] = ("Pandas", "dplyr", "Excel")


def assemble_curriculum_sections() -> pd.DataFrame:
    """Return a dataframe describing the curriculum sections for the day.

    The dataframe is used by the lesson to render tables and provides a single
    source of truth for the topics that must be covered in the README and
    instructional content.
    """

    entries: List[Dict[str, str]] = []

    data_quality_templates: Dict[str, Dict[str, str]] = {
        "Duplicates": {
            "objective": "Identify and consolidate repeated records to maintain one-row-per-entity integrity.",
            "workflow_highlights": "Pandas drop_duplicates, dplyr::distinct, Excel Remove Duplicates feature.",
        },
        "Missing Values": {
            "objective": "Diagnose null patterns and decide whether to impute, backfill, or remove records.",
            "workflow_highlights": "pandas.DataFrame.fillna, tidyr::replace_na, Excel Go To Special for blanks.",
        },
        "Outliers": {
            "objective": "Detect anomalous values using statistical thresholds or domain expectations.",
            "workflow_highlights": "IQR fences, z-score filtering, Excel conditional formatting alerts.",
        },
        "Data Transformation Techniques": {
            "objective": "Standardise formats through type casting, scaling, encoding, and feature extraction.",
            "workflow_highlights": "pandas.assign pipelines, dplyr::mutate chains, Excel Power Query transformations.",
        },
        "Exploratory Data Analysis (EDA)": {
            "objective": "Profile datasets with summary statistics and visuals to surface preparation needs.",
            "workflow_highlights": "pandas profiling, dplyr summaries with ggplot, Excel PivotTables and charts.",
        },
    }

    tooling_templates: Dict[str, Dict[str, str]] = {
        "Pandas": {
            "objective": "Pythonic data wrangling with method-chaining pipelines and reusable helper functions.",
            "workflow_highlights": "pipe-friendly helpers for deduplication, null handling, type conversions.",
        },
        "dplyr": {
            "objective": "R grammar of data manipulation for tidyverse-centric analytics teams.",
            "workflow_highlights": "distinct, drop_na, mutate, and summarise verbs orchestrated via the magrittr pipe.",
        },
        "Excel": {
            "objective": "Spreadsheet-based transformations and quality checks for business stakeholders.",
            "workflow_highlights": "Structured Tables, Remove Duplicates, Power Query steps, Data Validation rules.",
        },
    }

    for title in DATA_QUALITY_TOPICS:
        config = data_quality_templates[title]
        entries.append(
            {
                "category": "Data Quality",
                "title": title,
                "objective": config["objective"],
                "workflow_highlights": config["workflow_highlights"],
            }
        )

    for title in TOOLING_TOPICS:
        config = tooling_templates[title]
        entries.append(
            {
                "category": "Tooling",
                "title": title,
                "objective": config["objective"],
                "workflow_highlights": config["workflow_highlights"],
            }
        )

    return pd.DataFrame(
        entries, columns=["category", "title", "objective", "workflow_highlights"]
    )


def build_transformation_helpers() -> Dict[str, List[str]]:
    """Return per-tool helper guidance for chaining transformations."""

    return {
        "Pandas": [
            "Use df.pipe with helper functions (remove_duplicates, handle_missing_values) for readable flows.",
            "Prefer astype and pd.to_datetime for explicit type management.",
            "Leverage assign to create derived columns without breaking the chain.",
        ],
        "dplyr": [
            "Combine distinct() and arrange() to create stable keys before joins.",
            "Use tidyr::replace_na or mutate(across()) for succinct imputations.",
            "Wrap pipelines in functions to promote reuse across notebooks and scripts.",
        ],
        "Excel": [
            "Convert ranges to Tables so filters, slicers, and structured references persist.",
            "Use Power Query for repeatable steps such as deduplication and column splits.",
            "Document manual steps with cell comments or an instruction worksheet.",
        ],
    }


def remove_duplicates(
    df: pd.DataFrame, subset: Iterable[str] | None = None
) -> pd.DataFrame:
    """Return a dataframe with duplicate rows removed.

    Parameters
    ----------
    df: pd.DataFrame
        The dataframe to deduplicate.
    subset: Iterable[str] | None
        Optional subset of columns to consider when dropping duplicates.
    """

    cleaned = df.drop_duplicates(subset=subset, keep="first").reset_index(drop=True)
    return cleaned


def handle_missing_values(
    df: pd.DataFrame,
    strategy: str = "drop",
    fill_value: Dict[str, object] | object | None = None,
) -> pd.DataFrame:
    """Handle missing values using the chosen strategy.

    Parameters
    ----------
    df: pd.DataFrame
        Source dataframe.
    strategy: str
        Either "drop" to drop rows with nulls, or "fill" to replace them.
    fill_value: dict | scalar, optional
        Replacement value(s) used when strategy="fill".
    """

    if strategy not in {"drop", "fill"}:
        raise ValueError("strategy must be either 'drop' or 'fill'")

    if strategy == "drop":
        return df.dropna().reset_index(drop=True)

    if isinstance(fill_value, dict):
        return df.fillna(value=fill_value).reset_index(drop=True)
    return df.fillna(value=fill_value).reset_index(drop=True)


def build_pipeline(
    transformations: Sequence[Tuple[Callable[[pd.DataFrame], pd.DataFrame], Dict]],
) -> Callable[[pd.DataFrame], pd.DataFrame]:
    """Compose a pipeline of dataframe transformations.

    Each transformation is a tuple of (callable, kwargs) that will be executed in
    sequence via ``DataFrame.pipe`` semantics.
    """

    def _pipeline(df: pd.DataFrame) -> pd.DataFrame:
        result = df.copy()
        for func, kwargs in transformations:
            result = func(result, **kwargs)
        return result

    return _pipeline


def get_expected_titles() -> List[str]:
    """Return the canonical list of topic titles for testing purposes."""

    return list(DATA_QUALITY_TOPICS) + list(TOOLING_TOPICS)


__all__ = [
    "assemble_curriculum_sections",
    "build_transformation_helpers",
    "remove_duplicates",
    "handle_missing_values",
    "build_pipeline",
    "get_expected_titles",
    "DATA_QUALITY_TOPICS",
    "TOOLING_TOPICS",
]
