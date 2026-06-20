---
day: 94
title: "Capstone Part 2: Implementation"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "capstone-build"
duration: 120
difficulty: "advanced"
tags:
  - ddl
  - etl
  - optimization
  - build
concepts:
  - "Translating ERD to DDL (Create Tables)"
  - "Loading Data (Seed Script)"
  - "Index Tuning (Explain Analyze)"
  - "Stress Testing"
prerequisites:
  - "Day 93 (Capstone Part 1: Design & Architecture) — completed ERD and ADL"
  - "Days 97-101 (recommended remediation path — see below)"
outcomes:
  - "Deploy a working Postgres Database"
  - "Write a Python Script to seed a 100,000-row local demo dataset (with a noted path to a 1M-row production-scale stretch goal)"
  - "Optimize a Slow Query using EXPLAIN ANALYZE and an index"
---

# 🎯 Day 94: Capstone Part 2: Implementation

> *"Talk is cheap. Show me the code." — Linus Torvalds*

---

## Prerequisites & Recommended Order

This lesson uses DDL constraints, foreign keys, `EXPLAIN ANALYZE`, and B-tree indexing as working tools, before the phase's dedicated lessons on these topics. If any of the following feel unfamiliar as you read, pause and go cover them first — they'll make everything here much less mysterious:

* **Day 97 (Advanced DDL & Schema)** — constraints, normalization, partitioning, triggers.
* **Day 98 (Advanced DML & Upserts)** — `INSERT`/`UPDATE`/`ON CONFLICT`, transactions, batch loading.
* **Day 99 (Advanced DQL & Optimization)** — how to read an `EXPLAIN ANALYZE` plan tree, planner cost vs. actual time.
* **Day 100 (Advanced Joins & Algorithms)** — needed once you start joining `trips` to `drivers`/`riders` at scale.
* **Day 101 (Advanced Subqueries)** — needed for the KPI queries in Exercise 4.

If you're doing the phase in folder order, that's fine — this lesson is self-contained enough to follow step by step. Just expect some forward references ("we'll explain *why* this index helps in Day 99") rather than full theory here.

---

## The "Never-Coded" Bridge

**The Construction Site**

* **Day 93 (Architect)**: Drew the plans. "GPS pings go here, trip history goes there."
* **Day 94 (Builder)**: Pours the concrete. Installs the pipes.
  * **DDL**: Framing the house (`CREATE TABLE`).
  * **Seeding**: Moving the furniture in (`INSERT`).
  * **Optimization**: Sanding the floors (`CREATE INDEX`).

**Today**, we turn UrbanHop's paper design into a running database.

---

## Continuing the UrbanHop Thread

Day 93 established UrbanHop's founding entities: `Drivers`, `Riders`, `Trips`, a GPS/location entity, and a historical-archive concept, plus an Architecture Decision Log. Today you implement that design — not a simplified two-table version of it. By the end of this lesson your local Postgres instance will have **four tables**: `drivers`, `riders`, `trips`, and `gps_pings` (the supporting GPS/location table Day 93 called for). This satisfies the Day 93 carry-forward instruction that implementation must go beyond `drivers` and `trips` alone.

---

## The Technical Deep Dive

### 1. DDL: Constraints Are Key

Don't just `CREATE TABLE`. Use **constraints** to protect data quality at the database layer — relying on application code alone means every new service or script has to remember the rules, and eventually one won't.

