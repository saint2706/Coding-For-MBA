---
day: 74
title: "BI Data Preparation & Tools"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "data-prep"
duration: 120
difficulty: "intermediate"
tags:
  - data-prep
  - power-query
  - dbt
  - cleaning
concepts:
  - "Extract Transform Load (ETL)"
  - "Unpivoting Data (Wide to Long)"
  - "Merging vs Appending"
  - "Handling Nulls and Errors"
prerequisites:
  - "Understanding of Tables (Rows/Cols)"
  - "Basic SQL (Day 73)"
outcomes:
  - "Normalize messy Excel files (Unpivot)"
  - "Combine multiple datasets (Merge/Append)"
  - "Clean dirty data programmatically"
---

# 🎯 Day 74: BI Data Preparation & Tools

> *"80% of data science is cleaning data. The other 20% involves complaining about cleaning data."*

---

## The "Never-Coded" Bridge

**Cooking: Mise en place vs. Chaos**

**Chaos**: You start cooking. You need onions. You chop them. You need garlic. You wash the knife. You chop garlic. You realize you forgot to buy carrots.

* **Result**: Dinner is late, kitchen is a mess.

**Mise en place (Data Prep)**:

* You wash, peel, chop, and measure *everything* into little bowls first.
* **Cooking (Analysis)**: You just dump bowls into the pan. Fast. Clean. Predictable.

**BI works the same way.**

* If you clean data *inside* your chart formula (`=SUM(IF(ISERROR(A1), 0, A1))`), your dashboard is slow and fragile.
* **Data Prep** means cleaning the ingredients *before* they touch the pan (BI Tool).

---

## The Technical Deep Dive

### 1. Unpivoting (The Most Important Skill)

Human beings like **Wide Data** (Pivot Tables):

| Product | Jan  | Feb  | Mar  |
| :------ | :--- | :--- | :--- |
| Apple   | 10   | 12   | 15   |
| Banana  | 20   | 22   | 25   |

Computers hate this. To calculate "Total Sales":

* `Sales = Jan + Feb + Mar...` (What if "Apr" is added? The formula breaks).

Computers need **Long Data** (Normalized):

| Product | Month | Sales |
| :------ | :---- | :---- |
| Apple   | Jan   | 10    |
| Apple   | Feb   | 12    |

**Unpivoting** transforms Wide -> Long. Now, `SUM(Sales)` works forever, even if you add 100 years of data.

### 2. Merging vs. Appending

* **Append (Vertical - Union)**: Stacking tables.
  * Jan Sales + Feb Sales = All Sales.
  * (Requires same column names).
* **Merge (Horizontal - Join)**: Connecting tables.
  * Sales Table + Products Table = Sales with Product Names.
  * (Requires a Key ID).

#### Decision Guide: Merge vs. Append

| Question                                              | Answer points to **Append**                  | Answer points to **Merge**                       |
| :------------------------------------------------------ | :---------------------------------------------- | :--------------------------------------------------- |
| Do the datasets share the same columns/structure?       | Yes — e.g., 12 monthly BrightCart order exports | No — e.g., `orders` + `products` have different columns |
| Are you adding more *rows* of the same kind of thing?    | Yes (more orders over time)                      | No                                                     |
| Are you adding more *columns*/context to existing rows?  | No                                                | Yes (adding `category` to each order line via `product_id`) |
| Is there a shared key to join on?                        | Not needed                                       | **Required** — Merge fails without one              |

### 3. Handling Errors: A Decision Framework

Blanket advice like "replace errors with 0" is how BrightCart ends up reporting that a store had "$0 in sales" on a day it was actually closed for a holiday — actively misleading, not just imprecise. Different *kinds* of missing/bad data need different treatments:

