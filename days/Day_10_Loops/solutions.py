"""
Day 10: Solutions to Exercises
"""

# --- Exercise 1: Calculate Average Employee Age ---
print("--- Solution to Exercise 1 ---")
employees = [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 45},
    {"name": "Charlie", "age": 35},
    {"name": "Diana", "age": 28},
]

total_age = 0
for employee in employees:
    total_age += employee["age"]

# Ensure we don't divide by zero if the list is empty
if len(employees) > 0:
    average_age = total_age / len(employees)
    print(f"The average age of employees is: {average_age:.1f} years")
else:
    print("No employees in the list.")
print("-" * 20)


# --- Exercise 2: Filter High-Priority Customers ---
print("--- Solution to Exercise 2 ---")
customers = [
    {"name": "InnovateCorp", "total_spent": 5500},
    {"name": "DataDriven Inc.", "total_spent": 1200},
    {"name": "Analytics LLC", "total_spent": 2100},
    {"name": "Key Insights", "total_spent": 1800},
]

high_priority_customers = []
for customer in customers:
    if customer["total_spent"] > 2000:
        high_priority_customers.append(customer["name"])

print(f"High-priority customers (spent > $2000): {high_priority_customers}")
print("-" * 20)


# --- Exercise 3: Inventory Stock Alert ---
print("--- Solution to Exercise 3 ---")
inventory = {"Laptops": 15, "Mice": 150, "Keyboards": 45, "Monitors": 25}
low_stock_threshold = 50

print("Checking inventory levels...")
for product, count in inventory.items():
    if count < low_stock_threshold:
        print(f"  - ALERT: {product} are low on stock ({count} units remaining).")
print("-" * 20)
