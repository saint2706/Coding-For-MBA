"""Tests for Day 72 – BI Data Formats and Ingestion."""

from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from Day_72_BI_Data_Formats_and_Ingestion.lesson import build_normalised_catalogue
from Day_72_BI_Data_Formats_and_Ingestion.solutions import (
    DATA_FORMAT_TITLES,
    detect_format,
    load_data_formats,
    parse_csv_sample,
    parse_excel_sample,
    parse_json_sample,
    parse_xml_sample,
    summarize_other_formats,
)


def test_data_formats_dataframe_contains_all_titles():
    df = load_data_formats()
    assert list(df["title"]) == DATA_FORMAT_TITLES


def test_parsers_return_expected_schema():
    csv_meta = parse_csv_sample()
    json_meta = parse_json_sample()
    xml_meta = parse_xml_sample()
    excel_meta = parse_excel_sample()

    expected_columns = ["id", "name", "value"]

    for meta in (csv_meta, json_meta, xml_meta, excel_meta):
        assert meta["columns"] == expected_columns
        assert meta["row_count"] == 2
        assert set(meta["dtypes"].keys()) == set(expected_columns)

    assert excel_meta["sheet_names"] == ["Sheet1"]


def test_workflow_catalogue_lists_all_formats():
    catalogue = build_normalised_catalogue()
    assert set(catalogue["format"]) == set(DATA_FORMAT_TITLES[1:])


def test_detect_format_and_other_summaries():
    assert detect_format('{"id":1}') == "json"
    assert detect_format("<root></root>") == "xml"
    assert detect_format("id,name\n1,Alice") == "csv"
    assert detect_format("") == "unknown"

    summary = summarize_other_formats()
    assert "Parquet" in summary["semi_structured"]
    assert "Kafka" in summary["streaming"]
