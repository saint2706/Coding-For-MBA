---
title: "Day 7: Sets - Managing Unique Business Data"
tags:
  - BI
  - Basics
  - Data
  - Python
---

# 📘 Day 7: Sets - Managing Unique Business Data

We've seen lists for ordered data and tuples for immutable data. Now we'll learn about **sets**,
which are powerful for two main business reasons: ensuring uniqueness and performing membership
analysis.

## What is a Set?

A set is an **unordered** collection of **unique** items.

- **Unordered:** Items have no defined order.
- **Unique:** A set cannot contain duplicate items.

This de-duplication feature is one of the most common uses for sets in data analysis.

## Set Operations: The Foundation of Segmentation

The true power of sets comes from their mathematical operations, which are invaluable for customer
segmentation and cohort analysis.

| Operation | Python Operator | Business Question Answered | | :------------- | :-------------- |
:------------------------------------------------------- | | **Union** | `A | B` | What is the total
unique audience for two groups? | | **Intersection** | `A & B` | Which customers are in _both_ Group
A _and_ Group B? | | **Difference** | `A - B` | Which customers are in Group A _but not_ in Group B?
|

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `sets.py`, has been refactored into functions to make the logic for
de-duplication and segmentation reusable and testable.

1. **Review the Code:** Open `Day_07_Sets/sets.py`. Notice the functions `get_unique_items()`,
   `analyze_visitor_segments()`, and `upgrade_plan_features()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_07_Sets/sets.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each
   function:
   ```bash
   pytest tests/test_day_07.py
   ```

## 💻 Exercises: Day 7

1. **Find Unique Customer Cities:**
   - In a new script (`my_solutions_07.py`), you have a list of cities:
     `order_cities = ["New York", "Los Angeles", "Chicago", "New York", "Boston", "Los Angeles"]`.
   - Import the `get_unique_items` function from the lesson script.
   - Call the function with your list to get a set of unique cities and print the result.

1. **Analyze Website Visitor Activity:**
   - You have two sets of user IDs:
     - `pricing_visitors = {"user1", "user3", "user5", "user7"}`
     - `contact_visitors = {"user2", "user3", "user4", "user5"}`
   - Import the `analyze_visitor_segments` function.
   - Call the function with these two sets.
   - Print the `intersection` and `difference_a_b` from the returned dictionary to find highly
     engaged users and users who only viewed pricing.

1. **Manage Product Features:**
   - Your "Standard Plan" has a set of features:
     `standard_features = {"reporting", "data_export", "basic_support"}`.
   - You want to add `["api_access", "priority_support"]` for the "Pro Plan".
   - Import and use the `upgrade_plan_features` function to create the new feature set for the Pro
     Plan.
   - Print the resulting Pro Plan feature set.

🎉 **Well done!** Sets are a specialized but incredibly efficient tool. When you need to de-duplicate
a list or analyze the overlap between two groups, sets are the best tool for the job.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 06 – Day 6: Tuples - Storing Immutable Business Data](../Day_06_Tuples/README.md) • **Next:** [Day 08 – Day 8: Dictionaries - Structuring Complex Business Data](../Day_08_Dictionaries/README.md)

_You are on lesson 7 of 108._

<!-- LESSON_FOOTER_END -->
