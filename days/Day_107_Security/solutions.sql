-- 💻 Exercises: Day 107 (Solutions)

-- 1. Write a SQL statement to grant `SELECT` and `INSERT` permissions on the `customers` table to a user named 'analyst'.
GRANT SELECT, INSERT ON customers TO analyst;

-- 2. Write a SQL statement to revoke all permissions on the `products` table from a user named 'guest'.
REVOKE ALL PRIVILEGES ON products FROM guest;

-- 3. Consider a web application that takes a username and password from a user and uses them to build a SQL query like this:
--    `SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'`
--    How could an attacker use SQL injection to bypass the login? What is a better way to write this query?

--    An attacker could enter the following into the username field: `' OR '1'='1`
--    This would make the SQL query: `SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '...'`
--    Since '1'='1' is always true, the `WHERE` clause would be true, and the attacker would be logged in without a valid password.

--    A better way to write this query is to use prepared statements with parameterized queries.
--    For example, in Python with `sqlite3`:
--    `cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, password))`
