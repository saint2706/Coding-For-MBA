---
day: 68
title: "BI Analyst Foundations"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "bi-foundations"
duration: 120
difficulty: "intermediate"
tags:
  - business-intelligence
  - analytics
  - visualization
  - sql
  - reporting
concepts:
  - "descriptive analytics"
  - "the 'why' vs 'what'"
  - "single source of truth"
  - "dashboard design"
  - "ETL basics"
prerequisites:
  - "Basic Excel/SQL knowledge"
  - "Understand business terms (Revenue, Churn)"
outcomes:
  - "Differentiate between BI and Data Science"
  - "Design a high-impact dashboard layout"
  - "Define ambiguous metrics effectively"
---

# 🎯 Day 68: BI Analyst Foundations

> *"Information is the oil of the 21st century, and analytics is the combustion engine." — Peter Sondergaard*

---

## The "Never-Coded" Bridge

**Imagine running a ship in the 1600s.**

**Without BI (The Old Way):**
You guess your speed. You look at the stars to guess your location. You write "Good winds today" in a dusty logbook.

* **Problem**: When the Admiral asks "How much food do we have left?", you have to go count barrels in the dark.

**With BI (The Modern Way):**
You have a dashboard.

* **Fuel Gauge**: Shows exactly 64% full.
* **Speedometer**: Shows 12 knots.
* **GPS**: Shows precise location.
* **Alert**: "Food reserves low."

**Business Intelligence (BI)** is about answering: **"What happened?"** and **"What is happening now?"**
It turns a messy pile of receipts (Raw Data) into a clear monthly profit chart (Actionable Insight).

---

## The Technical Deep Dive

### 1. The 4 Types of Analytics

1. **Descriptive (BI Core)**: "What happened?" (Monthly Sales Report)
2. **Diagnostic (BI Core)**: "Why did it happen?" (Drill-down: Sales dropped because region X failed).
3. **Predictive (Data Science)**: "What will happen?" (Forecast next month).
4. **Prescriptive (Data Science/Strategy)**: "How can we make it happen?" (Optimize price).

### 2. The BI Stack (ELT) — Full Picture

The single-line "Extract -> Load -> Transform -> Visualize" view hides seven distinct layers, each with its own
owner and failure mode. Understanding the full stack is what separates an analyst who can *use* a dashboard
from one who can *debug* why it broke at 3 AM.

| Layer | What It Does | Example Tools | Who Owns It |
|---|---|---|---|
| **1. Source Systems** | Where data is born — apps, payment processors, CRMs, web/event trackers | Postgres (app DB), Stripe, Salesforce, Segment | Engineering / Product teams |
| **2. Extract & Load** | Copies raw data from sources into the warehouse, usually unmodified | Fivetran, Airbyte, custom scripts | Data Engineering |
| **3. Warehouse / Lakehouse** | Stores raw + transformed data; the durable system of record for analytics | Snowflake, BigQuery, Databricks | Data Engineering / Platform |
| **4. Orchestration** | Schedules and sequences jobs so transformations run in the right order, on time | Airflow, Dagster, dbt Cloud scheduler | Data Engineering |
| **5. Transformation** | Converts raw tables into clean, business-ready models (joins, dedup, business logic) | dbt, SQL stored procedures | Analytics Engineering |
| **6. Semantic Layer** | Defines metrics *once* (e.g., "Revenue" = sum of net order value) so every tool agrees | dbt Semantic Layer, LookML, Cube | Analytics Engineering / BI |
| **7. BI Consumption** | Where humans see the answer — dashboards, reports, ad hoc SQL | Tableau, Power BI, Looker | BI Analysts |
| **8. Observability** | Detects when data is late, missing, or wrong *before* a stakeholder finds out | Monte Carlo, Elementary, dbt tests | Data Engineering / Analytics Engineering |

**Why ownership boundaries matter**: when a dashboard number looks wrong, the fastest path to a fix is knowing
which layer to interrogate first. "Revenue dropped to $0 today" is almost never a math error in the BI tool —
it is usually an **Extract & Load** failure (a sync job silently stopped) or an **Observability** gap (nobody
alerted on the missing rows). A BI analyst who only understands layer 7 will spend hours staring at a chart;
one who understands the full stack goes straight to "did yesterday's load job actually run?"

### 3. The "Single Source of Truth"

If Marketing says "We have 100 customers" and Finance says "We have 90 customers," **you have failed.**
BI's #1 job is to define "Customer" (e.g., Someone who paid >$0 in the last 30 days) and ensure EVERYONE uses that definition.

### 4. Metric Contracts: Making "Active User" Precise

Defining "Active User" in Exercise 1 (below) is only step one. To stop the definition from drifting every
time someone touches the dashboard, senior BI teams write it down as a **metric contract** — a short,
versioned spec that travels with the metric wherever it's used. A real contract for "Weekly Active User (WAU)"
looks like this:

