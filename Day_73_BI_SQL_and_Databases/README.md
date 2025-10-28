# Day 73 – BI SQL and Databases

Day 73 rebuilds the SQL and database depth outlined in the BI roadmap so the track moves beyond the
light touch from [Day 31 – Databases](../Day_31_Databases/README.md) and the tooling survey in
[Day 70 – BI Metrics and Data Literacy](../Day_70_BI_Metrics_and_Data_Literacy/README.md). The
facilitation plan clusters the roadmap titles into two discussion blocks:

- **SQL foundations** – SQL Fundamentals, Basic Queries, Advanced Queries, Window Functions, and
  Data Cleaning. The exercises reopen the core syntax students first practiced on Day 31 while
  layering in modern analytic patterns such as window functions for cohort monitoring and quality
  checks for BI pipelines.
- **Database engines** – Popular Databases, PostgreSQL, MySQL, Oracle, and SQLite. The lesson
  compares engine traits for BI workloads and shows how to start with SQLite before graduating to
  managed PostgreSQL or MySQL services.

The accompanying `lesson.py` script walks through a lightweight analytics warehouse built with
SQLite. It demonstrates:

1. Basic selection and filtering patterns.
1. Aggregations that BI teams use to sanity-check staging tables.
1. Window functions that compute cumulative revenue and period-over-period deltas.

Use these walkthroughs alongside Day 31's notebooks when you want learners to contrast Python-side
DataFrame transformations with raw SQL and database operations.

## Additional Topic: ETL & Data Preparation

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the
> [Phase 5 overview](../docs/bi-curriculum.md) to see how the developer-roadmap topics align across
> Days 68–84.

## Why it matters

Design reliable ingestion pipelines for analytics-ready data.

## Developer-roadmap alignment

- ETL basics
- ETL Tools
- Data Transformation Techniques
- Data Cleaning

## Next steps

- Draft case studies and notebooks that exercise these roadmap nodes.
- Update the Phase 5 cheat sheet with the insights you capture here.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 72 – Day 72 – BI Data Formats and Ingestion](../Day_72_BI_Data_Formats_and_Ingestion/README.md) • **Next:** [Day 74 – Day 74 – BI Data Preparation and Tools](../Day_74_BI_Data_Preparation_and_Tools/README.md)

_You are on lesson 73 of 108._

<!-- LESSON_FOOTER_END -->