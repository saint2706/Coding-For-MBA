"""
Day 4: Solutions to Exercises
"""

# --- Exercise 1: Generate a Report Header ---
print("--- Solution to Exercise 1 ---")
report_title = "Quarterly Sales Report"
fiscal_year = 2024

# Using .upper() to make the title all caps for emphasis
# and an f-string to combine everything.
header = f"*** {report_title.upper()} - FY{fiscal_year} ***"
print(header)
print("-" * 20)


# --- Exercise 2: Clean Up Customer Data ---
print("--- Solution to Exercise 2 ---")
customer_name = "  john doe  "

# .strip() removes the leading/trailing whitespace
# .title() capitalizes the first letter of each word
cleaned_name = customer_name.strip().title()

print(f"Original name: '{customer_name}'")
print(f"Cleaned name: '{cleaned_name}'")
print("-" * 20)


# --- Exercise 3: Parse Product SKU ---
print("--- Solution to Exercise 3 ---")
sku = "PROD-GADGET-001"

# .split('-') breaks the string into a list of substrings,
# using the hyphen as the separator.
sku_parts = sku.split("-")

# We can access the parts of the list by their index.
product_type = sku_parts[0]
product_name = sku_parts[1]
product_id = sku_parts[2]

print(f"Original SKU: {sku}")
print(f"Product Type: {product_type}")
print(f"Product Name: {product_name}")
print(f"Product ID: {product_id}")
print("-" * 20)
