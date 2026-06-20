---
day: 110
title: "JSON & NoSQL in SQL"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "json-nosql"
duration: 120
difficulty: "advanced"
tags:
  - jsonb
  - nosql
  - gin-index
  - document-store
concepts:
  - "JSONB vs JSON (Binary vs Text)"
  - "Querying JSON (->, ->>, @>)"
  - "Indexing JSON (GIN)"
  - "Hybrid Multi-Model Databases"
prerequisites:
  - "Basic SELECT"
outcomes:
  - "Store and Query a User Profile Document"
  - "Index a nested JSON field for millisecond lookups"
  - "Update a specific key inside a JSON blob"
---

# 🎯 Day 110: JSON & NoSQL in SQL

> *"The flexibility of MongoDB. The reliability of Postgres. Why choose one?"*

---

## The "Never-Coded" Bridge

**The Form vs The Box**

* **Relational (The Form)**:
  * Name: [___]
  * Age: [___]
  * *Rule*: You strictly fill in the boxes. If you have a "Middle Name" and the form doesn't ask for it, you can't add it.
* **NoSQL/JSON (The Box)**:
  * Here is a cardboard box. Put whatever you want inside.
  * Person A puts in a photo.
  * Person B puts in a sandwich.
  * *Flexibility*: Infinite.
  * *Chaos*: Also infinite. (How do you "Sort by Sandwich"?)

---

## The Technical Deep Dive

### 1. JSONB vs JSON

Postgres has two types:

* **JSON**: Stores the exact text you type (including whitespace). Slow to query (must re-parse every time).
* **JSONB (Binary)**: Decomposes the JSON into a binary tree.
  * Removes whitespace.
  * Sorts keys.
  * **Supports Indexing**.
  * *Verdict*: Always use `JSONB`.

### 2. Operators

* `->` : Get JSON object (Result is JSON).
* `->>` : Get Text (Result is Text).
* `@>` : Contains. (Does the document contain `{"role": "admin"}`?).
* `?` : Key existence. (Does the document have a top-level key called `discount`, regardless of its value?).

```sql
-- '?' is for OPTIONAL field checks -- common in schema-less designs
SELECT * FROM products WHERE info ? 'discount';
```

### 3. GIN Indexing (The Secret Weapon)

* **Problem**: Querying `WHERE data->>'email' = 'bob@x.com'` is slow (Seq Scan).
* **Solution**: `CREATE INDEX idx_data ON users USING GIN(data)`.
* **Result**: Postgres indexes *every key and value* in the document using an Inverted Index.

#### GIN Operator Classes: `jsonb_ops` vs `jsonb_path_ops`

A default `CREATE INDEX ... USING GIN(data)` picks the `jsonb_ops` operator class, but there is a second, more specialized option worth knowing before you read the Mastery Check below:

| Operator class | What it indexes | Operators supported | Relative size |
|---|---|---|---|
| `jsonb_ops` (default) | Every key **and** every value in the document | `?`, `?|`, `?&`, `@>` | Larger (more index entries) |
| `jsonb_path_ops` | Only the values, reachable via their full path | `@>` only | ~40% smaller |

```sql
-- Use jsonb_path_ops when you only ever do containment (@>) lookups
CREATE INDEX idx_products_path ON products USING GIN(info jsonb_path_ops);
```

**Rule of thumb**: if your queries are exclusively `@>` containment checks (e.g., `WHERE info @> '{"color": "red"}'`), prefer `jsonb_path_ops` for the smaller, faster index. If you also need key-existence checks (`?`, `?|`, `?&`), use the default `jsonb_ops`.

### 4. `jsonb_to_recordset`: Exploding Arrays Into Rows

Event payloads and API responses often arrive as a JSON array of objects. To report on them with normal SQL aggregates, explode the array into a relational result set:

```sql
SELECT *
FROM jsonb_to_recordset('[{"item":"TV","qty":2},{"item":"Radio","qty":1}]')
    AS x(item text, qty int);
```

| item | qty |
|---|---|
| TV | 2 |
| Radio | 1 |

