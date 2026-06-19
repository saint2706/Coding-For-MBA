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
  - "Phase 8 Concepts (Days 85-87)"
outcomes:
  - "Write a professional Design Document"
  - "Select a Tech Stack based on Constraints"
  - "Draft the Schema (ER Diagram)"
---

# 🎯 Day 88: Capstone Part 1: Design & Architecture

> *"Measurements is the first step that leads to control and eventually to improvement. If you can't measure it, you can't improve it. If you can't design it, you can't build it."*

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

## The Technical Deep Dive

### 1. The Design Document (TDD)

Every major feature at Google/Amazon starts with a Doc.

* **Context**: "Why are we doing this?" (Business Value).
* **Requirements**: "Must handle 1M writes/sec. Must answer queries in < 200ms."
* **Proposed Solution**: "Use DynamoDB for Writes, stream to Redshift for Analytics."
* **Alternatives Considered**: "Why not Postgres? Too slow for 1M writes/sec."

### 2. Choosing the Database Engine

| Use Case                    | Recommended Engine       | Why?                                |
| :-------------------------- | :----------------------- | :---------------------------------- |
| **User Profiles / Auth**    | **Postgres / MySQL**     | Consistency (ACID), Relational.     |
| **High Speed Events (IoT)** | **Cassandra / DynamoDB** | Write Speed (NoSQL), Scale.         |
| **Analytics / Reporting**   | **Snowflake / BigQuery** | Read Speed (Columnar), Aggregation. |
| **Search (Text)**           | **Elasticsearch**        | Inverted Index.                     |

### 3. Sharding & Partitioning Strategy

* **Vertical Scaling**: Buy a bigger server. (Limit: Cost).
* **Horizontal Scaling (Sharding)**: Split data across 100 servers.
* **Shard Key**: The column determines which server the data lives on.
  * *Bad Key*: `Timestamp`. (All traffic hits Server "Today". Hotspot).
  * *Good Key*: `User_ID`. (Traffic spreads evenly).

---

## Senior-Level Insights

### "Premature Optimization is the Root of All Evil"

* **Junior**: "I'm designing for 1 Billion users!" (Reality: You have 10 users).
* **Result**: You built a complex microservices mesh that costs $5k/mo and takes 3 weeks to change a button.
* **Senior**: "Start with a Monolith (Postgres). Shard when you hit 10TB."

### The "Buy vs Build" Decision

* **Build**: Write your own Auth system. (Fun, but risky).
* **Buy**: Use Auth0 / Cognito. (Boring, but secure).
* **Rule**: Only Build if it is your **Core Competency**. (If you sell shoes, don't build a database engine).

---

## Hands-on Lab

### Exercise 1: The Brief

**Goal**: Read the scenario.

**Scenario**: A "Ride-Sharing Algorithm" for a new city.

* **Input**: Stream of GPS locations from 10k drivers (every 5 sec).
* **Storage**: Must store 5 years of history for analysis.
* **Query**: "Find nearest driver" (Real-time) vs "Total miles driven in 2024" (Analytics).

### Exercise 2: Selecting the Tech Stack

**Goal**: Use the table above.

1. **Real-Time Geolocation**: Postgres + PostGIS (Good for spatial indexing). Or Redis (Geo).
2. **Historical Archive**: S3 (Parquet files) + Snowflake (for the Analytics query).
3. **Ingestion**: Kafka (to handle the stream).

### Exercise 3: Drafting the Schema (ERD)

**Goal**: Draw the relationships.

**Entities**:

* `Drivers` (id, name, current_lat, current_long).
* `Riders` (id, payment_token).
* `Trips` (id, driver_id, rider_id, start_time, end_time, fare).

**Relationship**:

* Driver - Trip (1:Many).
* Rider - Trip (1:Many).

**Sharding**:

* Shard `Trips` by `City_ID`. (London trips stay in London server).

---

### Non-Functional Constraints (Apply to All Exercises)

* **Performance / Scale**: Document a target query runtime of **p95 < 5s** for your final solution, validate behavior at **40 concurrent analytical users/sessions**, and keep compute spend below **$8** per production-equivalent run.
* **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
* **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  * KPI focus for this day: *Schema and platform design choices should enable <2 hour monthly close and <15 minute operational KPI refresh for business teams.*

### Architecture Decision Log (Capstone Requirement)

For your final capstone submission, include an **Architecture Decision Log** that captures:

1. **Decision and Context**: The architecture/schema/query decision, business context, and constraints.
2. **Tradeoffs**: What you gain and what you accept (performance, flexibility, governance, operational complexity).
3. **Rejected Alternatives**: At least two alternatives considered, with concise reasons they were rejected.
4. **Expected Operational Impact**: Predicted impact on reliability, on-call burden, incident recovery time, and ongoing cost.

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
Elasticsearch handles "Fuzzy matching" and relevance scoring best.
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
All writes hit the end of the range (One server).
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
Shows critical thinking and trade-off analysis.
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
Atomicity. Either the money moves, or it stays. No half-state.
</details>

### Question 5: CAP Theorem

In a distributed system, you can only pick 2 of 3: Consistency, Availability, ...?
A) Performance.
B) Partition Tolerance.
C) Privacy.
D) Power.

<details>
<summary>Click for Answer</summary>

**Answer: B**
CAP Theorem. (Usually, we pick AP or CP. Partition Tolerance is mandatory in networks).
</details>

---

## Summary

Today you learned:

* ✅ **Design Thinking**: Solutions start on a whiteboard.
* ✅ **Database Selection**: Right tool for the right job (SQL vs NoSQL).
* ✅ **Scaling**: Vertical vs Horizontal (Sharding).
* ✅ **CAP Theorem**: The fundamental trade-off of distributed systems.

**Tomorrow**: We build it. **Capstone Part 2: Implementation**.
