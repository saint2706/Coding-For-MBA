-- What: Enriches each completed order with a deterministic single line-item
--       (this demo seed only tracks order-level totals, not SKU-level detail,
--       so each order becomes exactly one "item" carrying the full order amount).
-- Why: Real BrightCart order_items would have N rows per order (one per SKU).
--      Modeling this as its own intermediate layer means fct_revenue and any
--      future `fct_order_items` mart can both build on the same join logic
--      without recomputing it. This is the seam where you'd plug in a real
--      `raw.order_items` source if/when BrightCart exposes SKU-level data.
-- Expected effect: one row per completed order (22 of the 25 seed orders —
--      3 are 'pending' or 'cancelled' and are filtered out here).
{{ config(materialized='ephemeral') }}

SELECT
    o.order_id,
    o.customer_id,
    o.order_date,
    o.status,
    o.amount_usd,
    1 AS line_item_count
FROM {{ ref('stg_orders') }} AS o
WHERE o.status = 'completed'
