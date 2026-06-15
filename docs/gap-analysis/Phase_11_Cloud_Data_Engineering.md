# Gap Analysis — Phase 11: Cloud Data Engineering

> Audited against the Phase 1 Quality Bar. See [GAP_ANALYSIS.md](../../GAP_ANALYSIS.md) for the full rubric, gap taxonomy, and severity legend.

## Phase summary

Phase 11 systematically introduces foundational Cloud Data Engineering concepts effectively, but consistently falls short of the rigorous Phase 1 Quality Bar. There is a universal failure to include `quiz.json` and a dedicated Glossary section. The lab exercises are largely presented as thin Python `TODO` stubs lacking clear business scenarios, sample schemas, and explicit expected results. Furthermore, while the lessons present cloud architectures and table structures, they often lack sufficient decision guidance (trade-offs) and many code blocks omit explicit what/why context preambles.

**Recurring gaps in this phase:**

- [P0][L:Quiz] Missing `quiz.json` with explanations across all lessons.
- [P1][O:Glossary] Missing Glossary section across all lessons.
- [P1][C:Lab] Lab exercises systematically lack detailed problem statements, sample data/schemas, and expected results.
- [P2][B:CodeCtx] Code blocks frequently omit clear what/why preambles before diving into Python/SQL.

**Lessons audited:** 12

---

## Day 121 — Cloud Fundamentals

**Path:** `content/lessons/Phase_11_Cloud_Data_Engineering/Day_121_Cloud_Fundamentals/README.md`
**Assessment:** The lesson explains broad cloud concepts and pricing well, but the AWS/GCP/Azure trade-offs are mostly listed in tables without deep conceptual justification. The hands-on labs are merely code stubs, such as `"TODO: Calculate monthly cloud costs broken down by category."`

**Gap task stubs:**

- [ ] [P0][L:Quiz] Missing `quiz.json` file in lesson directory.
- [ ] [P1][O:Glossary] Add a Glossary section to define jargon.
- [ ] [P1][C:Lab] Lab lacks sample inputs and expected outputs. Example quote: `"TODO: Calculate monthly cloud costs..."`
- [ ] [P2][B:CodeCtx] Provide a what/why preamble for the `estimate_monthly_cost` block.
- [ ] [P0][F:Tables] Cloud provider table lacks deep decision guidance. Define AWS/GCP/Azure trade-offs conceptually.

---

## Day 122 — Object Storage

**Path:** `content/lessons/Phase_11_Cloud_Data_Engineering/Day_122_Object_Storage/README.md`
**Assessment:** Introduces S3 and the medallion architecture well, but code blocks like `table_format_comparison` jump straight into Python dicts without explaining *why* we are defining them this way. Labs are weak; they ask to `"TODO: Design the S3 bucket structure with..."` but provide no actual testing framework or expected JSON.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Missing `quiz.json` file in lesson directory.
- [ ] [P1][O:Glossary] Add a Glossary section to define jargon.
- [ ] [P1][C:Lab] Lab lacks expected result. Example quote: `"TODO: Design the S3 bucket structure with..."`
- [ ] [P2][B:CodeCtx] Code block lacks what/why preamble. Example: `"table_format_comparison = {..."`

---

## Day 123 — Cloud Data Warehouses

**Path:** `content/lessons/Phase_11_Cloud_Data_Engineering/Day_123_Cloud_Data_Warehouses/README.md`
**Assessment:** Explains BigQuery vs Snowflake effectively, but provides minimal "decision guidance" on exactly when to choose which warehouse based on real-world constraints. The code blocks (e.g., BigQuery API usage) begin immediately after headings without proper context.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Missing `quiz.json` file in lesson directory.
- [ ] [P1][O:Glossary] Add a Glossary section to define jargon.
- [ ] [P1][C:Lab] Lab lacks a clear scenario and expected output. Example quote: `"TODO: Write a query that..."`
- [ ] [P2][B:CodeCtx] Code block lacks what/why preamble. Example: `"from google.cloud import bigquery..."`
- [ ] [P1][A:Concept] Elaborate on the specific trade-offs when choosing Snowflake over BigQuery.

---

## Day 124 — dbt at Scale

**Path:** `content/lessons/Phase_11_Cloud_Data_Engineering/Day_124_dbt_at_Scale/README.md`
**Assessment:** Covers dbt models and incremental logic, but macro and incremental code blocks (like `{% if is_incremental() %}`) are presented abruptly without explaining *why* this specific Jinja syntax is required. The labs provide no sample raw data or expected compiled SQL.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Missing `quiz.json` file in lesson directory.
- [ ] [P1][O:Glossary] Add a Glossary section to define jargon.
- [ ] [P1][C:Lab] Provide sample schemas and expected result. Example quote: `"TODO: Build an incremental model..."`
- [ ] [P2][B:CodeCtx] Explain the syntax before the code block: `"{% if is_incremental() %}..."`

---

## Day 125 — Orchestration

**Path:** `content/lessons/Phase_11_Cloud_Data_Engineering/Day_125_Orchestration/README.md`
**Assessment:** Touches on Airflow DAGs appropriately, but fails to provide any Pitfalls callouts regarding Airflow's scheduler limits or the danger of top-level code in DAG files. Labs are merely placeholders with `"pass"`.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Missing `quiz.json` file in lesson directory.
- [ ] [P1][O:Glossary] Add a Glossary section to define jargon.
- [ ] [P1][C:Lab] Lab exercises lack clear expected results. Example quote: `"def create_dag(): ... pass"`
- [ ] [P0][H:Pitfalls] Add a pitfalls callout about Airflow top-level code and scheduler bottlenecks.

