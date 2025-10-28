# 📘 Day 106: XML in SQL

Welcome to Day 106! Today, we'll explore how to work with **XML (eXtensible Markup Language)** data in SQL.

## What is XML?

XML is a markup language and file format for storing, transmitting, and reconstructing arbitrary data. It defines a set of rules for encoding documents in a format that is both human-readable and machine-readable.

## XML in SQL

Similar to JSON, many SQL databases provide support for storing and querying XML data.

### Storing XML
You can often store XML data in a `TEXT` or `XML` data type.

### Querying XML
The syntax for querying XML data varies between databases. It often involves using XPath, a query language for selecting nodes from an XML document.

#### SQL Server
SQL Server has a rich set of methods for working with the `XML` data type.
```sql
-- .value() method
SELECT data.value('(/product/name)[1]', 'varchar(50)') AS name
FROM products;
```

#### Oracle
Oracle also has functions for working with XML.
```sql
-- EXTRACTVALUE function
SELECT EXTRACTVALUE(data, '/product/name') AS name
FROM products;
```

## 💻 Exercises: Day 106

Please see the `exercises.sql` file for today's exercises.
