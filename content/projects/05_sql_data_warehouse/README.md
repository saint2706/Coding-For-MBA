# 🗄️ Project 05: SQL Data Warehouse

> **Phases covered**: Phase 8 (SQL Mastery & Database Architecture) · Phase 9 (Enterprise SQL Performance Engineering)  
> **Difficulty**: Advanced  
> **Estimated time**: 8–12 hours

---

## 🎯 Project Overview

Design and build a **production-grade SQL data warehouse** from scratch: dimensional
model (star schema), full DDL, ETL pipeline, analytical views, and a suite of
performance-tuning techniques.

This project proves you can:

- Design a normalised star schema for an e-commerce warehouse (Phase 8)
- Write DDL, constraints, indexes, and partitioning (Phase 8–9)
- Build an ETL pipeline from raw CSV to clean warehouse tables (Phase 8)
- Write advanced analytical SQL using CTEs and window functions (Phase 9)
- Tune query performance using EXPLAIN and indexes (Phase 9)

---

## 📋 Business Scenario

**ShopStream** is an e-commerce company with 5 M orders/year. Their reporting team
complains that their current flat `orders` table takes 45 seconds to query.
You will redesign the database as a **star schema data warehouse** and optimise it
to sub-second query times.

**Star Schema Design:**

```
          ┌─────────────┐
          │  dim_date   │
          └──────┬──────┘
                 │
┌──────────┐  ┌──┴────────┐  ┌─────────────┐
│ dim_product│─┤ fact_sales│─┤  dim_customer│
└──────────┘  └──┬────────┘  └─────────────┘
                 │
          ┌──────┴──────┐
          │  dim_channel│
          └─────────────┘
```

---

## 🗂️ Project Structure

```
05_sql_data_warehouse/
├── README.md   ← this file
├── schema.sql  ← DDL scaffold (fill in the TODOs)
└── etl.py      ← ETL pipeline scaffold (fill in the TODOs)
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 8 | Star schema, DDL, foreign keys, indexes, normalization |
| Phase 9 | CTEs, window functions, materialized views, partitioning, EXPLAIN |

---

## ✅ Milestones

### Milestone 1 — Dimensional Model DDL (Phase 8)

- [ ] Create `dim_date` with date spine from 2020-01-01 to 2026-12-31
- [ ] Create `dim_product` with product metadata and category hierarchy
- [ ] Create `dim_customer` with customer segments
- [ ] Create `dim_channel` (web, mobile, store, marketplace)
- [ ] Create `fact_sales` with surrogate keys, measures, and foreign keys

### Milestone 2 — Indexes & Constraints (Phase 8–9)

- [ ] Add a composite index on `fact_sales(order_date_key, product_key)`
- [ ] Add a partial index on `fact_sales(channel_key) WHERE is_returned = 1`
- [ ] Add `NOT NULL` constraints on all dimension keys in `fact_sales`
- [ ] Add a `CHECK` constraint that `revenue_usd >= 0`

### Milestone 3 — ETL Pipeline (Phase 8)

- [ ] `extract()`: generate / load raw orders CSV into a DataFrame
- [ ] `transform()`: clean, deduplicate, compute derived fields
- [ ] `load_dimensions()`: upsert into dimension tables
- [ ] `load_fact()`: insert transformed rows into `fact_sales`
- [ ] `run_etl()`: orchestrate extract → transform → load with error handling

### Milestone 4 — Analytical Views (Phase 9)

- [ ] `vw_monthly_revenue`: monthly revenue with MoM growth (CTE + LAG)
- [ ] `vw_product_performance`: revenue, units, return rate, revenue rank per category
- [ ] `vw_customer_ltv`: lifetime value per customer with RFM segments

### Milestone 5 — Performance Tuning (Phase 9)

- [ ] Run `EXPLAIN QUERY PLAN` on the slowest analytical query
- [ ] Identify missing index and add it
- [ ] Re-run and compare query plan output
- [ ] Document the improvement in a comment block

---

## 🚀 Getting Started

```bash
pip install pandas numpy

python etl.py
# Expected: "✅ ETL complete — 50,000 fact rows loaded in <N>s"
```

---

## 🏆 Stretch Goals

- [ ] Port the schema to PostgreSQL and test with `psycopg2`
- [ ] Add table partitioning by year on `fact_sales`
- [ ] Create a materialized view for `vw_monthly_revenue` with auto-refresh
- [ ] Add dbt models on top of the warehouse (connect to Day 84B)

---

## 📚 Reference Lessons

- Day 85–96: SQL Mastery — DDL, DML, joins, subqueries (Phase 8)
- Day 97–108: Enterprise SQL — window functions, indexing, CTEs, procedures (Phase 9)
- Day 84B: dbt Fundamentals
- Day 108B: Curriculum Capstone (full reference implementation)

---

*Happy warehousing! Measure your before/after query times and include them in your portfolio README.*
