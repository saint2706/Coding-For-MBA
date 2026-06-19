---
day: 70
title: "BI Metrics & Data Literacy"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "bi-metrics"
duration: 120
difficulty: "intermediate"
tags:
  - analytics
  - kpis
  - retention
  - economics
  - metrics
concepts:
  - "lagging vs leading indicators"
  - "cohort analysis"
  - "LTV/CAC ratio"
  - "stickiness (DAU/MAU)"
  - "Goodhart's Law"
prerequisites:
  - "Basic Math (Ratios, Percentages)"
  - "Understanding of SaaS Business Model (optional but helpful)"
outcomes:
  - "Calculate and interpret Cohort Retention"
  - "Evaluate business health using Unit Economics"
  - "Identify when a metric is being gamed (Goodhart's Law)"
---

# 🎯 Day 70: BI Metrics & Data Literacy

> *"You can't manage what you can't measure. But if you measure the wrong thing, you manage the wrong thing."*

---

## The "Never-Coded" Bridge

**Imagine you want to lose weight.**

**Metric A (The Scale)**: You step on it. It says "200 lbs."

* This is a **Lagging Indicator**. It tells you what happened *last month*. You can't change it today.

**Metric B (Calories Eaten)**: You track your lunch.

* This is a **Leading Indicator**. If you eat fewer calories today, the scale *will* move next week. You can control this *right now*.

**Business is the same.**

* **Revenue** is a Lagging Indicator (The result of past work).
* **Active Demos Booked** is a Leading Indicator (Predicts future revenue).

**Key Lesson**: Reporting on Revenue explains the past. Reporting on Demos drives the future.

---

## The Technical Deep Dive

### 1. Cohort Analysis (The Triangle Chart)

"Average Retention is 80%" is a lie.

* Users who joined 2 years ago might love you (99% retention).
* Users who joined yesterday might hate you (10% retention).
* **Average**: 55%. This hides the fact that *new users hate the product*.

**Cohort Analysis** tracks groups of users based on when they joined (Start Month).

* Row: Jan Cohort, Feb Cohort, Mar Cohort.
* Column: Month 1, Month 2, Month 3.
* If the numbers drop faster in lower rows, your product is getting *worse*.

### 2. Unit Economics (LTV vs CAC) — With the Assumptions Made Explicit

Can you afford to buy a customer? The formulas look simple, but every one of them hides an assumption that
can flip the conclusion if you don't state it.

* **CAC (Customer Acquisition Cost)**: Total Marketing Spend / # New Customers.
  * *Hidden assumption*: which costs count? Fully-loaded CAC includes sales salaries, tooling, and overhead;
    "marketing-only" CAC just divides ad spend. The two numbers can differ by 2-3x for the same company —
    always state which one you're reporting.
* **LTV (Lifetime Value)**: Average **profit** (not revenue) from a customer before they leave.
  * *Hidden assumption*: LTV must use **contribution margin**, not gross revenue. If a BrightCart customer
    generates $200 in lifetime orders but cost of goods + fulfillment + payment processing eats 70% of that,
    the real LTV is $60, not $200. Skipping this step is the single most common LTV overstatement in industry.

#### Two kinds of LTV — don't mix them up

| Type | How it's computed | When to use it |
|---|---|---|
| **Cohort (historical) LTV** | Take a cohort that joined 24+ months ago; sum their *actual* contribution margin to date | Most defensible. Only works once a cohort has "matured" — too new a cohort understates LTV because they haven't had time to churn or re-purchase yet |
| **Predictive (formula) LTV** | `ARPU × Gross Margin % / Churn Rate` — extrapolates from current behavior | Needed for new cohorts/products with no mature history, but is only as good as the assumption that churn rate stays constant — which is rarely true (see counterexample below) |

#### The classic counterexample: `ARPU / Churn Rate` misleads when churn isn't constant

The formula `LTV = ARPU / Churn Rate` assumes churn is constant every period (a "flat hazard rate"). In
reality, most subscription and retail businesses have **declining churn over time** — customers who survive
the first 90 days churn much less afterward than brand-new signups. Concretely:

* BrightCart signs up 1,000 new customers. Month 1 churn is 15% (lots of one-time buyers never return).
  Among the 850 who return, month 2-12 churn drops to 3%/month (these are the genuinely loyal repeat buyers).
