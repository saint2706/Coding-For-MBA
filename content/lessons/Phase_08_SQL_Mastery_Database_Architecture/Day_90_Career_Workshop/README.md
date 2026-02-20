---
day: 90
title: "Technical Interview WorkShop"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "data-interview"
duration: 120
difficulty: "advanced"
tags:
  - interview-prep
  - whiteboard-coding
  - system-design
  - sql-challenges
concepts:
  - "The System Design Interview (Designing Twitter)"
  - "SQL Whiteboarding (Live Coding)"
  - "Behavioral Questions (The Amazon LP)"
  - "Negotiation 101"
prerequisites:
  - "Phase 8 Content"
outcomes:
  - "Design a 'Like Counter' system that handles 1M req/s"
  - "Solve 'Median Calculation' in SQL on a whiteboard"
  - "Answer 'Tell me about a conflict' flawlessly"
---

# 🎯 Day 90: Technical Interview Workshop

> *"In an interview, the goal is not to be right. The goal is to be understood. Speak your thoughts."*

---

## The "Never-Coded" Bridge

**The Chef's Audition**

* **Resume**: "I cooked at Le Bernardin." (Looks good on paper).
* **The Interview**: "Here is a mystery basket. Make me a dish in 20 minutes."
  * **The Process**: The Chef narrates: "I see duck. I'm thinking duck confit. No, wait, not enough time. I'll sear the breast."
  * **Result**: Even if the duck is slightly overcooked, the Head Chef hires them because they *thought* correctly under pressure.

**Whiteboarding** is the same. It's not about syntax; it's about problem-solving out loud.

---

## The Technical Deep Dive

### 1. The System Design Interview

**Prompt**: "Design a URL Shortener (TinyURL)."
**Framework (The 4 S's)**:

1. **Scope**: "Do we need analytics? Custom aliasing?" (Clarify Requirements).
2. **Scale**: "1M writes/day? 100M reads/day?" (Identify Bottlenecks).
3. **Storage**: "Key-Value store (Redis) is faster than Postgres for this." (Tech Choices).
4. **Structure**: "Hash the URL (MD5). Take first 7 chars. Store {hash: original_url}." (Algorithm).

### 2. Advanced SQL Patterns (Interview Favorites)

**The 'Median' Problem**:

* Standard SQL has `AVG`, but not `MEDIAN`.
* **Solution**: `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary)`.
* **Without Window Functions**: Sort rows, count total, pick middle row. (Harder to write, shows deep understanding).

**The 'Consecutive Logins' Problem**:

* "Find users who logged in 3 days in a row."
* **Solution**: Use `LEAD()` and `LAG()`. `WHERE date = prev_date + 1 AND date = next_date - 1`.

### 3. Behavioral: The Amazon Leadership Principles

* **Customer Obsession**: "I ignored the VP's feature request because user data showed nobody wanted it."
* **Bias for Action**: "The server was crashing. I restarted it *before* getting approval, saving 99% uptime."
* **Disagree and Commit**: "I argued for Python. The team chose Go. I learned Go in a weekend and helped ship it."

---

## Senior-Level Insights

### "I Don't Know" is a Valid Answer

* **Junior**: Makes up a fake answer. (Fails immediately).
* **Senior**: "I don't know the exact syntax for `MERGE` in Oracle, but here is how I would do it in Postgres using `INSERT ON CONFLICT`..."
* **Why?**: Shows honesty + transferable knowledge.

### The "Trade-off" is the Real Answer

* **Interviewer**: "Should we use Kafka?"
* **Junior**: "Yes! Kafka is cool!"
* **Senior**: "It depends. If we need durability and replayability, Yes. If we need sub-millisecond latency and don't care about message loss, maybe ZeroMQ or pure UDP is better."

---

## Hands-on Lab

### Exercise 1: System Design (Whiteboard)

**Goal**: Design a "Twitter Like Counter".

* **Constraint**: 1 Million likes per second. Writing to DB every time will kill it.
* **Solution**:
    1. **Write Buffer (Redis)**: Increment counter in RAM.
    2. **Batch Write**: Every 10 seconds, flush the aggregate (+5000 likes) to Postgres.
    3. **Read**: Read from Postgres + cache.
  * *Trade-off*: The count might be 10 seconds stale ("Eventual Consistency").

### Exercise 2: SQL Challenge (Gaps and Islands)

**Goal**: Find gaps in ID sequences.

**Data**: IDs `1, 2, 3, 5, 6, 8`.
**Missing**: `4, 7`.

**Query**:

```sql
SELECT id + 1 as missing_start
FROM numbers n1
WHERE NOT EXISTS (
    SELECT 1 FROM numbers n2 WHERE n2.id = n1.id + 1
)
AND id < (SELECT MAX(id) FROM numbers);
```

### Exercise 3: STAR Story

**Goal**: Write your "Conflict" story.

* **S**: Design team wanted a carousel.
* **T**: I had to implement it.
* **A**: I showed them data that carousels have 0.1% click rate and hurt accessibility.
* **R**: We built a grid instead. CTR went up 20%.

---

### Non-Functional Constraints (Apply to All Exercises)

- **Performance / Scale**: Document a target query runtime of **p95 < 4s** for your final solution, validate behavior at **15 concurrent analytical users/sessions**, and keep compute spend below **$1** per production-equivalent run.
- **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
- **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  - KPI focus for this day: *Interview artifacts should demonstrate how database design decisions improve SLA attainment, reporting speed, and cost-to-serve metrics.*

## Mastery Check

### Question 1: System Design

In a read-heavy system (100:1 Read/Write ratio), what is the best optimization?
A) Sharding.
B) Caching (Redis/Memcached).
C) Vertical Scaling.
D) Buying more hard drives.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Caching absorbs the read load.
</details>

### Question 2: SQL

What is a `CROSS JOIN`?
A) A standard join.
B) A Cartesian Product (Every row joined with every other row).
C) An error.
D) A religious symbol.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Dangerous if unintentional (produces `N * M` rows).
</details>

### Question 3: Behavioral

When asked about a weakness, what should you say?
A) "I work too hard." (Cliché/Fake).
B) A real weakness, followed by how you are actively fixing it. ("I struggle with public speaking, so I joined Toastmasters").
C) "I have none." (Arrogant).
D) "I hate SQL." (Disqualifying).

<details>
<summary>Click for Answer</summary>

**Answer: B**
Self-awareness is a key trait.
</details>

### Question 4: ACID

Which isolation level prevents "Dirty Reads"?
A) Read Uncommitted.
B) Read Committed.
C) Serial.
D) None.

<details>
<summary>Click for Answer</summary>

**Answer: B**
(Or higher). Read Committed is the default in Postgres.
</details>

### Question 5: Negotiation

When should you discuss salary?
A) First email.
B) After they offer you the job (Leverage is highest).
C) Never.
D) During the technical interview.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Once they decide they *want* you, you have power.
</details>

---

## Summary

Today you learned:

* ✅ **System Design**: Think Scale, Trade-offs, and Bottlenecks.
* ✅ **Whiteboarding**: Narrate your thought process.
* ✅ **STAR Method**: Structure your stories for maximum impact.
* ✅ **Negotiation**: Timing is everything.

**Tomorrow**: We return to **Core Principles** with **Relational Databases (Deep Dive)**.
