-- 💻 Exercises: Day 99 (Solutions)

-- For these exercises, assume you have a `accounts` table with the following columns:
-- - `account_id` (INTEGER, PRIMARY KEY)
-- - `account_holder` (TEXT)
-- - `balance` (REAL)

-- 1. Start a new transaction.
BEGIN TRANSACTION;

-- 2. Insert a new account for 'John Doe' with a balance of 1000.
INSERT INTO accounts (account_holder, balance) VALUES ('John Doe', 1000);

-- 3. Update the balance of 'John Doe' to 1500.
UPDATE accounts SET balance = 1500 WHERE account_holder = 'John Doe';

-- 4. Create a savepoint named `after_update`.
SAVEPOINT after_update;

-- 5. Delete the account for 'John Doe'.
DELETE FROM accounts WHERE account_holder = 'John Doe';

-- 6. Roll back the transaction to the `after_update` savepoint.
ROLLBACK TO after_update;

-- 7. Commit the transaction.
COMMIT;
