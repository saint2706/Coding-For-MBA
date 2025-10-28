# Day 72 – BI Data Formats and Ingestion

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
> [Phase 5 overview](../docs/bi-curriculum.md) to see how the developer-roadmap topics align across
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

**Previous:** [Day 71 – Day 71 – BI Data Landscape Fundamentals](../Day_71_BI_Data_Landscape/README.md) • **Next:** [Day 73 – Day 73 – BI SQL and Databases](../Day_73_BI_SQL_and_Databases/README.md)

_You are on lesson 72 of 108._

<!-- LESSON_FOOTER_END -->