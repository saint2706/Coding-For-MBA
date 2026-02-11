---
day: 76
title: "BI Platforms & Automation"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "bi-platforms"
duration: 120
difficulty: "intermediate"
tags:
  - power-bi
  - tableau
  - looker
  - automation
concepts:
  - "The Semantic Layer"
  - "Import vs Direct Query"
  - "Headless BI"
  - "DAX vs Tabular vs LookML"
prerequisites:
  - "Understanding of Dashboards (Day 75)"
  - "Basic SQL (Day 73)"
outcomes:
  - "Choose the right tool for the job (Tableau vs Power BI)"
  - "Explain the Semantic Layer to a non-technical user"
  - "Automate report delivery (Scheduled Refresh)"
---

# 🎯 Day 76: BI Platforms & Automation

> *"The best tool is the one your users actually open."*

---

## The "Never-Coded" Bridge

**The Menu: Printed vs. Chef's Blackboard vs. iPad.**

1.  **Tableau (The Artist's Canvas)**:
    *   Beautiful, flexible, powerful.
    *   **Pros**: Stunning visuals. Deep analysis.
    *   **Cons**: Expensive. Hard to govern (everyone paints their own picture).
    *   *Analogy*: Photoshop for Data.

2.  **Power BI (The Corporate Excel)**:
    *   Integrated, structured, cheap(ish).
    *   **Pros**: Works with Excel perfectly. Good Semantic Model.
    *   **Cons**: Can be ugly. DAX is hard.
    *   *Analogy*: Super-Charged Pivot Tables.

3.  **Looker (The Code-First Platform)**:
    *   Web-based, governed by Git.
    *   **Pros**: "Define once, use everywhere" (Semantic Layer). Version Controlled.
    *   **Cons**: Requires learning LookML (code).
    *   *Analogy*: GitHub for Dashboarding.

---

## The Technical Deep Dive

### 1. The Semantic Layer

The "Universal Translator" between Database tables and Business terms.
*   **Database**: `sales_table`, `cust_table`.
*   **Semantic Layer**: Defines `Total Revenue = SUM(sales.amount)`.
*   **BI Tool**: User drags "Total Revenue" onto the canvas. They don't write SQL.
*   *Benefit*: If the definition changes (e.g., exclude returns), you update it in **one place** (The Layer), not in 50 reports.

### 2. Import vs. Direct Query

*   **Import Mode (In-Memory)**: 
    *   Copy data from SQL -> BI Tool's RAM.
    *   **Pros**: Cruising speed (Instant clicks).
    *   **Cons**: Data is stale (until next refresh). Size limits (10GB).
*   **Direct Query (Live Connection)**:
    *   BI Tool sends SQL to Database on every click.
    *   **Pros**: Real-time data. Unlimited size.
    *   **Cons**: Slow visuals (Network latency).

### 3. Headless BI (Metrics Layer)

A modern trend. Define metrics in code (e.g., Python/YAML), then fetch them via API into *any* tool (Slack, Excel, Tableau).
*   **Why?**: Decouples logic from the visualization tool.

---

## Senior-Level Insights

### TCO (Total Cost of Ownership)

*   **License Cost**: Tableau ($70/user) vs Power BI ($10/user).
*   **Hidden Costs**: Windows Servers for Power BI Gateway? Heavy RAM machines for Tableau Desktop? Training costs for DAX?
*   **Lock-In**: Once you write 10,000 lines of DAX, you can *never* leave Microsoft easily.

### Governance vs. Agility

The eternal struggle.
*   **Too much Governance**: "It takes 3 weeks to add a column." -> Users export to Excel (Scenario: Shadow IT).
*   **Too much Agility**: "Everyone makes their own KPI." -> CEO sees 5 different Revenue numbers.
*   **Solution**: Certified Datasets (Gold) + Sandbox Workspaces (Playground).

---

## Hands-on Lab

### Exercise 1: The Semantic Definition
**Goal**: Write a "Measure" vs a "Calculated Column".

**Scenario**: You have `Price` and `Quantity`.
*   **Calculated Column (Row Level)**: `Row_Sales = Price * Quantity`. Stored in RAM. Good for filtering.
*   **Measure (Aggregate Level)**: `Total_Sales = SUM(Price * Quantity)`. Calculated on the fly. Good for values.

**Task**: Write the pseudo-code for "Margin %".
*   *Correct*: `SUM(Profit) / SUM(Sales)` (Measure).
*   *Incorrect*: `AVERAGE(Profit / Sales)` (Averages the percentages of rows - mathematically wrong).

### Exercise 2: Row Level Security (RLS)
**Goal**: Design security rules.

**Scenario**: 
*   User: `Manager_North`
*   Data: Global Sales.

**Rule**:
`[Region] = USER_PRINCIPAL_REGION()`

*   When `Manager_North` logs in, they only see rows where Region = 'North'.
*   *Impact*: You build **1 Dashboard** for 50 regions, not 50 dashboards.

### Exercise 3: Automation Script (Concept)
**Goal**: Design a Refresh Schedule.

*   **Requirement**: CEO needs data at 8:00 AM daily.
*   **ETL Job**: Takes 2 hours. Starts at ?
*   **Plan**:
    1.  Start ETL at 5:00 AM.
    2.  ETL finishes at 7:00 AM.
    3.  Trigger BI Refresh at 7:05 AM (Event-based trigger, not Time-based, is safer).
    4.  Send Slack Alert "Dashboard Ready" at 7:30 AM.

---

## Mastery Check

### Question 1: Import Mode
Why is Import Mode faster than Direct Query?
A) It isn't.
B) Because data is stored in the BI tool's highly optimized, compressed, in-memory columnar engine (VertiPaq/Hyper).
C) Because it uses the internet.
D) Because it deletes old data.

<details>
<summary>Click for Answer</summary>

**Answer: B**
In-memory engines are designed for sub-second slicing. Queries don't travel over the network to a slow database.
</details>

### Question 2: Calculated Columns
When should you use a Calculated Column instead of a Measure?
A) Always.
B) Never.
C) When you need to slice/filter/group by that value on an axis (e.g., "High Value Customer" vs "Low Value").
D) When you want the total sum.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Columns computed at load time can be used as Dimensions (x-axis). Measures computed at query time are Values (y-axis).
</details>

### Question 3: RLS
What allows different users to see different data in the same report?
A) Magic.
B) Row Level Security (RLS).
C) Creating 10 copies of the file.
D) Sending screenshots.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Filters data based on user identity/role.
</details>

### Question 4: Semantic Layer
What is the main benefit of a Semantic Layer?
A) It makes the dashboard look pretty.
B) It ensures "One Version of the Truth" by centralizing metric definitions.
C) It speeds up the internet.
D) It replaces SQL.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Consistency and Reusability.
</details>

### Question 5: Licensing
Which tool is known for its "Code-First" approach using a proprietary language called LookML?
A) Tableau
B) Power BI
C) Looker
D) Excel

<details>
<summary>Click for Answer</summary>

**Answer: C**
Looker is unique for its git-integrated modeling layer.
</details>

---

## Summary

Today you learned:
*   ✅ **Semantic Layer**: The brain of the BI system.
*   ✅ **Import vs Direct**: Speed vs Freshness trade-off.
*   ✅ **RLS**: Secure personalized views from a single report.
*   ✅ **Governance**: Balancing "Wild West" vs "Bureaucracy".

**Tomorrow**: We apply these tools to specialized domains in **BI Domain Analytics & Value Drivers**.
