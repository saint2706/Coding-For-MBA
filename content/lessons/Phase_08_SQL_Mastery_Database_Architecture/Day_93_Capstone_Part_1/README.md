---
day: 93
title: "Capstone Part 1: Design & Architecture"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "capstone-design"
duration: 120
difficulty: "advanced"
tags:
  - architecture
  - modeling
  - design-doc
  - tech-stack
concepts:
  - "The Technical Design Doc (TDD)"
  - "Choosing the Right Database (SQL vs NoSQL vs Columnar)"
  - "Designing for Scale (Sharding Strategy)"
  - "Governance Policies"
prerequisites:
  - "Phase 8 Concepts (Days 90-92)"
  - "Days 96-101C (recommended remediation path — see below)"
outcomes:
  - "Write a professional Design Document"
  - "Select a Tech Stack based on Constraints"
  - "Draft the Schema (ER Diagram)"
---

# 🎯 Day 93: Capstone Part 1: Design & Architecture

> *"Measurement is the first step that leads to control and eventually to improvement. If you can't measure it, you can't improve it. If you can't design it, you can't build it."*

---

## Prerequisites & Recommended Order

This lesson sits at Day 93 in the folder, but it is a **synthesis** exercise — it asks you to reason about relational fundamentals, schema design, indexing, and distributed-systems tradeoffs before the phase has formally taught them on Days 96–101C. That is a known sequencing gap in this phase. Two ways to proceed:

| If you are... | Do this |
| :--- | :--- |
| **Following folder order (Day 93 next)** | Read the **Glossary** section below before starting, treat the engine-selection guidance as a preview, and plan to revisit your ERD after Day 101 with corrected normalization/indexing decisions. You will still get value from the architecture-thinking exercise — just expect to patch the schema later. |
| **Want the fundamentals first (recommended)** | Pause here and complete, in order: **Day 96 (Relational Database Internals — ACID, MVCC, isolation)**, **Day 97 (Advanced DDL & Schema — constraints, normalization, partitioning)**, **Day 98 (Advanced DML & Upserts)**, **Day 99 (Advanced DQL & Optimization — query plans)**, **Day 100 (Advanced Joins & Algorithms)**, **Day 101 (Advanced Subqueries)**, **Day 101B (NoSQL Deep Dive)**, and **Day 101C (Streaming SQL Fundamentals)**. Then return to Day 93–95 with a much stronger foundation for the capstone and interview workshop. |

Either path is valid for this curriculum's current structure. What matters is that you don't treat Day 93's engine table as gospel without understanding *why* — that's exactly what Day 96–101C will teach you to evaluate.

---

## The "Never-Coded" Bridge

**The Blueprint vs. The Hammer**

* **Coder**: Picks up a hammer and starts hitting wood. (Result: A crooked birdhouse).
* **Architect**: Draws a Blueprint first.
  * Where does the plumbing go? (Data Pipelines).
  * Where are the load-bearing walls? (Primary Keys).
  * Is the foundation strong enough for a skyscraper? (Scalability).

**Today**, you put down the Hammer (SQL Editor) and pick up the Pen (Architecture Diagram).

---

## Meet UrbanHop: Your Phase 8 Capstone Project

Starting today, you are the founding data architect for **UrbanHop**, a ride-sharing startup launching in three cities (New York, San Francisco, London). UrbanHop is the **recurring project for the rest of this phase**: the schema, ERD, and Architecture Decision Log (ADL) you produce today are not a throwaway exercise — they are the contract that **Day 94 (Implementation)** builds against, and the lived experience you'll mine for system-design and STAR stories on **Day 95 (Career Workshop)**.

> **Carry-forward instruction for future maintainers/other lessons:** Day 93 is the canonical source of the UrbanHop schema, ERD, and ADL. Day 94 implements it (and extends it with `riders` and a GPS/ratings table). Days 96–101C may reference "UrbanHop" informally as an illustrative ride-sharing example, but Day 93/94 own the authoritative schema definition. If you are revising Days 96–101C, treat the schema below (and its Day 94 extension) as ground truth rather than inventing a conflicting version.

