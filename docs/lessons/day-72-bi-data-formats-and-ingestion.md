---
title: "Day 72 \u2013 BI Data Formats and Ingestion"
tags:
- BI
- Data
---

Business intelligence analysts encounter a wide mix of raw data files. This day focuses on
recognising the shape of those payloads, picking the right parser, and pushing the results into a
consistent analytics model.

## Learning goals

- Differentiate between delimited, semi-structured, hierarchical, and workbook formats.
- Detect formats quickly using metadata, file signatures, or lightweight sampling.
- Ingest data with the right tooling (pandas for CSV/Excel, Python standard libraries for JSON/XML,
  connectors for specialised sources).
- Normalise columns, headers, and types so downstream BI models remain stable.

## Ingestion considerations by format

| Format | Detection tips | Ingestion workflow | Normalisation focus | | --- | --- | --- | --- | |
CSV | Look for delimiters, header rows, and encoding markers | Use `pandas.read_csv` with explicit
delimiter, encoding, and dtype controls | Trim headers, convert numeric/text columns, set index keys
| | JSON | Check for curly braces or REST metadata | Load with `json.loads` or pandas
`json_normalize`, flatten nested structures | Rename flattened columns, convert timestamps, explode
arrays | | XML | Inspect XML declaration and namespaces | Parse with `xml.etree.ElementTree` or
`lxml`, target nodes with XPath | Map attributes/elements to tabular fields, manage namespaces | |
Excel | Verify workbook extension and sheet layout | Use `pandas.read_excel`, manage header rows and
sheet selection | Align column names across sheets, coerce text/number types | | Other formats |
Consult provider documentation and schema registries | Leverage vendor SDKs, Spark, or ingestion
services | Persist raw payloads, track schema evolution, document lineage |

## Workflow overview

1. **Profile source** – Collect sample rows and metadata (file size, content type, encoding) to
   determine format and potential data quality issues.
1. **Parse with the right tool** – Choose a parser that respects the format's schema. Handle
   streaming/large files with chunked readers when needed.
1. **Normalise columns** – Standardise naming conventions, data types, and categorical mappings.
   Convert nested or hierarchical data into tidy tables.
1. **Validate and log** – Capture row counts, schema versions, and exceptions to monitor ingestion
   health.
1. **Persist curated output** – Store the cleansed tables in the BI warehouse or semantic layer,
   keeping raw payloads for reproducibility.

## Repository contents

- `lesson.py` documents the format-specific workflows and demonstrates a simple catalogue of
  normalised metadata.
- `solutions.py` provides helper functions that detect formats and parse sample payloads.
- `tests/test_day_72.py` verifies that the catalogue includes every format and that schema metadata
  is generated consistently.

## Additional Topic: Data Architecture & Modeling

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the
> [Phase 5 overview](https://github.com/saint2706/Coding-For-MBA/blob/main/docs/bi-curriculum.md) to see how the developer-roadmap topics align across
> Days 68–84.

## Why it matters

Blueprint a warehouse that keeps stakeholders aligned.

## Developer-roadmap alignment

- Data Architectures
- Data Modeling for BI
- Fact vs Dimension Tables
- Star vs Snowflake Schema
- Normalization vs Denormalization

## Next steps

- Draft case studies and notebooks that exercise these roadmap nodes.
- Update the Phase 5 cheat sheet with the insights you capture here.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 71 – Day 71 – BI Data Landscape Fundamentals](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_71_BI_Data_Landscape/README.md) • **Next:** [Day 73 – Day 73 – BI SQL and Databases](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_73_BI_SQL_and_Databases/README.md)

_You are on lesson 72 of 108._

<!-- LESSON_FOOTER_END -->

## Additional Materials

