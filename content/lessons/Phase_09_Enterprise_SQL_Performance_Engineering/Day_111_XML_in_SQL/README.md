---
day: 111
title: "XML & Complex Data Types"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "xml-complex-types"
duration: 120
difficulty: "advanced"
tags:
  - xml
  - arrays
  - enums
  - composites
concepts:
  - "Querying XML (xpath)"
  - "Arrays in SQL (Slicing, Unnesting)"
  - "ENUM Types (Static Dropdowns)"
  - "Composite Types (Structs)"
prerequisites:
  - "Basic Data Types"
outcomes:
  - "Extract data from a legacy XML column"
  - "Store a list of tags in a single column (Array)"
  - "Enforce state transitions with ENUMs"
---

# 🎯 Day 106: XML & Complex Data Types

> *"The past is XML. The present is JSON. The future is... probably still a CSV file someone emailed you."*

---

## The "Never-Coded" Bridge

**The Toolbox**

* **Standard SQL (Hammer)**: Integers, Text, Dates. (Simple, effective).
* **The Weird Stuff (Specialty Tools)**:
  * **XML**: The rusty wrench. Old, verbose, but sometimes you find a pipe that only it can turn.
  * **Arrays**: The socket set. Holds multiple items of the same size in one box.
  * **ENUMs**: The shape sorter. Only "Square", "Circle", or "Triangle" fit. Try to put a "Star" in? Rejected.

---

## The Technical Deep Dive

### 1. XML in SQL

Legacy systems (SOAP, Enterprise Java) love XML.

* **Type**: `XML`. Validates the syntax.
* **Query**: `xpath('/book/title/text()', data)`.
* **Performance**: Slower than JSONB. No binary storage format in standard Postgres.

### 2. Arrays

Postgres allows columns to be arrays.

* **Def**: `tags text[]`.
* **Insert**: `VALUES (ARRAY['sql', 'db'])`.
* **Query**: `WHERE 'sql' = ANY(tags)`.
* **Unnest**: `SELECT unnest(tags) FROM table`. Expands 1 row into N rows.

### 3. ENUMs (Enumerated Types)

Restricts a column to a fixed list.

* **Create**: `CREATE TYPE status AS ENUM ('open', 'closed', 'pending');`
* **Benefit**: Data Integrity. Uses 4 bytes (int) internally, saves space vs Text.
* **Downside**: Adding a new value requires `ALTER TYPE`.

### 4. Composite Types (Structs)

A Composite Type lets a single column hold a *structured group of fields*, like a lightweight struct, rather than just one scalar value.

* **Create**: `CREATE TYPE address AS (street text, city text, zip text);`
* **Use in a table**: `CREATE TABLE customers (id serial, home_addr address);`
* **Insert**: `INSERT INTO customers(home_addr) VALUES (ROW('123 Main St', 'New York', '10001'));`
* **Field access**: `SELECT (home_addr).city FROM customers;` — note the parentheses around the column name; without them Postgres parses `home_addr.city` as a table-qualified column reference and throws an error.
* **Composite Type vs JSONB**: use a Composite Type when the structure is fixed, known at design time, and you want strong typing on each field (e.g., `zip` could be constrained separately). Use JSONB when the structure is variable, sparse, or evolves per-row without a migration.

---

## Senior-Level Insights

### XML: The Legacy Burden

* **Reality**: You will eventually inherit a DB with a `config_xml` column.
* **Strategy**: Don't convert it to JSON unless you have to. Postgres treats XML as a first-class citizen. Index it with Functional Indexes if needed.

---

## Glossary

| Term | Definition |
|---|---|
| **XML (in SQL)** | A native Postgres type that stores well-formed XML and validates syntax on insert; queried via `xpath()`. |
| **xpath** | A function that evaluates an XPath expression against an XML value and returns an `xml[]` array of matching nodes. |
| **unnest** | A set-returning function that expands an array into one row per element — the inverse of `array_agg`. |
| **array_agg** | An aggregate function that collapses multiple rows into a single array value. |
| **ENUM Type** | A user-defined type restricting a column to a fixed, ordered list of string labels, stored internally as a 4-byte integer. |
| **Composite Type** | A user-defined struct-like type combining multiple named fields into one column value, created with `CREATE TYPE ... AS (...)`. |
| **hstore** | A Postgres extension type storing simple flat key-value text pairs in a single column — a precursor to JSONB for unstructured data. |
| **Range Type** | A type representing a contiguous range of values (e.g., `daterange`, `int4range`, `tsrange`) with built-in overlap (`&&`) and containment (`@>`) operators. |
| **tsvector** | A Postgres full-text-search type storing a normalized, sorted list of lexemes (word stems) for fast text search. |
| **tsquery** | A Postgres full-text-search type representing a parsed search query, matched against a `tsvector` with the `@@` operator. |
| **GIN (for text search)** | A Generalized Inverted Index used to make `tsvector @@ tsquery` and array/JSONB containment lookups fast. |

---

## Hands-on Lab

### Exercise 1: The XML Extraction

