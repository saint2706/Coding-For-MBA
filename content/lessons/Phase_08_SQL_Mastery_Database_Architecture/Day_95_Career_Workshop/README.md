---
day: 95
title: "Technical Interview Workshop"
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
  - "The System Design Interview (Designing a Like Counter)"
  - "SQL Whiteboarding (Live Coding)"
  - "Behavioral Questions (The Amazon LP)"
  - "Negotiation 101"
prerequisites:
  - "Days 93-94 (UrbanHop Capstone — design and implementation)"
  - "Days 96-101 (recommended remediation path — see below)"
outcomes:
  - "Design a 'Like Counter' system that handles a stated, justified request volume"
  - "Solve 'Median Calculation' and 'Gaps and Islands' in SQL on a whiteboard"
  - "Answer 'Tell me about a conflict' using a real UrbanHop capstone story"
---

# 🎯 Day 95: Technical Interview Workshop

> *"In an interview, the goal is not to be right. The goal is to be understood. Speak your thoughts."*

---

## Prerequisites & Recommended Order

This workshop's "advanced interview SQL" section (median, consecutive logins, gaps and islands) assumes comfort with core SQL: aggregation, window functions, self-joins, and correlated subqueries. If those feel shaky, the interview drills below will be much harder than they need to be. Before tackling this lesson seriously:

* **Day 96 (Relational Database Internals)** — transactions, isolation levels (the ACID question in the mastery check draws on this).
* **Day 97-98 (DDL/DML)** — schema and constraint vocabulary used in the system-design drills.
* **Day 99 (Advanced DQL & Optimization)** — window functions and query-plan reading, used heavily in the median/gaps-and-islands solutions.
* **Day 100 (Advanced Joins)** — self-joins, used in the consecutive-logins solution.
* **Day 101 (Advanced Subqueries)** — correlated subqueries and `NOT EXISTS`, the core technique behind gaps-and-islands.

If you're following folder order, you can still attempt the drills below — full worked solutions and line-by-line walkthroughs are provided so you can learn the techniques here and reinforce them when you reach Days 96–101.

---

## The "Never-Coded" Bridge

**The Chef's Audition**

* **Resume**: "I cooked at Le Bernardin." (Looks good on paper).
* **The Interview**: "Here is a mystery basket. Make me a dish in 20 minutes."
  * **The Process**: The Chef narrates: "I see duck. I'm thinking duck confit. No, wait, not enough time. I'll sear the breast."
  * **Result**: Even if the duck is slightly overcooked, the Head Chef hires them because they *thought* correctly under pressure.

**Whiteboarding** is the same. It's not about syntax; it's about problem-solving out loud.

---

## Turning UrbanHop Into Interview Stories

You spent Days 93–94 designing and building UrbanHop. That work is not just a completed assignment — it's raw material for two kinds of interview answers:

* **System-design talking points**: "I designed a ride-sharing schema that had to support both a sub-second nearest-driver query and a 5-year analytical retention requirement, and here's the tradeoff I made between Postgres+PostGIS and a NoSQL geo store..." is a far stronger answer than reciting a generic system-design framework from memory.
* **STAR behavioral stories**: Any real decision, mistake, or tradeoff from your UrbanHop work is STAR material. Did you originally denormalize `current_city` onto `drivers` and then realize it would drift out of sync? That's a "tell me about a time you found a flaw in your own design" story. Did you reject DynamoDB for the wrong reason at first, then correct your reasoning? That's a "disagree and commit" or "I was wrong" story.