* If you naively apply Month 1's 15% churn to the whole formula: `LTV = $40 ARPU / 0.15 = $267`.
* If you use the blended, more realistic 12-month churn of roughly 5%: `LTV = $40 / 0.05 = $800`.
* The "true" cohort LTV, computed by actually tracking the cohort, lands close to the second number — the
  naive formula using early-tenure churn **understated LTV by 3x**, which would have made BrightCart wrongly
  reject acquisition channels that were actually profitable on a longer horizon.

**Rule of thumb**: never apply a single churn rate from an early period to the whole customer lifetime.
Either use a cohort's actual blended/matured churn rate, or build a separate curve for early vs. steady-state
churn.

#### Payback Period — the metric LTV:CAC ratio hides

LTV:CAC > 3:1 can still bankrupt a company if the payback period is too long. **Payback period** = CAC ÷
(monthly contribution margin per customer) = how many months until a customer's margin repays their
acquisition cost. A SaaS company with LTV:CAC of 5:1 but an 18-month payback period can run out of cash
*before* the value is realized, even though the ratio looks excellent on a spreadsheet. Always report payback
period alongside the ratio, especially for cash-constrained or high-growth companies.

#### Keep your time units consistent

Churn rate, ARPU, and CAC must all use the **same time unit**. A common, costly error: using **monthly**
churn (e.g., 2%/month) inside a formula that expects **annual** churn. Converting monthly to annual churn is
NOT simply `2% × 12 = 24%` — that overstates it, because some of the same customers who would have churned in
month 2 already churned in month 1. The correct approximation is `1 - (1 - monthly_churn)^12`, which for 2%
monthly gives `1 - 0.98^12 ≈ 21.5%` annual churn, not 24%. Always double-check which time unit a churn number
is already in before plugging it into LTV.

### 3. Stickiness (DAU / MAU)

How addictive is your app?

* **DAU**: Daily Active Users.
* **MAU**: Monthly Active Users.
* **Ratio**: If DAU = 100 and MAU = 1000, Ratio = 10%. (People open it 3 days a month).
* *Facebook*: ~66% (People open it 20 days a month).

---

## Senior-Level Insights

### Goodhart's Law

**"When a measure becomes a target, it ceases to be a good measure."**

* **Scenario**: You tell the support team: "Your target is to close tickets fast."
* **Result**: Agents hang up on difficult customers to keep "Call Duration" low.
* **Damage**: Customer satisfaction tanks, but the "Metric" looks Green.
* **Fix**: Pair metrics. "Low Duration" AND "High Satisfaction Score."

### Seasonality & Noise

* **The Panic**: "Sales dropped 20% in February!"
* **The Literacy**: "February has 28 days. January has 31. That is a 10% drop automatically. And Monday was a holiday."
* **Advice**: Always compare "Year over Year" (Feb 2023 vs Feb 2022), not "Month over Month" for seasonal businesses.

### North-Star Metrics and Guardrail (Counter) Metrics

A **north-star metric** is the single number that best captures the core value your product delivers — for
BrightCart, something like "Repeat Purchase Rate" might be the north star, because it captures both product
satisfaction and revenue durability better than raw signups or even total revenue. But optimizing a single
metric in isolation is dangerous — which is why every north star needs **guardrail metrics** (also called
counter-metrics) that catch the ways the north star could be gamed or could improve while the business gets
worse. If BrightCart's north star is Repeat Purchase Rate, guardrails should include: refund rate
(are reps gaming repeats by overselling?), customer support cost per order (are we buying repeats with
unsustainable service?), and gross margin (are we discounting our way to repeat purchases?).

### Metric Trees

A **metric tree** decomposes a single high-level metric into the operational levers that drive it, so a team
knows *which lever to pull*, not just that the top number moved. For BrightCart revenue:

```
Revenue
├── Orders
│   ├── Site Visitors (Traffic)
│   └── Conversion Rate
└── Average Order Value (AOV)
    ├── Units per Order
    └── Price per Unit
```

If Revenue drops, the tree tells you where to look first: did Traffic drop, did Conversion drop, or did AOV
drop? Each branch belongs to a different team (Marketing owns Traffic, Product owns Conversion, Merchandising
owns AOV) — the metric tree is also an ownership map.

### Denominator Bias

