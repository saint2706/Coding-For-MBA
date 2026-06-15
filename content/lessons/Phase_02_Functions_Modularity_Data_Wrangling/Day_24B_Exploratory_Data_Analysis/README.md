---
day: "24B"
title: "Exploratory Data Analysis (EDA)"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "exploratory-data-analysis"
duration: 60
difficulty: "intermediate"
tags: [python, pandas, eda, business-analysis]
concepts:
  [business-question framing, univariate and bivariate analysis, missingness audit, outlier strategy, correlation caveats]
prerequisites: [23, 24]
outcomes:
  [Frame EDA around business decisions, Audit distributions and data quality, Communicate risks and next actions with an executive-ready memo]
---

# 🎯 Day 24B: Exploratory Data Analysis (EDA)

> *"EDA is where raw tables become decisions."*

---

## The "Never-Coded" Bridge

MBA teams rarely ask, *"What is the mean of column X?"* They ask:

- Why did churn rise in Q2?
- Which customer segment should we target first?
- Are discounts increasing revenue or just reducing margin?

EDA is the structured middle step between cleaning data and presenting charts. It helps you validate assumptions, expose data risks, and prioritize the analyses that matter before building dashboards.

---

## EDA Question Framework (Business Questions First)

Use this sequence before opening any plotting library:

1. **Decision context**: What decision will this analysis inform?
2. **Primary KPI**: Which metric defines success (e.g., conversion, margin, churn)?
3. **Driver hypotheses**: What factors might explain KPI movement?
4. **Segment lens**: Which cuts matter (region, channel, cohort, product line)?
5. **Risk checks**: What data quality issues could invalidate conclusions?

### Practical Template

```text
Business decision:
Primary KPI:
Working hypotheses (top 3):
Key segments to compare:
Must-pass data quality checks:
```

### EDA Hypothesis Log

Track how your assumptions evolve as evidence accumulates.

| Hypothesis | Metric | Segment | Evidence Status | Confidence | Next Test |
|---|---|---|---|---|---|
| Discounts are driving revenue decline through margin erosion | Revenue, gross margin % | Region A, promo orders | Pending / Supported / Rejected | Low / Medium / High | Compare pre/post promo cohorts controlling for product mix |
| Missing orders in one channel are distorting conversion trends | Conversion rate, order count | Paid channel by month | Pending / Supported / Rejected | Low / Medium / High | Audit ingestion completeness vs source system logs |
| VIP customers offset volume declines with higher basket size | Order value, customer count | VIP vs non-VIP | Pending / Supported / Rejected | Low / Medium / High | Segment bivariate check with outlier-flagged and raw views |

---

## The Technical Deep Dive

### 1) Univariate Checks (One Variable at a Time)

Goal: understand distribution, data type integrity, and suspicious values.

```python
import pandas as pd

# Numeric overview
num_cols = df.select_dtypes(include="number").columns
univariate_num = df[num_cols].describe().T

# Categorical overview
cat_cols = df.select_dtypes(exclude="number").columns
for c in cat_cols:
    print(f"\n{c}")
    print(df[c].value_counts(dropna=False).head(10))
```

Checklist:

- Range and units make business sense
- Heavy skew or long tails are identified
- Cardinality is manageable for reporting
- Category labels are standardized

### 2) Missingness Audit

Missing data is not just a technical issue—it can indicate process breakdown.

```python
missing = (
    df.isna()
    .mean()
    .mul(100)
    .sort_values(ascending=False)
    .rename("missing_pct")
)
print(missing[missing > 0])

# Optional: segment-level missingness
missing_by_region = df.groupby("region")["revenue"].apply(lambda s: s.isna().mean())
print(missing_by_region)
```

Ask:

- Is missingness random or concentrated by segment/time/channel?
- Could missingness bias KPI comparisons?
- Do we impute, exclude, or escalate data collection fixes?

### 3) Outlier Strategy

Outliers can be signal (fraud, VIP behavior, stockout spikes) or noise (data entry error).

```python
q1 = df["order_value"].quantile(0.25)
q3 = df["order_value"].quantile(0.75)
iqr = q3 - q1

lower = q1 - 1.5 * iqr
upper = q3 + 1.5 * iqr

outliers = df[(df["order_value"] < lower) | (df["order_value"] > upper)]
print(f"Outliers found: {len(outliers)}")
```

Decision options:

- Keep and flag (when extreme values are meaningful)
- Cap/winsorize for robust modeling
- Remove only with explicit, documented justification

### 4) Bivariate Checks (Relationship Scanning)

Goal: test whether candidate drivers move with your KPI.

```python
# Numeric-numeric
print(df[["marketing_spend", "revenue"]].corr(numeric_only=True))

# Category-numeric
segment_summary = df.groupby("channel", as_index=False)["conversion_rate"].agg(["mean", "median", "count"])
print(segment_summary)
```

Useful comparisons:

