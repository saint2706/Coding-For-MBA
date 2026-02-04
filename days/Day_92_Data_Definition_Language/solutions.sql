-- 💻 Exercises: Day 92 (Solutions)

-- 1. Create a table named `students` with the following columns:
--    - `student_id` (INTEGER, PRIMARY KEY)
--    - `first_name` (TEXT)
--    - `last_name` (TEXT)
--    - `email` (TEXT)
--    - `enrollment_date` (DATE)
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    enrollment_date DATE
);

-- 2. Add a new column named `major` (TEXT) to the `students` table.
ALTER TABLE students
ADD major TEXT;

-- 3. Modify the `email` column to be of type `VARCHAR(100)`.
-- Note: In SQLite, you can't directly modify the type of a column.
-- You would typically create a new table with the correct schema, copy the data, and then drop the old table.
-- However, for the purpose of this exercise, we will just show the standard SQL syntax.
ALTER TABLE students
MODIFY COLUMN email VARCHAR(100);

-- 4. Truncate the `students` table.
-- Note: SQLite does not have a TRUNCATE TABLE command. You would use DELETE FROM.
DELETE FROM students;

-- 5. Drop the `students` table.
DROP TABLE students;
