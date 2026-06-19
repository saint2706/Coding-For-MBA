---
day: 69
title: "BI Strategy & Stakeholders"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "bi-strategy"
duration: 120
difficulty: "intermediate"
tags:
  - analytics-strategy
  - stakeholders
  - communication
  - data-storytelling
concepts:
  - "translating business questions"
  - "vanity metrics vs actionable metrics"
  - "The 5 Whys"
  - "Saying No to data requests"
prerequisites:
  - "Understanding of BI Dashboards"
  - "Basic Business Logic"
outcomes:
  - "Translate vague executive questions into precise data queries"
  - "Identify and eliminate vanity metrics"
  - "Structure a data presentation for impact"
---

# 🎯 Day 69: BI Strategy & Stakeholders

> *"The goal is to turn data into information, and information into insight." — Carly Fiorina*

---

## The "Never-Coded" Bridge

**Imagine you are a Translator at the United Nations.**

**The CEO (Native Speaker of "Profit")**: "Our customer retention is terrible! Fix it!"
**The Database (Native Speaker of "SQL")**: `SELECT user_id, last_login FROM events WHERE event_type = 'churn';`

If you just run the SQL code and hand the CEO a table of 50,000 rows, **you have failed as a translator.**

Your job is to:

1. **Listen**: "Retention is terrible." (Is it? Compared to what?)
2. **Translate**: "Let's check the Churn Rate vs Industry Average."
3. **Analyze**: "It's 5%, industry is 8%. We are actually *good*."
4. **Speak**: "Mr. CEO, good news: We are beating the market. The issue isn't retention; it's low acquisition of *new* users."

**BI Strategy** is not about writing better SQL. It's about solving the *right* problem.

---

## The Technical Deep Dive

### 1. The "5 Whys" Framework

A technique from Toyota to find the Root Cause.
**Question**: Sales are down.

1. **Why?** Because fewer people are buying subscriptions.
2. **Why?** Because traffic to the checkout page dropped.
3. **Why?** Because the "Sign Up" button on the homepage is broken on mobile.
4. **Why?** Because we pushed a bad update last night.
5. **Why?** Because our testing process skipped mobile browsers.
**Solution**: Fix the Testing Process (not "Hire more salespeople").

### 2. Vanity Metrics vs. Actionable Metrics

* **Vanity Metric**: Makes you feel good but changes nothing.
  * *Example*: "Total Registered Users" (This number *always* goes up, even if everyone left 5 years ago).
* **Actionable Metric**: Changes your behavior.
  * *Example*: "Daily Active Users (DAU)" (If this drops today, we panic and fix something).

### 3. The "So What?" Test

Before you send ANY chart to a stakeholder, ask: **"So What?"**

* "Traffic is up 10%." -> So What?
* "Which means 500 more leads." -> So What?
* "Which means $50k more revenue this month." -> **Bingo.**

### 4. Stakeholder Mapping & Decision Rights (RACI)

Not every stakeholder gets the same access, attention, or veto power. Before building anything, map who is:

* **Responsible** — does the analysis (usually you, the BI analyst).
* **Accountable** — owns the final decision and answers for the outcome (e.g., VP of Sales).
* **Consulted** — has domain knowledge you need before finalizing (e.g., a regional sales manager).
* **Informed** — receives the result but doesn't shape it (e.g., the broader sales team).

A simple stakeholder map for a BrightCart pricing question might look like:

| Stakeholder | Interest | Influence | RACI Role |
|---|---|---|---|
| VP of Growth | Wants revenue up | High | Accountable |
| Finance Director | Wants margin protected | High | Consulted |
| Regional Sales Managers | Wants quota relief | Medium | Consulted |
| Customer Support Lead | Wants fewer pricing complaints | Low | Informed |
| BI Analyst (you) | Delivers the analysis | — | Responsible |