| Field | Specification |
|---|---|
| **Grain** | One row per `user_id` per calendar week (Mon–Sun) |
| **Inclusion rule** | User has at least 1 `event_type IN ('login', 'purchase', 'add_to_cart')` event in the window |
| **Exclusion rule** | Internal QA accounts (`user_id` in `internal_test_accounts`) and bot traffic (`user_agent` flagged by the bot-detection job) are excluded |
| **Time zone** | All timestamps are normalized to UTC before bucketing into weeks — a user active at 11pm Pacific on Sunday must not leak into the next week's count |
| **Late-arriving events** | Mobile app events can arrive up to 72 hours late (offline queueing). The metric is **finalized** 4 days after week-end; before that, it is labeled "provisional" on the dashboard |
| **Owner** | BI Analytics team (`#data-questions` Slack channel) |
| **Certified** | Yes — this is the only WAU number allowed in board decks. Ad hoc recalculations in Excel are not certified |
| **Change approval** | Any change to the inclusion/exclusion rule requires sign-off from the BI lead + the VP of Product, plus a changelog entry, because it will move the historical trend line |

Without a contract like this, "Active User" silently means something different in every report — which is
exactly the single-source-of-truth failure described above, just one level more specific.

---

## Senior-Level Insights

### Dashboard Design: Less is More

Novice analysts put 50 charts on a dashboard.
**Senior analysts put 3.**

* **The 5-Second Rule**: Can a CEO look at your dashboard for 5 seconds and know if the business is burning down?
* **Top Left**: The most important number (KPI) goes in the top left.
* **Context**: A number without context ($1M Revenue) is useless. Is that good? (vs Target) Is it growing? (vs Last Year).

### "Self-Service BI" vs. Chaos

* **The Dream**: Give everyone access to data so they can answer their own questions.
* **The Reality**: Everyone exports to Excel, creates different formulas, and brings conflicting numbers to the board meeting.
* **The Fix**: Certified Datasets. "You can play with the data, but only the 'Official Revenue Table' is trusted."

---

## Meet BrightCart: Your Phase 7 Project

Starting today, every lab in this phase uses one running company: **BrightCart**, a mid-size direct-to-consumer
e-commerce retailer selling outdoor and sporting goods through three channels — its website, a mobile app, and
a third-party marketplace. BrightCart has a small, realistic relational schema you'll keep coming back to:

* `customers(customer_id, signup_date, region, acquisition_channel)`
* `orders(order_id, customer_id, order_date, status, channel)`
* `order_items(order_id, product_id, quantity, unit_price, discount_pct)`
* `products(product_id, category, subcategory, cost, list_price)`
* `events(event_id, user_id, event_type, event_ts, session_id)` — `event_type` is one of `page_view`, `add_to_cart`, `purchase`, `login`
* `support_tickets(ticket_id, customer_id, opened_at, resolved_at, category, csat_score)`

Today's lab uses `events`. Later Phase 7 lessons will pull in `orders`, `customers`, and the rest of the schema.

---

## Hands-on Lab

### Setup: The BrightCart Events Sample

Here is a small, copy-pasteable sample of BrightCart's `events` table (mobile app + website traffic for one week).
Paste this into a SQL sandbox (or a pandas DataFrame) before starting Exercise 2.

```text
event_id,user_id,event_type,event_ts,session_id
1,101,login,2026-06-01 08:02:00,s101a
2,101,page_view,2026-06-01 08:03:10,s101a
3,101,add_to_cart,2026-06-01 08:05:45,s101a
4,101,purchase,2026-06-01 08:07:30,s101a
5,102,page_view,2026-06-01 09:15:00,s102a
6,102,page_view,2026-06-01 09:16:20,s102a
7,103,login,2026-06-02 11:00:00,s103a
8,103,page_view,2026-06-02 11:01:30,s103a
9,104,page_view,2026-06-02 14:22:00,s104a
10,104,add_to_cart,2026-06-02 14:25:10,s104a
11,101,login,2026-06-03 19:40:00,s101b
12,101,purchase,2026-06-03 19:48:00,s101b
13,105,page_view,2026-06-03 20:01:00,s105a
14,106,login,2026-06-04 07:30:00,s106a
15,106,page_view,2026-06-04 07:31:00,s106a
16,106,add_to_cart,2026-06-04 07:33:00,s106a
17,106,purchase,2026-06-04 07:36:00,s106a
18,102,login,2026-06-05 10:00:00,s102b
19,102,purchase,2026-06-05 10:12:00,s102b
20,107,page_view,2026-06-06 16:45:00,s107a
21,107,page_view,2026-06-06 16:47:00,s107a
22,101,login,2026-06-07 21:00:00,s101c
23,101,page_view,2026-06-07 21:01:00,s101c
24,103,login,2026-06-07 22:10:00,s103b
25,103,purchase,2026-06-07 22:20:00,s103b
```

