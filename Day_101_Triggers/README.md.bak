# 📘 Day 101: Triggers

Welcome to Day 101! Today, we'll learn about **Triggers**, which are special stored procedures that
are automatically executed when certain events occur in the database.

## What is a Trigger?

A trigger is a database object that is associated with a table and that activates when a particular
event (e.g., an `INSERT`, `UPDATE`, or `DELETE`) occurs for the table.

### Key Points

- Triggers are used to maintain the integrity of the data in a database.
- Triggers can be executed before or after an `INSERT`, `UPDATE`, or `DELETE` operation.
- The `BEFORE` triggers are used to validate the data before it is saved to the database.
- The `AFTER` triggers are used to perform some action after the data has been saved to the
  database.

## Creating and Managing Triggers

### `CREATE TRIGGER`

The `CREATE TRIGGER` statement is used to create a new trigger.

```sql
CREATE TRIGGER trigger_name
{BEFORE | AFTER} {INSERT | UPDATE | DELETE}
ON table_name
[FOR EACH ROW]
BEGIN
    -- trigger body
    -- this is where you put your SQL statements
END;
```

**Note:** The syntax for creating triggers can vary between different SQL databases. SQLite supports
triggers.

## 💻 Exercises: Day 101

Please see the `exercises.sql` file for today's exercises.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 100 – Day 100: Stored Procedures](../Day_100_Stored_Procedures/README.md) • **Next:** [Day 102 – Day 102: Common Table Expressions (CTEs)](../Day_102_Common_Table_Expressions/README.md)

_You are on lesson 101 of 108._

<!-- LESSON_FOOTER_END -->