---

## The Technical Deep Dive

### 1. The Design Document (TDD)

Every major feature at Google/Amazon starts with a Doc — but be careful with the acronym: in this lesson **"TDD" means Technical Design Doc**, not "Test-Driven Development" (the software practice of writing a failing test before the implementation code). Database architects use the former; you'll encounter the latter in software engineering contexts. Watch for which one a job posting or interviewer means.

A Technical Design Doc typically has four sections:

* **Context**: "Why are we doing this?" (Business Value).
* **Requirements**: "Must handle 1,000 writes/sec at launch. Must answer 'nearest driver' queries in < 200ms p95."
* **Proposed Solution**: "Use Postgres for transactional data, stream GPS pings through Kafka, archive trip history to Parquet on S3."
* **Alternatives Considered**: "Why not DynamoDB for everything? Because our access patterns need ad hoc analytical joins (finance, ops) that NoSQL key-value stores don't do well, and our write volume (low thousands/sec) doesn't yet justify the operational cost of a distributed NoSQL cluster."

Note the difference from a glib one-liner: a real TDD states a **measurable requirement** and a **rejected alternative with a reason**, not just a chosen tool.

### 2. Choosing the Database Engine — With Real Decision Criteria

The table below is a *starting point for analysis*, not a lookup table to memorize. Production architecture decisions are rarely "one engine per use case" — they depend on consistency needs, latency budget, access pattern, the operational skill already on your team, vendor lock-in tolerance, and cost. Treat every row as a hypothesis you'd still defend in a design review.

| Use Case | Candidate Engine(s) | Consistency | Latency Profile | Access Pattern | Operational Skill Needed | Lock-in Risk | Relative Cost | Rejected Alternatives (and why) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **User Profiles / Auth** | Postgres / MySQL | Strong (ACID) | Single-digit ms reads | Point lookups + relational joins (user ↔ trips ↔ payments) | Moderate — most teams already know SQL | Low (standard SQL, portable) | Low-Medium | *DynamoDB* — rejected because auth/profile data needs ad hoc joins for support tooling and fraud review that a key-value store makes painful. |
| **High-Speed Events (GPS pings, IoT)** | Cassandra / DynamoDB / TimescaleDB | Tunable / eventual | Sub-10ms writes at scale | Append-heavy, partition-key lookups by `driver_id` + time range | High — distributed systems tuning, partition-key design | Medium-High (Cassandra ops is nontrivial; DynamoDB ties you to AWS) | Medium (pay for write throughput) | *Postgres* — rejected as the *primary* GPS sink at scale because a single-writer relational table degrades under sustained high-frequency inserts without partitioning/sharding work; acceptable for a pilot, risky past ~50k drivers. |
| **Analytics / Reporting (finance close, ops dashboards)** | Snowflake / BigQuery / Postgres w/ read replica | Strong, but typically a separate read-optimized copy | Seconds, not ms (batch-oriented) | Wide aggregations, scans, group-bys over months of history | Low-Medium (SQL skills transfer) | Medium (proprietary billing models) | High at scale, but pay-per-query | *Running analytics directly on the OLTP primary* — rejected because long-running aggregation queries compete with and degrade live trip-matching transactions. |
| **Search (driver/rider support lookups, fuzzy text)** | Elasticsearch / Postgres full-text | Eventual (index lag) | Tens of ms | Inverted-index text search, fuzzy match | Medium — cluster management, reindexing | Medium | Medium | *Plain `LIKE '%term%'` on Postgres* — rejected as the long-term solution because it can't use a B-tree index and degrades linearly with table size; acceptable only for a small admin tool. |
| **Real-Time "Nearest Driver" Geo Queries** | Postgres + PostGIS, or Redis (geo commands) | Strong (PostGIS) vs. weaker durability (Redis) | Single-digit to low-double-digit ms | Spatial radius/nearest-neighbor queries | Medium (PostGIS) to Low (Redis geo is simpler but less durable) | Low (PostGIS is open standard) to Medium (Redis-specific commands) | Low-Medium | *A naive `lat/long` column with no spatial index* — rejected because a full scan/Haversine calculation over all active drivers does not stay under a 200ms SLA past a few thousand concurrent drivers. |