**Why this matters**: when the Finance Director and a Regional Sales Manager give you contradictory requests
(common — see the Translation Lab below), the RACI map tells you whose input is a *requirement* (Accountable,
Consulted) versus whose input is a *courtesy* (Informed). Without this, every loud voice gets equal weight,
and you end up building a dashboard nobody officially asked for.

### 5. Intake, Discovery, and Requirements — Before You Touch SQL

A mature BI team doesn't start building the moment a Slack message arrives. The intake process has four steps:

1. **Intake SLA**: Every request gets logged (ticket, form, or backlog item) with a target response time —
   e.g., "Acknowledge within 1 business day; scope within 3 days for standard requests, same-day for
   exec-flagged urgent requests."
2. **Discovery interview**: A structured conversation, not a transcription exercise. Ask: "What decision will
   this inform?", "Who else cares about this answer?", "What does 'done' look like?", "Is there a deadline tied
   to a real event (board meeting) or is 'ASAP' just a habit?"
3. **Requirements documentation**: Write down the agreed scope *before* building — grain, time window, filters,
   and the metric definitions involved (reuse the metric-contract format from Phase 7 Day 68). This single
   document prevents "that's not what I meant" after you've already built the dashboard.
4. **Backlog scoring**: Not every request gets built immediately. Score requests on a simple rubric — e.g.,
   *Impact* (1-5: how many decisions or how much revenue does this touch?) × *Urgency* (1-5: is there a
   real deadline?) ÷ *Effort* (1-5: hours of analyst time) — and work the backlog in score order, not
   first-come-first-served. This is also how you justify saying "no" or "not yet" without it feeling personal.

### 6. Measuring Adoption — Did the Dashboard Actually Get Used?

Shipping a dashboard is not the finish line. Track:

* **View frequency**: Is anyone opening it after week 1? (Most BI tools log this natively.)
* **Decision linkage**: Can you trace at least one real decision back to the dashboard? If not, ask why.
* **Staleness complaints**: Are people flagging the numbers as wrong or out of date? That's a signal the
  metric contract or refresh schedule needs revisiting.
* **Sunset criteria**: If a dashboard has near-zero views for 90 days, retire it. A graveyard of unused
  dashboards erodes trust in the *whole* BI practice, not just that one report.

---

## Senior-Level Insights

### The Art of Saying "No"

Junior Analysts say "Yes" to every request.

* "Can I see sales by zip code?" (Yes)
* "Can I see it by hair color?" (Yes)
**Result**: 50 Dashboards that nobody looks at.

Senior Analysts say:

* "What decision will you make with that data?"
* "If I told you sales were higher for blondes, would you change our marketing?"
* "No? Then let's not build that chart."

### "Data Puking"

Avoid dumping all your data on the slide.
executives don't want to see your "work." They want to see your **conclusion**.

* **Bad**: Here are 10 charts of sales trends.
* **Good**: Sales are down 5% because the East Coast server was down. Here is the 1 chart that proves it.

---

## Pitfalls: When Strategy Becomes Spin

Stakeholder work is where good analysts most often get pulled into bad habits — not through malice, but
through social pressure. Watch for these four traps:

* **Confirmation bias**: A VP already believes the new pricing page is working. You pull the data and find
  it's neutral-to-negative. The trap is unconsciously choosing the date range, segment, or chart type that
  makes the VP's belief look true. *Defense*: decide your time window, segment, and metric **before** looking
  at the result, and write that decision down.
* **Metric cherry-picking**: When the headline metric looks bad, it's tempting to scroll until you find a
  metric (or a sub-segment) that looks good and lead with that instead. One good metric buried in ten bad ones
  is still a bad quarter. *Defense*: always report the metric the stakeholder originally asked about, even if
  you also provide supporting context.
* **Executive pressure**: A senior leader says "Can you just confirm the campaign worked?" before you've
  finished the analysis — the question is phrased to presume the answer. *Defense*: separate "what the data
  shows" from "what we should do about it." You can validate their urgency without pre-committing to their
  conclusion.
