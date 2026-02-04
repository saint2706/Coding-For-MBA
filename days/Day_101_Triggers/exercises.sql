-- 💻 Exercises: Day 101

-- For these exercises, assume you have the following tables:
-- `products` table:
-- - `product_id` (INTEGER, PRIMARY KEY)
-- - `product_name` (TEXT)
-- - `price` (REAL)

-- `price_history` table:
-- - `history_id` (INTEGER, PRIMARY KEY)
-- - `product_id` (INTEGER)
-- - `old_price` (REAL)
-- - `new_price` (REAL)
-- - `change_date` (DATETIME)

-- 1. Create a trigger that automatically inserts a new row into the `price_history` table whenever the price of a product is updated.

-- 2. Create a trigger that prevents the deletion of a product if its price is greater than 100.

-- 3. Create a trigger that automatically sets the `change_date` to the current date and time when a new row is inserted into the `price_history` table.