A ratio metric can improve for a bad reason: the denominator shrank. "Conversion Rate went up 5 points!" is
good news if traffic (the denominator) stayed flat or grew — but if a botched ad campaign cut low-intent
traffic in half, conversion rate rises mechanically even though *absolute* orders may have fallen. Always
check whether a ratio improved because the numerator grew or because the denominator shrank — they require
opposite responses.

### Simpson's Paradox

A trend can reverse direction when you aggregate vs. segment the data. Classic BrightCart example: overall
conversion rate might be flat year-over-year, while *every single channel* (web, app, marketplace) improved
individually — because the mix shifted toward a lower-converting channel (e.g., marketplace, which converts
worse but grew fastest). Reporting only the blended number would hide three genuine wins. Whenever a headline
trend looks surprising, check whether segment-level trends agree with it.

### Survivorship Bias

Measuring "average satisfaction of current customers" ignores everyone who churned and is no longer there to
answer the survey. If BrightCart's unhappiest customers leave fastest, the remaining customer base will
always look artificially satisfied — not because the product improved, but because the discontented have
already exited the sample. Any metric computed only on "still here" customers needs a churn-adjusted view to
be trustworthy.

### Metric Versioning

When a metric's definition changes (e.g., BrightCart redefines "Active Customer" to exclude marketplace
buyers), the historical trend line breaks — a chart that looks like a sudden 30% drop might just be a
definition change, not a business change. Senior BI teams **version** metric definitions: `Active Customer
v1` (2024-2025) vs. `Active Customer v2` (2026+), with the change documented and, where possible, the
historical series **restated** under the new definition so trends remain comparable. Never silently redefine
a metric in place.

### Production Metric Review Workflow

Once a metric (like LTV:CAC or Repeat Purchase Rate) is certified and feeding an executive dashboard, treat
its upkeep like a production system, not a one-time calculation:

1. **Owner of record**: One named team (e.g., BI Analytics) owns the metric's SQL definition and is the only
   group authorized to change it.
2. **Scheduled reconciliation**: Periodically (e.g., monthly) reconcile the BI number against a source-of-truth
   system — e.g., does BrightCart's BI-reported revenue match Finance's general ledger within an agreed
   tolerance? Discrepancies above tolerance trigger an investigation, not a shrug.
3. **Backfills**: When a pipeline bug is found, historical data must be recomputed (backfilled) for the
   affected date range — and every dashboard relying on it should be flagged "data corrected on [date]."
4. **Restatements**: When a metric definition changes (see Metric Versioning above), past periods are
   restated under the new definition, with a public changelog entry so nobody mistakes a definition change
   for a business change.
5. **Executive sign-off**: Material changes to a certified metric's definition or a material restatement of
   historical numbers requires sign-off from the metric's business owner (e.g., VP of Finance for revenue
   metrics) before it ships to the board — the same change-approval discipline introduced in the Phase 7 Day
   68 metric contract.

---

## Hands-on Lab

### Setup: BrightCart `customers` and `orders` Sample Data

This lab uses BrightCart's relational schema introduced in Phase 7 Day 68. Two tables are relevant here:
`customers(customer_id, signup_date, region, acquisition_channel)` and `orders(order_id, customer_id,
order_date, status, channel)`. Paste both samples into a SQL sandbox or pandas before starting.

```text
-- customers
customer_id,signup_date,region,acquisition_channel
C01,2026-01-05,West,paid_search
C02,2026-01-08,West,organic
C03,2026-01-12,East,paid_social
C04,2026-01-20,East,organic
C05,2026-02-02,West,paid_search
C06,2026-02-10,West,organic
C07,2026-02-15,East,paid_social
C08,2026-02-20,East,organic
C09,2026-03-01,West,paid_search
C10,2026-03-05,East,organic
```

```text
-- orders (status: placed|shipped|delivered|returned|cancelled)
order_id,customer_id,order_date,status,channel
O001,C01,2026-01-06,delivered,web
O002,C01,2026-02-10,delivered,web
O003,C02,2026-01-09,delivered,web
O004,C03,2026-01-15,delivered,app
O005,C03,2026-02-18,delivered,app
O006,C03,2026-03-20,delivered,app
O007,C04,2026-01-22,delivered,web
O008,C05,2026-02-03,delivered,marketplace
O009,C06,2026-02-12,delivered,web
O010,C06,2026-03-14,delivered,web
O011,C07,2026-02-16,delivered,app
O012,C08,2026-02-21,delivered,web
O013,C08,2026-03-25,delivered,web
O014,C09,2026-03-02,delivered,marketplace
O015,C10,2026-03-06,delivered,web
O016,C02,2026-02-09,cancelled,web
```

