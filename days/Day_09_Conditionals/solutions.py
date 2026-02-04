"""
Day 9: Solutions to Exercises
"""

# --- Exercise 1: Discount Policy Automation ---
print("--- Solution to Exercise 1 ---")
purchase_amount = 120

if purchase_amount > 100:
    discount = 0.10
elif purchase_amount > 50:
    discount = 0.05
else:
    discount = 0.0

final_price = purchase_amount * (1 - discount)

print(f"Original Amount: ${purchase_amount:.2f}")
print(f"Discount Rate: {discount * 100}%")
print(f"Final Price: ${final_price:.2f}")
print("-" * 20)


# --- Exercise 2: Shipping Cost Calculator ---
print("--- Solution to Exercise 2 ---")


# We can wrap this in a function to easily test different scenarios
def get_shipping_cost(country, order_weight_kg):
    cost = 0
    if country == "USA":
        if order_weight_kg > 50:
            cost = 75
        else:
            cost = 50
    elif country == "Canada":
        if order_weight_kg > 50:
            cost = 100
        else:
            cost = 65
    else:
        return "Shipping not available."

    return f"Shipping cost: ${cost}"


# Test cases
print(f"USA, 60kg -> {get_shipping_cost('USA', 60)}")
print(f"Canada, 40kg -> {get_shipping_cost('Canada', 40)}")
print(f"Mexico, 30kg -> {get_shipping_cost('Mexico', 30)}")
print("-" * 20)


# --- Exercise 3: Employee Bonus Calculation ---
print("--- Solution to Exercise 3 ---")


def calculate_bonus(rating, department, salary):
    bonus_rate = 0
    if rating >= 4:
        if department == "Sales":
            bonus_rate = 0.15
        else:
            bonus_rate = 0.10
    elif rating == 3:
        bonus_rate = 0.05
    # No need for an else for rating 1 or 2, as bonus_rate is already 0

    bonus_amount = salary * bonus_rate
    return bonus_amount


# Test cases
salary = 90000
print(
    f"Sales employee with rating 5 gets bonus: ${calculate_bonus(5, 'Sales', salary):,.2f}"
)
print(
    f"Engineering employee with rating 4 gets bonus: ${calculate_bonus(4, 'Engineering', salary):,.2f}"
)
print(
    f"Sales employee with rating 3 gets bonus: ${calculate_bonus(3, 'Sales', salary):,.2f}"
)
print(f"HR employee with rating 2 gets bonus: ${calculate_bonus(2, 'HR', salary):,.2f}")
print("-" * 20)
