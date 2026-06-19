# Gap Analysis — Phase 08: SQL Mastery & Database Architecture

> Audited against the Phase 1 Quality Bar. See [GAP_ANALYSIS.md](../../GAP_ANALYSIS.md) for the full rubric, gap taxonomy, and severity legend.

## Phase summary

Phase 08 has consistently complete frontmatter, approachable analogies, business-flavored scenarios, senior callouts, mastery checks, and summaries, but most lessons compress advanced concepts into claims and snippets rather than teaching queries line-by-line or providing reproducible labs. The sequence is the largest structural problem: Advanced SQL, cloud optimization, governance, and two capstone days appear on Days 90–95 before relational internals and the DDL/DML/DQL/JOIN/subquery foundations on Days 96–101. No audited lesson has a `quiz.json`, and none has a glossary; sample schemas/data and expected result sets are also missing from most SQL exercises.

**Recurring gaps in this phase:**

- Advanced material and the capstone precede the foundational relational, DDL, DML, DQL, JOIN, and subquery lessons needed to understand them.
- SQL and Python blocks are usually introduced by a label or goal, but are not explained line-by-line and often omit dialect/version assumptions.
- Labs rarely provide a complete runnable schema, seed data, explicit steps, and a concrete expected result set or verification query.
- Mastery checks live only in README files; all 14 lesson directories lack `quiz.json` files with answer explanations.
- Glossaries are absent, and recurring ride-sharing/capstone work is not carried consistently through the phase.
- Production topics are mentioned but need deeper coverage of failure modes, observability, security, cost, and decision thresholds.

**Lessons audited:** 14

---

## Day 90 — Advanced SQL Patterns

**Path:** `content/lessons/Phase_08_SQL_Mastery_Database_Architecture/Day_90_Advanced_SQL/README.md`

**Assessment:** The family-tree and Russian-doll bridges make recursion and JSON approachable, and the lesson includes useful senior warnings about schemaless data and recursion safety. However, it begins with recursive CTEs, JSON operators, and lateral joins before this phase teaches relational foundations, joins, and subqueries; its recursive query is introduced only as “**Syntax**,” several blocks receive no line-by-line explanation, and the labs do not supply complete schemas or expected tabular results. The summary also admits that “**Array Aggregates: Pack rows into lists (not covered in detail, but related to JSON)**” despite listing array aggregates as a concept.

**Gap task stubs:**

- [ ] [P0][K:Xref] Move this lesson after Days 96–101 or add explicit prerequisite links and a remediation path to relational databases, JOINs, CTEs, and subqueries; “Intermediate SQL (Joins, Window Functions)” does not resolve the phase’s inverted sequence.
- [ ] [P0][M:Coverage] Add the promised array-aggregate lesson content, including `ARRAY_AGG`, ordering, null behavior, use cases, and tradeoffs; the summary explicitly says it is “not covered in detail.”
- [ ] [P1][B:CodeCtx] Expand the recursive CTE, JSON, and lateral-join blocks into line-by-line walkthroughs explaining anchor/recursive members, alias scope, termination, `->` versus `->>`, and why `LIMIT 3` belongs inside the lateral subquery.
- [ ] [P1][C:Lab] Make all three exercises runnable with `CREATE TABLE`/seed statements, dialect assumptions, step-by-step tasks, and expected result sets such as the exact three-row Alice → VP → CEO chain.
- [ ] [P1][A:Concept] Define CTE, hierarchy, functional index, lateral/correlated execution, and index ordering; justify the magic guards and targets in “`WHERE level < 20`,” “Top 3,” and `LIMIT 2`.
- [ ] [P1][H:Pitfalls] Add cycle detection using a visited path, recursion-depth behavior by database, JSON missing-key/type errors, and lateral-join row explosion warnings.
- [ ] [P2][O:Glossary] Add a lesson glossary for anchor member, recursive member, CTE, JSON blob, functional index, lateral join, correlation, and hierarchy.
- [ ] [P1][L:Quiz] Add `quiz.json` mirroring the five mastery questions with explanations for correct and incorrect options.