**The senior-level point**: notice that every "winner" has a rejected alternative with a *specific, falsifiable* reason — not "X is bad." That's what Exercise 2 below will ask you to produce for UrbanHop specifically.

### 3. Sharding & Partitioning Strategy

* **Vertical Scaling**: Buy a bigger server. (Limit: Cost, and there's a ceiling on how big one machine can get).
* **Horizontal Scaling (Sharding)**: Split data across multiple servers, each holding a subset of rows.
* **Shard Key**: The column that determines which server (shard) a row lives on.
  * *Bad Key*: `created_at` / `Timestamp`. All of "today's" writes land on one shard — a **hotspot** — while yesterday's shards sit idle.
  * *Good Key*: `city_id` or `user_id`. Traffic spreads roughly evenly across shards because no single value dominates.
* **Partitioning** (a related but distinct technique): splitting one logical table into physical sub-tables *within the same database instance* (e.g., Postgres declarative partitioning by `trip_date` range). Partitioning helps query pruning and maintenance (drop old partitions fast); sharding helps horizontal write/storage scale across machines. You can do both at once — e.g., shard by `city_id` across servers, then partition each shard's `trips` table by month.

---

## Senior-Level Insights

### "Premature Optimization is the Root of All Evil"

* **Junior**: "I'm designing for 1 Billion users!" (Reality: UrbanHop has 3 cities and a few thousand drivers at launch).
* **Result**: You built a complex microservices mesh that costs $5k/mo and takes 3 weeks to change a button.
* **Senior**: "Start with a Monolith (Postgres). Shard when you hit measured pain — typically single-digit TB or sustained write saturation on one primary, not a round number you picked in advance."

### The "Buy vs Build" Decision

* **Build**: Write your own Auth system. (Fun, but risky).
* **Buy**: Use Auth0 / Cognito. (Boring, but secure).
* **Rule**: Only Build if it is your **Core Competency**. (UrbanHop's core competency is matching riders to drivers efficiently — not inventing an auth protocol).

---

## Coverage You're Missing If You Skip Ahead: Normalization, Ownership, Failure, Capacity, DR, Migration, Privacy

A real design doc covers more than "which engine." Use this checklist for your own UrbanHop design doc:

* **Normalization vs. denormalization**: Start normalized (3NF) for `drivers`, `riders`, `trips` — one fact per row, no repeated groups — because it protects write-side integrity (a driver's name lives in exactly one place). Denormalize deliberately and *only* where a specific read pattern demands it (e.g., a `current_city` cache column on `drivers` to avoid a join on every "find nearby driver" query) — and document *why* in your ADL, because every denormalized column is a future update-consistency bug waiting to happen.
* **Data ownership**: Who is the system of record for each entity? (e.g., the Trips service owns `trips`; the Payments service owns `payment_methods`, not the Trips team — even though Trips needs to read it.)
* **Failure modes**: What happens if the GPS-ingestion stream backs up for 10 minutes? If the matching service can't reach the database at all? Document the degraded-mode behavior (e.g., "show stale driver positions up to 30 seconds old" rather than "show nothing").
* **Capacity estimates**: Back-of-envelope math, shown explicitly. Example: 10,000 drivers × 1 GPS ping every 5 seconds = 2,000 writes/sec sustained. At ~100 bytes/row, that's ~200KB/sec, ~17GB/day, ~6TB/year *before* archival — a number you need to know before you can choose retention and storage tier.
* **Disaster recovery**: What's your Recovery Point Objective (RPO — how much data can you afford to lose) and Recovery Time Objective (RTO — how long can you be down)? For UrbanHop's `trips`/`payments` data, a reasonable target is RPO < 5 minutes (continuous WAL archiving) and RTO < 1 hour (standby replica promotion).
* **Migration strategy**: How will you evolve this schema without downtime? (Preview: Day 94 and Day 98 cover the expand/contract pattern in depth.)
* **Privacy threat modeling**: GPS pings are sensitive — they reveal where a named individual was at a given time. Ask: who can query raw location history? How long is it retained? Can a rider's location be correlated with a driver's identity in a way that creates a stalking risk if leaked? This must be answered in the design doc, not bolted on later.

---

## Hands-on Lab: The UrbanHop Capstone Specification

This is an **assessed deliverable**, not a "read the answer" walkthrough. You will produce four artifacts. The grading rubric is at the end — read it before you start.

### The Brief

**Scenario**: UrbanHop is launching ride-sharing in New York, San Francisco, and London. You are the founding data architect.

* **Input**: A stream of GPS locations from up to 10,000 drivers, one ping every ~5 seconds per active driver.
* **Storage**: Must retain 5 years of trip history for finance, tax, and analytics purposes; raw GPS-ping-level detail only needs 90 days of "hot" retention before archival.
* **Query patterns you must support**:
  1. **"Find nearest available driver"** — real-time, must return in well under a second, run thousands of times per minute during peak.
  2. **"Total miles driven by city, by month"** — analytical, run a handful of times per day by the ops/finance team, can tolerate multi-second latency.
  3. **"Has this rider completed 3+ trips in the last 7 days?"** (used for a loyalty promotion) — near-real-time, run on-demand when a rider opens the app.
* **Compliance constraint**: Riders can request deletion of their account and trip history (a GDPR-style "right to erasure" request) within 30 days, but UrbanHop must retain anonymized trip *counts* and *revenue* for financial reporting even after a deletion request.

### Required Artifacts (Submit All Four)

1. **An ERD** (Entity-Relationship Diagram) showing at minimum: `Drivers`, `Riders`, `Trips`, and one entity each for GPS/location data and a historical archive. For each entity, list its primary key, its foreign keys, and 3–5 representative attributes. (A hand-drawn diagram, a tool like dbdiagram.io, or a structured text description with explicit relationships are all acceptable — the rubric grades completeness and correctness, not drawing tool.)
2. **An engine-selection writeup**: for each of the three query patterns above, name a candidate engine, and write the **one-paragraph tradeoff** you would say out loud in a design review — including at least one rejected alternative with a specific technical reason (not "it's slower").
3. **A capacity and SLA table**: using the worked capacity-math style shown above, estimate writes/sec, storage/year, and state a query SLA (e.g., "p95 nearest-driver query < 300ms") and a **cost ceiling** (e.g., "total managed-database spend must stay under $400/month at this scale" — pick a number you can defend, not an arbitrary one).
4. **An Architecture Decision Log (ADL)** — see the required format below.

### Acceptance Tests (How You'll Know You're Done)

Your design passes if it can answer "yes" to all of these:

- [ ] Does the ERD show `Drivers`, `Riders`, `Trips`, a location/GPS entity, and a historical-archive entity, with correct 1:many cardinalities (one driver → many trips; one rider → many trips)?
- [ ] Does at least one column in your schema sketch exist *specifically* to support each of the three required query patterns (e.g., a spatial index column for nearest-driver, a `city_id` + `trip_date` combination for the monthly-miles report, a `rider_id` + `completed_at` index for the loyalty check)?
- [ ] Does your engine-selection writeup name a rejected alternative for at least 2 of the 3 query patterns, with a falsifiable reason?
- [ ] Does your capacity table show the arithmetic (not just a final number) for at least one estimate?
- [ ] Does your design explicitly address the GDPR-style deletion requirement (e.g., via anonymization-on-delete rather than hard delete, preserving aggregate counts)?
- [ ] Does your ADL have at least 3 entries, each with a rejected alternative?

### Scoring Rubric

| Criterion | Weight | What "full credit" looks like |
| :--- | :--- | :--- |
| ERD completeness & correctness | 25% | All 5 required entities present, keys and cardinalities correct, GPS/archive entities distinct from `Trips` |
| Engine-selection reasoning | 25% | Tradeoffs are specific to UrbanHop's actual query patterns and SLAs, not generic engine trivia; rejected alternatives have real reasons |
| Capacity/SLA/cost rigor | 20% | Math is shown, assumptions are stated, the cost ceiling is a defendable number tied to the capacity estimate |
| Compliance/privacy handling | 15% | Deletion-vs-retention conflict is explicitly resolved (e.g., anonymize, don't hard-delete financial aggregates) |
| Architecture Decision Log | 15% | 3+ entries, each with context, tradeoff, rejected alternative, and operational impact |

### Architecture Decision Log (Capstone Requirement)

For your final capstone submission, include an **Architecture Decision Log** that captures:

1. **Decision and Context**: The architecture/schema/query decision, business context, and constraints.
2. **Tradeoffs**: What you gain and what you accept (performance, flexibility, governance, operational complexity).
3. **Rejected Alternatives**: At least two alternatives considered, with concise reasons they were rejected.
4. **Expected Operational Impact**: Predicted impact on reliability, on-call burden, incident recovery time, and ongoing cost.

> **Carry this forward**: Your ERD, schema sketch, and ADL from this exercise are the inputs to **Day 94**, where you will translate them into actual `CREATE TABLE` statements, seed data, and indexes. Keep them — Day 94 explicitly tells you to implement the `riders` table and a GPS/ratings table you design here.

---

### Non-Functional Constraints (Apply to All Exercises)

* **Performance / Scale**: Document a target query runtime of **p95 < 5s** for your final solution, validate behavior at **40 concurrent analytical users/sessions**, and keep compute spend below **$8** per production-equivalent run.
* **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
* **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  * KPI focus for this day: *Schema and platform design choices should enable <2 hour monthly close and <15 minute operational KPI refresh for business teams.*

---

## Glossary

| Term | Definition |
| :--- | :--- |
| **TDD (Technical Design Doc)** | A written proposal covering context, requirements, proposed solution, and rejected alternatives — **not** to be confused with Test-Driven Development, the practice of writing a failing test before the implementation. |
| **ERD (Entity-Relationship Diagram)** | A diagram showing entities (tables), their key attributes, and the cardinality of relationships between them (1:1, 1:many, many:many). |
| **Sharding** | Splitting a dataset across multiple separate database servers/instances, each holding a subset of rows, to scale writes and storage horizontally. |
| **Partitioning** | Splitting one logical table into multiple physical sub-tables *within the same database instance*, usually by a range or list (e.g., by month), to improve query pruning and maintenance. |
| **Shard key** | The column used to decide which shard a given row belongs to. A poorly chosen shard key causes hotspots. |
| **Hotspot** | A condition where one shard, partition, or server receives disproportionately more traffic than others, often because the shard/partition key correlates with time or another skewed dimension. |
| **Columnar (store)** | A storage format that groups data by column rather than by row, optimized for scanning and aggregating one or few columns across many rows (analytics), at the cost of slower single-row writes/reads. |
| **Spatial index** | An index structure (e.g., PostGIS GiST/SP-GiST index) optimized for "nearest neighbor" and "within radius" geographic queries, instead of exact-match or range lookups. |
| **Event stream** | A continuously produced, ordered sequence of immutable event records (e.g., GPS pings), typically processed by a system like Kafka rather than written directly to a relational table. |
| **CAP theorem** | In a distributed system, under a network partition, you must choose between Consistency (every read sees the latest write) and Availability (every request gets a response) — you cannot have both at the same time during the partition. |
| **Monolith** | An architecture where one application/database serves most or all of the system's responsibilities, as opposed to many independently deployed services. |

---

## Mastery Check

### Question 1: Use Case

Which DB is best for a "Search Bar" on an E-Commerce site?
A) Postgres.
B) Redis.
C) Elasticsearch.
D) Excel.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Elasticsearch handles "fuzzy matching" and relevance scoring best, because it builds an inverted index over text — though for a small catalog, Postgres full-text search may be sufficient and cheaper to operate.
</details>