???+ example "lesson.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_72_BI_Data_Formats_and_Ingestion/lesson.py)

    ```python title="lesson.py"
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
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_72_BI_Data_Formats_and_Ingestion/solutions.py)

    ```python title="solutions.py"
    """Reference implementations for Day 72 – BI Data Formats and Ingestion."""

    from __future__ import annotations

    import io
    import json
    import xml.etree.ElementTree as ET
    from typing import Any, Dict, Iterable, List

    import pandas as pd

    DATA_FORMAT_TITLES: List[str] = [
        "Data Formats",
        "CSV",
        "JSON",
        "XML",
        "Excel",
        "Other formats",
    ]


    def load_data_formats() -> pd.DataFrame:
        """Return a dataframe describing key BI data formats."""

        return pd.DataFrame(
            {
                "title": DATA_FORMAT_TITLES,
                "ingestion_focus": [
                    "Overview of schema detection and column normalisation",
                    "Delimited flat files with strong tabular typing",
                    "Nested records that require normalisation",
                    "Hierarchical documents with attributes and elements",
                    "Workbook-based tables that may span multiple sheets",
                    "Specialised or streaming sources that need connectors",
                ],
            }
        )


    def detect_format(sample: str) -> str:
        """Very small heuristic for detecting a data format from text."""

        stripped = sample.lstrip()
        if not stripped:
            return "unknown"
        if stripped.startswith("{") or stripped.startswith("["):
            return "json"
        if stripped.startswith("<?xml") or stripped.startswith("<"):
            return "xml"
        if "," in sample and "\n" in sample:
            return "csv"
        return "unknown"


    def _infer_schema(frame: pd.DataFrame) -> Dict[str, Any]:
        """Return schema metadata from a dataframe."""

        return {
            "columns": list(frame.columns),
            "row_count": int(frame.shape[0]),
            "dtypes": {col: str(dtype) for col, dtype in frame.dtypes.items()},
        }


    _CSV_SAMPLE = """id,name,value\n1,Alice,10\n2,Bob,20\n"""
    _JSON_SAMPLE = json.dumps(
        [
            {"id": 1, "name": "Alice", "value": 10},
            {"id": 2, "name": "Bob", "value": 20},
        ]
    )
    _XML_SAMPLE = """<rows>\n  <row id=\"1\" name=\"Alice\" value=\"10\" />\n  <row id=\"2\" name=\"Bob\" value=\"20\" />\n</rows>\n"""


    def parse_csv_sample(sample: str | None = None) -> Dict[str, Any]:
        """Parse a CSV snippet with pandas and return schema metadata."""

        sample = sample or _CSV_SAMPLE
        frame = pd.read_csv(io.StringIO(sample))
        return _infer_schema(frame)


    def parse_json_sample(sample: str | None = None) -> Dict[str, Any]:
        """Parse a JSON document and return schema metadata."""

        sample = sample or _JSON_SAMPLE
        payload = json.loads(sample)
        if isinstance(payload, dict):
            records: Iterable[Dict[str, Any]] = [payload]
        else:
            records = payload
        frame = pd.json_normalize(list(records))
        return _infer_schema(frame)


    def parse_xml_sample(sample: str | None = None) -> Dict[str, Any]:
        """Parse XML into a dataframe-friendly representation."""

        sample = sample or _XML_SAMPLE
        root = ET.fromstring(sample)
        rows: List[Dict[str, Any]] = []
        for child in root.findall(".//row"):
            rows.append(child.attrib)
        frame = pd.DataFrame(rows)
        return _infer_schema(frame)


    def parse_excel_sample(workbook_bytes: bytes | None = None) -> Dict[str, Any]:
        """Read an Excel workbook with pandas and return schema metadata.

        When ``workbook_bytes`` is ``None`` a small in-memory workbook is
        generated for demonstration. The function gracefully falls back to the
        dataframe used to create the workbook if an engine is unavailable.
        """

        sample_frame = pd.DataFrame(
            {
                "id": [1, 2],
                "name": ["Alice", "Bob"],
                "value": [10, 20],
            }
        )

        buffer = io.BytesIO()
        df: pd.DataFrame

        if workbook_bytes is not None:
            df = pd.read_excel(io.BytesIO(workbook_bytes))
        else:
            try:
                with pd.ExcelWriter(buffer, engine="xlsxwriter") as writer:  # type: ignore[arg-type]
                    sample_frame.to_excel(writer, index=False, sheet_name="Sheet1")
                buffer.seek(0)
                df = pd.read_excel(buffer)
            except Exception:
                # fall back to using the sample frame directly if an engine is missing
                df = sample_frame

        metadata = _infer_schema(df)
        metadata["sheet_names"] = ["Sheet1"]
        return metadata


    def summarize_other_formats() -> Dict[str, List[str]]:
        """Summarise additional formats and ingestion connectors."""

        return {
            "semi_structured": ["Parquet", "Avro", "ORC"],
            "streaming": ["Kafka", "Kinesis"],
            "cloud_storage": ["S3", "Azure Blob", "GCS"],
        }


    __all__ = [
        "DATA_FORMAT_TITLES",
        "detect_format",
        "load_data_formats",
        "parse_csv_sample",
        "parse_json_sample",
        "parse_xml_sample",
        "parse_excel_sample",
        "summarize_other_formats",
    ]
    ```
