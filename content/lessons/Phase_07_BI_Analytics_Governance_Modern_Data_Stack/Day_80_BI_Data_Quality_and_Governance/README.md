---
day: 80
title: "BI Data Quality & Governance"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "data-governance"
duration: 120
difficulty: "advanced"
tags:
  - data-quality
  - governance
  - lineage
  - stewardship
concepts:
  - "The 6 Dimensions of Data Quality"
  - "Data Stewardship (Owners vs Custodians)"
  - "Data Lineage (Source to Target)"
  - "The Data Catalog"
prerequisites:
  - "Understanding of Databases (Day 73)"
  - "Experience with 'Bad Data' (Pain)"
outcomes:
  - "Audit a dataset for quality"
  - "Define 'Who Owns This Data?'"
  - "Implement Automated Quality Testing"
---

# 🎯 Day 80: BI Data Quality & Governance

> *"Garbage In, Garbage Out. But in BI, it's Garbage In, Executive Decision Out, Bankruptcy In."*

---

## The "Never-Coded" Bridge

**The Library vs. The Dumpster**

* **The Dumpster (Ungoverned Data)**: A massive pile of books.
  * Find "Harry Potter"? Takes 3 years.
  * Is pages 40-50 missing? Who knows.
  * Who put this here? Shrug.

* **The Library (Governed Data)**:
  * **Catalog**: You look up "Harry Potter" -> Aisle 4, Shelf B.
  * **Quality**: Librarians check for torn pages.
  * **Stewardship**: If Aisle 4 is messy, Librarian Susan is responsible.

**Governance** is simply adding Librarians (Stewards) and a Card Catalog (Metadata) to your data dumpster.

---

## The Technical Deep Dive

### 1. The 6 Dimensions of Data Quality

1. **Completeness**: Is `Customer_Email` filled in? (No NULLs).
2. **Uniqueness**: Is the same customer listed twice? (Duplicates).
3. **Accuracy**: Does `Age = 200`? (Real-world validity).
4. **Consistency**: Does `Sales` in Tableau match `Revenue` in Finance?
5. **Timeliness**: Is the data from today or last month?
6. **Validity**: Does `State` allow "Texas" and "TX"? (Format).

### 2. Data Lineage

Tracing the path of data.

* **Source**: SQL Table `raw_sales`.
* **Transform**: dbt Model `clean_sales` (removes refunds).
* **Consumption**: Tableau Dashboard `Executive_Summary`.
* *Why?*: If the Dashboard is wrong, you trace back up the line to find the root cause. ("Aha, the raw_sales table stopped updating!").

### 3. Automated Data Testing (Great Expectations)

Stop checking data manually. Write tests.

* `expect_column_values_to_be_unique(id)`
* `expect_column_values_to_be_between(age, 0, 120)`
* If test fails -> **Block the Pipeline**. Don't let bad data reach the CEO.

---

## Senior-Level Insights

### "Bad Data is a Virus"

* If a chart is wrong **once**, the CEO stops trusting it.
* If it's wrong **twice**, the CEO stops trusting **you**.
* **Lesson**: It is better to show *No Data* (and an error message) than *Wrong Data*. Break the dashboard intentionally if quality fails.

### The "Data Dictator" vs "Data Anarchy"

* **Dictatorship**: "You cannot create a spreadsheet without approval." (Too slow).
* **Anarchy**: "Everyone makes their own definition of 'Churn'." (Chaos).
* **Federated Governance**: Central team defines Core Metrics (Revenue, Churn). Local teams define Local Metrics (Feature Usage).

---

## Hands-on Lab

### Exercise 1: Quality Audit

**Goal**: Check the 6 Dimensions on a sample dataset.

**Data**:

| ID   | Name  | Email   | State    |
| :--- | :---- | :------ | :------- |
| 1    | Alice | <a@example.com> | NY       |
| 2    | Bob   |         | New York |
| 1    | Alice | <a@example.com> | NY       |

**Audit**:

1. **Unique**: Failed (ID 1 is duplicate).
2. **Complete**: Failed (Bob has no email).
3. **Consistent**: Failed (NY vs New York).

### Exercise 2: Defining Ownership (RACI)

**Goal**: Governance Framework.

**Scenario**: Who owns the "Customer Churn" metric?

* **Responsible (Doer)**: Data Analyst (Writes the SQL).
* **Accountable (Owner)**: VP of Customer Success (Defines the logic "Churn = 30 days inactive").
* **Consulted**: Finance (Does this match revenue loss?).
* **Informed**: Sales Team.

### Exercise 3: Writing a Test

**Goal**: SQL Data Test.

**Task**: Write a query that returns rows violating "Age must be > 0".

```sql
SELECT *
FROM users
WHERE age <= 0 OR age IS NULL;
```

* *Action*: If `COUNT(*) > 0`, trigger an alert email to the Data Engineer.

---

## Mastery Check

### Question 1: Uniqueness

Why are duplicate rows dangerous in aggregation (SUM)?
A) They look ugly.
B) They double-count revenue (Inflate numbers).
C) They crash the database.
D) They are fine.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Double-counting is the #1 reason data numbers don't match Finance numbers.
</details>

### Question 2: Lineage

If a dashboard breaks, what helps you find the upstream cause?
A) Data Lineage.
B) Data Dictionary.
C) Data Lake.
D) Guessing.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Lineage visualizes the dependency graph.
</details>

### Question 3: Timeliness

What is "Data Latency"?
A) The speed of the internet.
B) The time lag between an event happening (Real World) and it appearing in the Dashboard.
C) The time it takes to read a dashboard.
D) The time it takes to hire an analyst.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Low latency (Real-time) is expensive. High latency (Daily) is standard.
</details>

### Question 4: Stewardship

Who is typically the "Data Steward"?
A) The IT Guy.
B) The CEO.
C) A Subject Matter Expert (SME) in the business domain who understands what the data *means*.
D) The Database.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Marketing Manager owns Marketing Data definitions.
</details>

### Question 5: Validity

The state code column contains "ZZ". Is this valid?
A) Yes.
B) No, "ZZ" is not a US State.
C) Maybe.
D) Who cares.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It fails validity checks against a reference list of States.
</details>

---

## Summary

Today you learned:

* ✅ **6 Dimensions**: The checklist for "Is this data good?"
* ✅ **Lineage**: The map of your data pipeline.
* ✅ **Stewardship**: People, not tools, fix data quality.
* ✅ **RACI**: Who is Accountable when the number is wrong?

**Tomorrow**: We begin architecting the system in **BI Architecture & Data Modeling**.