This is the standard pattern for normalizing a single JSONB array column (e.g., `orders.line_items`) into one row per line item for reporting, without changing the underlying storage.

---

## Senior-Level Insights

### The "Schema Evolution" Hack

* **Scenario**: Analytics team wants to track 50 new events per week.
* **Relational**: `ALTER TABLE` 50 times a week. (Nightmare).
* **Hybrid**: `CREATE TABLE events (id serial, timestamp ts, payload jsonb)`.
  * Store key fields (Time, UserID) as Columns (Fast).
  * Store variable fields (Mouse X, Referrer) as JSONB (Flexible).

### Update Performance

> ⚠️ Pitfall: JSONB Write Amplification
>
> **Failure mode**: Postgres's MVCC storage model never modifies a row in place — every `UPDATE` writes an entirely new row version. For a JSONB column, that means changing *one key* in a document rewrites the *entire* document to disk, not just the changed bytes.
> **Quantified cost**: A 50 KB JSONB user-profile document updated 1,000 times/day writes roughly 50 MB of new row versions to the WAL *every single day* — purely from one column's churn. At 200 KB per document (the size a profile tends to grow to after a few feature launches), the same update frequency produces 200 MB/day, and the dead row versions also bloat the table until `autovacuum` reclaims them.
> **Detection**: rising `pg_stat_user_tables.n_dead_tup` on the table, growing WAL volume disproportionate to logical row count, or `pg_total_relation_size` increasing faster than expected between `VACUUM` runs.
> **Fix**: pull frequently-updated, individually-queried attributes (status flags, counters, timestamps) out into dedicated columns, and reserve JSONB for the genuinely variable, read-mostly portion of the document (preferences, config, historical snapshots).

* **Advice**: Don't use JSONB for frequently modified data. Use it for "Read-Mostly" documents (Config, Profiles).

---

## Hands-on Lab

### Exercise 1: The Document Store

**Goal**: Insert and Query.

**Seed data**:

```sql
CREATE TABLE products (id serial, info jsonb);
INSERT INTO products(info) VALUES
    ('{"name": "TV", "specs": {"res": "4K"}}'),
    ('{"name": "Radio", "specs": {"res": "N/A"}}');
```

**Query**:

```sql
SELECT info->>'name' AS name
FROM products
WHERE info->'specs'->>'res' = '4K';
```

**Expected result**:

| name |
|---|
| TV |

### Exercise 2: The Search (GIN)

**Goal**: Speed up a containment query with an index.

**Seed data** (10,000 rows with randomized color/price):

```sql
INSERT INTO products(info)
SELECT jsonb_build_object(
    'name', 'Item ' || i,
    'color', (ARRAY['red','blue','green'])[floor(random()*3+1)::int],
    'price', round((random()*1000)::numeric, 2)
)
FROM generate_series(1, 10000) i;
```

**Before the index**:

```sql
EXPLAIN ANALYZE SELECT * FROM products WHERE info @> '{"color": "red"}';
```

**Expected result (before)**:

```
Seq Scan on products  (cost=0.00..1234.50 rows=3333 width=72) (actual time=0.020..8.412 rows=3341 loops=1)
  Filter: (info @> '{"color": "red"}'::jsonb)
```

**Add the index**:

```sql
CREATE INDEX idx_products ON products USING GIN(info);
```

**After the index**:

```sql
EXPLAIN ANALYZE SELECT * FROM products WHERE info @> '{"color": "red"}';
```

**Expected result (after)**:

```
Bitmap Heap Scan on products  (cost=68.50..512.30 rows=3333 width=72) (actual time=0.412..1.103 rows=3341 loops=1)
  Recheck Cond: (info @> '{"color": "red"}'::jsonb)
  ->  Bitmap Index Scan on idx_products  (cost=0.00..67.67 rows=3333 width=0) (actual time=0.301..0.301 rows=3341 loops=1)
```

The plan node changes from a full-table `Seq Scan` to an `Bitmap Index Scan` feeding a `Bitmap Heap Scan` — roughly an 8x reduction in actual time on this dataset, growing far larger on real production tables.

### Exercise 3: The Update