* `PRIMARY KEY`: Enforces uniqueness and gives you a stable row identity.
* `FOREIGN KEY`: Enforces relationships. (Prevents a "trip" from pointing to a driver that doesn't exist — an **orphaned row**.)
* `CHECK (rating BETWEEN 0 AND 5)`: Enforces business logic so invalid data can't even be inserted.
* `NOT NULL`: Prevents missing data in columns the business logic depends on.

### 2. Seeding Data (Python + Faker)

You need realistic-volume data to observe performance problems.

* **Library**: `faker` — a Python package that generates realistic fake names, addresses, emails, etc. Install with `pip install faker` (this lesson assumes `faker>=20.0`).
* **Target**: **100,000 rows** per major table for this lesson's *local, runnable* demo. This is the number you should actually generate and measure against — it's large enough to show a sequential scan turn slow and an index turn it fast, on a laptop, in a reasonable amount of time.
* **The "1M rows" stretch goal**: You'll sometimes see production capstones target 1,000,000+ rows to simulate a maturing startup's actual scale. Treat that as a **separate, optional stretch goal** once your 100k-row pipeline works correctly — at 1M rows, naive row-at-a-time `INSERT` statements (Exercise 2 below) become painfully slow, which is exactly the motivation for the batch-insert/`COPY` techniques in the Coverage section. Don't try to hit 1M rows with the naive seeding script; it will take a very long time and isn't the point of this lesson.
* **Why volume matters at all**: Identifying "slow queries" on 10 rows is impossible — everything is fast on 10 rows. You need enough rows that a sequential scan is measurably slower than an index scan.

### 3. Optimization Strategy

* **Step 1**: Run `EXPLAIN ANALYZE SELECT ...` to see both the planner's *estimated* cost and the query's *actual* measured execution time.
* **Step 2**: Look for `Seq Scan` (Sequential Scan — Postgres reads every row in the table, like reading a whole book page by page looking for one sentence).
* **Step 3**: `CREATE INDEX idx_name ON table(column);` to build a B-tree lookup structure on that column.
* **Step 4**: Run `EXPLAIN ANALYZE` again. Look for `Index Scan` or `Bitmap Index Scan` (the planner can now jump straight to matching rows instead of reading the whole table).

---

## Senior-Level Insights

### "Indexes Are Not Free"

* **Junior**: "I'll index every column so reads are fast!"
* **Senior**: "Each index slows down `INSERT` / `UPDATE`, because the database has to maintain both the table *and* every index on every write."
* **Balance**: Only index columns actually used in `WHERE`, `JOIN`, or `ORDER BY` — and measure before adding more.

### The "Migration" Headache

* **Dev**: "I changed the schema locally. It works."
* **Prod**: "The deployment failed because the table has 50 million rows and a naive `ALTER TABLE ... ADD COLUMN NOT NULL` locked it for hours."
* **Solution**: The **expand/contract pattern** — add the new (nullable) column, dual-write to old and new, backfill historical rows in batches, switch reads to the new column, then drop the old column only once nothing references it. We'll use a version of this for the `riders` migration in Exercise 5.

---

## Hands-on Lab

### Environment Setup

This lab assumes:

* PostgreSQL 14+ running locally (or via Docker: `docker run --name urbanhop-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:14`).
* Python 3.10+ with `pip install faker psycopg2-binary` (or `psycopg[binary]` for psycopg3).
* A database named `urbanhop`: `createdb urbanhop` or `psql -c "CREATE DATABASE urbanhop;"`.

### Exercise 1: The Build (DDL) — UrbanHop Schema

**Goal**: Create the four-table schema implementing Day 93's design.

```sql
-- Dialect: PostgreSQL 14+

-- DRIVERS: the supply side of the marketplace.
CREATE TABLE drivers (
    driver_id     SERIAL PRIMARY KEY,         -- SERIAL = auto-incrementing INTEGER (1, 2, 3, ...);
                                               -- Postgres creates a hidden sequence and a NOT NULL default for you.
    name          VARCHAR(100) NOT NULL,      -- VARCHAR(100) caps name length; NOT NULL because a driver record
                                               -- without a name is a data-quality bug, not a valid edge case.
    current_city  VARCHAR(50),                -- Nullable: a newly-registered driver may not have a city yet.
    rating        DECIMAL(3,2) CHECK (rating BETWEEN 0 AND 5)
                                               -- DECIMAL(3,2): 3 total digits, 2 after the decimal point -> max
                                               -- value 9.99. We only need 0.00-5.00, but DECIMAL (not FLOAT)
                                               -- matters here because ratings/money must never suffer
                                               -- floating-point rounding error (e.g., 4.30 displaying as 4.2999999).
);

-- RIDERS: the demand side of the marketplace. Required by Day 93's design but
-- missing from earlier capstone drafts -- implemented here to close that gap.
CREATE TABLE riders (
    rider_id      SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    home_city     VARCHAR(50),
    signup_date   DATE DEFAULT CURRENT_DATE,  -- DEFAULT CURRENT_DATE: if the INSERT omits this column,
                                               -- Postgres fills in today's date automatically.
    is_deleted    BOOLEAN NOT NULL DEFAULT FALSE
                                               -- Supports the GDPR-style "right to erasure" flow from Day 93:
                                               -- we anonymize + flag rather than hard-delete, so financial
                                               -- aggregates referencing this rider_id remain valid.
);

-- TRIPS: the core fact table linking drivers and riders.
CREATE TABLE trips (
    trip_id       SERIAL PRIMARY KEY,
    driver_id     INT REFERENCES drivers(driver_id) ON DELETE RESTRICT,
                                               -- ON DELETE RESTRICT: Postgres will REFUSE to delete a driver
                                               -- row if trips still reference it -- this protects historical
                                               -- trip/financial records from silently disappearing.
    rider_id      INT REFERENCES riders(rider_id) ON DELETE RESTRICT,
    fare          DECIMAL(10,2) NOT NULL CHECK (fare >= 0),
                                               -- DECIMAL(10,2): up to 8 digits before the decimal point and 2
                                               -- after (max 99,999,999.99) -- comfortably covers any single
                                               -- fare while avoiding float rounding error in financial data.
    trip_date     DATE DEFAULT CURRENT_DATE,
    pickup_city   VARCHAR(50)
);

-- GPS_PINGS: the supporting location table Day 93 called for. In production this
-- would likely stream through Kafka (see Day 101C) rather than land directly here,
-- but for this local lab we write pings straight to Postgres to keep the demo runnable.
CREATE TABLE gps_pings (
    ping_id       BIGSERIAL PRIMARY KEY,      -- BIGSERIAL (not SERIAL): GPS pings accumulate far faster than
                                               -- trips or drivers, so we use the 8-byte sequence to avoid
                                               -- ever overflowing the 4-byte INT range (~2.1 billion).
    driver_id     INT REFERENCES drivers(driver_id) ON DELETE CASCADE,
                                               -- ON DELETE CASCADE here (unlike trips' RESTRICT): if a driver
                                               -- record is purged, their raw location history should go with
                                               -- it -- pings have no independent business/financial value.
    latitude      DECIMAL(9,6) NOT NULL,      -- DECIMAL(9,6): 6 decimal places gives ~11cm precision, which is
                                               -- more than enough for ride-matching and far more auditable
                                               -- than a FLOAT for anything we might need to recompute exactly.
    longitude     DECIMAL(9,6) NOT NULL,
    recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
                                               -- TIMESTAMPTZ (not TIMESTAMP): stores in UTC and converts on
                                               -- read, which matters because UrbanHop operates across NY, SF,
                                               -- and London time zones.
);
```

### Exercise 2: The Naive Load (Python + Faker)

**Goal**: Generate a deterministic 100,000-row seed file for `drivers`, understand why this approach is the *naive baseline*, and reconcile the "1M rows" outcome language with a single, measurable 100k-row target.

```python
# Dialect/runtime: Python 3.10+, faker>=20.0
# What: generate 100,000 INSERT statements for the drivers table into seed_drivers.sql
# Why: we need real volume to observe Seq Scan vs Index Scan behavior in Exercise 4.
# This is the row-at-a-time NAIVE baseline -- see "Why row-at-a-time SQL is the naive
# baseline" below for why this is NOT how you'd seed a production-scale (1M+) dataset.

from faker import Faker
import random

fake = Faker()
Faker.seed(42)     # Deterministic: re-running this script produces the exact same names/cities,
random.seed(42)    # so your EXPLAIN ANALYZE results are reproducible and comparable across runs.

CITIES = ["NY", "SF", "London"]
ROW_COUNT = 100_000   # The measurable target for THIS lesson. Do not change this to 1_000_000
                       # without first reading "Why row-at-a-time SQL is the naive baseline" below --
                       # at 1M rows, this script's row-at-a-time INSERTs can take 20+ minutes.

with open("seed_drivers.sql", "w") as f:
    for _ in range(ROW_COUNT):
        name = fake.name().replace("'", "''")   # Escaping: a single quote inside a SQL string literal
                                                  # must be doubled ('') or it breaks the statement --
                                                  # e.g., the name "O'Brien" becomes 'O''Brien' in the
                                                  # generated SQL. This is naive escaping for a controlled
                                                  # local lab; never build SQL strings like this against
                                                  # untrusted user input in a real application -- use
                                                  # parameterized queries (psycopg2's cursor.execute with
                                                  # placeholders) to prevent SQL injection.
        city = random.choice(CITIES)
        rating = round(random.uniform(3.5, 5.0), 2)
        f.write(
            f"INSERT INTO drivers (name, current_city, rating) "
            f"VALUES ('{name}', '{city}', {rating});\n"
        )

print(f"Wrote {ROW_COUNT} INSERT statements to seed_drivers.sql")
```

Load it with: `psql -d urbanhop -f seed_drivers.sql`

**Why row-at-a-time SQL generation is the naive baseline**: this script writes one `INSERT` statement per row, and `psql -f` executes them largely sequentially, each as its own implicit transaction (unless wrapped). At 100k rows this completes in a reasonable time on most laptops (commonly under a minute), but it does **not** scale linearly-friendly to production volumes — every statement pays the overhead of parsing, planning, and a transaction commit. The Coverage section below introduces two faster alternatives: wrapping all inserts in one explicit transaction, and Postgres's `COPY` command, which can load the same 100,000 rows roughly an order of magnitude faster because it bypasses per-row SQL parsing entirely.

With three cities chosen by `random.choice` (uniform probability), expect roughly **33,000 rows per city** at 100k total — not an exact split, because `random.choice` doesn't guarantee even distribution, just a roughly even one over a large sample. (If an earlier version of this lesson claimed "30k London rows," that number was an approximation that didn't match an even three-way split at 100k rows — treat your own seeded output as the source of truth, and verify with `SELECT current_city, COUNT(*) FROM drivers GROUP BY current_city;`.)

