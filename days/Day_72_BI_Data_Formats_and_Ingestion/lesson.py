"""Lesson utilities for Day 72 – BI Data Formats and Ingestion.

The module explains a lightweight workflow for landing heterogeneous data
sources into a consistent analytics model:

1. Detect the payload format so the appropriate parser is used.
2. Load the structure with format-specific tooling (pandas for tabular,
   standard libraries for semi-structured data).
3. Normalise the resulting columns and datatypes into a curated schema that
   downstream BI tools can consume.
"""

from __future__ import annotations

from typing import Callable, Dict, List

import pandas as pd

from .solutions import (
    detect_format,
    load_data_formats,
    parse_csv_sample,
    parse_excel_sample,
    parse_json_sample,
    parse_xml_sample,
    summarize_other_formats,
)

WORKFLOW_STEPS: Dict[str, List[str]] = {
    "CSV": [
        "Profile delimiters and quoting characters",
        "Infer schema with pandas.read_csv",
        "Standardise column names and numeric types",
    ],
    "JSON": [
        "Identify nested vs. flat structures",
        "Use pandas.json_normalize to flatten records",
        "Cast columns based on business rules",
    ],
    "XML": [
        "Map XPath selectors to the entity you need",
        "Convert attributes/elements into columns",
        "Explode repeating groups into separate tables",
    ],
    "Excel": [
        "Track sheet ownership and table ranges",
        "Read with pandas.read_excel and harmonise columns",
        "Validate data types and header cleanliness",
    ],
    "Other formats": [
        "Leverage native connectors (e.g., Spark, cloud SDKs)",
        "Persist raw payloads for auditability",
        "Schedule ingestion jobs with retries and alerts",
    ],
}


def build_normalised_catalogue() -> pd.DataFrame:
    """Return a dataframe that lists formats with normalised schema metadata."""

    parsers: Dict[str, Callable[[], Dict[str, object]]] = {
        "CSV": parse_csv_sample,
        "JSON": parse_json_sample,
        "XML": parse_xml_sample,
        "Excel": parse_excel_sample,
    }

    records: List[Dict[str, object]] = []
    for fmt, parser in parsers.items():
        metadata = parser()
        records.append(
            {
                "format": fmt,
                "columns": ", ".join(metadata["columns"]),
                "row_count": metadata["row_count"],
            }
        )

    other_formats = summarize_other_formats()
    records.append(
        {
            "format": "Other formats",
            "columns": ", ".join(other_formats["semi_structured"]),
            "row_count": 0,
        }
    )

    return pd.DataFrame(records)


if __name__ == "__main__":
    catalogue = build_normalised_catalogue()
    print(load_data_formats())
    print(catalogue)
    print("Detected JSON sample:", detect_format('{"id": 1}'))