---

## Day 91 — Cloud Architecture & Optimization

**Path:** `content/lessons/Phase_08_SQL_Mastery_Database_Architecture/Day_91_BI_Cloud/README.md`

**Assessment:** The encyclopedia/filing-cabinet analogy and physical-design tradeoffs provide strong intuition and MBA-relevant cost framing. Still, assertions such as “**Reads only 1/365th of the data. 99.7% cost saving**,” “**BigQuery gives you 2000 ‘Slots’**,” and “**Trade 0.1% accuracy for 99% speed**” are presented as universal facts without assumptions, measurement steps, or vendor distinctions. The labs describe outcomes rather than giving reproducible datasets, execution-plan evidence, and expected results.

**Gap task stubs:**

- [ ] [P0][K:Xref] Re-sequence this lesson after DQL/indexing and relational fundamentals, or link directly to Days 91 and 94 before asking learners to tune scans, clustering, and execution plans.
- [ ] [P1][A:Concept] Qualify and justify “1/365th,” “99.7%,” “2000 Slots,” 400MB blocks, “0.1% accuracy,” and “99% speed”; explain that results depend on engine, pricing model, data distribution, and query shape.
- [ ] [P1][F:Tables] Add a decision-guidance table comparing partitioning, clustering, indexes, materialized views, and duplicated projections by workload, selectivity, maintenance cost, and vendor support.
- [ ] [P1][C:Lab] Provide runnable BigQuery/Snowflake/Postgres variants, sample table definitions and data volume, exact queries, bytes-scanned/plan capture steps, and before/after expected metrics.
- [ ] [P1][M:Coverage] Add materialized-view refresh modes, staleness/SLA choices, incremental-refresh limitations, warehouse sizing, cache effects, and cost-governance controls.
- [ ] [P1][H:Pitfalls] Cover partition filters that disable pruning, too many tiny partitions, clustering-key decay, skew, and benchmark warm-cache bias.
- [ ] [P2][O:Glossary] Add a glossary for partition pruning, clustering, cardinality, micro-partition, slot, materialized view, skew, projection, and HyperLogLog.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained answers and vendor-neutral wording.

---

## Day 92 — Technical Data Governance & Security

**Path:** `content/lessons/Phase_08_SQL_Mastery_Database_Architecture/Day_92_Data_Governance/README.md`

**Assessment:** The office-badge bridge clearly distinguishes authentication, authorization, and RLS, while the least-privilege and audit-log sections supply valuable production framing. However, the SQL uses generic or questionable syntax without naming a platform, crypto-shredding is summarized as “**Delete Key X**” and “**No need to find every backup tape**” without legal/operational nuance, and the anonymization lab simply changes PII to fixed strings without addressing uniqueness, re-identification, or verification. Exercises lack setup data and expected results for each role.

**Gap task stubs:**

- [ ] [P0][M:Coverage] Correct and deepen GDPR/deletion coverage: distinguish deletion, anonymization, pseudonymization, legal retention, backups, key lifecycle, and evidence of erasure; qualify “No need to find every backup tape.”
- [ ] [P1][B:CodeCtx] State the database dialect for `GROUP analysts`, `session_user_id()`, and policy syntax, then explain every GRANT/REVOKE/view line and why a view is not equivalent to native RLS in all threat models.
- [ ] [P1][C:Lab] Add users/roles, schemas, employee rows, test sessions, expected visible-row sets, denied-operation outputs, and an audit-log verification step for every exercise.
- [ ] [P1][H:Pitfalls] Add RLS bypass/owner behavior, privilege inheritance, inference through aggregates, shared-account risks, masking limitations, and fixed-value anonymization collisions.
- [ ] [P1][A:Concept] Define PII, tokenization, hashing, encryption, masking, anonymization, and referential integrity, including when each control is appropriate.
- [ ] [P1][K:Xref] Link the RLS and deletion exercises to later DDL/DML lessons, or move governance after learners can create schemas, views, and safe updates.
- [ ] [P2][O:Glossary] Add a glossary for authentication, authorization, RBAC, RLS, PII, masking, crypto-shredding, anonymization, and least privilege.
- [ ] [P1][L:Quiz] Add `quiz.json` with explanations and scenario-based governance choices.

