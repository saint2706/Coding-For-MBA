-- 💻 Exercises: Day 104 (Solutions)

-- Consider the following unnormalized table:
-- `orders` table:
-- - `order_id` (INTEGER, PRIMARY KEY)
-- - `customer_name` (TEXT)
-- - `customer_address` (TEXT)
-- - `product_id` (INTEGER)
-- - `product_name` (TEXT)
-- - `product_price` (REAL)
-- - `quantity` (INTEGER)

-- How would you normalize this table to 3NF?

-- You would create the following tables:

-- `customers` table:
-- - `customer_id` (INTEGER, PRIMARY KEY)
-- - `customer_name` (TEXT)
-- - `customer_address` (TEXT)

-- `products` table:
-- - `product_id` (INTEGER, PRIMARY KEY)
-- - `product_name` (TEXT)
-- - `product_price` (REAL)

-- `orders` table:
-- - `order_id` (INTEGER, PRIMARY KEY)
-- - `customer_id` (INTEGER, FOREIGN KEY to customers.customer_id)

-- `order_items` table:
-- - `order_item_id` (INTEGER, PRIMARY KEY)
-- - `order_id` (INTEGER, FOREIGN KEY to orders.order_id)
-- - `product_id` (INTEGER, FOREIGN KEY to products.product_id)
-- - `quantity` (INTEGER)
