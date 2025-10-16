# Day 72 – BI Data Formats and Ingestion

Business intelligence analysts encounter a wide mix of raw data files. This day
focuses on recognising the shape of those payloads, picking the right parser,
and pushing the results into a consistent analytics model.

## Learning goals

- Differentiate between delimited, semi-structured, hierarchical, and workbook
  formats.
- Detect formats quickly using metadata, file signatures, or lightweight
  sampling.
- Ingest data with the right tooling (pandas for CSV/Excel, Python standard
  libraries for JSON/XML, connectors for specialised sources).
- Normalise columns, headers, and types so downstream BI models remain stable.

## Ingestion considerations by format

| Format | Detection tips | Ingestion workflow | Normalisation focus |
| --- | --- | --- | --- |
| CSV | Look for delimiters, header rows, and encoding markers | Use `pandas.read_csv` with explicit delimiter, encoding, and dtype controls | Trim headers, convert numeric/text columns, set index keys |
| JSON | Check for curly braces or REST metadata | Load with `json.loads` or pandas `json_normalize`, flatten nested structures | Rename flattened columns, convert timestamps, explode arrays |
| XML | Inspect XML declaration and namespaces | Parse with `xml.etree.ElementTree` or `lxml`, target nodes with XPath | Map attributes/elements to tabular fields, manage namespaces |
| Excel | Verify workbook extension and sheet layout | Use `pandas.read_excel`, manage header rows and sheet selection | Align column names across sheets, coerce text/number types |
| Other formats | Consult provider documentation and schema registries | Leverage vendor SDKs, Spark, or ingestion services | Persist raw payloads, track schema evolution, document lineage |

## Workflow overview

1. **Profile source** – Collect sample rows and metadata (file size, content
   type, encoding) to determine format and potential data quality issues.
2. **Parse with the right tool** – Choose a parser that respects the format's
   schema. Handle streaming/large files with chunked readers when needed.
3. **Normalise columns** – Standardise naming conventions, data types, and
   categorical mappings. Convert nested or hierarchical data into tidy tables.
4. **Validate and log** – Capture row counts, schema versions, and exceptions to
   monitor ingestion health.
5. **Persist curated output** – Store the cleansed tables in the BI warehouse or
   semantic layer, keeping raw payloads for reproducibility.

## Repository contents

- `lesson.py` documents the format-specific workflows and demonstrates a simple
  catalogue of normalised metadata.
- `solutions.py` provides helper functions that detect formats and parse sample
  payloads.
- `tests/test_day_72.py` verifies that the catalogue includes every format and
  that schema metadata is generated consistently.