---

## Day 93 — Capstone Part 1: Design & Architecture

**Path:** `content/lessons/Phase_08_SQL_Mastery_Database_Architecture/Day_93_Capstone_Part_1/README.md`

**Assessment:** This lesson offers a useful blueprint analogy, a compact design-document framework, an engine-selection table, and an architecture decision-log requirement. Yet the capstone begins before the phase teaches relational internals and DDL/DML/DQL/JOIN/subquery fundamentals, and the “Hands-on Lab” mostly supplies the solution (“**Real-Time Geolocation: Postgres + PostGIS ... Or Redis**”) instead of a deliverable-driven exercise with evaluation criteria. The recommendation table is helpful but too categorical for architecture decisions.

**Gap task stubs:**

- [ ] [P0][K:Xref] Move the capstone after Day 101C or add a staged prerequisite/remediation checklist; “Phase 8 Concepts (Days 90-92)” excludes the core lessons required to design a defensible schema.
- [ ] [P1][C:Lab] Turn the ride-sharing brief into an assessed capstone specification with required artifacts, sample workload/data, acceptance tests, expected ERD elements, query SLAs, cost ceiling, and scoring rubric.
- [ ] [P1][F:Tables] Expand the engine table with decision guidance for consistency, latency, access patterns, operational skills, lock-in, cost, and rejected alternatives; avoid one-engine-per-use-case prescriptions.
- [ ] [P1][A:Concept] Define ERD, shard key, hotspot, columnar, spatial index, event stream, and CAP before asking learners to use them.
- [ ] [P1][M:Coverage] Add normalization and denormalization decisions, data ownership, failure modes, capacity estimates, disaster recovery, migration strategy, and privacy threat modeling.
- [ ] [P1][N:Thread] Establish the ride-sharing design as the recurring project and explicitly carry its artifacts into Days 94–101C rather than abandoning it after implementation.
- [ ] [P2][O:Glossary] Add a glossary for TDD, ERD, sharding, partitioning, hotspot, monolith, columnar store, and CAP theorem.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained tradeoff questions rather than only single-tool answers.

---

## Day 94 — Capstone Part 2: Implementation

**Path:** `content/lessons/Phase_08_SQL_Mastery_Database_Architecture/Day_94_Capstone_Part_2/README.md`

**Assessment:** The construction analogy, constraints overview, indexing tradeoff, and expand/contract mention are good foundations for production thinking. The implementation is not a complete capstone, though: it creates only `drivers` and `trips`, the Faker script generates drivers rather than the promised “**1M rows**,” and the optimization numbers (“**Cost: 500. Time: 200ms**” to “**Cost: 50. Time: 10ms**”) are asserted without a runnable benchmark or expected plan. It also appears before the dedicated DDL, DML, DQL, JOIN, and subquery lessons.

**Gap task stubs:**

- [ ] [P0][K:Xref] Re-sequence implementation after Days 97–101 or explicitly teach/link every DDL, DML, query-plan, and indexing prerequisite used here.
- [ ] [P0][C:Lab] Supply a complete runnable capstone: environment setup, full Day 93 schema, deterministic seed script, 1M-row workload, required queries, expected outputs/plans, stress-test steps, and acceptance rubric.
- [ ] [P1][D:Objectives] Reconcile the outcome “Write a Python Script to seed 1M rows” with the lab goal “Generate 100k rows,” and make the target measurable.
- [ ] [P1][B:CodeCtx] Explain the DDL and Python blocks line-by-line, including `SERIAL`, decimal precision, foreign-key actions, escaping, Faker dependency setup, and why row-at-a-time SQL generation is chosen.
- [ ] [P1][A:Concept] Justify 100k/1M rows, rating/fare precision, 30k London rows, costs, and timing claims; distinguish planner cost from elapsed milliseconds.
- [ ] [P1][M:Coverage] Add transactions, batch inserts/COPY, query-plan interpretation, index selectivity, migrations/rollback, backups, monitoring, and load-testing methodology.
- [ ] [P1][N:Thread] Require implementation of the riders, GPS, historical archive, ingestion, governance, and KPI decisions established on Day 93, not just two tables.
- [ ] [P2][O:Glossary] Add a glossary for constraint, DDL, ETL, seed data, selectivity, bitmap scan, migration, and expand/contract.
- [ ] [P1][L:Quiz] Add `quiz.json`; also correct the mastery typo “`DROP COLUMM`.”

