# Mermaid Diagram Candidates

Mermaid rendering is not implemented yet (tracked as a 🔲 item in
[`markdown-renderer-roadmap.md`](./markdown-renderer-roadmap.md#mermaid-diagrams-)),
and no lesson currently embeds a ` ```mermaid ` block. This is a curated list
of lessons whose content is inherently visual/structural (pipelines,
request/response flows, schema relationships, state transitions, DAGs) and
would benefit most once diagram support lands. Produced by scanning every
`README.md` under `content/lessons/`; lessons that are pure syntax reference
with nothing structural to diagram were left out.

For each entry: lesson path, suggested Mermaid diagram type, and why.

## Phase 01 — Algorithmic Thinking & Python Foundations

- `Day_09_Conditionals` — **flowchart**: multi-branch if/elif/else decision
  logic (loan approval, shipping cost, customer tier) is a decision tree.
- `Day_10_Loops` — **flowchart**: iteration with break/continue and
  batch-processing exit conditions is a control-flow loop.

## Phase 02 — Functions, Modularity & Data Wrangling

- `Day_13_Higher_Order_Functions` — **flowchart**: map/filter/reduce chains
  are a data pipeline where each stage transforms the previous output.
- `Day_18_Classes_and_Objects` — **classDiagram**: inheritance examples
  (Animal → Dog/Cat) and object relationships (Customer/Order/BankAccount)
  map directly to a UML class diagram.
- `Day_23_Pandas` — **flowchart**: load → filter → aggregate → save is an
  ETL-style transformation chain.

## Phase 03 — Data Engineering & Web Development

- `Day_25_Data_Cleaning` — **flowchart**: detect missing → choose strategy →
  fill/drop → validate is a sequential decision pipeline.
- `Day_31_Databases` — **erDiagram**: employees/departments/orders/customers
  relationships are a textbook entity-relationship model.
- `Day_33_API` — **sequenceDiagram**: client/server request-response cycles
  with auth and error handling.
- `Day_34_Building_an_API` — **sequenceDiagram**: FastAPI request → Pydantic
  validation → endpoint → response is a request lifecycle.
- `Day_35_Flask_Web_Framework` — **flowchart**: routing → template rendering
  → form submission → redirect is a request-processing path.

## Phase 04 — Mathematical Foundations & ML Fundamentals

- `Day_37C_Sklearn_Pipelines` — **flowchart**: `ColumnTransformer` branches
  different feature types into parallel impute/scale/encode chains before
  they merge into the model.
- `Day_40_Intro_to_ML` — **flowchart**: data prep → split → train → evaluate,
  with the overfitting/underfitting and bias-variance framing.
- `Day_45_Feature_Engineering_and_Evaluation` — **flowchart**: nested
  cross-validation (outer loop for generalization, inner loop for
  hyperparameter tuning) is easy to mis-read as flat text.
- `Day_46_Intro_to_Neural_Networks` — **flowchart**: forward propagation
  (left-to-right) and backpropagation (right-to-left) through layers.

## Phase 05 — Advanced ML & Deep Learning

- `Day_50_MLOps` — **flowchart**: CI/CD pipeline (data validation → training
  → evaluation → staging → integration tests → production) with promotion
  gates.
- `Day_60C_RAG_and_Vector_Databases` — **sequenceDiagram**: Query → Embed →
  Retrieve → Augment → Generate is a 5-step actor interaction.

## Phase 06 — Cutting-Edge ML

- `Day_61_Reinforcement_and_Offline_Learning` — **stateDiagram**: the
  State → Action → Reward → Next State loop is a state-transition system.
- `Day_63_Causal_Inference_and_Uplift` — **graph**: causal DAGs with
  confounders (e.g. Alcohol → Shoes On, Alcohol → Headache) are diagrams by
  definition.
- `Day_65_MLOps_Pipelines_and_CI` — **flowchart**: code/data/environment
  versioning feeding training, then model-registry stages
  (Staging → Production → Archived).
- `Day_68_AI_Agents_and_Tool_Use` — **sequenceDiagram**: the ReAct loop
  (Thought → Action → Observation → Thought → Final Answer).
- `Day_71_RAG_and_Vector_Databases` — **flowchart**: embed query → search
  vector DB → retrieve chunks → augment prompt → generate answer.

## Phase 07 — BI Analytics, Governance & Modern Data Stack

- `Day_76_BI_Data_Landscape` — **flowchart**: OLTP vs OLAP contrast and the
  Modern Data Stack flow (Ingest → Store → Transform → Visualize).
- `Day_87_BI_ETL_and_Pipeline_Automation` — **flowchart (DAG)**: parallel
  extract tasks converging into a unify/transform step, with explicit task
  dependencies.
- `Day_88_BI_Cloud_and_Modern_Data_Stack` — **flowchart**: end-to-end stack
  (Fivetran → Snowflake → dbt → Looker/Tableau, plus Reverse ETL back to
  Salesforce) currently described only in an exercise.
- `Day_89C_Reverse_ETL_and_Semantic_Layer` — **flowchart**: warehouse →
  semantic layer (dbt Metrics) → multiple BI tools; an existing ASCII diagram
  should become a proper Mermaid one.

## Phase 08 — SQL Mastery & Database Architecture

- `Day_96_Relational_Databases` — **erDiagram**: the denormalized → 3NF
  worked example (customers → orders → order_items → products).
- `Day_100_Joins` — **flowchart**: which rows survive INNER vs LEFT vs FULL
  vs SEMI vs ANTI joins is currently explained only via Venn-diagram prose.
- `Day_92_Data_Governance` — **flowchart**: a query's path through
  authentication → RBAC authorization → row-level-security filtering.

## Phase 09 — Enterprise SQL Performance Engineering

- `Day_109_Database_Design_and_Normalization` — **erDiagram**: 1NF/2NF/3NF
  violations and fixes (e.g. splitting `books` into `books`/`authors`).
- `Day_104_Transactions` — **sequenceDiagram**: Two-Phase Commit (Prepare,
  then Commit/Abort) between a coordinator and participants, including the
  in-doubt-transaction failure mode.

## Phase 10 — Generative AI & LLM Engineering

- `Day_117_RAG_Pipelines` — **flowchart**: Query → Embedding Model → Vector
  Store → Reranker → LLM, currently shown only as ASCII text.
- `Day_120_LLM_Agents_and_Tool_Use` — **flowchart**: the ReAct cycle
  (Reason → Act → Observe → back to Reason) is a feedback loop.
- `Day_116_LangChain_and_LlamaIndex` — **flowchart**: memory management and
  parallel-chain composition (input → multiple branches → synthesized
  output).

## Phase 11 — Cloud Data Engineering

- `Day_130_Orchestration` — **flowchart (DAG)**: the Airflow task-dependency
  example (extract → transform → load → test → notify).
- `Day_132_Lakehouse_Architecture` — **flowchart**: medallion architecture
  (Bronze → Silver → Gold) and how incremental processing applies per layer.
- `Day_126_Cloud_Fundamentals` — **flowchart**: IaaS/PaaS/SaaS responsibility
  model, currently an ASCII stack diagram.

## Phase 12 — Analytics Engineering & Data Products

- `Day_139_Semantic_and_Metrics_Layers` — **flowchart**: multiple
  inconsistent "revenue" queries from different teams converging through one
  semantic-layer definition.
- `Day_141_Data_Mesh_Principles` — **graph**: domain → data product →
  consumer relationships across the orders/customer/marketing domains.

## Method

Scanned all 163 lesson `README.md` files (12 phases) for prose describing
pipelines, architectures, request/response cycles, schema relationships,
state transitions, or DAGs, then filtered out lessons that are primarily
syntax reference with no inherent structure to diagram. Paths above are
relative to `content/lessons/Phase_NN_*/`.
