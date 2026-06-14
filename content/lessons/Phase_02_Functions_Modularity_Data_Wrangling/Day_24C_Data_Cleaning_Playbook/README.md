---
day: "24C"
title: "Data Cleaning Playbook"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "data-cleaning-playbook"
duration: 60
difficulty: "intermediate"
tags: [python, pandas, data-cleaning, data-quality]
concepts:
  [profiling checklist, null-handling strategy, duplicate resolution, type coercion, validation assertions]
prerequisites: [23, 24, "24B"]
outcomes:
  [Run a repeatable cleaning workflow, Choose null/duplicate actions with business context, Validate datasets before and after transforms]
---

# 🎯 Day 24C: Data Cleaning Playbook

> *"Cleaning is not a one-time fix. It's an operational process with explicit decisions and checks."*

---

## The "Never-Coded" Bridge

In most MBA projects, analysis fails for one reason: hidden data quality problems.

- Dates parse in one file but fail in another
- IDs are duplicated with conflicting records
- Missing values are handled inconsistently
- Numeric columns silently become text

This playbook gives you a **repeatable and idempotent** workflow you can run before every analysis or dashboard. **Idempotent** means that running the cleaning script once produces the same output as running it 10 times — no side-effects accumulate, no records are double-dropped, and no columns are double-imputed. Idempotency is essential for production pipelines where the same data may be reprocessed due to failures or schedule re-runs.

---

## Step 1) Profiling Checklist (Always First)

Run this checklist before editing values:

### Structural checks

- Row count and column count match expectation
- Column names are unique and meaningful
- Key columns (e.g., `customer_id`, `order_id`) exist

### Type and parse checks

- `df.dtypes` matches intended schema
- Numeric columns contain only numeric-like values
- Date columns parse cleanly under an explicit format

### Completeness checks

- Missingness by column (`isna().mean()`)
- Missingness by critical segment (region/channel/source)
- Required fields have acceptable null rates

### Integrity checks

- Primary key uniqueness (`duplicated(subset=[...])`)
- Referential consistency across joins (if multiple tables)
- Domain constraints (e.g., age >= 0, probability in [0,1])

```python
import pandas as pd

df = pd.read_csv(
    "content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/extras/sample_customers_dirty.csv"
)

profile = pd.DataFrame(
    {
        "dtype": df.dtypes.astype(str),
        "missing_pct": df.isna().mean().mul(100).round(2),
        "n_unique": df.nunique(dropna=True),
        "sample": df.apply(lambda s: ", ".join(s.dropna().astype(str).head(3)), axis=0),
    }
)
print(profile)
print("Duplicate customer_id rows:", df.duplicated(subset=["customer_id"]).sum())
```

---

## Step 2) Null Handling Decision Tree

Use a decision tree instead of defaulting to `fillna(0)`.

```text
Is the column required for the business decision?
├─ No → Keep nulls, flag in documentation, continue.
└─ Yes
   ├─ Is missingness < 5% and random? (5% is a common governance threshold — the materiality argument: if fewer than 1 in 20 rows are affected and the missing pattern appears random, dropping them is unlikely to introduce bias. Adjust this threshold based on your sample size and how critical the column is to the decision.)
   │  ├─ Yes → Drop affected rows (if sample size remains sufficient).
   │  └─ No
   ├─ Can value be safely imputed from business logic?
   │  ├─ Yes → Impute (median/mode/rules), add "imputed_*" flag.
   │  └─ No
   └─ Escalate: collect source fix or exclude metric from decision.
```

### Null Strategy Matrix (Decision Governance Template)

Use this table to make null handling explicit, reviewable, and auditable across teams.

| column | business criticality (high/medium/low) | missing % | strategy | rationale | owner |
|---|---|---:|---|---|---|
| customer_id | high | 0.2% | drop rows | Primary key cannot be null; low rate makes row drop acceptable | Data Engineering |
| lifetime_value | medium | 12.8% | median impute + flag | Needed for segmentation, but nulls are moderate and likely recoverable | Analytics |
| campaign_source | low | 31.5% | keep null | Not required for current KPI decision; monitor for future attribution use | Marketing Ops |

> Tip: treat this matrix as a living artifact. Update it whenever business use-cases or source systems change.

### Practical policy example

```python
# Example policy
required = ["customer_id", "signup_date", "email"]
optional = ["lifetime_value"]

# Required fields: drop rows with nulls
clean = df.dropna(subset=required).copy()

# Optional numeric: median imputation + indicator
clean["lifetime_value_imputed"] = clean["lifetime_value"].isna().astype(int)
clean["lifetime_value"] = clean["lifetime_value"].fillna(clean["lifetime_value"].median())
```

---

## Step 3) Duplicate & Entity Resolution Basics

Duplicates are rarely just exact row repeats. Common patterns:

- Same `customer_id` appears multiple times
- Same email appears with different casing/spaces
- Same person appears with small text variations

