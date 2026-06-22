---
day: 142
title: "Product Analytics Deep Dive — Retention, Funnels, Cohorts"
phase: 12
phaseTitle: "Analytics Engineering & Data Products"
slug: "product-analytics"
duration: 90
difficulty: "intermediate"
tags:
  - product-analytics
  - retention
  - funnels
  - cohort-analysis
  - amplitude
concepts:
  - "product analytics frameworks"
  - "retention curves and cohort analysis"
  - "funnel analysis and conversion optimization"
  - "engagement metrics (DAU/MAU, stickiness)"
  - "product-led growth metrics"
prerequisites:
  - "Day 133: Analytics Engineer Role"
  - "Day 86: SQL Fundamentals"
outcomes:
  - "Build retention cohort tables from raw event data"
  - "Design conversion funnels with drop-off analysis"
  - "Calculate engagement metrics that drive product decisions"
---

# 📊 Day 137: Product Analytics Deep Dive — Retention, Funnels, Cohorts

> *"The most dangerous metric in product analytics is 'total users.' It hides everything — growth, churn, engagement, and whether anyone actually finds your product valuable."*

---

## The "Never-Coded" Bridge

**Think of product analytics like a doctor's checkup.** Total users is like body weight — a single number that tells you almost nothing about health. Real diagnosis requires vitals: heart rate (daily active users), blood pressure (retention), cholesterol (churn rate), and stress tests (conversion funnels). Product analytics provides the vitals that tell you whether your product is truly healthy — or just growing while quietly dying.

---

## The Technical Deep Dive

### 1. The Product Analytics Framework

Product analytics is usually organized around the AARRR ("pirate metrics") funnel: a user moves through acquisition, activation, engagement, retention, and revenue, and each stage answers a different question with different metrics. The dictionary below is the map you'll use for the rest of this lesson — sections 2-4 dig into the engagement and retention stages specifically, since they're the hardest to get right and the easiest to ignore.

```python
product_analytics_framework = {
    "acquisition": {
        "question": "How do users find us?",
        "metrics": ["New users/day", "Source attribution", "CAC by channel"],
    },
    "activation": {
        "question": "Do users experience the 'aha moment'?",
        "metrics": ["Onboarding completion", "Time to first value", "Activation rate"],
    },
    "engagement": {
        "question": "How often do users come back?",
        "metrics": ["DAU/MAU", "Session frequency", "Feature adoption"],
    },
    "retention": {
        "question": "Do users stay?",
        "metrics": ["D1/D7/D30 retention", "Cohort curves", "Churn rate"],
    },
    "revenue": {
        "question": "Do they pay?",
        "metrics": ["ARPU", "LTV", "Conversion to paid", "Expansion revenue"],
    },
}
```

### 2. Cohort Retention Analysis

A retention cohort groups users by *when they first showed up* (their cohort month), then tracks what fraction of each cohort is still active 1, 2, 3... months later. This SQL builds that table from a raw `events` log: first find each user's cohort month, then their monthly activity, then express activity as "months since signup" so cohorts of different ages can be compared on the same x-axis.

```sql
-- Build a monthly retention cohort from raw events

WITH first_activity AS (
    SELECT
        user_id,
        DATE_TRUNC('month', MIN(event_timestamp)) AS cohort_month
    FROM events
    WHERE event_type IN ('login', 'page_view', 'purchase')
    GROUP BY user_id
),

monthly_activity AS (
    SELECT DISTINCT
        user_id,
        DATE_TRUNC('month', event_timestamp) AS activity_month
    FROM events
),

cohort_data AS (
    SELECT
        f.cohort_month,
        m.activity_month,
        DATE_DIFF(m.activity_month, f.cohort_month, MONTH) AS months_since_signup,
        COUNT(DISTINCT m.user_id) AS active_users
    FROM first_activity f
    JOIN monthly_activity m ON f.user_id = m.user_id
    GROUP BY f.cohort_month, m.activity_month
),

cohort_sizes AS (
    SELECT cohort_month, COUNT(DISTINCT user_id) AS cohort_size
    FROM first_activity
    GROUP BY cohort_month
)

SELECT
    cd.cohort_month,
    cs.cohort_size,
    cd.months_since_signup,
    cd.active_users,
    ROUND(cd.active_users * 100.0 / cs.cohort_size, 1) AS retention_pct
FROM cohort_data cd
JOIN cohort_sizes cs ON cd.cohort_month = cs.cohort_month
ORDER BY cd.cohort_month, cd.months_since_signup;
```