### Exercise 1: Building a Cohort Retention Matrix

**Goal**: Build the same "Triangle Chart" cohort matrix described in the Technical Deep Dive, using real
BrightCart signup and order data instead of pre-computed numbers.

**Steps**:
1. Assign each customer to a signup cohort by month: C01-C04 = **Jan cohort** (4 customers), C05-C08 = **Feb
   cohort** (4 customers), C09-C10 = **Mar cohort** (2 customers).
2. For each cohort, determine which customers placed at least one `delivered` order in each subsequent
   calendar month after their signup month (Month 0 = signup month, Month 1 = the next month, etc.).
3. Build the retention matrix (% of cohort with at least 1 delivered order that month).

**Expected output**:

| Cohort | Size | Month 0 | Month 1 | Month 2 |
|---|---|---|---|---|
| Jan (C01-C04) | 4 | 100% (4/4 ordered in Jan) | 25% (1/4: only C01 ordered in Feb) | 25% (1/4: only C03 ordered in Mar) |
| Feb (C05-C08) | 4 | 100% (4/4 ordered in Feb) | 50% (2/4: C06 and C08 ordered in Mar) | — (no data yet) |
| Mar (C09-C10) | 2 | 100% (2/2 ordered in Mar) | — (no data yet) | — (no data yet) |

**Interpretation**: Month 1 retention improved from 25% (Jan cohort) to 50% (Feb cohort) — a genuine
improvement signal, though with only 4 customers per cohort this sample is too small to be statistically
meaningful in a real business (use this lab to practice the *mechanics*; a real cohort analysis needs
hundreds of customers per cohort minimum before you'd act on a 25-point swing).

### Exercise 2: BrightCart Unit Economics — Is Paid Search Worth It?

**Goal**: Use the `orders` and `customers` tables to compute a real CAC and a *cohort-based* LTV for one
acquisition channel, and decide whether BrightCart should keep spending on it.

**Scenario**: BrightCart spent **$1,200** on paid search marketing this quarter. Customers C01, C05, and C09
were acquired via `paid_search` (3 new customers). Assume BrightCart's gross margin is 75% (25% goes to cost
of goods + fulfillment).

**Steps**:
1. **CAC** = Marketing Spend ÷ New Customers = `$1,200 / 3 = $400` per customer.
2. From the `orders` table, sum the delivered order revenue for C01, C05, and C09 specifically. (For this
   exercise, assume each `delivered` order has a flat order value of $150 — in a real BrightCart query you'd
   join to `order_items` to compute this precisely.)
   - C01: 2 delivered orders → $300
   - C05: 1 delivered order → $150
   - C09: 1 delivered order → $150
   - Total revenue from this paid_search cohort so far: $600 across 3 customers = $200 average revenue per
     customer **so far** (this is a partial-period cohort LTV, not a mature one — see the Glossary note on
     Cohort LTV).
3. **LTV (Profit) so far** = $200 × 75% gross margin = **$150 per customer**.
4. **Ratio**: LTV ($150) vs. CAC ($400) → **0.375 : 1**.

**Expected conclusion**: At this early stage, paid search is running at a loss (LTV:CAC well below the 3:1
healthy benchmark). But — critically — this is only 1-3 months of cohort history; per the LTV section above,
judging a channel's LTV from an immature cohort is exactly the mistake the `ARPU / Churn Rate` counterexample
warns against. **Correct next step**: don't kill the channel yet — let the cohort mature 6-12 months and
re-run this calculation before making a final call, while watching the payback period in the interim.

### Exercise 3: Leading Indicators

**Goal**: Select a leading metric for "Quarterly Revenue".

**Scenario**: You sell Enterprise Software (3-month sales cycle).

**Options**:

1. Revenue (Lagging - tells you about deals started 3 months ago).
2. Contracts Signed (Lagging - just happened).
3. **New Qualified Opportunities Created** (Leading - will close in 3 months).
4. Website Hits (Too early/noisy).

* *Selection*: **New Qualified Opportunities**. If this drops in January, Revenue *will* drop in April.

---

## Translation Lab: Metric Design for ML Accountability

**Scenario**: Teams track accuracy but miss model decay and subgroup harm until quarterly reviews.