### Exercise 3: Seeding Riders and GPS Pings

**Goal**: Extend seeding to the two tables that close the Day 93 carry-forward gap.

```python
# Dialect/runtime: Python 3.10+, faker>=20.0
# Continues from Exercise 2 -- assumes drivers are already loaded with driver_id 1..100000.

from faker import Faker
import random
from datetime import datetime, timedelta

fake = Faker()
Faker.seed(43)
random.seed(43)

CITIES = ["NY", "SF", "London"]
RIDER_COUNT = 100_000
PING_COUNT = 500_000   # GPS pings accumulate faster than any other table -- 5 pings per driver
                        # on average over the seeding window, reflecting real ping frequency.

with open("seed_riders.sql", "w") as f:
    for _ in range(RIDER_COUNT):
        name = fake.name().replace("'", "''")
        city = random.choice(CITIES)
        f.write(
            f"INSERT INTO riders (name, home_city) VALUES ('{name}', '{city}');\n"
        )

with open("seed_gps_pings.sql", "w") as f:
    base_time = datetime(2026, 1, 1)
    for _ in range(PING_COUNT):
        driver_id = random.randint(1, 100_000)
        lat = round(random.uniform(40.5, 40.9), 6)    # roughly NY's latitude band for this demo
        lon = round(random.uniform(-74.2, -73.7), 6)
        ts = base_time + timedelta(seconds=random.randint(0, 30 * 24 * 3600))
        f.write(
            f"INSERT INTO gps_pings (driver_id, latitude, longitude, recorded_at) "
            f"VALUES ({driver_id}, {lat}, {lon}, '{ts.isoformat()}');\n"
        )

print(f"Wrote {RIDER_COUNT} rider rows and {PING_COUNT} GPS ping rows.")
```