**Goal**: Parse legacy data.

> 📦 **Preamble**: The `xpath()` function returns an `xml[]` array — *even for a single result*. Access the first element with `[1]` and cast to text with `::text`. This surprises most learners expecting a plain string back.

1. `CREATE TABLE library (id serial, doc xml)`.
2. `INSERT INTO library(doc) VALUES ('<book><title>SQL 101</title></book>')`.
3. Query: `SELECT xpath('//title/text()', doc) FROM library`.
4. **Expected result**: `{SQL 101}` — this is Postgres's text rendering of a one-element `xml[]` array, *not* a plain string.
5. To get a clean string, cast: `SELECT xpath('//title/text()', doc)[1]::text FROM library;`
6. **Expected result**: `SQL 101`.

### Exercise 2: Array Math

**Goal**: Manage vectors.

1. `CREATE TABLE vectors (id serial, coords int[])`.
2. `INSERT INTO vectors(coords) VALUES (ARRAY[1, 2, 3]), (ARRAY[4, 5, 6])`.
3. **Task**: Find vectors where the 2nd coordinate is 5.
    * `SELECT * FROM vectors WHERE coords[2] = 5`.
4. **Expected result**:

    | id | coords |
    |---|---|
    | 2 | {4,5,6} |

### Exercise 3: The ENUM Trap

**Goal**: Understand rigidity.

1. `CREATE TYPE mood AS ENUM ('happy', 'sad')`.
2. `CREATE TABLE person (current_mood mood)`.
3. `INSERT INTO person VALUES ('happy')`.
4. **Fail**: `INSERT INTO person VALUES ('angry')`. (Error: invalid input value for enum mood: "angry").
5. **Fix**: `ALTER TYPE mood ADD VALUE 'angry'`.
6. **Expected result**: `INSERT INTO person VALUES ('angry')` now succeeds; `SELECT * FROM person` returns both rows: `happy` and `angry`.

### Exercise 4: Composite Types (Structs)

**Goal**: Store a structured address as a single typed column instead of three loose text columns or a JSONB blob.

1. `CREATE TYPE address AS (street text, city text, zip text);`
2. `CREATE TABLE customers (id serial, home_addr address);`
3. `INSERT INTO customers(home_addr) VALUES (ROW('123 Main St', 'New York', '10001'));`
4. Query: `SELECT (home_addr).city FROM customers;`
5. **Expected result**:

    | city |
    |---|
    | New York |

> ⚠️ **Pitfall: Arrays Break Referential Integrity**
> Storing `order_ids int[]` in a Users table means you can reference order ID 999 that doesn't exist — Postgres provides **no FK constraint on array elements**. The array is just a blob of integers from the database's point of view; it has no idea those integers are supposed to point at rows in another table.
> **Detection**: Run `SELECT unnest(order_ids) FROM users EXCEPT SELECT id FROM orders;` — any rows returned are dangling references.
> **Fix**: Use a junction table (`user_orders(user_id, order_id)` with a real FK) for anything that must stay referentially valid. Reserve arrays for loosely-coupled data like free-form tags, where a missing master-list match is harmless.

### Exercise 5 (Optional): Range Types for Scheduling

**Goal**: Model a booking window without two separate `start`/`end` columns.

1. `CREATE TABLE bookings (id serial, room text, slot tsrange);`
2. `INSERT INTO bookings(room, slot) VALUES ('Room A', '[2026-06-20 09:00, 2026-06-20 10:00)');`
3. **Task**: Check whether a new booking overlaps an existing one using `&&` (overlap):
    * `SELECT * FROM bookings WHERE room = 'Room A' AND slot && '[2026-06-20 09:30, 2026-06-20 10:30)'::tsrange;`
4. **Expected result**: the Room A row is returned (since 09:30–10:30 overlaps the existing 09:00–10:00 booking) — this is exactly the check a conference-room or hotel booking system runs before confirming a reservation.

---

## Mastery Check

### Question 1: Arrays

How do you turn an Array `['a', 'b']` into two rows?
A) `unnest()`.
B) `expand()`.
C) `split()`.
D) `explode()`.

<details>
<summary>Click for Answer</summary>

**Answer: A**
`unnest(col)` is the reverse of `array_agg(col)`.
</details>

### Question 2: ENUMs

Why use an ENUM instead of a Foreign Key to a 'Statuses' table?
A) Performance (No Join needed) and Space (4 bytes vs Text).
B) It is more flexible.
C) It allows any text.
D) It supports NULLs better.

<details>
<summary>Click for Answer</summary>

**Answer: A**
It's a micro-optimization for static lists (e.g., Days of Week).
</details>

### Question 3: XML

Can you index XML content?
A) Yes, using Functional Indexes (e.g., index the result of `xpath`).
B) No.
C) Yes, using GIN (like JSON).
D) Only in Oracle.

<details>
<summary>Click for Answer</summary>

**Answer: A**
`CREATE INDEX idx_title ON lib ((xpath('//title/text()', doc)::text))`.
</details>

### Question 4: Array Constraints

