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
