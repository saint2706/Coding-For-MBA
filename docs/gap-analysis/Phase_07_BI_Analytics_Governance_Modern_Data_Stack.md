# Gap Analysis — Phase 07: BI, Analytics, Governance & Modern Data Stack

> Audited against the Phase 1 Quality Bar. See [GAP_ANALYSIS.md](../../GAP_ANALYSIS.md) for the full rubric, gap taxonomy, and severity legend.

## Phase summary

Phase 07 has unusually consistent scaffolding—complete frontmatter, a never-coded bridge, business framing, senior insights, three exercises, explained mastery checks, and summaries—but most lessons are concise surveys rather than production-ready instruction. The recurring weaknesses are absent `quiz.json` files and glossaries, labs without supplied datasets or verifiable expected outputs, weak cross-lesson/capstone continuity, and substantial missing modern-practice coverage. `extras/README.md` is a supplementary-materials index and quick-start, not a lesson, so it was reviewed but not counted; Days 68–72 overlap Phase 6 numbering and therefore create a K:Xref/navigation risk.

**Recurring gaps in this phase:**
- Every audited lesson directory lacks `quiz.json`, and every README lacks a dedicated glossary.
- Most labs provide prompts or completed examples instead of sample data, executable steps, and expected outputs that let learners verify their work.
- The capstone/recurring project thread appears late rather than carrying a single governed BI product through the phase.
- Several conceptual tables/examples describe options but do not give explicit decision criteria, trade-offs, or selection rules.
- Production topics—security, observability, testing, ownership, deployment, cost, and change management—need broader and deeper treatment.

**Lessons audited:** 19

---

## Day 68 — BI Analyst Foundations

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_68_BI_Analyst_Foundations/README.md`

**Assessment:** A strong Phase-1-like opener with a ship-dashboard bridge, business stakes, senior guidance, exercises, and explained mastery answers. However, the lab mostly gives the answer—such as “Definition A,” “Definition B,” and a finished CEO dashboard—rather than letting a learner work from data and verify an output, while the “BI Stack (ELT)” is too compressed to establish production foundations.

**Gap task stubs:**
- [ ] [P0][C:Lab] Rebuild Exercises 1–3 around a supplied events/sales dataset, explicit setup and execution steps, learner deliverables, and concrete expected metric/dashboard outputs instead of presenting completed answers such as “$1.2M Closed Revenue.”
- [ ] [P1][M:Coverage] Expand “The BI Stack (ELT)” with source systems, warehouse/lakehouse, orchestration, transformation, semantic layer, BI consumption, observability, and ownership boundaries.
- [ ] [P1][M:Coverage] Add metric-contract coverage: grain, inclusion/exclusion rules, time zone, late-arriving events, owners, certification, and change approval for the “Active User” example.
- [ ] [P1][N:Thread] Start a named phase-long e-commerce BI project and require learners to create its first stakeholder brief, metric definition, and dashboard sketch.
- [ ] [P1][L:Quiz] Add `quiz.json` with answer explanations aligned to the five mastery topics.
- [ ] [P2][O:Glossary] Add a glossary defining BI, KPI, ETL/ELT, warehouse, certified dataset, WAU, and single source of truth.

---

## Day 69 — BI Strategy & Stakeholders

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_69_BI_Strategy_and_Stakeholders/README.md`

**Assessment:** The translator analogy and “What decision will you make with that data?” framing are excellent for MBA learners, and the lesson gives practical stakeholder language. Yet its exercises again resolve their own scenarios, and the model-risk “Translation Lab” is an abrupt, unsupported assignment with no sample evidence, rubric, or expected memo.

