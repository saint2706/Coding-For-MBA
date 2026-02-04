---
title: "Day 107: SQL Security"
tags:
  - SQL
---

# 📘 Day 107: SQL Security

Welcome to Day 107! Today, we'll discuss **SQL Security**, a critical topic for protecting your
database from unauthorized access and malicious attacks.

## Key Security Concepts

### Authentication

Authentication is the process of verifying the identity of a user. In SQL databases, this is
typically done with a username and password.

### Authorization

Authorization is the process of granting or denying access to a user based on their identity. This
is managed through user permissions and roles.

### `GRANT` and `REVOKE`

- **`GRANT`:** The `GRANT` command is used to give a user permissions to perform certain operations
  (e.g., `SELECT`, `INSERT`, `UPDATE`, `DELETE`) on database objects.
- **`REVOKE`:** The `REVOKE` command is used to take away permissions from a user.

### SQL Injection

SQL Injection is a code injection technique that might destroy your database. SQL Injection is one
of the most common web hacking techniques. It is the placement of malicious code in SQL statements,
via web page input.

#### How to Prevent SQL Injection

- **Use Prepared Statements (with Parameterized Queries):** This is the most effective way to
  prevent SQL injection. The SQL statement is sent to the database separately from the parameters.
- **Escape User Input:** Sanitize user input by escaping characters that have a special meaning in
  SQL.

## 💻 Exercises: Day 107

The exercises for today are conceptual. Please review the `README.md` file and make sure you
understand the following concepts:

- Authentication vs. Authorization.
- How `GRANT` and `REVOKE` are used to manage permissions.
- What SQL Injection is and how to prevent it.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 106 – Day 106: XML in SQL](../Day_106_XML_in_SQL/README.md) • **Next:** [Day 108 – Day 108: SQL Performance Tuning](../Day_108_Performance_Tuning/README.md)

_You are on lesson 107 of 108._

<!-- LESSON_FOOTER_END -->
