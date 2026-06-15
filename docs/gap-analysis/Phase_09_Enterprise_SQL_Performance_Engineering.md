# Gap Analysis — Phase 09: Enterprise SQL Performance Engineering

> Audited against the Phase 1 Quality Bar. See [GAP_ANALYSIS.md](../../GAP_ANALYSIS.md) for the full rubric, gap taxonomy, and severity legend.

## Phase summary

Phase 9 covers a strong set of enterprise SQL topics (Days 97–108C) and consistently delivers analogy-first structure, senior-level insights, and a 5-question mastery check per lesson. However, every lesson is missing a `quiz.json` file and a glossary, lab exercises never supply INSERT seed data or expected result sets, and mastery-check answer explanations are reduced to one-liners. A phase-wide copy-paste of an identical Escalating Incident Drill Track across all 12 regular lessons satisfies the recurring-drill requirement on paper while providing zero building narrative. Two structural sequencing problems undercut coherence: Day 104 (Database Design fundamentals) appears after advanced analytical lessons that depend on normalisation literacy, and Day 108's closing line announces "You have completed Phase 9" while two more lessons follow.

**Recurring gaps in this phase:**

- Missing `quiz.json` in every lesson (L:Quiz, P0)
- Missing glossary section in every lesson (O:Glossary, P0)
- Lab exercises contain DDL stubs but no INSERT seed data and no expected result sets (C:Lab, P0)
- Mastery-check answers are single-sentence verdicts with no step-by-step explanation (G:Mastery, P1)
- Pitfall content is buried in "Senior Insights" prose rather than set off as named callout blocks (H:Pitfalls, P1)
- Business/MBA framing is anecdotal rather than quantified; no revenue-impact or decision-framework context (E:Framing, P1)
- Escalating Incident Drill Track is copy-pasted verbatim into all 12 regular lessons — no lesson-specific adaptation (N:Thread, P1)
- Frontmatter prereqs cite specific days (e.g., "Day 91") but lesson bodies contain no inline cross-reference links (K:Xref, P2)

**Lessons audited:** 14

---

## Day 97 — Materialized Views & Caching

**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/Day_97_Views/README.md`

**Assessment:** The "Live Stream vs DVD" analogy is effective, and the CONCURRENT refresh mechanism is explained correctly. Senior-level insight on Eventual Consistency is actionable. However, the lab exercises name steps without providing any schema DDL or INSERT data ("Create a table with 1M rows (generate_series)" is an instruction, not a usable script), and no expected result is shown — a learner cannot self-assess. Mastery-check answers reduce to one-phrase tags: "B / Standard views are virtual." The jargon "DAG" and "dbt" appear in Senior Insights without definition. The decision question "when should I use a view, materialized view, or base-table query?" is never answered with a decision table. No glossary, no quiz.json, and the Incident Drill Track is unrelated to this lesson's content.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create `quiz.json` with ≥5 questions covering MView vs standard view, CONCURRENT keyword, staleness, indexing MViews, and refresh scheduling — each entry must have `"explanation"` key with ≥2 sentences.
- [ ] [P0][O:Glossary] Add a **Glossary** section defining: Materialized View, Standard View, Exclusive Lock, DAG (Directed Acyclic Graph), Staleness, Concurrent Refresh, dbt, Airflow.
- [ ] [P0][C:Lab] Exercise 1: replace "Create a table with 1M rows (generate_series)" with the actual SQL (`CREATE TABLE t AS SELECT generate_series(1,1000000) AS id;`) plus a sample INSERT; add **Expected result**: `EXPLAIN ANALYZE` output showing `Seq Scan cost ~500` vs MView read `0.02ms`.
- [ ] [P0][C:Lab] Exercise 3: provide the exact `CREATE UNIQUE INDEX` DDL needed for CONCURRENT and show expected console output when a concurrent `SELECT` runs mid-refresh (no blocking, row count unchanged).
- [ ] [P1][G:Mastery] Expand all five mastery-check answers from one-liners to 3–5-sentence explanations. E.g., Q1 answer "B / Standard views are virtual" should explain *why* no storage is used, reference the SQL string saved, and contrast with MView on disk.
- [ ] [P1][H:Pitfalls] Convert the "Dependency Chain Horror" prose (currently buried in Senior Insights) into a named `> ⚠️ Pitfall: Refresh Ordering` callout block with the failure mode, detection command (`pg_depend`), and fix.
- [ ] [P1][F:Tables] Add a decision table with columns: **Scenario → Standard View vs MView vs Base Table Query** — include rows for real-time dashboards, daily finance reports, ad hoc exploration, and high-frequency OLTP reads.
- [ ] [P1][E:Framing] Add a business-impact paragraph quantifying the trade-off: e.g., "A dashboard querying a 500M-row fact table 300 times/day at 2s/query vs 5ms/query from an MView saves ~16 hours of DB CPU per day."
- [ ] [P1][A:Concept] Define "DAG" and "Airflow/dbt" on first use; add a footnote or inline "(see Day X for dbt)".
- [ ] [P1][N:Thread] Replace the generic Incident Drill Track with a Day 97-specific scenario: "The nightly MView refresh completed but the dashboard still shows yesterday's data — diagnose whether the refresh ran, check `pg_stat_user_tables`, and add a CONCURRENT index to fix the production outage window."
- [ ] [P2][K:Xref] Add inline cross-reference: "Prereq: B-Tree indexing (Day 98 covers GIN/GiST alternatives)."
- [ ] [P2][M:Coverage] Add coverage of **incremental/partial MView patterns** using `WHERE` clause MViews for recency windows — production teams often maintain a "hot" MView of last 30 days rather than the full table.

---

## Day 98 — Advanced Indexing (GIN, GiST, BRIN)

**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/Day_98_Indexes/README.md`

