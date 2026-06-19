---
day: 84
title: "BI Career & Capstone"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "bi-career"
duration: 120
difficulty: "intermediate"
tags:
  - career
  - portfolio
  - capstone
  - interview-prep
concepts:
  - "The Impact Resume (Action -> Metric)"
  - "The Full-Stack Portfolio"
  - "The Analytics Capstone Project"
  - "Continuous Learning Path"
prerequisites:
  - "Completion of Phase 7"
outcomes:
  - "Build a Portfolio Project that gets you hired"
  - "Answer technical interview questions Confidently"
  - "Rewrite Resume bullets for Impact"
---

# 🎯 Day 84: BI Career Development & Capstone

> *"In God we trust. All others must bring data. — And a good portfolio."*

---

## The "Never-Coded" Bridge

**The Artist vs. The Analyst**

* **Artist**: Applying for a job? They don't just say "I went to Art School." They show a **Portfolio**.
* **Analyst**: Applying for a job? Saying "I know SQL" is weak. Showing a **GitHub Repo with a dbt project and a Tableau Public link** is strong.

**The Capstone**: Your Masterpiece. Proof that you can solve a problem end-to-end.

---

## The Technical Deep Dive

### 1. The Full-Stack BI Portfolio

Don't just upload a CSV. Show the **System**:

1. **Architecture Diagram**: Draw the flow (Source -> dbt -> Dashboard).
2. **Code**: SQL Transformation scripts (with comments explaining *why*).
3. **Visualization**: A live link (Tableau Public / Power BI Web).
4. **Influence**: A "Read Me" file explaining the *Business Impact*. usage?

### 2. The Impact Resume Formula

* **Weak**: "Responsible for creating dashboards in Tableau." (Job Description).
* **Strong**: "Automated weekly reporting using Tableau, saving 5 hours/week and identifying a \$50k revenue leak." (Action -> Result).

**Formula**: `[Action Verb] + [Task] + [Result/Metric]`.

### 3. The Capstone Project Brief

**Goal**: Build a complete, end-to-end BI solution that proves you can do the job — not a checklist, a **gradable artifact** with a pinned dataset, milestones, acceptance tests, and reference outputs.

#### Capstone, Default Option: The BrightCart Executive Analytics Platform

**Why BrightCart, and why pinned**: A capstone graded against "any e-commerce dataset you like" cannot be consistently reviewed. This capstone is pinned to the same **BrightCart** dataset and schema used throughout Phase 7 (mid-size DTC outdoor/sporting-goods retailer, selling via web, mobile app, and a third-party marketplace — first introduced in Phase 7 Day 68). Pinning the dataset means your instructor, a peer reviewer, or a hiring manager can run your project and get the same numbers you got.

* **Dataset & version**: `extras/sample_dbt_project/seeds/raw_orders.csv` (25 orders) and `raw_customers.csv` (20 customers), seeded via `dbt seed` — the same fixtures used in Phase 7 Day 84B and Day 84C. Pin the commit/version you built against in your README.
* **Setup**:
  1. `pip install dbt-duckdb`
  2. `cd content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/extras/sample_dbt_project`
  3. `export DBT_PROFILES_DIR=$(pwd)` (uses the local `profiles.yml`, no warehouse account needed)
  4. `dbt deps && dbt seed && dbt run && dbt test`
* **Required repository structure**:
  ```
  capstone-brightcart/
  ├── README.md                  # business problem, architecture diagram, how to run it
  ├── dbt_project/                # extend sample_dbt_project: add 1+ new mart
  │   └── models/marts/fct_capstone_metric.sql
  ├── metrics/
  │   └── metrics_layer.yml       # extend extras/metrics_layer_example.yml with 1+ new metric
  ├── dashboard/
  │   └── screenshot_or_link.md   # exported dashboard image or published link
  ├── runbook.md                  # what breaks, how you'd find out, how you'd fix it
  └── presentation.pdf            # 5-slide deck (see rubric below)
  ```
* **Milestones** (mirrors the phase-long checkpoint map below — do not start this from scratch on Day 84):
  1. Star schema or OBT design (built in Phase 7 Day 81) — reused, not redesigned.
  2. Pipeline producing fresh data on a schedule (built in Phase 7 Day 82) — reused or simulated.
  3. dbt models with tests passing (built in Phase 7 Day 84B) — extended with one new mart.
  4. One new governed metric defined in the semantic layer (built in Phase 7 Day 84C) — e.g., `repeat_purchase_rate`.
  5. Dashboard with 3 views: Executive, Marketing, Operations.
  6. Written runbook + cost estimate + stakeholder adoption plan (this lesson).
