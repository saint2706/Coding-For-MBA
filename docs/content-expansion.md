# 📚 Content Expansion Strategy — Coding for MBA

> **Goal**: Grow the curriculum from 108 days → 120–150+ days by filling content  
> gaps, deepening weak phases, and adding high-ROI new phases aligned with  
> 2025–2026 MBA data skill demands.

*Last updated: February 21, 2026*

---

## 1. Current Curriculum At A Glance

| Phase | Days   | Topic                                        | Size (KB) | Depth |
| ----- | ------ | -------------------------------------------- | --------- | ----- |
| 1     | 1–12   | Algorithmic Thinking & Python Foundations    | 10.4      | ⭐⭐⭐⭐  |
| 2     | 13–24  | Functions, Modularity & Data Wrangling       | 6.8       | ⭐⭐⭐   |
| 3     | 25–36  | Data Engineering & Web Development           | 12.5      | ⭐⭐⭐⭐  |
| 4     | 37–48  | Mathematical Foundations & ML Fundamentals   | 12.8      | ⭐⭐⭐⭐  |
| 5     | 49–60  | Advanced ML & Deep Learning                  | 20.9      | ⭐⭐⭐⭐⭐ |
| 6     | 61–72  | Cutting-Edge ML & BI Foundations             | 14.4      | ⭐⭐⭐⭐  |
| 7     | 73–84  | BI Analytics, Governance & Modern Data Stack | 12.4      | ⭐⭐⭐⭐  |
| 8     | 85–96  | SQL Mastery & Database Architecture          | 8.0       | ⭐⭐⭐   |
| 9     | 97–108 | Enterprise SQL & Performance Engineering     | 9.2       | ⭐⭐⭐   |

**Total**: 9 phases · 108 days · ~108 lesson files · 9 Phase Overviews · 9 Jupyter notebooks

---

## 2. Gap Analysis by Phase

### Phase 4 — Mathematical Foundations & ML Fundamentals ✅ Good

**Current state**: 12 days. Day 37 is a "Conclusion" day that recaps Phase 3 — slightly misaligned positioning (should be a Phase 3 review or transition day, not Phase 4 Day 37).

**Gaps identified**:
- **Probability theory** (distributions, Bayes, conditional probability) not covered — assumed knowledge for Day 54 (Probabilistic Modeling Phase 5)
- **Data preprocessing pipelines** (`sklearn.pipeline`, `ColumnTransformer`) not dedicated — appear ad-hoc in later lessons
- Day 37 "Conclusion" is a Phase 3 bridge, not new content — structural inconsistency

**Expansion targets**:
- `Day_37B_Probability_and_Statistics_for_ML` — distributions, Bayes theorem, central limit theorem
- `Day_37C_Sklearn_Pipelines` — Pipeline, ColumnTransformer, custom transformers, cross-validation
- Rename/reframe Day 37 as `Day_37_Phase3_Capstone_and_Transition` and update its README

---

### Phase 5 — Advanced ML & Deep Learning ✅✅ Best-In-Class

**Current state**: 710-line overview, 20.9KB, 12 days, 36 exercises, 60 mastery questions. This is the gold standard for the curriculum.

**Gaps identified**:
- No `extras/` folder (Phases 3, 4, 6 have them)
- **LLM fine-tuning & PEFT** (LoRA, QLoRA) absent — Transformers Day 58 covers BERT/GPT2 but not modern fine-tuning
- **Retrieval-Augmented Generation (RAG)** not covered — critical 2025 skill
- **Vector databases** (Pinecone, ChromaDB, pgvector) absent — needed for RAG and semantic search

**Expansion targets**:
- `Day_60B_LLM_Fine_Tuning_and_PEFT` — LoRA, QLoRA, Hugging Face PEFT library
- `Day_60C_RAG_and_Vector_Databases` — embeddings, ChromaDB, RAG pipeline with LangChain
- Add `extras/` with additional datasets and reference notebooks

---

### Phase 6 — Cutting-Edge ML & BI Foundations ⚠️ Transition Phase Seam

