-- What: Cleans raw BrightCart order records into one analysis-ready row per order.
-- Why: Downstream marts (fct_revenue) should never read straight from `raw` —
--      staging is where casts, renames, and light cleaning happen exactly once.
-- Expected effect: same row count as raw_orders (25 rows in the seed data),
--      with `amount_usd` as a float and `status` lowercased/trimmed.
{{ config(materialized='view') }}

SELECT
    id                                  AS order_id,
    customer_id,
    created_at,
    LOWER(TRIM(status))                 AS status,
    CAST(amount_cents AS DOUBLE) / 100  AS amount_usd,
    CAST(created_at AS DATE)            AS order_date
FROM {{ source('raw', 'raw_orders') }}
