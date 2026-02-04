---
title: "Day 7: Customer Segmentation (Sets)"
tags:
  - Basics
  - Python
  - Data Structures
---

# 📘 Day 7: Customer Segmentation (Sets)

## Managerial Relevance

Marketing and Strategy often ask questions like:

- "How many _unique_ visitors came to our site?" (De-duplication)
- "Which customers bought Product A _and_ Product B?" (Intersection)
- "Who started the signup process but _didn't_ finish?" (Difference)

**Sets** are the mathematical engine for this. They are faster than lists for checking "is this item present?" and strictly enforce uniqueness.

## Key Concepts

- **Uniqueness**: `{"A", "B", "A"}` automatically becomes `{"A", "B"}`.
- **Intersection (`&`)**: Find overlapping items (Common ground).
- **Difference (`-`)**: Find items in one group but not the other (Gap analysis).
- **Union (`|`)**: Combine groups (Total reach).

## Code Walkthrough

Open `sets.py`. We analyze website traffic and product features.

1.  **`get_unique_items()`**:
    - Takes a raw list (e.g., repeating city names from orders).
    - Converts it to a set to instantly count _distinct_ markets.

2.  **`analyze_visitor_segments()`**:
    - Takes two sets of users (Pricing Page visitors vs. Contact Page visitors).
    - **Intersection**: Users who visited _both_ are high-intent leads.
    - **Difference**: Users who saw Pricing but _didn't_ Contact are "drop-offs" (retargeting candidates).

3.  **`upgrade_plan_features()`**:
    - Uses `.update()` to add new perks to a subscription plan.
    - Sets ensure we don't accidentally list "Priority Support" twice.

### Running the Code

```bash
python Day_07_Sets/sets.py
```

## 💻 Practice Exercises

Open `solutions.py`.

1.  **De-duplication**:
    - List: `emails = ["ceo@test.com", "admin@test.com", "ceo@test.com"]`.
    - Create a set from this list to remove the duplicate. Print the count.

2.  **Churn Analysis**:
    - `active_users_jan = {"User1", "User2", "User3"}`
    - `active_users_feb = {"User2", "User4"}`
    - Find the "churned" users: those in Jan but NOT in Feb. (Hint: Jan - Feb).

3.  **Total Reach**:
    - Find the Union of Jan and Feb users to see everyone who interacted with the platform this quarter.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 06 – Tuples](../Day_06_Tuples/README.md) • **Next:** [Day 08 – Dictionaries](../Day_08_Dictionaries/README.md)

_You are on lesson 7 of 108._

<!-- LESSON_FOOTER_END -->
