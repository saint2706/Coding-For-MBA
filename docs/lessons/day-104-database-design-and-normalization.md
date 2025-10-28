Welcome to Day 104! Today, we'll cover the important topics of **Database Design** and
**Normalization**.

## Database Design

Database design is the organization of data according to a database model. The designer determines
what data must be stored and how the data elements interrelate.

### Key Goals of Database Design

- **Represent the real world:** The database should accurately model the real-world system it is
  designed for.
- **Reduce redundancy:** Data should be stored only once.
- **Ensure data integrity:** Data should be accurate and consistent.
- **Provide efficient access:** The database should be designed for efficient data retrieval.

## Normalization

Normalization is the process of organizing the columns (attributes) and tables (relations) of a
relational database to minimize data redundancy.

### Normal Forms

- **First Normal Form (1NF):**
  - Each table cell should contain a single value.
  - Each record needs to be unique.
- **Second Normal Form (2NF):**
  - Be in 1NF.
  - All non-key attributes are fully functional dependent on the primary key.
- **Third Normal Form (3NF):**
  - Be in 2NF.
  - There is no transitive functional dependency.

## 💻 Exercises: Day 104

The exercises for today are conceptual. Please review the `README.md` file and make sure you
understand the following concepts:

- The goals of database design.
- The concept of normalization and why it's important.
- The first three normal forms (1NF, 2NF, 3NF).
