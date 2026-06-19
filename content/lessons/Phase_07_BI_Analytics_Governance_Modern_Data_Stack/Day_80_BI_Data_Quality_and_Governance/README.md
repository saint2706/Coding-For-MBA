---
day: 80
title: "BI Data Quality & Governance"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "data-governance"
duration: 120
difficulty: "advanced"
tags:
  - data-quality
  - governance
  - lineage
  - stewardship
concepts:
  - "The 6 Dimensions of Data Quality"
  - "Data Stewardship (Owners vs Custodians)"
  - "Data Lineage (Source to Target)"
  - "The Data Catalog"
prerequisites:
  - "Understanding of Databases (Day 73)"
  - "Experience with 'Bad Data' (Pain)"
outcomes:
  - "Audit a dataset for quality"
  - "Define 'Who Owns This Data?'"
  - "Implement Automated Quality Testing"
---

# 🎯 Day 80: BI Data Quality & Governance

> *"Garbage In, Garbage Out. But in BI, it's Garbage In, Executive Decision Out, Bankruptcy In."*

---

## The "Never-Coded" Bridge

**The Library vs. The Dumpster**

* **The Dumpster (Ungoverned Data)**: A massive pile of books.
  * Find "Harry Potter"? Takes 3 years.
  * Is pages 40-50 missing? Who knows.
  * Who put this here? Shrug.

* **The Library (Governed Data)**:
  * **Catalog**: You look up "Harry Potter" -> Aisle 4, Shelf B.
  * **Quality**: Librarians check for torn pages.
  * **Stewardship**: If Aisle 4 is messy, Librarian Susan is responsible.

**Governance** is simply adding Librarians (Stewards) and a Card Catalog (Metadata) to your data dumpster.

---

## The Technical Deep Dive

### 1. The 6 Dimensions of Data Quality

1. **Completeness**: Is `Customer_Email` filled in? (No NULLs).
2. **Uniqueness**: Is the same customer listed twice? (Duplicates).
3. **Accuracy**: Does `Age = 200`? (Real-world validity).
4. **Consistency**: Does `Sales` in Tableau match `Revenue` in Finance?
5. **Timeliness**: Is the data from today or last month?
6. **Validity**: Does `State` allow "Texas" and "TX"? (Format).

### 2. Data Lineage

Tracing the path of data.

* **Source**: SQL Table `raw_sales`.
* **Transform**: dbt Model `clean_sales` (removes refunds).
* **Consumption**: Tableau Dashboard `Executive_Summary`.
* *Why?*: If the Dashboard is wrong, you trace back up the line to find the root cause. ("Aha, the raw_sales table stopped updating!").

### 3. Automated Data Testing (Great Expectations)

Stop checking data manually. Write tests.

* `expect_column_values_to_be_unique(id)`
* `expect_column_values_to_be_between(age, 0, 120)`
* If test fails -> **Block the Pipeline**. Don't let bad data reach the CEO.

### 4. Validation Rules vs. Data Tests vs. Monitoring vs. Reconciliation vs. Business Controls

These five terms are often used interchangeably, but each catches a *different* failure and runs at a *different point* in the lifecycle. Confusing them is how teams end up with five tools and zero confidence.

| Mechanism | What it checks | Where it runs | Example | When it fires |
| :--- | :--- | :--- | :--- | :--- |
| **Validation Rule** | A single row/field against a known constraint | At the point of entry (app form, API, ingestion) | `age > 0`, `email LIKE '%@%'` | Before bad data even lands |
| **Data Test** | A table-level expectation, run on a schedule or per-pipeline-run | Inside the pipeline (dbt test, Great Expectations) | `unique(customer_id)`, `not_null(email)` | After load, before the model/dashboard reads it |
| **Monitoring** | Statistical drift over time — is *today* weird compared to history? | Continuously, on a running system | Row count drops 90% overnight | Hours after the anomaly starts |
| **Reconciliation** | Does System A's number match System B's number? | Periodic batch comparison | BI `SUM(revenue)` vs. Finance GL total | Daily/weekly close |
| **Business Control** | Is the *decision* made from the data sane, regardless of data correctness? | Human/process layer, often the last line of defense | "No discount > 50% without VP sign-off" | At the point of action |

