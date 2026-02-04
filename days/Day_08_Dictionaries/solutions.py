"""
Day 8: Solutions to Exercises
"""

# --- Exercise 1: Create a Product Dictionary ---
print("--- Solution to Exercise 1 ---")
product = {
    "product_id": "PROD-123",
    "product_name": "SuperWidget",
    "price": 199.99,
    "in_stock": True,
    "tags": ["electronics", "gadget"],
}

# Accessing the values using their keys
print(f"Product Name: {product['product_name']}")
print(f"Price: ${product['price']}")
print("-" * 20)


# --- Exercise 2: Modify Employee Information ---
print("--- Solution to Exercise 2 ---")
employee = {
    "employee_id": "EMP-042",
    "name": "Jane Smith",
    "department": "Marketing",
    "contact_info": {"email": "jane.smith@example.com", "phone_ext": 112},
    "projects": ["Q1 Campaign", "Website Redesign"],
}
print(f"Original Employee Record: {employee}")

# Update the department
employee["department"] = "Marketing Director"

# Add a new project to the list of projects
employee["projects"].append("2025 Strategy")

print(f"Updated Employee Record: {employee}")
print("-" * 20)


# --- Exercise 3: Access Nested Data ---
print("--- Solution to Exercise 3 ---")
company = {
    "company_name": "InnovateCorp",
    "year_founded": 2015,
    "headquarters": {"city": "New York", "state": "NY", "country": "USA"},
}

# Accessing the nested dictionary and then the values within it
company_name = company["company_name"]
hq_city = company["headquarters"]["city"]
hq_state = company["headquarters"]["state"]

print(f"{company_name} is headquartered in {hq_city}, {hq_state}.")
print("-" * 20)