**Assessment:** The filing-cabinet analogy (phonebook / textbook index / map / chapter summary) is strong and memorable. The three index types are correctly characterised. However, the lab exercises contain no INSERT code — Exercise 1 says "INSERT INTO books (100k rows with random tags)" without supplying the SQL, leaving learners unable to reproduce it. No EXPLAIN plan output is shown, so the "Bitmap Heap Scan" mentioned in Exercise 1 cannot be verified. The write-penalty pitfall for GIN is buried in prose. The decision table comparing all four index types (B-Tree/GIN/GiST/BRIN) by column type, query operator, and write frequency is absent. Hash indexes, partial indexes, covering indexes (`INCLUDE`), and `pg_trgm` for fuzzy search are not covered despite the final mastery question referencing `pg_trgm` in passing.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create `quiz.json` with questions on GIN use cases, BRIN correlation requirement, write penalty trade-offs, GiST for range overlap, and index bloat detection.
- [ ] [P0][O:Glossary] Add Glossary: GIN, GiST, BRIN, B-Tree, Inverted Index, Index Bloat, REINDEX CONCURRENTLY, Bitmap Heap Scan, Block Range.
- [ ] [P0][C:Lab] Exercise 1: supply the complete INSERT script (`INSERT INTO books SELECT generate_series(1,100000), ARRAY['fantasy','sci-fi','horror'] || ARRAY[...];`) and include **Expected result**: `EXPLAIN ANALYZE` showing Seq Scan before and Bitmap Index Scan after with timing comparison.
- [ ] [P0][C:Lab] Exercise 3 (BRIN): add `INSERT INTO sensor_logs SELECT now() + (i * interval '1 second'), random() FROM generate_series(1,1000000) i;` and show **Expected result**: `pg_relation_size` numbers (e.g., "B-Tree: 18 MB vs BRIN: 24 KB").
- [ ] [P1][G:Mastery] Expand answer Q2 ("A / If data is random, the Min/Max of every block is '0 to Infinity', so BRIN skips nothing") into a diagram-in-prose showing three blocks with random data and how the min/max range covers the entire dataset, yielding no pruning benefit.
- [ ] [P1][F:Tables] Add a 5-column decision table: **Index type → Best column type → Best query operator → Write overhead → Size overhead** — with concrete examples for each row.
- [ ] [P1][H:Pitfalls] Convert "GIN: Slow to update" (currently one line in Senior Insights) into a `> ⚠️ Pitfall: GIN Write Amplification` callout with quantified impact ("one INSERT to a row with 20 tags writes 20 inverted-index entries") and mitigation (`fastupdate=on`).
- [ ] [P1][A:Concept] Define `fastupdate` / "Fast Update" buffer mentioned in Senior Insights — currently says "use Fast Update (Buffer)" with no explanation of the mechanism or syntax.
- [ ] [P2][M:Coverage] Add a section covering: **partial indexes** (`CREATE INDEX WHERE status = 'active'`), **covering indexes** (`INCLUDE (col)`), and **hash indexes** (equality-only, smaller than B-Tree) — each with a one-paragraph rationale and a use case.
- [ ] [P2][N:Thread] Tailor the Incident Drill to this lesson: "An overnight index creation on a 500M-row table failed halfway — diagnose the state via `pg_stat_progress_create_index` and restart safely with `CREATE INDEX CONCURRENTLY`."

---

## Day 99 — Distributed Transactions & Concurrency

**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/Day_99_Transactions/README.md`

**Assessment:** The wedding-vows analogy for 2PC is excellent. CAP Theorem and Sagas are correctly summarised. However, Exercise 2 ("Design failure — Tx1: Lock A on DB1, wait for B on DB2") is a thought experiment with no runnable SQL, and Exercise 3 is explicitly labelled "(Paper)" — neither produces evidence the learner can inspect. The title promises "Distributed Transactions & Concurrency" but standard MVCC isolation levels (READ COMMITTED vs REPEATABLE READ vs SERIALIZABLE), `SELECT FOR UPDATE`, and advisory locks — the bread-and-butter of concurrency for a single database — are entirely absent. The tag `XA` appears in frontmatter but the term is never explained in the lesson body. "WAL" is used without definition. No glossary, no quiz.json, no expected results.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create `quiz.json` with questions on 2PC phases, In-Doubt transactions, CAP theorem choices (CP vs AP), Saga compensation, and Quorum calculation.
- [ ] [P0][O:Glossary] Add Glossary: Two-Phase Commit (2PC), XA, Coordinator, Participant, In-Doubt Transaction, CAP Theorem, Saga, Compensating Transaction, WAL (Write-Ahead Log), Quorum, Split Brain.
- [ ] [P0][C:Lab] Exercise 1: expand to include the complete setup schema (`CREATE TABLE accounts (id int, balance int); INSERT INTO accounts VALUES (1,100);`) and show **Expected result** of `pg_prepared_xacts` query (columns: transaction, gid, prepared, owner, database).
- [ ] [P0][C:Lab] Exercise 2: convert the thought experiment into runnable SQL using two Postgres sessions (`SET lock_timeout = '2s'; BEGIN; SELECT * FROM a FOR UPDATE;`) with **Expected result**: error `ERROR: canceling statement due to lock timeout`.
- [ ] [P1][M:Coverage] Add a new section **"MVCC Isolation Levels"** covering READ COMMITTED (default), REPEATABLE READ, and SERIALIZABLE with a 3-row comparison table and a concrete anomaly example (phantom read, non-repeatable read) for each isolation gap.
- [ ] [P1][M:Coverage] Add `SELECT FOR UPDATE / SKIP LOCKED` patterns — critical for job-queue implementations and high-concurrency inventory deduction, which are top MBA-level business scenarios.
- [ ] [P1][A:Concept] Define "WAL" on first use (line 64: "Writes all changes to WAL (Disk)") — add "(Write-Ahead Log: Postgres's sequential change journal, see Day 108 for MVCC)".
- [ ] [P1][A:Concept] Define "XA" from the frontmatter tags somewhere in the body — it is the ISO/XA standard name for 2PC across heterogeneous databases and appears on enterprise job descriptions.
- [ ] [P1][F:Tables] Add a decision table: **Pattern → Consistency level → Latency overhead → Best for** comparing 2PC, Sagas, Eventual Consistency (Kafka), and SERIALIZABLE isolation.
- [ ] [P1][H:Pitfalls] Promote "In-Doubt Transaction" (buried in the Technical Deep Dive as "The Risk") to a named `> ⚠️ Pitfall: In-Doubt Transaction Lock Starvation` callout with detection (`SELECT * FROM pg_prepared_xacts`) and fix (`ROLLBACK PREPARED 'tx_id'`).
- [ ] [P2][K:Xref] Reference prereq: "ACID Basics (Day 91)" is in frontmatter but no inline link; add "(see Day 91 for ACID overview)" at the first mention of atomicity.
- [ ] [P2][N:Thread] Tailor Incident Drill: "Your monitoring shows `pg_prepared_xacts` has 47 entries older than 6 hours after a coordinator node rebooted during a batch payment job — write the resolution runbook."

---

## Day 100 — Advanced Stored Procedures

**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/Day_100_Stored_Procedures/README.md`

