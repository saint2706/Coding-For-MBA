---
day: 69
title: "BI Strategy & Stakeholders"
phase: 6
phaseTitle: "Cutting-Edge ML & BI Foundations"
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

## Hands-on Lab

### Exercise 1: Translating Vague Requests

**Goal**: Convert "Business Speak" to "Data Logic".

**Request**: "Are our customers happy?"

**Tasks**: Propose 3 metrics to measure "Happiness".

1. **NPS (Net Promoter Score)**: Survey results (Direct).
2. **Retention Rate**: Do they come back? (Behavioral).
3. **Support Ticket Volume**: Are they complaining? (Negative Signal).

*Which is best?* Behavior (Retention) is usually the most honest signal. People lie on surveys; they don't lie with their wallets.

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

## Summary

Today you learned:

* ✅ **Your job is Translation**: Business -> Data -> Insight -> Business.
* ✅ **Ban Vanity Metrics**: If it doesn't change behavior, kill it.
* ✅ **Ask "So What?"**: Always connect data to business outcome.
* ✅ **The 5 Whys**: Dig deep to find the root cause.

**Tomorrow**: We get technical again with **BI Metrics & Data Literacy**—how to calculate the numbers that matter.
