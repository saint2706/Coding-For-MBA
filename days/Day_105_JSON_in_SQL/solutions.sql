-- 💻 Exercises: Day 105 (Solutions)

-- For these exercises, assume you have a `products` table with the following columns:
-- - `product_id` (INTEGER, PRIMARY KEY)
-- - `details` (JSON)

-- The `details` column contains a JSON object with the following structure:
-- {
--   "name": "Product Name",
--   "price": 123.45,
--   "specs": {
--     "weight": "1.2kg",
--     "color": "blue"
--   }
-- }

-- 1. Write a query to extract the name of each product.
SELECT json_extract(details, '$.name') AS product_name
FROM products;

-- 2. Write a query to find all products with a price greater than 100.
SELECT *
FROM products
WHERE json_extract(details, '$.price') > 100;

-- 3. Write a query to extract the color of each product.
SELECT json_extract(details, '$.specs.color') AS color
FROM products;

-- 4. Write a query to find all products that are blue.
SELECT *
FROM products
WHERE json_extract(details, '$.specs.color') = 'blue';