**Goal**: Modify a single key in place.

> The second argument to `jsonb_set` is the path as a text array. For a top-level key, use `'{name}'`. For a nested key, chain the path: `'{specs,resolution}'`. The third argument must be a *valid JSON literal* — string values need their own inner quotes, hence `'"OLED TV"'` rather than `'OLED TV'`.

* **Task**: Change "TV" to "OLED TV" for product id 1.

```sql
UPDATE products SET info = jsonb_set(info, '{name}', '"OLED TV"') WHERE id = 1;
SELECT info->>'name' FROM products WHERE id = 1;
```

**Expected result**:

| name |
|---|
| OLED TV |

### Exercise 4: Key Existence and Exploding Arrays

**Goal**: Practice `?` and `jsonb_to_recordset`.

```sql
-- Add an optional 'discount' field to one product only
UPDATE products SET info = info || '{"discount": 0.15}'::jsonb WHERE id = 2;

-- Find products that have ANY discount field, regardless of its value
SELECT id, info->>'name' AS name FROM products WHERE info ? 'discount';
```

**Expected result**:

| id | name |
|---|---|
| 2 | Radio |

---

## Mastery Check

### Question 1: Data Type

Which data type should you use for JSON storage in Postgres?
A) `TEXT`.
B) `JSON`.
C) `JSONB`.
D) `BLOB`.

<details>
<summary>Click for Answer</summary>

**Answer: C**
`JSONB` stores the document in a parsed, decomposed binary tree rather than as raw text — it strips insignificant whitespace, de-duplicates and sorts object keys, and crucially exposes a structure that GIN indexes can operate on. Plain `JSON` preserves the exact text you inserted (including formatting and key order) but must be fully re-parsed on every single query, which is both slower and impossible to index for containment/key searches. `TEXT` and `BLOB` provide no JSON-aware operators (`->`, `->>`, `@>`) at all, so every query would require manual string parsing in application code.
</details>

### Question 2: Querying

What does the operator `->>` return?
A) A JSON Object.
B) A Text String.
C) A Number.
D) An Error.

<details>
<summary>Click for Answer</summary>

**Answer: B**
`->>` always returns the extracted value cast to `TEXT`, which makes it the operator you want whenever you need to *compare* a JSON field against a plain value: `WHERE col->>'status' = 'active'` works because both sides are text. The plain `->` operator, by contrast, returns a `JSON`/`JSONB` value (still wrapped, e.g. `"active"` with quotes) — useful for chaining further into nested objects (`info->'specs'->>'res'`), but not directly comparable to an unquoted string without an explicit cast.
</details>

### Question 3: Operator Class Choice

Which GIN operator class should you choose if your queries only ever use the `@>` containment operator, and why?

A) `jsonb_ops` — it is the only operator class that supports `@>`.
B) `jsonb_path_ops` — it only indexes values reachable by path (not every key), producing a smaller, faster index, but it supports `@>` only (not `?`, `?|`, `?&`).
C) Neither — GIN indexes cannot accelerate `@>` queries.
D) A B-Tree index on the full JSONB column.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Postgres offers two GIN operator classes for JSONB. The default, `jsonb_ops`, indexes every key *and* every value, which supports the widest operator set (`?`, `?|`, `?&`, `@>`) but produces a larger index. `jsonb_path_ops` indexes only the values, reachable via their full path through the document, which produces an index roughly 40% smaller and typically faster to scan — but it only supports `@>` containment queries, not key-existence checks. If your access pattern is purely "does this document contain these fields/values," `jsonb_path_ops` is the better default; if you also need `?`/`?|`/`?&`, stick with `jsonb_ops`.
</details>

### Question 4: Update Cost

What happens when you update a `JSONB` column?
A) Only the changed bytes are written.
B) The entire new column value is written to disk (Copy-on-Write).
C) Nothing happens.
D) It converts to XML.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Postgres's MVCC storage model never edits a row's bytes in place; every `UPDATE` produces an entirely new row version on disk, and the old version becomes a dead tuple awaiting `VACUUM`. For a JSONB column, this means changing one key inside a 50 KB document requires writing the *entire* 50 KB document fresh, not just the few changed bytes — this is the "Write Amplification" pitfall covered above. Document-native NoSQL engines like MongoDB use storage engines with partial in-place update support for nested fields, which is one of the genuine trade-offs of using Postgres as a document store: you get ACID transactions and SQL joins, but lose cheap partial updates.
</details>

