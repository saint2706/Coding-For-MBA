-- 💻 Exercises: Day 95 (Solutions)

-- For these exercises, assume you have the following tables:
-- `employees` table:
-- - `employee_id` (INTEGER, PRIMARY KEY)
-- - `first_name` (TEXT)
-- - `last_name` (TEXT)
-- - `department_id` (INTEGER)

-- `departments` table:
-- - `department_id` (INTEGER, PRIMARY KEY)
-- - `department_name` (TEXT)

-- 1. Write a query to find the first name, last name, and department name of each employee.
SELECT e.first_name, e.last_name, d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id;

-- 2. Write a query to find the department name and the number of employees in each department.
SELECT d.department_name, COUNT(e.employee_id) AS num_employees
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id
GROUP BY d.department_name;

-- 3. Write a query to find the first name and last name of all employees in the 'Sales' department.
SELECT e.first_name, e.last_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id
WHERE d.department_name = 'Sales';

-- 4. Write a query to find all departments that have no employees.
SELECT d.department_name
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id
WHERE e.employee_id IS NULL;

-- 5. Write a query to find the first name and last name of all employees, and their department name. If an employee does not have a department, their department name should be NULL.
SELECT e.first_name, e.last_name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id;
