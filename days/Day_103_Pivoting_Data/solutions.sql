-- 💻 Exercises: Day 103 (Solutions)

-- For these exercises, assume you have a `quarterly_sales` table with the following columns:
-- - `product_id` (INTEGER)
-- - `quarter` (TEXT) -- e.g., 'Q1', 'Q2', 'Q3', 'Q4'
-- - `sales_amount` (REAL)

-- 1. Write a query to pivot the `quarterly_sales` data to show the total sales for each product for each quarter.
--    The output should have the following columns: `product_id`, `Q1_sales`, `Q2_sales`, `Q3_sales`, `Q4_sales`.
SELECT
    product_id,
    SUM(CASE WHEN quarter = 'Q1' THEN sales_amount ELSE 0 END) AS Q1_sales,
    SUM(CASE WHEN quarter = 'Q2' THEN sales_amount ELSE 0 END) AS Q2_sales,
    SUM(CASE WHEN quarter = 'Q3' THEN sales_amount ELSE 0 END) AS Q3_sales,
    SUM(CASE WHEN quarter = 'Q4' THEN sales_amount ELSE 0 END) AS Q4_sales
FROM quarterly_sales
GROUP BY product_id;

-- 2. Assume you have a `monthly_expenses` table with `department_id`, `month`, and `expense_amount` columns.
--    Write a query to pivot this data to show the total expenses for each department for each month.
--    The output should have the following columns: `department_id`, `Jan_expenses`, `Feb_expenses`, `Mar_expenses`, etc.
SELECT
    department_id,
    SUM(CASE WHEN month = 'Jan' THEN expense_amount ELSE 0 END) AS Jan_expenses,
    SUM(CASE WHEN month = 'Feb' THEN expense_amount ELSE 0 END) AS Feb_expenses,
    SUM(CASE WHEN month = 'Mar' THEN expense_amount ELSE 0 END) AS Mar_expenses,
    -- ... and so on for the other months
    SUM(CASE WHEN month = 'Dec' THEN expense_amount ELSE 0 END) AS Dec_expenses
FROM monthly_expenses
GROUP BY department_id;