### Question 5: Use Case

When should you use JSONB?
A) For Primary Keys.
B) For semi-structured data (e.g., User Config, Event Logs) that changes schema often.
C) For everything.
D) For huge binary files.

<details>
<summary>Click for Answer</summary>

**Answer: B**
JSONB earns its place when the schema genuinely varies row-to-row or evolves faster than your migration process can track — user preferences, event payloads, third-party API responses you don't control the shape of. It is the wrong choice for primary keys (no natural ordering guarantee, awkward to index for uniqueness), for "everything" (you lose the column-level constraints, foreign keys, and type safety relational columns give you for free), and for large binary files (`BYTEA` or external object storage is the correct tool there). The senior pattern is hybrid: stable, frequently-filtered fields as real columns; the genuinely variable remainder as JSONB.
</details>

---

## Glossary

| Term | Definition |
|---|---|
| **JSONB** | Postgres's binary, decomposed storage format for JSON — strips whitespace, sorts keys, and supports indexing. The recommended type for nearly all JSON storage in Postgres. |
| **JSON** | Postgres's text-preserving JSON type — keeps exact formatting and key order but must be re-parsed on every query and cannot be indexed for containment. |
| **Binary Storage** | The decomposed, parsed-tree representation JSONB uses internally, as opposed to storing raw text. |
| **`->` operator** | Extracts a value from a JSON/JSONB document by key or array index, returning it still wrapped as JSON/JSONB. |
| **`->>` operator** | Extracts a value by key or index and returns it as plain `TEXT`, suitable for direct string comparison. |
| **`@>` (containment)** | Tests whether the left JSONB document contains the structure/values of the right JSONB document — the core operator for "does this document match these criteria" queries. |
| **`?` (key existence)** | Tests whether a top-level key exists in the document, regardless of its value — useful for optional-field queries. |
| **GIN Index** | Generalized Inverted Index — the index type that supports efficient JSONB containment and key-existence queries by indexing decomposed keys/values. |
| **jsonb_path_ops** | A GIN operator class that indexes only values reachable by path; smaller and faster than the default, but supports `@>` only. |
| **jsonb_ops** | The default GIN operator class; indexes every key and value, supporting `?`, `?|`, `?&`, and `@>`. |
| **jsonb_set** | Function that returns a modified copy of a JSONB document with one path's value replaced — does not mutate in place. |
| **Write Amplification** | The phenomenon where updating one small field inside a large JSONB document forces Postgres to rewrite the entire document due to MVCC's copy-on-write row versioning. |
| **Semi-structured Data** | Data with a flexible, evolving schema (varies field-to-field or document-to-document) — the use case JSONB is designed for, as opposed to rigid relational columns. |

---

## Summary

Today you learned:

* ✅ **JSONB**: The superior storage format.
* ✅ **GIN**: Making JSON searchable, and choosing between `jsonb_ops` and `jsonb_path_ops`.
* ✅ **Operators**: Navigating the tree (`->`, `->>`, `@>`, `?`).
* ✅ **jsonb_to_recordset**: Exploding JSON arrays into relational rows.
* ✅ **Trade-off**: Flexibility vs Write Performance.

**Tomorrow**: We handle legacy data formats with **XML & Complex Data**.

---

## 🚨 Escalating Incident Drill Track (Day 110-specific)

A single connected drill sequence, tailored to JSONB write-amplification and indexing failure modes. Each stage is intentionally harder than the previous one and must be completed with production-style evidence.

### Drill 1 (Severity 2): Slow containment query on an un-indexed JSONB column