Can I enforce a Foreign Key on individual elements of an array column?
A) Yes.
B) No.
C) Only in Postgres 16.
D) Triggers only.

<details>
<summary>Click for Answer</summary>

**Answer: B**
This is the main argument against using Arrays for relationships.
</details>

### Question 5: Composite Types

What is a Composite Type?
A) A column that holds a Struct (e.g., `(x, y)` coordinates).
B) A Primary Key.
C) A Join.
D) A JSON.

<details>
<summary>Click for Answer</summary>

**Answer: A**
`CREATE TYPE point AS (x int, y int)`. Useful for standardized data structures.
</details>

---

## Summary

Today you learned:

* ✅ **XML**: Not dead yet. Handled via `xpath`.
* ✅ **Arrays**: Lists in a cell. Good for Tags, bad for Relationships.
* ✅ **ENUMs**: Strict, static, efficient categorization.
* ✅ **Unnest**: Exploding arrays into rows.
* ✅ **Composite Types**: Structs for fixed, strongly-typed groups of fields.
* ✅ **Range Types**: Native overlap/containment checks for scheduling and booking logic.

**Tomorrow**: We lock down the fortress with **Enterprise Security**. (Composite Types and Arrays from today will reappear when we model role/permission structures — see Day 112.)

---

## 🚨 Escalating Incident Drill Track: Legacy XML Integration (Day 111)

Use these three drills as a connected simulation sequence specific to today's legacy-data theme. Each drill is intentionally harder than the previous one and must be completed with production-style evidence.

### Drill 1 (Severity 3): Slow queries against a legacy SOAP integration table

**Scenario**: A nightly batch job ingests 10MB XML documents from a legacy SOAP partner integration into a single `xml` column. Reporting queries that filter on an embedded order-status field are now taking 8+ seconds each.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Run `EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM legacy_orders WHERE (xpath('//status/text()', doc))[1]::text = 'SHIPPED';` and confirm it is a full `Seq Scan` re-parsing every XML document on every query.
   * Quantify the cost: document size × row count × XML parse overhead per row.
2. **Mitigation patch strategy and rollback criteria**
   * Propose a functional index on the xpath expression: `CREATE INDEX idx_order_status ON legacy_orders ((xpath('//status/text()', doc)::text));`
   * Define rollback criteria: if index creation (`CONCURRENTLY`) stalls write throughput beyond an agreed threshold, drop and retry off-peak.
3. **Post-incident report**
   * Propose a JSON migration path: extract the handful of frequently-queried fields into real JSONB or relational columns, keeping the raw XML only as an audit/compliance archive.

### Drill 2 (Severity 2): ENUM rigidity blocks an urgent business change

**Scenario**: Sales needs a new order status, `"backordered"`, added today to support a new vendor relationship, but the `order_status` column is an ENUM and the migration is queued behind a long-running transaction.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Inspect `pg_type` / `pg_enum` to confirm the current allowed labels and identify the blocking transaction via `pg_stat_activity`.
   * Explain why `ALTER TYPE ... ADD VALUE` requires a brief lock and cannot run inside the existing long transaction in older Postgres versions.
2. **Mitigation patch strategy and rollback criteria**
   * Provide the safe sequence: confirm no open transaction holds the type, run `ALTER TYPE order_status ADD VALUE 'backordered';`, verify with a test insert.
   * Rollback criteria: if the ALTER TYPE blocks beyond a defined wait window, kill the blocking session only after sign-off (ENUM additions cannot be transactionally rolled back once committed).
3. **Post-incident report**
   * Recommend a longer-term fix: if status values change frequently, model `order_status` as a foreign key to a lookup table instead of an ENUM, trading a small join cost for migration-free flexibility.

### Drill 3 (Severity 1 / Executive Escalation): Array-based order references corrupt a financial report

**Scenario**: A junior engineer's `users.recent_order_ids int[]` column (added to "avoid a join") now contains IDs for orders that were deleted during a data-retention cleanup. The monthly revenue-by-customer report silently undercounts because it joins against `unnest(recent_order_ids)` and gets no match for the deleted rows.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Run `SELECT u.id, unnest(u.recent_order_ids) AS oid FROM users u EXCEPT SELECT u.id, o.id FROM users u JOIN orders o ON o.id = ANY(u.recent_order_ids);` to enumerate dangling array references.
   * Confirm there is no FK constraint on array elements (the root architectural cause) — this is the Pitfall called out above.
2. **Mitigation patch strategy and rollback criteria**
   * Migrate `recent_order_ids` to a proper `user_orders(user_id, order_id)` junction table with a real `FOREIGN KEY ... ON DELETE CASCADE`, backfilling from the array data before dropping the column.
   * Rollback criteria: keep the old array column read-only (not dropped) until the new junction table's row counts reconcile exactly with the report for two consecutive month-end closes.
3. **Post-incident report**
   * Quantify the financial impact (revenue undercount $ and affected customer count) and document the architectural rule going forward: arrays are for loosely-coupled, optional data (tags); anything requiring guaranteed referential integrity gets a junction table.
