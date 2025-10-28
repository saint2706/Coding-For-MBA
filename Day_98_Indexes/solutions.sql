-- 💻 Exercises: Day 98 (Solutions)

-- For these exercises, assume you have a `employees` table with the following columns:
-- - `employee_id` (INTEGER, PRIMARY KEY)
-- - `first_name` (TEXT)
-- - `last_name` (TEXT)
-- - `email` (TEXT)
-- - `hire_date` (DATE)

-- 1. Create an index on the `last_name` column of the `employees` table.
CREATE INDEX idx_employees_last_name ON employees (last_name);

-- 2. Create a unique index on the `email` column of the `employees` table.
CREATE UNIQUE INDEX idx_employees_email ON employees (email);

-- 3. Assume you have a `salaries` table with `employee_id` and `salary` columns. Create a composite index on the `employee_id` and `salary` columns.
CREATE INDEX idx_salaries_employee_salary ON salaries (employee_id, salary);

-- 4. Drop the index on the `last_name` column.
DROP INDEX idx_employees_last_name;
