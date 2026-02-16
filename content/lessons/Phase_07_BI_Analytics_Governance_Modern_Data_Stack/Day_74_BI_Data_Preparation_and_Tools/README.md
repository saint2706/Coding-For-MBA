---
day: 74
title: "BI Data Preparation & Tools"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "data-prep"
duration: 120
difficulty: "intermediate"
tags:
  - data-prep
  - power-query
  - dbt
  - cleaning
concepts:
  - "Extract Transform Load (ETL)"
  - "Unpivoting Data (Wide to Long)"
  - "Merging vs Appending"
  - "Handling Nulls and Errors"
prerequisites:
  - "Understanding of Tables (Rows/Cols)"
  - "Basic SQL (Day 73)"
outcomes:
  - "Normalize messy Excel files (Unpivot)"
  - "Combine multiple datasets (Merge/Append)"
  - "Clean dirty data programmatically"
---

# 🎯 Day 74: BI Data Preparation & Tools

> *"80% of data science is cleaning data. The other 20% involves complaining about cleaning data."*

---

## The "Never-Coded" Bridge

**Cooking: Mise en place vs. Chaos**

**Chaos**: You start cooking. You need onions. You chop them. You need garlic. You wash the knife. You chop garlic. You realize you forgot to buy carrots.

* **Result**: Dinner is late, kitchen is a mess.

**Mise en place (Data Prep)**:

* You wash, peel, chop, and measure *everything* into little bowls first.
* **Cooking (Analysis)**: You just dump bowls into the pan. Fast. Clean. Predictable.

**BI works the same way.**

* If you clean data *inside* your chart formula (`=SUM(IF(ISERROR(A1), 0, A1))`), your dashboard is slow and fragile.
* **Data Prep** means cleaning the ingredients *before* they touch the pan (BI Tool).

---

## The Technical Deep Dive

### 1. Unpivoting (The Most Important Skill)

Human beings like **Wide Data** (Pivot Tables):

| Product | Jan  | Feb  | Mar  |
| :------ | :--- | :--- | :--- |
| Apple   | 10   | 12   | 15   |
| Banana  | 20   | 22   | 25   |

Computers hate this. To calculate "Total Sales":

* `Sales = Jan + Feb + Mar...` (What if "Apr" is added? The formula breaks).

Computers need **Long Data** (Normalized):

| Product | Month | Sales |
| :------ | :---- | :---- |
| Apple   | Jan   | 10    |
| Apple   | Feb   | 12    |

**Unpivoting** transforms Wide -> Long. Now, `SUM(Sales)` works forever, even if you add 100 years of data.

### 2. Merging vs. Appending

* **Append (Vertical - Union)**: Stacking tables.
  * Jan Sales + Feb Sales = All Sales.
  * (Requires same column names).
* **Merge (Horizontal - Join)**: Connecting tables.
  * Sales Table + Products Table = Sales with Product Names.
  * (Requires a Key ID).

### 3. Handling Errors

* **Replace Errors**: `null` -> 0. (Risky: Maybe null means "Store Closed" not "Zero Sales").
* **Remove Errors**: Delete the row. (Risky: You lose data).
* **Flag Errors**: Create a new column `is_valid`. Filter heavily in the dashboard, but keep the raw data for auditing.

---

## Senior-Level Insights

### "Push Down" Logic

* **Best**: Clean data in the Database (SQL/dbt).
  * Why? It's reusable by everyone (Tableau user, Python user, Excel user).
* **Good**: Clean data in the BI Tool (Power Query/Tableau Prep).
  * Why? It's visual and fast for analysts.
* **Worst**: Clean data in the Visualization (Calculated Fields).
  * Why? It runs *every time* the user clicks. Slowest performance.

### The "Excel Trap"

Excel treats "Red Cell Color" as data. Databases do not.

* **Rule**: If it matters, it must be in a column (e.g., `status: urgent`), not a format (Red Fill).

---

