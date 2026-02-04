-- 💻 Exercises: Day 108 (Solutions)

-- 1. You have a query: `SELECT * FROM customers WHERE country = 'USA';`
--    What is one way you could improve the performance of this query?
--    You could create an index on the `country` column. This would allow the database to quickly find all the rows for 'USA' without having to scan the entire table.

-- 2. You have a query that joins three large tables. The query is running very slowly.
--    What is the first thing you should do to investigate the performance issue?
--    You should use the `EXPLAIN` statement to view the query execution plan. This will show you how the database is executing the query and can help you identify bottlenecks, such as full table scans or inefficient join methods.

-- 3. You have a table with 10 million rows. You frequently run queries that filter on the `status` column.
--    What should you do to improve the performance of these queries?
--    You should create an index on the `status` column. If the `status` column has a low cardinality (i.e., only a few distinct values), a bitmap index might be more efficient than a B-tree index, depending on the database system.
