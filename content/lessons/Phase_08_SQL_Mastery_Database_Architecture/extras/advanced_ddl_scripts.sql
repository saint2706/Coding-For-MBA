-- Advanced DDL Scripts — E-Commerce Data Warehouse
-- Reference: Phase 8 SQL Mastery & Database Architecture
--
-- This script demonstrates advanced DDL patterns:
-- partitioning, materialized views, constraints, and indexes.

-- ─── Partitioned Fact Table ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fact_orders (
    order_id         BIGINT       NOT NULL,
    customer_id      BIGINT       NOT NULL,
    product_id       BIGINT       NOT NULL,
    order_date       DATE         NOT NULL,
    quantity         INTEGER      NOT NULL CHECK (quantity > 0),
    unit_price       DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    discount_pct     DECIMAL(5,2) DEFAULT 0 CHECK (discount_pct BETWEEN 0 AND 100),
    total_amount     DECIMAL(12,2) GENERATED ALWAYS AS (
        quantity * unit_price * (1 - discount_pct / 100)
    ) STORED,
    shipping_cost    DECIMAL(8,2) DEFAULT 0,
    payment_method   VARCHAR(30)  NOT NULL,
    order_status     VARCHAR(20)  NOT NULL DEFAULT 'pending',
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (order_id, order_date),

    CONSTRAINT chk_order_status CHECK (
        order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned')
    )
) PARTITION BY RANGE (order_date);

-- Monthly partitions for efficient date-range queries
CREATE TABLE fact_orders_2025_01 PARTITION OF fact_orders
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE fact_orders_2025_02 PARTITION OF fact_orders
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE fact_orders_2025_03 PARTITION OF fact_orders
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');


-- ─── Dimension Tables (Star Schema) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dim_customers (
    customer_id      BIGINT       PRIMARY KEY,
    first_name       VARCHAR(50)  NOT NULL,
    last_name        VARCHAR(50)  NOT NULL,
    email            VARCHAR(255) UNIQUE NOT NULL,
    segment          VARCHAR(20)  NOT NULL DEFAULT 'standard',
    lifetime_value   DECIMAL(12,2) DEFAULT 0,
    first_order_date DATE,
    region           VARCHAR(50),
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_segment CHECK (
        segment IN ('standard', 'premium', 'enterprise', 'churned')
    )
);

CREATE TABLE IF NOT EXISTS dim_products (
    product_id       BIGINT       PRIMARY KEY,
    product_name     VARCHAR(200) NOT NULL,
    category         VARCHAR(100) NOT NULL,
    subcategory      VARCHAR(100),
    brand            VARCHAR(100),
    cost_price       DECIMAL(10,2) NOT NULL,
    list_price       DECIMAL(10,2) NOT NULL,
    margin_pct       DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN list_price > 0
            THEN ((list_price - cost_price) / list_price * 100)
            ELSE 0
        END
    ) STORED,
    is_active        BOOLEAN      DEFAULT TRUE,
    launch_date      DATE
);

CREATE TABLE IF NOT EXISTS dim_dates (
    date_key         DATE         PRIMARY KEY,
    year             SMALLINT     NOT NULL,
    quarter          SMALLINT     NOT NULL,
    month            SMALLINT     NOT NULL,
    week_of_year     SMALLINT     NOT NULL,
    day_of_week      SMALLINT     NOT NULL,
    day_name         VARCHAR(10)  NOT NULL,
    is_weekend       BOOLEAN      NOT NULL,
    is_holiday       BOOLEAN      DEFAULT FALSE,
    fiscal_quarter   VARCHAR(6)   -- 'FY25Q1'
);


-- ─── Indexes for Query Performance ──────────────────────────────────────────

CREATE INDEX idx_orders_customer ON fact_orders (customer_id);
CREATE INDEX idx_orders_product  ON fact_orders (product_id);
CREATE INDEX idx_orders_status   ON fact_orders (order_status) WHERE order_status != 'delivered';
CREATE INDEX idx_customers_email ON dim_customers (email);
CREATE INDEX idx_products_cat    ON dim_products (category, subcategory);


-- ─── Analytical Views ───────────────────────────────────────────────────────

-- Monthly revenue by category (materialized for dashboard performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_category_revenue AS
SELECT
    d.year,
    d.month,
    p.category,
    COUNT(DISTINCT o.order_id)        AS total_orders,
    COUNT(DISTINCT o.customer_id)     AS unique_customers,
    SUM(o.total_amount)               AS total_revenue,
    AVG(o.total_amount)               AS avg_order_value,
    SUM(o.total_amount) - LAG(SUM(o.total_amount)) OVER (
        PARTITION BY p.category ORDER BY d.year, d.month
    ) AS mom_revenue_change
FROM fact_orders o
JOIN dim_products p ON o.product_id = p.product_id
JOIN dim_dates d    ON o.order_date = d.date_key
WHERE o.order_status NOT IN ('cancelled', 'returned')
GROUP BY d.year, d.month, p.category;

-- Customer cohort analysis view
CREATE VIEW v_customer_cohorts AS
WITH first_purchase AS (
    SELECT
        customer_id,
        DATE_TRUNC('month', MIN(order_date)) AS cohort_month
    FROM fact_orders
    WHERE order_status NOT IN ('cancelled', 'returned')
    GROUP BY customer_id
)
SELECT
    fp.cohort_month,
    DATE_TRUNC('month', o.order_date) AS activity_month,
    COUNT(DISTINCT o.customer_id)     AS active_customers,
    SUM(o.total_amount)               AS cohort_revenue
FROM first_purchase fp
JOIN fact_orders o ON fp.customer_id = o.customer_id
WHERE o.order_status NOT IN ('cancelled', 'returned')
GROUP BY fp.cohort_month, DATE_TRUNC('month', o.order_date)
ORDER BY fp.cohort_month, activity_month;