### Question 2: Hotspot

What causes a Hotspot in a sharded database?
A) The weather.
B) Using a sequentially increasing key (like Timestamp) as the Shard Key.
C) Too many users.
D) Bad cabling.

<details>
<summary>Click for Answer</summary>

**Answer: B**
All writes for "now" hit the same shard (one server), because a monotonically increasing key never spreads evenly across the shard range.
</details>

### Question 3: TDD

What is the most important section of a Design Doc?
A) The Code.
B) The "Alternatives Considered" (Why you chose X over Y).
C) The Font.
D) The Author's Name.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It shows critical thinking and tradeoff analysis — and it's the section reviewers actually push back on, since the "proposed solution" section is usually uncontroversial once the alternatives have been honestly weighed.
</details>

### Question 4: ACID

Which property ensures that a transaction is "All or Nothing"?
A) Atomicity.
B) Consistency.
C) Isolation.
D) Durability.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Atomicity. Either the entire transaction's writes apply, or none do — there is no half-applied state, even if the system crashes mid-transaction.
</details>

### Question 5: CAP Theorem

In a distributed system, during a network partition, you can only fully guarantee 2 of 3 properties: Consistency, Availability, and...?
A) Performance.
B) Partition Tolerance.
C) Privacy.
D) Power.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Partition Tolerance. In practice, real networks *will* partition, so the meaningful choice is between Consistency (CP) and Availability (AP) during that partition — Partition Tolerance isn't really optional for a system spanning more than one node.
</details>