---

## Day 95 — Technical Interview Workshop

**Path:** `content/lessons/Phase_08_SQL_Mastery_Database_Architecture/Day_95_Career_Workshop/README.md`

**Assessment:** The chef-audition bridge, narration advice, four-S framework, tradeoff emphasis, and STAR exercise make this a practical career lesson. Its SQL interview section is too compressed: `PERCENTILE_CONT`, `LEAD`/`LAG`, and the gaps-and-islands query are shown without schema, walkthrough, expected result set, or dialect caveats, while the title promises “**Technical Interview WorkShop**” and outcomes promise a median calculation but no corresponding lab. Several system-design numbers are ungrounded.

**Gap task stubs:**

- [ ] [P0][K:Xref] Move the workshop after the core SQL lessons or add a preparation map to Days 96–101; interviewing learners on advanced SQL before teaching fundamentals reinforces the sequencing problem.
- [ ] [P1][C:Lab] Add complete interview drills for median, consecutive logins, gaps/islands, and system design with schemas/data, timeboxes, expected outputs, interviewer rubrics, and explained model solutions.
- [ ] [P1][B:CodeCtx] Explain the gaps-and-islands query line-by-line, including correlated `NOT EXISTS`, boundary handling, aliases, and why it returns only missing starts rather than arbitrary missing ranges.
- [ ] [P1][A:Concept] Justify “1M req/s,” 10-second flushes, “+5000 likes,” first-seven-character hash choice, and “0.1% click rate”; define collision handling and eventual consistency.
- [ ] [P1][M:Coverage] Add requirements estimation, hash collisions, idempotency, cache failure, consistency/reconciliation, behavioral follow-ups, and negotiation ethics/total compensation.
- [ ] [P1][N:Thread] Require learners to turn Phase 08 capstone decisions and incidents into system-design and STAR stories, creating a portfolio/interview thread.
- [ ] [P2][O:Glossary] Add a glossary for whiteboarding, percentile, gaps and islands, cache, buffer, eventual consistency, and STAR.
- [ ] [P1][L:Quiz] Add `quiz.json` with explanations and remove joke distractors that do not test interview readiness.

---

## Day 96 — Relational Database Internals

**Path:** `content/lessons/Phase_08_SQL_Mastery_Database_Architecture/Day_96_Relational_Databases/README.md`

**Assessment:** The bank-vault and snapshot analogies explain ACID and MVCC clearly, and the deadlock/VACUUM sections introduce meaningful production concerns. However, this foundational relational lesson arrives after the advanced SQL/cloud/governance/capstone sequence, isolation levels are oversimplified, and the labs omit setup schemas, initial values, session configuration, cleanup, and precise expected outputs. Claims such as “**Serializable: Strict Execution. Slowest**” and WAL recovery “**I’ll finish it now**” need technical qualification.

**Gap task stubs:**

