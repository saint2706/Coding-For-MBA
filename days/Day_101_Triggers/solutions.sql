-- 💻 Exercises: Day 101 (Solutions)

-- For these exercises, assume you have the following tables:
-- `products` table:
-- - `product_id` (INTEGER, PRIMARY KEY)
-- - `product_name` (TEXT)
-- - `price` (REAL)

-- `price_history` table:
-- - `history_id` (INTEGER, PRIMARY KEY)
-- - `product_id` (INTEGER)
-- - `old_price` (REAL)
-- - `new_price` (REAL)
-- - `change_date` (DATETIME)

-- 1. Create a trigger that automatically inserts a new row into the `price_history` table whenever the price of a product is updated.
CREATE TRIGGER update_price_history
AFTER UPDATE OF price ON products
FOR EACH ROW
BEGIN
    INSERT INTO price_history (product_id, old_price, new_price, change_date)
    VALUES (OLD.product_id, OLD.price, NEW.price, datetime('now'));
END;

-- 2. Create a trigger that prevents the deletion of a product if its price is greater than 100.
CREATE TRIGGER prevent_expensive_product_deletion
BEFORE DELETE ON products
FOR EACH ROW
WHEN OLD.price > 100
BEGIN
    SELECT RAISE(ABORT, 'Cannot delete a product with a price greater than 100');
END;

-- 3. Create a trigger that automatically sets the `change_date` to the current date and time when a new row is inserted into the `price_history` table.
-- (This is already handled in the first trigger, but if you wanted a separate trigger for inserts):
CREATE TRIGGER set_change_date
AFTER INSERT ON price_history
FOR EACH ROW
BEGIN
    UPDATE price_history
    SET change_date = datetime('now')
    WHERE history_id = NEW.history_id;
END;