**Assessment:** The vending-machine analogy cleanly maps control flow to business reality. The SECURITY DEFINER "sudo" pattern is well explained. Code blocks in the lab are unusually complete — the three exercises provide full function DDL. However, the exercises reference an `employees` and `users` table without providing CREATE TABLE / INSERT seed statements, so learners cannot run the code as written. No expected console output is shown for any exercise. The tag `"Dynamic SQL (EXECUTE format)"` appears in the frontmatter but the lesson body uses string concatenation (`||`) rather than the safer `format('TRUNCATE TABLE %I', tbl)` function, which is the current best practice. Cursors, `RETURN NEXT`, `OUT` parameters, and PL/Python as an alternative language are entirely absent.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create `quiz.json` covering SECURITY DEFINER vs INVOKER, Dynamic SQL injection prevention, exception handling scope, COMMIT inside procedures vs functions, and loop performance.
- [ ] [P0][O:Glossary] Add Glossary: PL/pgSQL, SECURITY DEFINER, SECURITY INVOKER, Dynamic SQL, Exception Block, quote_ident, quote_literal, Savepoint, Autonomous Transaction.
- [ ] [P0][C:Lab] Exercise 1: add `CREATE TABLE employees (id serial, name text, salary numeric); INSERT INTO employees VALUES (1,'Alice',90000),(2,'Bob',75000);` before the function; show **Expected result**: `NOTICE: User Alice: Running Total 90000` / `NOTICE: User Bob: Running Total 165000`.
- [ ] [P0][C:Lab] Exercise 3: show **Expected result**: `NOTICE: Dropped temp_sales` / `NOTICE: Dropped temp_orders` (or equivalent) after running `CALL clean_temp_tables()`.
- [ ] [P1][B:CodeCtx] Exercise 3 uses `'DROP TABLE ' || quote_ident(tbl)` but the frontmatter tag reads "EXECUTE format" — update to `EXECUTE format('DROP TABLE %I', tbl)` (the safer, recommended idiom) and explain in a preamble why `format()` with `%I` is preferred over manual `||` concatenation.
- [ ] [P1][G:Mastery] Expand Q3 answer (currently "B / Unhandled exceptions are fatal to the transaction") to explain the full stack: the function block aborts, the enclosing transaction rolls back, and the caller receives an error — contrast with what happens if an EXCEPTION clause catches it.
- [ ] [P1][H:Pitfalls] Add a named `> ⚠️ Pitfall: Autonomous Transaction Trap` callout explaining that a Postgres FUNCTION cannot COMMIT mid-execution (use PROCEDURE + CALL), and show the error message learners will see if they try.
- [ ] [P1][E:Framing] Add a business-context paragraph: "Stored procedures own $X-per-hour of your DB cost. A procedure that loops 100k times in the database vs one that returns a result set for app-side processing can differ by 10x in DB CPU — size your DB accordingly."
- [ ] [P2][M:Coverage] Add a subsection on **OUT parameters and RETURN TABLE** — the most common real-world function signature pattern for returning multiple result sets.
- [ ] [P2][M:Coverage] Mention **PL/Python** and **PL/R** as alternatives for numeric-heavy or ML logic that doesn't belong in PL/pgSQL.
- [ ] [P2][N:Thread] Tailor Incident Drill: "A stored procedure that archives old orders started at midnight but is still running at 6 AM — investigate via `pg_stat_activity`, identify lock contention, and add COMMIT every 10k rows to allow incremental progress."

---

## Day 101 — Triggers & Event-Driven SQL

**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/Day_101_Triggers/README.md`

**Assessment:** The "Security Guard vs Photographer" analogy is vivid and correctly maps BEFORE/AFTER timing. The three exercises cover sanitisation, audit logging, and NOTIFY — a solid coverage arc. The `NOTIFY`/`LISTEN` pattern is under-explained compared to its importance for event-driven architecture. The JSONB diff operator `to_jsonb(NEW) - to_jsonb(OLD)` in Exercise 2 is used without any preamble explaining what it produces (a JSONB object containing only changed keys), making it opaque to beginners. The trigger cascade pitfall is in Senior Insights prose, not a callout. INSTEAD OF triggers (for updatable views) and event triggers (DDL-level) are absent. No sample data, no expected results.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create `quiz.json` covering BEFORE vs AFTER timing, FOR EACH ROW vs STATEMENT performance, NOTIFY transactional semantics, `OLD`/`NEW` row variables, and trigger cascade prevention.
- [ ] [P0][O:Glossary] Add Glossary: BEFORE Trigger, AFTER Trigger, INSTEAD OF Trigger, FOR EACH ROW, FOR EACH STATEMENT, NEW, OLD, NOTIFY, LISTEN, pg_trigger_depth, Audit Log, Event Trigger.
- [ ] [P0][C:Lab] Exercise 1: add `CREATE TABLE users (id serial, email text); INSERT INTO users VALUES (1,'BOB@EXAMPLE.COM');` and show **Expected result**: after `UPDATE users SET email='ALICE@EXAMPLE.COM' WHERE id=1`, a `SELECT email FROM users WHERE id=1` returns `alice@example.com`.
- [ ] [P0][C:Lab] Exercise 2: add `INSERT INTO users VALUES (2,'charlie@example.com');` then `UPDATE users SET email='new@x.com' WHERE id=2;`, and show **Expected result** from `SELECT diff FROM audits` — e.g. `{"email": "new@x.com"}` (changed keys only).
- [ ] [P1][B:CodeCtx] Add a preamble before Exercise 2's `to_jsonb(NEW) - to_jsonb(OLD)` line explaining: "The `-` operator on two JSONB objects returns a new JSONB containing only the keys present in the left operand but *not matching* the right — effectively the changed fields. This is more storage-efficient than storing the entire row twice."
- [ ] [P1][H:Pitfalls] Convert "Trigger Cascade Nightmare" (Senior Insights prose) into `> ⚠️ Pitfall: Trigger Cascade Loop` callout block with detection (`IF pg_trigger_depth() > 1 THEN RETURN NEW; END IF;`) and architectural advice.
- [ ] [P1][H:Pitfalls] Add `> ⚠️ Pitfall: Synchronous Email/HTTP in Trigger` — the pattern "don't send email inside the trigger, INSERT into a queue table instead" is mentioned but should be a named callout with a code snippet showing the queue pattern.
- [ ] [P1][M:Coverage] Add a subsection on **INSTEAD OF Triggers** (on views, for updatable view simulation) — a common production pattern for abstracting complex multi-table writes behind a simple view interface.
- [ ] [P1][E:Framing] Add business context quantifying audit-log ROI: "GDPR Article 30 requires records of processing; a trigger-based audit log adds ~0.5ms per write but saves €20M in potential fines — this is always the right trade-off."
- [ ] [P2][M:Coverage] Add a short section on **Event Triggers** (DDL-level triggers: `ON DDL_COMMAND_START`) for capturing schema changes in regulated environments.
- [ ] [P2][N:Thread] Tailor Incident Drill: "An `AFTER UPDATE` trigger on `orders` is adding 800ms to every order update under load — profile using `EXPLAIN ANALYZE` on the trigger function, isolate the hot path, and propose an async queue migration."

---

## Day 102 — Advanced CTEs & Recursion

**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/Day_102_Common_Table_Expressions/README.md`

