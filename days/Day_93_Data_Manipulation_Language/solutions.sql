-- 💻 Exercises: Day 93 (Solutions)

-- For these exercises, assume you have a `products` table with the following columns:
-- - `product_id` (INTEGER, PRIMARY KEY)
-- - `name` (TEXT)
-- - `price` (REAL)
-- - `quantity` (INTEGER)

-- 1. Insert a new product into the `products` table with the following details:
--    - `product_id`: 1
--    - `name`: 'Laptop'
--    - `price`: 1200.00
--    - `quantity`: 10
INSERT INTO products (product_id, name, price, quantity)
VALUES (1, 'Laptop', 1200.00, 10);

-- 2. Insert another product into the `products` table:
--    - `product_id`: 2
--    - `name`: 'Mouse'
--    - `price`: 25.00
--    - `quantity`: 50
INSERT INTO products (product_id, name, price, quantity)
VALUES (2, 'Mouse', 25.00, 50);

-- 3. Update the price of the 'Laptop' to 1150.00.
UPDATE products
SET price = 1150.00
WHERE name = 'Laptop';

-- 4. Decrease the quantity of the 'Mouse' by 5.
UPDATE products
SET quantity = quantity - 5
WHERE name = 'Mouse';

-- 5. Delete the product with `product_id` 1.
DELETE FROM products
WHERE product_id = 1;
