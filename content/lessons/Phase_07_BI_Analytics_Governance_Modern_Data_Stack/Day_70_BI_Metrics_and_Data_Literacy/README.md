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

### 2. Unit Economics (LTV vs CAC)

Can you afford to buy a customer?

* **CAC (Customer Acquisition Cost)**: Total Marketing Spend / # New Customers.
* **LTV (Lifetime Value)**: Average Profit from a customer before they leave.
* **Golden Rule**: LTV must be > 3x CAC.
  * If you pay $\$100$ to get a customer (CAC) and they pay you $\$105$ (LTV), you will go bankrupt (overhead/salaries).

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

---

## Hands-on Lab

### Exercise 1: Cohort Logic

**Goal**: Calculate Month 1 Retention.

**Scenario**:

* January Cohort: 100 Signups.
* In February (Month 1), 60 of them are still active.
* February Cohort: 200 Signups.
* In March (Month 1), 80 of them are still active.

**Task**: Calculate Retention for both. Is it getting better or worse?

1. **Jan Retention**: $60 / 100 = 60\%$
2. **Feb Retention**: $80 / 200 = 40\%$

* *Conclusion*: **Worse**. We doubled our marketing (200 signups), but the quality of users (or product) dropped massively.

### Exercise 2: The Death Spiral (Unit Economics)

**Goal**: Identify a failing business.

**Scenario**:

* Marketing Spend: $50,000$
* New Customers: 500
* Subscription Price: $10/month$
* Average Lifetime: 6 months
* Gross Margin: 80% (Server costs take 20%)

**Calculation**:

1. **CAC**: $50,000 / 500 = \$100$
2. **Revenue per User**: $\$10 \times 6 = \$60$
3. **LTV (Profit)**: $\$60 \times 80\% = \$48$
4. **Ratio**: LTV (\$48) vs CAC (\$100).

* *Conclusion*: **You lose $52 every time you sign a customer.** Stop marketing immediately. Fix retention or pricing.

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

## Summary

Today you learned:

* ✅ **Lagging vs. Leading**: Revenue is the rear-view mirror; Activity is the windshield.
* ✅ **Cohorts**: The only true way to measure retention.
* ✅ **Unit Economics**: If LTV < CAC, you don't have a business; you have a charity.
* ✅ **Goodhart's Law**: Be careful what you measure (and incentivize).

**Tomorrow**: We explore the **Data Landscape**—Databases, Warehouses, Lakes, and Lakehouses.
