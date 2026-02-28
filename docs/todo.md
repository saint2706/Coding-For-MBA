# 📋 TODO — Coding for MBA

> **Unified roadmap** — app features, curriculum expansion, DX improvements, and
> long-horizon ideas.  
> Stack: **Vite 7 · React 19 · TypeScript 5.9 · motion · zustand · zod · react-hot-toast · canvas-confetti**

*Last updated: Feb 26, 2026*

---

## ✅ Completed

> **Audit update (2026-02-28):** Re-validated items marked complete against current codebase and in-app surfacing. Tasks found partially implemented have been moved back to incomplete with notes.

<details>
<summary>Click to expand completed items</summary>

### Quick Wins — already shipped

- [x] Toast feedback on progress save, exercise submission, theme toggle
- [x] Confetti on quiz ace, phase unlock, lesson complete, full-curriculum finale
- [x] Zod schemas for lesson frontmatter + build-time validation
- [x] Page transitions (AnimatePresence fade + slide)
- [x] Staggered card entrance, spring-physics progress bar, hover lift
- [x] Parallax hero, scroll-triggered fade-in lessons, animated stats counters
- [x] `layoutId` shared transitions, masonry stagger for concept graph
- [x] Zustand progress store + persist middleware
- [x] Quiz attempt tracking, per-question analytics, spaced repetition surfacing
- [x] User preferences store (theme, sidebar, font-size, code lang, density)
- [x] Time-on-page / study streak / weekly chart / total learning time
- [x] Glassmorphism dark-mode cards, animated gradient mesh hero
- [x] Breadcrumb trail, "continue where you left off" banner
- [x] Keyboard shortcut overlay (`?`)
- [x] XP + badge gamification layer on Progress page
- [x] Vite 7 module preload optimisation, bundle analysis script
- [x] Playwright visual regression + reduced-motion tests
- [x] Zustand + Zod unit tests
- [x] Strict TypeScript `satisfies` patterns, error boundaries with toast fallbacks

</details>

---

## 🔴 Priority 1 — Curriculum (do next)

*These fix the most critical content gaps identified in the curriculum audit.*

### Phase Overviews — Depth Upgrades

> **Validation note (2026-02-27):** Cross-checked Agent-P2, Agent-P8, and Agent-P9 overview updates against underlying `Day_*/README.md` lesson scope and sequence. Section coverage is now explicitly evidenced in the overview docs (skills matrix, ROI tables, scenario walkthroughs, exam prompts, cloud-native/capstone bridges), and all listed Phase 2/8/9 overview depth criteria are now satisfied.

- [x] **Phase 2 Overview** — expanded to Phase 5 depth standard (300+ lines, ROI table, 3-tier skills matrix, 5+ pitfalls, 4+ exam Qs)
- [x] **Phase 8 Overview** — scenario walkthroughs, 2+ milestone exam questions, expert track, and `extras/` folder are now present
- [x] **Phase 9 Overview** — Cloud-native SQL section and curriculum capstone preview are present; >15 KB length is acceptable for this overview

### Gap-Filling Lesson Days

- [x] `Day_37B_Probability_and_Statistics_for_ML` — distributions, Bayes theorem, CLT (prerequisite for Phase 5 Day 54)
- [x] `Day_37C_Sklearn_Pipelines` — Pipeline, ColumnTransformer, custom transformers, CV
- [x] `Day_36B_Docker_Fundamentals` — containers, images, Compose for data apps (Phase 3 bonus)
- [x] `Day_60B_LLM_Fine_Tuning_and_PEFT` — LoRA, QLoRA, Hugging Face PEFT library
- [x] `Day_60C_RAG_and_Vector_Databases` — embeddings, ChromaDB, LangChain RAG pipeline
- [x] `Day_84B_dbt_Fundamentals` — models, refs, tests, docs, dbt Cloud
- [x] `Day_96B_NoSQL_Deep_Dive` — MongoDB, Redis, Cassandra — when to use each

### Extras/ Folders

- [x] Add `extras/` to Phase 2 (sample DataFrames, advanced Pandas notebooks)
- [x] Add `extras/` to Phase 5 (PEFT configs, RAG starters)
- [x] Add `extras/` to Phase 8 (DDL scripts, sample datasets)
- [x] Add `extras/` to Phase 9 (capstone data + solution scaffold)

---

## 🟡 Priority 2 — New Phases & Major Content

### Phase 10 — Generative AI & LLM Engineering (Days 109–120) ✅ Complete

> Phase already implemented. Audit & polish pass needed.

- [x] Verify all 12 day files meet the content depth standard (500+ words, 3+ exercises, 5 Q&A)
- [x] Add `quiz.json` to each Phase 10 day
- [x] Phase 10 Overview polish — ensure ROI table and expert track are present
- [x] Add `extras/` with LLM starter notebooks and prompt library