## Hands-on Lab

### Exercise 1: The Unpivot

**Goal**: Normalize a "Human Friendly" budget file.

**Input (Wide Strategy)**:

```txt
Region, Q1_Budget, Q2_Budget, Q3_Budget, Q4_Budget
North,  10000,     12000,     11000,     13000
South,  20000,     22000,     21000,     23000
```

**Task**: Convert to `[Region, Quarter, Budget]`.

**SQL Equivalent**:

```sql
SELECT Region, 'Q1' as Quarter, Q1_Budget as Budget FROM budgets
UNION ALL
SELECT Region, 'Q2', Q2_Budget FROM budgets
UNION ALL
...
```

* *Note*: Power Query does this with 1 click ("Unpivot Other Columns").

### Exercise 2: The Dirty Merge

**Goal**: Combine Sales with Customer Info, handling missing keys.

**Input**:

* Sales: `[Cust_ID: 101, Amount: 50]`
* Customers: `[ID: 101, Name: 'Alice']`

**Task**: Perform a **Left Join**. What happens if `Cust_ID 102` exists in Sales but not Customers?

* *Result*: `[Cust_ID: 102, Name: NULL, Amount: 60]`.
* *Fix*: Replace NULL Name with "Unknown Customer".

### Exercise 3: Date Parsing

**Goal**: Fix mixed date formats.

**Input**: `['2023-01-01', '01/02/2023', 'March 1st, 2023']`

* Computers will fail to sort this.
* **Task**: Create a standardized `ISO_Date` column (`YYYY-MM-DD`).
* *Standard*: `2023-01-01`, `2023-02-01`, `2023-03-01`.

---

## Mastery Check

### Question 1: Wide vs Long

Which format is better for BI Tools (Power BI/Tableau)?
A) Wide (Pivot Table style)
B) Long (Tidy Data style)
C) JSON
D) PDF

<details>
<summary>Click for Answer</summary>

**Answer: B**
Long Data allows for scalable aggregations (`SUM(Value)`) regardless of how many categories/dates exist.
</details>

### Question 2: Appending

You have 12 files: `Jan.csv`, `Feb.csv`, ... `Dec.csv`. Do you Merge or Append them?
A) Merge
B) Append
C) Join
D) VLOOKUP

<details>
<summary>Click for Answer</summary>

**Answer: B**
Append (Union) stacks them vertically to create one long year of data.
</details>

### Question 3: Data Quality

In a "Sales" column, you find the value "N/A". What happens if you try to `SUM` the column?
A) It works and ignores "N/A".
B) It treats "N/A" as 0.
C) It errors (Type Mismatch).
D) It converts "N/A" to 1.

<details>
<summary>Click for Answer</summary>

**Answer: C**
You cannot add Text to Numbers. You must clean "N/A" (replace with 0 or null) and change the column type to Decimal first.
</details>

### Question 4: Push Down

Where is the most efficient place to filter data?
A) In the Visualization (Dashboard Filter).
B) In the BI Prep Tool (Power Query).
C) In the Database (SQL `WHERE` clause).
D) In the User's Brain.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Filtering in the DB ("Push Down") means less data travels over the network, making everything faster.
</details>

### Question 5: Keys

To Merge (Join) two tables, what do you need?
A) A common column (Key) with matching values.
B) Both tables must have the same number of rows.
C) Both tables must be sorted.
D) Both tables must have the same name.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Keys (Primary/Foreign) are the bridge between datasets.
</details>

---

## Summary

Today you learned:

* ✅ **Unpivot** is the secret weapon of BI pros.
* ✅ **Mise en place**: Clean data *before* you visualize it.
* ✅ **Push Down Logic**: The closer to the source you clean, the faster your dashboard runs.
* ✅ **Append vs Merge**: Stack vertically vs Join horizontally.

**Tomorrow**: We explore **BI Visualization & Dashboard Principles**—How to design charts that tell a story, not just show numbers.