**Exercise 0 (do this before the rest of the lab)**: Open your Day 93 ADL and Day 94 implementation notes. Pick **one** real decision or mistake from UrbanHop (a rejected alternative, a bug you hit seeding 100k rows, an index that didn't help as much as expected) and write a 4-sentence STAR story from it before you read Exercise 3 below. You'll compare it against the model format there.

---

## The Technical Deep Dive

### 1. The System Design Interview

**Prompt**: "Design a URL Shortener (TinyURL)."
**Framework (The 4 S's)**:

1. **Scope**: "Do we need analytics? Custom aliasing?" (Clarify Requirements).
2. **Scale**: "How many writes/day? How many reads/day? What's the read:write ratio?" (Identify Bottlenecks — and always ask for the number rather than assuming one; see "Justifying the Numbers" below).
3. **Storage**: "A Key-Value store (Redis, DynamoDB) suits this access pattern (lookup by short code) better than a relational join-heavy schema." (Tech Choices, justified by access pattern — not "Redis is faster," see Day 93's engine-table reasoning).
4. **Structure**: "Hash the long URL (e.g., MD5 or SHA-256), take a prefix of the resulting hash as the short code, store `{short_code: original_url}`." (Algorithm — see "Hash Collisions" below for why "just take 7 characters" is incomplete on its own).

### 2. Advanced SQL Patterns (Interview Favorites)

> **Dialect note**: All SQL below targets **PostgreSQL 14+**. `PERCENTILE_CONT` and window functions are part of the SQL standard and exist in most major engines, but exact syntax (e.g., MySQL lacks `PERCENTILE_CONT` before 8.0, and named differently in some warehouses) varies — always ask your interviewer which engine they want.

**The 'Median' Problem — full worked drill**

**Schema and seed data**:

```sql
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    department  VARCHAR(50),
    salary      DECIMAL(10,2)
);

INSERT INTO employees (department, salary) VALUES
    ('Engineering', 95000),
    ('Engineering', 105000),
    ('Engineering', 110000),
    ('Engineering', 120000),
    ('Engineering', 250000),  -- outlier: a senior staff engineer
    ('Sales', 60000),
    ('Sales', 65000);
```

**Solution 1 — the standard answer**:

```sql
SELECT
    department,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary) AS median_salary
FROM employees
GROUP BY department;
```

**Expected output**:

| department | median_salary |
| :--- | :--- |
| Engineering | 110000 |
| Sales | 62500 |

**Why these numbers**: Engineering has 5 values (95000, 105000, **110000**, 120000, 250000) — an odd count, so the median is the exact middle value, 110000, unaffected by the 250000 outlier (this is exactly why median is preferred over `AVG` for skewed compensation data — `AVG` here would be 136,000, pulled upward by one outlier). Sales has 2 values (60000, 65000) — an even count, so `PERCENTILE_CONT` linearly interpolates between them: (60000+65000)/2 = 62500.

**Solution 2 — without window functions (the "shows deeper understanding" version)**:

```sql
WITH ranked AS (
    SELECT
        department,
        salary,
        ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary) AS rn,
        COUNT(*) OVER (PARTITION BY department) AS total
    FROM employees
)
SELECT
    department,
    AVG(salary) AS median_salary   -- AVG of the 1 or 2 middle rows
FROM ranked
WHERE rn IN (FLOOR((total + 1) / 2.0), CEIL((total + 1) / 2.0))
GROUP BY department;
```

This sorts rows within each department (`ROW_NUMBER() OVER (PARTITION BY ... ORDER BY salary)`), counts the group size (`COUNT(*) OVER (PARTITION BY department)`), then picks the middle row (odd count) or averages the two middle rows (even count) — manually reproducing what `PERCENTILE_CONT` does internally. Interviewers ask for this version specifically to see if you understand *why* the built-in function works, not just that it exists.

**The 'Consecutive Logins' Problem — full worked drill**

**Schema and seed data**:

```sql
CREATE TABLE logins (
    user_id    INT,
    login_date DATE
);

INSERT INTO logins (user_id, login_date) VALUES
    (1, '2026-06-01'), (1, '2026-06-02'), (1, '2026-06-03'), (1, '2026-06-10'),
    (2, '2026-06-01'), (2, '2026-06-03'), (2, '2026-06-05');
```

**Goal**: Find users who logged in on 3 or more *consecutive* calendar days.

**Solution**:

```sql
WITH gapped AS (
    SELECT
        user_id,
        login_date,
        login_date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date))::int AS grp
        -- "Islands" trick: subtracting a running row number from the date produces the SAME
        -- constant value for every date inside one unbroken consecutive run, and a DIFFERENT
        -- constant for each separate run -- this is what lets us GROUP BY a run identifier.
    FROM logins
),
streaks AS (
    SELECT user_id, grp, COUNT(*) AS streak_length, MIN(login_date) AS streak_start
    FROM gapped
    GROUP BY user_id, grp
)
SELECT user_id, streak_start, streak_length
FROM streaks
WHERE streak_length >= 3;
```

**Expected output**:

| user_id | streak_start | streak_length |
| :--- | :--- | :--- |
| 1 | 2026-06-01 | 3 |

**Why**: User 1's dates 06-01, 06-02, 06-03 are consecutive (each one day apart), forming a 3-day streak; 06-10 is isolated. User 2's dates (06-01, 06-03, 06-05) are each 2 days apart, never consecutive, so no streak ≥ 2 exists for them and they correctly don't appear in the output. (This matches the manual verification: user 1 has a 3-day streak, user 2's longest run is 1 day.)

**The 'Gaps and Islands' Problem — line by line**

**Goal**: Find gaps in an ID sequence.

**Schema and seed data**:

```sql
CREATE TABLE numbers (id INT PRIMARY KEY);
INSERT INTO numbers (id) VALUES (1), (2), (3), (5), (6), (8);
```

**Query**:

```sql
SELECT id + 1 AS missing_start
FROM numbers n1
WHERE NOT EXISTS (
    SELECT 1 FROM numbers n2 WHERE n2.id = n1.id + 1
)
AND id < (SELECT MAX(id) FROM numbers);
```

**Expected output**:

| missing_start |
| :--- |
| 4 |
| 7 |

**Line by line**:
- `FROM numbers n1` — the outer query aliases the table `n1`; we'll consider every row as a *candidate* "last id before a gap."
- `WHERE NOT EXISTS (SELECT 1 FROM numbers n2 WHERE n2.id = n1.id + 1)` — this is a **correlated subquery**: for each outer row `n1`, the inner query checks whether a row with `id = n1.id + 1` exists *in the same table*, re-evaluated once per outer row (that correlation, `n1.id`, referenced inside the subquery, is what makes it correlated rather than a plain independent subquery). `SELECT 1` is a common idiom meaning "I don't care what columns come back, only whether any row exists" — `EXISTS`/`NOT EXISTS` only check for row presence, so selecting a literal `1` avoids wasting effort fetching real column data.
- `AND id < (SELECT MAX(id) FROM numbers)` — this is essential **boundary handling**: without it, the *last* row in the table (`id = 8`) would also satisfy `NOT EXISTS (... id = 9)`, since 9 genuinely doesn't exist — but 9 isn't a "gap," it's simply past the end of our known data. This condition excludes the final row from being treated as the start of a phantom gap.
- The aliases `n1`/`n2` exist purely so the correlated subquery can distinguish "the current outer row" from "the row I'm checking for" while querying the *same table* in both places.
- **Why this returns only missing range *starts*, not arbitrary missing ranges**: the query identifies each `id` whose immediate successor (`id + 1`) is absent, and reports that successor's value. It correctly reports `4` (since 3 exists, 4 doesn't) and `7` (since 6 exists, 7 doesn't) — but it does **not** report the full extent of a multi-row gap (e.g., if the gap were `4, 5, 6, 7` all missing between 3 and 8, this query would still only report `missing_start = 4`, not the full range `4-7`). To get full gap *ranges* (start and end), you'd extend this with a second `NOT EXISTS` check for the gap's end boundary, or use the islands technique from the Consecutive Logins solution above, inverted to find gaps instead of runs.

### 3. Behavioral: The Amazon Leadership Principles

* **Customer Obsession**: "I ignored the VP's feature request because user data showed nobody wanted it."
* **Bias for Action**: "The server was crashing. I restarted it *before* getting approval, restoring service while minimizing further downtime."
* **Disagree and Commit**: "I argued for Python. The team chose Go. I learned Go in a weekend and helped ship it."

---

## Senior-Level Insights

### "I Don't Know" Is a Valid Answer

* **Junior**: Makes up a fake answer. (Fails immediately).
* **Senior**: "I don't know the exact syntax for `MERGE` in Oracle, but here is how I would do it in Postgres using `INSERT ... ON CONFLICT`..."
* **Why?**: Shows honesty + transferable knowledge.

### The "Trade-off" Is the Real Answer

* **Interviewer**: "Should we use Kafka?"
* **Junior**: "Yes! Kafka is cool!"
* **Senior**: "It depends. If we need durability and replayability, yes. If we need sub-millisecond latency and don't strictly need message replay, a simpler queue might be a better fit."

---

## Justifying the Numbers: System Design Estimation

Interview prompts love throwing out round numbers ("design for 1M requests/sec") without justification. A senior candidate questions them out loud rather than accepting them silently:

* **"1M req/s"**: Is this global peak, or per-region average? 1M req/s sustained is roughly Twitter/Meta-scale traffic — if an interviewer states it for a startup-stage feature, the correct senior response is "let's sanity-check that: if we have 10M daily active users each making 10 requests/day, that's only ~1,150 req/s average, with peaks maybe 5-10x that — where does 1M come from?" Always **derive** scale from a stated user count and usage pattern rather than accepting an ungrounded number.
* **"10-second flush interval"** (batching counter increments before writing to the database): This is a tradeoff between write load and staleness — every second you wait, you reduce write amplification but increase the "eventual consistency" window. State the tradeoff explicitly: "a 10-second flush means a like count can be up to 10 seconds stale; if the business requirement is real-time display, that may be too slow, and we'd need a shorter interval or a different architecture."
* **"+5,000 likes"** (example batch size): This number is only meaningful relative to a stated rate — at what request rate does 5,000 likes accumulate in your flush interval? Always pair a count with the rate and window that produced it.
* **"First seven characters" of a hash for a URL shortener**: This determines your **collision** risk and capacity. Base62 (a-z, A-Z, 0-9) over 7 characters gives 62^7 ≈ 3.5 trillion possible codes — comfortably more than any realistic URL-shortener's total link volume, which is *why* 7 is a reasonable choice, not an arbitrary one. You should be able to do this math live in an interview, and state how you'd **handle a collision** if the prefix were ever already taken: check the table for an existing row with that code before committing, and if it's taken, regenerate (or extend the hash) rather than silently overwriting someone else's link.
* **"0.1% click rate"**: A rate alone is meaningless without its denominator and context — "0.1% of how many impressions, measured over what window, compared to what baseline?" If 0.1% is being used to justify removing a feature, ask what the *expected* or *previous* rate was; a small percentage isn't automatically bad if the absolute volume or strategic value is high.

---

## Coverage: What the Drills Above Don't Cover (But Interviewers Ask About)

* **Requirements estimation**: Always derive request/storage volume from stated user counts and behavior, as shown above — don't accept a magic number.
* **Hash collisions**: Any hash-based ID scheme (URL shorteners, idempotency keys, content addressing) needs an explicit collision-handling plan: check-before-write, append a disambiguating suffix, or use a long enough hash that collision probability is negligible (and say what "negligible" means numerically).
* **Idempotency**: If a client retries a request (e.g., a flaky network causes a duplicate "like" or "create trip" call), does your system double-count? An **idempotency key** (a client-generated unique ID attached to the request, checked against a dedupe table before processing) is the standard fix — directly relevant to the Day 98 "Runs safely 100 times" upsert discussion in this phase.
* **Cache failure modes**: What happens when your Redis cache goes down — does every request now hit the database simultaneously (a "cache stampede" or "thundering herd")? Mention a mitigation (request coalescing, short jittered TTLs, a circuit breaker) rather than assuming the cache is always available.
* **Consistency / reconciliation**: In an eventually-consistent system (like the like-counter buffer below), how do you detect and correct drift between the cache/buffer and the source of truth? A periodic reconciliation job that re-counts from the durable store and corrects the cache is a standard answer.
* **Behavioral follow-ups**: Interviewers will probe a STAR answer with "what would you do differently?" or "how did the team react?" — prepare a genuine answer, not a deflection; a candidate who can name a real shortcoming in their own past decision (like a denormalization choice that caused drift) reads as more senior, not less.
* **Negotiation ethics and total compensation**: Negotiate honestly — don't fabricate a competing offer. Evaluate an offer on **total compensation** (base + bonus target + equity vesting schedule + benefits), not base salary alone; a lower base with strong equity/bonus can out-earn a higher base with neither, and vice versa, depending on the company's stage and your risk tolerance.

---

## Hands-on Lab

### Exercise 1: System Design Drill — The Like Counter (Timeboxed: 25 minutes)

**Goal**: Design a "Like Counter" system, narrating out loud the whole time.

**Constraint, stated and justified**: Assume a platform with 50M daily active users, each viewing ~20 posts/day and liking ~2% of what they view. That's 50M × 20 × 0.02 = **20M likes/day**, or an average of ~230 likes/sec, with peak traffic (e.g., a viral post during a launch event) plausibly 20-50x that — so design for roughly **5,000-10,000 likes/sec at peak**, not the ungrounded "1M req/s" some prompts state without derivation.

**Expected model solution**:
1. **Write buffer (Redis)**: Increment an in-memory counter per post ID on every like. Redis handles tens of thousands of increments/sec easily.
2. **Batch write**: Every 10 seconds, flush each post's aggregate delta to Postgres in a single `UPDATE`. *State the tradeoff*: counts may be up to 10 seconds stale ("eventual consistency") — acceptable for a like counter, not acceptable for, say, a bank balance.
3. **Read path**: Serve reads from Postgres + a read-through cache, not by hitting Redis directly for the canonical count (Redis here is a *write* buffer, not necessarily the read source of truth — state which you chose and why).
4. **Idempotency**: A double-tap or client retry on "like" must not double-count — attach a client-generated idempotency key (or rely on toggling a `(user_id, post_id)` membership row) so re-sending the same like is a no-op.
5. **Failure mode**: If Redis crashes before a flush, you lose up to 10 seconds of unflushed likes. State this explicitly and propose a mitigation (e.g., a periodic reconciliation job, or write-ahead logging the increments).

**Interviewer rubric**:

| Signal | Weak answer | Strong answer |
| :--- | :--- | :--- |
| Scale | Accepts "1M req/s" without question | Derives a number from stated DAU and behavior |
| Architecture | Jumps straight to "use Redis" | States write buffer -> batch flush -> read path, with each stage's purpose |
| Tradeoffs | Doesn't mention staleness | Explicitly names eventual consistency and quantifies the staleness window |
| Failure modes | Assumes Redis never fails | Names what happens on Redis failure and a mitigation |
| Idempotency | Doesn't address duplicate likes | Names a specific dedupe mechanism |

### Exercise 2: SQL Challenge — Median (Timeboxed: 15 minutes)

Using the `employees` schema and seed data above, write the `PERCENTILE_CONT` query, then the no-window-function version, and verify both produce **Engineering: 110000, Sales: 62500**.

### Exercise 3: SQL Challenge — Consecutive Logins (Timeboxed: 15 minutes)

Using the `logins` schema and seed data above, write the islands-trick query and verify it returns exactly one row: **user_id 1, streak_start 2026-06-01, streak_length 3**.

### Exercise 4: SQL Challenge — Gaps and Islands (Timeboxed: 15 minutes)

Using the `numbers` schema and seed data above, write the `NOT EXISTS` query and verify it returns exactly **`4` and `7`**. Then, as a stretch goal, extend it to also return the gap's *end* boundary (hint: find the next existing id after the gap, by reusing the islands technique).

### Exercise 5: STAR Story — UrbanHop Conflict (Timeboxed: 10 minutes)

**Goal**: Using the UrbanHop decision you picked in "Turning UrbanHop Into Interview Stories" above, write a STAR story in this exact structure:

* **S (Situation)**: One sentence of business/technical context (e.g., "UrbanHop's nearest-driver query was failing its 300ms SLA at 33,000 simulated drivers per city.")
* **T (Task)**: What you were responsible for resolving.
* **A (Action)**: The specific decision you made — name the rejected alternative too (e.g., "I considered moving to Redis geo commands but stayed with PostGIS because our team already knew SQL and the operational cost of running a second datastore wasn't justified at this scale.")
* **R (Result)**: A measured outcome, even if the measurement is from your own benchmark (e.g., "Adding the spatial index brought p95 query time from ~800ms to ~120ms in my local 100k-row test.")

**Model example** (for comparison, not for copying):

* **S**: Design team wanted a real-time carousel of trending neighborhoods on UrbanHop's homepage.
* **T**: I had to evaluate whether our schema could support it within the existing query SLA.
* **A**: I benchmarked the proposed query against my seeded 100k-row dataset, found it required a full table scan with no useful index, and proposed a materialized rollup table refreshed every 5 minutes instead of a live aggregate — rejecting the live-aggregate approach because it would have added ~400ms to every homepage load.
* **R**: The team adopted the materialized-rollup approach; homepage load time stayed within the existing budget instead of regressing by ~400ms.

---

### Non-Functional Constraints (Apply to All Exercises)

* **Performance / Scale**: Document a target query runtime of **p95 < 4s** for your final solution, validate behavior at **15 concurrent analytical users/sessions**, and keep compute spend below **$1** per production-equivalent run.
* **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
* **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  * KPI focus for this day: *Interview artifacts should demonstrate how database design decisions improve SLA attainment, reporting speed, and cost-to-serve metrics.*

---

## Glossary

| Term | Definition |
| :--- | :--- |
| **Whiteboarding** | Solving a technical problem out loud, in real time, in front of an interviewer — evaluated on reasoning process, not just the final answer. |
| **Percentile** | A value below which a given percentage of observations fall (e.g., the 50th percentile / median is the value below which half the data falls). |
| **Gaps and islands** | A class of SQL problems involving finding missing values in a sequence ("gaps") or runs of consecutive/contiguous values ("islands"), typically solved with window functions or correlated subqueries. |
| **Cache** | A fast, typically in-memory data store that holds a copy of frequently accessed data to avoid repeatedly querying a slower source of truth. |
| **Buffer** | A temporary holding area for data before it's processed or written to its final destination — e.g., accumulating likes in Redis before a periodic flush to Postgres. |
| **Eventual consistency** | A consistency model where, after a write, all reads will *eventually* (not necessarily immediately) reflect that write — acceptable for data tolerant of brief staleness, unacceptable for data requiring strict correctness at every instant (e.g., financial balances). |
| **STAR** | A behavioral-interview answer structure: Situation, Task, Action, Result — used to give concrete, structured answers instead of vague generalities. |
| **Idempotency key** | A unique identifier attached to a request so that retrying the same request multiple times produces the same effect as doing it once, rather than duplicating the action. |
| **Collision** | When two different inputs to a hash function produce the same hash output — a risk that must be explicitly handled (check-before-write, longer hash, disambiguating suffix) in any hash-based ID scheme. |

---

## Mastery Check

### Question 1: System Design

In a read-heavy system (100:1 Read/Write ratio), what is generally the best first optimization to investigate?

A) Sharding.
B) Caching (Redis/Memcached).
C) Vertical Scaling.
D) Buying more hard drives.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Caching absorbs read load cheaply and is usually the first lever to pull for a read-heavy system, before reaching for sharding (which primarily helps write/storage scale) or vertical scaling (which has a cost and hardware ceiling).
</details>