- KPI by segment (bar/box summaries)
- Time trend vs intervention periods
- Rate metrics normalized by exposure (e.g., per customer, per visit)

### 5) Correlation Caveats (MBA Audience)

Correlation is useful for prioritizing investigation, not for proving causality.

- **Correlation ≠ causation**: Two metrics can move together due to a third factor.
- **Simpson's paradox**: Relationship direction can flip after segmentation.
- **Scale effects**: Shared growth trends can inflate correlation.
- **Nonlinearity**: Pearson correlation misses curved relationships.
- **Policy implication**: Treat correlations as hypotheses to test with experiments or stronger causal designs.

---

## Quick Profiling Tools

### Optional Fast Path: `ydata-profiling`

```python
# pip install ydata-profiling
from ydata_profiling import ProfileReport

profile = ProfileReport(df, title="EDA Profile", explorative=True)
profile.to_file("eda_profile.html")
```

Use when you need a rapid first-pass report for stakeholders.

### Pure Pandas Fallback (No Extra Dependency)

```python
def quick_profile(df: pd.DataFrame) -> pd.DataFrame:
    return pd.DataFrame(
        {
            "dtype": df.dtypes.astype(str),
            "n_unique": df.nunique(dropna=True),
            "missing_pct": df.isna().mean().mul(100).round(2),
            "sample_values": df.apply(lambda s: ", ".join(map(str, s.dropna().astype(str).head(3))), axis=0),
        }
    ).sort_values("missing_pct", ascending=False)

print(quick_profile(df).head(20))
```

---

## Deliverable Template: 1-Page EDA Memo

Use this exact structure for business communication.

```text
Title: EDA Memo — <Project / Dataset / Date>

1) Objective (2-3 lines)
- Decision to support
- KPI and scope

2) Key Findings (3-5 bullets)
- Most important directional insights from univariate and bivariate checks
- Segment differences that matter for action

3) Data Risks & Limitations (3-5 bullets)
- Missingness patterns and likely impact
- Outlier handling decision and rationale
- Correlation caveats / causal uncertainty

4) Recommended Next Actions (3 bullets max)
- Immediate operational action
- Analysis/modeling follow-up
- Data collection or instrumentation fix
```

---

## Hands-on Lab

### Exercise: Revenue Drop Investigation

**Business context:** You are an analyst at a retail company. Q2 revenue in the Northeast region dropped 12% MoM. Leadership wants to know why before the board meeting next week.

**Sample data setup (run this first):**

```python
import pandas as pd
import numpy as np

np.random.seed(42)
n = 500
data = pd.DataFrame({
    "month": np.random.choice(["2024-04", "2024-05", "2024-06"], n),
    "region": np.random.choice(["Northeast", "Southeast", "West"], n, p=[0.4, 0.3, 0.3]),
    "channel": np.random.choice(["Online", "In-Store", "Partner"], n),
    "order_value": np.random.exponential(scale=200, size=n),
    "discount": np.random.uniform(0, 0.30, n),
    "order_count": np.random.randint(1, 50, n),
})
# Introduce some missingness and an issue
data.loc[data["region"] == "Northeast", "order_value"] *= np.random.uniform(0.6, 1.0, (data["region"] == "Northeast").sum())
data.loc[np.random.choice(n, 30, replace=False), "order_count"] = np.nan
```

Follow these explicit steps in order:

1. **Question framing** → Frame three business-first EDA questions tied to a decision and KPI.
2. **Profiling** → Run univariate checks for `revenue`, `discount`, and `order_count` to baseline distribution and quality.
3. **Diagnostics** → Perform a missingness audit and define an outlier strategy for `order_value` with justification.
4. **Hypothesis updates** → Update the EDA Hypothesis Log with evidence status, confidence, and the next test for each hypothesis.
5. **Memo + handoff** → Draft the 1-page EDA memo and complete the visualization handoff checklist for Day 27.

**Expected deliverables for step 1 (example frame):**

```
Business decision: Recommend whether to shift Q3 marketing budget from Northeast to other regions.
Primary KPI: Revenue per order (to distinguish volume vs. value drivers).
Working hypotheses:
  1. Discount rate increased in Northeast → margin erosion, not volume decline.
  2. Partner channel underperformed → channel mix shift explains the drop.
  3. Data ingestion gap → some Northeast orders missing, inflating the apparent decline.
```

**Expected deliverables for step 3 (example missingness summary):**

```
order_count    6.0% missing
order_value    0.0% missing
discount       0.0% missing

→ Strategy: order_count is 6% missing; if needed for KPI, impute with segment median and flag.
→ Outlier strategy for order_value: retain values above IQR upper bound but flag them in the EDA log
  because high-value orders could be VIP behavior, not errors.
```

---

## Mastery Check

### Question 1: Business-First EDA

Why start EDA with business questions instead of jumping to charts?

<details>
<summary>Click for Answer</summary>

Starting with charts produces beautiful but unfocused analysis. Business questions define which metrics matter, which segments are relevant, and which data quality risks could invalidate conclusions. Without that framing, you risk answering the wrong question or building a dashboard no one uses for decisions.