**Senior framing**: validation rules and data tests are deterministic and catch *known* failure modes. Monitoring catches *unknown* failure modes (the things nobody wrote a rule for). Reconciliation catches *cross-system* failure modes (the pipeline can pass every test and still disagree with Finance). Business controls catch *correct-data-wrong-decision* failure modes — the data was fine, but the process around it wasn't. A mature governance program runs all five; relying on only one (usually "we have some dbt tests") leaves three categories of failure invisible until a VP asks why the board deck doesn't match the GL.

---

## Governance Operating Model

A "6 Dimensions" checklist tells you data is bad. It doesn't tell you **who fixes it, who approves access to it, or who is on the hook when regulators ask "where did this number come from?"** That's the operating model.

### Roles: Owners, Stewards, and Custodians

| Role | Who | Responsibility | BrightCart Example |
| :--- | :--- | :--- | :--- |
| **Data Owner** | A business executive accountable for the domain | Defines what the data *should* mean, approves access policy, owns the budget for fixing it | VP of CX owns the definition of `customers` and `churn` |
| **Data Steward** | A subject-matter expert embedded in the business | Day-to-day quality, definitions, and triage; the "librarian" for one shelf | Senior CRM Analyst stewards the `customers` table |
| **Data Custodian** | A platform/data engineer | Implements technical controls — encryption, backups, pipeline execution, access provisioning | Data Platform team custodies the warehouse itself |

The Owner is *accountable* (one throat to choke); the Steward is *responsible* for the daily grind; the Custodian *executes* the technical implementation. Confusing "Owner" with "Custodian" is the single most common governance failure — IT ends up accountable for business logic it didn't write and can't approve.

### Data Catalog & Classification

A **data catalog** is the searchable inventory of what data exists, where it lives, who owns it, and how sensitive it is. At minimum, every BrightCart table needs a catalog entry with:

* **Classification tier** — `Public` / `Internal` / `Confidential` / `Restricted` (e.g., `customers.email` is Restricted PII; `products.category` is Public).
* **Lineage pointer** — link to the upstream source and downstream consumers (dashboards, models).
* **Owner + Steward** — named individuals, not just team names ("the analytics team" is not accountable; Priya Shah is).
* **Retention policy** — how long the data is kept and why (see below).

### Access Approvals

Access to `Restricted` data (PII like `customers.email`, payment data) should never be self-service. The standard pattern is a **request -> approval -> time-boxed grant -> periodic re-certification** flow:

1. Analyst requests read access to `customers.email` for a churn campaign.
2. Data Owner (VP of CX) or delegated Steward approves, with a stated business reason.
3. Access is granted for a fixed window (e.g., 90 days) — not "forever."
4. Quarterly access review revokes anything no longer justified.

### Retention & Privacy

* **Retention policy**: "Why do we still have 7-year-old clickstream data with PII in it?" is the question that turns into a regulatory fine. Define retention per classification tier (e.g., Restricted PII: 24 months post-relationship-end, then anonymize or delete) and **automate** the deletion — manual retention policies don't get executed.
* **Privacy by design**: minimize collection, mask/tokenize PII in non-production environments, and document the *legal basis* for holding it (consent, contract, legitimate interest).

### Policy-as-Code & Audit Evidence

Modern governance doesn't live in a PDF nobody reads — it lives in version-controlled code that *enforces itself*:

* **Policy-as-code**: access rules, classification tags, and retention windows defined in tools like dbt's `meta` tags, Open Policy Agent, or warehouse-native row/column-level security — so policy changes go through the same PR review as application code.
* **Audit evidence**: every access grant, policy change, and test failure should be logged immutably. When an auditor or regulator asks "who could see customer emails on March 3rd, and why," the answer should be a query, not a Slack archaeology project.