### Question 2: SQL

What is a `CROSS JOIN`?

A) A standard join.
B) A Cartesian Product (every row joined with every other row).
C) An error.
D) A religious symbol.

<details>
<summary>Click for Answer</summary>

**Answer: B**
A `CROSS JOIN` pairs every row of one table with every row of another, producing `N x M` rows — dangerous if unintentional, since it can silently explode result-set size.
</details>

### Question 3: Behavioral

When asked about a weakness, what should you say?

A) "I work too hard." (Cliché/Fake).
B) A real weakness, followed by how you are actively addressing it (e.g., "I struggle with public speaking, so I joined Toastmasters").
C) "I have none." (Comes across as lacking self-awareness).
D) "I hate SQL." (Disqualifying for this role).

<details>
<summary>Click for Answer</summary>

**Answer: B**
Self-awareness paired with a concrete corrective action is the signal interviewers are looking for — a fabricated or evasive answer reads as either dishonest or lacking reflection.
</details>

### Question 4: ACID

Which isolation level, by default in Postgres, prevents "Dirty Reads" (reading another transaction's uncommitted changes)?

A) Read Uncommitted.
B) Read Committed.
C) Serializable only.
D) None — dirty reads are unavoidable.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Read Committed (Postgres's default isolation level) already prevents dirty reads — you don't need to escalate all the way to Serializable just to avoid them. (See Day 96 for the full isolation-level breakdown and which anomalies each level does/doesn't prevent.)
</details>

### Question 5: Negotiation

When should you discuss salary specifics in an interview process?

A) In the very first email.
B) Generally after they've decided they want to hire you (leverage is highest once they've invested in you), while evaluating total compensation rather than base salary alone.
C) Never — it's rude to discuss money.
D) During the technical interview, to set expectations early.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Once a company has decided they want you, your negotiating leverage is highest. Evaluate the resulting offer on total compensation (base + bonus + equity + benefits), not base alone — a like-for-like base salary comparison across two offers can be misleading if their equity/bonus structures differ.
</details>