| Data Issue                              | What it means                                                              | Correct treatment                                                                 |
| :--------------------------------------- | :-------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| **Null** (truly unknown)                 | The value was never captured — e.g., a customer skipped an optional field   | Keep as `NULL`. Do *not* convert to 0 or "" — that fabricates a fact. Aggregates (`AVG`, `SUM`) already skip NULLs correctly. |
| **Invalid** (fails a business rule)      | The value exists but violates a constraint — e.g., `discount_pct = 1.5` (150%) | Quarantine the row for review; do not silently clip or guess. Log it as a data-quality incident. |
| **Unknown** (explicit "don't know")      | The value is intentionally "N/A" or "Unknown" — e.g., `acquisition_channel = 'Unknown'` | Keep as its own explicit category. Do not merge into an existing valid category (it would distort that category's stats). |
| **Not-applicable**                       | The field doesn't apply to this row — e.g., `return_reason` for a non-returned order | Leave NULL, but document *why* (a comment/data dictionary entry), so it isn't mistaken for missing data that needs fixing. |
| **Quarantine** (structurally broken)     | The row can't be parsed/typed at all — e.g., `unit_price = "ten dollars"` | Route to a quarantine table. Never load into the production table; never silently drop without a record. |
| **Imputation** (statistically estimated) | You have a defensible way to estimate the missing value — e.g., filling a missing `signup_date` with the date of a customer's first order | Only when business-justified and *documented* as an estimate (e.g., an `is_imputed` flag column) — never presented as a known fact. |
| **Escalation**                           | The issue is too consequential or ambiguous to resolve unilaterally — e.g., 30% of last week's orders missing `customer_id` | Stop and escalate to a data owner/analyst lead before loading. Some problems are organizational, not technical. |

**The questions to ask before touching a bad value**: *Do I know what this value should be? Does "0" mean something true, or am I inventing a fact? Will this decision change the conclusion a BrightCart manager draws from the dashboard?* If you can't answer confidently, quarantine and escalate — don't guess.

---

## Senior-Level Insights

### "Push Down" Logic

* **Best**: Clean data in the Database (SQL/dbt).
  * Why? It's reusable by everyone (Tableau user, Python user, Excel user).
* **Good**: Clean data in the BI Tool (Power Query/Tableau Prep).
  * Why? It's visual and fast for analysts.
* **Worst**: Clean data in the Visualization (Calculated Fields).
  * Why? It runs *every time* the user clicks. Slowest performance.

#### Decision Guide: Where (and With What) to Clean

| Factor                 | Power Query                              | SQL (dbt/warehouse)                          | Python (pandas)                              |
| :---------------------- | :----------------------------------------- | :--------------------------------------------- | :---------------------------------------------- |
| **Volume**              | Good up to ~1M rows; degrades beyond that  | **Best at scale** — warehouse engines handle billions of rows | Good up to a few million rows (memory-bound)     |
| **Repeatability**       | Manual unless scheduled via a Power BI refresh | **Best** — version-controlled dbt models re-run on every pipeline trigger | Good if scripted/scheduled (Airflow, cron); fragile if run ad hoc |
| **Governance**          | Harder to audit (logic lives inside .pbix files) | **Best** — SQL + dbt tests + git history = full lineage | Good with version control, but logic is more easily duplicated across notebooks |
| **User skill required** | **Lowest** — point-and-click, ideal for business analysts | Medium — requires SQL fluency | Highest — requires Python + pandas fluency |
| **Best fit**            | One-off or analyst-led cleanup of a single file | Recurring, governed, shared transformations everyone depends on | Complex logic (fuzzy matching, ML-based entity resolution) that SQL/Power Query can't express cleanly |

### The "Excel Trap"

Excel treats "Red Cell Color" as data. Databases do not.

* **Rule**: If it matters, it must be in a column (e.g., `status: urgent`), not a format (Red Fill).

### Profiling, Standardization, and Trust

Before you can clean data, you have to know *how* it's broken. This is **data profiling**: systematically checking each column's null rate, distinct-value count, min/max, and type-mismatch rate before writing a single transformation.

* **Type inference**: Power Query, pandas, and most ETL tools guess a column's type (text/number/date) from a sample of values. A `customer_id` column that's "101, 102, A-103" will be inferred as text the moment one alphanumeric ID appears — silently breaking any numeric join downstream. Always verify inferred types against the full column, not a sample.
* **Standardization**: Forcing inconsistent representations of the same fact into one form — `"USA"`, `"U.S.A."`, `"United States"` all become `"US"`; `"west"`, `"WEST"`, `" West "` all become `"West"`. Do this *before* grouping or joining, or you'll silently undercount.
* **Deduplication**: Removing exact or near-exact duplicate rows (e.g., the same `customer_id` appearing twice due to a failed ingestion retry — see Phase 7 Day 72). Exact-match dedup is easy (`DISTINCT`); near-duplicate dedup (two rows for "Jon Smith" and "John Smith") requires entity resolution.
* **Entity resolution**: Determining that two records with different spellings/formats refer to the *same real-world entity* (e.g., `"J. Smith"` and `"John Smith, jr."` might be the same BrightCart customer, or might not). This is probabilistic, not exact-match — it requires fuzzy matching on name/email/address combinations and a confidence threshold, with low-confidence matches routed to manual review.
* **Reconciliation**: Checking that a cleaned dataset's totals tie back to a trusted source — e.g., does `SUM(cleaned_orders.amount)` match the finance team's reported revenue for the month? Reconciliation is how you catch a cleaning step that accidentally dropped or duplicated rows.
* **Lineage**: A record of *where* each column/value came from and *what transformations* were applied to it, so when a number looks wrong, you can trace it back to its source instead of guessing.
* **Reproducibility**: The same input data, run through the same transformation logic, should always produce the same output. Click-based tools (Power Query, Excel) are harder to make reproducible than version-controlled code (SQL/dbt/Python) — this is part of why "Push Down" favors SQL for recurring pipelines.
* **Data-cleaning tests**: Just like application code, transformation logic should have tests — e.g., "after cleaning, `customers.email` must never be null," "after dedup, `customer_id` must be unique." dbt and Great Expectations both support this as first-class functionality.

---

## Hands-on Lab

All exercises use a deliberately dirty BrightCart fixture: nulls, typos, inconsistent casing, and duplicate IDs, exactly as they'd arrive from a real export.

**Dirty fixture: `customers_raw.csv`**

```csv
customer_id,signup_date,region,acquisition_channel
C-01,2026-01-15,West,paid_search
C-02,2026-02-03,west,Paid_Search
C-03,,East,organic
C-03,2026-02-20,East,organic
C-04,2026-03-01,EAST,Referral
C-05,2026-03-12,N/A,unknown
```

**Dirty fixture: `products_raw.csv`**

```csv
product_id,category,subcategory,cost,list_price
P-100,Tents,4-Person,120.00,250.00
P-200,footwear,Trail Runners,35,80.00
P-300,Backpacks,Daypack,,120.00
P-300,Backpacks,Daypack,45.00,120.00
P-400,Tents,2-Person,ten dollars,150.00
```

**Data-quality issues present** (identify these before cleaning): `customers.C-03` has a null `signup_date` *and* a duplicate row; `region` casing is inconsistent (`West`/`west`/`EAST`/`EAST`); `region = 'N/A'` is an explicit unknown, not a null; `products.P-300` is duplicated; `products.P-400.cost = 'ten dollars'` is a type-mismatch (text in a numeric column).

### Exercise 1: The Unpivot

**What/Why**: BrightCart's FP&A team exports quarterly budgets as a wide spreadsheet because that's how humans read it. Before it can power a dashboard's `SUM(Budget)` trend line, it must become long/tidy data — otherwise every new quarter requires rewriting the dashboard formula.

**Goal**: Normalize a "Human Friendly" BrightCart marketing-budget file.

**Input (Wide Strategy)**:

```txt
Region, Q1_Budget, Q2_Budget, Q3_Budget, Q4_Budget
North,  10000,     12000,     11000,     13000
South,  20000,     22000,     21000,     23000
```

**Task**: Convert to `[Region, Quarter, Budget]`.

**Path A — SQL**:

```sql
SELECT Region, 'Q1' as Quarter, Q1_Budget as Budget FROM budgets
UNION ALL
SELECT Region, 'Q2', Q2_Budget FROM budgets
UNION ALL
SELECT Region, 'Q3', Q3_Budget FROM budgets
UNION ALL
SELECT Region, 'Q4', Q4_Budget FROM budgets;
```

**Path B — Python (pandas)**:

```python
import pandas as pd

wide = pd.DataFrame({
    "Region": ["North", "South"],
    "Q1_Budget": [10000, 20000],
    "Q2_Budget": [12000, 22000],
    "Q3_Budget": [11000, 21000],
    "Q4_Budget": [13000, 23000],
})

long = wide.melt(id_vars="Region", var_name="Quarter", value_name="Budget")
long["Quarter"] = long["Quarter"].str.replace("_Budget", "", regex=False)
print(long.sort_values(["Region", "Quarter"]).to_string(index=False))
```

**Expected Output** (8 rows, both paths produce the same table):

| Region | Quarter | Budget |
| :----- | :------ | -----: |
| North  | Q1      |  10000 |
| North  | Q2      |  12000 |
| North  | Q3      |  11000 |
| North  | Q4      |  13000 |
| South  | Q1      |  20000 |
| South  | Q2      |  22000 |
| South  | Q3      |  21000 |
| South  | Q4      |  23000 |

* *Power Query path*: Select the 4 `..._Budget` columns -> right-click -> "Unpivot Columns" -> rename `Attribute`/`Value` to `Quarter`/`Budget`. One click, same result.

### Exercise 2: Cleaning Dirty BrightCart Customers

**Goal**: Apply the decision framework from this lesson to the `customers_raw.csv` fixture above and produce a clean table plus a data-quality report.

**Path A — SQL**:

```sql
WITH deduped AS (
    -- Keep the most complete row per customer_id (the one with a non-null signup_date)
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY customer_id
               ORDER BY (signup_date IS NULL) ASC  -- non-null rows first
           ) AS rn
    FROM customers_raw
)
SELECT
    customer_id,
    signup_date,
    CASE
        WHEN UPPER(TRIM(region)) = 'N/A' THEN 'Unknown'
        ELSE INITCAP(TRIM(region))            -- standardize casing: 'west' / 'WEST' -> 'West'
    END AS region,
    LOWER(acquisition_channel) AS acquisition_channel
FROM deduped
WHERE rn = 1;
```

**Path B — Python (pandas)**:

```python
import pandas as pd

df = pd.DataFrame([
    {"customer_id": "C-01", "signup_date": "2026-01-15", "region": "West", "acquisition_channel": "paid_search"},
    {"customer_id": "C-02", "signup_date": "2026-02-03", "region": "west", "acquisition_channel": "Paid_Search"},
    {"customer_id": "C-03", "signup_date": None, "region": "East", "acquisition_channel": "organic"},
    {"customer_id": "C-03", "signup_date": "2026-02-20", "region": "East", "acquisition_channel": "organic"},
    {"customer_id": "C-04", "signup_date": "2026-03-01", "region": "EAST", "acquisition_channel": "Referral"},
    {"customer_id": "C-05", "signup_date": "2026-03-12", "region": "N/A", "acquisition_channel": "unknown"},
])

# Step 1: dedupe -- keep the row with a non-null signup_date per customer_id
df = df.sort_values("signup_date").drop_duplicates("customer_id", keep="last")

# Step 2: standardize region casing; map explicit "N/A" to "Unknown" (not a null!)
df["region"] = df["region"].str.strip().str.title()
df["region"] = df["region"].replace("N/A", "Unknown")

# Step 3: standardize channel casing
df["acquisition_channel"] = df["acquisition_channel"].str.lower()

print(df.sort_values("customer_id").to_string(index=False))
```

**Expected Cleaned Table**:

| customer_id | signup_date | region  | acquisition_channel |
| :----------- | :----------- | :------ | :-------------------- |
| C-01         | 2026-01-15   | West    | paid_search            |
| C-02         | 2026-02-03   | West    | paid_search            |
| C-03         | 2026-02-20   | East    | organic                |
| C-04         | 2026-03-01   | East    | referral               |
| C-05         | 2026-03-12   | Unknown | unknown                |

**Expected Data-Quality Report**:

| Check                      | Count | Action taken                                         |
| :--------------------------- | ----: | :------------------------------------------------------ |
| Duplicate `customer_id` rows | 1 (C-03) | Kept the more complete row (non-null `signup_date`); discarded the null-date duplicate |
| Inconsistent region casing    | 3 rows | Standardized via `TRIM` + title-case (`west`→`West`, `EAST`→`East`) |
| Explicit "N/A" region         | 1 (C-05) | Mapped to `"Unknown"` category — **not** treated as a blank null, per the decision framework |
| Inconsistent channel casing   | 2 rows | Lower-cased for consistent grouping |

### Exercise 3: Cleaning Dirty BrightCart Products (Type Errors)

**Goal**: Clean `products_raw.csv`, handling a duplicate product and a type-mismatched `cost` value.

**Path A — SQL**:

```sql
WITH deduped AS (
    SELECT *, ROW_NUMBER() OVER (
        PARTITION BY product_id ORDER BY (cost IS NULL) ASC
    ) AS rn
    FROM products_raw
),
typed AS (
    SELECT
        product_id,
        LOWER(category) AS category,   -- standardize casing
        subcategory,
        CASE
            WHEN cost ~ '^[0-9.]+$' THEN CAST(cost AS NUMERIC)  -- only cast valid numerics
            ELSE NULL                                            -- quarantine candidate
        END AS cost,
        CAST(list_price AS NUMERIC) AS list_price
    FROM deduped
    WHERE rn = 1
)
SELECT * FROM typed;
```

**Path B — Python (pandas)**:

```python
import pandas as pd

df = pd.DataFrame([
    {"product_id": "P-100", "category": "Tents", "subcategory": "4-Person", "cost": "120.00", "list_price": 250.00},
    {"product_id": "P-200", "category": "footwear", "subcategory": "Trail Runners", "cost": "35", "list_price": 80.00},
    {"product_id": "P-300", "category": "Backpacks", "subcategory": "Daypack", "cost": None, "list_price": 120.00},
    {"product_id": "P-300", "category": "Backpacks", "subcategory": "Daypack", "cost": "45.00", "list_price": 120.00},
    {"product_id": "P-400", "category": "Tents", "subcategory": "2-Person", "cost": "ten dollars", "list_price": 150.00},
])

# Step 1: dedupe -- keep the row with a non-null cost
df = df.sort_values("cost").drop_duplicates("product_id", keep="last")

# Step 2: standardize category casing
df["category"] = df["category"].str.lower()

# Step 3: type-check cost; quarantine rows that can't convert instead of crashing
df["cost_numeric"] = pd.to_numeric(df["cost"], errors="coerce")
quarantine = df[df["cost_numeric"].isna() & df["cost"].notna()]
clean = df[~df.index.isin(quarantine.index)].drop(columns="cost").rename(columns={"cost_numeric": "cost"})

print("Clean rows:")
print(clean.to_string(index=False))
print("\nQuarantined rows:")
print(quarantine[["product_id", "cost"]].to_string(index=False))
```

**Expected Cleaned Table**:

| product_id | category  | subcategory   |   cost | list_price |
| :---------- | :-------- | :------------- | -----: | ---------: |
| P-100       | tents     | 4-Person       | 120.00 |     250.00 |
| P-200       | footwear  | Trail Runners  |  35.00 |      80.00 |
| P-300       | backpacks | Daypack        |  45.00 |     120.00 |

**Expected Quarantine Report**:

| product_id | cost          | Reason                              |
| :---------- | :------------- | :------------------------------------ |
| P-400       | "ten dollars" | Type mismatch — text in numeric `cost` column; escalate to source-system owner, do not guess a number |

### Exercise 4: Date Parsing

**Goal**: Fix mixed date formats from a BrightCart marketplace export.

**Input**: `['2023-01-01', '01/02/2023', 'March 1st, 2023']`

* Computers will fail to sort this.
* **Task**: Create a standardized `ISO_Date` column (`YYYY-MM-DD`).
* *Standard*: `2023-01-01`, `2023-02-01`, `2023-03-01`.

```python
import pandas as pd

raw_dates = ["2023-01-01", "01/02/2023", "March 1st, 2023"]
parsed = pd.to_datetime(raw_dates, format="mixed", dayfirst=False)
print(parsed.strftime("%Y-%m-%d").tolist())
```

**Expected Output**:

```text
['2023-01-01', '2023-01-02', '2023-03-01']
```

*Caution*: `'01/02/2023'` is ambiguous — US format reads it as Jan 2; European format reads it as Feb 1. **Always confirm the source system's locale before parsing** — this is a common, hard-to-detect data-quality bug, not a purely mechanical one.

---

## Mastery Check

### Question 1: Wide vs Long

Which format is better for BI Tools (Power BI/Tableau)?
A) Wide (Pivot Table style)
B) Long (Tidy Data style)
C) JSON
D) PDF