**Gap task stubs:**
- [ ] [P0][C:Lab] Supply a realistic stakeholder-request packet, conflicting interview notes, data extract, prioritization rubric, steps, and an example expected one-page decision memo for the Translation Lab.
- [ ] [P1][M:Coverage] Add stakeholder mapping, decision-rights/RACI, intake SLAs, discovery interviews, requirements documentation, backlog scoring, and adoption measurement.
- [ ] [P1][A:Concept] Qualify “Behavior (Retention) is usually the most honest signal” by explaining when surveys, support data, and behavior are biased or measure different constructs.
- [ ] [P1][H:Pitfalls] Add a dedicated callout on confirmation bias, metric cherry-picking, executive pressure, and ethically saying no.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained scenario questions on clarification, prioritization, and stakeholder conflict.
- [ ] [P2][O:Glossary] Define vanity metric, actionable metric, root cause, BLUF, stakeholder, and 5 Whys.

---

## Day 70 — BI Metrics & Data Literacy

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_70_BI_Metrics_and_Data_Literacy/README.md`

**Assessment:** The weight-loss bridge, cohort framing, unit economics, Goodhart’s Law, and seasonality provide a useful conceptual survey. The treatment is nevertheless too formula-driven: “LTV = ARPU / Churn Rate” is presented without assumptions, the cohort exercise has no raw event data, and learners do not practice validating metric definitions against edge cases.

**Gap task stubs:**
- [ ] [P0][A:Concept] Expand the LTV/CAC formulas with assumptions, contribution margin, cohort vs predictive LTV, payback period, annual/monthly churn consistency, and worked counterexamples where `ARPU / Churn Rate` misleads.
- [ ] [P0][C:Lab] Provide transaction and activity-event sample data, steps to build a cohort matrix and unit-economics model, plus expected retention cells, ratios, and interpretation.
- [ ] [P1][M:Coverage] Add north-star metrics, guardrail/counter-metrics, metric trees, denominator bias, Simpson’s paradox, survivorship bias, and metric versioning.
- [ ] [P1][I:Senior] Add a production metric-review workflow covering owners, reconciliations, backfills, restatements, and executive sign-off.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained calculation and interpretation questions.
- [ ] [P2][O:Glossary] Define cohort, retention, ARPU, CAC, LTV, churn, leading/lagging indicator, and Goodhart’s Law.

---

## Day 71 — BI Data Landscape

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_71_BI_Data_Landscape/README.md`

**Assessment:** The lesson makes OLTP/OLAP, row/column storage, and ELT approachable and includes a useful star-schema prompt. Its “Modern Data Stack” is a narrow happy path, though, and the dbt lab offers only a tiny finished `SELECT` without showing how learners run, test, or inspect it.

**Gap task stubs:**
- [ ] [P0][C:Lab] Turn “Simple dbt Logic” into an executable mini-project with seed data, environment steps, commands, tests, and expected model rows/documentation output.
- [ ] [P1][M:Coverage] Add lake, warehouse, lakehouse, data mart, operational store, streaming, federated query, and build-vs-buy decision guidance.
- [ ] [P1][F:Tables] Add a decision table comparing OLTP, warehouse, lake, and lakehouse by workload, latency, governance, cost, and when not to use each.
- [ ] [P1][M:Coverage] Explain medallion/layered modeling, data contracts, catalog/lineage, observability, and how the named tools interoperate.
- [ ] [P1][L:Quiz] Add `quiz.json` with explanations.
- [ ] [P2][K:Xref] Add prerequisites and links to the earlier database lessons and forward links to Days 81–84C.
- [ ] [P2][O:Glossary] Add a glossary for OLTP, OLAP, row/columnar, lake, warehouse, lakehouse, star schema, and ELT.

---

## Day 72 — BI Data Formats & Ingestion

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_72_BI_Data_Formats_and_Ingestion/README.md`

**Assessment:** This is one of the more hands-on early lessons: it compares formats and shows API pagination and nested JSON. Still, most code blocks lack a full what/why/expected-result wrapper, and the ingestion pattern omits authentication, retries, incremental state, schema contracts, deduplication, and operational verification.

**Gap task stubs:**
- [ ] [P0][C:Lab] Provide runnable local API/JSON fixtures and expected flattened rows, page counts, checkpoints, and file-size comparisons for all exercises.
- [ ] [P1][B:CodeCtx] Add what/why preambles and expected outputs to every code block, especially the initial JSON snippet and pagination loop.
- [ ] [P1][M:Coverage] Add authentication/secrets, rate-limit backoff, retries, idempotency, incremental extraction/watermarks, CDC, webhooks, streaming, and dead-letter handling.
- [ ] [P1][M:Coverage] Add schema contracts/evolution, validation, quarantine, deduplication, late data, PII classification, and ingestion observability.
- [ ] [P1][F:Tables] Upgrade the format comparison into decision guidance covering row/column orientation, compression, schema, append/update behavior, interoperability, and cost.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained questions.
- [ ] [P2][O:Glossary] Define CSV, JSON, Parquet, API, pagination, rate limit, schema evolution, CDC, and compression.

---

## Day 73 — BI SQL & Databases

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_73_BI_SQL_and_Databases/README.md`

