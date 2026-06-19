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

## What "Production-Ready" Means for the Capstone (Not Just "It Runs")

A capstone that only runs on your laptop once is a demo, not a deliverable. Hiring managers and senior reviewers look for evidence that you understand what it takes to operate a BI system, not just build one. Address each of these explicitly in your repo (most belong in `runbook.md`):

1. **Metric Contracts**: Each metric in `metrics/metrics_layer.yml` needs a written contract — grain (one row per what?), filter conditions (what's excluded and why), and owner (who can change the definition). This is the same discipline from Phase 7 Day 84C's semantic layer section. A metric without a contract is just a SQL snippet with a brand name.
2. **Tests**: Column-level tests (`not_null`, `unique`, `accepted_values`, `relationships`) on every mart, plus at least one custom/singular test that encodes a business rule (e.g., "revenue can never be negative"). Tests are your capstone's proof that you thought about failure modes, not just the happy path.
3. **Lineage**: Run `dbt docs generate && dbt docs serve` and screenshot (or link) the DAG. A reviewer should be able to see `raw_orders -> stg_orders -> int_order_items -> fct_revenue` without reading your SQL.
4. **Access & Privacy Controls**: Even in a local DuckDB project, document what you *would* lock down in production — which roles see raw PII (customer emails), which see only aggregated marts. This is the RACI/stewardship thinking from Phase 7 Day 80, applied to your own project.
5. **Orchestration**: State how this would run on a schedule in production (Airflow, Dagster, dbt Cloud jobs, or a cron-triggered script) — reusing or simulating the idempotent pipeline pattern from Phase 7 Day 82. You don't need to deploy a scheduler; you need to show you know what scheduling this would require (frequency, dependencies, retry/backfill behavior).
6. **CI/CD**: Describe (or implement, for extra credit) a CI check that runs `dbt test` on every pull request before merging to main. Even a one-paragraph description of "what CI would gate" demonstrates production thinking.
7. **Monitoring**: Name the one or two checks you'd alert on if this were real (e.g., `dbt source freshness` failing, row-count drop > 20% day-over-day) and who would get paged.
8. **Cost Estimate**: Reuse the costed-warehouse-design thinking from Phase 7 Day 83 — even a rough "if this ran on Snowflake instead of DuckDB, here's what I'd budget for compute and storage" paragraph shows you think about BI systems as something that costs money to operate, not just code to write.
9. **Runbook**: Your `runbook.md` should name an owner, a freshness SLA (e.g., "marts must refresh within 24 hours of source data landing"), and at least one failure mode with a concrete response step (e.g., "if `dbt source freshness` reports STALE, check the upstream extract job before re-running models").
10. **Stakeholder Adoption Plan**: One paragraph — who is the audience for each of your three dashboard views (Executive, Marketing, Operations), how will they be onboarded to it, and how will you know if they're actually using it instead of falling back to spreadsheets?

None of this needs to be elaborate. A bulleted paragraph per item in `runbook.md` is enough to demonstrate you understand the full lifecycle — that's the difference between "I built a dashboard" and "I can own a BI system."

---

## BI Career Paths: Know What You're Interviewing For

"BI" covers several distinct roles with overlapping but different skill emphases. Knowing which one you're aiming for changes how you frame your capstone and your resume.

| Role | Core Skill Emphasis | Typical Capstone Angle |
|---|---|---|
| **BI / Data Analyst** | SQL, dashboarding, stakeholder communication, business context | Lead with the Executive/Marketing/Operations dashboard and the insight you found |
| **Analytics Engineer** | dbt, data modeling, testing, the transformation layer between raw data and BI tools | Lead with the dbt project — model count, test coverage, mart design |
| **BI Engineer / BI Developer** | Pipeline reliability, semantic layer, platform administration, governance | Lead with the runbook, orchestration design, and metric-contract governance |
| **Data/Analytics Manager** (later-career) | Roadmap prioritization, stakeholder alignment, team standards | Lead with the stakeholder adoption plan and the "why this metric, why now" reasoning |

**Portfolio review criteria** (what a hiring manager actually checks, in order):
1. Does the README explain a *business* problem before any code appears?
2. Can I run it myself in under 15 minutes? (This is why the capstone pins BrightCart's seed data and gives exact setup commands.)
3. Are there tests, or is this "code that happened to work once"?
4. Is there one clearly stated number (revenue impact, time saved, risk caught) that didn't exist before this project?
5. Is the SQL/dbt code readable by someone other than the author?

**Technical interview prep**: Expect a mix of (a) SQL-on-a-whiteboard questions (joins, window functions, aggregation — see Phase 7 Day 73), (b) "walk me through your dbt project" architecture questions, and (c) behavioral/STAR questions about a time you found an insight or handled bad data. Prepare one 90-second walkthrough of your capstone that covers problem, approach, and impact — you will be asked to do this in nearly every BI interview.

**Case studies**: Many BI interviews include a live or take-home case study ("here's a CSV, find an insight in 30 minutes"). Practice the muscle of going from raw data to one defensible insight quickly — your capstone's depth doesn't help if you can't also work fast under interview conditions.

**Ethical use of public data**: If you choose the Public Dataset alternative (Olist, Superstore, or any other), credit the source explicitly, respect its license terms, and never present synthetic/public-dataset findings as if they came from real proprietary work in an interview — misrepresenting a portfolio dataset as "data from my last job" is a integrity red flag that can end an interview on the spot. State the dataset's origin plainly in your README.

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

## Cross-References

* **Phase 7 Day 68**: BrightCart's schema and first stakeholder brief — the business problem your capstone solves.
* **Phase 7 Day 81**: Star schema design (`fact_orders`, `dim_customers`) — reused as your capstone's dbt mart structure.
* **Phase 7 Day 83**: Costed warehouse design and FinOps controls — reused for your capstone's cost-estimate section.
* **Phase 7 Day 84B**: The runnable `sample_dbt_project` — the dbt project you extend with your own mart and tests.
* **Phase 7 Day 84C**: Semantic layer metric definitions and Reverse ETL sync design — the pattern your new governed metric follows.

---

## Glossary

* **Portfolio**: A curated collection of work (code, dashboards, write-ups) that demonstrates your ability to solve real problems, not just list skills.
* **Capstone**: A single, deep, end-to-end project that proves you can take a business problem from raw data to a decision-ready deliverable.
* **STAR Method**: A behavioral-interview answer structure — Situation, Task, Action, Result.
* **Fact Table**: A table holding measurable, numeric business events (e.g., `fct_revenue`) at a defined grain — one row per order, per transaction, etc.
* **Dimension Table**: A table holding descriptive attributes (e.g., `dim_customers`) used to filter, group, or label facts.
* **Reproducibility**: The property that another analyst, given your documented data sources and steps, can rerun your work and get the same numbers.
* **Governance Readiness**: Evidence that data definitions, ownership, quality checks, and access/privacy controls are documented and enforced, not assumed.
* **Acceptance Test**: A pass/fail check (e.g., `dbt test` exits 0) that defines "done" for a deliverable in a way a reviewer can verify without reading all the code.
* **Runbook**: A short operational document naming an owner, a freshness SLA, and response steps for known failure modes.
* **Analytics Engineer**: A BI role focused on the transformation layer (commonly dbt) between raw source data and the tools analysts and dashboards consume.
* **Showback/Chargeback**: Reporting (or actually billing) infrastructure cost back to the team that incurred it — relevant to your capstone's cost-estimate section.
* **Stakeholder Adoption Plan**: A statement of who will use a deliverable, how they'll be onboarded, and how usage will be measured — without it, a dashboard is just a file nobody opens.

---

## Summary

Today you learned:

* ✅ **The Capstone**: Your proof of work.
* ✅ **Impact Resume**: Focus on Results, not Responsibilities.
* ✅ **STAR Method**: How to ace the behavioral interview.
* ✅ **Career Path**: Continuous learning is the only constant.

**Congratulations! You have completed the Phase 7 Daily Content.**
**Next Step**: Review `Phase_Overview.md` (in this phase's root folder) for the full Phase 7 milestone map, then continue to Phase 7 Day 84B (dbt Fundamentals) and Day 84C (Reverse ETL & Semantic Layer) to build the technical artifacts your capstone extends.
