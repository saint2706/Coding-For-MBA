-- 💻 Exercises: Day 96 (Solutions)

-- For these exercises, assume you have the following tables:
-- `products` table:
-- - `product_id` (INTEGER, PRIMARY KEY)
-- - `product_name` (TEXT)
-- - `category_id` (INTEGER)
-- - `price` (REAL)

-- `categories` table:
-- - `category_id` (INTEGER, PRIMARY KEY)
-- - `category_name` (TEXT)

-- 1. Write a query to find all products that are in the 'Electronics' category.
SELECT *
FROM products
WHERE category_id = (SELECT category_id FROM categories WHERE category_name = 'Electronics');

-- 2. Write a query to find all products with a price greater than the average price of all products.
SELECT *
FROM products
WHERE price > (SELECT AVG(price) FROM products);

-- 3. Write a query to find all categories that have at least one product with a price greater than 100.
SELECT *
FROM categories
WHERE category_id IN (SELECT DISTINCT category_id FROM products WHERE price > 100);

-- 4. Write a query to find the names of all products that have a price greater than the price of all products in the 'Books' category.
SELECT product_name
FROM products
WHERE price > (SELECT MAX(price) FROM products WHERE category_id = (SELECT category_id FROM categories WHERE category_name = 'Books'));

-- 5. Write a correlated subquery to find all products that have a price greater than the average price of products in their own category.
SELECT *
FROM products p1
WHERE price > (
    SELECT AVG(price)
    FROM products p2
    WHERE p2.category_id = p1.category_id
);