**Assessment:** The lesson gives accessible examples of windows, CTEs, indexing, and common BI calculations, with readable business use cases. But it jumps directly to query fragments; there is no sample schema/data, dialect declaration, execution path, or expected result table, and database-performance coverage is reduced largely to “Indexing.”

**Gap task stubs:**
- [ ] [P0][C:Lab] Supply runnable tables and seed rows for leaderboard, MoM growth, and moving average exercises, with exact expected result tables and edge cases for ties, missing months, and nulls.
- [ ] [P1][B:CodeCtx] Add what/why preambles, SQL dialect notes, and result previews to every SQL block, including the “Bad (Nested)” and “Good (Modular)” comparison.
- [ ] [P1][M:Coverage] Add query plans, partitioning/clustering, predicate pushdown, join strategies, cardinality, scan cost, materialized views, and warehouse-specific optimization.
- [ ] [P1][H:Pitfalls] Add production callouts on fanout/double counting, non-deterministic ranking, divide-by-zero, time zones, missing dates, and slowly changing dimensions.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained SQL/result questions.
- [ ] [P2][O:Glossary] Define window function, partition, frame, CTE, index, N+1, query plan, and cardinality.

---

## Day 74 — BI Data Preparation & Tools

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_74_BI_Data_Preparation_and_Tools/README.md`

**Assessment:** The laundry-folding bridge and unpivot/merge/append distinctions are clear and useful for spreadsheet-oriented learners. The lesson remains tool-agnostic to the point of being non-runnable: its exercises lack downloadable dirty data and expected cleaned outputs, while “Replace errors with 0” risks teaching unsafe remediation without business rules.

**Gap task stubs:**
- [ ] [P0][A:Concept] Replace blanket “Replace errors with 0” guidance with a decision framework for null, invalid, unknown, not-applicable, quarantine, imputation, and escalation.
- [ ] [P0][C:Lab] Add dirty CSV/Excel fixtures, Power Query and SQL/Python paths, step-by-step transformations, and expected cleaned tables/data-quality reports.
- [ ] [P1][M:Coverage] Add profiling, type inference, standardization, deduplication, entity resolution, reconciliation, lineage, reproducibility, and data-cleaning tests.
- [ ] [P1][F:Tables] Add decision guidance for merge vs append and Power Query vs SQL vs Python by volume, repeatability, governance, and user skill.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained scenarios.
- [ ] [P2][O:Glossary] Define wide/long, unpivot, append, merge, key, null, imputation, and pushdown.

---

## Day 75 — BI Visualization & Dashboard Principles

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_75_BI_Visualization_and_Dashboard_Principles/README.md`

**Assessment:** The lesson offers memorable principles—“If it doesn't help the user understand the data, delete it,” pre-attentive processing, chart selection, accessibility, and a scoring rubric. It lacks actual before/after visual artifacts and datasets, so the makeover and accessibility exercises cannot be objectively completed or compared.

