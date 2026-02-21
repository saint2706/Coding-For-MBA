-- schema_ecommerce.sql — Phase 8 Extras
-- E-commerce database schema for capstone DDL exercises.
-- Includes intentional design choices to discuss in class
-- (normalization, indexing).

-- ============================================================
-- CORE TABLES
-- ============================================================

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    country_code CHAR(2) NOT NULL DEFAULT 'IN',
    segment VARCHAR(50) NOT NULL DEFAULT 'consumer'
    CHECK (segment IN ('enterprise', 'smb', 'consumer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    sku VARCHAR(100) NOT NULL UNIQUE,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
    cost_price NUMERIC(12, 2) NOT NULL CHECK (cost_price >= 0),
    inventory_qty INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers (customer_id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (
        status IN (
            'pending',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'refunded'
        )
    ),
    total_amount NUMERIC(12, 2) NOT NULL,
    discount_code VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders (order_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products (product_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12, 2) GENERATED ALWAYS AS (
        quantity * unit_price
    ) STORED
);

-- ============================================================
-- PARTITIONED TABLE (Phase 9 Topic)
-- ============================================================

CREATE TABLE page_events (
    event_id BIGSERIAL,
    event_date DATE NOT NULL,
    customer_id INTEGER REFERENCES customers (customer_id),
    event_type VARCHAR(50) NOT NULL,
    page_url TEXT,
    session_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (event_date);

-- Create monthly partitions
CREATE TABLE page_events_2025_01 PARTITION OF page_events
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE page_events_2025_02 PARTITION OF page_events
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
-- ... Add more months as needed

-- ============================================================
-- INDEXES (discuss trade-offs in class)
-- ============================================================

-- Customers: support login lookup and segment filtering
CREATE INDEX idx_customers_email ON customers (email);
CREATE INDEX idx_customers_segment ON customers (segment);

-- Orders: support customer history and date-range queries
CREATE INDEX idx_orders_customer_date ON orders (customer_id, order_date DESC);
CREATE INDEX idx_orders_status ON orders (status) WHERE status NOT IN (
    'delivered', 'cancelled'
);

-- Order items: support product sales analysis
CREATE INDEX idx_order_items_product ON order_items (product_id);

-- Page events: partial index on active session lookups
CREATE INDEX idx_events_session ON page_events (session_id, event_date)
WHERE session_id IS NOT NULL;

-- ============================================================
-- VIEWS (convenience)
-- ============================================================

CREATE VIEW vw_order_summary AS
SELECT
    o.order_id,
    o.order_date,
    o.status,
    c.email,
    c.segment,
    o.total_amount AS stored_total,
    COUNT(oi.item_id) AS item_count,
    SUM(oi.total_price) AS calculated_total
FROM orders AS o
INNER JOIN customers AS c ON o.customer_id = c.customer_id
LEFT JOIN order_items AS oi ON o.order_id = oi.order_id
GROUP BY o.order_id, o.order_date, o.status, c.email, c.segment, o.total_amount;

-- ============================================================
-- EXERCISE PROMPTS (solve these)
-- ============================================================

-- Exercise 1: Find the top 3 products by revenue in each category
-- (Hint: ROW_NUMBER() window function)

-- Exercise 2: Find customers who placed orders in Jan 2025 but NOT in Feb 2025
-- (Hint: EXISTS / NOT EXISTS or EXCEPT)

-- Exercise 3: Calculate the 7-day rolling average revenue
-- per customer segment
-- (Hint: SUM() OVER (PARTITION BY segment ORDER BY order_date
-- ROWS BETWEEN 6 PRECEDING AND CURRENT ROW))

-- Exercise 4: Find all "orphan" order_items where the parent order is cancelled
-- (Hint: JOIN + WHERE status = 'cancelled')

-- Exercise 5: Write a query using the EXPLAIN ANALYZE plan to tune
-- "Get all orders for customer X in the last 90 days"
-- EXPLAIN ANALYZE SELECT ...
-- WHERE customer_id = X
--   AND order_date >= NOW() - INTERVAL '90 days';
