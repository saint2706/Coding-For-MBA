---
day: 84
title: "BI Career & Capstone"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "bi-career"
duration: 120
difficulty: "intermediate"
tags:
  - career
  - portfolio
  - capstone
  - interview-prep
concepts:
  - "The Impact Resume (Action -> Metric)"
  - "The Full-Stack Portfolio"
  - "The Analytics Capstone Project"
  - "Continuous Learning Path"
prerequisites:
  - "Completion of Phase 7"
outcomes:
  - "Build a Portfolio Project that gets you hired"
  - "Answer technical interview questions Confidently"
  - "Rewrite Resume bullets for Impact"
---

# 🎯 Day 84: BI Career Development & Capstone

> *"In God we trust. All others must bring data. — And a good portfolio."*

---

## The "Never-Coded" Bridge

**The Artist vs. The Analyst**

*   **Artist**: Applying for a job? They don't just say "I went to Art School." They show a **Portfolio**.
*   **Analyst**: Applying for a job? Saying "I know SQL" is weak. Showing a **GitHub Repo with a dbt project and a Tableau Public link** is strong.

**The Capstone**: Your Masterpiece. Proof that you can solve a problem end-to-end.

---

## The Technical Deep Dive

### 1. The Full-Stack BI Portfolio

Don't just upload a CSV. Show the **System**:
1.  **Architecture Diagram**: Draw the flow (Source -> dbt -> Dashboard).
2.  **Code**: SQL Transformation scripts (with comments explaining *why*).
3.  **Visualization**: A live link (Tableau Public / Power BI Web).
4.  **Influence**: A "Read Me" file explaining the *Business Impact*. usage?

### 2. The Impact Resume Formula

*   **Weak**: "Responsible for creating dashboards in Tableau." (Job Description).
*   **Strong**: "Automated weekly reporting using Tableau, saving 5 hours/week and identifying a \$50k revenue leak." (Action -> Result).

**Formula**: `[Action Verb] + [Task] + [Result/Metric]`.

### 3. The Capstone Project Brief

**Goal**: Build an end-to-end BI solution.
**Scenario**: "The E-Commerce Exec Dashboard."
*   **Data**: Public E-Commerce Dataset (e.g., Olist or Superstore).
*   **Tech Stack**: SQL (Prep), dbt (Model), Tool of Choice (Viz).
*   **Deliverables**:
    1.  **Star Schema**: `fact_orders`, `dim_products`.
    2.  **Metrics**: `AOV` (Average Order Value), `LTV` (Lifetime Value).
    3.  **Dashboard**: 3 Views (Executive, Marketing, Operations).
    4.  **Presentation**: A 5-slide deck summarizing the findings.

---

## Senior-Level Insights

### "Soft Skills" are Hard Skills

*   **Curiosity**: Do you ask "Why?" when the number looks weird?
*   **Skepticism**: Do you trust the data blindly? (Don't).
*   **Empathy**: Do you design for the user, or for yourself?

### The Interview: "Tell me about a time..."

*   **Question**: "Tell me about a time you found an insight."
*   **Answer (STAR Method)**:
    *   **Situation**: Marketing spend was high, ROI low.
    *   **Task**: Investigate why.
    *   **Action**: Analyzed attribution data, found mobile ads were clicking but not converting due to slow load times.
    *   **Result**: Recommended fix, saved \$20k/month.

---

## Hands-on Lab

### Exercise 1: Project Plan
**Goal**: Design your Capstone.

*   **Problem Statement**: "Global Co. has high churn but doesn't know why."
*   **Data Source**: `customer_churn.csv`.
*   **Hypothesis**: "Churn is driven by Support Ticket Response Time."
*   **Tools**: Python (Clean) -> SQL (Analyze) -> Power BI (Viz).

### Exercise 2: Resume Rewrite
**Goal**: Fix this bullet point.
"analyzed customer data using SQL."

**Your rewrite**:
*   "Queried 1M+ rows of customer data using Advanced SQL (Window Functions) to identify segments with high churn risk."

### Exercise 3: Mock Interview
**Goal**: Answer "What is Inner Join vs Left Join?"

**Junior Answer**: "Inner is match, Left is everything."
**Senior Answer**: "Inner Join keeps only matching rows, filtering out non-matches. It's riskier for production pipelines because you might lose data silently. Left Join keeps all rows from the primary table, filling nulls for non-matches. I prefer Left Joins in staging to audit data quality first."

---

## Mastery Check

### Question 1: Portfolio
What is the most important part of a Portfolio Project?
A) The complexity of the code.
B) The business story and problem solved.
C) The colors used.
D) The file size.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Hiring managers hire problem solvers, not code writers.
</details>

### Question 2: STAR Method
What does STAR stand for?
A) Situation, Task, Action, Result.
B) Stop, Think, Act, Review.
C) Stars in the sky.
D) SQL, Tableau, Airflow, R.

<details>
<summary>Click for Answer</summary>

**Answer: A**
The standard framework for behavioral interviews.
</details>

### Question 3: Resume
Why are metrics important on a resume?
A) They look cool.
B) They prove Impact and Scope.
C) They fill space.
D) ATS requires them.

<details>
<summary>Click for Answer</summary>

**Answer: B**
"Managed large database" vs "Managed 50TB database".
</details>

### Question 4: Capstone Scope
Is it better to build one deep project or 10 shallow ones?
A) 10 shallow ones.
B) One deep, end-to-end project.
C) None.
D) 100 tiny ones.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Quality > Quantity. Show depth of thought.
</details>

### Question 5: Networking
What is the best way to apply for a job?
A) "Easy Apply" on LinkedIn.
B) Networking / Referral from an employee.
C) Faxing.
D) Carrier Pigeon.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Referrals are 10x more likely to be interviewed.
</details>

---

## Summary

Today you learned:
*   ✅ **The Capstone**: Your proof of work.
*   ✅ **Impact Resume**: Focus on Results, not Responsibilities.
*   ✅ **STAR Method**: How to ace the behavioral interview.
*   ✅ **Career Path**: Continuous learning is the only constant.

**Congratulations! You have completed the Phase 7 Daily Content.**
**Next Step**: The **Phase 7 Overview** & The **Final Capstone Exam**.