* **Expected artifacts**: a runnable dbt project (`dbt test` exits 0), one new metric definition, one dashboard (tool of your choice — Tableau Public, Power BI, Metabase, or even a well-formatted Jupyter notebook), a 5-slide deck, and a runbook.
* **Acceptance tests** (automatable where noted):
  * [ ] `dbt run && dbt test` exits with no errors (17 existing tests + your new tests all pass).
  * [ ] Your new mart has at least 2 column-level tests (`not_null`, `unique`, or `accepted_values`).
  * [ ] Your new metric has a written business definition (grain, filter conditions, what it excludes) — not just a formula.
  * [ ] The dashboard's numbers reconcile to the dbt mart (spot-check 3 numbers by hand).
  * [ ] The runbook names an owner, a freshness SLA, and one failure mode with a response step.
* **Presentation rubric**: see "Standardized Scoring Rubric" below — now scored against this specific BrightCart deliverable, not an abstract project.
* **Reference outputs**: using the seed data as-is, `fct_revenue` totals **$1,697.79** across 21 completed orders (4 of 25 orders are excluded: 2 `cancelled`, 2 `pending`); `dim_customers` shows 18 active customers, 4 of whom have zero completed orders. Your numbers should match these exactly if you have not modified the seed data — if they don't, debug before moving on.

#### Capstone, Alternative Option: Public Dataset

If you'd rather showcase a portfolio piece independent of this course's fixtures, you may substitute a public dataset — **Olist** (Brazilian e-commerce, ~100K orders) or **Superstore** (classic BI teaching dataset) are reasonable choices. The same required structure, milestones, and acceptance-test categories above still apply; you are responsible for defining your own reference outputs since the grader cannot pre-compute them for an unpinned dataset. Document your dataset's source URL and download date in your README for reproducibility.

