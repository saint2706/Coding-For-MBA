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