</details>

---

### Question 2: Outlier Retention

When should outliers be retained rather than removed?

<details>
<summary>Click for Answer</summary>

Retain outliers when they represent real, meaningful events rather than errors:

- **Fraud signals**: A transaction for $50,000 in a low-value segment is worth investigating, not removing.
- **VIP behavior**: High-spend customers will always look like outliers but drive disproportionate revenue.
- **Stockout spikes**: An unusually low order volume in one week might reflect supply disruption, not bad data.

Only remove outliers when you can document a clear reason (e.g., data entry error, known system glitch).

</details>

---

### Question 3: Correlation Caveat

Give one example of why a high correlation might still be non-actionable.

<details>
<summary>Click for Answer</summary>

**Simpson's Paradox**: A positive correlation between marketing spend and revenue at the total level may disappear or reverse when broken down by channel. If budget shifts caused a mix change rather than actual lift, acting on the aggregate correlation would mislead resource allocation decisions.

Other examples: shared time trends (both metrics grow with the economy), or a confounding third variable (ice cream sales and drowning incidents both rise in summer).

</details>

---

## Visualization Handoff Checklist (for Day 27)

Before moving from EDA to visualization/storytelling, confirm these outputs are finalized:

- [ ] **Validated metrics**: Final KPI definitions and formulas are locked.
- [ ] **Analytical grain**: Time/entity grain is explicitly stated (e.g., monthly-region, customer-week).
- [ ] **Exclusions**: Rows/segments removed from analysis are listed with business rationale.
- [ ] **Caveats**: Data quality limits, missingness risk, and causal uncertainty are documented.
- [ ] **Chart recommendation**: Proposed chart type(s) and decision narrative are specified for Day 27 build.

---

## Summary

- ✅ EDA starts with **decision context**, not code
- ✅ Univariate + bivariate checks surface patterns and data quality risks
- ✅ Missingness and outliers require explicit business-aware strategy
- ✅ Correlation guides hypotheses, not causal claims
- ✅ A concise EDA memo translates analysis into next actions

**Next bridge:** Phase 3 will convert these validated EDA findings into clear visual stories and dashboards.

---

## Glossary

| Term | Definition |
|------|------------|
| EDA | Exploratory Data Analysis; the process of summarizing, visualizing, and checking a dataset to understand its structure and quality before formal analysis. |
| Profiling | Systematically computing summary statistics (shape, dtype, missing rate, cardinality) for every column in a dataset. |
| Distribution | The pattern of how values in a variable are spread across their possible range; described by shape (symmetric/skewed), center, and spread. |
| Correlation | A statistical measure (typically Pearson's r) of the linear relationship strength between two numeric variables, ranging from -1 to +1. |
| Univariate Analysis | Examining one variable at a time — its distribution, range, missingness, and cardinality. |
| Bivariate Analysis | Examining the relationship between two variables — how one moves with the other across segments or over time. |
| Simpson's Paradox | A phenomenon where a trend present in aggregated data reverses or disappears when the data is broken into subgroups. |
| IQR (Interquartile Range) | The difference between the 75th and 25th percentiles; used to define outlier boundaries as values beyond 1.5 × IQR from Q1/Q3. |

---

## Task Block (Core / Stretch / Expert)

### Data Migration Thread (Days 22–24B): Arrays → DataFrame Pipelines → Insight Readiness

### Core

- Complete a business-first EDA checklist on a Pandas dataset from Day 24.
- Produce a 1-page EDA memo with findings, risks, and actions.

### Stretch

- Compare optional `ydata-profiling` output against your manual Pandas checks.
- Reconcile at least two differences and explain which method you trust more.

### Expert

- Design a reusable `run_eda(df, kpi, segments)` utility returning a dictionary of profile, risk flags, and memo-ready summaries.
- Include explicit guardrails for leakage, sparse segments, and unstable correlations.

## Common Grading Rubric (applies every day)

| Criterion | 1 - Emerging | 2 - Developing | 3 - Proficient | 4 - Strong |
|---|---|---|---|---|
| Correctness | Major logic errors; results frequently wrong. | Core path works but multiple inaccuracies remain. | Outputs are correct for expected inputs and checked with examples. | Outputs are consistently correct, including tricky cases and clear verification. |
| Robustness | Breaks on minor input changes or missing values. | Handles some variation but fails on common edge cases. | Handles expected edge cases with explicit guards/validation. | Gracefully handles unexpected data, with informative failures and recovery paths. |
| Readability | Hard to follow; unclear naming/structure. | Partially clear but inconsistent style or organization. | Clear naming, structure, and comments/docstrings where needed. | Highly readable, well-organized, and easy for teammates to extend quickly. |
| Reuse | One-off script with duplicated logic. | Some modularization, limited reuse. | Reusable functions/classes with sensible boundaries. | Well-factored components with clean interfaces and minimal duplication. |
