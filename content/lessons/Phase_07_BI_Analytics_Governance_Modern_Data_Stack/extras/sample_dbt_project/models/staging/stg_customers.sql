-- What: Cleans raw BrightCart customer records (renames, casing, country lookup).
-- Why: BI consumers should see `customer_segment`-ready, human-readable fields,
--      not the raw signup export with mixed-case names and ISO country codes.
-- Expected effect: 20 rows in, 18 rows out (2 inactive customers filtered —
--      ids 106 and 115 have is_active = false in the seed data).
{{ config(materialized='view') }}

SELECT
    id                                          AS customer_id,
    INITCAP(Name)                               AS customer_name,
    LOWER(TRIM(Email))                          AS email,
    CASE country_code
        WHEN 'US' THEN 'United States'
        WHEN 'IN' THEN 'India'
        WHEN 'GB' THEN 'United Kingdom'
        ELSE 'Other'
    END                                          AS country,
    CAST(sign_up_date AS DATE)                  AS sign_up_date,
    is_active
FROM {{ source('raw', 'raw_customers') }}
WHERE is_active = true
