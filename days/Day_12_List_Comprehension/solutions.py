"""
Day 12: Solutions to Exercises
"""

# --- Exercise 1: Calculate Sales Commissions ---
print("--- Solution to Exercise 1 ---")
sales = [2500, 8000, 12000, 5500]
commission_rate = 0.10

# [expression for item in iterable]
# The expression is the calculation for each sale.
commissions = [sale * commission_rate for sale in sales]

print(f"Original sales: {sales}")
print(f"Calculated commissions (10%): {commissions}")
print("-" * 20)


# --- Exercise 2: Filter Products by Category ---
print("--- Solution to Exercise 2 ---")
products = [
    {"name": "Laptop", "category": "electronics"},
    {"name": "T-Shirt", "category": "apparel"},
    {"name": "Keyboard", "category": "electronics"},
    {"name": "Coffee Mug", "category": "homeware"},
    {"name": "Webcam", "category": "electronics"},
]

# [expression for item in iterable if condition]
# The expression is the product's name.
# The condition checks if the product's category is 'electronics'.
electronic_products = [
    product["name"] for product in products if product["category"] == "electronics"
]

print(f"All products: {products}")
print(f"Electronic products only: {electronic_products}")
print("-" * 20)


# --- Exercise 3: Format Prices for Display ---
print("--- Solution to Exercise 3 ---")
prices = [49.99, 199.99, 19.95, 24.50, 12.00]

# The expression is an f-string that formats each price.
display_prices = [f"${price:,.2f}" for price in prices]

print(f"Original prices (float): {prices}")
print(f"Display prices (string): {display_prices}")
print("-" * 20)
