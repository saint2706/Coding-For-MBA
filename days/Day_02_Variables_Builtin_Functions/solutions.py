"""
Day 2: Solutions to Exercises
"""

# --- Exercise 1: Company Profile Variables ---
print("--- Solution to Exercise 1 ---")
company_name = "InnovateCorp"
year_founded = 2015
current_revenue = 2500000.50
is_publicly_traded = False

print(f"Company Name: {company_name}")
print(f"Year Founded: {year_founded}")
print(f"Current Revenue: ${current_revenue}")
print(f"Is Publicly Traded: {is_publicly_traded}")
print("-" * 20)


# --- Exercise 2: Sales Analysis ---
print("--- Solution to Exercise 2 ---")
weekly_sales = [150.50, 200.00, 75.25, 300.75, 120.00]
print(f"Sales data: {weekly_sales}")

# The total number of sales transactions
num_transactions = len(weekly_sales)
print(f"Total number of transactions: {num_transactions}")

# The total revenue for the week
total_revenue = sum(weekly_sales)
print(f"Total revenue: ${total_revenue:.2f}")

# The smallest sale
min_sale = min(weekly_sales)
print(f"Smallest sale: ${min_sale:.2f}")

# The largest sale
max_sale = max(weekly_sales)
print(f"Largest sale: ${max_sale:.2f}")

# The average sale amount
average_sale = total_revenue / num_transactions
print(f"Average sale amount: ${average_sale:.2f}")
print("-" * 20)


# --- Exercise 3: User Input for a Profit Calculator ---
print("--- Solution to Exercise 3 ---")
# Note: To run this interactively, you would need to uncomment the input() lines
# and run the python file in your terminal. The input() function will pause the script
# and wait for you to type a value and press Enter.

# For automated/non-interactive execution, we use example values:
print("Using example values for demonstration:")
revenue_input = 150000.00
expenses_input = 95000.00
profit = revenue_input - expenses_input
print(f"Revenue: ${revenue_input:.2f}")
print(f"Expenses: ${expenses_input:.2f}")
print(f"Calculated Profit: ${profit:.2f}")

# To run interactively, uncomment the lines below and comment out the lines above:
# try:
#     # float() converts the string from input() into a floating-point number
#     revenue_input = float(input("Enter total revenue: "))
#     expenses_input = float(input("Enter total expenses: "))
#
#     profit = revenue_input - expenses_input
#     print(f"Calculated Profit: ${profit:.2f}")
#
# except ValueError:
#     print("Invalid input. Please make sure to enter numbers only.")

print("-" * 20)
