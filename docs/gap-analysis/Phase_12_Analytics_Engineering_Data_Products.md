# Gap Analysis — Phase 12: Analytics Engineering & Data Products

> Audited against the Phase 1 Quality Bar. See [GAP_ANALYSIS.md](../../GAP_ANALYSIS.md) for the full rubric, gap taxonomy, and severity legend.

## Phase summary

Phase 12 heavily uses pseudo-code and dictionaries instead of concrete examples and code that analytics engineers would use in production. Every single lesson lacks a `quiz.json` and a glossary. Furthermore, the lab exercises are simply commented `# TODO` placeholders without sample data, concrete inputs/outputs, or expected results.

**Recurring gaps in this phase:**

- All lessons are missing `quiz.json` files and Glossary sections.
- Code blocks lack preambles answering 'what/why', often just listing Python dictionaries like `daily_tasks = {` or `# A typical day for an analytics engineer:`.
- Lab exercises lack problem statements, sample schemas, and expected results (often written as simple `# Scenario: ...` and `# TODO: ...`).

**Lessons audited:** 8

---

## Day 138 — The Analytics Engineer Role — Beyond the Data Analyst

**Path:** `content/lessons/Phase_12_Analytics_Engineering_Data_Products/Day_138_Analytics_Engineer_Role/README.md`
**Assessment:** The lesson outlines the role using simplistic pseudo-code rather than realistic infrastructure/DAG scenarios. The lab exercises are exceptionally thin, using comments like `"# Scenario: Marketing and Finance disagree..."` without any starting sample data. The required quiz and glossary are entirely missing.

**Gap task stubs:**