This week has **7 distinct users** (101–107). Users 101, 102, 103, and 106 completed a `purchase` event at least
once. Users 104, 105, and 107 only browsed.

### Exercise 1: Defining Ambiguous Metrics

**Goal**: Logic check a business request before writing any code.

**Scenario**: BrightCart's CEO asks the BI team for "Active Users" on the weekly leadership dashboard.

**Task**: Using the `events` table above, write down 3 different ways to interpret "Active User" and compute
what each definition would actually return *for this sample week*.

1. **Definition A — Logged in**: Anyone with a `login` event. Using the sample: users 101, 103, 106, 102 → **4 users**.
2. **Definition B — Performed a key action** (`add_to_cart` or `purchase`): users 101, 104, 106, 102, 103 → **5 users**.
3. **Definition C — Purchased**: users 101, 102, 106, 103 → **4 users**.

**Deliverable**: A one-paragraph recommendation stating which definition BrightCart's leadership dashboard should
use, and why. (Suggested answer: since BrightCart is a transactional retailer, not an ad-supported app,
Definition B — "key action" — is usually the most decision-relevant; pure logins overstate engagement, and
restricting to purchases-only undercounts users who are warm but haven't converted yet this week.)

### Exercise 2: Aggregating WAU (SQL Logic)

**Goal**: Write and execute a real SQL query against the BrightCart `events` table to compute Weekly Active
Users, then verify your result against the sample data by hand.

**Setup**: Load the CSV above into a table named `events` (SQLite, DuckDB, Postgres, or even a pandas
DataFrame with `pd.read_csv` + `.nunique()` all work for this exercise).

```sql
-- Calculate Weekly Active Users (WAU) for the week of 2026-06-01 to 2026-06-07
-- using Definition B: "key action" (add_to_cart or purchase)
SELECT COUNT(DISTINCT user_id) AS wau
FROM events
WHERE event_type IN ('add_to_cart', 'purchase')
  AND event_ts >= '2026-06-01'
  AND event_ts <  '2026-06-08';
```

**Expected output**:

```text
wau
---
5
```

**Execution steps**:
1. Load the 25-row sample above into your `events` table.
2. Run the query exactly as written.
3. Confirm your result is `5` — matching the manual count of users {101, 102, 103, 104, 106} from Exercise 1's
   Definition B.
4. Re-run the query swapping the `WHERE event_type IN (...)` clause to only `'purchase'` and confirm you now
   get `4` — matching Definition C.

**Question**: Why `DISTINCT`?

* *Answer*: If User 101 has 2 purchases in the week, they are still just 1 active user. Without `DISTINCT`,
  you would count *events* (rows), not *users* — inflating the metric and double-counting your most loyal
  customers as if they were 2 different people.

### Exercise 3: Designing a BrightCart Stakeholder Brief, Metric Definition, and Dashboard Sketch

**Goal**: Produce the *first three deliverables* of the Phase 7 BrightCart project — a stakeholder brief, a
certified metric definition, and a dashboard sketch — using the metric-contract format from the Technical
Deep Dive above.

**Scenario**: BrightCart's VP of Growth asks: "How is the sales team / website doing this quarter?"

**Task — produce all three deliverables**:

**(a) Stakeholder Brief** (3-5 sentences): Who asked, what decision will be made with the answer, what time
window matters, and what "good" looks like. Example: *"VP of Growth needs a weekly view of BrightCart's order
volume and revenue by channel (web/app/marketplace) to decide Q3 marketing budget allocation. She will look at
this every Monday before the leadership sync. Good = revenue trending at or above the $1.0M/quarter plan."*

**(b) Metric Definition** (using the metric-contract fields): Define "Closed Revenue" with grain (per order,
summed weekly), inclusion (status = `delivered` or `shipped`; excludes `cancelled`/`returned`), time zone
(UTC), owner (BI team), and certification status.

**Deliverable / expected output** — your dashboard sketch should look like this:

1. **Top Left (The Big Number)**:
    * **Closed Revenue: [Your computed value from sample order data]** (This Quarter).
    * *Subtext*: comparison vs. the quarterly goal (e.g., 🟢 above plan or 🔴 below plan) — never show the
      number alone without this comparison.

2. **Top Right (Channel Mix)**:
    * *Chart*: Stacked bar of order count by `channel` (web / app / marketplace) per week.

3. **Bottom Left (Funnel)**:
    * *Chart*: `events` funnel — `page_view` → `add_to_cart` → `purchase` — using the same table from
      Exercises 1–2, so you can see where BrightCart customers drop off.

4. **Bottom Right (Trend)**:
    * **Weekly Active Users vs. prior week** (Line Chart), using the WAU definition you certified in Exercise 2.

**Why this matters**: notice that all three deliverables for this exercise — brief, metric, sketch — must be
internally consistent. If your brief says "decide Q3 budget," your dashboard cannot show daily granularity
without a quarter-to-date rollup; if your metric definition certifies "Closed Revenue" as `delivered + shipped`,
your dashboard's big number must use that exact definition, not a quick `SUM(order_total)` that includes
cancelled orders.

---

## Translation Lab: Analyst Storytelling for Model Risk

**Scenario**: BI analysts receive weekly ML reports but leaders are unclear on business implications.

**Your task**:

1. Translate causal/fairness outputs into KPI narratives executives can act on.
2. Define BI metrics that reveal degradation and bias trends over time.
3. Specify dashboard visuals and escalation rules for analyst-to-leadership handoff.
4. Deliver a one-page decision memo that merges technical evidence and business action.

---

## Mastery Check

### Question 1: Descriptive Analytics

Which question does Descriptive Analytics answer?
A) "Why did this happen?"
B) "What happened?"
C) "What will happen?"
D) "How do we fix it?"