* **Saying no, ethically**: Sometimes the honest answer is "the data doesn't support that conclusion" or "this
  request would take 3 weeks for a decision worth 3 hours of impact." Saying no well means: (1) acknowledge the
  underlying need, (2) explain the trade-off in their terms (time, risk, opportunity cost), and (3) offer an
  alternative ("I can't build a custom report by Friday, but here's the existing dashboard that answers 80% of
  this"). A senior analyst's credibility comes from being trusted to push back, not from being agreeable.

---

## Hands-on Lab

### Exercise 1: Translating Vague Requests

**Goal**: Convert "Business Speak" to "Data Logic".

**Request**: "Are our customers happy?"

**Tasks**: Propose 3 metrics to measure "Happiness".

1. **NPS (Net Promoter Score)**: Survey results (Direct).
2. **Retention Rate**: Do they come back? (Behavioral).
3. **Support Ticket Volume**: Are they complaining? (Negative Signal).

*Which is best?* Behavior (Retention) is **often** the most decision-relevant signal, but "most honest" needs
qualification — each signal is biased in a different way, and they measure different constructs:

* **Surveys (NPS)** are biased by *who responds* (happy and furious customers reply; the quietly indifferent
  majority doesn't — non-response bias) and by *recency* (a survey sent right after a great support
  interaction will score higher than the customer's true average sentiment).
* **Support ticket volume** is biased by *friction to complain* — a confusing product can have LOW ticket
  volume not because customers are happy, but because they gave up and churned silently instead of contacting
  support. Low tickets can mean "delighted" or "already gone."
* **Behavior (retention)** doesn't lie about *what people did*, but it can't tell you *why*. A customer might
  stay because they're happy, or because switching costs are high, or because they forgot to cancel a
  subscription (negative-option billing). Retention measures the construct "did they stay," not the construct
  "are they happy" — and BrightCart's leadership often conflates the two.

**Conclusion**: use behavior as the primary signal for "is this metric moving," but pair it with survey and
support data to diagnose *why* — each instrument measures a different slice of the truth, and only behavior
generates an unambiguous business consequence (revenue).

### Exercise 2: Identifying Vanity Metrics

**Goal**: Spot the fake news.

**Scenario**: You are evaluating a startup. They show you this slide:

* "Over 1 Million Downloads!"
* "10 Billion Server Hits!"
* "Top 10 App in Potato-Land!"

**Task**: Why are these Vanity Metrics? What would you ask for instead?

1. **Downloads**: Useless. I want **Monthly Active Users (MAU)**.
2. **Hits**: Useless. Could be a DDOS attack. I want **Revenue**.
3. **Rank**: Useless. I want **Growth Rate (MoM)**.

### Exercise 3: The 3-Slide Story

**Goal**: Structure a presentation for the VP of Marketing.

**Situation**: A new ad campaign on Facebook failed.

**Slide 1: The Headline (The "What")**

* "The Summer Campaign ROI was -50%."
* (Big Red Number).

**Slide 2: The Evidence (The "Why")**

* "Cost per Click (CPC) was normal ($1.50)."
* "But Conversion Rate dropped from 2% to 0.5%."
* *Insight*: People clicked the ad, but the Landing Page didn't convince them.

**Slide 3: The Recommendation (The "Now What")**

* "Pause the Facebook Ad spend ($5k/day savings)."
* "Redesign the Landing Page to match the Ad copy."
* "Restart test in 3 days."

---

## Translation Lab: The BrightCart Loyalty Program Conflict

**Scenario**: BrightCart piloted a loyalty program (points for repeat purchases) in Q1. Three stakeholders have
filed conflicting requests about whether to scale it nationally, and your job is to reconcile them into one
decision memo.

### The Request Packet

**Request from VP of Growth (Slack message, verbatim)**:
> "The loyalty program is clearly working — sign-ups are through the roof. Can you get me a slide for the board
> next Tuesday showing growth? I want to greenlight rolling this out to all regions."

**Interview notes — Finance Director (your notes from a 15-minute call)**:
> "I'm skeptical. Yes, sign-ups are up, but the points we're giving away cost real margin. Nobody has shown me
> whether loyalty members actually generate more *profit*, just more orders. Also — isn't the pilot region
> (West Coast) just outperforming because it's our oldest, most loyal customer base anyway? I don't trust this
> is causal."

**Interview notes — Regional Sales Manager, West (your notes from a 10-minute call)**:
> "Loyalty members in my region order more often, sure, but half of them were already our best customers
> before the points program even launched. I don't think the points are *causing* anything — we just enrolled
> our existing VIPs first."

### The Data Extract

```text
customer_id,region,loyalty_member,signup_date,pre_program_orders_90d,post_program_orders_90d,post_program_margin
3001,West,Y,2025-11-01,5,7,410.20
3002,West,Y,2025-11-03,4,6,355.10
3003,West,N,2025-11-05,4,4,260.00
3004,East,N,2026-01-10,1,1,80.50
3005,West,Y,2025-12-01,6,9,520.00
3006,East,N,2026-01-15,2,2,150.00
3007,West,N,2025-11-20,3,3,210.00
3008,West,Y,2025-12-10,2,5,300.40
3009,East,N,2026-02-01,1,2,140.00
3010,West,Y,2026-01-05,1,3,190.00
```

### Prioritization Rubric

Score this request before building anything:

| Factor | Score (1-5) | Rationale |
|---|---|---|
| Impact | 5 | National rollout decision affects 100% of customer base and Q3 marketing budget |
| Urgency | 4 | Board meeting next Tuesday is a real, fixed deadline |
| Effort | 2 | Data extract already exists; needs a before/after comparison, not new instrumentation |
| **Priority** | **(5×4)/2 = 10** | High priority — work this now, ahead of lower-scoring backlog items |

### Your Task

1. **Reconcile the conflict**: The VP sees raw sign-up growth (a vanity-adjacent metric — see Glossary). The
   Finance Director and Regional Manager are both raising the same root-cause concern in different words:
   *selection bias* — loyalty members might just be the customers who were already going to order more,
   regardless of the points. Apply the **5 Whys** to get under the VP's request and identify this confound
   explicitly in your memo.
2. **Use the data extract** above to compute, per stakeholder group's actual question: (a) raw order growth
   for loyalty vs. non-loyalty members (the VP's question), and (b) whether loyalty members' pre-program
   order history already predicted higher post-program orders (the Finance/Sales concern). You do not need a
   full causal model — a simple comparison of `pre_program_orders_90d` between loyalty and non-loyalty
   customers is enough to demonstrate (or refute) the selection-bias concern.
3. **Write a one-page decision memo** (BLUF format — conclusion first) that:
   - States the recommendation in the first sentence.
   - Names the selection-bias risk explicitly, in plain language Finance and Sales will recognize from their
     own interview notes.
   - Proposes a path to a cleaner answer (e.g., "run the loyalty offer as a randomized invite to a comparable
     new cohort in Q3, instead of comparing already-different groups").

**Expected memo (abbreviated example of the deliverable)**:

> **Recommendation**: Do not greenlight national rollout yet. Run a controlled pilot first.
>
> **Why**: Loyalty members ordered more *before* the program even started (avg. 3.6 orders/90 days pre-program
> vs. 2.0 for non-members in this extract) — meaning the program likely enrolled our already-best customers
> rather than *creating* better customers. The board slide as requested would overstate impact.
>
> **What we recommend instead**: A 4-week randomized invite test in 2 new regions, comparing matched cohorts,
> before committing marketing budget to a full rollout.
>
> **Trade-off**: This delays the rollout decision by ~6 weeks past Tuesday's board meeting, but avoids
> committing to a national budget based on a confounded pilot.

This memo format — recommendation, evidence, alternative, trade-off — is the deliverable you should produce
for the exercise. Use the actual numbers you compute from the data extract, not the illustrative figures above.

---

## Mastery Check

### Question 1: Data Translation

A stakeholder asks: "Why is the website slow?" What is the *first* thing you do?
A) Run a SQL query for page load times.
B) Ask: "What do you mean by slow? Which page? For whom?"
C) Buy faster servers.
D) Restart the database.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Clarify the question first. Usually "slow" means "The checkout button specifically is lagging for me right now."
</details>