**Scenario**: A "filter by tag" feature on the product catalog has gone from instant to multi-second as the `products` table grew past 500,000 rows. Support is fielding complaints about a frozen search page.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Run `EXPLAIN (ANALYZE, BUFFERS)` on the offending query (`WHERE info @> '{"tags": ["sale"]}'`) and confirm it is a full `Seq Scan` over the entire table.
   * Confirm no GIN index exists on the `info` column via `\d products` or `pg_indexes`.
2. **Mitigation patch strategy and rollback criteria**
   * Patch: add `CREATE INDEX CONCURRENTLY idx_products_info ON products USING GIN(info jsonb_path_ops);` (CONCURRENTLY to avoid locking writes during index build on a live table), choosing `jsonb_path_ops` since the access pattern is containment-only.
   * Rollback criteria: if the index build fails or stalls (`pg_stat_progress_create_index`), drop the invalid index and retry during a lower-traffic window rather than leaving a half-built index in place.
3. **Post-incident report**
   * Summarize business impact (search abandonment rate during the slow period, support ticket volume).
   * Document prevention controls: any new JSONB column used in `WHERE` clauses must have a GIN index added in the same migration, enforced via schema-review checklist.

### Drill 2 (Severity 1): Write-amplification driven replication lag

**Scenario**: A mobile app stores user preferences as a single JSONB blob per user. After a feature launch added several new preference fields, the average document size grew from 5 KB to 60 KB. Read replicas are now lagging by 30+ seconds during peak hours, and the on-call engineer suspects a WAL volume spike.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Query `pg_stat_user_tables` for `n_tup_upd` and compare WAL generation rate (`pg_stat_wal` or `pg_current_wal_lsn()` deltas) before and after the feature launch.
   * Confirm the math: ~60 KB per update x typical daily update frequency per user x active user count approximates the observed WAL growth, validating that JSONB write amplification (not an unrelated bug) is the cause.
2. **Mitigation patch strategy and rollback criteria**
   * Patch: split the JSONB document — extract the 2–3 fields that change most frequently (e.g., `last_active_theme`, `notification_count`) into dedicated columns, leaving genuinely static preferences in JSONB.
   * Rollback criteria: validate replication lag returns below a 2-second threshold under equivalent peak load in staging before promoting to production; if lag persists, investigate replica hardware/network separately before re-attempting the schema split.
3. **Post-incident report**
   * Quantify business impact (stale data shown to users on read-replica-served requests, e.g., notification counts lagging by 30+ seconds).
   * Document prevention controls: any JSONB column expected to exceed ~20 KB or be updated more than once per minute per row requires an explicit "hot field extraction" review before launch.

### Drill 3 (Severity 1 / Executive Escalation): Operator-class mismatch silently disables index usage

**Scenario**: Three months after Drill 1's fix, a new analytics query using the `?` key-existence operator (`WHERE info ? 'beta_opt_in'`) is reported by the data team as "ignoring the index" and running a full sequential scan on a now 2-million-row table, causing a dashboard timeout during a board presentation.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Inspect the index definition added in Drill 1 — confirm it was built with `jsonb_path_ops`, which supports `@>` only and does **not** support `?`/`?|`/`?&`.
   * Run `EXPLAIN ANALYZE` on the `?` query to show the planner correctly falling back to a `Seq Scan` because no usable index exists for that operator.
2. **Mitigation patch strategy and rollback criteria**
   * Patch: add a second GIN index using the default `jsonb_ops` operator class (`CREATE INDEX CONCURRENTLY idx_products_info_ops ON products USING GIN(info);`) to support key-existence queries, while keeping the `jsonb_path_ops` index for containment queries — Postgres can maintain both simultaneously.
   * Rollback criteria: monitor index bloat and write overhead from maintaining two GIN indexes on the same column; if write latency on `products` regresses beyond an agreed threshold, consolidate back to a single `jsonb_ops` index (which supports both `@>` and `?`, at the cost of a larger index) and benchmark before keeping both.
3. **Post-incident report**
   * Summarize business impact (a board-level dashboard timed out during a live presentation).
   * Document prevention controls: any new GIN index proposal must document which JSONB operators (`@>`, `?`, `?|`, `?&`) the consuming queries will use, so the correct operator class is chosen the first time.
