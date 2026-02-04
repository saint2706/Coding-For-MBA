"""
Day 13: Solutions to Exercises
"""

# --- Exercise 1: Standardize Department Names ---
print("--- Solution to Exercise 1 ---")
departments = ["Sales", " marketing ", "  Engineering", "HR  "]
print(f"Original list: {departments}")

# The lambda function x.strip().lower() is applied to each item in the list.
# .strip() removes whitespace, .lower() converts to lowercase.
cleaned_departments = list(map(lambda x: x.strip().lower(), departments))

print(f"Cleaned list: {cleaned_departments}")
print("-" * 20)


# --- Exercise 2: Filter Active Subscriptions ---
print("--- Solution to Exercise 2 ---")
customers = [
    {"id": 1, "status": "active"},
    {"id": 2, "status": "inactive"},
    {"id": 3, "status": "active"},
    {"id": 4, "status": "cancelled"},
]
print(f"Original customers: {customers}")

# The lambda function returns True only if the customer's status is 'active'.
# filter() keeps only the items for which the lambda returns True.
active_customers = list(filter(lambda c: c["status"] == "active", customers))

print(f"Active customers only: {active_customers}")
print("-" * 20)


# --- Exercise 3: Sort Complex Data ---
print("--- Solution to Exercise 3 ---")
products = [
    {"name": "Laptop", "price": 1200},
    {"name": "Mouse", "price": 25},
    {"name": "Keyboard", "price": 75},
    {"name": "Monitor", "price": 300},
]
print(f"Original product list: {products}")

# The 'key' argument of sorted() tells it what to base the sort on.
# The lambda function tells sorted() to look at the value associated
# with the 'price' key in each dictionary.
sorted_products = sorted(products, key=lambda p: p["price"])

print(f"Products sorted by price: {sorted_products}")
print("-" * 20)