### Question 6: Sharding vs. Partitioning

UrbanHop's `trips` table is split by `city_id` across three separate Postgres servers (NY, SF, London), and within the NY server the table is further split into monthly range partitions. What are these two techniques called, respectively?

A) Partitioning, then sharding.
B) Sharding, then partitioning.
C) Both are sharding.
D) Both are partitioning.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Splitting across separate server instances (NY/SF/London) is sharding; splitting one logical table into sub-tables within a single instance (monthly ranges inside the NY server) is partitioning. They're complementary, not interchangeable terms.
</details>

### Question 7: Engine Selection Reasoning

A teammate says "We should put everything in DynamoDB — it's infinitely scalable." What is the strongest objection, given UrbanHop's requirement to run "total miles driven by city, by month" analytics?

A) DynamoDB is too expensive at any scale.
B) DynamoDB doesn't support ad hoc multi-row aggregation/joins as naturally as a relational or columnar engine, making analytical reporting awkward.
C) DynamoDB cannot store numbers.
D) There is no valid objection — DynamoDB is strictly better.

<details>
<summary>Click for Answer</summary>

**Answer: B**
DynamoDB excels at high-throughput key-based access but is a poor fit for ad hoc aggregation across many rows/dimensions — exactly the access pattern the monthly-miles report needs. This is a tradeoff, not a universal ranking of "better" or "worse."
</details>