**Gap task stubs:**
- [ ] [P0][C:Lab] Provide a flawed dashboard file/image plus source data, tool-specific remake steps, an accessible target artifact, and expected/rubric-scored output.
- [ ] [P1][M:Coverage] Add dashboard purpose/personas, analytical vs operational dashboards, interaction/filter design, mobile/responsive design, performance, freshness, and adoption telemetry.
- [ ] [P1][M:Coverage] Add uncertainty, confidence intervals, annotations, small multiples, misleading axes, map pitfalls, and ethical visualization.
- [ ] [P1][F:Tables] Expand chart selection into a decision matrix with question type, data shape, audience, caveats, and anti-patterns.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained visual critiques.
- [ ] [P2][O:Glossary] Define data-ink ratio, pre-attentive attribute, BAN, dual axis, granularity, and accessibility.

---

## Day 76 — BI Platforms & Automation Tools

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_76_BI_Platforms_and_Automation_Tools/README.md`

**Assessment:** Semantic layers, import/direct query, RLS, headless BI, TCO, and governance are the right platform-selection concepts. However, the exercises are conceptual placeholders—“Write a rule”—and there is no concrete platform comparison, automation implementation, sample identity model, or expected security test.

**Gap task stubs:**
- [ ] [P0][C:Lab] Create an executable RLS/semantic-model lab with users, roles, sample sales data, setup steps, test cases, and expected visible-row counts per role.
- [ ] [P1][M:Coverage] Add platform evaluation across Tableau, Power BI, Looker, and open-source/headless options, including licensing, embedding, APIs, governance, deployment, and lock-in.
- [ ] [P1][M:Coverage] Add CI/CD, version control, environments, service accounts, refresh orchestration, alerting, usage monitoring, and disaster recovery.
- [ ] [P1][F:Tables] Add a weighted decision matrix for import vs direct query and platform selection rather than descriptive trade-offs alone.
- [ ] [P1][H:Pitfalls] Add RLS leakage, cached-data exposure, export permissions, shared credentials, and entitlement-drift callouts.
- [ ] [P1][L:Quiz] Add `quiz.json` with explanations.
- [ ] [P2][O:Glossary] Define semantic layer, RLS, import, direct query, headless BI, TCO, and service account.

---

## Day 77 — BI Domain Analytics & Value Drivers

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_77_BI_Domain_Analytics_and_Value_Drivers/README.md`

**Assessment:** The lesson connects marketing, product, sales, finance, and operations metrics to value and strongly reinforces “Don't be a Chart Monkey.” Its formulas and three short exercises are too shallow for domain analytics: definitions, denominators, accounting treatment, attribution, and cross-functional metric conflicts are largely absent.

**Gap task stubs:**
- [ ] [P0][C:Lab] Supply a cross-functional company dataset and require a metric tree, funnel, inventory turn, churn/NRR calculations, reconciliation, recommendation, and expected outputs.
- [ ] [P1][M:Coverage] Add finance metrics (gross margin, cash conversion, variance), marketing attribution/ROAS, product activation/retention, sales coverage/win rate, and operations service levels.
- [ ] [P1][A:Concept] Define formulas with grains, periods, inclusions/exclusions, and caveats; explicitly distinguish logo vs revenue churn and bookings vs revenue.
- [ ] [P1][M:Coverage] Add metric trees and driver decomposition that connect operational levers to revenue, cost, risk, and cash flow.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained calculations and business decisions.
- [ ] [P2][O:Glossary] Define AARRR, CAC, activation, pipeline velocity, MRR, ARR, NRR, and inventory turn.

---

## Day 78 — BI Experimentation & Predictive Insights

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_78_BI_Experimentation_and_Predictive_Insights/README.md`

**Assessment:** The courtroom bridge, HiPPO warning, peeking caution, and rubric create an approachable introduction. The lesson risks serious misunderstanding because p-values, significance, forecasting, and correlation are compressed into rules of thumb; the “Significance Test (Excel/Python Logic)” has neither code nor data nor expected computation.

**Gap task stubs:**
- [ ] [P0][A:Concept] Correctly deepen p-values and statistical significance with null/alternative hypotheses, confidence intervals, effect size, power, Type I/II errors, practical significance, and multiple testing.
- [ ] [P0][C:Lab] Provide experiment and time-series datasets, runnable Excel/Python steps, expected statistics/forecast, and a decision memo with guardrail outcomes.
- [ ] [P1][M:Coverage] Add randomization, sample-ratio mismatch, novelty/network effects, sequential testing, CUPED/variance reduction, segmentation, and experiment governance.
- [ ] [P1][M:Coverage] Add forecast baselines, train/test splits, backtesting, error metrics, prediction intervals, drift, and when not to forecast.
- [ ] [P1][H:Pitfalls] Add a dedicated “correlation is not causation” scenario with confounding and Simpson’s paradox.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained interpretation questions.
- [ ] [P2][O:Glossary] Define p-value, alpha, power, effect size, confidence interval, seasonality, and correlation.

---

## Day 79 — BI Storytelling & Stakeholder Influence

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_79_BI_Storytelling_and_Stakeholder_Influence/README.md`

