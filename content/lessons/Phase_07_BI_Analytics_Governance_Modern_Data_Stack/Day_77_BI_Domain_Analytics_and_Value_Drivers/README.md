---
day: 77
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

### 5. Finance: Margin, Cash Conversion, and Variance

BrightCart isn't a SaaS company — it's a DTC retailer — so its finance metrics center on margin and cash, not MRR.

* **Gross Margin %**: `(Revenue − COGS) / Revenue`. BrightCart's hiking-boot line sells at $120 with $72 COGS → Gross Margin = `(120-72)/120 = 40%`. *Grain matters*: calculate at the SKU level before aggregating, or a high-volume low-margin SKU can hide inside a healthy blended average.
* **Cash Conversion Cycle (CCC)**: `Days Inventory Outstanding + Days Sales Outstanding − Days Payable Outstanding`. If BrightCart holds inventory 45 days, collects marketplace payouts in 10 days, but pays suppliers in 30 days: `45 + 10 - 30 = 25 days` of cash tied up per cycle. *Caveat*: marketplace channel (e.g., Amazon) often has a fixed payout schedule (bi-weekly) regardless of when the sale happened — don't average DSO across web (instant card settlement) and marketplace (delayed payout) without segmenting by channel.
* **Budget Variance**: `(Actual − Budget) / Budget`. A 10% unfavorable variance in shipping cost is meaningless without knowing whether volume grew 15% (favorable, cost grew slower than revenue) or volume was flat (a real cost problem).

### 6. Marketing: Attribution and ROAS

* **ROAS (Return on Ad Spend)**: `Revenue Attributed / Ad Spend`. BrightCart spent $20,000 on paid social and attributed $80,000 of orders to it → ROAS = 4.0 (or "400%").
* **Attribution caveat**: "Attributed" is doing a lot of work in that sentence. **Last-touch** attribution gives 100% of credit to the final click before purchase; **first-touch** gives it to the discovery channel; **multi-touch/data-driven** splits credit across the path. BrightCart's paid social ROAS looks 2x better under last-touch than under multi-touch, because social is often the *closer*, not the *discoverer* — email and organic search usually plant the seed.
* **Inclusion/exclusion caveat**: Does ROAS include returns? BrightCart's apparel category has a 20% return rate; an ROAS calculated on gross (pre-return) revenue overstates true paid-channel profitability.

### 7. Product: Activation and Retention (Beyond DAU/MAU)

* **Activation**: The first moment a user experiences real value — for BrightCart's app, that's "added a product to a wishlist or cart within session 1," not just "downloaded the app."
* **Retention (cohort-based)**: Of users who signed up in January, what % placed a second order by day 60? This must be tracked by **signup cohort and period**, not as a single blended number, or seasonal acquisition spikes (e.g., holiday shoppers, who churn faster) distort the trend.
* **Logo churn vs. revenue churn — the critical distinction**: If BrightCart loses 100 small marketplace-only customers (avg $40 lifetime spend) but keeps its top 10 web/app "VIP" accounts (avg $2,000/year), **logo churn** (customers lost ÷ total customers) looks alarming, while **revenue churn** (dollars lost ÷ total revenue) is negligible. Reporting only logo churn to the CFO would trigger a panic over a rounding error; reporting only revenue churn would hide a real top-of-funnel acquisition problem. Report both, explicitly labeled.

---

## Senior-Level Insights

### Don't be a "Chart Monkey"

* **Junior**: "Here is the chart of Sales you asked for."
* **Senior**: "I noticed Sales dropped 10% in Europe. I dug in and found it's because the Euro is weak against the Dollar (FX Rate). It's not a performance issue; it's a currency issue."

### The "One Metric That Matters" (OMTM)

* At **Facebook** (Early Days): "7 Friends in 10 Days." (Product Retention).
* At **Uber**: "Rider Wait Time." (Supply/Demand Balance).
* *Advice*: Identify the OMTM for *your* specific company stage.