- [ ] [P0][K:Xref] Move relational internals before Days 90–95 and add forward links from ACID/MVCC/WAL/isolation to governance, capstone, DML, and query-tuning lessons.
- [ ] [P1][A:Concept] Correct and deepen isolation/WAL explanations: define anomalies, snapshots, locks, checkpoints, redo/undo behavior, and qualify “Serializable: Strict Execution. Slowest.”
- [ ] [P1][C:Lab] Provide runnable Postgres setup, initial user/account data, two-session instructions, exact expected values/errors, rollback/cleanup, and observation queries for locks/dead tuples.
- [ ] [P1][M:Coverage] Add normalization (1NF–3NF), keys and relationships, transaction boundaries, phantom/nonrepeatable reads, optimistic retries, WAL archiving/PITR, and autovacuum monitoring.
- [ ] [P1][H:Pitfalls] Cover long-running transactions, transaction-ID wraparound prevention, lock timeouts, deadlock retries, and durability tradeoffs beyond “Never do this in prod.”
- [ ] [P1][I:Senior] Add production diagnostic queries and a decision guide for isolation levels tied to checkout, reporting, and financial workloads.
- [ ] [P2][O:Glossary] Add a glossary for ACID, MVCC, WAL, dirty read, snapshot, dead tuple, VACUUM, deadlock, and isolation.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained anomaly and recovery scenarios.

---

## Day 97 — Advanced DDL & Schema

**Path:** `content/lessons/Phase_08_SQL_Mastery_Database_Architecture/Day_97_Data_Definition_Language/README.md`

**Assessment:** The hotel-book analogy effectively motivates exclusion constraints, and the app-vs-database logic discussion gives useful decision guidance. But the lesson is explicitly “Advanced DDL” while requiring only “Basic CREATE TABLE,” and it never teaches the broader DDL/schema fundamentals or normalization needed for database architecture. The three SQL labs provide snippets without complete support tables, seed data, verification queries, expected result sets, or line-by-line explanations.

**Gap task stubs:**

- [ ] [P0][M:Coverage] Add foundational schema design and normalization coverage—entities, keys, relationships, 1NF/2NF/3NF, data types, nullability, defaults, naming, and referential actions—before advanced partitioning/triggers.
- [ ] [P1][B:CodeCtx] Explain every exclusion, trigger, and partition statement line-by-line, including `btree_gist`, `TSTZRANGE`, half-open ranges, `OLD`/`NEW`, trigger timing, and partition routing.
- [ ] [P1][C:Lab] Add complete `accounts`/`audit_log` schemas and seed rows, exact booking success/failure outputs, partition verification queries, expected audit rows, and cleanup steps.
- [ ] [P1][A:Concept] Define race condition, scalar type, GiST, range operators, procedure, function, trigger, partition bound, and default partition.
- [ ] [P1][H:Pitfalls] Cover trigger recursion/hidden side effects, privilege/security-definer risks, missing/default partitions, partition-key updates, and extension portability.
- [ ] [P1][F:Tables] Add decision guidance comparing constraints, triggers, procedures, and application validation by invariant type, concurrency safety, testability, and portability.
- [ ] [P2][O:Glossary] Add a glossary for DDL, normalization, exclusion constraint, GiST, trigger, procedure, function, and partition.
- [ ] [P1][L:Quiz] Add `quiz.json` with explanations and dialect-specific caveats.

---

## Day 98 — Advanced DML & Upserts

**Path:** `content/lessons/Phase_08_SQL_Mastery_Database_Architecture/Day_98_Data_Manipulation_Language/README.md`

**Assessment:** The guest-list and moving-van analogies are accessible, while modifying CTEs and savepoints expose learners to valuable advanced patterns. The lesson incorrectly implies the shown counter upsert is idempotent—“**Runs safely 100 times**” is safe to execute but increments 100 times—and the recommendation to drop indexes for bulk load is presented without concurrency/constraint/recovery caveats. Labs again lack complete schemas, initial data, expected tables, and operational verification.

**Gap task stubs:**