**Assessment:** The narrative arc, Minto-style “So What?” pyramid, managing-up advice, gotcha-question response, and scoring rubric are practical. But the lesson gives no raw analysis or stakeholder context from which to build its makeover, email, or script, and it underplays uncertainty, dissent, and decision follow-through.

**Gap task stubs:**
- [ ] [P0][C:Lab] Provide a messy analysis packet, audience personas, meeting constraints, and expected executive email/slide/script exemplars scored with the rubric.
- [ ] [P1][M:Coverage] Add audience segmentation, pre-wiring, decision logs, facilitation, objection handling, uncertainty communication, and post-decision action tracking.
- [ ] [P1][H:Pitfalls] Add ethical callouts on cherry-picking, overclaiming causality, hiding caveats, and manipulating emotion or axes.
- [ ] [P1][I:Senior] Add a realistic senior workflow for aligning Finance/Product definitions before an executive readout and recording unresolved dissent.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained critique/rewrite scenarios.
- [ ] [P2][O:Glossary] Define narrative arc, Minto Principle, managing up, call to action, pre-wire, and decision log.

---

## Day 80 — BI Data Quality & Governance

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_80_BI_Data_Quality_and_Governance/README.md`

**Assessment:** The food-inspection bridge, six quality dimensions, lineage, automated testing, and RACI prompt establish important governance concepts. Yet “Data Governance is about people, not tools” is followed by little operating-model depth, and the lab lacks data, test execution, incident handling, or expected quality results.

**Gap task stubs:**
- [ ] [P0][C:Lab] Supply a flawed customer dataset and test environment; require profiling, SQL/test implementation, RACI, triage, remediation, and expected failing/passing results.
- [ ] [P1][M:Coverage] Add governance operating model, data owners/stewards, catalog, classification, access approvals, retention, privacy, policy-as-code, and audit evidence.
- [ ] [P1][M:Coverage] Add data observability, freshness/volume/schema anomalies, SLOs/SLAs, incident response, root-cause analysis, and postmortems.
- [ ] [P1][A:Concept] Distinguish validation rules, data tests, monitoring, reconciliation, and business controls, with guidance on where each runs.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained governance incidents.
- [ ] [P2][O:Glossary] Define completeness, uniqueness, validity, timeliness, consistency, accuracy, lineage, steward, owner, and RACI.

---

## Day 81 — BI Architecture & Data Modeling

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_81_BI_Architecture_and_Data_Modeling/README.md`

**Assessment:** Facts/dimensions, star vs snowflake, OBT, surrogate keys, and grain are correctly prioritized, and “Grain is Everything” is strong senior advice. The lesson stops before the modeling decisions that commonly break production analytics, and the SQL denormalization exercise has no source schema, data, execution steps, or expected table.

**Gap task stubs:**
- [ ] [P0][C:Lab] Provide normalized source tables and sample rows; require declaring grain, building dimensions/facts/OBT, testing joins, and comparing exact expected outputs.
- [ ] [P1][M:Coverage] Add slowly changing dimensions, role-playing/conformed dimensions, degenerate/junk dimensions, factless facts, bridges, snapshots, and late-arriving data.
- [ ] [P1][M:Coverage] Compare Kimball, Inmon, Data Vault, OBT, and lakehouse/medallion patterns with migration and scale trade-offs.
- [ ] [P1][H:Pitfalls] Add fanout, mixed grain, duplicate facts, null keys, referential-integrity gaps, and double-counting callouts.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained modeling scenarios.
- [ ] [P2][O:Glossary] Define fact, dimension, grain, surrogate key, star, snowflake, OBT, and SCD.

