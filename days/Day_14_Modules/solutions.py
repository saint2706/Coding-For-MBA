"""Day 14: Solutions to Exercises."""

import datetime
import math

import finance_tools as ft

# --- Exercise 1: Create a Finance Module ---
print("--- Solution to Exercise 1 ---")

# --- Call functions from the module ---
investment = 150000
profit = 25000
roi = ft.calculate_roi(investment, profit)
print(
    f"ROI for a ${investment:,.2f} investment with ${profit:,.2f} profit is: {roi:.2f}%"
)

principal = 10000
rate = 0.05
years = 10
future_value = ft.calculate_future_value(principal, rate, years)
print(
    f"Future value of ${principal:,.2f} after {years} years at a {rate * 100}% rate is: ${future_value:,.2f}"
)
print("-" * 20)


# --- Exercise 2: Use the `datetime` Module ---
print("--- Solution to Exercise 2 ---")
# import the module

# Get the current date and time
now = datetime.datetime.now()

print(f"Current full date and time: {now}")
print(f"Current date only: {now.date()}")
print(f"Current year: {now.year}")
print(f"Current month: {now.month}")
print(f"Current day: {now.day}")
print("-" * 20)


# --- Exercise 3: Use the `math` Module ---
print("--- Solution to Exercise 3 ---")
# import the module

marketing_budget = 100000
# Use the sqrt function from the math module
growth_factor = math.sqrt(marketing_budget)

print(
    f"The growth factor for a marketing budget of ${marketing_budget:,.2f} is {growth_factor:.2f}."
)
print("-" * 20)