### Phase 11 — Cloud Data Engineering (Days 121–132) ✅ Complete

- [x] `Day_121_Cloud_Fundamentals` — AWS/GCP/Azure architecture, IAM, cost management
- [x] `Day_122_Object_Storage` — S3, GCS, Delta Lake, Iceberg table formats
- [x] `Day_123_Cloud_Data_Warehouses` — BigQuery, Snowflake, Redshift architecture
- [x] `Day_124_dbt_at_Scale` — incremental models, snapshots, advanced patterns
- [x] `Day_125_Orchestration` — Apache Airflow, Prefect, Dagster
- [x] `Day_126_Streaming_Pipelines` — Kafka, Pub/Sub, Kinesis, real-time ETL
- [x] `Day_127_Lakehouse_Architecture` — Databricks, Unity Catalog, Delta Live Tables
- [x] `Day_128_Data_Contracts_and_Quality` — Great Expectations, Soda, data SLAs
- [x] `Day_129_Cloud_Security_and_Compliance` — VPC, encryption, PII handling
- [x] `Day_130_Cost_Engineering` — query optimisation for $/TB, slot management
- [x] `Day_131_Platform_Engineering` — Terraform for data infrastructure
- [x] `Day_132_Capstone_Cloud_Data_Pipeline` — end-to-end cloud pipeline project
- [ ] Phase 11 Overview (300+ lines) _(audit: current overview is 135 lines; content exists and is surfaced, but depth target not yet met)_

### Phase 12 — Analytics Engineering & Data Products (Days 133–140) ✅ Complete

- [x] `Day_133_Analytics_Engineer_Role` — vs Data Analyst, Data Scientist, DE
- [x] `Day_134_Semantic_and_Metrics_Layers` — dbt Metrics, Cube.js, LookML
- [x] `Day_135_Self_Serve_Analytics` — empowering stakeholders without SQL
- [x] `Day_136_Data_Mesh_Principles` — domain ownership, data products
- [x] `Day_137_Product_Analytics_Deep_Dive` — retention, funnels, cohort analysis
- [x] `Day_138_AB_Testing_at_Scale` — statistical rigor, experimentation platforms
- [x] `Day_139_Data_Products_and_Monetization` — API-first data, embedded analytics
- [x] `Day_140_Capstone_Data_Product` — design a data product for a business unit
- [x] Phase 12 Overview

### Additional Gap-Filling Days

- [x] `Day_68_AI_Agents_and_Tool_Use` — LangChain/LlamaIndex agents, function calling, ReAct (Phase 6)
- [x] `Day_69_Responsible_AI_in_Practice` — model cards, Fairlearn, audit reporting (Phase 6)
- [x] `Day_84C_Reverse_ETL_and_Semantic_Layer` — Hightouch concepts, operational analytics (Phase 7)
- [x] `Day_96C_Streaming_SQL_Fundamentals` — Kafka concepts, ksqlDB basics, real-time aggregations (Phase 8)
- [x] `Day_108C_Cloud_Native_SQL` — BigQuery ML, Snowflake Cortex, Redshift ML
- [x] `Day_108B_Curriculum_Capstone` — ingest → clean → model → visualise → deploy (all 9+ phases)

---

## 🟢 Priority 3 — App Features

### AI-Powered Study Assistant

- [ ] "Ask about this lesson" — LLM API integration (OpenAI / Gemini) _(audit: Gemini implementation exists and is surfaced in `AiStudyPanel`, but OpenAI path is not implemented)_
- [ ] Auto-generate flashcards from lesson markdown _(audit: generation flow exists, but flashcard cards are mouse-only `div` click targets with no keyboard interaction semantics; accessibility pass still needed)_
- [x] Smart exercise hint system (3-level progressive hints)
- [x] Semantic search across all lesson content (embeddings + cosine similarity)

### Structured Quiz JSON Integration

Each lesson day needs a `quiz.json` sidecar for the app's quiz engine:

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

- [ ] Script: `scripts/generate-quiz-stubs.js` — scaffold `quiz.json` for all days that don't have one
- [ ] App: `QuizEngine` component reads `quiz.json`, replaces markdown mastery-check section
- [ ] App: wrong-answer analytics surfaced in the spaced-repetition store

### Capstone Project Scaffolds (`content/projects/`)

- [ ] `01_python_data_pipeline/` — Phase 1–2 skills showcase
- [ ] `02_web_dashboard/` — Phase 3 Flask/Streamlit project
- [ ] `03_ml_churn_predictor/` — Phase 4–5 end-to-end ML model
- [ ] `04_bi_analytics_suite/` — Phase 6–7 Tableau/Power BI + SQL
- [ ] `05_sql_data_warehouse/` — Phase 8–9 full DDL + ETL
- [ ] `06_llm_data_assistant/` — Phase 10 RAG / agent demo

### MBA Case Studies (`content/case-studies/`)

