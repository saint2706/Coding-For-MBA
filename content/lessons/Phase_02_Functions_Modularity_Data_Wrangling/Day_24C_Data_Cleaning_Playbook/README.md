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

This playbook gives you a repeatable, auditable workflow you can run before every analysis or dashboard.

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
   ├─ Is missingness < 5% and random?
   │  ├─ Yes → Drop affected rows (if sample size remains sufficient).
   │  └─ No
   ├─ Can value be safely imputed from business logic?
   │  ├─ Yes → Impute (median/mode/rules), add "imputed_*" flag.
   │  └─ No
   └─ Escalate: collect source fix or exclude metric from decision.
```

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

---

## Hands-on Lab: Clean the Dirty Customer File

Use this file from extras:

`content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/extras/sample_customers_dirty.csv`

### Your tasks

1. Build a profile table (`dtype`, `missing_pct`, `n_unique`, sample values)
2. Apply the null decision tree and document each decision
3. Resolve duplicate `customer_id` records
4. Coerce numeric/date fields and capture parse failures
5. Write 5+ assertions that must pass before analysis

### Output deliverables

- `clean_customers.csv`
- `cleaning_decisions.md` (short rationale log)
- `validation_report.md` (passed/failed checks)

➡️ After this playbook, you are ready for Phase 3 visualization and pipeline automation with much lower risk.