* **Tech Stack**: SQL (Prep), dbt (Model), Tool of Choice (Viz).
* **Core Deliverables** (same for either option):
    1. **Star Schema**: `fact_orders`, `dim_products` (or BrightCart's `fct_revenue`/`dim_customers`).
    2. **Metrics**: `AOV` (Average Order Value), `LTV` (Lifetime Value), plus one new metric you define.
    3. **Dashboard**: 3 Views (Executive, Marketing, Operations).
    4. **Presentation**: A 5-slide deck summarizing the findings.

---

## Your Phase 7 Checkpoint Map: The Capstone Was Never Just a Day-84 Assignment

A common mistake is treating the capstone as a new project that starts on Day 84. It isn't — **every prior lesson in this phase already built a piece of it.** Day 84's job is to assemble what you've built, not start from zero.

| Phase 7 Day | Artifact You Already Built | Capstone Role |
|---|---|---|
| **Phase 7 Day 68** | BrightCart schema + first stakeholder brief/metric definition | Defines the business problem your capstone solves |
| **Phase 7 Day 70** | Metric definitions (LTV, CAC, cohort retention) with assumptions stated | Becomes your capstone's `metrics/` definitions |
| **Phase 7 Day 73** | SQL window-function queries against BrightCart data | Becomes your dashboard's underlying analytical queries |
| **Phase 7 Day 80** | Data quality tests + RACI/stewardship model | Becomes your capstone's governance/access-control section |
| **Phase 7 Day 81** | Star schema (`fact_orders`, `dim_customers`) design | Becomes your capstone's `dbt_project/models/marts/` structure |
| **Phase 7 Day 82** | Idempotent pipeline with retries/backfill | Becomes (or stands in for) your capstone's orchestration layer |
| **Phase 7 Day 83** | Costed warehouse design + FinOps controls | Becomes your capstone's cost estimate section |
| **Phase 7 Day 84B** | Working dbt project (`sample_dbt_project`) with passing tests | Is literally the dbt project you extend for the capstone |
| **Phase 7 Day 84C** | Semantic layer metric definitions + Reverse ETL sync design | Becomes your capstone's governed metric + (optional) CRM sync |

If you skipped or rushed any of these, go back before starting Day 84 — the capstone assumes those artifacts exist.

---

## Senior-Level Insights

### "Soft Skills" are Hard Skills

* **Curiosity**: Do you ask "Why?" when the number looks weird?
* **Skepticism**: Do you trust the data blindly? (Don't).
* **Empathy**: Do you design for the user, or for yourself?

### The Interview: "Tell me about a time..."

* **Question**: "Tell me about a time you found an insight."
* **Answer (STAR Method)**:
  * **Situation**: Marketing spend was high, ROI low.
  * **Task**: Investigate why.
  * **Action**: Analyzed attribution data, found mobile ads were clicking but not converting due to slow load times.
  * **Result**: Recommended fix, saved \$20k/month.

---

## Hands-on Lab

### Exercise 1: Project Plan

**Goal**: Design your Capstone.

* **Problem Statement**: "Global Co. has high churn but doesn't know why."
* **Data Source**: `customer_churn.csv`.
* **Hypothesis**: "Churn is driven by Support Ticket Response Time."
* **Tools**: Python (Clean) -> SQL (Analyze) -> Power BI (Viz).

### Exercise 2: Resume Rewrite

**Goal**: Fix this bullet point.
"analyzed customer data using SQL."

**Your rewrite**:

* "Queried 1M+ rows of customer data using Advanced SQL (Window Functions) to identify segments with high churn risk."

### Exercise 3: Mock Interview

**Goal**: Answer "What is Inner Join vs Left Join?"

**Junior Answer**: "Inner is match, Left is everything."
**Senior Answer**: "Inner Join keeps only matching rows, filtering out non-matches. It's riskier for production pipelines because you might lose data silently. Left Join keeps all rows from the primary table, filling nulls for non-matches. I prefer Left Joins in staging to audit data quality first."

---

## Standardized Scoring Rubric (Capstone Quality)

Score each criterion from **1 (Needs Work)** to **5 (Excellent)**.

1. **Business Impact Estimate**: Is expected value (revenue lift, cost savings, risk reduction, or efficiency gain) quantified credibly?
2. **Reproducibility**: Can another analyst reproduce the work from documented data sources, logic, and steps?
3. **Governance Readiness**: Are data definitions, ownership, quality checks, and access/privacy controls clearly addressed?

**Required reflection workflow**:

* **Self-score** one capstone artifact (repo, dashboard, or presentation) using all rubric criteria and include concise rationale comments.
* **Peer-review** one classmate capstone artifact with rubric comments, noting one high-risk gap and one prioritized improvement.

---

## Mastery Check

### Question 1: Portfolio

What is the most important part of a Portfolio Project?
A) The complexity of the code.
B) The business story and problem solved.
C) The colors used.
D) The file size.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Hiring managers hire problem solvers, not code writers.
</details>

### Question 2: STAR Method

What does STAR stand for?
A) Situation, Task, Action, Result.
B) Stop, Think, Act, Review.
C) Stars in the sky.
D) SQL, Tableau, Airflow, R.

<details>
<summary>Click for Answer</summary>

**Answer: A**
The standard framework for behavioral interviews.
</details>

### Question 3: Resume

Why are metrics important on a resume?
A) They look cool.
B) They prove Impact and Scope.
C) They fill space.
D) ATS requires them.

<details>
<summary>Click for Answer</summary>

**Answer: B**
"Managed large database" vs "Managed 50TB database".
</details>

### Question 4: Capstone Scope

Is it better to build one deep project or 10 shallow ones?
A) 10 shallow ones.
B) One deep, end-to-end project.
C) None.
D) 100 tiny ones.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Quality > Quantity. Show depth of thought.
</details>

### Question 5: Networking

What is the best way to apply for a job?
A) "Easy Apply" on LinkedIn.
B) Networking / Referral from an employee.
C) Faxing.
D) Carrier Pigeon.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Referrals are 10x more likely to be interviewed.
</details>

---

## Summary

Today you learned:

* ✅ **The Capstone**: Your proof of work.
* ✅ **Impact Resume**: Focus on Results, not Responsibilities.
* ✅ **STAR Method**: How to ace the behavioral interview.
* ✅ **Career Path**: Continuous learning is the only constant.

**Congratulations! You have completed the Phase 7 Daily Content.**
**Next Step**: The **Phase 7 Overview** & The **Final Capstone Exam**.