### Question 2: Vanity Metric

Which is a Vanity Metric?
A) Churn Rate
B) Customer Acquisition Cost (CAC)
C) Cumulative Signups (Total since 2010)
D) Monthly Recurring Revenue (MRR)

<details>
<summary>Click for Answer</summary>

**Answer: C**
Cumulative numbers only go up. They hide the fact that growth might have stopped 2 years ago.
</details>

### Question 3: 5 Whys

What is the purpose of the "5 Whys"?
A) To annoy your boss.
B) To find the Root Cause of a problem, not just the symptom.
C) To ask 5 different people for their opinion.
D) To validate 5 hypotheses.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Root Cause Analysis.
</details>

### Question 4: Prioritization

If a request won't change any business decision, what should you do?
A) Do it anyway to be nice.
B) Push it to the bottom of the backlog or decline it politely.
C) Stay up all night working on it.
D) Fake the data.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Protect your time for high-impact work.
</details>

### Question 5: Presentation

What belongs on the first slide of a data presentation?
A) Your SQL code.
B) The methodology you used to clean the nulls.
C) The Main Insight / Answer to the business question.
D) A picture of a cat.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Start with the conclusion (BLUF: Bottom Line Up Front).
</details>

---

## Cross-References

* Phase 7 Day 68 — BI Analyst Foundations (the metric-contract format reused in this lesson's requirements documentation step)
* Phase 7 Day 70 — BI Metrics & Data Literacy (formalizes the selection-bias / confounding issue raised in the Translation Lab)
* Phase 7 Day 79 — BI Storytelling & Stakeholder Influence (extends BLUF and presentation structure introduced here)
* Phase 7 Day 80 — BI Data Quality & Governance (formalizes intake SLAs and backlog scoring into a governance program)
* Phase 6 Day 63 — Causal Inference & Uplift (the rigorous version of the "loyalty members were already our best customers" confound)

## Glossary

* **Vanity Metric** — A number that always looks good (e.g., cumulative sign-ups) but doesn't change any decision.
* **Actionable Metric** — A metric that, when it moves, causes a specific team to change behavior.
* **Root Cause** — The underlying driver of a problem, found by repeatedly asking "why" rather than reacting to the first symptom.
* **BLUF (Bottom Line Up Front)** — A communication structure that states the conclusion/recommendation before the supporting evidence.
* **Stakeholder** — Anyone with interest in or influence over a decision the data will inform.
* **5 Whys** — A root-cause technique that asks "why" repeatedly (typically five times) until reaching an actionable, systemic cause.
* **RACI** — A framework (Responsible, Accountable, Consulted, Informed) for mapping who does, owns, advises, and receives a decision.
* **Selection Bias** — A distortion that occurs when the group being studied differs systematically from the group it's compared against, for reasons unrelated to the thing being tested.
* **Intake SLA** — A committed response time for acknowledging and scoping a new data request.

---

## Summary

Today you learned:

* ✅ **Your job is Translation**: Business -> Data -> Insight -> Business.
* ✅ **Ban Vanity Metrics**: If it doesn't change behavior, kill it.
* ✅ **Ask "So What?"**: Always connect data to business outcome.
* ✅ **The 5 Whys**: Dig deep to find the root cause.

**Tomorrow**: We get technical again with **BI Metrics & Data Literacy**—how to calculate the numbers that matter.
