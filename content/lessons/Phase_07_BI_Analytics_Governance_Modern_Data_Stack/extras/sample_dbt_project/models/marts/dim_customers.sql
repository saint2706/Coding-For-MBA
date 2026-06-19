-- What: BrightCart's customer dimension — one row per active customer with
--       lifetime order metrics aggregated from fct_revenue.
-- Why: BI tools (and the Day 84C semantic layer / reverse-ETL sync) join to
--      this table rather than re-deriving "lifetime_orders" or "lifetime_revenue"
--      logic in every dashboard or CRM sync job.
-- Expected effect: 18 rows (the 18 active customers from stg_customers);
--      customers with zero completed orders show lifetime_revenue_usd = 0,
--      not NULL (see COALESCE below).
{{ config(materialized='table') }}

WITH customers AS (
    SELECT * FROM {{ ref('stg_customers') }}
),

revenue AS (
    SELECT
        customer_id,
        COUNT(*)         AS lifetime_orders,
        SUM(amount_usd)  AS lifetime_revenue_usd
    FROM {{ ref('fct_revenue') }}
    GROUP BY customer_id
)

SELECT
    c.customer_id,
    c.customer_name,
    c.email,
    c.country,
    c.sign_up_date,
    COALESCE(r.lifetime_orders, 0)        AS lifetime_orders,
    COALESCE(r.lifetime_revenue_usd, 0.0) AS lifetime_revenue_usd
FROM customers AS c
LEFT JOIN revenue AS r ON c.customer_id = r.customer_id