**Current state**: 12 days (Days 61–72). The phase mixes advanced ML topics (Days 61–67) with BI Analyst Foundations (Days 68–72), creating a jarring transition. Day 71–72 feel like Phase 7 content.

**Gaps identified**:
- **AI Agents & Tool Use** (LangChain Agents, OpenAI function calling) not covered — major 2025 gap
- **Model cards & responsible AI documentation** not covered — mentioned in Day 62 (Interpretability/Fairness) but not practiced
- BI section (Days 68–72) is thin and immediately continued in Phase 7 — consider consolidating

**Expansion targets**:
- `Day_67B_AI_Agents_and_Tool_Use` — LangChain/LlamaIndex agents, function calling, ReAct pattern
- `Day_67C_Responsible_AI_in_Practice` — model cards, Fairlearn toolkit, audit reporting
- Consider Phase 6 structural refactor: Move BI Days 68–72 into Phase 7 as lead-in days, and expand ML coverage to 12 full days (see Phase 10 option below)

---

### Phase 7 — BI Analytics, Governance & Modern Data Stack ✅ Good

**Current state**: 12 days (Days 73–84). Strong coverage with career development capstone.

**Gaps identified**:
- **dbt (data build tool)** not covered — the de-facto standard in modern data stacks (mentioned in Phase 7 context but no dedicated lesson)
- **Reverse ETL** (Hightouch, Census) not covered — emerging BI pattern
- **LookML / Semantic Layer** concepts mentioned but not practiced
- Day 84 (Career & Capstone) is the only capstone — no mid-phase mini-project

**Expansion targets**:
- `Day_84B_dbt_Fundamentals` — models, refs, tests, documentation, dbt Cloud
- `Day_84C_Reverse_ETL_and_Semantic_Layer` — operational analytics, Hightouch concepts, metrics layer
- Add `extras/` with a sample dbt project scaffold

---

### Phase 8 — SQL Mastery & Database Architecture ⚠️ Needs Depth

**Current state**: 12 days (8.0KB overview — second smallest). Strong conceptual content but overview lacks the narrative depth expected at this level.

**Gaps identified**:
- **NoSQL databases** (MongoDB, Redis, Cassandra) only referenced, never practiced — Day 86 covers "other databases" conceptually
- **Graph databases** (Neo4j, Cypher) absent — ties in with Phase 5 GNNs (Day 60)
- **Streaming databases** (Kafka, Flink SQL) not covered — needed for real-time analytics
- Phase Overview missing: ROI-by-technique table, 3-tier skills matrix, real-world scenario walkthroughs (compare to Phase 5/8 gold standard)
- Missing a `extras/` folder with capstone DDL scripts and sample datasets

**Expansion targets**:
- `Day_96B_NoSQL_Deep_Dive` — document (MongoDB), key-value (Redis), column-family (Cassandra) — when to use each
- `Day_96C_Streaming_SQL_Fundamentals` — Kafka concepts, ksqlDB basics, real-time aggregations
- Expand `Phase_Overview.md` to Phase 5 depth standard (add scenario walkthroughs, 2 more exam questions, expert track)
- Add `extras/` with capstone DDL scripts

---

### Phase 9 — Enterprise SQL & Performance Engineering ⚠️ Needs Depth

**Current state**: 12 days (9.2KB). Covers Views, Indexes, Transactions, CTEs, Pivoting, Normalization, JSON/XML, Security, Performance Tuning.

**Gaps identified**:
- **No capstone project** (Phase 8 has one in Days 88–89, Phase 9 ends abruptly at Day 108 with Performance Tuning)
- **Cloud-native SQL** (BigQuery, Snowflake-specific syntax, Redshift Spectrum) not covered
- **Full curriculum capstone** — the entire 108-day journey has no grand finale project
- Phase Overview is 9.2KB vs Phase 5's 20.9KB — major depth gap at the most advanced phase

**Expansion targets**:
- `Day_108B_Cloud_Native_SQL` — BigQuery ML, Snowflake Cortex, Redshift ML
- `Day_108C_Curriculum_Capstone` — end-to-end project: ingest → clean → model → visualize → deploy (uses skills from all 9 phases)
- Expand `Phase_Overview.md` significantly (10–15KB target)
- Add `extras/` with capstone data and solution scaffold