### 3. Funnel Analysis

A funnel measures how many sessions make it through each step of a flow, and — more importantly — what fraction is lost at each transition. The query below pivots one row per session into "did this session reach step N" flags, then aggregates those flags into a step-by-step conversion and drop-off report, which is what makes it possible to spot exactly where users abandon the flow (see Mastery Check Q4).

```sql
-- E-commerce conversion funnel: Visit → Product View → Add to Cart → Checkout → Purchase

WITH funnel_steps AS (
    SELECT
        session_id,
        user_id,
        MAX(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS step_1_visit,
        MAX(CASE WHEN event_type = 'product_view' THEN 1 ELSE 0 END) AS step_2_view,
        MAX(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END) AS step_3_cart,
        MAX(CASE WHEN event_type = 'checkout_start' THEN 1 ELSE 0 END) AS step_4_checkout,
        MAX(CASE WHEN event_type = 'purchase' THEN 1 ELSE 0 END) AS step_5_purchase
    FROM events
    WHERE event_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY session_id, user_id
)

SELECT
    'Visit' AS step,
    COUNT(*) AS sessions,
    100.0 AS conversion_pct,
    NULL AS drop_off_pct
FROM funnel_steps
UNION ALL
SELECT 'Product View', SUM(step_2_view),
    ROUND(SUM(step_2_view) * 100.0 / COUNT(*), 1),
    ROUND((1 - SUM(step_2_view) * 1.0 / COUNT(*)) * 100, 1)
FROM funnel_steps
UNION ALL
SELECT 'Add to Cart', SUM(step_3_cart),
    ROUND(SUM(step_3_cart) * 100.0 / COUNT(*), 1),
    ROUND((1 - SUM(step_3_cart) * 1.0 / NULLIF(SUM(step_2_view), 0)) * 100, 1)
FROM funnel_steps
UNION ALL
SELECT 'Checkout', SUM(step_4_checkout),
    ROUND(SUM(step_4_checkout) * 100.0 / COUNT(*), 1),
    ROUND((1 - SUM(step_4_checkout) * 1.0 / NULLIF(SUM(step_3_cart), 0)) * 100, 1)
FROM funnel_steps
UNION ALL
SELECT 'Purchase', SUM(step_5_purchase),
    ROUND(SUM(step_5_purchase) * 100.0 / COUNT(*), 1),
    ROUND((1 - SUM(step_5_purchase) * 1.0 / NULLIF(SUM(step_4_checkout), 0)) * 100, 1)
FROM funnel_steps;
```

### 4. Engagement Metrics

Retention tells you whether users come back *at all*; engagement metrics tell you how *habitual* their usage is once they do. The four metrics below — most notably DAU/MAU — are the standard vocabulary for that, with benchmark ranges so you can judge whether a number is healthy or a warning sign (see Mastery Check Q3 for the B2B vs. B2C caveat).

```python
engagement_metrics = {
    "DAU_MAU_ratio": {
        "formula": "Daily Active Users / Monthly Active Users",
        "interpretation": {
            "> 0.5": "Exceptional (Facebook-level: users come daily)",
            "0.3 - 0.5": "Great (Slack, productivity tools)",
            "0.1 - 0.3": "Good (most SaaS products)",
            "< 0.1": "Concerning (users rarely come back)",
        },
    },
    "stickiness": {
        "formula": "# days each user was active / total days in period",
        "interpretation": "Higher = more habitual usage",
    },
    "power_users": {
        "formula": "Users active on 21+ days per month",
        "target": "10-25% of MAU should be power users",
    },
    "feature_adoption": {
        "formula": "Users who used feature X / Total MAU",
        "purpose": "Track whether new features get traction",
    },
}
```