- [ ] 01 — Retail Customer Churn (Logistic Regression, XGBoost) — Phase 4–5
- [ ] 02 — Finance Fraud Detection (Anomaly Detection, GNN) — Phase 5
- [ ] 03 — Healthcare Patient Risk (Ensemble, Probabilistic) — Phase 5
- [ ] 04 — E-Commerce Recommendations (Collaborative Filtering) — Phase 5
- [ ] 05 — Marketing Campaign Attribution (A/B Testing, Causal Inference) — Phase 6
- [ ] 06 — Operations Demand Forecasting (Time Series, ARIMA, Prophet) — Phase 5
- [ ] 07 — HR Attrition Prediction (Classification, SHAP) — Phase 4–5
- [ ] 08 — SaaS Growth Analytics (Cohorts, Product Analytics) — Phase 7
- [ ] 09 — Supply Chain Inventory (LP, Simulation) — Phase 4
- [ ] 10 — Banking Credit Scoring (Scorecard, Fairness) — Phase 6

### Collaborative Features

- [ ] Shareable progress link (base64-encoded state)
- [ ] "Challenge a friend" — send quiz links
- [ ] Discussion prompts at the end of each lesson

### Offline / PWA Support

- [ ] Service Worker for offline lesson reading
- [ ] Cache lesson markdown on first visit
- [ ] Offline progress tracking with sync-on-reconnect
- [ ] PWA manifest for "Add to Home Screen"

---

## 🔵 Priority 4 — DX & Infrastructure

### Content Quality Automation

- [ ] `scripts/audit-lessons.js` — verify all days meet depth standard (500+ words, 3 exercises, 5 Q&A)
- [ ] `scripts/generate-quiz-stubs.js` — scaffold missing `quiz.json` files
- [ ] `scripts/check-phase-overviews.js` — flag overviews below 300 lines / 10 KB
- [ ] CI gate: fail build if any lesson fails the depth audit

### Cross-Phase "Career Tracks" Page

- [ ] Design "career tracks" routing: Data Scientist / Analytics Engineer / ML Engineer tracks
- [ ] App page linking days by specialisation
- [ ] "What's Next" sidebar section on each phase overview page

### Advanced Visualisations

- [ ] Skill radar chart on Progress page
- [ ] Heatmap calendar of study activity (GitHub-style)
- [ ] Animated dependency tree of tech concepts
- [ ] 3D concept graph (Three.js / React Three Fiber) — stretch goal

### Testing

- [ ] Increase unit test coverage to 80%+
- [ ] Snapshot tests for all major page components
- [ ] Accessibility audit (axe-core) in CI

### 2026 Market Alignment — Gap Tracker

| Skill                 | Coverage               | 2026 Demand  | Action                     |
| --------------------- | ---------------------- | ------------ | -------------------------- |
| Python fundamentals   | ✅ Phase 1–2            | High         | —                          |
| Pandas / NumPy        | ✅ Phase 2              | High         | —                          |
| ML fundamentals       | ✅ Phase 4–5            | High         | —                          |
| Deep learning         | ✅ Phase 5              | High         | —                          |
| MLOps                 | ✅ Phase 5 (Day 50, 65) | Very High    | Minor depth increase       |
| LLMs / GPT APIs       | ✅ Phase 10             | **Critical** | Polish pass                |
| RAG & Vector DBs      | ✅ Phase 10 (Day 112)   | **Critical** | Add Day 60C cross-ref      |
| AI Agents             | ✅ Phase 10 (Day 115)   | **Critical** | Add Day 67B Phase 6 bridge |
| dbt                   | ⚠️ Day 84B (planned)    | High         | Implement P1               |
| Cloud (AWS/GCP/Azure) | ⚠️ Phase 8 surface only | Very High    | Add Phase 11               |
| Kafka / Streaming     | ⚠️ Day 96C (planned)    | High         | Implement P2               |
| BI / Tableau          | ✅ Phase 6–7            | High         | —                          |
| SQL mastery           | ✅ Phase 8–9            | High         | —                          |
| Data governance       | ✅ Phase 7–8            | High         | —                          |
| Responsible AI        | ⚠️ Day 62 (partial)     | High         | Add Day 67C Phase 6        |

---

## 🌌 Ambitious / Long-Horizon

- [ ] Multi-user mode: instructor dashboard, cohort progress overview
- [ ] AI-graded exercise submissions (code execution sandbox)
- [ ] Video lesson stubs — embed Loom / YouTube per day
- [ ] Phase 13: Financial Modelling & Quant Finance (Python, Monte Carlo, Black-Scholes)
- [ ] Phase 14: Web3 & Decentralised Data (Solidity basics, on-chain analytics)
- [ ] Localisation: Spanish & Mandarin translations of lesson summaries
- [ ] Mobile app (React Native): offline-first lesson reader with push-notification streaks

---

*This is a living document. Update priorities as phases are completed or the market shifts.*