### Minimum viable entity resolution flow

1. Standardize string keys (`strip`, `lower`)
2. Detect exact duplicate IDs
3. Detect probable duplicates by email/phone
4. Decide rule: keep latest, highest confidence, or merge fields

```python
clean["email_norm"] = clean["email"].str.strip().str.lower()
clean["updated_at"] = pd.to_datetime(clean["updated_at"], errors="coerce")

# Keep latest record per customer_id
clean = (
    clean.sort_values("updated_at")
    .drop_duplicates(subset=["customer_id"], keep="last")
)
```

### Duplicate Conflict Resolution Policy

When duplicate records disagree, apply tie-break rules in this order:

1. **Latest timestamp wins**
   - Prefer the row with the most recent trusted `updated_at` or ingestion timestamp.
2. **Trusted source ranking**
   - If timestamps are tied/missing, choose based on source reliability (example: `crm` > `billing` > `marketing_upload`).
3. **Field-level merge precedence**
   - If neither rule fully resolves the conflict, merge by column-level precedence (example: contact fields from `crm`, revenue fields from `billing`).
   - Record merged fields in a change log to preserve lineage.

If conflicts remain unresolved after these rules, quarantine affected records and escalate to data governance owner before analysis.

---

## Step 4) Type Coercion + Date Parsing Failure Handling

Never trust inferred types for operational pipelines.

### Numeric coercion with error audit

```python
for col in ["age", "lifetime_value"]:
    clean[f"{col}_raw"] = clean[col]
    clean[col] = pd.to_numeric(clean[col], errors="coerce")

bad_age_rows = clean[clean["age"].isna() & clean["age_raw"].notna()]
print("Rows with failed age coercion:", len(bad_age_rows))
```

### Date parsing with explicit format + fallback

```python
clean["signup_date_raw"] = clean["signup_date"]
clean["signup_date"] = pd.to_datetime(
    clean["signup_date"],
    format="%Y-%m-%d",
    errors="coerce",
)

failed_dates = clean[clean["signup_date"].isna() & clean["signup_date_raw"].notna()]
print("Date parse failures:", len(failed_dates))
```

If failures are material, stop downstream analysis and escalate source formatting rules.

---

## Step 5) Validation Assertions Before/After Transforms

Assertions turn assumptions into executable guardrails.

### Before transform (raw input contract)

```python
assert "customer_id" in df.columns
assert df.shape[0] > 0
assert df["customer_id"].notna().all(), "Missing customer IDs in raw feed"
```

### After transform (clean output contract)

```python
assert clean["customer_id"].is_unique, "Customer IDs must be unique"
assert clean["email"].str.contains(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", na=False).all(), "Invalid emails remain"
assert clean["signup_date"].notna().all(), "Unparsed signup_date values remain"
assert clean["age"].between(0, 120).all(), "Age out of range"
```

Treat assertion failures as data-quality incidents, not minor warnings.

### Quality Gates (Severity-Based)

Map assertion outcomes to severity so teams know when to block vs continue.

| Severity | Gate rule | Assertion outcome example | Action |
|---|---|---|---|
| P0 (block) | Hard contract violated | `customer_id` not unique, required dates unparsed, row count = 0 | Stop pipeline, open incident, no dashboard refresh |
| P1 (warn) | Material but tolerable degradation | Email validity drops below threshold (e.g., < 98% — a business threshold chosen because more than 2 in 100 invalid emails would meaningfully impair deliverability and attribution), null rate exceeds policy by small margin | Continue with warning, notify owner, create remediation ticket |
| P2 (monitor) | Minor drift/trend change | Parse failure rate increases but stays under warning threshold | Log metric to quality dashboard and review weekly |

Example implementation idea:

- `assert` for **P0** checks (must pass).
- Conditional checks that emit warnings for **P1**.
- Time-series metric logging for **P2**.

---

## Hands-on Lab: Clean the Dirty Customer File

**Business scenario:** You are preparing a customer dataset for a churn-prediction model. The raw CSV from the CRM export contains formatting inconsistencies, duplicates, and missing values. You must produce a clean, validated dataset before handing it off to the data science team.

Use this file from extras:

`content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/extras/sample_customers_dirty.csv`

**Sample data characteristics (what you will find):**
- ~200 rows with 8 columns: `customer_id`, `name`, `email`, `age`, `signup_date`, `lifetime_value`, `campaign_source`, `updated_at`
- ~15% missing `lifetime_value`
- ~5 duplicate `customer_id` rows with conflicting records
- Some `age` values as strings ("thirty-two") instead of integers
- Mixed date formats in `signup_date` ("2024-01-15" and "Jan 15 2024")
- Several rows with invalid email formats (missing "@" or domain)

### Your tasks

1. Build a profile table (`dtype`, `missing_pct`, `n_unique`, sample values)
2. Apply the null decision tree and document each decision in the Null Strategy Matrix
3. Resolve duplicate `customer_id` records using the conflict resolution policy
4. Coerce numeric/date fields and capture parse failures
5. Write 5+ assertions that must pass before analysis

