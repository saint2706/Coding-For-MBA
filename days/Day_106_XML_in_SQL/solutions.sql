-- 💻 Exercises: Day 106 (Solutions)

-- For these exercises, assume you have a `products` table with the following columns:
-- - `product_id` (INTEGER, PRIMARY KEY)
-- - `data` (XML)

-- The `data` column contains an XML document with the following structure:
-- <product>
--   <name>Product Name</name>
--   <price>123.45</price>
--   <specs>
--     <weight>1.2kg</weight>
--     <color>blue</color>
--   </specs>
-- </product>

-- Note: The following solutions use SQL Server syntax. The exact syntax may vary depending on the database you are using.

-- 1. Write a query to extract the name of each product.
SELECT data.value('(/product/name)[1]', 'varchar(50)') AS name
FROM products;

-- 2. Write a a query to find all products with a price greater than 100.
SELECT *
FROM products
WHERE data.value('(/product/price)[1]', 'decimal(18, 2)') > 100;

-- 3. Write a query to extract the color of each product.
SELECT data.value('(/product/specs/color)[1]', 'varchar(50)') AS color
FROM products;

-- 4. Write a query to find all products that are blue.
SELECT *
FROM products
WHERE data.value('(/product/specs/color)[1]', 'varchar(50)') = 'blue';
