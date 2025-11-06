---
title: Day 74 – BI Data Preparation and Tools
tags:
  - BI
  - Data
---

Day 74 focuses on the hands-on mechanics of preparing business intelligence data. We reinforce data
quality checkpoints—handling duplicates, missing values, outliers, transformation logic, and
exploratory profiling—before mapping them to the day-to-day tooling that teams rely on.

## Data Quality Playbook

| Task | What to Watch | Best Practices | | --- | --- | --- | | **Duplicates** | Repeated
customer/order rows that inflate metrics. | Define business keys, run `drop_duplicates`/`distinct`,
and document merge logic so downstream analysts understand the canonical record. | | **Missing
Values** | Null revenue, dates, or categories that break aggregations. | Profile null rates,
classify as MCAR/MAR/MNAR, and choose imputation (`fillna`, `replace_na`) or row removal
intentionally. Track imputations in metadata. | | **Outliers** | Unusually high/low values that
distort dashboards. | Apply interquartile range (IQR) or z-score fences, confirm with domain
experts, and consider winsorisation rather than blind removal. | | **Data Transformation
Techniques** | Misaligned datatypes, inconsistent labels, features needing scaling/encoding. | Build
deterministic pipelines that cast datatypes, standardise casing, engineer derived metrics, and log
every assumption. | | **Exploratory Data Analysis (EDA)** | Hidden biases that only surface when
visualised. | Pair summary stats with quick charts (boxplots/histograms) to flag skew, segmentation
issues, and candidate filters before modelling or reporting. |

## Tooling Workflows

### Pandas (Python)

- Chain helpers with `DataFrame.pipe` to sequence deduplication, null handling, and type
  standardisation.
- Store reusable helpers (e.g., `remove_duplicates`, `handle_missing_values`) in a utilities module
  and unit test them.
- Use `.assign()` or dedicated functions to derive KPI columns without mutating state mid-pipeline.

### dplyr (R)

- Combine `distinct()` and `arrange()` to create stable keys ahead of joins.
- Apply `tidyr::replace_na()` and `mutate(across())` for succinct imputations across multiple
  columns.
- Package pipelines as functions so R Markdown reports or Shiny dashboards reuse consistent
  preparation logic.

### Excel

- Promote ranges to Excel Tables, enabling repeatable "Remove Duplicates" and structured references.
- Use Power Query to encapsulate steps such as type conversions, trimming, and merges—refreshable
  for future data drops.
- Maintain a "Data Quality" sheet documenting manual checks (data validation rules, conditional
  formatting) for auditability.

## Multi-Tool Cleaning Pipelines

The accompanying `lesson.py` script demonstrates how the same workflow translates across Python, R,
and Excel:

1. **Python (pandas):** Deduplicate by customer/date keys, fill missing revenue/cost/segment values,
   standardise types, and compute gross margin.
1. **R (dplyr):** Mirror the pipeline with `%>%`, `distinct()`, `replace_na()`, and tidyverse
   helpers (`lubridate`, `stringr`).
1. **Excel:** Outline the equivalent sequence using Tables, Remove Duplicates, Go To Special for
   blanks, Power Query typing, and a gross-margin formula column.

These shared patterns keep BI data reliable regardless of the toolset in play, and the helpers in
`solutions.py` power automated tests to ensure regressions are caught early.

## Additional Topic: Descriptive Analytics

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the
> [Phase 5 overview](https://github.com/saint2706/Coding-For-MBA/blob/main/docs/bi-curriculum.md) to see how the developer-roadmap topics align across
> Days 68–84.

## Why it matters

Summarize business performance with descriptive measures.

## Developer-roadmap alignment

- Types of Data Analysis
- Descriptive Statistics
- Central Tendency
- Dispersion
- Distribution

## Next steps

- Draft case studies and notebooks that exercise these roadmap nodes.
- Update the Phase 5 cheat sheet with the insights you capture here.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 73 – Day 73 – BI SQL and Databases](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_73_BI_SQL_and_Databases/README.md) • **Next:** [Day 75 – Day 75 – BI Visualization and Dashboard Principles](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_75_BI_Visualization_and_Dashboard_Principles/README.md)

_You are on lesson 74 of 108._

<!-- LESSON_FOOTER_END -->

## Interactive Notebooks

Run this lesson's notebooks directly in your browser with the built-in JupyterLite runtime.

[🪐 Launch in JupyterLite](/jupyterlite/lab?path=Day_74_BI_Data_Preparation_and_Tools){ .md-button .md-button--primary }