### Question 6: Gaps and Islands

In the gaps-and-islands query, what does the condition `AND id < (SELECT MAX(id) FROM numbers)` prevent?

A) It prevents duplicate rows from appearing in the output.
B) It prevents the last row in the table from being incorrectly treated as the start of a phantom gap, since "no row with id+1" is trivially true for the final row and isn't a real gap.
C) It makes the query run faster with no semantic effect.
D) It is unnecessary and can be removed safely.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Without this boundary condition, the highest id in the table (8 in our example) would also satisfy `NOT EXISTS (id = 9)`, since 9 truly doesn't exist in the table — but that's simply the end of known data, not a real gap. The condition excludes the final row from the result.
</details>

### Question 7: Hashing and Collisions

A URL shortener uses the first 7 characters of a Base62-encoded hash as the short code. What must the system do if a newly generated code collides with an existing one?

A) Nothing — collisions in a 7-character Base62 space are mathematically impossible.
B) Check for an existing row with that code before committing, and regenerate or extend the code if a collision is found, rather than silently overwriting the existing link.
C) Allow both URLs to share the same short code; users will figure out which one they meant.
D) Immediately fail the entire system and require a manual restart.

<details>
<summary>Click for Answer</summary>

**Answer: B**
62^7 (~3.5 trillion combinations) makes collisions rare but not impossible at scale — a robust system always checks for an existing row before committing a new short code and has an explicit fallback (retry with a different hash slice, or extend the code length) rather than assuming collisions can't happen.
</details>

