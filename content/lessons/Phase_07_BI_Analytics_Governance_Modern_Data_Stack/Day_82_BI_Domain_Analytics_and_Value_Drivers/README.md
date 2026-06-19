---
day: 82
title: "BI Domain Analytics & Value"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "domain-analytics"
duration: 120
difficulty: "advanced"
tags:
  - marketing-analytics
  - product-analytics
  - sales-analytics
  - finance
concepts:
  - "The Funnel (AARRR)"
  - "Churn & Retention"
  - "MRR/ARR"
  - "Inventory Turn"
prerequisites:
  - "Understanding of Metrics (Day 70)"
  - "Basic Math"
outcomes:
  - "Calculate SaaS Metrics (MRR, Churn)"
  - "Analyze a Marketing Funnel"
  - "Optimize Supply Chain (Inventory Days)"
---

# 🎯 Day 77: BI Domain Analytics & Value

> *"Every department speaks a different language. Marketing speaks 'Leads'. Sales speaks 'Deals'. Finance speaks 'Cash'. Your job is to be the translator."*

---

## The "Never-Coded" Bridge

**The General Practitioner vs. The Specialist.**

* **Day 68 (Generalist)**: "I can make a chart." (Like a GP checking your pulse).
* **Day 77 (Specialist)**:
  * **Cardiologist (Finance)**: cares about "Cash Flow Pressure."
  * **Neurologist (Product)**: cares about "User Engagement Synapses."
  * **Surgeon (Sales)**: cares about "Cutting Inefficiency (Close Rate)."

If you show "User Engagement" to the CFO (Cardiologist), they won't care. You must know **Domain Context**.

---

## The Technical Deep Dive

### 1. Marketing: The Funnel (AARRR)

Dave McClure's Pirate Metrics:

1. **Acquisition**: They visit the site. (Metric: CPC - Cost Per Click).
2. **Activation**: They sign up. (Metric: Conversion Rate).
3. **Retention**: They come back. (Metric: Day-30 Retention).
4. **Referral**: They tell friends. (Metric: K-Factor / Virality).
5. **Revenue**: They pay. (Metric: LTV).

**The Leak**: Where do people drop off?

* 1000 Visitors -> 100 Signups (10%) -> 1 Payer (1%).
* *Insight*: Fix the Sign-up flow, not the Ad.

### 2. Product: Active Usage

* **DAU/MAU**: Sticky factor.
* **Feature Adoption**: "We built a new 'Dark Mode'. Who uses it?"
  * `Usage % = Users who toggled / Total Active Users`.
* **Time to Value**: How long from Sign-up to "First Success"? (e.g., First song played on Spotify).

### 3. Sales: Pipeline Velocity

* **Formula**: `(Leads * Win Rate * Deal Size) / Sales Cycle Length`.
* *Goal*: Increase Velocity.
  * Method A: Get more leads? (Hard).
  * Method B: Shorten cycle (Easy - cut meetings!).

### 4. Finance: MRR (Monthly Recurring Revenue)

* **New MRR**: +$100 (New Customer).
* **Expansion MRR**: +$50 (Existing Customer upgraded).
* **Churn MRR**: -$100 (Customer cancelled).
* **Net New MRR**: `New + Expansion - Churn`.

---

## Senior-Level Insights

### Don't be a "Chart Monkey"

* **Junior**: "Here is the chart of Sales you asked for."
* **Senior**: "I noticed Sales dropped 10% in Europe. I dug in and found it's because the Euro is weak against the Dollar (FX Rate). It's not a performance issue; it's a currency issue."

### The "One Metric That Matters" (OMTM)

* At **Facebook** (Early Days): "7 Friends in 10 Days." (Product Retention).
* At **Uber**: "Rider Wait Time." (Supply/Demand Balance).
* *Advice*: Identify the OMTM for *your* specific company stage.

---

## Hands-on Lab

### Exercise 1: Funnel Analysis

**Goal**: Calculate Conversion Rates.

**Data**:

* Visits: 10,000
* Signups: 500
* Purchases: 50

**Task**:

1. **Visitor->Signup**: $500/10000 = 5\%$
2. **Signup->Purchase**: $50/500 = 10\%$
3. **Overall**: $50/10000 = 0.5\%$

* *Analysis*: 5% Signup rate is low (Industry arg ~10%). 10% Purchase rate is high (Industry avg ~2%). **Fix the Landing Page (Signup).**

### Exercise 2: Inventory Turn

**Goal**: Supply Chain Optimization.

**Formula**: `COGS / Average Inventory Value`.

* **Scenario**:
  * Sold $1M of goods (Cost).
  * Warehouse holds $100k of stock on average.
* **Turn**: $1,000,000 / 100,000 = 10$.
* *Meaning*: You sold out your warehouse 10 times this year. (Every 36 days).
* *Good?*: Yes. High Turn = Fresh Stock + Low Storage Fees.

### Exercise 3: SaaS Churn Math

**Goal**: Calculate Net Revenue Retention (NRR).

* Start MRR: $100,000.
* Churn: -$5,000.
* Expansion: +$10,000.
* (Ignore New Sales).

**Formula**: `(Start - Churn + Expansion) / Start`.

* `($100k - $5k + $10k) / $100k` = `105k / 100k` = **105%**.
* *Meaning*: Even if you stop selling, your business **grows** by 5% because existing customers pay more than you lose. (Best-in-class).

---

## Mastery Check

### Question 1: Sales Velocity

If you double your Win Rate (10% to 20%) and keep everything else same, what happens to Sales Velocity?
A) It stays same.
B) It doubles.
C) It halves.
D) It converts to leads.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Numerator doubles, so velocity doubles.
</details>

### Question 2: Marketing CAC

If you spend $1000 and get 10 customers, what is CAC?
A) $100
B) $10
C) $10000
D) 1%

<details>
<summary>Click for Answer</summary>

**Answer: A**
$1000 / 10 = $100.
</details>

### Question 3: Product Stickiness

Which metric best measures "Habit Formation"?
A) Total Downloads.
B) DAU/MAU Ratio.
C) Revenue.
D) Page Views.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Daily Users / Monthly Users tells you how *often* they return.
</details>

### Question 4: Inventory

Is a *Low* Inventory Turn good or bad?
A) Good (It means you have lots of stock).
B) Bad (It means stock is sitting gathering dust/cost).
C) Irrelevant.
D) Good (It means you are exclusive).

<details>
<summary>Click for Answer</summary>

**Answer: B**
Bad. Cash is tied up in boxes.
</details>

### Question 5: NRR

What does NRR > 100% imply?
A) The company is losing money.
B) The company is growing organically from its existing base (Negative Net Churn).
C) The company is cheating.
D) The math is wrong.

<details>
<summary>Click for Answer</summary>

**Answer: B**
The "Holy Grail" of SaaS.
</details>

---

## Summary

Today you learned:

* ✅ **Funnel Analysis**: Identify the leak, fix the leak.
* ✅ **SaaS Magic Numbers**: NRR, MRR, Churn.
* ✅ **Inventory Turn**: Cash flow is king in retail.
* ✅ **Domain Expertise**: Speak the language of your stakeholder.

**Tomorrow**: We dive into **Advanced Experimentation & A/B Testing**—proving causality in business.