### Sales: Pipeline Coverage and Win Rate

* **Win Rate**: `Deals Won / (Deals Won + Deals Lost)`, calculated only on **closed** deals — open/in-progress deals don't belong in the denominator, or the rate is inflated by stalled pipeline that hasn't lost yet.
* **Pipeline Coverage Ratio**: `Open Pipeline Value / Quota`. A common SaaS/B2B benchmark target is 3x–4x coverage (you need $3-4 of pipeline to close $1 of quota, accounting for typical win rates). BrightCart's B2B bulk-order sales team (selling to outfitters and gyms) tracks this monthly to flag reps who will miss quota *before* the quarter ends, not after.
* **Bookings vs. Revenue — the critical distinction**: A **booking** is a signed commitment (e.g., a 12-month wholesale contract signed in March); **revenue** is recognized only as the goods/service are delivered (e.g., 1/12th of that contract recognized each month, per ASC 606). A sales team can report a blockbuster "bookings" quarter while the income statement shows almost no revenue yet — conflating the two in an executive readout overstates near-term cash and profit impact.

### Operations: Service Levels

* **On-Time Delivery Rate**: `Orders delivered by promised date / Total orders delivered`. BrightCart's warehouse SLA target is 95%; dropping to 88% during peak season is an early warning for the support-ticket spike that follows two weeks later.
* **Support SLA**: First-response time and resolution time against contractual/policy targets (e.g., "respond within 4 business hours"). Tie this to `support_tickets.opened_at`/`resolved_at` in the BrightCart schema.
* **Fill Rate**: `Units shipped complete / Units ordered`. A low fill rate is often the *operational root cause* behind a marketing-reported "conversion drop" — customers abandon carts when checkout reveals an item is backordered.

### Metric Trees: Connecting Levers to Outcomes

A metric tree decomposes a top-line outcome into the operational levers that drive it, so a 10% revenue miss can be traced to *which* lever moved.

```text
Net Revenue
├── Orders
│   ├── Sessions (Acquisition spend, SEO)
│   ├── Conversion Rate (Site speed, checkout friction, Fill Rate)
│   └── Repeat Purchase Rate (Retention, CSAT, Email)
├── Average Order Value
│   ├── Units per Order (Bundling, cross-sell)
│   └── Price per Unit (Discounting, mix shift to premium SKUs)
└── Returns Rate (Quality, sizing accuracy, marketing accuracy)
```

* **Revenue lever**: Conversion Rate connects to Cost (more paid traffic needed to hit the same order count if conversion falls) and Risk (over-reliance on discounting to prop up AOV erodes Gross Margin).
* **Cash flow lever**: Returns Rate doesn't just cut revenue — high-return categories (BrightCart apparel) also extend the Cash Conversion Cycle, since refunded inventory must be re-processed before it can be resold.
* **Practice**: When a metric tree shows three levers moved in the same period, driver decomposition asks "how much of the 10% revenue miss is Conversion Rate vs. AOV vs. Returns?" by holding the other two constant and isolating each delta — the same logic as a variance bridge in FP&A.

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

### Exercise 4: Cross-Functional Capstone — The BrightCart Q1 Business Review

**Goal**: Build a metric tree, funnel, inventory turn, and churn analysis from a single shared dataset, then reconcile the four views into one recommendation — the way a real cross-functional BI analyst would prepare for a Monday leadership review.

**The Dataset** (BrightCart Q1, simplified to whole-company totals; in production this comes from `orders`, `order_items`, and `support_tickets`):

*`orders` summary (Q1, all channels):*

| Metric | Jan | Feb | Mar |
|---|---|---|---|
| Site/App Sessions | 200,000 | 210,000 | 240,000 |
| Orders Placed | 8,000 | 7,560 | 7,920 |
| Gross Revenue | $640,000 | $612,360 | $665,280 |
| Returns ($) | $64,000 | $73,483 | $93,139 |
| COGS | $384,000 | $367,416 | $399,168 |