### Question 8: Eventual Consistency

In the Like Counter design, likes are buffered in Redis and flushed to Postgres every 10 seconds. What does this make the displayed like count?

A) Always perfectly accurate in real time.
B) Eventually consistent — it may lag the true count by up to the flush interval, which is an acceptable tradeoff for this use case but would NOT be acceptable for something like a bank balance.
C) Permanently wrong until a human fixes it.
D) Unrelated to consistency models entirely.

<details>
<summary>Click for Answer</summary>

**Answer: B**
The displayed count is eventually consistent: it converges to correctness after the flush interval elapses, but can be briefly stale in between. This tradeoff (staleness for write efficiency) is reasonable for a like counter, but the same design would be wrong for a use case requiring strict, immediate consistency.
</details>

---

## Summary

Today you learned:

* ✅ **System Design**: Derive scale from stated assumptions (don't accept ungrounded numbers), think in tradeoffs, and name failure modes explicitly.
* ✅ **Whiteboarding**: Narrate your thought process — the reasoning is what's being evaluated, not just the final query.
* ✅ **Advanced SQL drills**: Worked, verified solutions for median (`PERCENTILE_CONT` and the manual window-function equivalent), consecutive logins (the islands technique), and gaps-and-islands (correlated `NOT EXISTS` with boundary handling).
* ✅ **STAR Method**: Turned a real UrbanHop capstone decision into a structured behavioral story.
* ✅ **Negotiation**: Timing and total-compensation framing both matter.

**Tomorrow**: We return to **Core Principles** with **Day 96: Relational Database Internals**.