<details>
<summary>Click for Answer</summary>

**Answer: B**
Long Data allows for scalable aggregations (`SUM(Value)`) regardless of how many categories/dates exist.
</details>

### Question 2: Appending

You have 12 files: `Jan.csv`, `Feb.csv`, ... `Dec.csv`. Do you Merge or Append them?
A) Merge
B) Append
C) Join
D) VLOOKUP

<details>
<summary>Click for Answer</summary>

**Answer: B**
Append (Union) stacks them vertically to create one long year of data.
</details>

### Question 3: Data Quality

In a "Sales" column, you find the value "N/A". What happens if you try to `SUM` the column?
A) It works and ignores "N/A".
B) It treats "N/A" as 0.
C) It errors (Type Mismatch).
D) It converts "N/A" to 1.

<details>
<summary>Click for Answer</summary>

**Answer: C**
You cannot add Text to Numbers. You must clean "N/A" (replace with 0 or null) and change the column type to Decimal first.
</details>

### Question 4: Push Down

Where is the most efficient place to filter data?
A) In the Visualization (Dashboard Filter).
B) In the BI Prep Tool (Power Query).
C) In the Database (SQL `WHERE` clause).
D) In the User's Brain.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Filtering in the DB ("Push Down") means less data travels over the network, making everything faster.
</details>