- [ ] [P0][A:Concept] Correct the idempotency explanation: distinguish retry safety from an incrementing upsert, show an idempotency-key pattern, and revise “Runs safely 100 times.”
- [ ] [P1][C:Lab] Provide schemas, seed state, transaction/session steps, exact before/after result sets, failure outputs, and verification/cleanup for upsert, archive, and savepoint exercises.
- [ ] [P1][B:CodeCtx] Walk through `ON CONFLICT`, `EXCLUDED`, modifying CTE execution, `RETURNING`, interval arithmetic, and savepoint state line-by-line.
- [ ] [P1][M:Coverage] Add `UPDATE`, `DELETE`, `MERGE`, transaction boundaries, locking/concurrent upserts, batch sizing, COPY error handling, and safe archival/retention design.
- [ ] [P1][H:Pitfalls] Qualify “DROP INDEX” advice with uniqueness/FK implications, concurrent readers, disk/WAL needs, recovery plan, and alternatives such as staging tables.
- [ ] [P1][A:Concept] Justify “30 days,” “1 Billion rows,” and “10x-100x faster”; define idempotency, atomicity, savepoint, conflict target, and batch.
- [ ] [P2][O:Glossary] Add a glossary for DML, upsert, idempotency, conflict target, `EXCLUDED`, bulk load, savepoint, and atomicity.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained concurrency and retry scenarios.

---

## Day 99 — Advanced DQL & Optimization

**Path:** `content/lessons/Phase_08_SQL_Mastery_Database_Architecture/Day_99_Data_Query_Language/README.md`

**Assessment:** The librarian analogy gives a strong conceptual comparison of scan types, and the lesson usefully introduces SARGability and covering indexes. It is not a complete DQL lesson, however: learners never receive foundational SELECT/filter/group/order semantics, sample schemas/data, or a method for interpreting a plan tree. The statement “**Cost: Arbitrary units (1.0 = reading one 8kb page)**” and thresholds such as “**> 20%**” are overly exact and need qualification.

**Gap task stubs:**

- [ ] [P0][M:Coverage] Add DQL foundations and logical query-processing order (`FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`, `LIMIT`) before advanced optimization.
- [ ] [P1][A:Concept] Correct/qualify planner-cost units, 8KB page assumptions, selectivity thresholds, visibility-map requirements for index-only scans, and the phrase “Holy Grail.”
- [ ] [P1][C:Lab] Supply orders/users schemas, deterministic data with meaningful cardinality, `ANALYZE` steps, expected plans/results, before/after timing protocol, and plan-node interpretation prompts.
- [ ] [P1][B:CodeCtx] Explain each query/index block line-by-line and teach learners to read plan trees bottom-up, compare estimates to actuals, and identify loops/misestimates.
- [ ] [P1][H:Pitfalls] Add stale statistics, parameter sensitivity, cache effects, write amplification, unused indexes, expression indexes, and `BETWEEN` timestamp-boundary risks.
- [ ] [P1][F:Tables] Add decision guidance for sequential, index, bitmap, and index-only scans by selectivity, table size, ordering, and write cost.
- [ ] [P2][O:Glossary] Add a glossary for DQL, optimizer, cost, cardinality, selectivity, SARGable, heap, covering index, and visibility map.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained plan-reading questions.

---

## Day 100 — Advanced Joins & Algorithms

**Path:** `content/lessons/Phase_08_SQL_Mastery_Database_Architecture/Day_100_Joins/README.md`

**Assessment:** The wedding-seating analogy and algorithm tradeoffs help demystify physical joins, and the Cartesian-explosion warning is valuable. Yet the lesson assumes “Basic INNER/LEFT JOIN” without conceptually defining INNER, LEFT, RIGHT, FULL, CROSS, and SELF joins or their result shapes, and its labs do not include schemas, seed data, expected result sets, or a complete zero-sales query. The “Hash Join puts all NULLs into one bucket” explanation is also too broad for SQL equi-joins, where null equality semantics matter.

**Gap task stubs:**

