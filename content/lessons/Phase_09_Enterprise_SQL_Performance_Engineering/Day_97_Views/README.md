---
day: 97
title: "Materialized Views & Caching"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "materialized-views"
duration: 120
difficulty: "advanced"
tags:
  - materialized-views
  - caching
  - performance
  - concurrency
concepts:
  - "Standard vs Materialized Views"
  - "Refresh Strategies (Concurrent vs Blocking)"
  - "Dependencies and Staleness"
  - "View Indexing"
prerequisites:
  - "Basic SQL Select"
outcomes:
  - "Create a Materialized View for a 1 Billion row table"
  - "Refresh the view safely without downtime"
  - "Index the view to make it faster than the base table"
---

# 🎯 Day 97: Materialized Views & Caching

> *"The fastest query is the one you don't have to run. Materialized Views are the database's cheat sheet."*

---

## The "Never-Coded" Bridge

**The Live Stream vs The DVD**

* **Standard View (Live Stream)**:
  * Every time you watch, the camera turns on, the actors declaim their lines, the lights flash.
  * *Real-time*: Yes.
  * *Cost*: High (Actors get tired).
* **Materialized View (The DVD)**:
  * You record the play once. You put it on a disc.
  * Every time you watch, you just spin the disc.
  * *Real-time*: No (It's a recording from Tuesday).
  * *Cost*: Low (Zero actor effort).

**Enterprise Strategy**: Most business reports don't need "Live" data. They need "Yesterday's" data fast.

---

## The Technical Deep Dive

### 1. View vs Materialized View

* **`CREATE VIEW summary AS SELECT ...`**:
  * Does **nothing** but save the SQL string.
  * When you query `summary`, it *unfolds* the SQL and runs the heavy computation *now*.
  * Zero storage cost. High CPU cost.
* **`CREATE MATERIALIZED VIEW summary AS SELECT ...`**:
  * Runs the query *immediately*.
  * Saves the **results** to a physical disk table.
  * When you query `summary`, it reads the physical table. (Instant).
  * High storage cost. Zero CPU cost (on read).

### 2. The Refresh Problem

The data is now "Frozen". If you add a sale to `orders`, the `summary` MView doesn't know.

* **`REFRESH MATERIALIZED VIEW summary`**:
  * Locks the view (Exclusive Lock). No one can read it for 5 minutes. (Bad for Prod).
* **`REFRESH MATERIALIZED VIEW CONCURRENTLY summary`**:
  * Calculate the new version in the background.
  * Diff it with the old version.
  * Swap them atomically.
  * *Requirement*: The view must have a Unique Index.

### 3. Indexing the View

Because an MView is a real table on disk, you can index it!

* **Base Table**: `orders` (1 Billion rows). Scrambled order.
* **MView**: `recent_orders` `WHERE date > '2024-01-01'`.
* **Index**: `CREATE INDEX idx_recent_client ON recent_orders(client_id)`.
* *Benefit*: You query a tiny, perfectly indexed table instead of the massive heap.

---

## Senior-Level Insights

### "Eventual Consistency" is a Feature

* **Junior**: "The dashboard must show the sale made 1 second ago!"
* **Senior**: "Why? Can the warehouse ship it in 1 second? Can the CEO fire them in 1 second?"
* **Reality**: Most orgs run on T-1 (Yesterday's data). An MView refreshed at 3 AM is perfect.

### The "Dependency Chain" Horror

* **Setup**: View A depends on View B depends on Table C.
* **Risk**: Refreshing A *before* B is refreshed means A contains stale data from B.
* **Solution**: Use an orchestration tool (Airflow/dbt) to manage the DAG (Directed Acyclic Graph) of refreshes.

---

## Hands-on Lab

### Exercise 1: The Heavy Lift

**Goal**: Observe the speed difference.

1. Create a table with 1M rows (`generate_series`).
2. Run `SELECT count(*) FROM table` (Seq Scan). Time it.
3. `CREATE MATERIALIZED VIEW mv_count AS SELECT count(*) FROM table`.
4. Run `SELECT * FROM mv_count`. Time it. (Should be 0.00ms).

### Exercise 2: The Refresh

**Goal**: See the staleness.

1. Insert 1 row into the Base Table.
2. Query the MView. (Count is still old).
3. Run `REFRESH MATERIALIZED VIEW mv_count`.
4. Query the MView. (Count is now new).

### Exercise 3: Concurrent Refresh

**Goal**: Production-grade refresh.

1. `CREATE UNIQUE INDEX idx_mv ON mv_count(count)`. (Need a unique key).
2. `REFRESH MATERIALIZED VIEW CONCURRENTLY mv_count`.
    * *Note*: While this runs, run a `SELECT` in another window. It works! (No locking).

---

## Mastery Check

### Question 1: Storage

Does a standard `VIEW` take up disk space?
A) Yes, substantial space.
B) No, only the query definition (text) is stored.
C) Yes, but compressed.
D) Depends on the moon phase.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Standard views are virtual.
</details>

### Question 2: Locking

What happens if you run `REFRESH MATERIALIZED VIEW` (without concurrently) on a busy production system?
A) Everything is fine.
B) Readers block. The dashboard freezes until the refresh is done.
C) The server crashes.
D) The view updates instantly.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Exclusive locks are dangerous in prod.
</details>

### Question 3: Freshness

If I modify the base table, does the Materialized View update automatically?
A) Yes, Postgres has magic.
B) No, you must triggers or a schedule to call REFRESH.
C) Only if you pay extra.
D) Yes, but slowly.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It is a snapshot.
</details>

### Question 4: Indexing

Can you put an index on a Standard View?
A) Yes.
B) No, because there is no data to index.
C) Only B-Trees.
D) Requires a plugin.

<details>
<summary>Click for Answer</summary>

**Answer: B**
(Unless it's an "Indexed View" in SQL Server, but in Postgres/Standard SQL, No). MViews essentially allow this.
</details>

### Question 5: Use Case

When should you use an MView?
A) For a "Forgot Password" lookup. (Needs real-time).
B) For a "Monthly Sales Report" that involves joining 15 tables.
C) For everything.
D) For small tables.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Heavy joins + low freshness requirement = MView sweet spot.
</details>

---

## Summary

Today you learned:

* ✅ **Standard Views**: Virtual windows (Zero Space, High CPU).
* ✅ **Materialized Views**: Physical Snapshots (High Space, Zero CPU).
* ✅ **Concurrency**: How to refresh without blocking readers.
* ✅ **Staleness**: The trade-off you make for speed.

**Tomorrow**: We speed up searches with **Advanced Indexing (GIN, GiST, BRIN)**.
