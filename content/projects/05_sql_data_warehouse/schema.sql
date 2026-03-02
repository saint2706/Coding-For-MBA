-- ============================================================
-- Project 05: SQL Data Warehouse — DDL Scaffold
-- ============================================================
-- Phase 8–9 skills showcase.
-- Fill in every section marked TODO.
-- Compatible with SQLite (run via etl.py) and PostgreSQL.
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- MILESTONE 1 — Dimension Tables
-- ════════════════════════════════════════════════════════════

-- ── dim_date ────────────────────────────────────────────────
-- Pre-populated date spine (2020-01-01 → 2026-12-31).
-- The ETL script generates all rows; you just need the schema.

CREATE TABLE IF NOT EXISTS dim_date (
    date_key    INTEGER PRIMARY KEY,  -- YYYYMMDD integer surrogate key
    full_date   TEXT    NOT NULL UNIQUE,
    year        INTEGER NOT NULL,
    quarter     INTEGER NOT NULL,
    month       INTEGER NOT NULL,
    month_name  TEXT    NOT NULL,
    week        INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    is_weekend  INTEGER NOT NULL DEFAULT 0  -- 1=True, 0=False
    -- TODO: Add day_name TEXT, fiscal_year INTEGER, fiscal_quarter INTEGER
);

-- ── dim_product ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dim_product (
    product_key   INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id    TEXT    NOT NULL UNIQUE,
    product_name  TEXT    NOT NULL,
    category      TEXT    NOT NULL,
    subcategory   TEXT,
    brand         TEXT,
    unit_cost_usd REAL    NOT NULL DEFAULT 0.0
    -- TODO: Add is_active INTEGER DEFAULT 1, effective_from TEXT, effective_to TEXT
    --       (slowly changing dimension Type 2 pattern)
);

-- ── dim_customer ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dim_customer (
    customer_key    INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id     TEXT    NOT NULL UNIQUE,
    customer_name   TEXT,
    region          TEXT    NOT NULL,
    segment         TEXT    NOT NULL,  -- 'Consumer' | 'Corporate' | 'Home Office'
    signup_date     TEXT
    -- TODO: Add city TEXT, country TEXT DEFAULT 'US',
    --       lifetime_orders INTEGER DEFAULT 0
);

-- ── dim_channel ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dim_channel (
    channel_key  INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_name TEXT    NOT NULL UNIQUE,  -- 'web' | 'mobile' | 'store' | 'marketplace'
    channel_type TEXT    NOT NULL          -- 'digital' | 'physical'
);

-- Seed standard channels
INSERT OR IGNORE INTO dim_channel (channel_name, channel_type) VALUES
  ('web',         'digital'),
  ('mobile',      'digital'),
  ('store',       'physical'),
  ('marketplace', 'digital');


-- ════════════════════════════════════════════════════════════
-- MILESTONE 1 (continued) — Fact Table
-- ════════════════════════════════════════════════════════════

-- ── fact_sales ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fact_sales (
    sale_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id        TEXT    NOT NULL,
    order_date_key  INTEGER NOT NULL REFERENCES dim_date(date_key),
    product_key     INTEGER NOT NULL REFERENCES dim_product(product_key),
    customer_key    INTEGER NOT NULL REFERENCES dim_customer(customer_key),
    channel_key     INTEGER NOT NULL REFERENCES dim_channel(channel_key),
    -- Measures
    quantity        INTEGER NOT NULL DEFAULT 1,
    revenue_usd     REAL    NOT NULL,
    cost_usd        REAL    NOT NULL DEFAULT 0.0,
    discount_usd    REAL    NOT NULL DEFAULT 0.0,
    is_returned     INTEGER NOT NULL DEFAULT 0
    -- TODO: Add profit_usd as generated column (PostgreSQL) or computed in ETL
    -- TODO: Add shipping_days INTEGER, shipping_cost_usd REAL
);


-- ════════════════════════════════════════════════════════════
-- MILESTONE 2 — Indexes & Constraints
-- ════════════════════════════════════════════════════════════

-- TODO: Add a composite index on fact_sales(order_date_key, product_key)
-- CREATE INDEX IF NOT EXISTS idx_fact_date_product ON fact_sales(order_date_key, product_key);

-- TODO: Add an index on fact_sales(customer_key)
-- CREATE INDEX IF NOT EXISTS idx_fact_customer ON fact_sales(customer_key);

-- TODO: Add a partial index for returned orders only
-- (SQLite supports partial indexes with a WHERE clause)
-- CREATE INDEX IF NOT EXISTS idx_fact_returns ON fact_sales(channel_key) WHERE is_returned = 1;


-- ════════════════════════════════════════════════════════════
-- MILESTONE 4 — Analytical Views
-- ════════════════════════════════════════════════════════════

-- ── vw_monthly_revenue ───────────────────────────────────────

DROP VIEW IF EXISTS vw_monthly_revenue;

CREATE VIEW vw_monthly_revenue AS
-- TODO: Using a CTE, aggregate fact_sales by year + month (join dim_date).
--       Compute:
--         - total_revenue   : SUM(revenue_usd)
--         - total_orders    : COUNT(DISTINCT order_id)
--         - total_profit    : SUM(revenue_usd - cost_usd - discount_usd)
--         - mom_growth_pct  : using LAG(total_revenue) OVER (ORDER BY year, month)
--
-- Expected columns: year, month, total_revenue, total_orders, total_profit, mom_growth_pct
SELECT
    0     AS year,
    0     AS month,
    0.0   AS total_revenue,
    0     AS total_orders,
    0.0   AS total_profit,
    0.0   AS mom_growth_pct;


-- ── vw_product_performance ───────────────────────────────────

DROP VIEW IF EXISTS vw_product_performance;

CREATE VIEW vw_product_performance AS
-- TODO: For each product (join dim_product), compute:
--         - total_revenue
--         - units_sold   : SUM(quantity)
--         - return_rate  : SUM(is_returned) / COUNT(*) * 100
--         - revenue_rank : RANK() OVER (PARTITION BY category ORDER BY total_revenue DESC)
--
-- Expected columns: product_id, product_name, category, total_revenue,
--                   units_sold, return_rate, revenue_rank
SELECT
    'TODO' AS product_id,
    'TODO' AS product_name,
    'TODO' AS category,
    0.0    AS total_revenue,
    0      AS units_sold,
    0.0    AS return_rate,
    0      AS revenue_rank;


-- ── vw_customer_ltv ──────────────────────────────────────────

DROP VIEW IF EXISTS vw_customer_ltv;

CREATE VIEW vw_customer_ltv AS
-- TODO: For each customer (join dim_customer), compute RFM segments:
--         - recency     : days since last order (use MAX(full_date))
--         - frequency   : number of distinct orders
--         - monetary    : total revenue
--         - ltv_segment : CASE WHEN monetary > 5000 THEN 'High'
--                              WHEN monetary > 1000 THEN 'Mid'
--                              ELSE 'Low' END
--
-- Expected columns: customer_id, region, segment, recency_days,
--                   frequency, monetary, ltv_segment
SELECT
    'TODO' AS customer_id,
    'TODO' AS region,
    'TODO' AS segment,
    0      AS recency_days,
    0      AS frequency,
    0.0    AS monetary,
    'TODO' AS ltv_segment;
