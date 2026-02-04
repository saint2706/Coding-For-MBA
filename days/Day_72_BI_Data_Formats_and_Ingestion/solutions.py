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