**Expected verification queries** (run after loading both files):

```sql
SELECT COUNT(*) FROM riders;       -- expect 100000
SELECT COUNT(*) FROM gps_pings;    -- expect 500000
SELECT MIN(recorded_at), MAX(recorded_at) FROM gps_pings;  -- expect a ~30-day window starting 2026-01-01
```

### Exercise 4: The Optimize

**Goal**: Fix a slow query using `EXPLAIN ANALYZE`, and learn to distinguish the planner's **cost** units from **elapsed milliseconds** — these are two different numbers that are easy to conflate.

**Query**: `SELECT * FROM drivers WHERE current_city = 'London';`

**Step 1 — before any index**, run:

```sql
EXPLAIN ANALYZE SELECT * FROM drivers WHERE current_city = 'London';
```

Expected plan shape (your exact numbers will vary slightly by hardware, but the *shape* will match):

```
Seq Scan on drivers  (cost=0.00..2334.00 rows=33300 width=44) (actual time=0.020..18.412 rows=33352 loops=1)
  Filter: (current_city = 'London'::text)
  Rows Removed by Filter: 66648
Planning Time: 0.112 ms
Execution Time: 19.847 ms
```

**Reading this line by line**:
- `cost=0.00..2334.00` — the planner's *estimated* relative cost, in **arbitrary planner-cost units**, not milliseconds. `0.00` is the estimated startup cost; `2334.00` is the estimated total cost to return all rows. These units are only meaningful for *comparing two plans against each other* on the same system — never compare a "cost" number to a millisecond number, and never compare cost numbers across different machines/Postgres versions.
- `(actual time=0.020..18.412 rows=33352 loops=1)` — this is the *actually measured* wall-clock time in milliseconds, because you ran `ANALYZE` (not just `EXPLAIN`), which executes the query for real and times it. `rows=33352` is the real row count returned — close to our estimated ~33,300, confirming the planner's statistics are reasonably fresh.
- `Execution Time: 19.847 ms` — the real total time, the number you should actually report when comparing before/after performance, not the `cost` figure.