*`customers` & churn summary (Q1):*

| Metric | Value |
|---|---|
| Active customers, Jan 1 | 50,000 |
| Customers lost (zero orders in 90 days), Q1 | 4,000 |
| Revenue from lost customers (trailing 12mo, before churn) | $180,000 |
| Total trailing-12mo revenue base | $7,200,000 |

*Inventory:*

| Metric | Value |
|---|---|
| Average inventory value, Q1 | $480,000 |

**Task A — Funnel**: Calculate the Session → Order conversion rate for each month. *(Jan: 8,000/200,000 = 4.0%. Feb: 7,560/210,000 = 3.6%. Mar: 7,920/240,000 = 3.3%.)* Sessions are climbing but conversion is falling each month — flag this as the headline finding before looking at anything else.

**Task B — Metric tree / driver decomposition**: Net Revenue = Gross Revenue − Returns. Compute Net Revenue and Net Revenue growth Jan→Mar. *(Net: Jan $576,000 → Mar $572,141 — down 0.7% despite Gross Revenue being up 4.0%. The entire gap is explained by Returns growing from 10% to 14% of gross — isolate this as the dominant driver before blaming traffic or pricing.)*

**Task C — Inventory turn**: Using Q1 COGS (`384,000 + 367,416 + 399,168 = $1,150,584`) annualized (×4 for a full-year estimate ≈ $4,602,336) against the $480,000 average inventory value, compute turn. *(≈9.6x annualized, or roughly every 38 days — healthy, but confirm it isn't masking stockouts feeding the conversion decline in Task A.)*

**Task D — Churn (logo vs. revenue)**: Logo churn = `4,000 / 50,000 = 8.0%`. Revenue churn = `$180,000 / $7,200,000 = 2.5%`. *(Logo churn is over 3x revenue churn — the customers leaving are disproportionately low-value. Report both numbers explicitly; do not average or pick only one.)*

**Task E — Reconciliation**: Marketing will claim sessions are up (their KPI is healthy). Finance will flag Net Revenue is down (their KPI is unhealthy). Both are correct simultaneously. Reconcile: the funnel (Task A) shows conversion eroding while traffic grows, and the metric tree (Task B) attributes the Net Revenue miss almost entirely to rising Returns, not traffic or price. The two findings connect: rising returns often *follow* a conversion-rate-protecting tactic like looser sizing guidance or aggressive "buy now, decide later" messaging — worth checking next.

**Expected recommendation** (a senior analyst's one-paragraph synthesis): *"Q1 net revenue is flat-to-down despite a 20% increase in traffic. The root cause is not acquisition — it's a returns rate that grew from 10% to 14% of gross revenue, fully offsetting top-line growth. Logo churn (8%) is concentrated in low-value accounts (revenue churn only 2.5%), so retention is not the immediate fire. Recommend: audit the sizing/fit guidance and product descriptions for the SKUs driving the Q1 returns increase before approving additional acquisition spend, since more traffic into a leaky returns funnel will not fix Net Revenue."*

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

### Question 6: Logo vs. Revenue Churn

BrightCart loses 8% of its customer logos in Q1 but only 2.5% of trailing revenue. What's the correct way to report this?

A) Report only logo churn — it's the bigger, more alarming number.
B) Report only revenue churn — it makes the business look healthier.
C) Report both explicitly, since they tell different stories: a high volume of low-value customers is leaving, but high-value accounts are intact.
D) Average the two numbers into one churn figure.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Logo churn and revenue churn answer different questions (how many customers vs. how much money). Collapsing them into one number, or reporting only the flattering one, hides the real risk profile from decision-makers.
</details>

### Question 7: Bookings vs. Revenue

BrightCart's wholesale sales team signs a $120,000, 12-month supply contract in March. How much Q1 *revenue* (not bookings) should be recognized from this deal, assuming even delivery?

