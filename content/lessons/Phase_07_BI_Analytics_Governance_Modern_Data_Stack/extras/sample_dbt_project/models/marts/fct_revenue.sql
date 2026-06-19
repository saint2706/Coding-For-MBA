-- What: BrightCart's finance-facing fact table — one row per completed order
--       with the customer attributes needed for revenue-by-segment reporting.
-- Why: This is the "single source of truth" table Day 84B and Day 84C labs
--      query directly (and the table a Reverse ETL sync would read from in
--      Day 84C, e.g. pushing high-value customers' lifetime revenue to a CRM).
-- Expected effect: 21 rows (one per completed order; cancelled/pending excluded
--      upstream in int_order_items), totaling $1,697.79, with no nulls in
--      order_id or amount_usd.
{{ config(materialized='table') }}

WITH order_items AS (
    SELECT * FROM {{ ref('int_order_items') }}
),

customers AS (
    SELECT * FROM {{ ref('stg_customers') }}
)

SELECT
    oi.order_id,
    oi.order_date,
    oi.amount_usd,
    oi.customer_id,
    c.customer_name,
    c.country,
    CASE
        WHEN oi.amount_usd >= 100 THEN 'high_value'
        WHEN oi.amount_usd >= 50  THEN 'mid_value'
        ELSE 'low_value'
    END AS order_value_tier
FROM order_items AS oi
LEFT JOIN customers AS c ON oi.customer_id = c.customer_id
