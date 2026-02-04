"""
Day 3: Solutions to Exercises
"""

# --- Exercise 1: Calculate Net Profit Margin ---
print("--- Solution to Exercise 1 ---")
revenue = 1200000
total_expenses = 850000

# Calculate the profit
profit = revenue - total_expenses

# Calculate the net profit margin
# It's good practice to check if revenue is zero to avoid a DivisionByZeroError
if revenue > 0:
    net_profit_margin = (profit / revenue) * 100
    print(f"Revenue: ${revenue:,.2f}")
    print(f"Expenses: ${total_expenses:,.2f}")
    print(f"Profit: ${profit:,.2f}")
    print(f"Net Profit Margin: {net_profit_margin:.2f}%")
else:
    print("Cannot calculate margin as revenue is zero.")
print("-" * 20)


# --- Exercise 2: Inventory Check ---
print("--- Solution to Exercise 2 ---")
inventory_count = 45
low_stock_threshold = 50
reorder_threshold = 25

is_low_stock = inventory_count < low_stock_threshold
reorder_required = inventory_count <= reorder_threshold

print(f"Inventory count: {inventory_count} units")
print(f"Is inventory considered low stock? {is_low_stock}")
print(f"Is a reorder required? {reorder_required}")
print("-" * 20)


# --- Exercise 3: Sales Bonus Eligibility ---
print("--- Solution to Exercise 3 ---")


def check_bonus_eligibility(sales, years_of_service, top_performer_last_quarter):
    """A helper function to test different scenarios easily."""
    is_eligible = (sales > 10000 and years_of_service > 2) or top_performer_last_quarter
    print(
        f"Scenario: Sales=${sales}, Service={years_of_service}yrs, Top Performer={top_performer_last_quarter} -> Eligible? {is_eligible}"
    )


# Scenario 1: High sales but new employee
check_bonus_eligibility(12000, 1, False)

# Scenario 2: Low sales but top performer
check_bonus_eligibility(8000, 3, True)

# Scenario 3: High sales and long service
check_bonus_eligibility(15000, 5, False)

# Scenario 4: Not eligible on any count
check_bonus_eligibility(9000, 1, False)
print("-" * 20)
