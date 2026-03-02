-- ============================================================
-- Project 04: BI Analytics Suite — SQL Scaffold
-- ============================================================
-- Phase 6–7 skills showcase.
-- Fill in every section marked TODO.
-- Works with SQLite (default) or PostgreSQL.
-- Run via:  python report.py  (which calls sqlite3 internally)
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- SCHEMA SETUP
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS campaign_spend (
    channel       TEXT NOT NULL,
    campaign_date TEXT NOT NULL,   -- YYYY-MM-DD
    spend_usd     REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS campaign_events (
    event_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id   TEXT    NOT NULL,
    channel       TEXT    NOT NULL,
    event_date    TEXT    NOT NULL,   -- YYYY-MM-DD
    event_type    TEXT    NOT NULL,   -- 'impression' | 'click' | 'lead' | 'purchase'
    revenue_usd   REAL    DEFAULT 0,
    cohort_week   TEXT                -- YYYY-WNN, e.g. '2024-W01'
);


-- ════════════════════════════════════════════════════════════
-- MILESTONE 1 — Seed Sample Data (run once)
-- ════════════════════════════════════════════════════════════

-- Spend data: 3 channels × 6 months
INSERT OR IGNORE INTO campaign_spend (channel, campaign_date, spend_usd) VALUES
  ('email',       '2024-01-01', 5000),  ('email',       '2024-02-01', 5200),
  ('email',       '2024-03-01', 4800),  ('email',       '2024-04-01', 5100),
  ('email',       '2024-05-01', 5500),  ('email',       '2024-06-01', 5300),
  ('paid_search', '2024-01-01', 22000), ('paid_search', '2024-02-01', 23500),
  ('paid_search', '2024-03-01', 21000), ('paid_search', '2024-04-01', 24000),
  ('paid_search', '2024-05-01', 25000), ('paid_search', '2024-06-01', 26000),
  ('social',      '2024-01-01', 8000),  ('social',      '2024-02-01', 9000),
  ('social',      '2024-03-01', 8500),  ('social',      '2024-04-01', 9200),
  ('social',      '2024-05-01', 9800),  ('social',      '2024-06-01', 10000);


-- ════════════════════════════════════════════════════════════
-- MILESTONE 2 — Channel ROI View
-- ════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS vw_channel_roi;

CREATE VIEW vw_channel_roi AS
-- TODO: Join campaign_events (filter event_type = 'purchase') with campaign_spend
--       on channel + strftime('%Y-%m', event_date) = strftime('%Y-%m', campaign_date).
--       Aggregate:
--         - total_revenue : SUM(revenue_usd)
--         - total_spend   : SUM(spend_usd)
--         - roi_pct       : (total_revenue - total_spend) / total_spend * 100
--       Add MoM revenue growth using LAG(total_revenue) OVER (PARTITION BY channel ORDER BY month).
--
-- Expected columns: channel, month, total_revenue, total_spend, roi_pct, revenue_mom_growth_pct
SELECT
    'TODO' AS channel,
    'TODO' AS month,
    0.0    AS total_revenue,
    0.0    AS total_spend,
    0.0    AS roi_pct,
    0.0    AS revenue_mom_growth_pct;


-- ════════════════════════════════════════════════════════════
-- MILESTONE 3 — Funnel Analysis View
-- ════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS vw_funnel;

CREATE VIEW vw_funnel AS
-- TODO: Count events per channel per month by event_type using CASE+SUM or FILTER.
--       Calculate:
--         - ctr       : clicks / NULLIF(impressions, 0) * 100
--         - lead_rate : leads  / NULLIF(clicks, 0)     * 100
--         - cvr       : purchases / NULLIF(leads, 0)   * 100
--
-- Expected columns: channel, month, impressions, clicks, leads, purchases,
--                   ctr, lead_rate, cvr
SELECT
    'TODO' AS channel,
    'TODO' AS month,
    0      AS impressions,
    0      AS clicks,
    0      AS leads,
    0      AS purchases,
    0.0    AS ctr,
    0.0    AS lead_rate,
    0.0    AS cvr;


-- ════════════════════════════════════════════════════════════
-- MILESTONE 4 — Multi-Touch Attribution View
-- ════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS vw_attribution;

CREATE VIEW vw_attribution AS
-- TODO: For each converted customer (those with a 'purchase' event):
--       1. Find all prior touchpoints (clicks/leads) for that customer.
--       2. Linear attribution: divide the purchase revenue equally across all
--          touchpoints.
--       3. Aggregate attributed_revenue per channel.
--
-- Hint: Use a CTE to identify converted customers, then JOIN back to all
--       their pre-purchase events, then divide revenue by the touchpoint count.
--
-- Expected columns: channel, attributed_revenue_linear, attributed_revenue_last_touch
SELECT
    'TODO' AS channel,
    0.0    AS attributed_revenue_linear,
    0.0    AS attributed_revenue_last_touch;


-- ════════════════════════════════════════════════════════════
-- MILESTONE 5 — Cohort Retention View
-- ════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS vw_cohort_retention;

CREATE VIEW vw_cohort_retention AS
-- TODO: For each cohort_week + acquisition_channel:
--       1. Count the week-0 cohort size (distinct customers who had first event).
--       2. Count how many of those customers returned in week 4
--          (had any event 28 days after their first event).
--       3. Calculate: retention_rate = week4_customers / cohort_size * 100.
--
-- Expected columns: cohort_week, channel, cohort_size, week4_customers, retention_rate
SELECT
    'TODO' AS cohort_week,
    'TODO' AS channel,
    0      AS cohort_size,
    0      AS week4_customers,
    0.0    AS retention_rate;


-- ════════════════════════════════════════════════════════════
-- MILESTONE 6 — Anomaly Detection (CTR spikes)
-- ════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS vw_ctr_anomalies;

CREATE VIEW vw_ctr_anomalies AS
-- TODO: Use a CTE to calculate daily CTR per channel.
--       Then use window functions to compute:
--         - rolling_mean : AVG(ctr) OVER (7-day window)
--         - rolling_std  : (manual via variance calculation or a subquery)
--       Flag rows where ctr > rolling_mean + 2 * rolling_std as anomaly = 1.
--
-- Expected columns: channel, event_date, ctr, rolling_mean, rolling_std, is_anomaly
SELECT
    'TODO' AS channel,
    'TODO' AS event_date,
    0.0    AS ctr,
    0.0    AS rolling_mean,
    0.0    AS rolling_std,
    0      AS is_anomaly;