- [ ] [P0][B:CodeCtx] Add preambles to code blocks. Currently, they start directly with ````python` and `"# A typical day for an analytics engineer:"` without answering the what/why.
- [ ] [P1][C:Lab] Add a realistic problem statement, sample schema, and expected query result to Exercise 2 instead of the thin `"-- Scenario: Marketing and Finance disagree on 'Monthly Active Users (MAU).'"`.
- [ ] [P0][L:Quiz] Create missing `quiz.json` with explained answers.
- [ ] [P1][O:Glossary] Add missing Glossary section.

---

## Day 139 — Semantic and Metrics Layers — Define Once, Use Everywhere

**Path:** `content/lessons/Phase_12_Analytics_Engineering_Data_Products/Day_139_Semantic_and_Metrics_Layers/README.md`
**Assessment:** The lesson introduces semantic layers but fails to frame code effectively. Lab exercises are entirely theoretical and lack any actionable data, e.g., using comments like `"# TODO: Define these 5 metrics..."`. It's missing a quiz and a glossary.

**Gap task stubs:**

- [ ] [P0][B:CodeCtx] Add explanatory preambles to code blocks, such as the LookML block which just says `"view: orders {"`.
- [ ] [P1][C:Lab] Provide a concrete sample schema and expected YAML/SQL output for Exercise 1, rather than the thin `"# TODO: Define these 5 metrics for an e-commerce company using dbt Semantic Layer:"`.
- [ ] [P0][L:Quiz] Create missing `quiz.json` with explained answers.
- [ ] [P1][O:Glossary] Add missing Glossary section.

---

## Day 140 — Self-Serve Analytics — Empowering Stakeholders Without Chaos

**Path:** `content/lessons/Phase_12_Analytics_Engineering_Data_Products/Day_140_Self_Serve_Analytics/README.md`
**Assessment:** The lesson provides self-serve concepts through Python dictionaries, which feels artificial. The lab exercises are just single-line prompts like `"Audit your organization's self-serve maturity level and identify 3 improvements."`, lacking a realistic scenario, schema, and expected result.

**Gap task stubs:**

- [ ] [P0][B:CodeCtx] Add preambles to the Python dictionary code blocks such as `"self_serve_stack = {"` to explain the why/what.
- [ ] [P1][C:Lab] Rewrite Exercise 1 to include a specific scenario, sample data, and an expected format rather than the thin `"Audit your organization's self-serve maturity level and identify 3 improvements."`.
- [ ] [P0][L:Quiz] Create missing `quiz.json` with explained answers.
- [ ] [P1][O:Glossary] Add missing Glossary section.

---

## Day 141 — Data Mesh Principles — Domain Ownership and Federated Governance

**Path:** `content/lessons/Phase_12_Analytics_Engineering_Data_Products/Day_141_Data_Mesh_Principles/README.md`
**Assessment:** The lesson explains Data Mesh principles via conceptual Python dictionaries instead of architecture diagrams or code. The lab exercises are too vague, using prompts like `"Design domain boundaries for a SaaS company..."` without any sample data or clear success criteria.

**Gap task stubs:**

- [ ] [P0][B:CodeCtx] Add preambles for the dictionary blocks, e.g., the one starting with `"data_mesh_principles = {"`, to explain the 'what' and 'why'.
- [ ] [P1][C:Lab] Provide a concrete sample schema and expected output for Exercise 2, replacing the thin prompt `"Write a full data product specification for a customer churn prediction dataset..."`.
- [ ] [P0][L:Quiz] Create missing `quiz.json` with explained answers.
- [ ] [P1][O:Glossary] Add missing Glossary section.

---

## Day 142 — Product Analytics Deep Dive — Retention, Funnels, Cohorts

**Path:** `content/lessons/Phase_12_Analytics_Engineering_Data_Products/Day_142_Product_Analytics_Deep_Dive/README.md`
**Assessment:** The lesson includes some SQL for cohort and funnel analysis, but fails to provide any preamble explaining why the queries are structured that way. The lab exercises are missing starting sample schemas and expected SQL query outputs.

**Gap task stubs:**

- [ ] [P0][B:CodeCtx] Add preambles for the SQL code blocks like `"-- Build a monthly retention cohort from raw events"` to explain the logic before the query.
- [ ] [P1][C:Lab] Add a sample table schema and expected SQL result for Exercise 1, fixing the thin prompt `"Write SQL to create a weekly retention cohort for a mobile app over the last 12 weeks."`.
- [ ] [P0][L:Quiz] Create missing `quiz.json` with explained answers.
- [ ] [P1][O:Glossary] Add missing Glossary section.

---

## Day 143 — A/B Testing at Scale — Statistical Rigor and Experimentation Platforms

**Path:** `content/lessons/Phase_12_Analytics_Engineering_Data_Products/Day_143_AB_Testing_at_Scale/README.md`
**Assessment:** The lesson uses `scipy` for statistical calculations but lacks preambles explaining the statistical theory before the code. The lab exercises are overly brief, like `"Design a test for making the 'Add to Cart' button larger."` without providing necessary schemas or constraints.

**Gap task stubs:**

- [ ] [P0][B:CodeCtx] Add preambles for the stats code block, explaining the theory before jumping into `"from scipy import stats"`.
- [ ] [P1][C:Lab] Expand Exercise 1 to include a concrete problem statement, sample data constraints, and expected output format instead of the thin `"Design a test for making the 'Add to Cart' button larger."`.
- [ ] [P0][L:Quiz] Create missing `quiz.json` with explained answers.
- [ ] [P1][O:Glossary] Add missing Glossary section.

---

## Day 144 — Data Products and Monetization — Building Revenue from Data

**Path:** `content/lessons/Phase_12_Analytics_Engineering_Data_Products/Day_144_Data_Products_and_Monetization/README.md`
**Assessment:** The lesson uses unhelpful Python dictionaries to explain data products. Lab exercises are completely text-based prompts like `"Design pricing tiers for an embedded analytics dashboard feature..."` without any sample data, schemas, or expected outputs.

**Gap task stubs:**

- [ ] [P0][B:CodeCtx] Add preambles to the Python dictionary blocks, such as the one containing `"data_product_types = {"`, to clarify their intent.
- [ ] [P1][C:Lab] Provide sample usage data and expected output formats for Exercise 1, replacing the thin `"For a B2B SaaS company with 5 years of usage data, identify 3 potential data products..."`.
- [ ] [P0][L:Quiz] Create missing `quiz.json` with explained answers.
- [ ] [P1][O:Glossary] Add missing Glossary section.

---

## Day 145 — Capstone — Design and Pitch a Data Product

**Path:** `content/lessons/Phase_12_Analytics_Engineering_Data_Products/Day_145_Capstone_Data_Product/README.md`
**Assessment:** The capstone lesson contains several code blocks that lack preambles entirely. Most importantly, it is completely missing a "Hands-on Lab" section, and like the rest of the phase, has no quiz or glossary.

**Gap task stubs:**

- [ ] [P0][B:CodeCtx] Add preambles to code blocks explaining the architecture and components before showing the code.
- [ ] [P0][C:Lab] Create a missing "Hands-on Lab" section with clear goals, scenarios, sample schemas, and expected results. The entire section is absent.
- [ ] [P0][L:Quiz] Create missing `quiz.json` with explained answers.
- [ ] [P1][O:Glossary] Add missing Glossary section.

---