---

## Glossary

| Term | Definition |
|---|---|
| **Cohort** | A group of users who share a starting point in time (e.g., signed up the same month), tracked together to compare survival/retention over time. |
| **Retention Curve** | A chart of % of a cohort still active at month 0, 1, 2... — used to judge whether a product has found durable value. |
| **D1/D7/D30 Retention** | The percentage of a cohort still active 1, 7, or 30 days after signup — common short-horizon retention checkpoints. |
| **Funnel** | An ordered sequence of steps a user takes toward a goal (e.g., Visit → Cart → Purchase), analyzed for conversion and drop-off at each step. |
| **Drop-off Rate** | The percentage of users who do not advance from one funnel step to the next. |
| **DAU/MAU Ratio** | Daily Active Users divided by Monthly Active Users — a measure of how habitual (daily) vs. occasional (monthly-only) usage is. |
| **Stickiness** | The average number of days per period a user is active, divided by the total days in that period — a finer-grained habituality measure than DAU/MAU. |
| **Power User** | A user active on a high threshold of days per month (commonly 21+); tracked as a % of MAU. |
| **North Star Metric** | The single metric that best represents the core value a product delivers to users, chosen because it correlates with long-term retention and revenue. |
| **AARRR Framework** | "Pirate metrics": Acquisition, Activation, Retention, Referral (Engagement in this lesson's variant), Revenue — a standard product-analytics funnel structure. |
| **Cart Abandonment Rate** | The percentage of shoppers who add an item to cart but never complete checkout; typically ~70% in e-commerce. |

---

## Hands-on Lab

### Exercise 1: Build a Retention Cohort

```sql
-- Scenario: a mobile fitness app. Source table: events
-- (user_id, event_type, event_timestamp), event_type IN
-- ('app_open','workout_logged','signup'). 12 weeks of history available.
--
-- Sample weekly cohort sizes and D7-active counts (already aggregated):
-- | cohort_week | cohort_size | active_at_d7 |
-- |-------------|-------------|---------------|
-- | 2025-01-06  | 1200        | 540           |
-- | 2025-01-13  | 1100        | 396           |
-- | 2025-01-20  | 1500        | 690           |  -- launched a new onboarding flow this week
-- | 2025-01-27  | 1050        | 410           |

-- TODO: Write SQL to create a weekly retention cohort for a mobile app over
-- the last 12 weeks. Identify which cohorts have the best D7 retention and
-- hypothesize why.

-- EXPECTED RESULT:
-- D7 retention % = active_at_d7 / cohort_size * 100
-- | cohort_week | d7_retention_pct |
-- |-------------|------------------|
-- | 2025-01-06  | 45.0%            |
-- | 2025-01-13  | 36.0%            |
-- | 2025-01-20  | 46.0%            |  <- best D7 retention
-- | 2025-01-27  | 39.0%            |
-- Hypothesis: the 2025-01-20 cohort's D7 retention jump (36% -> 46%) lines
-- up with the new onboarding flow shipped that week — worth confirming with
-- an A/B test (Day 143) rather than attributing the lift to the cohort alone.
```

### Exercise 2: Funnel Optimization

```markdown
Given this funnel: Visit (100K) → Signup (20K) → Onboard (8K) → First Action
(3K) → Return Day 7 (1K), identify the biggest drop-offs and suggest 3
product experiments.

EXPECTED RESULT:
- Step conversion rates: Visit->Signup 20%, Signup->Onboard 40%,
  Onboard->First Action 37.5%, First Action->Return D7 33.3%.
- Biggest absolute drop-off: Visit -> Signup (80K lost, 80%) — but this is
  expected for top-of-funnel traffic and lower leverage per user reached.
- Biggest *relative* leverage drop-off: Onboard -> First Action (5K lost,
  62.5% of onboarded users never take a first action) — these are users who
  already invested in onboarding, making them the highest-value group to
  recover.
- 3 experiments: (1) Add a guided "do this one thing" prompt immediately
  after onboarding completes, targeting the Onboard->First Action gap.
  (2) Simplify the signup form (fewer fields) to test Visit->Signup lift.
  (3) Send a triggered email/push 24h after first action if no D7 return,
  reminding users of the value they got from their first action.
```

### Exercise 3: North Star Metric

```markdown
# Scenario: a B2B SaaS project-management product (think: a lightweight
# Asana competitor) with 5,000 paying teams.

Define the North Star Metric for a B2B SaaS product and design a dashboard
showing it alongside 3 supporting metrics with weekly trends.

EXPECTED RESULT:
- North Star Metric: "Weekly Active Tasks Completed per Team" — captures
  the core value (work getting done) better than "logins" or "signups,"
  and correlates with renewal likelihood.
- Supporting metrics (weekly trend lines): (1) DAU/MAU ratio (engagement
  health), (2) % of teams with 3+ active members (adoption depth within an
  account, predicts expansion), (3) average time-to-first-task-completed
  for new teams (activation speed).
- Dashboard layout: North Star as a large weekly trend line at the top;
  the 3 supporting metrics as smaller trend cards below, each annotated
  with the week any major product change shipped, so trend shifts can be
  attributed to specific releases.
```

---

## Mastery Check

**Q1**: Why is retention more important than acquisition?
<details><summary>Answer</summary>
Acquisition without retention is a leaky bucket — you spend $50 to acquire a user who churns after 2 days. A 5% improvement in retention can increase lifetime value by 25-95% (Bain & Company). Retention compounds: retained users generate revenue, refer others, and reduce acquisition costs. Focus on retention first, then scale acquisition.
</details>

**Q2**: What does a "flattening" retention curve tell you?
<details><summary>Answer</summary>
A flattening retention curve means you've found your core user base — users who remain after the initial drop-off are likely to stay long-term. The flattening point indicates product-market fit for that segment. If the curve never flattens (keeps declining), you have a product-market fit problem — no segment of users finds ongoing value.
</details>

**Q3**: What is the DAU/MAU ratio and what's a good target for a SaaS B2B product?
<details><summary>Answer</summary>
DAU/MAU measures daily engagement within monthly active users. For B2B SaaS, 0.3-0.5 is excellent (users engage daily as part of their workflow). Below 0.1 is concerning for B2B — users aren't incorporating the product into daily work. Note: B2C benchmarks are different; social apps can exceed 0.5 while marketplace apps might be 0.1 and still healthy (users buy infrequently).
</details>

**Q4**: Where is the biggest leverage point in a typical e-commerce funnel?
<details><summary>Answer</summary>
Usually the "Add to Cart → Checkout" transition (cart abandonment rate is typically 70%). Even a 5% improvement here drives significant revenue. Tactics: guest checkout, saved payment methods, transparent pricing (no surprise fees), urgency indicators, abandoned cart emails. The "Visit → Product View" transition also matters for discovery/search UX.
</details>

**Q5**: What is a "North Star Metric" and how do you choose one?
<details><summary>Answer</summary>
A North Star Metric is the one metric that best captures the core value your product delivers to customers. Examples: Spotify = "time spent listening," Airbnb = "nights booked," Slack = "messages sent per user per day." Choose it by asking: "What user action most correlates with long-term retention and revenue?" It should be actionable, measurable, and tied to customer value — not vanity metrics like "total signups."
</details>

---

## Summary

- ✅ **Framework**: Acquisition → Activation → Engagement → Retention → Revenue
- ✅ **Retention cohorts**: Track user survival curves — the true health metric
- ✅ **Funnel analysis**: Find and fix conversion drop-offs for maximum business impact
- ✅ **Engagement**: DAU/MAU ratio, stickiness, power user % — habitual usage signals
- ✅ **North Star Metric**: One metric that captures the value you deliver

**Tomorrow → Day 138**: **A/B Testing at Scale** — statistical rigor, experimentation platforms, and data-driven decision-making.
