---
day: "24D"
title: "Phase 2 Mini Capstone: Modular Data Pipeline"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "phase-2-mini-capstone-modular-data-pipeline"
duration: 90
difficulty: "intermediate"
tags: [python, modularity, pandas, data-pipeline, capstone]
concepts:
  [package-structure, ingestion-cleaning-aggregation, exception-handling, logging, reproducible-environments, business-reporting]
prerequisites: [20, 21, 23, 24, "24B", "24C"]
outcomes:
  [Build a modular Python package for analytics workflows, Run a reproducible ingestion-cleaning-aggregation pipeline, Communicate business insights from a curated output dataset]
---

# 🎯 Day 24D: Phase 2 Mini Capstone — Modular Data Pipeline

> *"A strong analyst doesn't just get an answer once. They deliver a workflow others can run, trust, and extend."*

---

## Capstone Scenario

You are the analytics lead for a subscription business. Operations sends weekly CSV extracts with inconsistent formats, occasional bad records, and duplicate IDs. Leadership needs a reliable summary table to make retention and revenue decisions.

Your mission is to produce a **modular Python package** that ingests raw data, cleans it, aggregates business metrics, and outputs a decision-ready dataset plus a concise insight report.

---

## Required Deliverables

## Track Options (choose one based on your target challenge level)

Use these tracks to differentiate scope while keeping the same core learning outcomes.

| Track | Scope | Required additions |
|---|---|---|
| **Core** | Single dataset pipeline | Ingest one CSV, clean + aggregate, produce `final_metrics.csv` and `business_insights.md`. |
| **Stretch** | Multi-file ingestion + QA visibility | Ingest multiple files (e.g., weekly extracts), union safely, and generate a data quality report (`reports/data_quality.md`). |
| **Expert** | Config-driven pipeline + automation discipline | Add config-driven behavior (YAML/JSON), CLI arguments for paths/parameters, and automated tests for key transforms/metrics. |

> Recommendation: Start with Core, then layer Stretch/Expert features only after end-to-end correctness is stable.

### 1) Modular Python package structure

Create a package-style project (not a single script), for example:

```text
phase2_mini_capstone/
├─ README.md
├─ requirements.txt
├─ src/
│  └─ pipeline/
│     ├─ __init__.py
│     ├─ ingest.py
│     ├─ clean.py
│     ├─ aggregate.py
│     ├─ io_utils.py
│     └─ run_pipeline.py
├─ data/
│  ├─ raw/
│  └─ processed/
├─ logs/
└─ reports/
```

Minimum expectations:
- Clear module responsibilities (`ingest`, `clean`, `aggregate`, orchestration).
- Reusable functions with docstrings and type hints where appropriate.
- A single entry point (e.g., `python -m pipeline.run_pipeline`).

### 2) Ingestion → cleaning → aggregation pipeline

Implement a pipeline that:

- **Ingests** at least one raw CSV file from `data/raw/`.
- **Cleans** the dataset (null handling, duplicate handling, type coercion, basic validation).
- **Aggregates** to produce a business-ready summary table (e.g., by segment, region, or month).

Required output:
- `data/processed/final_metrics.csv`

### 3) Exception handling + logging

Your pipeline must include:

- Structured try/except blocks for critical steps (file read, parsing, transforms, write).
- Explicit, informative error messages.
- Logging to both console and file (`logs/pipeline.log`).

At minimum, log:
- Pipeline start/end
- Row counts before/after cleaning
- Number of dropped/invalid records
- Aggregation completion and output path
- Any raised exceptions with context

### 4) Reproducible environment instructions

Include:

- A `requirements.txt` with required packages.
- Setup steps in your project README using virtual environments.

Use commands equivalent to:

```bash
python -m venv .venv
source .venv/bin/activate      # macOS/Linux
# .venv\Scripts\activate      # Windows
pip install -r requirements.txt
python -m pipeline.run_pipeline
```

### 5) Output dataset + short business insight report

Produce:

- `data/processed/final_metrics.csv`
- `reports/business_insights.md` (200–400 words)

Your report should include:
- 2–3 key findings from the aggregated dataset
- 1 business risk/caveat tied to data quality assumptions
- 2 recommended next actions for stakeholders

### 6) Executive Readout Template (`reports/business_insights.md`)

Use this exact structure so stakeholders can quickly evaluate decisions:

```markdown
# Executive Readout

## 1) Context
- Time period covered, data sources included, and business question.

## 2) KPI Movement
- KPI 1: what changed (absolute + %), compared to what baseline.
- KPI 2: what changed (absolute + %), compared to what baseline.

## 3) Caveats / Data Quality Notes
- Known limitations (missing values, dropped records, schema assumptions, late-arriving data).

## 4) Recommendation
- Decision/action to take now.
- Why this recommendation follows from the KPI evidence.

## 5) Next Experiment
- One measurable follow-up test (hypothesis, metric, decision threshold).
```

Requirement: every recommendation must cite at least one specific metric from `final_metrics.csv`.

### 7) Sample expected outputs (minimum)

`data/processed/final_metrics.csv` (minimum schema example):

```csv
period,segment,customers_active,churn_rate,revenue,total_tickets
2025-01,SMB,1240,0.043,185000,312
```

Example insight bullet (minimum evidence standard):

- **SMB churn increased from 3.6% to 4.3% (+0.7pp MoM), while support tickets rose 18% (264 → 312); prioritize SMB onboarding improvements and track churn back below 4.0% next month.**

---

## Suggested Implementation Flow

1. Define package skeleton and module interfaces.
2. Implement ingestion with schema checks.
3. Build cleaning rules and validation assertions.
4. Add aggregation functions and metric definitions.
5. Integrate logging + exception handling in orchestration.
6. Export `final_metrics.csv` and write business report.
7. Verify reproducibility in a fresh virtual environment.

---

## Submission Checklist

- [ ] Package structure is modular and runnable as a pipeline.
- [ ] `requirements.txt` exists and installs cleanly.
- [ ] Pipeline runs end-to-end and writes `final_metrics.csv`.
- [ ] Logging captures key lifecycle events and failures.
- [ ] `business_insights.md` translates output into business decisions.
- [ ] README includes reproducible venv setup/run steps.

---

## Grading Rubric (aligned to Common Grading Rubric)

### A) Common quality dimensions (40 points)

| Dimension (Common Rubric Alignment) | 0 points | 5 points | 10 points |
|---|---|---|---|
| Correctness | Pipeline does not produce required output or metrics are mostly incorrect. | Output produced but some transformation/metric mistakes remain. | Output and metrics are correct and traceable to code logic. |
| Robustness | Crashes on common issues (missing file, bad types, nulls). | Handles some edge cases but not consistently. | Handles common edge cases with validation and graceful failure behavior. |
| Readability | Hard to follow, unclear names, little structure. | Understandable but inconsistent style or organization. | Clean, consistent, well-documented modules and functions. |
| Reuse | One-off script with duplicated logic. | Partial modularization with limited reuse. | Well-factored modules/functions with clear boundaries and interfaces. |

### B) Deliverable-specific scoring (60 points)

| Deliverable | Criteria | Points |
|---|---|---:|
| Modular package structure | Required folders/modules present; clear separation of concerns; runnable entry point. | 12 |
| Ingestion-cleaning-aggregation pipeline | End-to-end flow works; cleaning decisions applied; aggregated table is business-ready. | 18 |
| Exception handling + logging | Critical steps protected with try/except; useful logs written to console + file. | 8 |
| Reproducible environment | `requirements.txt` complete; README includes accurate venv + run commands. | 5 |
| Output dataset + insight report | `final_metrics.csv` generated; insight report is concise, evidence-based, action-oriented. | 7 |
| Communication quality | Executive readout is concise, structured, stakeholder-ready, and uses clear business language. | 5 |
| Decision traceability | Each recommendation is explicitly linked to metric evidence (values, deltas, and comparison baseline). | 5 |

### C) Pass thresholds

- **Minimum passing score:** **70/100**
- **Mandatory gates (must all be met to pass):**
  1. Pipeline executes end-to-end without manual code edits during run.
  2. `data/processed/final_metrics.csv` is generated.
  3. `reports/business_insights.md` is submitted.
  4. Logging and exception handling are visibly implemented.

If total score is 70+ but any mandatory gate is missing, result is **Not Yet Passing**.

---

## Stretch Goals (Optional)

- Add unit tests for cleaning and aggregation functions.
- Add CLI arguments for input/output paths.
- Add data quality summary report (`reports/data_quality.md`).
- Add a lightweight Makefile for setup/run/test automation.

This mini capstone is your transition point from notebook-style analysis to reliable, production-minded analytics workflows.