## Additional Materials

???+ example "lesson.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_74_BI_Data_Preparation_and_Tools/lesson.py)

````
```python title="lesson.py"
"""Interactive lesson script for Day 74: BI Data Preparation and Tools."""

from __future__ import annotations

import pandas as pd

from Day_74_BI_Data_Preparation_and_Tools.solutions import (
    assemble_curriculum_sections,
    build_pipeline,
    build_transformation_helpers,
    handle_missing_values,
    remove_duplicates,
)


def standardise_types(df: pd.DataFrame) -> pd.DataFrame:
    """Cast date columns and normalise casing for categorical columns."""

    result = df.copy()
    if "Order Date" in result.columns:
        result["Order Date"] = pd.to_datetime(result["Order Date"], errors="coerce")
    if "Segment" in result.columns:
        result["Segment"] = result["Segment"].str.title()
    return result


def enrich_metrics(df: pd.DataFrame) -> pd.DataFrame:
    """Create helper metrics that highlight data quality fixes."""

    result = df.copy()
    if {"Revenue", "Cost"}.issubset(result.columns):
        result["Gross Margin"] = result["Revenue"] - result["Cost"]
    return result


def demonstrate_python_pipeline() -> pd.DataFrame:
    """Show a pandas-based cleaning pipeline using the helper utilities."""

    sales = pd.DataFrame(
        {
            "Customer ID": [101, 101, 102, 103, 104, 105],
            "Order Date": [
                "2023-01-01",
                "2023-01-01",
                "2023-02-15",
                "2023-03-21",
                None,
                "2023-04-10",
            ],
            "Revenue": [1000.0, 1000.0, 850.0, 430.0, None, 640.0],
            "Cost": [600.0, 600.0, 500.0, 210.0, 150.0, None],
            "Segment": ["enterprise", "enterprise", "smb", None, "consumer", "smb"],
        }
    )

    pipeline = build_pipeline(
        [
            (remove_duplicates, {"subset": ["Customer ID", "Order Date"]}),
            (
                handle_missing_values,
                {
                    "strategy": "fill",
                    "fill_value": {"Revenue": 0.0, "Cost": 0.0, "Segment": "Unknown"},
                },
            ),
            (standardise_types, {}),
            (enrich_metrics, {}),
        ]
    )

    return pipeline(sales)


def demonstrate_r_pipeline() -> str:
    """Return a tidyverse-style pipeline highlighting equivalent steps."""

    return """
    library(dplyr)
    library(tidyr)

    sales %>%
      distinct(CustomerID, OrderDate, .keep_all = TRUE) %>%
      replace_na(list(Revenue = 0, Cost = 0, Segment = "Unknown")) %>%
      mutate(
        OrderDate = lubridate::ymd(OrderDate),
        Segment = stringr::str_to_title(Segment),
        GrossMargin = Revenue - Cost
      )
    """.strip()


def demonstrate_excel_pipeline() -> str:
    """Return a textual description of the Excel workflow."""

    steps = [
        "Convert the range to an Excel Table so Remove Duplicates is available and refreshable.",
        "Use Data > Remove Duplicates on Customer ID and Order Date to collapse repeated orders.",
        "Apply Go To Special → Blanks, then enter 0 or 'Unknown' and confirm with Ctrl+Enter to impute missing data.",
        "Add a Power Query step to enforce data types (Date for Order Date, Currency for Revenue/Cost).",
        "Insert a helper column Gross Margin with =[@Revenue]-[@Cost] and format as currency.",
    ]
    return "\n".join(f"{idx + 1}. {step}" for idx, step in enumerate(steps))


def main() -> None:
    sections = assemble_curriculum_sections()
    helpers = build_transformation_helpers()
    python_cleaned = demonstrate_python_pipeline()

    print("=== Curriculum Sections ===")
    print(sections.to_string(index=False))

    print("\n=== Transformation Helper Highlights ===")
    for tool, tips in helpers.items():
        print(f"\n{tool} helpers:")
        for tip in tips:
            print(f" - {tip}")

    print("\n=== Python Cleaning Pipeline Output ===")
    print(python_cleaned)

    print("\n=== R Pipeline ===")
    print(demonstrate_r_pipeline())

    print("\n=== Excel Workflow ===")
    print(demonstrate_excel_pipeline())


if __name__ == "__main__":
    main()
```
````

???+ example "solutions.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_74_BI_Data_Preparation_and_Tools/solutions.py)

````
```python title="solutions.py"
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
```
````
