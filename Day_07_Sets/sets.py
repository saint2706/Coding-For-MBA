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