---

## Data Observability & Incident Response

Data tests catch failures you anticipated. **Data observability** catches the ones you didn't — it continuously watches the *shape* of your data, not just specific rules.

### The Anomaly Types

| Anomaly Type | What changed | BrightCart Example |
| :--- | :--- | :--- |
| **Freshness** | Data arrived later than expected, or not at all | `orders` table hasn't updated in 14 hours (normally hourly) |
| **Volume** | Row counts spike or collapse unexpectedly | Daily `order_items` load drops from ~50,000 rows to 200 rows |
| **Schema** | Columns added, removed, renamed, or type-changed upstream without notice | `acquisition_channel` silently becomes `acq_channel` after a source-system update |
| **Distribution** | Values drift outside the normal statistical range | `unit_price` average jumps from $45 to $4,500 (a currency unit bug) |

### SLOs and SLAs for Data

* **SLA (Service Level Agreement)**: the externally-promised commitment — "The Executive Revenue Dashboard will reflect data no more than 24 hours old, 99% of business days." This is the promise made *to* stakeholders.
* **SLO (Service Level Objective)**: the internal engineering target that, if met, keeps the SLA true — "The `orders` pipeline completes by 6 AM ET with < 0.1% row-level test failures." This is the target the data team manages *against*.

### Incident Response Workflow

1. **Detect** — an observability tool or test fails (e.g., freshness SLO breached on `orders`).
2. **Triage** — assign severity (Sev1: exec dashboard wrong/down; Sev3: a rarely-used report is stale) and route to the on-call data engineer.
3. **Contain** — block the dashboard/model from showing the bad data (better an honest "Data Delayed" banner than a wrong number).
4. **Root-cause** — trace lineage upstream: was it a source API outage, a schema change, or a bad deploy?
5. **Remediate** — fix the root cause, backfill affected data, re-run downstream jobs.
6. **Postmortem** — a blameless written record: what broke, why monitoring didn't catch it sooner (or did), and what test/observability check is being added so this *specific* failure can't recur silently again.

---

## Senior-Level Insights

### "Bad Data is a Virus"

* If a chart is wrong **once**, the CEO stops trusting it.
* If it's wrong **twice**, the CEO stops trusting **you**.
* **Lesson**: It is better to show *No Data* (and an error message) than *Wrong Data*. Break the dashboard intentionally if quality fails.

### The "Data Dictator" vs "Data Anarchy"

* **Dictatorship**: "You cannot create a spreadsheet without approval." (Too slow).
* **Anarchy**: "Everyone makes their own definition of 'Churn'." (Chaos).
* **Federated Governance**: Central team defines Core Metrics (Revenue, Churn). Local teams define Local Metrics (Feature Usage).

---

## Hands-on Lab: The BrightCart Customer Extract

**BrightCart** is our running example for Phase 7 — a mid-size DTC e-commerce company selling outdoor/sporting goods via web, mobile app, and a marketplace channel. Today, the BI team pulled a fresh extract of `customers` for a churn-marketing campaign. It is, to put it gently, a mess. This is the dataset and test environment for the full lab below.

### The Flawed Extract

`customers_extract.csv` (BrightCart CRM export, 2026-06-19):

| customer_id | signup_date | region | acquisition_channel | email |
| :--- | :--- | :--- | :--- | :--- |
| 1001 | 2024-03-12 | West | paid_search | maria.chen@example.com |
| 1002 | 2024-03-15 | west | Paid_Search | j.kumar@example.com |
| 1003 |  | East | organic | not-an-email |
| 1004 | 2024-04-01 | East | organic | sam.t@example.com |
| 1004 | 2024-04-01 | East | organic | sam.t@example.com |
| 1005 | 2023-01-09 | South | referral |  |
| 1006 | 2099-01-01 | North | paid_social | l.diaz@example.com |
| 1007 | 2024-05-20 | West | paid_search | maria.chen@example.com |

