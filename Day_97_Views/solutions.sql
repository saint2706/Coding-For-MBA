-- 💻 Exercises: Day 97 (Solutions)

-- For these exercises, assume you have a `customers` table with the following columns:
-- - `customer_id` (INTEGER, PRIMARY KEY)
-- - `first_name` (TEXT)
-- - `last_name` (TEXT)
-- - `email` (TEXT)
-- - `country` (TEXT)

-- 1. Create a view named `uk_customers` that shows the first name, last name, and email of all customers from the 'UK'.
CREATE VIEW uk_customers AS
SELECT first_name, last_name, email
FROM customers
WHERE country = 'UK';

-- 2. Create a view named `customer_names` that shows the full name of each customer (concatenating the first and last names).
CREATE VIEW customer_names AS
SELECT first_name || ' ' || last_name AS full_name
FROM customers;

-- 3. Update the `uk_customers` view to also include the `country` column.
CREATE OR REPLACE VIEW uk_customers AS
SELECT first_name, last_name, email, country
FROM customers
WHERE country = 'UK';

-- 4. Select all data from the `uk_customers` view.
SELECT * FROM uk_customers;

-- 5. Drop the `customer_names` view.
DROP VIEW customer_names;
