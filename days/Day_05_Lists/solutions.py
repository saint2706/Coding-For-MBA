"""
Day 5: Solutions to Exercises
"""

# --- Exercise 1: Manage a Product List ---
print("--- Solution to Exercise 1 ---")
products = ["Laptop", "Mouse", "Keyboard", "Monitor"]
print(f"Initial product list: {products}")

# Add "Webcam" to the end of the list
products.append("Webcam")
print(f"After adding 'Webcam': {products}")

# Remove "Mouse" from the list
products.remove("Mouse")
print(f"After removing 'Mouse': {products}")
print(f"Final available products: {products}")
print("-" * 20)


# --- Exercise 2: Analyze Monthly Expenses ---
print("--- Solution to Exercise 2 ---")
monthly_expenses = [2200, 2350, 2600, 2130, 2190]
print(f"Initial monthly expenses: {monthly_expenses}")

# Find total, min, and max expenses
total_expenses = sum(monthly_expenses)
highest_expense = max(monthly_expenses)
lowest_expense = min(monthly_expenses)

print(f"Total expenses: ${total_expenses}")
print(f"Highest monthly expense: ${highest_expense}")
print(f"Lowest monthly expense: ${lowest_expense}")

# Add a new expense and print the updated total
new_expense = 2400
monthly_expenses.append(new_expense)
updated_total_expenses = sum(monthly_expenses)
print(
    f"After adding a new expense of ${new_expense}, the new total is: ${updated_total_expenses}"
)
print("-" * 20)


# --- Exercise 3: Select Top Sales Performers ---
print("--- Solution to Exercise 3 ---")
sales_figures = [5000, 8000, 4500, 12000, 6000, 11000]
print(f"Original sales figures: {sales_figures}")

# Sort the list in descending order (highest to lowest)
sales_figures.sort(reverse=True)
print(f"Sorted sales figures: {sales_figures}")

# "Slice" the list to get the top 3
top_3_sales = sales_figures[0:3]

print(f"The top 3 sales figures are: {top_3_sales}")
print("-" * 20)