**Step 2 — add the index**:

```sql
CREATE INDEX idx_drivers_city ON drivers(current_city);
ANALYZE drivers;  -- refreshes planner statistics so it knows the new index exists and is useful
```

**Step 3 — re-run** `EXPLAIN ANALYZE` on the same query. Expected plan shape:

```
Bitmap Heap Scan on drivers  (cost=423.50..1850.20 rows=33300 width=44) (actual time=2.103..6.912 rows=33352 loops=1)
  Recheck Cond: (current_city = 'London'::text)
  ->  Bitmap Index Scan on idx_drivers_city  (cost=0.00..415.25 rows=33300 width=0) (actual time=1.450..1.450 rows=33352 loops=1)
Planning Time: 0.205 ms
Execution Time: 7.940 ms
```

Note this returns a **Bitmap Heap Scan**, not a plain `Index Scan` — Postgres chooses a bitmap scan when a large *fraction* of the table matches the filter (here, ~33% of rows are 'London'), because for low-selectivity queries like this, a bitmap scan (which gathers matching row locations, sorts them, then fetches in physical order) is cheaper than jumping around the table row-by-row in index order. A true `Index Scan` is more likely for highly selective filters (e.g., a unique `email` lookup matching one row). Both are categorically faster than the `Seq Scan` here: elapsed time dropped from ~19.8ms to ~7.9ms — roughly **2.5x faster** on this 100k-row table, even though the city filter isn't highly selective. (Don't expect a 100x speedup on a 33%-selectivity filter — that scale of improvement is realistic for queries matching a much smaller fraction of rows.)

### Exercise 5: Migration Safety — Mastery Check Correction

**Mastery-check question**: Is `DROP COLUMN` (not `DROP COLUMM` — that was a typo in an earlier version of this lesson, now corrected) safe to run directly in production?

**Answer**: Generally no — not without the expand/contract pattern. Dropping a column that any running application code still references (even via `SELECT *`) breaks that application the instant the `ALTER TABLE ... DROP COLUMN` commits. The safe sequence is: (1) stop all application code from reading/writing the column, (2) deploy and verify that change, (3) wait a safety period, (4) only then drop the column.

---

## Coverage: Beyond the Naive Baseline

The exercises above get UrbanHop's schema running, but a production implementation needs more:

* **Transactions**: Wrap related writes (e.g., creating a trip *and* decrementing a ride-credit balance) in a single `BEGIN ... COMMIT` block so they succeed or fail together. Without this, a crash between the two statements leaves inconsistent data.
* **Batch inserts / `COPY`**: Instead of 100,000 individual `INSERT` statements, Postgres's `COPY drivers FROM 'drivers.csv' WITH (FORMAT csv)` loads the same data by streaming it directly into the table, skipping per-statement SQL parsing overhead — commonly 5-10x faster for bulk loads of this size. For pure SQL-script loading without a CSV, wrapping all inserts in one `BEGIN; ... COMMIT;` block (instead of one implicit transaction per statement) is a smaller but still meaningful speedup.
* **Query-plan interpretation**: Read plans bottom-up — the innermost (most indented) node executes first. Compare each node's *estimated* `rows=` to its *actual* `rows=`; a large mismatch signals stale statistics (fix with `ANALYZE`) or a planner misestimate.
* **Index selectivity**: An index is most valuable when the filtered column is *highly selective* — i.e., the condition matches a small fraction of rows. Our `current_city` example (33% selectivity) still benefited, but less dramatically than a unique-value lookup would.
* **Migrations / rollback**: Use a migration tool (Alembic, Flyway, or hand-rolled numbered SQL files) so every schema change is scripted, versioned, and reversible — never hand-edit a production schema interactively.
* **Backups**: At minimum, daily `pg_dump` snapshots plus continuous WAL archiving for point-in-time recovery (see Day 96 for WAL mechanics).
* **Monitoring**: Track query latency percentiles (p50/p95/p99), connection counts, and table/index bloat over time — a query that's fast today can degrade silently as the table grows.
* **Load-testing methodology**: Don't just run one query once. Use a tool like `pgbench` or a small custom script to run the "find nearest driver" and "loyalty check" queries concurrently at a realistic request rate, and confirm the p95 latency still meets the SLA from Day 93 under that concurrent load — a single-threaded benchmark hides lock contention and connection-pool exhaustion that only show up under concurrency.

