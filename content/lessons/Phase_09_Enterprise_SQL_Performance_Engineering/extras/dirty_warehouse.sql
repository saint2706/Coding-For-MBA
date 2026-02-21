-- dirty_warehouse.sql — Phase 9 Extras
-- A deliberately messy data warehouse scenario
-- for performance tuning exercises.
-- Students must identify problems and apply Phase 9 techniques to fix them.

-- ============================================================
-- PROBLEM SETUP: The Slow Analytics Warehouse
-- This schema has 7 deliberate problems to identify and fix.
-- ============================================================

-- ❌ Problem 1: No partitioning on a huge, time-series table
-- 3 years × 1M events/day = 1B row table with no partitions
CREATE TABLE raw_events (
    event_id BIGSERIAL PRIMARY KEY,
    event_date TIMESTAMPTZ NOT NULL,
    user_id INTEGER,
    session_id UUID,
    event_type VARCHAR(100),
    page_url TEXT,
    metadata TEXT,  -- ❌ Problem 2: JSON stored as TEXT, not JSONB
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- TODO: Partition by event_date (range partitioning by month)
-- TODO: Convert metadata to JSONB with GIN index

-- ❌ Problem 3: Daily summary computed at query time (no materialized view)
CREATE VIEW v_daily_user_activity AS
SELECT
    user_id,
    DATE(event_date) AS activity_day,
    COUNT(*) AS event_count,
    COUNT(DISTINCT session_id) AS session_count,
    COUNT(DISTINCT page_url) AS unique_pages
FROM raw_events
GROUP BY 1, 2;
-- This runs against 1B rows every time a dashboard loads!
-- TODO: Convert to MATERIALIZED VIEW with daily refresh

-- ❌ Problem 4: No indexes on frequently-queried columns
-- The following queries are typed daily but have no supporting indexes:
-- SELECT * FROM raw_events
-- WHERE user_id = 12345
-- ORDER BY event_date DESC LIMIT 50;
-- SELECT * FROM raw_events
-- WHERE event_type = 'purchase'
--   AND event_date >= NOW() - INTERVAL '7 days';
-- TODO: Add appropriate indexes

-- ❌ Problem 5: Org hierarchy in a flat table (recursive query nightmare)
CREATE TABLE employees_flat (
    employee_id INTEGER PRIMARY KEY,
    employee_name VARCHAR(255),
    manager_id INTEGER,  -- Self-referential FK
    department VARCHAR(100),
    salary NUMERIC(12, 2)
);
-- TODO: Write a Recursive CTE to get the full org tree under a given manager
-- TODO: Calculate total salary cost for an entire subtree

-- ❌ Problem 6: Multi-tenant table with no RLS (all tenants see all data)
CREATE TABLE tenant_reports (
    report_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL,
    report_name VARCHAR(255),
    report_content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- BUG: Any user can see any tenant's reports!
-- TODO: Enable RLS and create isolation policy
-- TODO: Add tenant_id index for policy performance

-- ❌ Problem 7: No audit trail on sensitive data changes
CREATE TABLE customer_data (
    customer_id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    email VARCHAR(255) NOT NULL,
    credit_score INTEGER,
    annual_income NUMERIC(14, 2),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Changes to credit_score and annual_income are not tracked
-- TODO: Create audit_log table + AFTER UPDATE trigger
-- TODO: Prevent recursive trigger execution with pg_trigger_depth()

-- ============================================================
-- EXERCISES
-- ============================================================

-- Exercise 1: Fix the Partitioning
-- Recreate raw_events as a partitioned table (PARTITION BY RANGE on event_date)
-- Add monthly child tables for Jan 2024 through Dec 2025
-- Verify partition pruning with EXPLAIN on a date-filtered query

-- Exercise 2: Create the Materialized View
-- Build mv_daily_user_activity from the VIEW above
-- Add a unique index on (day, user_id) to support CONCURRENTLY refresh
-- Write the pg_cron job to refresh it nightly at 2 AM

-- Exercise 3: Index Design
-- For each of these 3 query patterns,
-- argue whether B-Tree, partial, or BRIN is best:
--   A. WHERE user_id = ? ORDER BY event_date DESC LIMIT 50
--   B. WHERE event_type = 'purchase'
--      AND event_date >= NOW() - INTERVAL '7 days'
--   C. WHERE event_date BETWEEN '2024-01-01' AND '2024-12-31' (bulk analytics)

-- Exercise 4: Recursive CTE
-- Using employees_flat, write a Recursive CTE that:
--   - Starts at employee_id = 1 (CEO)
--   - Traverses all 5 levels
--     of hierarchy
--   - Returns: employee_name, level, salary, cumulative_subtree_cost
--     (salary sum of entire subtree below each node)
--   - Adds cycle detection using ARRAY path tracking

-- Exercise 5: Row Level Security
-- Enable RLS on tenant_reports
-- Create a policy using current_setting('app.tenant_id')
-- Demonstrate: SET app.tenant_id = '...';
-- SELECT * FROM tenant_reports; -- should only see own rows
-- Check EXPLAIN to verify index is being used

-- Exercise 6: Audit Trigger
-- Create audit_log table with:
-- log_id, table_name, action, old_credit_score,
-- new_credit_score, changed_by, changed_at
-- Create AFTER UPDATE trigger on customer_data that:
--   - Only fires when credit_score changes
--   - Uses pg_trigger_depth() guard
--   - Logs OLD and NEW values, plus current_user
-- Test: UPDATE customer_data SET credit_score = 750 WHERE customer_id = '...';
-- Verify: SELECT * FROM audit_log;

-- Exercise 7: EXPLAIN ANALYZE Tuning
-- Run EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
-- on each of the following and identify the bottleneck:
-- Q1: SELECT COUNT(*) FROM raw_events WHERE metadata LIKE '%purchase%';
--     (Bottleneck: TEXT column, use JSONB + index instead)
-- Q2: SELECT * FROM v_daily_user_activity WHERE day = CURRENT_DATE - 7;
--     (Bottleneck: View forces full scan of 1B rows)
-- Q3: SELECT * FROM tenant_reports; -- run as a tenant user
--     (Bottleneck: No RLS or missing tenant_id index)
