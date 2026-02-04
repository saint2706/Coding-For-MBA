"""
Day 6: Solutions to Exercises
"""

# --- Exercise 1: Store Geographic Coordinates ---
print("--- Solution to Exercise 1 ---")
# A tuple is perfect here because these coordinates are fixed.
hq_location = (40.7128, -74.0060)

# "Unpacking" the tuple into separate variables
latitude, longitude = hq_location

print(f"Headquarters Location: {hq_location}")
print(f"Latitude: {latitude}")
print(f"Longitude: {longitude}")
print("-" * 20)


# --- Exercise 2: Define Product Dimensions ---
print("--- Solution to Exercise 2 ---")
# Dimensions are fixed, so a tuple is the right choice.
package_dimensions = (25, 15, 10)

# Accessing the tuple elements by their index for the print statement.
print(
    f"Package Dimensions (LxWxH): {package_dimensions[0]}cm x {package_dimensions[1]}cm x {package_dimensions[2]}cm"
)
print("-" * 20)


# --- Exercise 3: List vs. Tuple - The Right Tool for the Job ---
print("--- Solution to Exercise 3 ---")

# Scenario A: Storing the monthly sales figures for the past year.
# Choice: List. Sales figures might need to be corrected or updated. A list is mutable.
print("Scenario A (Monthly Sales): Use a LIST because the data may need to be changed.")

# Scenario B: Storing the RGB color code for your company's official logo.
# Choice: Tuple. A brand color is a constant and should not be accidentally changed. A tuple is immutable.
print(
    "Scenario B (Brand Color): Use a TUPLE because the data is constant and should not change."
)

# Scenario C: Storing the names of employees in a department.
# Choice: List. The roster of employees in a department changes frequently. A list is mutable.
print(
    "Scenario C (Employee Roster): Use a LIST because the roster of employees changes over time."
)

# Scenario D: Storing the name, founding year, and stock ticker symbol for a company.
# Choice: Tuple. This is core, identifying information that is fixed and should not change. A tuple is immutable.
print(
    "Scenario D (Company Profile): Use a TUPLE because this core information is fixed."
)
print("-" * 20)