---

## 3. New Phase Proposals

### 🆕 Phase 10: Generative AI & LLM Engineering (12 days)

**Why now**: LLMs are the defining technology of 2025–2026. MBA students need literacy beyond "prompt engineering" — they need to build and evaluate LLM-powered data products.

**Day range**: 109–120

| Day | Topic                                                                    |
| --- | ------------------------------------------------------------------------ |
| 109 | LLM Landscape — GPT-4o, Gemini, Claude, Llama, open vs closed            |
| 110 | Prompt Engineering Mastery — zero-shot, few-shot, chain-of-thought       |
| 111 | LangChain & LlamaIndex — document loaders, chains, memory                |
| 112 | RAG Pipelines — embeddings, vector stores, retrieval strategies          |
| 113 | Fine-Tuning LLMs — LoRA, QLoRA, Unsloth                                  |
| 114 | Evaluation & Guardrails — RAGAS, TruLens, Guardrails AI                  |
| 115 | LLM Agents & Tool Use — ReAct, function calling, multi-agent             |
| 116 | LLM Ops & Cost Management — token optimization, caching, tracing         |
| 117 | Multimodal AI — vision-language models, GPT-4V, Gemini Vision            |
| 118 | AI Product Design — product thinking for LLM features                    |
| 119 | AI Ethics in Practice — bias audits, red-teaming, responsible deployment |
| 120 | Capstone: Build an AI-powered Data Assistant                             |

---

### 🆕 Phase 11: Cloud Data Engineering (12 days, optional specialization)

**Why**: Cloud is the default infrastructure for data in 2026. Phase 3 covers Flask and APIs, but not cloud-native tooling.

**Day range**: 121–132

| Day | Topic                                                                 |
| --- | --------------------------------------------------------------------- |
| 121 | Cloud Fundamentals — AWS/GCP/Azure architecture, IAM, cost management |
| 122 | Object Storage — S3, GCS, Delta Lake, Iceberg table formats           |
| 123 | Cloud Data Warehouses — BigQuery, Snowflake, Redshift architecture    |
| 124 | dbt at Scale — advanced dbt patterns, incremental models, snapshots   |
| 125 | Orchestration — Apache Airflow, Prefect, Dagster                      |
| 126 | Streaming Pipelines — Kafka, Pub/Sub, Kinesis, real-time ETL          |
| 127 | Lakehouse Architecture — Databricks, Unity Catalog, Delta Live Tables |
| 128 | Data Contracts & Quality — Great Expectations, Soda, data SLAs        |
| 129 | Cloud Security & Compliance — VPC, encryption, PII handling           |
| 130 | Cost Engineering — query optimization for $/TB, slot management       |
| 131 | Platform Engineering — infrastructure as code (Terraform) for data    |
| 132 | Capstone: Build and Deploy a Cloud Data Pipeline                      |

---

### 🆕 Phase 12: Analytics Engineering & Data Products (8 days, optional)

**Why**: The "Analytics Engineer" role bridges data engineering and BI — high-demand, high-impact, perfect MBA fit.

**Day range**: 133–140

| Day | Topic                                                                   |
| --- | ----------------------------------------------------------------------- |
| 133 | The Analytics Engineer Role — vs Data Analyst, Data Scientist, DE       |
| 134 | Semantic & Metrics Layers — dbt Metrics, Cube.js, LookML                |
| 135 | Self-Serve Analytics — empowering stakeholders without SQL              |
| 136 | Data Mesh Principles — domain ownership, data products                  |
| 137 | Product Analytics Deep Dive — Amplitude, Mixpanel, retention analysis   |
| 138 | A/B Testing at Scale — experimentation platforms, Statsig, LaunchDarkly |
| 139 | Building Data Products — API-first data, embedded analytics             |
| 140 | Capstone: Design a Data Product for a Business Unit                     |

---

## 4. Content Depth Standards

All lesson `README.md` files should meet the following minimum bar:

| Section                                             | Required?     | Minimum                                    |
| --------------------------------------------------- | ------------- | ------------------------------------------ |
| YAML frontmatter (day, title, duration, difficulty) | ✅ Yes         | Always                                     |
| "Never-Coded" Bridge analogy                        | ✅ Yes         | 1 paragraph                                |
| Core concept explanation                            | ✅ Yes         | 500+ words                                 |
| Code examples                                       | ✅ Yes         | 3+ runnable snippets                       |
| MBA-context sidebar                                 | ✅ Yes         | 1 business use case                        |
| Hands-on exercises                                  | ✅ Yes         | 3 exercises (easy/medium/hard)             |
| Mastery check questions                             | ✅ Yes         | 5 Q&A pairs                                |
| Further reading / tools                             | ✅ Yes         | 3+ links                                   |
| Senior-level insight                                | ⚡ Recommended | 1 "common pitfall" or "production insight" |

**Phase Overview files** should meet:
- 300+ lines minimum
- ROI-by-technique table
- 3-tier skills matrix (foundational / advanced / expert)
- 3+ real-world application scenarios
- 5+ common pitfalls with solutions
- Curated resources (docs, books, communities, conferences)
- 4+ milestone exam questions with hints

---

## 5. Prioritized Expansion Roadmap

### 🔴 Priority 1 — Quick Wins (1–2 weeks to implement)

These fix the most glaring gaps in existing phases:

1. **Expand Phase 2 Overview** to match Phase 5 depth standard
2. **Expand Phase 8 Overview** to match Phase 5 depth standard  
3. **Expand Phase 9 Overview** + add curriculum capstone (Day 108C)
4. **Add `extras/` folders** to Phases 2, 5, 8, 9 with sample datasets
5. **Add Day 36B** (Docker Fundamentals) to Phase 3

### 🟡 Priority 2 — Significant Content Additions (2–4 weeks)

6. **Add Phase 10** (Generative AI & LLM Engineering) — most urgent new phase
7. **Add Day 60B** (LLM Fine-Tuning & PEFT) to Phase 5
8. **Add Day 60C** (RAG & Vector Databases) to Phase 5
9. **Add Day 84B** (dbt Fundamentals) to Phase 7
10. **Add Day 96B** (NoSQL Deep Dive) to Phase 8

### 🟢 Priority 3 — Strategic Additions (1–2 months)

11. **Add Phase 11** (Cloud Data Engineering)
12. **Add Phase 12** (Analytics Engineering & Data Products)
13. **Structural refactor** of Phase 6 (separate ML and BI tracks cleanly)
14. **Add cross-phase "Career Tracks"** page linking specialization paths
15. **Add AI Agents day** (Day 67B) to Phase 6

---

## 6. Cross-Cutting Content Initiatives

### 🔗 Connect-the-Dots Lessons

Each phase boundary should have a "bridge lesson" or section in the Phase Overview that explicitly connects to the next phase. Currently only Phase 1 and 2 do this. Add "What's Next" tables to all Phase Overviews.

### 📊 Capstone Project Scaffolds

Add a `projects/` directory at the curriculum root with portfolio-ready capstone starters:

```
content/projects/
├── 01_python_data_pipeline/     (Phase 1–2 skills)
├── 02_web_dashboard/            (Phase 3 skills)
├── 03_ml_churn_predictor/       (Phase 4–5 skills)
├── 04_bi_analytics_suite/       (Phase 6–7 skills)
├── 05_sql_data_warehouse/       (Phase 8–9 skills)
└── 06_llm_data_assistant/       (Phase 10 skills)
```

### 🎯 MBA-Specific Case Studies

Add a `case-studies/` collection with 10 industry-specific notebooks:

| #   | Industry                              | Technique                     | Phase |
| --- | ------------------------------------- | ----------------------------- | ----- |
| 1   | Retail — Customer Churn               | Logistic Regression, XGBoost  | 4–5   |
| 2   | Finance — Fraud Detection             | Anomaly Detection, GNN        | 5     |
| 3   | Healthcare — Patient Risk             | Ensemble, Probabilistic       | 5     |
| 4   | E-Commerce — Recommendations          | Collaborative Filtering       | 5     |
| 5   | Marketing — Campaign Attribution      | A/B Testing, Causal Inference | 6     |
| 6   | Operations — Demand Forecasting       | Time Series, ARIMA, Prophet   | 5     |
| 7   | HR — Attrition Prediction             | Classification, SHAP          | 4–5   |
| 8   | SaaS — Growth Analytics               | Product Analytics, Cohorts    | 7     |
| 9   | Supply Chain — Inventory Optimization | LP, Simulation                | 4     |
| 10  | Banking — Credit Scoring              | Scorecard, Fairness           | 6     |

### 🧪 Interactive Quizzes Per Day

Each lesson currently has "Mastery Check" Q&A in markdown. These could be structured as JSON for the app's quiz engine:

```
content/lessons/Phase_01.../Day_01_.../
├── README.md          (existing)
└── quiz.json          (NEW — structured Q&A for app integration)
```

Format:
```json
{
  "day": 1,
  "questions": [
    {
      "id": "d01q01",
      "type": "multiple_choice",
      "question": "What is a variable in Python?",
      "options": ["A loop", "A labeled container for data", "A function", "A module"],
      "answer": 1,
      "explanation": "Variables are named storage locations..."
    }
  ]
}
```

---

## 7. 2026 Market Alignment Check

| Skill                   | Current Coverage           | 2026 Demand  | Gap             |
| ----------------------- | -------------------------- | ------------ | --------------- |
| Python fundamentals     | ✅ Phase 1–2                | High         | None            |
| Pandas / NumPy          | ✅ Phase 2                  | High         | None            |
| ML fundamentals         | ✅ Phase 4–5                | High         | None            |
| Deep learning           | ✅ Phase 5                  | High         | None            |
| MLOps                   | ✅ Phase 5 (Day 50, 65)     | Very High    | Light           |
| LLMs / ChatGPT APIs     | ❌ Not covered              | **Critical** | **Major**       |
| RAG & Vector DBs        | ❌ Not covered              | **Critical** | **Major**       |
| AI Agents               | ❌ Not covered              | **Critical** | **Major**       |
| dbt                     | ❌ Not covered              | High         | **Significant** |
| Cloud (AWS/GCP/Azure)   | ⚠️ Phase 8 Day 86 (surface) | Very High    | **Significant** |
| Kafka / Streaming       | ❌ Not covered              | High         | **Significant** |
| BI / Tableau / Power BI | ✅ Phase 6–7                | High         | None            |
| SQL mastery             | ✅ Phase 8–9                | High         | None            |
| Data governance         | ✅ Phase 7–8                | High         | None            |
| Causal inference        | ✅ Phase 6 (Day 63)         | Medium       | None            |
| Responsible AI          | ⚠️ Day 62 (partial)         | High         | Minor           |

**Critical gaps to close before Phase 10**: LLMs, RAG, AI Agents.

---

## 8. Implementation Notes

### Content Quality Checklist (per new lesson)

- [ ] Uses MBA-contextual examples (business scenarios, not toy data)
- [ ] Mentions at least one company using this in production
- [ ] Has Python-runnable code (compatible with Pyodide for browser playground)
- [ ] Includes "Never-Coded" bridge section (analogy for non-programmers)
- [ ] Has 3 exercises increasing in difficulty (easy → medium → hard)
- [ ] Quiz questions added to `quiz.json`
- [ ] Cross-references other days/phases where relevant
- [ ] Phase Overview updated to include the new day

### File Naming Convention

Follow existing pattern:
```
Day_NNN_Topic_Name/
└── README.md
```

New solutions go into the respective phase's `Phase_XX_Solutions.ipynb`.

### Solution Notebooks

Each new day's exercises should be added to the phase's solution notebook with:
1. A markdown cell header: `## Day NNN: Topic Name`
2. Python implementation using `sqlite3` for SQL (Pyodide compatible)
3. A final markdown cell with key takeaways

---

*This strategy is a living document. Update as phases are completed or priorities shift.*
