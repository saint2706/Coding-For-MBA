---
day: 73
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

### 2. The BI Stack (ELT)

How data gets to your dashboard:

1. **Extract**: Pull raw data from Salesforce, Stripe, SQL Database.
2. **Load**: Dump it into a Data Warehouse (Snowflake, BigQuery).
3. **Transform**: Clean it using SQL (`dbt` is popular here).
4. **Visualize**: Connect Tableau/PowerBI/Looker to the Clean Data.

### 3. The "Single Source of Truth"

If Marketing says "We have 100 customers" and Finance says "We have 90 customers," **you have failed.**
BI's #1 job is to define "Customer" (e.g., Someone who paid >$0 in the last 30 days) and ensure EVERYONE uses that definition.

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

## Hands-on Lab

### Exercise 1: Defining Ambiguous Metrics

**Goal**: Logic check a business request.

**Scenario**: The CEO asks for "Active Users."

**Task**: Write down 3 different ways to interpret "Active User" and how the number would change.

1. **Definition A**: Anyone who *logged in* this month. (High number, includes zombies).
2. **Definition B**: Anyone who *performed a key action* (posted, bought) this month. (Medium number, valuable users).
3. **Definition C**: Anyone who opened the app *today*. (Daily Active Users - distinct).

* *Which one is best for an Ad-supported app?* (A - Eyes on screen).
* *Which one is best for a SaaS tool?* (B - Usage = value).

### Exercise 2: Aggregating WAU (SQL Logic)

**Goal**: Write a pseudo-SQL query to find Active Users.

**Scenario**: Table `events` has columns `user_id`, `timestamp`.

```sql
-- Calculate Weekly Active Users (WAU) for the last week
SELECT COUNT(DISTINCT user_id) AS wau
FROM
    events
WHERE
    timestamp >= NOW() - INTERVAL '7 days'
```

**Question**: Why `DISTINCT`?

* *Answer*: If User A clicks 100 times, they are still just 1 user. If you forget DISTINCT, you count *actions*, not *users*.

### Exercise 3: Designing a CEO Dashboard

**Goal**: Sketch a layout.

**Requirement**: The CEO wants to know "How is the sales team doing?"

**Draft Layout (Text)**:

1. **Top Left (The Big Number)**:
    * **$1.2M Closed Revenue** (This Quarter).
    * *Subtext*: 🟢 +15% vs Goal ($1.0M).

2. **Top Right (Pipeline Health)**:
    * **$4.5M in Pipeline**.
    * *Chart*: Funnel Chart (Leads -> Qualified -> Proposal -> Closed).

3. **Bottom Left (Leaderboard)**:
    * **Top Sales Reps**:
        1. Sarah ($200k)
        2. Mike ($180k)

4. **Bottom Right (Trend)**:
    * **Weekly Sales vs Target** (Line Chart).
    * *Goal*: Are we trending up or flatlining?

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

## Summary

Today you learned:

* ✅ **BI answers "What happened?"** using Descriptive Analytics.
* ✅ **Interpretation Matters**: Defining "Active User" is harder than calculating it.
* ✅ **Single Source of Truth**: The holy grail of data governance.
* ✅ **Dashboard Design**: Simplicity, Context, and Hierarchy rule the day.

**Tomorrow**: We dive deeper into **BI Strategy & Stakeholder Management**—how to turn data into business decisions.
