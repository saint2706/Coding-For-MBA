# 📊 Day 36 – Capstone Case Study

## Overview

Day 36 ties together the full analytics workflow. You will load the
`case_study_sales.csv` dataset, clean it, surface core revenue insights, and
present a concise set of recommendations. The helpers in this folder mirror the
solution structure so that you can focus on translating business questions into
Python code.

## Files

| File | Description |
| --- | --- |
| [`case_study.py`](case_study.py) | Student-facing template containing callable helpers and a minimal `main()` driver you can customize. |
| [`case_study_sales.csv`](case_study_sales.csv) | Sales dataset that powers the analysis. |
| [`solutions.py`](solutions.py) | Fully worked reference solution with detailed walkthrough code. |

## Suggested Workflow

1. Use `load_case_study_data()` to import the CSV with parsed dates.
2. Call `clean_case_study_data()` to enforce schema expectations and rebuild the
   `Revenue` column when necessary.
3. Explore metrics via `summarize_case_study()` or write your own aggregations
   and visualizations.
4. Capture narrative takeaways for the Head of Sales along with supporting
   charts or tables.

Running the script directly executes the helper pipeline and prints the top-line
revenue summaries:

```bash
python Day_36_Case_Study/case_study.py
```

## Tests

Automated tests validate the helpers against the bundled dataset. From the
repository root run:

```bash
pytest tests/test_day_36.py
```
