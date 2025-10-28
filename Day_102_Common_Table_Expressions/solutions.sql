-- 💻 Exercises: Day 102 (Solutions)

-- For these exercises, assume you have an `employees` table with the following columns:
-- - `employee_id` (INTEGER, PRIMARY KEY)
-- - `first_name` (TEXT)
-- - `last_name` (TEXT)
-- - `manager_id` (INTEGER) -- This column references `employee_id`

-- 1. Use a CTE to find all employees who have a manager.
WITH HasManager AS (
    SELECT *
    FROM employees
    WHERE manager_id IS NOT NULL
)
SELECT *
FROM HasManager;

-- 2. Use a CTE to find the number of employees reporting to each manager.
WITH ManagerCounts AS (
    SELECT manager_id, COUNT(*) AS num_employees
    FROM employees
    WHERE manager_id IS NOT NULL
    GROUP BY manager_id
)
SELECT m.first_name, m.last_name, mc.num_employees
FROM employees m
JOIN ManagerCounts mc ON m.employee_id = mc.manager_id;


-- 3. Use a recursive CTE to find the entire organizational hierarchy starting from the CEO (the employee with no manager).
WITH RECURSIVE EmployeeHierarchy AS (
    -- Anchor member: the CEO
    SELECT employee_id, first_name, last_name, manager_id, 0 AS level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive member: employees who report to the previous level
    SELECT e.employee_id, e.first_name, e.last_name, e.manager_id, eh.level + 1
    FROM employees e
    JOIN EmployeeHierarchy eh ON e.manager_id = eh.employee_id
)
SELECT *
FROM EmployeeHierarchy;