- [ ] [P0][M:Coverage] Add conceptual definitions, Venn/result-set examples, and decision guidance for INNER, LEFT, RIGHT, FULL OUTER, CROSS, SEMI, ANTI, and SELF joins before physical algorithms.
- [ ] [P0][A:Concept] Correct/qualify the NULL-skew explanation and distinguish SQL null matching, distributed partition skew, and engine-specific hash behavior.
- [ ] [P1][C:Lab] Add complete products/sales/users schemas and seed data, finish the calendar × products × sales query, provide expected rows, and include plan/timing comparison steps.
- [ ] [P1][B:CodeCtx] Explain the self-join and plan-forcing blocks line-by-line, including aliases, duplicate-pair elimination, why `u1.id < u2.id` works, and why forcing algorithms is diagnostic only.
- [ ] [P1][F:Tables] Add a “when to choose/expect” table for logical join types and physical algorithms, including ordering, indexes, memory, scale, and output-preservation rules.
- [ ] [P1][H:Pitfalls] Cover many-to-many fanout, duplicate keys, null-preserving filters accidentally turning LEFT into INNER, join-order effects, spills, and disabled planner settings left active.
- [ ] [P2][O:Glossary] Add a glossary for equi-join, nested loop, hash join, merge join, skew, broadcast, shuffle, fanout, and Cartesian product.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained logical-join and algorithm-selection scenarios.

---

## Day 101 — Advanced Subqueries

**Path:** `content/lessons/Phase_08_SQL_Mastery_Database_Architecture/Day_101_Subqueries/README.md`

**Assessment:** The teacher/grading analogy clearly contrasts correlated and uncorrelated subqueries, and the NULL trap is an important topic. The lesson overstates several performance rules—“**Correlated ... Slow. ... O(N^2)**,” “**Always prefer EXISTS**,” and “**Joins are fast**”—without acknowledging optimizer rewrites, indexes, semantics, or cases where `IN` is appropriate. Labs omit full schemas/seed SQL and only one exercise states an expected result.

**Gap task stubs:**

- [ ] [P0][A:Concept] Replace absolute claims (“O(N^2),” “Always prefer EXISTS,” “Joins are fast”) with semantics-first guidance and engine/plan-dependent performance analysis.
- [ ] [P1][C:Lab] Add runnable products/category/A/B schemas and seed data, expected result sets for both original and rewritten queries, `EXPLAIN ANALYZE` comparison, and a correct `NOT EXISTS` solution.
- [ ] [P1][B:CodeCtx] Explain correlated references, scalar cardinality, CTE aggregation, join matching, three-valued logic, and `SELECT 1` line-by-line.
- [ ] [P1][M:Coverage] Add scalar/multirow subquery errors, semi/anti joins, `ANY`/`ALL`, correlated `LATERAL`, duplicate semantics, null-safe alternatives, and optimizer decorrelation limits.
- [ ] [P1][H:Pitfalls] Cover `NOT EXISTS` correlation mistakes, duplicate multiplication in rewrites, scalar subqueries returning multiple rows, and semantic differences between JOIN and EXISTS.
- [ ] [P1][K:Xref] Add explicit links back to Day 100 JOIN semantics and Day 99 plan reading before asking learners to rewrite and benchmark subqueries.
- [ ] [P2][O:Glossary] Add a glossary for subquery, correlation, scalar, semi-join, anti-join, three-valued logic, unnesting, and short-circuiting.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained null and rewrite scenarios.

---

## Day 101B — NoSQL Deep Dive

**Path:** `content/lessons/Phase_08_SQL_Mastery_Database_Architecture/Day_101B_NoSQL_Deep_Dive/README.md`

**Assessment:** This is one of the phase’s richer lessons: it provides a strong business bridge, substantial MongoDB/Redis/Cassandra examples, a decision framework, and explained mastery answers. Nonetheless, key claims are misleading or overly broad: “**You can only guarantee two**,” “**Redis stores data in-memory — nanosecond latency**,” and the CAP labels for products/configurations need qualification. Code blocks are large but not walked through line-by-line, and coding labs provide starter code without expected outputs, environment setup, or test criteria.

**Gap task stubs:**

