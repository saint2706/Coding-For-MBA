---
day: 98
title: "Advanced Indexing (GIN, GiST, BRIN)"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "advanced-indexing"
duration: 120
difficulty: "advanced"
tags:
  - gin
  - gist
  - brin
  - indexing
concepts:
  - "Beyond B-Trees (Non-Scalar Data)"
  - "GIN (Inverted Indexes for JSON/Arrays)"
  - "GiST (Spatial/Range Search)"
  - "BRIN (Block Range for Big Data)"
prerequisites:
  - "Basic B-Tree Index"
outcomes:
  - "Index a JSONB document"
  - "Search 'tags contains X' in 1ms vs 1s"
  - "Index a 1TB log table with 50KB overhead (BRIN)"
---

# 🎯 Day 98: Advanced Indexing (GIN, GiST, BRIN)

> *"A B-Tree is a hammer. Sometimes you have a screw (JSON), a map (Geo), or a mountain (Big Data)."*

---

## The "Never-Coded" Bridge

**The Filing Systems**

1. **B-Tree (Phonebook)**:
    * Good for: "Find Smith". (Sorted Alphabetically).
    * Bad for: "Find people who like 'Pizza'". (Tags are inside the person, not sorted).
2. **GIN (Textbook Index)**:
    * Back of the book: "Pizza: Pages 5, 12, 88".
    * *Query*: "Find pages with Pizza". -> Look up "Pizza" once. Done.
3. **GiST (R-Tree / Map)**:
    * "Find restaurants within 5 miles."
    * Instead of checking every address, draw a Box around the city. Discard everything outside.
4. **BRIN (The Chapter Summary)**:
    * "Chapter 1: Dates 1800-1850". "Chapter 2: Dates 1851-1900".
    * *Query*: "Find 1860". -> Skip Chapter 1. Scan Chapter 2.
    * *Size*: Tiny. Very fast for Time-Series.

---

## The Technical Deep Dive

### 1. GIN (Generalized Inverted Index)

Designed for **Composite Values** (Arrays, JSON, Text Search).

* **Scenario**: `tags = ['sql', 'python', 'java']`.
* **Query**: `WHERE 'python' = ANY(tags)`.
* **B-Tree**: Useless. It sorts `['java'...]` before `['sql'...]`. It can't see *inside*.
* **GIN**:
  * Splits the array keys:
  * `python` -> Row 1, Row 5.
  * `java` -> Row 1, Row 8.
* **Performance**: 100x faster for "Contains" queries.

### 2. GiST (Generalized Search Tree)

Designed for **Overlapping Ranges** and **Geometry**.

* **Scenario**: `booking_range = '[10:00, 12:00)'`.
* **Query**: `WHERE booking_range && '[11:00, 13:00)'`. (Overlaps).
* **Algorithm**: Uses a hierarchy of bounding boxes.
* **Use Case**: PostGIS (Maps), Exclusion Constraints.

### 3. BRIN (Block Range Index)

Designed for **Correlated Data** (Time Series).

* **Scenario**: 1 Billion rows of `logs` sorted by `timestamp`.
* **B-Tree**: Stores one entry per row. (Huge size: 20GB).
* **BRIN**: Stores Min/Max for every 1MB block on disk.
  * Block 1: "Min 10:00, Max 10:05".
  * Block 2: "Min 10:05, Max 10:10".
* **Size**: 50KB. (Tiny).
* **Speed**: "Skip 99% of the table".

---

## Senior-Level Insights

### The Write Penalty

* **B-Tree**: Fast to update. (Change 1 leaf).
* **GIN**: Slow to update. (Change 10 inverted entries).
* **Outcome**: Don't put GIN on a high-velocity transactional table unless you use `Fast Update` (Buffer).

### Index Bloat

* **Problem**: Indexes grow faster than tables.
* **Fix**: `REINDEX CONCURRENTLY` periodically.
* **Tip**: If an index is larger than the table, check if you have duplicate indexes or unused indexes (`pg_stat_user_indexes`).

---

## Hands-on Lab

### Exercise 1: The Tag Search (GIN)

**Goal**: Search arrays.

1. `CREATE TABLE books (id serial, tags text[])`.
2. `INSERT INTO books` (100k rows with random tags).
3. **Slow**: `SELECT * FROM books WHERE 'fantasy' = ANY(tags)`. (Seq Scan).
4. **Fast**: `CREATE INDEX idx_tags ON books USING GIN(tags)`.
5. **Result**: Bitmap Heap Scan.

### Exercise 2: The Geo Search (GiST)

**Goal**: Find overlap.

1. `CREATE TABLE reservations (during tsrange)`.
2. **Slow**: `SELECT * FROM reservations WHERE during && '[2024-01-01 10:00, 11:00)'`.
3. **Fast**: `CREATE INDEX idx_res ON reservations USING GiST(during)`.

### Exercise 3: The Time Series (BRIN)

**Goal**: Index a massive table cheaply.

1. `CREATE TABLE sensor_logs (time timestamptz, val int)`.
2. `ORDER BY time`. (Crucial for BRIN).
3. `CREATE INDEX idx_brin ON sensor_logs USING BRIN(time)`.
4. **Check Size**: `pg_relation_size('idx_brin')` vs `pg_relation_size('idx_btree')`. (Should be 1000x smaller).

---

## Mastery Check

### Question 1: JSON

If I want to search for `{"user_id": 5}` inside a JSONB column, which index do I use?
A) B-Tree.
B) GIN.
C) Hash.
D) BRIN.

<details>
<summary>Click for Answer</summary>

**Answer: B**
GIN handles JSONB key/value lookups perfectly via `jsonb_path_ops`.
</details>

### Question 2: BRIN Constraint

What is the requirement for BRIN to work effectively?
A) The data must be physically sorted (or highly correlated) on disk.
B) The data must be random.
C) The data must be text.
D) You must use SSDs.

<details>
<summary>Click for Answer</summary>

**Answer: A**
If data is random, the Min/Max of every block is "0 to Infinity", so BRIN skips nothing.
</details>

### Question 3: PostGIS

Which index is standard for Geospatial data (Lines, Polygons)?
A) GiST.
B) GIN.
C) B-Tree.
D) List.

<details>
<summary>Click for Answer</summary>

**Answer: A**
R-Trees implementation.
</details>

### Question 4: Update Speed

Which index is slowest to update (Write)?
A) Hash.
B) B-Tree.
C) GIN.
D) None.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Because one row insert might require updating 50 keys in the inverted index.
</details>

### Question 5: B-Tree

Can a B-Tree index handle `WHERE column LIKE '%hello'` (Leading Wildcard)?
A) Yes.
B) No.
C) Only if using `text_pattern_ops`.
D) Sometimes.

<details>
<summary>Click for Answer</summary>

**Answer: B**
B-Trees are prefix-sorted. Use `pg_trgm` (GIN/GiST) for full-text search.
</details>

---

## Summary

Today you learned:

* ✅ **GIN**: The "Inverted Index" for Arrays and JSON.
* ✅ **GiST**: The "Geometric Index" for ranges and maps.
* ✅ **BRIN**: The "Big Data Index" for time-series (Tiny size).
* ✅ **Trade-offs**: Writes vs Reads vs Size.

**Tomorrow**: We ensure data integrity with **Transactions & Concurrency**.