### Expected output (sample profile table format)

```
                 dtype  missing_pct  n_unique
customer_id      object         0.2       195
name             object         0.0       195
email            object         0.0       195
age              object         5.1       162
signup_date      object         0.0        45
lifetime_value  float64        14.9       195
campaign_source  object        31.5         4
updated_at       object         0.0       195

Duplicate customer_id rows: 5
```

### Expected output (assertions block)

```python
# These must all pass on your clean output
assert clean["customer_id"].is_unique
assert clean["email"].str.contains(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", na=False).all()
assert clean["signup_date"].notna().all()
assert clean["age"].between(0, 120).all()
assert clean["lifetime_value"].notna().all()
print("✅ All 5 validation assertions passed")
```

### Output deliverables

- `clean_customers.csv`
- `cleaning_decisions.md` (short rationale log)
- `validation_report.md` (passed/failed checks)
- `data_quality_decisions.md` (null/duplicate policies chosen, quality gate thresholds, and unresolved risks)

➡️ After this playbook, you are ready for Phase 3 visualization and pipeline automation with much lower risk.

---

## Mastery Check

### Question 1: Null Handling Strategy
When would you choose to impute a missing value rather than drop the row?

<details>
<summary>Click for Answer</summary>

Impute when:
- The column is required for the downstream decision and dropping rows would reduce sample size below acceptable levels.
- Missingness is NOT random (e.g., concentrated in one segment) — dropping would bias results.
- A sensible business rule or statistical method (median, mode, forward-fill) can produce a defensible substitute.

Always add an `_imputed` indicator column so downstream consumers know which values were filled.

</details>

---

### Question 2: Idempotency
What does it mean for a cleaning script to be idempotent, and why does it matter?

<details>
<summary>Click for Answer</summary>

An idempotent script produces the same output regardless of how many times it is run on the same input. It matters because production pipelines are often re-run after failures, schedule misses, or data refreshes. If a script isn't idempotent, repeated runs could double-drop rows, double-impute values, or accumulate duplicate records — making debugging extremely difficult.

Test for idempotency by running your cleaning script twice on the same input and comparing the outputs with `pd.testing.assert_frame_equal()`.

</details>

---

### Question 3: Threshold Decisions
A column has 12% missing values and is required for the KPI. The 5% drop threshold has been exceeded. What are your options?

<details>
<summary>Click for Answer</summary>

1. **Impute with business logic**: Use median (numeric) or mode (categorical) if the missing pattern appears random; add an imputation flag column.
2. **Segment-specific imputation**: If missingness is concentrated (e.g., one region), impute using that segment's distribution to avoid cross-segment bias.
3. **Escalate to data collection fix**: If the column is critical and imputation would be unreliable, file a data quality incident to fix the upstream source.
4. **Exclude from current analysis with documentation**: Report the limitation explicitly in the EDA memo and adjust confidence in KPI conclusions.

</details>

---

### Question 4: Validation Severity
When should a validation failure block a pipeline entirely versus emit a warning?

<details>
<summary>Click for Answer</summary>

Use the severity gate framework:
- **P0 (block)**: Violations of hard contracts — primary key not unique, required date columns unparsed, row count = 0. These indicate a fundamental data failure where downstream analysis would be meaningless or dangerous.
- **P1 (warn)**: Material but tolerable degradation — email validity below threshold, null rate slightly above policy. The pipeline can continue but the owner must be notified and a remediation ticket opened.
- **P2 (monitor)**: Minor drift that should be tracked — metric logging only, no immediate action.

The key principle: block when the error would make the analysis wrong; warn when it degrades quality but results remain usable with caveats.

</details>

---

## Glossary

| Term | Definition |
|------|------------|
| Imputation | The process of replacing missing values with a substitute (e.g., median, mean, or mode) based on the existing data distribution or business rules. |
| Coercion | Forcing a column to a target data type, e.g., converting string representations of numbers to `float64` with `pd.to_numeric()`. |
| Assertion | An executable check (`assert condition`) that halts execution if a data quality constraint is violated; treated as a P0 quality gate. |
| Entity Resolution | The process of identifying and merging records that refer to the same real-world entity despite minor differences in keys, spelling, or formatting. |
| Idempotent | A property of a script or function: running it multiple times on the same input always produces the same output with no accumulating side effects. |
| Null Strategy Matrix | A governance table documenting each column's criticality, missing rate, chosen handling strategy, rationale, and owner. |
| Quality Gate | A defined threshold or rule that determines whether a pipeline can proceed (pass) or must halt and alert (fail). |
| Parse Failure | An instance where type coercion cannot convert a value to the target type (e.g., converting `"thirty-two"` to integer); should be audited and escalated. |
| Deduplication | The process of identifying and removing duplicate records, typically keeping one canonical version per entity based on a conflict resolution policy. |
