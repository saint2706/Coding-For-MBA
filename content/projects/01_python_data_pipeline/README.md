# 🐍 Project 01: Python Data Pipeline

> **Phases covered**: Phase 1 (Python Foundations) · Phase 2 (Functions, Modularity & Data Wrangling)  
> **Difficulty**: Beginner → Intermediate  
> **Estimated time**: 4–6 hours

---

## 🎯 Project Overview

Build an **end-to-end data pipeline** that ingests raw sales data from a CSV file,
cleans and transforms it using Pandas, computes key business KPIs, and writes the
final output to a clean CSV and a SQLite database.

This project proves you can:

- Write well-structured, modular Python functions (Phase 1–2)
- Wrangle messy real-world data with Pandas (Phase 2)
- Build a reproducible, single-command pipeline

---

## 📋 Business Scenario

You are a junior data analyst at **RetailCo**, a mid-size retail chain with 20 stores.
Finance needs a **monthly KPI report** every Monday morning showing:

| KPI | Description |
| --- | --- |
| `total_revenue` | Sum of all sales for the period |
| `avg_order_value` | Mean revenue per transaction |
| `return_rate` | Returns as % of units sold |
| `revenue_growth_mom` | Month-over-month revenue growth (%) |
| `top_store` | Store ID with highest monthly revenue |
| `top_category` | Product category with highest revenue |

Right now this report is compiled manually in Excel and takes 3 hours. Your pipeline
will do it in under 30 seconds.

---

## 🗂️ Project Structure

```
01_python_data_pipeline/
├── README.md            ← this file
├── pipeline.py          ← main scaffold (fill in the TODOs)
├── sample_data.csv      ← synthetic sales data to get you started
└── expected_output.txt  ← reference KPIs so you can validate your work
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 1 | Variables, arithmetic, `print()`, conditionals, loops, functions |
| Phase 2 | Pandas DataFrames, `groupby`, `merge`, `apply`, list comprehensions |

---

## ✅ Milestones

### Milestone 1 — Load & Validate (Phase 1)

- [ ] Read `sample_data.csv` with `pd.read_csv()`
- [ ] Print shape, dtypes, and first 5 rows
- [ ] Assert no required columns are missing
- [ ] Assert no fully-null rows exist

### Milestone 2 — Clean (Phase 2)

- [ ] Convert `date` column to `datetime`
- [ ] Remove rows where `revenue < 0` (data entry errors)
- [ ] Cap `revenue` outliers at the 99th percentile
- [ ] Add derived columns: `year`, `month`, `is_weekend`, `net_revenue`

### Milestone 3 — Transform (Phase 2)

- [ ] `groupby` month + region → aggregate revenue, units, returns
- [ ] Calculate `return_rate = returns / units_sold`
- [ ] Calculate `avg_order_value = revenue / units_sold`
- [ ] Compute MoM revenue growth using `.pct_change()`

### Milestone 4 — Report (Phase 1–2)

- [ ] Print a formatted monthly KPI summary to the console
- [ ] Export the clean DataFrame to `output/kpi_report.csv`
- [ ] Persist to SQLite via `df.to_sql()`
- [ ] Write a `generate_report()` function that accepts a date range

---

## 🚀 Getting Started

```bash
# Install dependencies
pip install pandas numpy

# Run the pipeline
python pipeline.py

# Expected: "✅ Pipeline complete — 12 monthly KPI rows written to output/"
```

---

## 🏆 Stretch Goals

- [ ] Add a CLI interface with `argparse` (date range flags)
- [ ] Add logging with Python's `logging` module
- [ ] Write unit tests for `clean_data()` and `compute_kpis()` with `pytest`
- [ ] Schedule automatic runs with a `cron` job or `APScheduler`

---

## 📚 Reference Lessons

- Day 1–12: Python fundamentals (variables, loops, functions)
- Day 13–24: Pandas — DataFrames, groupby, merge, reshaping (Phase 2)
- Day 37B: Probability & Statistics for validation checks

---

*Happy coding! Push your completed solution to GitHub and share the repo link as proof of work.*
