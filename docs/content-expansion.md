# Content Strategy & Expansion Plan

> A roadmap for scaling the "Coding for MBA" curriculum from 108 days to comprehensive mastery.

This document outlines the strategic plan for expanding the curriculum, filling content gaps, and ensuring long-term relevance for business professionals.

## 🎯 Core Objectives

1. **Completeness**: Ensure every day of the 108-day curriculum meets the "Gold Standard" depth (500+ words, 3 exercises, 5 quiz questions).
2. **Relevance**: Align content with 2026 market demands (AI Agents, Cloud Data Engineering, Analytics Engineering).
3. **Engagement**: Increase interactivity through specialized widgets (SQL runners, Chart builders, Kanban boards).
4. **Differentiation**: Focus on the *business application* of technical skills (ROI, KPI design, Decision Science).

## 🗺️ Curriculum Roadmap

### Phase 10: Generative AI & LLMs (Days 109–120) [Completed]
- **Focus**: Building RAG pipelines, Prompt Engineering, and AI Agents.
- **Status**: ✅ Implemented. Needs final polish and `quiz.json` integration.

### Phase 11: Cloud Data Engineering (Days 121–132) [Planned]
- **Focus**: AWS/GCP/Azure fundamentals, Data Warehousing, and Orchestration.
- **Key Topics**:
  - Cloud Architecture (S3, IAM, EC2)
  - Data Warehouses (BigQuery, Snowflake)
  - Workflow Orchestration (Airflow, Prefect)
  - Data Lakes & Lakehouses (Databricks)

### Phase 12: Analytics Engineering (Days 133–140) [Planned]
- **Focus**: The modern data stack, dbt, and data modeling.
- **Key Topics**:
  - The Analytics Engineer Role
  - dbt (Data Build Tool) Mastery
  - Semantic Layers & Metrics
  - Data Quality & Observability (Great Expectations)

### Phase 13: Financial Modeling & Quant (Future)
- **Focus**: Python for Finance, Monte Carlo Simulations, Algorithmic Trading basics.

### Phase 14: Web3 & Decentralized Data (Future)
- **Focus**: Blockchain analytics, Solidity basics, On-chain data querying.

## 🛠️ Content Improvement Initiatives

### 1. The "Gold Standard" Audit
Every existing lesson (Days 1–108) will be audited against the following criteria:
- **Length**: Minimum 500 words of instructional content.
- **Interactivity**: At least 3 interactive widgets (CodePlayground, ExerciseWidget, etc.).
- **Assessment**: At least 5 mastery check questions.
- **Business Context**: Explicit "MBA Takeaway" or "ROI Analysis" section.

### 2. "Gap Filling" Days
We have identified specific gaps in the current curriculum that need dedicated lessons:
- `Day_37B`: Probability & Statistics for ML
- `Day_60B`: LLM Fine-Tuning & PEFT
- `Day_84B`: dbt Fundamentals
- `Day_96B`: NoSQL Deep Dive (Mongo, Redis)

### 3. Capstone Projects
Major milestone projects to be added as "Phase Finales":
- **Phase 3**: Web Dashboard (Streamlit/Flask)
- **Phase 5**: End-to-End Churn Prediction Model
- **Phase 9**: Enterprise Data Warehouse Design
- **Phase 10**: Corporate Knowledge Base RAG System

## 📊 Maintenance & Quality Assurance

- **Link Rot**: Monthly automated checks for broken external links.
- **Version Pinning**: Annual review of Python/Pandas/React versions in code examples.
- **Feedback Loop**: User feedback widget on every lesson page to flag confusing sections.

## 🚀 Contribution Priorities
*See `docs/todo.md` for the current active task list.*

1. **High**: Write missing content for Phase 2 & 8 Overviews.
2. **Medium**: Create `quiz.json` files for all Phase 1 lessons.
3. **Low**: Add "Further Reading" links to early Python days.