<details>
<summary>Click for Answer</summary>

**Answer: B**
It describes the past or present state of the business.
</details>

### Question 2: Single Source of Truth

Why is a central Data Warehouse important?
A) It is cheaper than Excel.
B) It ensures everyone uses the same data and definitions, avoiding conflicting reports.
C) It automatically predicts the future.
D) It replaces the need for analysts.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Consistency is the primary value driver of a Warehouse.
</details>

### Question 3: KPI Context

You report "Churn is 5%." Why is this bad reporting?
A) 5% is too high.
B) It lacks context. Is 5% good or bad? Is it higher than last month? What is the industry standard?
C) You should use a pie chart.
D) Churn is a made-up word.

<details>
<summary>Click for Answer</summary>

**Answer: B**
A number without a benchmark (Target, YoY, MoM) communicates nothing.
</details>

### Question 4: ETL

What does the 'T' in ETL stand for?
A) Transaction
B) Transfer
C) Transform
D) Table

<details>
<summary>Click for Answer</summary>

**Answer: C**
Transform. Cleaning, joining, and aggregating the raw data into usable formats.
</details>

### Question 5: Dashboarding

What is the "5-Second Rule" for dashboards?
A) The dashboard must load in 5 seconds.
B) You must build it in 5 seconds.
C) A user should understand the key status (Good/Bad) within 5 seconds of looking.
D) It self-destructs after 5 seconds.

<details>
<summary>Click for Answer</summary>

**Answer: C**
If users have to stare and calculate to understand the status, the design has failed.
</details>

---

## Cross-References

* Phase 7 Day 69 — BI Strategy & Stakeholders (turns today's metric definitions into stakeholder communication)
* Phase 7 Day 70 — BI Metrics & Data Literacy (deepens the WAU/Active User concept into cohorts and unit economics)
* Phase 7 Day 73 — BI SQL & Databases (builds the warehouse layer referenced in the BI Stack section)
* Phase 7 Day 81 — BI Architecture & Data Modeling (formalizes the semantic layer and ownership boundaries introduced here)
* Phase 3 Day 31 — Databases (prerequisite: basic SQL and relational table concepts used in Exercise 2)

## Glossary

* **BI (Business Intelligence)** — The practice of turning raw operational data into descriptive/diagnostic insight for decision-making.
* **KPI (Key Performance Indicator)** — A metric explicitly chosen to track progress toward a business goal.
* **ETL** — Extract, Transform, Load: the older pattern where data is cleaned *before* it lands in the warehouse.
* **ELT** — Extract, Load, Transform: the modern pattern where raw data lands first and is cleaned inside the warehouse.
* **Warehouse** — A structured, query-optimized database (e.g., Snowflake, BigQuery) that stores cleaned, analysis-ready data.
* **Certified Dataset** — A table or metric explicitly approved by the BI team as the trusted version for reporting.
* **WAU (Weekly Active Users)** — Count of distinct users who performed a qualifying action within a 7-day window.
* **Single Source of Truth** — The principle that every team should reference the same definition and the same number for a given metric.
* **Metric Contract** — A versioned specification (grain, inclusion/exclusion, owner, certification) that fixes a metric's meaning over time.
* **Semantic Layer** — The layer that defines business metrics once (e.g., "Revenue") so every BI tool computes them identically.

---

## Summary

Today you learned:

* ✅ **BI answers "What happened?"** using Descriptive Analytics.
* ✅ **Interpretation Matters**: Defining "Active User" is harder than calculating it.
* ✅ **Single Source of Truth**: The holy grail of data governance.
* ✅ **Dashboard Design**: Simplicity, Context, and Hierarchy rule the day.

**Tomorrow**: We dive deeper into **BI Strategy & Stakeholder Management**—how to turn data into business decisions.