**Assessment:** The family-tree analogy cleanly separates the anchor/recursive members. The three-part lab (org chart, bill of materials, cycle panic) follows a good escalation arc. The full org-chart recursive CTE in the Technical Deep Dive is one of the better code examples in Phase 9 — it is self-contained and well-commented. Key weaknesses: exercises have no seed data and no expected query results, so "Name: Charlie / Path: Alice -> Bob -> Charlie / Level: 3" is stated as a goal but learners cannot verify their output. The `UNION ALL` vs `UNION` choice in recursion is unexplained. Q3's mastery-check answer references "mathematically defined fixed-point" without any explanation of what that means. The Postgres 14 `SEARCH` and `CYCLE` clauses, and the closure-table alternative, are absent.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create `quiz.json` covering anchor vs recursive member roles, `UNION ALL` vs `UNION` in recursion, path-array cycle detection, Bill-of-Materials aggregation pattern, and performance limits.
- [ ] [P0][O:Glossary] Add Glossary: Anchor Member, Recursive Member, WITH RECURSIVE, UNION ALL, Cycle Detection, Path Array, Bill of Materials (BOM), Fixed-Point, Closure Table.
- [ ] [P0][C:Lab] Exercise 1: add seed data — `CREATE TABLE employees (id int, name text, manager_id int); INSERT INTO employees VALUES (1,'Alice',NULL),(2,'Bob',1),(3,'Charlie',2);` — and show **Expected result** of the full query: `| id | name | path | level |` rows for all three employees.
- [ ] [P0][C:Lab] Exercise 2: provide the full BOM schema (`CREATE TABLE parts (id int, name text, parent_id int, unit_weight_g numeric, quantity int);`) with INSERTs, and show **Expected result**: `total_weight_g = 100`.
- [ ] [P1][A:Concept] Explain `UNION ALL` vs `UNION` in recursion: "We always use `UNION ALL` (not `UNION`) because de-duplication across recursive iterations would be incorrect and extremely expensive — each iteration's result set is already bounded by the join condition."
- [ ] [P1][G:Mastery] Expand Q3 answer from "Mathematically defined fixed-point" to: "The recursion halts when the recursive SELECT returns an empty result set — meaning no new rows satisfy the JOIN condition (no more unvisited children). This is the mathematical 'fixed point': applying the rule again would produce no change."
- [ ] [P1][H:Pitfalls] Promote "Performance Limits" from Senior Insights to a named `> ⚠️ Pitfall: Unbounded Recursion` callout: cite that Postgres has no default recursion depth limit (unlike SQL Server's 100), show the cycle-detection `WHERE NOT (e.id = ANY(path))` pattern as the mandatory safeguard, and note the `CYCLE` clause available in Postgres 14+.
- [ ] [P1][F:Tables] Add a decision table: **Use Case → Recursive CTE vs Closure Table vs Graph DB** — rows for shallow org charts, BOM explosions, shortest-path routing, and fraud ring detection.
- [ ] [P2][M:Coverage] Add a sidebar on the **Postgres 14 `SEARCH` and `CYCLE` clauses** (`SEARCH BREADTH FIRST BY id SET ordercol`, `CYCLE id SET is_cycle USING path`) — reduces boilerplate and is the current best practice.
- [ ] [P2][N:Thread] Tailor Incident Drill: "A recursive CTE for org-chart traversal has been running for 12 minutes — diagnose using `pg_stat_activity`, add cycle detection to the query, and propose a closure-table migration for the 50k-employee hierarchy."

---

## Day 103 — Pivoting & Crosstabs

**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/Day_103_Pivoting_Data/README.md`

**Assessment:** The tally-mark-to-scoreboard analogy lands well. All three pivot approaches (manual CASE/FILTER, crosstab, JSON aggregation) are covered. The senior insight "Report in DB vs BI Tool" is an important decision that MBA students need. Gaps: the `crosstab` function is shown with only 1-argument form but the production-safe 2-argument form (which specifies category values and prevents column-order bugs) is not covered. No seed data is provided for any exercise. Exercise 2 gives a stub (`SELECT * FROM crosstab(...)`) with no full working example. The "Sparse Matrix Problem" pitfall sits in Senior Insights without quantification. `string_agg` for list pivots and the `MODE()` filter-based approach are absent.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create `quiz.json` covering FILTER vs CASE WHEN syntax, crosstab column definition requirement, jsonb_object_agg for dynamic keys, when to offload pivoting to BI tools, and sparse-matrix memory cost.
- [ ] [P0][O:Glossary] Add Glossary: Pivot, Crosstab, FILTER clause, tablefunc extension, crosstab (function), jsonb_object_agg, Sparse Matrix, Dynamic Columns.
- [ ] [P0][C:Lab] Exercise 1: add `CREATE TABLE grades (student text, subject text, score int); INSERT INTO grades VALUES ('Alice','Math',90),('Alice','Science',85),('Bob','Math',78),('Bob','Science',92);` and show **Expected result**: `| student | math_score | science_score |` table.
- [ ] [P0][C:Lab] Exercise 2: provide full working `crosstab` SQL including the 2-argument form: `SELECT * FROM crosstab('SELECT student, subject, score FROM grades ORDER BY 1,2', 'VALUES (''Math''), (''Science'')') AS ct(student text, math int, science int);` — and explain why 2-argument prevents column misalignment when category values are sparse.
- [ ] [P1][B:CodeCtx] Add a preamble before the `crosstab` code block explaining: "The 1-argument `crosstab()` assumes categories appear in consistent order per row — if any row is missing a category value, columns will silently shift. Always use the 2-argument form in production."
- [ ] [P1][H:Pitfalls] Convert "Sparse Matrix Problem" into a named `> ⚠️ Pitfall: Pivot Memory Explosion` callout with a concrete calculation: "1,000 products × 1,000 stores × 8 bytes = 8 MB per result set in RAM — for 50 concurrent report queries this is 400 MB of RAM used purely for formatting."
- [ ] [P1][E:Framing] Expand the "Managers love spreadsheets" intro into a concrete MBA scenario: "You are presenting Q4 performance to the CFO. They want regions as rows and months as columns in the slide deck. This is a Pivot. Your SQL analyst produces it; your BI tool (Tableau/PowerBI) can produce it automatically — use the right tool."
- [ ] [P2][M:Coverage] Add `string_agg(col ORDER BY col)` as a lightweight "string pivot" for label lists, and `MODE() WITHIN GROUP (ORDER BY col)` for modal-value reporting — both are simpler than crosstab for common MBA reporting needs.
- [ ] [P2][N:Thread] Tailor Incident Drill: "The monthly regional-sales crosstab report is returning NULL for some regions in some months due to 1-argument crosstab column misalignment — reproduce the bug, fix with the 2-argument form, and add a regression test."

---

## Day 104 — Database Design & Normalization

**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/Day_104_Database_Design_and_Normalization/README.md`

**Assessment:** The address-book analogy for normalisation anomalies is clear. The 1NF/2NF/3NF treatment covers the essential definitions and the anomaly taxonomy (update/insertion/deletion) is correctly characterised. The senior insight on Natural vs Surrogate Keys is practical and actionable. Critical gaps: BCNF is listed as a concept in the frontmatter, appears in the Mastery Check (Q5), but is **never explained in the lesson body** — a learner cannot answer the question from the material provided. The lesson is sequenced at Day 104, *after* Days 97–103 which build advanced analytical patterns on top of relational tables — normalization fundamentals should anchor the phase, not follow it. No expected results, no sample data, no quiz.json, no glossary.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create `quiz.json` covering 1NF/2NF/3NF definitions, anomaly types, BCNF, surrogate vs natural key trade-offs, and when to deliberately denormalize.
- [ ] [P0][O:Glossary] Add Glossary: First Normal Form (1NF), Second Normal Form (2NF), Third Normal Form (3NF), Boyce-Codd Normal Form (BCNF), Partial Dependency, Transitive Dependency, Candidate Key, Surrogate Key, Natural Key, Update Anomaly, Insertion Anomaly, Deletion Anomaly, Star Schema, Snowflake Schema.
- [ ] [P0][A:Concept] **Add a BCNF explanation** in the Technical Deep Dive — the concept appears in both the frontmatter and Mastery Check Q5 but is entirely absent from the lesson content. Minimum: "BCNF (Boyce-Codd Normal Form) is a stricter version of 3NF: for every non-trivial functional dependency X→Y, X must be a superkey. BCNF violations occur when a non-superkey attribute determines another attribute, even when 3NF is satisfied."
- [ ] [P0][C:Lab] Exercise 1 ("Convert to 1NF"): add `CREATE TABLE orders (id int, items text); INSERT INTO orders VALUES (1,'Apple, Banana');` and show **Expected result**: `CREATE TABLE order_items (order_id int, item text);` with `| order_id | item |` rows `(1,'Apple'),(1,'Banana')`.
- [ ] [P0][C:Lab] Exercise 2 ("Achieving 3NF"): provide a full before/after schema with sample data and a query demonstrating the anomaly fixed — `SELECT b.isbn, b.title, a.name FROM books b JOIN authors a ON b.author_id = a.id`.
- [ ] [P1][K:Xref] **Sequencing flag**: Day 104 (normalisation fundamentals) appears after Days 97–103 which use relational schemas and join patterns that presuppose normalisation literacy. Recommend moving Day 104 to Day 97 or creating a forward cross-reference at Day 97: "(For normalisation foundations that underpin this lesson's table design, see Day 104.)"
- [ ] [P1][F:Tables] Add a table: **Normal Form → Rule → Violation Example → How to Fix** — covering 1NF through BCNF in a single reference table.
- [ ] [P1][F:Tables] Add a separate decision table: **OLTP (3NF) vs OLAP (Star Schema) vs Hybrid** — with columns for write frequency, query complexity, join count, and maintenance overhead.
- [ ] [P1][H:Pitfalls] Convert "Over-Normalization" (Senior Insights) into a named `> ⚠️ Pitfall: Over-Engineering the Schema` callout: "Junior engineers split Address into 8 fields. Senior engineers ask: 'What query would ever filter by Street Suffix?' If the answer is none, keep it as a single text column."
- [ ] [P2][M:Coverage] Add a section on **referential integrity enforcement**: `ON DELETE CASCADE` vs `ON DELETE RESTRICT` vs `ON DELETE SET NULL` — with a business scenario for each (e.g., deleting a customer should cascade to their orders in a soft-delete system).
- [ ] [P2][N:Thread] Tailor Incident Drill: "A data analyst reports that deleting a product from the catalog silently removed 3 months of sales history — diagnose the `ON DELETE CASCADE` chain, add `ON DELETE RESTRICT` on the sales FK, and write a recovery script."

---

## Day 105 — JSON & NoSQL in SQL

**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/Day_105_JSON_in_SQL/README.md`

**Assessment:** The "Form vs Box" analogy accurately captures the schemaless trade-off. JSONB vs JSON, the three key operators (`->`, `->>`, `@>`), and GIN indexing are well described. The senior insight on update write-amplification is a real production concern and is correctly framed. Weaknesses: the mastery-check answer for Q3 references `jsonb_path_ops` (the operator class for GIN indexing) but `jsonb_path_ops` is never introduced in the lesson body — learners cannot connect the answer to the material. Exercise 2 says "Insert 10,000 rows" with no INSERT code. The `?` (key-exists) operator, `jsonb_path_query`, `jsonb_to_recordset`, and JSON schema validation are absent. No expected EXPLAIN output for either the pre-index or post-index state.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create `quiz.json` covering JSON vs JSONB storage differences, `->` vs `->>` return types, `@>` containment semantics, GIN index operator classes, and write-amplification trade-offs.
- [ ] [P0][O:Glossary] Add Glossary: JSONB, JSON, Binary Storage, `->` operator, `->>` operator, `@>` (containment), `?` (key existence), GIN Index, jsonb_path_ops, jsonb_ops, jsonb_set, Write Amplification, Semi-structured Data.
- [ ] [P0][C:Lab] Exercise 1: add `CREATE TABLE products (id serial, info jsonb);` and a concrete INSERT, then show **Expected result** of the SELECT: `| name | |---|` `| TV |`.
- [ ] [P0][C:Lab] Exercise 2: add `INSERT INTO products(info) SELECT jsonb_build_object('color', (ARRAY['red','blue','green'])[floor(random()*3+1)::int], 'price', round((random()*1000)::numeric, 2)) FROM generate_series(1,10000);` and show **Expected result**: EXPLAIN plan node changing from `Seq Scan` to `Bitmap Index Scan on idx_products`.
- [ ] [P1][A:Concept] Introduce `jsonb_path_ops` and `jsonb_ops` in the GIN section — the mastery-check answer Q3 cites `jsonb_path_ops` without explanation. Add: "There are two GIN operator classes: `jsonb_ops` (indexes every key and value, supports `?`, `?|`, `?&`, `@>`) and `jsonb_path_ops` (only indexes values reachable via path, supports `@>` only but is ~40% smaller). For containment searches, prefer `jsonb_path_ops`."
- [ ] [P1][B:CodeCtx] Add a preamble before `jsonb_set(info, '{name}', '"OLED TV"')` explaining: "The second argument is the path as a text array `'{name}'` (top-level key). For nested updates: `'{specs,resolution}'`. The third argument must be valid JSON literal — string values need the inner quotes `'"OLED TV"'`."
- [ ] [P1][H:Pitfalls] Convert the "Update Performance" warning into a named `> ⚠️ Pitfall: JSONB Write Amplification` callout with a size example: "A 50KB JSONB profile updated 1,000 times/day writes 50 MB of new data daily to the WAL — use columnar fields for frequently updated attributes."
- [ ] [P2][M:Coverage] Add the `?` (key existence) operator: `WHERE info ? 'discount'` — commonly needed for optional field queries in schema-less designs.
- [ ] [P2][M:Coverage] Add `jsonb_to_recordset` for exploding an array of JSON objects into a relational result set — essential for normalizing event payloads for reporting.
- [ ] [P2][N:Thread] Tailor Incident Drill: "A mobile app storing user preferences as JSONB is causing 90th-percentile write latency of 800ms after schema growth to 200KB per document — audit write amplification via WAL statistics and propose a hybrid schema migration."

---

## Day 106 — XML & Complex Data Types

**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/Day_106_XML_in_SQL/README.md`

**Assessment:** This lesson bundles XML, Arrays, ENUMs, and Composite Types into one session — an ambitious scope that results in thin coverage of each. The toolbox analogy is charming. The ENUM trap exercise (inserting an invalid value and using `ALTER TYPE`) is a solid practical demonstration. However, `xpath()` in Exercise 1 returns `xml[]` (an array of XML nodes), not plain text — the result requires `::text` casting to be human-readable, which is not mentioned. Composite Types appear only in Mastery Check Q5 and in one line of Senior Insights with no lab exercise at all — they are listed in the frontmatter concepts but effectively uncovered. `hstore`, range types, `tsvector`/`tsquery` (full-text search types), and network types (`inet`/`cidr`) are all absent.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create `quiz.json` covering xpath return type, `unnest` vs `array_agg`, ENUM rigidity trade-off, Composite Type definition, and when to choose Arrays over junction tables.
- [ ] [P0][O:Glossary] Add Glossary: XML (in SQL), xpath, unnest, array_agg, ENUM Type, Composite Type, hstore, Range Type, tsvector, tsquery, GIN (for text search).
- [ ] [P0][C:Lab] Add Exercise for Composite Types (currently only in Mastery Q5): `CREATE TYPE address AS (street text, city text, zip text); CREATE TABLE customers (id serial, home_addr address); INSERT INTO customers(home_addr) VALUES (ROW('123 Main St','New York','10001'));` with **Expected result** of `SELECT (home_addr).city FROM customers;` returning `New York`.
- [ ] [P0][C:Lab] Exercise 1: after the `xpath` query, add **Expected result** and explain the cast: "`xpath('//title/text()', doc)` returns `xml[]`; cast to text: `xpath('//title/text()', doc)[1]::text` returns `SQL 101`."
- [ ] [P1][B:CodeCtx] Add a preamble to Exercise 1's xpath query: "The `xpath()` function returns an `xml[]` array (even for a single result). Access the first element with `[1]` and cast to text with `::text`. This surprises most learners expecting a plain string."
- [ ] [P1][A:Concept] Composite Types are listed in frontmatter concepts and appear in Mastery Q5 ("A column that holds a Struct") but receive no explanation in the lesson body. Add a full subsection under Technical Deep Dive: definition, CREATE TYPE syntax, field access `(col).field`, and when to use vs JSONB.
- [ ] [P1][H:Pitfalls] Convert the "Array vs Join Debate" (currently in Senior Insights as prose) into a named `> ⚠️ Pitfall: Arrays Break Referential Integrity` callout: "Storing `order_ids int[]` in a Users table means you can reference order ID 999 that doesn't exist — Postgres provides no FK constraint on array elements. Use a junction table for integrity."
- [ ] [P2][M:Coverage] Add a subsection on **Range Types** (`tsrange`, `daterange`, `int4range`) and the `&&` (overlap) and `@>` (contains) operators — these are directly useful for booking systems and scheduling, a key MBA scenario.
- [ ] [P2][M:Coverage] Add a brief section on **`tsvector`/`tsquery`** (PostgreSQL full-text search types) as they are the correct Postgres-native alternative to LIKE '%pattern%' searches — a gap left from earlier lessons.
- [ ] [P2][N:Thread] Tailor Incident Drill: "A legacy SOAP integration is storing 10 MB XML documents in a single column — profile query performance with `EXPLAIN ANALYZE`, add a functional index on a frequently queried xpath expression, and propose a JSON migration path."

---

## Day 107 — Enterprise Security: RLS & Encryption

**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/Day_107_Security/README.md`

**Assessment:** The apartment-complex key analogy (front desk / elevator / apartment key / safe) is the best-structured analogy in Phase 9 and precisely maps to Guard/RBAC/RLS/Encryption. The multi-tenancy Pool vs Silo trade-off discussion is essential MBA content. However, Exercise 2 uses `USING (user_name = current_user)` which may fail in many environments because `current_user` returns the database role name, not an application-level username — this requires setup context the lesson doesn't provide. The `CREATE EXTENSION pgcrypto` step is not shown before Exercise 3 uses pgcrypto functions. `pg_audit`, TLS/SSL connection security, column-level privileges, and data masking are absent. No glossary, no quiz.json, no expected results showing the "before RLS" vs "after RLS" visibility difference.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create `quiz.json` covering RLS default-deny behaviour, superuser bypass, bcrypt vs symmetric encryption use cases, separate SELECT vs UPDATE policies, and connection-security considerations.
- [ ] [P0][O:Glossary] Add Glossary: Row Level Security (RLS), Policy (RLS), RBAC, Principle of Least Privilege, pgcrypto, crypt(), gen_salt(), pgp_sym_encrypt, pgp_sym_decrypt, bcrypt, Key Management, SQL Injection, Parameterised Query, TLS/SSL.
- [ ] [P0][C:Lab] Exercise 2: prefix with `CREATE EXTENSION pgcrypto;` (currently missing), add `INSERT INTO chat VALUES (1,'alice','Hi'), (2,'bob','Hello');`, then show **Expected result** of `SET ROLE alice; SELECT * FROM chat;` returning only Alice's row vs pre-RLS `SELECT *` returning both rows.
- [ ] [P0][C:Lab] Exercise 3: add `CREATE TABLE secrets (id serial, cc bytea);` and `CREATE EXTENSION pgcrypto;` before the lab and show **Expected result** of the decrypt query: `| pgp_sym_decrypt |` `| 4111-2222 |`.
- [ ] [P1][B:CodeCtx] Add a preamble to Exercise 2 explaining: "`current_user` returns the Postgres role name, not an application username. In production, pass the application user context via `SET app.current_user_id = 42` in the session and reference `current_setting('app.current_user_id')::int` in the policy — this is the standard multi-tenancy pattern."
- [ ] [P1][H:Pitfalls] Add `> ⚠️ Pitfall: RLS Bypass via Security Definer Functions` callout: "A SECURITY DEFINER function runs as its owner and ignores the caller's RLS policies — this is a common privilege escalation vector. Always test your RLS policies from a non-superuser role, not from the function owner."
- [ ] [P1][H:Pitfalls] Add `> ⚠️ Pitfall: Key Stored Alongside Encrypted Data` callout referencing the Senior Insight's passing mention: "The most common pgcrypto mistake is storing the encryption key in the same database as the ciphertext. An attacker who dumps the DB gets both. Keys belong in environment variables or a secrets manager (Vault, AWS KMS)."
- [ ] [P1][F:Tables] Add a decision table: **Security Concern → Mechanism → When to Use** — rows for table-level access (GRANT/REVOKE), row-level isolation (RLS), column sensitivity (column GRANT), data-at-rest confidentiality (pgcrypto), and connection confidentiality (TLS).
- [ ] [P1][M:Coverage] Add a section on **column-level permissions**: `GRANT SELECT (salary) ON employees TO hr_role` — essential for PII compliance; many MBA learners will work in environments where salary/SSN columns must be hidden from most roles.
- [ ] [P2][M:Coverage] Add a brief section on **`pg_audit`** extension for compliance-grade audit logging (SOC2/PCI) — distinct from the trigger-based audit log in Day 101.
- [ ] [P2][N:Thread] Tailor Incident Drill to this lesson: "A security scan flags that your RLS-protected `orders` table returns data for other tenants when queried via a SECURITY DEFINER function — reproduce the leak, patch the function, and write a regression test proving isolation."

---

## Day 108 — Performance Tuning & Optimization

**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/Day_108_Performance_Tuning/README.md`

**Assessment:** The traffic-jam analogy for Seq Scan / Index Scan / Bitmap Heap Scan is memorable and technically accurate. The EXPLAIN ANALYZE metric breakdown (cost, actual time, rows, buffers) is the most practically useful table in Phase 9. The VACUUM/MVCC section correctly identifies bloat mechanics. Key gaps: Exercise 1 says "Create a table with 1M users" but provides no DDL or seed SQL. Exercise 2 ("Tune for a 64GB server") is a list of configuration values without a test environment or expected observable difference. The `autovacuum_vacuum_scale_factor` parameter is mentioned as "(default 20%)" without explaining what it means (20% of the table must be dead before autovacuum runs). `pg_stat_statements`, `pg_stat_activity`, table partitioning as a performance tool, and parallel query settings are entirely absent. This lesson's closing sentence — "You have completed Phase 9" — contradicts the existence of Day 108B and 108C, which follow within the same phase.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create `quiz.json` covering EXPLAIN metric interpretation (shared hit vs shared read), work_mem disk-spill detection, VACUUM vs VACUUM FULL behaviour, Seq Scan vs Index Scan selectivity threshold, and PgBouncer purpose.
- [ ] [P0][O:Glossary] Add Glossary: EXPLAIN ANALYZE, Sequential Scan (Seq Scan), Index Scan, Bitmap Heap Scan, shared_buffers, work_mem, effective_cache_size, VACUUM, VACUUM FULL, MVCC, Table Bloat, Autovacuum, PgBouncer, Connection Pooling.
- [ ] [P0][C:Lab] Exercise 1: add `CREATE TABLE users (id serial, email text); INSERT INTO users SELECT generate_series(1,1000000), 'user'||generate_series(1,1000000)||'@x.com';` and show **Expected result**: EXPLAIN output before index (`Seq Scan ... actual time=50.123..50.125`) and after (`Index Scan ... actual time=0.015..0.017`).
- [ ] [P0][C:Lab] Exercise 3: add setup `INSERT INTO users SELECT generate_series(1,1000000), 'u'||generate_series(1,1000000); DELETE FROM users WHERE id < 900000;` and show **Expected result** of pg_size_pretty before VACUUM FULL vs after.
- [ ] [P1][A:Concept] Explain `autovacuum_vacuum_scale_factor = 0.2` (line 76): "This means autovacuum triggers when dead tuples exceed 20% of the table's live row count. For a 10M-row table: 2M dead rows must accumulate before autovacuum runs. For large tables, reduce to 0.01 (1%)."
- [ ] [P1][K:Xref] Remove or update the "Congratulations! You have completed Phase 9" closing line — Day 108B and Day 108C follow within Phase 9. Replace with "Tomorrow: The Curriculum Capstone (Day 108B) and Cloud-Native SQL (Day 108C) complete the phase."
- [ ] [P1][H:Pitfalls] Add `> ⚠️ Pitfall: VACUUM FULL in Production` callout: "VACUUM FULL acquires an AccessExclusiveLock — no reads or writes are possible during the rewrite. On a 500GB table this takes hours. Schedule in a maintenance window or use `pg_repack` for a near-zero-downtime alternative."
- [ ] [P1][M:Coverage] Add a section on **`pg_stat_statements`** — the single most important performance monitoring tool, already referenced in the Escalating Incident Drills but never taught. Include `SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;` as a standard DBA query.
- [ ] [P1][M:Coverage] Add **table partitioning** (range, list, hash) as a performance tool — partitioning is a top-tier performance technique for large tables and is a natural successor to the MView lesson.
- [ ] [P2][M:Coverage] Add `ANALYZE` (update table statistics) as a complement to VACUUM — stale statistics cause query plan regressions and are among the most common performance bugs after schema changes.
- [ ] [P2][N:Thread] Tailor Incident Drill: "After a schema migration adding two columns to a 500M-row orders table, all queries against it are 5x slower — diagnose stale statistics via `pg_stat_user_tables.n_mod_since_analyze`, run ANALYZE, and verify the plan improves."

---

## Day 108B — Curriculum Grand Finale Capstone

**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/Day_108B_Curriculum_Capstone/README.md`

**Assessment:** The capstone project is ambitious and the retail analytics scenario is well chosen — it genuinely integrates data engineering (Phases 1–3), SQL analytics (8–9), ML forecasting (Phases 4–5), and anomaly detection (Phase 6). The self-assessment rubric with a 35-point scale is a strong Phase 1-quality element. However, significant portions of the implementation are stubs: Milestone 2 includes only 1 of the 5 promised KPI queries (the other two are `# TODO`), and Milestone 5 visualization has three `# TODO` panels — the capstone deliverables claim "5 KPI queries" but show only one. The dataset generator has a functional bug: the initial `regions` dict is immediately overwritten by the line below it (the comment `# ... (simplified for demo)` is dead code, not a dict). The capstone uses **SQLite** throughout, inconsistent with Phase 9's PostgreSQL focus and preventing learners from applying the RLS, MViews, GIN indexes, and other Postgres-specific skills just taught. No quiz.json, no glossary, no expected ML output benchmarks (what is a "good" vs "acceptable" MAPE for this data?).

**Gap task stubs:**

- [ ] [P0][C:Lab] Complete all three `# TODO` panels in Milestone 5 (`build_executive_dashboard`) — learners cannot produce a "Dashboard saved: capstone_dashboard.png" output without implementation. Provide the bar chart code for Panel 2 and the forecast/anomaly scatter plots for Panels 3 and 4.
- [ ] [P0][C:Lab] Milestone 2: implement KPI queries 2 and 3 (currently `# TODO: Write this query yourself`) or explicitly convert them to guided exercises with a sample partial solution and **Expected result** schema.
- [ ] [P0][A:Concept] Fix the dataset generator bug: the `regions` dict defined with literal key-value pairs on lines 85–88 is immediately overwritten by `regions = {s: random.choice(…) for s in stores}` on line 89 — the first definition is dead code. Remove lines 85–88 or restructure to use the dict merge pattern.
- [ ] [P0][K:Xref] The capstone uses `sqlite3` throughout Milestones 1–4, contradicting Phase 9's Postgres focus. Either migrate the database backend to PostgreSQL (enabling MViews, GIN indexes, RLS) or add an explicit callout explaining why SQLite is used for portability and what Postgres equivalents would be used in production.
- [ ] [P1][C:Lab] Add **Expected ML output benchmarks**: "A well-tuned Gradient Boosting model on this synthetic dataset should achieve 8–12% MAPE. If your MAPE exceeds 20%, check that you applied time-series CV correctly (no data leakage from future folds)."
- [ ] [P1][M:Coverage] The deliverables checklist references `02_sql_kpis.sql` with "All 5 KPI queries" but only 1 is provided in the lesson. Either show all 5 queries or renumber the checklist to match actual content.
- [ ] [P1][E:Framing] Add an explicit "How this maps to real roles" section: "What you built is a simplified version of what an Analytics Engineer at a retail company builds. The MoM growth query (KPI 1) appears in every retail BI dashboard. The anomaly detection would reduce operations-review time by ~4 hours/week."
- [ ] [P2][L:Quiz] Add a capstone self-check quiz.json with 5 integration questions spanning phases (e.g., "Why did we use `TimeSeriesSplit` instead of `train_test_split`?", "Which Phase 9 index type would speed up the `WHERE date >= ...` query in the anomaly detection SQL?").
- [ ] [P2][O:Glossary] Add a Glossary linking back to the source lessons for all cross-phase terms: MAPE, Isolation Forest, Lag Feature, Rolling Average, GradientBoostingRegressor, TimeSeriesSplit, MView (Day 97), GIN Index (Day 98).
- [ ] [P2][N:Thread] Connect the capstone explicitly to the Incident Drill Track: "The anomaly detection system you built in Milestone 4 IS the detection layer in Drill 2 (Severity 1). Extend your capstone to generate a pg_audit log of which analyst ran which query — completing the compliance circle."

---

## Day 108C — Cloud-Native SQL: BigQuery ML, Snowflake Cortex & Redshift ML

**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/Day_108C_Cloud_Native_SQL/README.md`

**Assessment:** Day 108C is the strongest lesson in Phase 9 by a wide margin. The "Never-Coded" bridge (traditional ML workflow vs a single SQL `CREATE MODEL` statement) is the most compelling analogy in the phase. The BigQuery ML workflow (train → evaluate → predict → explain → forecast) is shown end-to-end with annotated SQL. The platform comparison table is genuine decision-guidance material. The "$ mindset" FinOps section with concrete cost numbers ($291/year reduced to $0.73) is outstanding MBA-framing. Mastery-check answers are 3–6 sentence paragraphs, substantially better than all other lessons. Gaps: no quiz.json, no glossary, lab exercises are SQL scaffolding with no schemas or expected outputs, the `LIMIT` cost myth (buried in a code comment on line 170) deserves a formal pitfall callout, and the BigQuery Reservation/Slot-commitment model vs on-demand pricing is mentioned in Exercise 3 but not explained in the content body.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create `quiz.json` with the five existing mastery questions plus explanations — they are already well-written; the missing piece is the JSON file itself.
- [ ] [P0][O:Glossary] Add Glossary: BigQuery ML (BQML), ML.EVALUATE, ML.PREDICT, ML.EXPLAIN_PREDICT, ARIMA+, Partition Pruning, Clustering (BigQuery), Snowflake Cortex, CORTEX.SENTIMENT, CORTEX.COMPLETE, Redshift ML, SageMaker Autopilot, Slot Commitment, On-Demand Pricing, FinOps.
- [ ] [P0][C:Lab] Exercise 1: provide a `CREATE TABLE ml_dataset.telecom_customers (...)` DDL with sample INSERT data (5–10 rows) so learners can verify syntax without needing a live BigQuery project; add **Expected result** of `ML.EVALUATE` — a table with column headers `precision | recall | accuracy | f1_score | roc_auc`.
- [ ] [P0][C:Lab] Exercise 2: provide the full Snowflake pipeline SQL (not just descriptions) for the `CREATE TABLE AS` step and the final summary view with the `needs_attention` flag, and show **Expected result** schema.
- [ ] [P1][H:Pitfalls] Promote the `LIMIT` cost-myth note from a code comment (`-- LIMIT does NOT reduce bytes scanned in BigQuery!`) into a prominent named `> ⚠️ Pitfall: LIMIT Does Not Save Money in BigQuery` callout block — this is the #1 BigQuery misconception for SQL-trained analysts and currently risks being skimmed over.
- [ ] [P1][A:Concept] Explain **Slot Commitments vs On-Demand pricing** in the content body (not just in Exercise 3): "On-demand: $5–7/TB scanned, pay-as-you-go. Slot commitments: reserve 100–500 compute slots for a flat monthly fee — better for predictable, high-volume workloads. Break-even is typically around 2–3 TB scanned per day."
- [ ] [P1][K:Xref] Day 108C's prerequisites list `[108, "108B"]` but Day 108 closes with "You have completed Phase 9" — this structural inconsistency in the phase ordering should be resolved by resequencing or updating Day 108's summary line (see Day 108 stub above).
- [ ] [P2][M:Coverage] Add a brief section on **dbt + BigQuery** integration — the combination of dbt (for SQL transformations) and BigQuery ML (for modelling) is the dominant modern analytics stack and directly extends the capstone project's SQL KPI queries.
- [ ] [P2][E:Framing] The FinOps section is excellent — add a comparable cost case study for Snowflake (warehouse credits) and Redshift (reserved node pricing) so all three platforms are equally framed for MBA budget conversations.
- [ ] [P2][N:Thread] Connect explicitly to Phase 9 topics: "The Materialized View we built in Day 97 maps directly to BigQuery's `CREATE MATERIALIZED VIEW ... PARTITIONED BY` syntax shown here — the concept is identical, the DDL differs only in partition clause."