### Question 8: Normalization Tradeoff

UrbanHop adds a `current_city` column directly on the `drivers` table (denormalized — it's derivable from the driver's most recent trip or GPS ping) to speed up the "find nearby drivers" query. What is the cost of this decision?

A) There is no cost; denormalization is always free performance.
B) Every process that updates a driver's location must now also remember to update `current_city`, or the two will drift out of sync.
C) It makes the schema more normalized.
D) It removes the need for a primary key on `drivers`.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Denormalization trades write-side complexity and consistency risk for read-side speed. If any code path updates location without also updating `current_city`, the cached column becomes stale — this must be documented as a tradeoff in the ADL, not treated as a free win.
</details>

---

## Summary

Today you learned:

* ✅ **Design Thinking**: Solutions start on a whiteboard, with a defensible Technical Design Doc.
* ✅ **Database Selection**: Right tool for the right job — justified by consistency, latency, access pattern, ops skill, lock-in, and cost, not by category alone.
* ✅ **Scaling**: Vertical vs Horizontal (Sharding), and how partitioning is a complementary, distinct technique.
* ✅ **CAP Theorem**: The fundamental tradeoff of distributed systems.
* ✅ **UrbanHop**: You established the founding schema concept (Drivers, Riders, Trips, GPS/location, historical archive) that Day 94 will implement and Day 95 will mine for interview stories.

**Tomorrow**: We build it. **Capstone Part 2: Implementation** (Day 94).
