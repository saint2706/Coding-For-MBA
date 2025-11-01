---
title: 'Day 105: JSON in SQL'
tags:
  - SQL
---

Welcome to Day 105! Today, we'll explore how to work with **JSON (JavaScript Object Notation)** data
in SQL.

## What is JSON?

JSON is a lightweight data-interchange format. It is easy for humans to read and write and easy for
machines to parse and generate. JSON is a text format that is completely language independent but
uses conventions that are familiar to programmers of the C-family of languages, including C, C++,
C#, Java, JavaScript, Perl, Python, and many others.

## JSON in SQL

Many modern SQL databases have added support for storing and querying JSON data. This is very useful
for working with semi-structured data.

### Storing JSON

You can often store JSON data in a `TEXT` or `JSON` data type.

### Querying JSON

The syntax for querying JSON data varies between databases.

#### PostgreSQL

PostgreSQL has a rich set of operators and functions for working with JSON.

```sql
-- -> operator gets a JSON object field by key
SELECT info -> 'name' AS name
FROM products;
```

#### MySQL

MySQL also has functions for working with JSON.

```sql
-- JSON_EXTRACT function
SELECT JSON_EXTRACT(info, '$.name') AS name
FROM products;
```

#### SQLite

SQLite has JSON functions as well, which were added in version 3.9.0.

```sql
-- json_extract function
SELECT json_extract(info, '$.name') AS name
FROM products;
```

## 💻 Exercises: Day 105

Please see the `exercises.sql` file for today's exercises.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 104 – Day 104: Database Design and Normalization](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_104_Database_Design_and_Normalization/README.md) • **Next:** [Day 106 – Day 106: XML in SQL](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_106_XML_in_SQL/README.md)

_You are on lesson 105 of 108._

<!-- LESSON_FOOTER_END -->