**Your task**:

1. Reframe causal/fairness outputs into business KPI narratives for growth, efficiency, and trust.
2. Define a BI metric framework to detect degradation and bias over time (leading + lagging indicators).
3. Convert monitoring signals into dashboard layouts, threshold bands, and escalation rules.
4. Write a one-page decision memo justifying metric priorities and intervention policy.

---

## Mastery Check

### Question 1: Goodhart's Law

What happens when you incentivize a specific metric too hard?
A) Performance improves perfectly.
B) People find ways to "game" the metric, often hurting the business.
C) The data quality improves.
D) Nothing.

<details>
<summary>Click for Answer</summary>

**Answer: B**
"Gaming the system" is the direct result of Goodhart's Law.
</details>

### Question 2: Leading Indicator

Which is a Leading Indicator for "Weight Loss"?
A) Weight on Scale.
B) Waist Size.
C) Calories Burned today.
D) BMI.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Actionable input that predicts the future output.
</details>

### Question 3: LTV/CAC

A healthy SaaS business should have an LTV:CAC ratio of:
A) 1:1 (Break even)
B) 3:1 or higher
C) 0.5:1 (Loss leader)
D) 100:1

<details>
<summary>Click for Answer</summary>

**Answer: B**
3:1 is the industry standard benchmark for sustainability.
</details>

### Question 4: Cohort Analysis

Why is Cohort Analysis better than "Average Churn"?
A) It looks cooler.
B) It reveals trends over time (e.g., Are new users churning faster than old users?).
C) It averages everything into one number.
D) It ignores time.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It isolates groups by time, revealing product health trends.
</details>

### Question 5: Seasonality

Sales are down 50% on Christmas Day compared to November 25th (Black Friday). Should you panic?
A) Yes, the business is dying.
B) No, this is expected seasonality. Compare Christmas to *last* Christmas.
C) Yes, fire the marketing team.
D) No, data is wrong.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Context (Holidays) is critical for interpreting data.
</details>

---

## Cross-References

* Phase 7 Day 68 — BI Analyst Foundations (metric contracts and certified datasets underpin every metric defined here)
* Phase 7 Day 69 — BI Strategy & Stakeholders (the selection-bias confound in the Loyalty Program lab is the same Simpson's/cohort-immaturity trap covered here)
* Phase 7 Day 78 — BI Experimentation & Predictive Insights (extends cohort/predictive LTV into formal experimentation)
* Phase 7 Day 80 — BI Data Quality & Governance (formalizes the production metric review workflow's backfill/restatement process)
* Phase 6 Day 63 — Causal Inference & Uplift (rigorous treatment of the confounding issues behind Simpson's paradox and survivorship bias)

## Glossary

* **Cohort** — A group of customers who share a starting event (typically signup month), tracked together over time.
* **Retention** — The percentage of a cohort still active (or still ordering) in a later period.
* **ARPU (Average Revenue Per User)** — Total revenue divided by number of users in a period.
* **CAC (Customer Acquisition Cost)** — Total acquisition spend divided by number of new customers acquired.
* **LTV (Lifetime Value)** — The total profit (contribution margin, not revenue) expected from a customer over their relationship with the business.
* **Churn** — The rate at which customers stop buying/subscribing in a given period.
* **Leading Indicator** — A metric that predicts future outcomes and can still be acted on (e.g., qualified opportunities).
* **Lagging Indicator** — A metric that reports a past outcome and can no longer be changed (e.g., last quarter's revenue).
* **Goodhart's Law** — "When a measure becomes a target, it ceases to be a good measure" — incentivizing a metric too hard invites gaming.
* **Simpson's Paradox** — A trend that reverses direction when data is aggregated versus segmented.
* **Survivorship Bias** — Distortion from measuring only the population that "survived" (e.g., current customers), ignoring those who churned out of the sample.

---

## Summary

Today you learned:

* ✅ **Lagging vs. Leading**: Revenue is the rear-view mirror; Activity is the windshield.
* ✅ **Cohorts**: The only true way to measure retention.
* ✅ **Unit Economics**: If LTV < CAC, you don't have a business; you have a charity.
* ✅ **Goodhart's Law**: Be careful what you measure (and incentivize).

**Tomorrow**: We explore the **Data Landscape**—Databases, Warehouses, Lakes, and Lakehouses.