What's wrong, mapped to the 6 Dimensions:

* **Completeness**: row 1003 has no `signup_date`; row 1005 has no `email`.
* **Uniqueness**: row 1004 is an exact duplicate (same `customer_id` twice).
* **Validity**: row 1003's email (`not-an-email`) doesn't match an email pattern.
* **Accuracy**: row 1006's `signup_date` (`2099-01-01`) is in the future — impossible.
* **Consistency**: row 1001 and row 1002 both encode "West" / "paid_search" but with inconsistent casing (`west`/`Paid_Search` vs `West`/`paid_search`) — these will be counted as different segments in a naive `GROUP BY`.
* **Timeliness**: row 1005's `signup_date` is from 2023 with no recent activity columns — is this customer still active, or is the extract stale? (Flag for the steward, not resolvable from this table alone.)
* **Bonus — duplicate person, different ID**: row 1001 and row 1007 share the same email (`maria.chen@example.com`) under two different `customer_id` values — a likely double-signup that will inflate customer counts.

### Exercise 1: Profiling the Extract

**Goal**: Before writing a single test, profile the data to find the shape of the problem.

```python
import pandas as pd
import io

raw_csv = """customer_id,signup_date,region,acquisition_channel,email
1001,2024-03-12,West,paid_search,maria.chen@example.com
1002,2024-03-15,west,Paid_Search,j.kumar@example.com
1003,,East,organic,not-an-email
1004,2024-04-01,East,organic,sam.t@example.com
1004,2024-04-01,East,organic,sam.t@example.com
1005,2023-01-09,South,referral,
1006,2099-01-01,North,paid_social,l.diaz@example.com
1007,2024-05-20,West,paid_search,maria.chen@example.com
"""

df = pd.read_csv(io.StringIO(raw_csv))

profile = {
    "row_count": len(df),
    "duplicate_customer_ids": df["customer_id"].duplicated().sum(),
    "null_signup_date": df["signup_date"].isna().sum(),
    "null_email": df["email"].isna().sum(),
    "duplicate_emails": df["email"].dropna().duplicated().sum(),
    "future_signup_dates": (pd.to_datetime(df["signup_date"], errors="coerce") > pd.Timestamp.today()).sum(),
}
print(profile)
```

**Expected output:**

```text
{'row_count': 8, 'duplicate_customer_ids': 1, 'null_signup_date': 1, 'null_email': 1, 'duplicate_emails': 1, 'future_signup_dates': 1}
```

### Exercise 2: Implementing the Tests (SQL + Python)

**Goal**: Convert each profiling finding into a re-runnable, pass/fail test — the kind that would run in CI on every pipeline load.

```sql
-- Test 1: Uniqueness — fails if any customer_id appears more than once
SELECT customer_id, COUNT(*) AS n
FROM customers
GROUP BY customer_id
HAVING COUNT(*) > 1;
-- Expected (on raw extract): 1 row -> (1004, 2)   => TEST FAILS

-- Test 2: Completeness — fails if required fields are null
SELECT customer_id
FROM customers
WHERE signup_date IS NULL OR email IS NULL;
-- Expected (on raw extract): 2 rows -> (1003, 1005) => TEST FAILS

-- Test 3: Validity — fails if email doesn't match a basic email pattern
SELECT customer_id, email
FROM customers
WHERE email IS NOT NULL AND email NOT LIKE '%_@_%._%';
-- Expected (on raw extract): 1 row -> (1003, 'not-an-email') => TEST FAILS

-- Test 4: Accuracy — fails if signup_date is in the future
SELECT customer_id, signup_date
FROM customers
WHERE signup_date > CURRENT_DATE;
-- Expected (on raw extract): 1 row -> (1006, '2099-01-01') => TEST FAILS
```