---

## Day 82 — BI ETL & Pipeline Automation

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_82_BI_ETL_and_Pipeline_Automation/README.md`

**Assessment:** The assembly-line bridge and focus on idempotency, DAGs, backfills, retries, and the “3 AM Test” target the right operational mindset. The only code is a partial function prompt, so learners never build or operate a pipeline, and crucial production concerns such as state, observability, testing, SLAs, and safe deployment remain thin.

**Gap task stubs:**
- [ ] [P0][C:Lab] Provide a runnable orchestrated pipeline with fixtures and injected failures; require idempotent loads, retries, backfill, alerting, and exact expected row counts/logs after reruns.
- [ ] [P1][B:CodeCtx] Add a what/why preamble, dependencies, contract, and expected output to `reliable_load.py`, then show and explain a reference implementation after the exercise.
- [ ] [P1][M:Coverage] Add incremental state/watermarks, CDC, schema changes, transactions, data contracts, quality gates, observability, SLOs, and incident runbooks.
- [ ] [P1][M:Coverage] Compare Airflow/Dagster/Prefect and batch/streaming/event-driven patterns using decision criteria rather than names alone.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained operational scenarios.
- [ ] [P2][O:Glossary] Define idempotency, DAG, backfill, retry, watermark, CDC, orchestration, and SLA/SLO.

---

## Day 83 — BI Cloud & Modern Data Stack

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_83_BI_Cloud_and_Modern_Data_Stack/README.md`

**Assessment:** The restaurant analogy, separation of storage/compute, reverse ETL, pruning, FinOps, and zero-copy cloning give learners useful cloud intuitions. The lesson remains a vendor/tool survey without a deployable architecture, measurable cost model, security baseline, or nuanced discussion of when the modern data stack is the wrong choice.

**Gap task stubs:**
- [ ] [P0][C:Lab] Provide workload, pricing assumptions, sample query plans, and architecture constraints; require a costed design and pruning experiment with expected cost/performance outputs.
- [ ] [P1][M:Coverage] Add IAM, networking/private connectivity, encryption/KMS, secrets, tenant isolation, backup/DR, regions/residency, and compliance.
- [ ] [P1][M:Coverage] Add FinOps tagging, budgets, quotas, workload management, autoscaling, caching, chargeback/showback, and cost anomaly alerts.
- [ ] [P1][F:Tables] Add decision guidance comparing warehouse/lakehouse and major cloud options, including lock-in, skills, workload, governance, and TCO.
- [ ] [P1][H:Pitfalls] Add “when not to use MDS” and migration/egress/vendor-failure callouts.
- [ ] [P1][L:Quiz] Add `quiz.json` with explanations.
- [ ] [P2][O:Glossary] Define separation of compute/storage, pruning, reverse ETL, FinOps, zero-copy clone, IAM, and egress.

---

## Day 84 — BI Career Development & Capstone

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_84_BI_Career_Development_and_Capstone/README.md`

**Assessment:** The portfolio analogy, impact resume formula, STAR example, capstone brief, and standardized rubric make the phase outcome tangible. But the capstone is only a high-level checklist—“Data: Public E-Commerce Dataset (e.g., Olist or Superstore)”—without a pinned dataset, milestones, acceptance tests, expected artifacts, or integration of the governance and production skills taught throughout the phase.

**Gap task stubs:**
- [ ] [P0][C:Lab] Turn the capstone into a complete brief with pinned dataset/version, setup, milestones, required repository structure, expected artifacts, acceptance tests, presentation rubric, and reference outputs.
- [ ] [P1][N:Thread] Connect the capstone explicitly to artifacts built in every prior lesson and provide a phase-long checkpoint map rather than introducing the project only at the end.
- [ ] [P1][M:Coverage] Require metric contracts, tests, lineage, access/privacy controls, orchestration, CI/CD, monitoring, cost estimate, runbook, and stakeholder adoption plan.
- [ ] [P1][M:Coverage] Add BI career-path coverage for analyst/analytics engineer/BI engineer roles, portfolio review criteria, technical interviews, case studies, and ethical use of public data.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained portfolio/capstone review scenarios.
- [ ] [P2][K:Xref] Replace “Phase 7 Overview & The Final Capstone Exam” with working links or clarify where those resources live.
- [ ] [P2][O:Glossary] Define portfolio, capstone, STAR, fact/dimension, reproducibility, and governance readiness.

---

## Day 84B — dbt Fundamentals

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_84B_dbt_Fundamentals/README.md`

