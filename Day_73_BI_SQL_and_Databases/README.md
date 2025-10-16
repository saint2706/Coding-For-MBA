# Day 73 – BI SQL and Databases

Day 73 rebuilds the SQL and database depth outlined in the BI roadmap so the
track moves beyond the light touch from [Day 31 – Databases](../Day_31_Databases/README.md)
and the tooling survey in [Day 70 – BI Data Fundamentals](../Day_70_BI_Data_Fundamentals/README.md).
The facilitation plan clusters the roadmap titles into two discussion blocks:

- **SQL foundations** – SQL Fundamentals, Basic Queries, Advanced Queries,
  Window Functions, and Data Cleaning. The exercises reopen the core syntax
  students first practiced on Day 31 while layering in modern analytic patterns
  such as window functions for cohort monitoring and quality checks for BI
  pipelines.
- **Database engines** – Popular Databases, PostgreSQL, MySQL, Oracle, and
  SQLite. The lesson compares engine traits for BI workloads and shows how to
  start with SQLite before graduating to managed PostgreSQL or MySQL services.

The accompanying `lesson.py` script walks through a lightweight analytics
warehouse built with SQLite. It demonstrates:

1. Basic selection and filtering patterns.
2. Aggregations that BI teams use to sanity-check staging tables.
3. Window functions that compute cumulative revenue and period-over-period
   deltas.

Use these walkthroughs alongside Day 31's notebooks when you want learners to
contrast Python-side DataFrame transformations with raw SQL and database
operations.