---

### Non-Functional Constraints (Apply to All Exercises)

* **Performance / Scale**: Document a target query runtime of **p95 < 5s** for your final solution, validate behavior at **40 concurrent analytical users/sessions**, and keep compute spend below **$8** per production-equivalent run.
* **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
* **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  * KPI focus for this day: *Capstone implementation should deliver stakeholder-ready KPI dashboards with <15 minute latency and predictable monthly infra spend.*

### Architecture Decision Log (Capstone Requirement)

For your final capstone submission, include an **Architecture Decision Log** that captures:

1. **Decision and Context**: The architecture/schema/query decision, business context, and constraints.
2. **Tradeoffs**: What you gain and what you accept (performance, flexibility, governance, operational complexity).
3. **Rejected Alternatives**: At least two alternatives considered, with concise reasons they were rejected.
4. **Expected Operational Impact**: Predicted impact on reliability, on-call burden, incident recovery time, and ongoing cost.

---

## Glossary

| Term | Definition |
| :--- | :--- |
| **Constraint** | A rule enforced by the database itself (e.g., `NOT NULL`, `CHECK`, `FOREIGN KEY`) that rejects invalid data at write time, rather than relying on application code to catch it. |
| **DDL (Data Definition Language)** | The subset of SQL that defines schema structure: `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, `CREATE INDEX`. |
| **ETL** | Extract, Transform, Load — the general pattern of pulling data from a source, reshaping it, and loading it into a destination system. Our seed scripts are a simplified "generate and load" variant. |
| **Seed data** | Synthetic or sample data generated specifically to populate a database for testing, demos, or performance benchmarking — not real production data. |
| **Selectivity** | The fraction of rows in a table that match a given filter condition. Low selectivity (a small fraction matches) favors index scans; high selectivity (a large fraction matches, as in our 33% London example) often favors bitmap or sequential scans instead. |
| **Bitmap scan** | A scan strategy where Postgres first builds an in-memory bitmap of matching row locations from an index, then fetches those rows in efficient physical order — a middle ground between a pure index scan and a sequential scan, well-suited to moderate selectivity. |
| **Migration** | A versioned, scripted change to a database schema, designed to be applied (and ideally reversed) consistently across environments. |
| **Expand/contract** | A zero-downtime schema-change pattern: add the new structure, dual-write to old and new, backfill, switch reads to the new structure, then remove the old structure — instead of changing the schema in one risky step. |

---

## Mastery Check

### Question 1: Foreign Keys

What happens if you try to `INSERT` a trip with `driver_id = 999` but Driver 999 does not exist?

A) It works fine.
B) The Database throws an Error (Foreign Key Constraint Violation).
C) It creates Driver 999 automatically.
D) It crashes.

<details>
<summary>Click for Answer</summary>

**Answer: B**
The `REFERENCES drivers(driver_id)` foreign key constraint rejects the insert, because it would create an orphaned reference to a nonexistent driver.
</details>

### Question 2: Explain Analyze

What does `EXPLAIN ANALYZE` do?

A) Runs the query and tells you how it executed (Plan + Actual Time).
B) Only predicts the plan.
C) Optimizes the query automatically.
D) Deletes the table.

<details>
<summary>Click for Answer</summary>

**Answer: A**
`EXPLAIN` alone only shows the *estimated* plan. `EXPLAIN ANALYZE` actually executes the query and reports both the planner's estimated cost units and the real measured elapsed time — two different numbers that must not be confused.
</details>

### Question 3: Indexing

Which column is a good candidate for an Index?

A) `gender` (Only 'M' or 'F'). (Low Cardinality).
B) `email` (Unique per user). (High Cardinality + Frequent Search).
C) `description` (Long text blob).
D) A column never used in WHERE.

<details>
<summary>Click for Answer</summary>

**Answer: B**
High-cardinality columns (many distinct values, like a unique email) used in `WHERE` clauses give B-tree indexes the most leverage, since a lookup narrows down to very few matching rows.
</details>

### Question 4: Default Values

What does `DEFAULT CURRENT_DATE` do?

A) Automatically fills the date if you don't provide one.
B) Forces you to provide a date.
C) Updates the date every time you read the row.
D) Nothing.

<details>
<summary>Click for Answer</summary>

**Answer: A**
If the `INSERT` statement omits that column, Postgres fills it in with today's date at insert time — useful for `created_at`/`signup_date` style columns.
</details>

### Question 5: Migration Safety

Is `DROP COLUMN` safe to run directly against a production table?

A) Yes, always.
B) No — it might break applications that rely on `SELECT *` or reference that column directly, unless you've already migrated all readers/writers off it.
C) Only on weekends.
D) If you say "Please".

<details>
<summary>Click for Answer</summary>

**Answer: B**
Always deprecate first (stop all code from reading/writing the column), confirm nothing references it, then drop it later — the expand/contract pattern in reverse.
</details>

### Question 6: Cost vs. Time

In an `EXPLAIN ANALYZE` plan node showing `(cost=0.00..2334.00 rows=33300 width=44) (actual time=0.020..18.412 ...)`, which number represents real elapsed milliseconds?

A) `2334.00`, the total cost figure.
B) `18.412`, the actual time figure.
C) `33300`, the estimated row count.
D) Both numbers represent milliseconds equally.

<details>
<summary>Click for Answer</summary>

**Answer: B**
`cost` is an arbitrary planner-cost unit, only meaningful for comparing plans to each other on the same system. `actual time` (only present when you use `ANALYZE`, which really executes the query) is measured in real milliseconds — that's the number to use when reporting before/after performance improvements.
</details>

### Question 7: Selectivity and Scan Choice

Our `current_city = 'London'` query matches roughly 33% of the `drivers` table. After adding an index, Postgres chose a Bitmap Heap Scan rather than a plain Index Scan. Why?

A) Bitmap scans are always chosen regardless of selectivity.
B) For a filter that matches a large fraction of rows, gathering matching row locations into a bitmap and fetching them in physical order is typically cheaper than random per-row index lookups.
C) The index was built incorrectly.
D) Bitmap scans only work on numeric columns.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Postgres's planner picks among scan strategies based on estimated selectivity. Low-to-moderate selectivity favors bitmap scans (batch the matching locations, then read in physical order); very high selectivity (a handful of rows) favors a plain index scan; very low selectivity (most of the table matches) often favors abandoning the index altogether for a sequential scan.
</details>

### Question 8: Why Riders and GPS Pings Matter

Why does this lesson require implementing `riders` and `gps_pings`, not just `drivers` and `trips`?

A) Because more tables always make a schema better.
B) Because Day 93's design explicitly called for riders, GPS/location data, and historical archival, and a capstone that implements only two of those entities doesn't fulfill its own design doc.
C) Because Postgres requires a minimum of four tables per database.
D) Because `gps_pings` replaces the need for the `trips` table.

<details>
<summary>Click for Answer</summary>

**Answer: B**
The carry-forward contract from Day 93 specifically requires riders and a GPS/location table to be implemented here — an implementation that quietly drops entities from its own design doc isn't actually validating the design, just a simplified subset of it.
</details>

---

## Summary

Today you learned:

* ✅ **DDL Constraints**: Build quality into the schema with `PRIMARY KEY`, `FOREIGN KEY`, `CHECK`, and `NOT NULL` — and chose `ON DELETE RESTRICT` vs. `CASCADE` deliberately per relationship.
* ✅ **Seeding at a measurable scale**: Generated a deterministic 100,000-row local demo dataset across `drivers`, `riders`, and `gps_pings`, with a clearly separated "1M rows" stretch goal.
* ✅ **Indexing**: Used `EXPLAIN ANALYZE` to distinguish planner cost units from real elapsed time, and measured a concrete ~2.5x speedup from adding a B-tree index.
* ✅ **Migration Safety**: Corrected and explained why `DROP COLUMN` requires a deprecation window, not a direct drop.
* ✅ **UrbanHop, fully implemented**: `drivers`, `riders`, `trips`, and `gps_pings` now exist as a runnable four-table schema, closing the Day 93 carry-forward gap.

**Tomorrow**: We review your career strategy in **Day 95: Technical Interview Workshop**.
