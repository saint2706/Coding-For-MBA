# Day 74 – BI Data Preparation and Tools

Day 74 focuses on the hands-on mechanics of preparing business intelligence data. We reinforce data
quality checkpoints—handling duplicates, missing values, outliers, transformation logic, and
exploratory profiling—before mapping them to the day-to-day tooling that teams rely on.

## Data Quality Playbook

| Task | What to Watch | Best Practices | | --- | --- | --- | | **Duplicates** | Repeated
customer/order rows that inflate metrics. | Define business keys, run `drop_duplicates`/`distinct`,
and document merge logic so downstream analysts understand the canonical record. | | **Missing
Values** | Null revenue, dates, or categories that break aggregations. | Profile null rates,
classify as MCAR/MAR/MNAR, and choose imputation (`fillna`, `replace_na`) or row removal
intentionally. Track imputations in metadata. | | **Outliers** | Unusually high/low values that
distort dashboards. | Apply interquartile range (IQR) or z-score fences, confirm with domain
experts, and consider winsorisation rather than blind removal. | | **Data Transformation
Techniques** | Misaligned datatypes, inconsistent labels, features needing scaling/encoding. | Build
deterministic pipelines that cast datatypes, standardise casing, engineer derived metrics, and log
every assumption. | | **Exploratory Data Analysis (EDA)** | Hidden biases that only surface when
visualised. | Pair summary stats with quick charts (boxplots/histograms) to flag skew, segmentation
issues, and candidate filters before modelling or reporting. |

## Tooling Workflows

### Pandas (Python)

- Chain helpers with `DataFrame.pipe` to sequence deduplication, null handling, and type
  standardisation.
- Store reusable helpers (e.g., `remove_duplicates`, `handle_missing_values`) in a utilities module
  and unit test them.
- Use `.assign()` or dedicated functions to derive KPI columns without mutating state mid-pipeline.

### dplyr (R)

- Combine `distinct()` and `arrange()` to create stable keys ahead of joins.
- Apply `tidyr::replace_na()` and `mutate(across())` for succinct imputations across multiple
  columns.
- Package pipelines as functions so R Markdown reports or Shiny dashboards reuse consistent
  preparation logic.

### Excel

- Promote ranges to Excel Tables, enabling repeatable "Remove Duplicates" and structured references.
- Use Power Query to encapsulate steps such as type conversions, trimming, and merges—refreshable
  for future data drops.
- Maintain a "Data Quality" sheet documenting manual checks (data validation rules, conditional
  formatting) for auditability.

## Multi-Tool Cleaning Pipelines

The accompanying `lesson.py` script demonstrates how the same workflow translates across Python, R,
and Excel:

1. **Python (pandas):** Deduplicate by customer/date keys, fill missing revenue/cost/segment values,
   standardise types, and compute gross margin.
1. **R (dplyr):** Mirror the pipeline with `%>%`, `distinct()`, `replace_na()`, and tidyverse
   helpers (`lubridate`, `stringr`).
1. **Excel:** Outline the equivalent sequence using Tables, Remove Duplicates, Go To Special for
   blanks, Power Query typing, and a gross-margin formula column.

These shared patterns keep BI data reliable regardless of the toolset in play, and the helpers in
`solutions.py` power automated tests to ensure regressions are caught early.

## Additional Topic: Descriptive Analytics

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the
> [Phase 5 overview](../docs/bi-curriculum.md) to see how the developer-roadmap topics align across
> Days 68–84.

## Why it matters

Summarize business performance with descriptive measures.

## Developer-roadmap alignment

- Types of Data Analysis
- Descriptive Statistics
- Central Tendency
- Dispersion
- Distribution

## Next steps

- Draft case studies and notebooks that exercise these roadmap nodes.
- Update the Phase 5 cheat sheet with the insights you capture here.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 73 – Day 73 – BI SQL and Databases](../Day_73_BI_SQL_and_Databases/README.md) • **Next:** [Day 75 – Day 75 – BI Visualization and Dashboard Principles](../Day_75_BI_Visualization_and_Dashboard_Principles/README.md)

_You are on lesson 74 of 108._

<!-- LESSON_FOOTER_END -->