**Assessment:** This is a substantial, code-rich lesson with project structure, models, sources, freshness, tests, commands, materializations, senior trade-offs, and links to the extras scaffold. It still functions more as snippets than a verified walkthrough: several blocks are introduced only by headings, labs omit expected compiled/model/test outputs, and advanced production dbt practices are missing.

**Gap task stubs:**
- [ ] [P0][C:Lab] Make Exercises 1–3 explicitly use `extras/sample_dbt_project`, list exact commands and files to edit, and show expected rows, DAG/docs artifacts, and passing/failing test output.
- [ ] [P1][B:CodeCtx] Add what/why preambles and expected effects to every YAML/SQL/command block, especially “Sources and Freshness Checks” and “Built-In Tests.”
- [ ] [P1][M:Coverage] Add macros/Jinja, packages, documentation/exposures, snapshots/SCDs, incremental models, contracts, unit tests, seeds, and environment-specific configuration.
- [ ] [P1][M:Coverage] Add production workflow: Git branches, CI selection/state/defer, slim CI, deployment jobs, artifacts, observability, and rollback.
- [ ] [P1][H:Pitfalls] Add circular refs, unsafe incremental logic, full-refresh risk, source freshness caveats, test severity, and warehouse-cost callouts.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained code/configuration questions.
- [ ] [P2][O:Glossary] Define model, `ref`, source, freshness, materialization, seed, snapshot, macro, and lineage.

---

## Day 84C — Reverse ETL & Semantic Layer

**Path:** `content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/Day_84C_Reverse_ETL_and_Semantic_Layer/README.md`

**Assessment:** This is the phase’s deepest modern-stack lesson, with a clear mail-truck bridge, reverse-ETL design, semantic-layer examples, MBA context, anti-patterns, and architecture decisions. Even here, code blocks often have heading-only context, the Python mock swallows all exceptions, labs are design prompts without runnable systems or expected outputs, and governance/operations of metric and sync changes need depth.

**Gap task stubs:**
- [ ] [P0][C:Lab] Build an executable local sync/semantic-layer exercise using the extras fixtures, with setup, idempotency/failure tests, metric queries, and expected CRM records/query outputs.
- [ ] [P1][B:CodeCtx] Add what/why preambles and expected outputs to every Python/YAML/JavaScript/architecture block; explain that the mock’s broad `except Exception` is illustrative and replace it with production-safe handling.
- [ ] [P1][M:Coverage] Add sync deletes, conflict resolution, API limits, retries, replay/backfill, observability, identity resolution, consent, PII minimization, and audit trails.
- [ ] [P1][M:Coverage] Add semantic-layer governance: metric contracts, dimensions/entities, access control, versioning, deprecation, caching, performance, testing, and reconciliation to Finance.
- [ ] [P1][F:Tables] Upgrade the MBA-context table and tool mentions into decision guidance for reverse ETL and semantic-layer build/buy choices.
- [ ] [P1][L:Quiz] Add `quiz.json` with explained architecture/configuration questions.
- [ ] [P2][K:Xref] Clarify ordering among Day 84, 84B, and 84C and ensure “Phase 7 Complete” appears only on the actual final lesson.
- [ ] [P2][O:Glossary] Define reverse ETL, semantic layer, metric store, match key, idempotency, full/incremental sync, entity, measure, and dimension.
