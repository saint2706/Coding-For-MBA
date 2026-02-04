-- 💻 Exercises: Day 94 (Solutions)

-- For these exercises, assume you have a `sales` table with the following columns:
-- - `sale_id` (INTEGER, PRIMARY KEY)
-- - `product_id` (INTEGER)
-- - `customer_id` (INTEGER)
-- - `sale_date` (DATE)
-- - `amount` (REAL)
-- - `region` (TEXT)

-- 1. Select all sales from the 'North' region.
SELECT *
FROM sales
WHERE region = 'North';

-- 2. Select the total amount of sales for each region, ordered by the total amount in descending order.
SELECT region, SUM(amount) AS total_sales
FROM sales
GROUP BY region
ORDER BY total_sales DESC;

-- 3. Select the average sale amount for each product, only for products that have an average sale amount greater than 100.
SELECT product_id, AVG(amount) AS avg_sale_amount
FROM sales
GROUP BY product_id
HAVING AVG(amount) > 100;

-- 4. Select the number of sales per customer for customer_id 123.
SELECT customer_id, COUNT(*) AS num_sales
FROM sales
WHERE customer_id = 123
GROUP BY customer_id;

-- 5. Select all sales from the last 30 days.
SELECT *
FROM sales
WHERE sale_date >= date('now', '-30 days');