```python
# The equivalent assertions, written as a runnable pytest-style suite
def test_uniqueness(df):
    dupes = df["customer_id"][df["customer_id"].duplicated()]
    assert dupes.empty, f"Duplicate customer_id(s): {dupes.tolist()}"

def test_completeness(df):
    bad = df[df["signup_date"].isna() | df["email"].isna()]
    assert bad.empty, f"Incomplete rows: {bad['customer_id'].tolist()}"

def test_validity_email(df):
    pattern = df["email"].str.contains(r"^[^@]+@[^@]+\.[^@]+$", na=True, regex=True)
    bad = df.loc[~pattern, "customer_id"]
    assert bad.empty, f"Invalid emails for: {bad.tolist()}"

def test_accuracy_future_dates(df):
    future = df[pd.to_datetime(df["signup_date"], errors="coerce") > pd.Timestamp.today()]
    assert future.empty, f"Future signup_date for: {future['customer_id'].tolist()}"

# Running these against the raw extract above:
# test_uniqueness        -> FAILS: Duplicate customer_id(s): [1004]
# test_completeness      -> FAILS: Incomplete rows: [1003, 1005]
# test_validity_email    -> FAILS: Invalid emails for: [1003]
# test_accuracy_future_dates -> FAILS: Future signup_date for: [1006]
```

### Exercise 3: RACI for the Incident

**Goal**: Four tests just failed on a production extract feeding a paid marketing campaign. Who does what?

| Role | RACI | Person/Team | Action |
| :--- | :--- | :--- | :--- |
| **Responsible** | R | CRM Data Analyst | Runs the test suite, files the incident ticket with the 4 failing rows attached |
| **Accountable** | A | VP of Customer Success (Data Owner for `customers`) | Decides whether the campaign launch is delayed until data is clean |
| **Consulted** | C | CRM Platform Engineer (Data Custodian) | Confirms whether this is a source-system bug (e.g., a broken signup form allowing future dates) |
| **Consulted** | C | Data Steward (Senior CRM Analyst) | Defines the remediation rule (e.g., "dedupe on email when customer_id differs") |
| **Informed** | I | Marketing Campaign Manager | Told the campaign send is held pending a clean extract |

### Exercise 4: Triage and Remediation

**Goal**: Turn the failing tests into a remediation plan with an expected passing result.

| Issue | Triage Severity | Remediation | Expected Result After Fix |
| :--- | :--- | :--- | :--- |
| Duplicate `customer_id` 1004 | Sev2 (inflates counts) | `DROP` exact duplicate rows, keep one | `duplicate_customer_ids` = 0 |
| Null `signup_date` (1003) | Sev3 (can't compute tenure) | Route to Steward for manual lookup in source CRM; if unrecoverable, flag row as `quarantined` | `null_signup_date` = 0 (or row excluded with audit note) |
| Null `email` (1005) | Sev2 (campaign can't reach this customer) | Exclude from this campaign's send list; do not delete the row | Row remains in table, excluded from campaign extract |
| Invalid email `not-an-email` (1003) | Sev2 | Same as above — quarantine from outbound send, steward to correct at source | `null_email`/invalid count = 0 in the campaign-ready view |
| Future `signup_date` 2099-01-01 (1006) | Sev1 (signals a broken source control — could affect *all* new signups) | Escalate to Custodian immediately; check the signup form's date validation | `future_signup_dates` = 0; root cause filed as a separate incident |
| Casing inconsistency (`West`/`west`, `paid_search`/`Paid_Search`) | Sev3 | Add a normalization step (`LOWER(TRIM(region))`) in the transform layer, not a one-off fix | All region/channel values normalized to a single casing convention |

**Expected output after remediation**, re-running the Exercise 1 profile on the cleaned extract:

```text
{'row_count': 6, 'duplicate_customer_ids': 0, 'null_signup_date': 0, 'null_email': 0, 'duplicate_emails': 0, 'future_signup_dates': 0}
```

(Row count drops from 8 to 6: the exact duplicate is merged, and the unrecoverable null-`signup_date` row is quarantined pending steward review — quarantined rows are tracked separately, not silently deleted.)

---

## Mastery Check

### Question 1: Uniqueness

Why are duplicate rows dangerous in aggregation (SUM)?
A) They look ugly.
B) They double-count revenue (Inflate numbers).
C) They crash the database.
D) They are fine.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Double-counting is the #1 reason data numbers don't match Finance numbers.
</details>