### Question 5: Keys

To Merge (Join) two tables, what do you need?
A) A common column (Key) with matching values.
B) Both tables must have the same number of rows.
C) Both tables must be sorted.
D) Both tables must have the same name.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Keys (Primary/Foreign) are the bridge between datasets.
</details>

### Question 6: Null vs. Unknown

A BrightCart `region` column has the literal text value `"N/A"` for some customers. Per this lesson's error-handling decision framework, how should it be treated?

A) Convert it to a blank/null value, identical to a truly missing region.
B) Keep it as its own explicit "Unknown" category — it is a deliberate signal, not a missing value.
C) Delete every row containing "N/A".
D) Replace it with the most common region (mode imputation), no documentation needed.

<details>
<summary>Click for Answer</summary>

**Answer: B**
"N/A" entered by a system or person is an *explicit* statement of "unknown," which is different from a field that was simply never populated (a true null). Merging them loses information about *why* the value is missing — keep "Unknown" as its own category.
</details>

---

## Cross-References

* **Phase 7 Day 72 — BI Data Formats & Ingestion** (the quarantine/dead-letter pattern introduced there for bad ingestion records is the same pattern applied to dirty rows in this lesson's cleaning labs).
* **Phase 7 Day 73 — BI SQL & Databases** (the SQL `ROW_NUMBER()`/`CASE` patterns used here to dedupe and standardize BrightCart customers build directly on yesterday's window-function and CTE skills).
* **Phase 7 Day 76 — BI Architecture & Data Modeling** (the cleaned, deduplicated `customers`/`products` tables produced here are the dimension tables that lesson's star schema depends on).
* **Phase 2 Day 17 — Pandas Data Cleaning** (this lesson's pandas dedup/type-casting exercises extend the foundational cleaning techniques from that earlier lesson).
* **Phase 7 Day 80 — Data Governance & Compliance** (lineage, reproducibility, and data-cleaning tests introduced here are formal governance requirements in that lesson).

## Glossary

* **Wide (data shape)**: A table layout where categories/time periods are spread across separate columns (e.g., `Q1_Budget`, `Q2_Budget`).
* **Long (data shape)**: A table layout where each row is one observation and a column identifies its category/time period — the shape BI tools and `GROUP BY` expect.
* **Unpivot**: The transformation from wide to long format, turning column headers into row values.
* **Append**: Stacking two or more tables with the same columns vertically into one longer table (a SQL `UNION ALL`).
* **Merge**: Joining two tables horizontally on a shared key, adding columns from one table onto rows of another.
* **Key**: A column (or set of columns) whose values uniquely identify a row, or that link rows across tables (primary key / foreign key).
* **Null**: The absence of a value in a database field — distinct from zero, an empty string, or an explicit "Unknown."
* **Imputation**: Estimating a missing value using a defensible statistical or business rule, always documented as an estimate rather than an observed fact.
* **Pushdown**: Performing a transformation (filter, aggregation, cleaning) as close to the data source as possible (ideally in the database) rather than downstream in a BI tool.
* **Entity resolution**: Determining that two differently-formatted records refer to the same real-world entity (e.g., matching "Jon Smith" to "John Smith").

---

## Summary

Today you learned:

* ✅ **Unpivot** is the secret weapon of BI pros.
* ✅ **Mise en place**: Clean data *before* you visualize it.
* ✅ **Push Down Logic**: The closer to the source you clean, the faster your dashboard runs.
* ✅ **Append vs Merge**: Stack vertically vs Join horizontally.

**Tomorrow**: We explore **BI Visualization & Dashboard Principles**—How to design charts that tell a story, not just show numbers.
