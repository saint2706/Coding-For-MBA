# 📈 Project 04: BI Analytics Suite

> **Phases covered**: Phase 6 (Cutting-Edge ML) · Phase 7 (BI, Analytics & Governance)  
> **Difficulty**: Intermediate → Advanced  
> **Estimated time**: 5–8 hours

---

## 🎯 Project Overview

Build a **Business Intelligence analytics suite** combining advanced SQL analytics
and business-ready visualisations. You will write a library of reusable SQL views
and stored procedures, then connect them to a Tableau/Power BI–style report or a
Python-based equivalent.

This project proves you can:

- Write production-quality analytical SQL (window functions, CTEs, subqueries) (Phase 7–8)
- Translate raw data into board-ready KPI dashboards (Phase 7)
- Apply governance best practices (access controls, data lineage documentation) (Phase 7)

---

## 📋 Business Scenario

**MarketingCo** runs campaigns across email, social, and paid search channels.
The CMO wants a **single source of truth** for campaign performance with these views:

| Report | Description |
| ------ | ----------- |
| Channel ROI | Revenue ÷ spend per channel with MoM trend |
| Funnel Analysis | Impression → Click → Lead → Purchase conversion by channel |
| Attribution Model | First-touch, last-touch, and linear multi-touch attribution |
| Cohort Retention | Week-0 cohort vs Week-4 retention by acquisition channel |
| Anomaly Alerts | Campaigns with CTR or CVR more than 2 std devs from rolling mean |

---

## 🗂️ Project Structure

```
04_bi_analytics_suite/
├── README.md    ← this file
├── queries.sql  ← SQL scaffold (fill in the TODOs)
└── report.py    ← Python report builder scaffold
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 6 | A/B testing analysis, causal inference basics |
| Phase 7 | BI tools, KPI design, data governance, semantic layer |
| Phase 8 | CTEs, window functions, subqueries |

---

## ✅ Milestones

### Milestone 1 — Schema & Sample Data

- [ ] Run the `CREATE TABLE` and `INSERT` statements in `queries.sql` in SQLite or PostgreSQL
- [ ] Verify row counts with `SELECT COUNT(*) FROM campaign_events`

### Milestone 2 — Channel ROI View

- [ ] Complete `vw_channel_roi`: aggregates spend and revenue by channel + month
- [ ] Add MoM revenue growth using `LAG()` window function
- [ ] Verify: each row represents one channel + month combination

### Milestone 3 — Funnel Analysis

- [ ] Complete `vw_funnel`: counts impressions, clicks, leads, purchases per channel
- [ ] Calculate `ctr`, `lead_rate`, `cvr` as derived columns
- [ ] Verify: row-level conversion rates sum logically (ctr ≤ 100%)

### Milestone 4 — Multi-Touch Attribution

- [ ] Complete `vw_attribution`: credit each touchpoint proportionally (linear model)
- [ ] Compare to a last-touch version in a UNION query

### Milestone 5 — Cohort Retention

- [ ] Complete `vw_cohort_retention`: week-0 cohort size and week-4 retention rate
- [ ] Group by `acquisition_channel` and `cohort_week`

### Milestone 6 — Anomaly Detection in SQL

- [ ] Use window functions to compute rolling mean and std of CTR per channel
- [ ] Flag rows where `ctr > rolling_mean + 2 * rolling_std`

### Milestone 7 — Python Report Builder

- [ ] Run all views from `report.py`, load results into DataFrames
- [ ] Print a formatted summary and save charts to `output/`

---

## 🚀 Getting Started

```bash
# SQLite approach (no installation needed)
python report.py

# PostgreSQL approach:
# psql -U postgres -f queries.sql
```

---

## 🏆 Stretch Goals

- [ ] Export as a Tableau `.hyper` extract using `tableauhyperapi`
- [ ] Publish to Power BI via REST API
- [ ] Add Row Level Security so each regional manager only sees their data
- [ ] Write dbt models for the views (connect to Day 84B dbt Fundamentals)

---

## 📚 Reference Lessons

- Day 72–84: BI tools, Tableau, Power BI, KPI design (Phase 7)
- Day 84B: dbt Fundamentals
- Day 97–108: Advanced SQL — window functions, CTEs, stored procedures (Phase 9)
- Day 138: A/B Testing at Scale (Phase 12)

---

*Happy analysing! Export your funnel chart as a PNG and include it in your portfolio.*
