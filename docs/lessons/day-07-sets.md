---
title: 'Day 7: Sets - Managing Unique Business Data'
tags:
- BI
- Basics
- Data
- Python
---

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
unique audience for two groups? | | **Intersection** | `A & B` | Which customers are in *both* Group
A *and* Group B? | | **Difference** | `A - B` | Which customers are in Group A *but not* in Group B?
|

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

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

**Previous:** [Day 06 – Day 6: Tuples - Storing Immutable Business Data](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_06_Tuples/README.md) • **Next:** [Day 08 – Day 8: Dictionaries - Structuring Complex Business Data](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_08_Dictionaries/README.md)

_You are on lesson 7 of 108._

<!-- LESSON_FOOTER_END -->

## Additional Materials

- **sets.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_07_Sets/sets.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_07_Sets/sets.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_07_Sets/sets.ipynb){ .md-button }
- **solutions.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_07_Sets/solutions.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_07_Sets/solutions.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_07_Sets/solutions.ipynb){ .md-button }

???+ example "sets.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_07_Sets/sets.py)

    ```python title="sets.py"
    """
    Day 7: Using Sets for Unique Data and Segmentation (Refactored)

    This script demonstrates how to use sets to de-duplicate data
    and perform segmentation analysis on business data. This version
    is refactored into functions for better organization and testability.
    """


    def get_unique_items(items_list):
        """
        Converts a list to a set to get unique items.

        Sets automatically remove duplicates. This is one of their key features!
        Sets are unordered collections of unique elements.

        Parameters
        ----------
        items_list : list
            A list that may contain duplicate values

        Returns
        -------
        set
            A set containing only unique items

        Example
        -------
        >>> get_unique_items(["NY", "LA", "NY", "Chicago"])
        {'NY', 'LA', 'Chicago'}
        """
        # Converting a list to a set automatically removes all duplicates
        return set(items_list)


    def analyze_visitor_segments(set_a, set_b):
        """
        Performs intersection, difference, and union operations on two sets.

        Set operations are powerful for analyzing overlapping segments:
        - Intersection: items in BOTH sets (overlap)
        - Difference: items in set_a but NOT in set_b (exclusive to A)
        - Union: items in EITHER set (combined, no duplicates)

        Parameters
        ----------
        set_a : set
            First set of items
        set_b : set
            Second set of items

        Returns
        -------
        dict
            Dictionary with 'intersection', 'difference_a_b', and 'union' results

        Example
        -------
        >>> analyze_visitor_segments({"user1", "user2"}, {"user2", "user3"})
        {'intersection': {'user2'}, 'difference_a_b': {'user1'}, 'union': {'user1', 'user2', 'user3'}}
        """
        # .intersection() returns items that exist in both sets
        intersection = set_a.intersection(set_b)

        # .difference() returns items in set_a that are NOT in set_b
        difference = set_a.difference(set_b)

        # .union() combines both sets (removes duplicates automatically)
        union = set_a.union(set_b)

        return {"intersection": intersection, "difference_a_b": difference, "union": union}


    def upgrade_plan_features(base_features, new_features_list):
        """
        Adds new features to a base set of features.

        Demonstrates the .update() method which adds multiple items to a set.
        We create a copy to avoid modifying the original.

        Parameters
        ----------
        base_features : set
            The existing set of features
        new_features_list : list
            List of new features to add

        Returns
        -------
        set
            A new set with all features combined

        Example
        -------
        >>> upgrade_plan_features({"basic"}, ["advanced", "premium"])
        {'basic', 'advanced', 'premium'}
        """
        # .copy() creates a new set so we don't modify the original
        upgraded_plan = base_features.copy()

        # .update() adds all items from the list to the set
        # Duplicates are automatically ignored (set property)
        upgraded_plan.update(new_features_list)
        return upgraded_plan


    if __name__ == "__main__":
        # --- Using a Set to Find Unique Items ---
        print("--- Finding Unique Customer Cities ---")
        order_cities_list = [
            "New York",
            "Los Angeles",
            "Chicago",
            "New York",
            "Boston",
            "Los Angeles",
            "Chicago",
        ]
        print(f"Original list of cities: {order_cities_list}")
        unique_cities_set = get_unique_items(order_cities_list)
        print(f"Unique cities set: {unique_cities_set}")
        print(f"Number of unique cities: {len(unique_cities_set)}")
        print("-" * 20)

        # --- Using Set Operations for Customer Segmentation ---
        print("--- Analyzing Website Visitor Segments ---")
        pricing_page_visitors = {"user1", "user3", "user5", "user7", "user8"}
        contact_page_visitors = {"user2", "user3", "user4", "user5", "user9"}

        segment_analysis = analyze_visitor_segments(
            pricing_page_visitors, contact_page_visitors
        )

        print(
            f"Users who visited Pricing AND Contact pages: {segment_analysis['intersection']}"
        )
        print(
            f"Users who only visited the Pricing page: {segment_analysis['difference_a_b']}"
        )
        print(f"All unique visitors to either page: {segment_analysis['union']}")
        print("-" * 20)

        # --- Modifying Sets to Manage Product Plans ---
        print("--- Managing Product Plan Features ---")
        standard_plan_features = {"reporting", "data_export", "basic_support"}
        print(f"Standard Plan Features: {standard_plan_features}")

        features_to_add_for_pro = ["api_access", "priority_support", "24/7_monitoring"]
        pro_plan_features = upgrade_plan_features(
            standard_plan_features, features_to_add_for_pro
        )

        print(f"Pro Plan Features: {pro_plan_features}")

        pro_only = pro_plan_features.difference(standard_plan_features)
        print(f"Features unique to the Pro Plan: {pro_only}")
        print("-" * 20)
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_07_Sets/solutions.py)

    ```python title="solutions.py"
    """
    Day 7: Solutions to Exercises
    """

    # --- Exercise 1: Find Unique Customer Cities ---
    print("--- Solution to Exercise 1 ---")
    order_cities = [
        "New York",
        "Los Angeles",
        "Chicago",
        "New York",
        "Boston",
        "Los Angeles",
    ]
    print(f"Original list of cities: {order_cities}")

    # Converting the list to a set automatically removes duplicates
    unique_cities = set(order_cities)

    print(f"Set of unique cities: {unique_cities}")
    print(f"Number of unique cities where orders were placed: {len(unique_cities)}")
    print("-" * 20)


    # --- Exercise 2: Analyze Website Visitor Activity ---
    print("--- Solution to Exercise 2 ---")
    pricing_visitors = {"user1", "user3", "user5", "user7"}
    contact_visitors = {"user2", "user3", "user4", "user5"}

    print(f"Pricing Page Visitors: {pricing_visitors}")
    print(f"Contact Page Visitors: {contact_visitors}")

    # Intersection: users who did both
    both_pages_visitors = pricing_visitors.intersection(contact_visitors)
    print(f"Users who visited BOTH pages: {both_pages_visitors}")

    # Difference: users who visited pricing but not contact
    pricing_only_visitors = pricing_visitors.difference(contact_visitors)
    print(f"Users who visited Pricing but NOT Contact: {pricing_only_visitors}")

    # Union: all unique users who visited either page
    all_visitors = pricing_visitors.union(contact_visitors)
    print(f"All unique visitors to either page: {all_visitors}")
    print("-" * 20)


    # --- Exercise 3: Manage Product Features ---
    print("--- Solution to Exercise 3 ---")
    standard_features = {"reporting", "data_export", "basic_support"}
    print(f"Standard Plan Features: {standard_features}")

    # Create a copy to avoid modifying the original set
    pro_features = standard_features.copy()

    # New features to add
    new_pro_features = ["api_access", "priority_support"]
    pro_features.update(new_pro_features)

    print(f"Pro Plan Features after update: {pro_features}")
    print("-" * 20)
    ```