A) $120,000 in March (all of it).
B) $0, since revenue recognition depends on delivery, not contract signing.
C) Roughly $10,000 — one month's worth, recognized as goods are delivered in March.
D) $60,000 — half the contract value.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Bookings (the signed commitment) and revenue (recognized as delivered, e.g., under ASC 606) are different numbers. Only the March delivery's portion (~1/12th = $10,000) counts as Q1 revenue; the rest remains bookings/backlog.
</details>

### Question 8: Metric Tree Diagnosis

In the BrightCart Q1 capstone, Net Revenue is nearly flat even though Gross Revenue grew ~4% and Sessions grew 20%. What does the metric tree decomposition reveal as the dominant driver?

A) A drop in Average Order Value.
B) A decline in marketing spend.
C) Returns growing from 10% to 14% of gross revenue, offsetting the gross revenue gains.
D) A change in the inventory turn ratio.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Decomposing the metric tree isolates each lever. Here, Orders and Gross Revenue moved favorably, but Returns Rate grew enough to erase nearly all of the gain — the kind of finding only visible by tracing the tree rather than looking at Net Revenue alone.
</details>

---

## Cross-References

* **Phase 7 Day 70 — BI Metrics & Data Literacy**: the foundational metric-definition discipline (grain, period, inclusions) extended here into domain-specific formulas.
* **Phase 7 Day 73 — BI SQL & Databases**: where the `orders`/`order_items`/`support_tickets` tables used in this lab's queries actually live.
* **Phase 7 Day 78 — BI Experimentation & Predictive Insights**: how to test whether a metric tree driver (e.g., rising returns) is *causally* linked to a specific change, not just correlated.
* **Phase 7 Day 80 — BI Data Quality & Governance**: how to certify that domain metrics like NRR and Inventory Turn are computed consistently across Finance, Product, and Sales.
* **Phase 6 Day 63 — Causal Inference & Uplift**: the potential-outcomes framework for proving a driver (like a sizing-guide fix) actually caused the returns rate to improve, not just correlated with it.

## Glossary

* **AARRR**: The "Pirate Metrics" funnel — Acquisition, Activation, Retention, Referral, Revenue — a framework for diagnosing where users drop off.
* **CAC (Customer Acquisition Cost)**: Total acquisition spend divided by the number of new customers acquired in the period.
* **Activation**: The first moment a user experiences real product value (e.g., adding an item to a cart), distinct from simply signing up or installing.
* **Pipeline velocity**: The rate at which sales opportunities convert to closed revenue, calculated as `(Leads × Win Rate × Deal Size) / Sales Cycle Length`.
* **MRR (Monthly Recurring Revenue)**: The predictable revenue a subscription business expects to collect each month from active subscriptions.
* **ARR (Annual Recurring Revenue)**: MRR annualized (`MRR × 12`), used for board-level and investor reporting.
* **NRR (Net Revenue Retention)**: The percentage of revenue retained from existing customers after churn and expansion, excluding new sales; `(Start − Churn + Expansion) / Start`.
* **Inventory turn**: How many times inventory is sold and replaced over a period, calculated as `COGS / Average Inventory Value`.
* **Logo churn**: The percentage of *customers* (accounts) lost in a period, regardless of their revenue size.
* **Revenue churn**: The percentage of *revenue* lost in a period, weighting churn by customer value rather than customer count.

---

## Summary

Today you learned:

* ✅ **Funnel Analysis**: Identify the leak, fix the leak.
* ✅ **SaaS Magic Numbers**: NRR, MRR, Churn.
* ✅ **Inventory Turn**: Cash flow is king in retail.
* ✅ **Domain Expertise**: Speak the language of your stakeholder.
* ✅ **Metric Trees**: Decompose a top-line miss into the specific operational lever that caused it.
* ✅ **Logo vs. Revenue Churn, Bookings vs. Revenue**: Two pairs of metrics that look similar but answer different business questions — never collapse them into one number.

**Tomorrow**: We dive into **Advanced Experimentation & A/B Testing**—proving causality in business.