- [ ] [P0][A:Concept] Correct and qualify CAP and latency claims: explain CAP under network partitions, consistency models/configurations, PACELC, persistence, and why application-observed Redis latency is not simply “nanosecond.”
- [ ] [P1][B:CodeCtx] Add what/why preambles and line-by-line explanations for the Mongo aggregation, Redis cache-aside/decorator, and Cassandra partition/clustering-key blocks.
- [ ] [P1][C:Lab] Provide Docker/setup instructions, dependency versions, seed/load steps, expected aggregation/cache results, automated checks, and cleanup for MongoDB and Redis exercises.
- [ ] [P1][F:Tables] Replace the terse decision tree with a decision table covering access pattern, consistency, latency, durability, joins, operational burden, cost, and failure behavior.
- [ ] [P1][M:Coverage] Add MongoDB schema validation/indexes/transactions, Redis eviction/cache invalidation/durability, Cassandra consistency levels/tombstones/hot partitions, and polyglot-data synchronization.
- [ ] [P1][H:Pitfalls] Add cache stampede, stale reads, split-brain/configuration risk, unbounded document growth, secondary-index limits, and denormalized-write consistency.
- [ ] [P2][O:Glossary] Add a glossary for document store, BSON, key-value, wide-column, CAP, eventual consistency, partition key, clustering key, TTL, and cache-aside.
- [ ] [P1][L:Quiz] Add `quiz.json` mirroring the strong README mastery explanations.
- [ ] [P1][K:Xref] Correct the “Tomorrow → Day 97B” preview to match the actual Day 101C lesson and link it directly.

---

## Day 101C — Streaming SQL Fundamentals

**Path:** `content/lessons/Phase_08_SQL_Mastery_Database_Architecture/Day_101C_Streaming_SQL_Fundamentals/README.md`

**Assessment:** This is the most developed lesson in the phase, with a compelling fraud bridge, business-context table, substantial Kafka/ksqlDB examples, senior pitfalls, and explained mastery answers. Even so, large Python and SQL blocks are not explained line-by-line, the labs are mostly design/TODO prompts without runnable infrastructure, sample events, expected output streams, or verification steps, and several magic thresholds (`$200`, 1/5/30-minute windows, 30%/15%, >1,000 events/s) are not justified. The sequence/preview metadata is inconsistent with Day 101B and the stated next phase.

**Gap task stubs:**

- [ ] [P0][C:Lab] Add a runnable local Kafka/ksqlDB environment, topic creation, sample event fixtures, exact commands, expected output records/windows, automated verification, and teardown for all three exercises.
- [ ] [P1][B:CodeCtx] Break the producer, consumer, stream/table, and window-query blocks into line-by-line walkthroughs explaining keys, serializers, offsets, commits, partition ordering, `EMIT`, and materialization.
- [ ] [P1][A:Concept] Define and justify the thresholds and magic numbers in high-value orders, windows, TTL/retention, conversion rates, anomaly limits, and the architecture recommendation function.
- [ ] [P1][M:Coverage] Add delivery guarantees, idempotent consumers, transactions, consumer lag/rebalancing, dead-letter queues, replay/backfills, schema registry compatibility, state-store recovery, and stream-table joins.
- [ ] [P1][F:Tables] Enhance the MBA table with decision guidance and measurable ROI assumptions, total operating cost, false-positive risk, and when batch/micro-batch is preferable.
- [ ] [P1][H:Pitfalls] Turn the commented “Streaming Pitfalls” into operational playbooks with failure symptoms, metrics/alerts, mitigations, and verification steps.
- [ ] [P1][K:Xref] Reconcile Day 101B’s “Day 97B” preview, Day 101C’s actual numbering, and the “Next: Phase 9” preview; add direct links to prerequisite lessons and the capstone.
- [ ] [P1][N:Thread] Add a capstone extension that streams the ride-sharing GPS/trip events designed on Days 93–94 and measures the declared KPI/SLA.
- [ ] [P2][O:Glossary] Add a glossary for topic, partition, offset, consumer group, watermark/lateness, window, materialized table, replay, and delivery semantics.
- [ ] [P1][L:Quiz] Add `quiz.json` mirroring the detailed README mastery explanations.