### Question 2: Lineage

If a dashboard breaks, what helps you find the upstream cause?
A) Data Lineage.
B) Data Dictionary.
C) Data Lake.
D) Guessing.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Lineage visualizes the dependency graph.
</details>

### Question 3: Timeliness

What is "Data Latency"?
A) The speed of the internet.
B) The time lag between an event happening (Real World) and it appearing in the Dashboard.
C) The time it takes to read a dashboard.
D) The time it takes to hire an analyst.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Low latency (Real-time) is expensive. High latency (Daily) is standard.
</details>

### Question 4: Stewardship

Who is typically the "Data Steward"?
A) The IT Guy.
B) The CEO.
C) A Subject Matter Expert (SME) in the business domain who understands what the data *means*.
D) The Database.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Marketing Manager owns Marketing Data definitions.
</details>

### Question 5: Validity

The state code column contains "ZZ". Is this valid?
A) Yes.
B) No, "ZZ" is not a US State.
C) Maybe.
D) Who cares.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It fails validity checks against a reference list of States.
</details>

---

## Cross-References

* Phase 7 Day 73 — BI SQL & Databases (the query skills used to write the data tests in this lab).
* Phase 7 Day 81 — BI Architecture & Data Modeling (governed, quality-checked sources become the inputs to the star schema built there).
* Phase 7 Day 82 — BI ETL & Pipeline Automation (operationalizes these tests as automated quality gates inside a running pipeline, not one-off scripts).
* Phase 7 Day 83 — BI Cloud & Modern Data Stack (catalog, lineage, and access-control tooling at the platform level).
* Phase 6 Day 67 — Model Monitoring & Reliability (the ML-side sibling of data observability: drift, SLOs, and incident runbooks for models instead of tables).

## Glossary

* **Completeness**: Whether required fields are populated (no unexpected NULLs).
* **Uniqueness**: Whether each real-world entity appears exactly once (no duplicate IDs/rows).
* **Validity**: Whether a value conforms to an expected format or domain (e.g., a real email pattern).
* **Timeliness**: Whether data reflects a recent enough state of the world for its intended use.
* **Consistency**: Whether the same fact is represented the same way across rows, tables, or systems.
* **Accuracy**: Whether a value correctly reflects reality (not just well-formatted, but *true*).
* **Lineage**: The traceable path data takes from source system through transformations to final report.
* **Steward**: The subject-matter expert responsible for day-to-day data quality and definitions in their domain.
* **Owner**: The accountable executive who defines what the data should mean and approves access/policy.
* **RACI**: A responsibility framework (Responsible, Accountable, Consulted, Informed) used to assign governance roles.
* **Data Observability**: Continuous, automated monitoring of data's freshness, volume, schema, and distribution for unexpected anomalies.
* **SLO/SLA**: An SLO is an internal engineering target; an SLA is the external commitment made to stakeholders that the SLO is designed to support.

## Summary

Today you learned:

* ✅ **6 Dimensions**: The checklist for "Is this data good?"
* ✅ **Lineage**: The map of your data pipeline.
* ✅ **Stewardship**: People, not tools, fix data quality.
* ✅ **RACI**: Who is Accountable when the number is wrong?
* ✅ **Governance Operating Model**: Owners, stewards, custodians, catalogs, classification, and access approvals working together.
* ✅ **Data Observability**: Catching the anomalies nobody wrote an explicit rule for.

**Tomorrow**: We begin architecting the system in **BI Architecture & Data Modeling**.