---

## Day 126 — Streaming Pipelines

**Path:** `content/lessons/Phase_11_Cloud_Data_Engineering/Day_126_Streaming_Pipelines/README.md`
**Assessment:** Good introduction to Kafka and Flink, but code blocks dive into `confluent_kafka` imports immediately. Explanations of why we use streaming vs batch lack clear cut-off metrics (e.g., latency bounds). Labs are empty stubs.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Missing `quiz.json` file in lesson directory.
- [ ] [P1][O:Glossary] Add a Glossary section to define jargon.
- [ ] [P1][C:Lab] Lab lacks realistic schema/scenario. Example quote: `"TODO: Implement a Kafka producer..."`
- [ ] [P2][B:CodeCtx] Code block lacks what/why preamble. Example: `"from confluent_kafka import Producer..."`
- [ ] [P0][A:Concept] Justify the "magic numbers" for when streaming is actually necessary over micro-batching.

---

## Day 127 — Lakehouse Architecture

**Path:** `content/lessons/Phase_11_Cloud_Data_Engineering/Day_127_Lakehouse_Architecture/README.md`
**Assessment:** The lesson explains the convergence of lakes and warehouses, but table comparisons between Delta/Iceberg/Hudi lack clear decision guidance on when to choose Hudi over Iceberg. Labs only ask to write pseudo-code.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Missing `quiz.json` file in lesson directory.
- [ ] [P1][O:Glossary] Add a Glossary section to define jargon.
- [ ] [P1][C:Lab] Lab lacks expected result. Example quote: `"TODO: Design a Lakehouse architecture..."`
- [ ] [P0][F:Tables] Add decision guidance (when to choose) to the table comparing Delta, Iceberg, and Hudi.

---

## Day 128 — Data Contracts and Quality

**Path:** `content/lessons/Phase_11_Cloud_Data_Engineering/Day_128_Data_Contracts_and_Quality/README.md`
**Assessment:** Introduces Great Expectations well, but the actual implementation code blocks lack a preamble explaining the `gx` API. There is no business framing on how to convince upstream teams to adopt contracts.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Missing `quiz.json` file in lesson directory.
- [ ] [P1][O:Glossary] Add a Glossary section to define jargon.
- [ ] [P1][C:Lab] Lab lacks sample data to test expectations on. Example quote: `"TODO: Add expectations for..."`
- [ ] [P2][B:CodeCtx] Code block lacks what/why preamble. Example: `"import great_expectations as gx..."`
- [ ] [P1][E:Framing] Add business framing on organizational adoption of data contracts.

---

## Day 129 — Cloud Security and Compliance

**Path:** `content/lessons/Phase_11_Cloud_Data_Engineering/Day_129_Cloud_Security_and_Compliance/README.md`
**Assessment:** Discusses IAM and encryption. However, the `compliance_matrix` is just dumped as a dictionary without preambles. It fails to define key jargon like "Customer Managed Keys" (CMK) thoroughly before using them.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Missing `quiz.json` file in lesson directory.
- [ ] [P1][O:Glossary] Add a Glossary section to define jargon like CMK.
- [ ] [P1][C:Lab] Lab exercises lack clear expected results. Example quote: `"TODO: Write an IAM policy..."`
- [ ] [P2][B:CodeCtx] Code block lacks what/why preamble. Example: `"compliance_matrix = {..."`

---

## Day 130 — Cost Engineering

**Path:** `content/lessons/Phase_11_Cloud_Data_Engineering/Day_130_Cost_Engineering/README.md`
**Assessment:** Strong focus on FinOps, but code blocks outlining FinOps pillars lack setup explanations. The lab just asks the user to `"Write a 1-page FinOps policy"`, which provides no expected coding result or metrics to hit.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Missing `quiz.json` file in lesson directory.
- [ ] [P1][O:Glossary] Add a Glossary section to define jargon.
- [ ] [P1][C:Lab] Lab asks for a text policy rather than a measurable exercise. Provide an expected result metric. Example quote: `"TODO: Write a 1-page FinOps policy..."`
- [ ] [P2][B:CodeCtx] Code block lacks what/why preamble. Example: `"finops_pillars = {..."`

---

## Day 131 — Platform Engineering

**Path:** `content/lessons/Phase_11_Cloud_Data_Engineering/Day_131_Platform_Engineering/README.md`
**Assessment:** Discusses Terraform and Infrastructure as Code. The Terraform HCL examples lack detailed line-by-line justification for the resource configurations. Labs are mostly `"TODO"` stubs without provided state outputs.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Missing `quiz.json` file in lesson directory.
- [ ] [P1][O:Glossary] Add a Glossary section to define jargon.
- [ ] [P1][C:Lab] Lab lacks clear expected result/Terraform output. Example quote: `"TODO: Write a Terraform module..."`
- [ ] [P1][A:Concept] Justify the resource configurations in the Terraform code block.

---

## Day 132 — Capstone Cloud Data Pipeline

**Path:** `content/lessons/Phase_11_Cloud_Data_Engineering/Day_132_Capstone_Cloud_Data_Pipeline/README.md`
**Assessment:** The capstone successfully outlines an end-to-end project but completely lacks a Glossary or Quiz. As a capstone, it misses a "Real senior/production insight" section explaining how this pipeline would fail in production.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Missing `quiz.json` file in lesson directory.
- [ ] [P1][O:Glossary] Add a Glossary section to define jargon.
- [ ] [P1][I:Senior] Add a "Real senior/production insight" section covering common production failures for this specific architecture.

---
