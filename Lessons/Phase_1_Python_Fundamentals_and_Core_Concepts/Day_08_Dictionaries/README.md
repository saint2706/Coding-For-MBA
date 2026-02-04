---
title: "Day 8: Structured Records (Dictionaries)"
tags:
  - Basics
  - Python
  - Data Structures
---

# Day 8: Dictionaries

## 🌉 The "Never-Coded" Bridge

Think about how you naturally organize information in business. When describing a customer, you don't say "John Doe, 35, Premium, $150,000"—you say "the customer's name is John Doe, age is 35, tier is Premium, and lifetime value is $150,000." Notice how each piece of data has a label that gives it meaning. This is fundamentally different from a simple list where you must remember that position 0 is name, position 1 is age, and so on. That positional memory becomes fragile as datasets grow complex.

Consider a product catalog system. A list representation might be `["SKU-12345", "Wireless Mouse", 29.99, 150, "Electronics"]`, but six months later, when you're debugging or onboarding a new team member, which position is the price? Which is inventory count? Now imagine this product record needs to add a new field for supplier information—every piece of code that processes products must be updated to account for the new position. This brittleness doesn't scale for enterprise systems that evolve constantly.

Modern business systems—from CRM platforms to financial dashboards to inventory management—all structure data as labeled records where each field has a meaningful name. This is exactly how data travels over the internet (JSON format), how it's stored in modern databases (document stores like MongoDB), and how APIs communicate. Understanding key-value data structures isn't just about Python; it's about understanding the fundamental architecture of contemporary business technology.

## 🔬 The Technical Deep Dive

A dictionary in Python is a collection of key-value pairs enclosed in curly braces: `customer = {"id": "C1001", "name": "Acme Corp", "tier": "Premium", "balance": 150000}`. Each key (like "name" or "balance") maps to a specific value. You access values by their keys: `customer["name"]` returns "Acme Corp". Unlike lists where you access by numeric position `list[0]`, dictionaries access by meaningful labels, making code self-documenting and resilient to structure changes.

Keys must be immutable (strings, numbers, or tuples), but values can be anything—numbers, strings, lists, or even other dictionaries. This enables nested structures that mirror real business data: `employee = {"name": "Sarah", "department": "Sales", "projects": ["Project A", "Project B"], "contact": {"email": "sarah@company.com", "phone": "555-0100"}}`. Here, the "projects" value is a list, and "contact" is a nested dictionary. Accessing nested data uses chaining: `employee["contact"]["email"]` gives you the email address.

Python provides two primary access methods with different safety profiles. Direct bracket notation `dict[key]` is fast but raises a KeyError if the key doesn't exist. The `.get()` method is safer: `customer.get("email", "N/A")` returns "N/A" if the "email" key is missing rather than crashing. This is crucial when working with real-world data that may have optional fields or when integrating with external APIs where you can't guarantee every field will always be present.

Dictionary modification is straightforward: `customer["tier"] = "Enterprise"` updates an existing value or creates the key if it doesn't exist. You can remove keys with `del customer["balance"]` or `customer.pop("balance")`, which also returns the removed value. The `.update()` method merges another dictionary: `customer.update({"phone": "555-0199", "email": "contact@acme.com"})` adds or updates multiple keys at once. Iteration offers multiple approaches: `for key in customer` iterates over keys, `for value in customer.values()` iterates over values, and `for key, value in customer.items()` iterates over both simultaneously.

## 🏗️ Senior-Level Insights

In production systems, dictionaries serve as the data interchange format through JSON (JavaScript Object Notation), which is essentially dictionaries and lists combined. When your Python application calls a REST API, sends data to a database, or communicates with a frontend, it's almost certainly converting Python dictionaries to JSON and vice versa. Understanding this mapping is fundamental—a Python `dict` becomes a JSON object, `list` becomes a JSON array, `None` becomes `null`. The `json` module's `dumps()` and `loads()` functions perform these conversions, making dictionaries the bridge between Python and the broader web ecosystem.

Performance characteristics matter at scale. Dictionary lookups are O(1) constant time—accessing a value by key takes the same time whether the dictionary has 10 items or 10 million. This makes dictionaries excellent for caching and fast lookups. However, dictionaries consume more memory than lists due to hash table overhead. In memory-constrained environments or when storing millions of similar records, consider alternatives like named tuples, dataclasses, or Pandas DataFrames. Dictionary iteration order is guaranteed (Python 3.7+), but don't confuse this with sorted order—keys are retrieved in insertion order, not alphabetical or numeric order.

Data validation becomes critical in production. When building APIs or processing user input, validate dictionary contents rigorously. Check for required keys, validate types, enforce constraints. Consider using type hints: `def process_order(order: dict[str, Any]) -> dict[str, float]` documents that the function expects and returns dictionaries with specific key types. For complex validation, libraries like Pydantic define schemas that automatically validate and type-check dictionary data. In microservices architectures, dictionary schemas often become formal contracts between services—changing a key name becomes a breaking API change requiring versioning and migration strategies.

Dictionary patterns are fundamental to many algorithms. Counting occurrences uses dictionaries: `word_count = {}; for word in words: word_count[word] = word_count.get(word, 0) + 1`. Grouping data by categories uses dictionaries: `sales_by_region = {}; for sale in sales: region = sale['region']; sales_by_region.setdefault(region, []).append(sale)`. The defaultdict from the collections module simplifies such patterns by automatically initializing missing keys. When building indexes, caches, or lookup tables, dictionaries are almost always the right choice—they make O(n²) algorithms become O(n) by enabling instant lookups instead of linear searches.

## 💻 Hands-on Lab

### Exercise 1: Basic Dictionary Operations and Data Access

**Problem:** Create a customer relationship management (CRM) system that stores customer information as dictionaries. Implement functions to create customer profiles, safely access fields that might not exist, and update customer information.

**Solution Approach:**

```python
def create_customer_profile(customer_id, name, email, tier="Standard"):
    """
    Create a new customer profile with essential information.
    Returns a dictionary representing the customer.
    """
    profile = {
        "id": customer_id,
        "name": name,
        "email": email,
        "tier": tier,
        "join_date": "2024-01-15",
        "lifetime_value": 0.0,
        "status": "active"
    }
    return profile

def display_customer_info(customer):
    """Display customer information with safe field access."""
    print(f"\n{'=' * 50}")
    print(f"Customer Profile: {customer['id']}")
    print(f"{'=' * 50}")
    print(f"Name: {customer['name']}")
    print(f"Email: {customer.get('email', 'No email on file')}")
    print(f"Phone: {customer.get('phone', 'No phone on file')}")
    print(f"Tier: {customer['tier']}")
    print(f"Lifetime Value: ${customer.get('lifetime_value', 0):,.2f}")
    print(f"Status: {customer.get('status', 'unknown')}")

def update_customer_tier(customer, new_tier, reason):
    """Update customer tier and record the reason."""
    old_tier = customer.get('tier', 'Unknown')
    customer['tier'] = new_tier
    customer['tier_change_reason'] = reason
    print(f"\n✅ Customer {customer['id']} upgraded: {old_tier} → {new_tier}")
    print(f"   Reason: {reason}")
    return customer

# Create customer profiles
customer1 = create_customer_profile(
    "C1001", 
    "Acme Corporation", 
    "contact@acme.com",
    tier="Standard"
)

customer2 = create_customer_profile(
    "C1002",
    "TechStart Inc",
    "admin@techstart.io"
)

# Display initial profiles
display_customer_info(customer1)
display_customer_info(customer2)

# Update customer information
customer1['phone'] = '+1-555-0100'
customer1['lifetime_value'] = 45000.00

# Safely add optional fields
customer2.update({
    'phone': '+1-555-0200',
    'lifetime_value': 12500.00,
    'industry': 'Technology'
})

print("\n" + "=" * 50)
print("After Updates:")
print("=" * 50)
display_customer_info(customer1)
display_customer_info(customer2)

# Upgrade based on business rules
update_customer_tier(customer1, "Premium", "Lifetime value exceeded $40,000")
update_customer_tier(customer2, "Gold", "Strategic partnership established")

# Demonstrate dictionary methods
print(f"\nAll customer fields for {customer1['id']}: {list(customer1.keys())}")
print(f"Total fields tracked: {len(customer1)}")

# Check if field exists before accessing
if 'industry' in customer2:
    print(f"\n{customer2['name']} operates in: {customer2['industry']}")
else:
    print(f"\nIndustry not recorded for {customer2['name']}")
```

**Output:**
```
==================================================
Customer Profile: C1001
==================================================
Name: Acme Corporation
Email: contact@acme.com
Phone: No phone on file
Tier: Standard
Lifetime Value: $0.00
Status: active

==================================================
Customer Profile: C1002
==================================================
Name: TechStart Inc
Email: admin@techstart.io
Phone: No phone on file
Tier: Standard
Lifetime Value: $0.00
Status: active

==================================================
After Updates:
==================================================
==================================================
Customer Profile: C1001
==================================================
Name: Acme Corporation
Email: contact@acme.com
Phone: +1-555-0100
Tier: Standard
Lifetime Value: $45,000.00
Status: active

==================================================
Customer Profile: C1002
==================================================
Name: TechStart Inc
Email: admin@techstart.io
Phone: +1-555-0200
Tier: Standard
Lifetime Value: $12,500.00
Status: active

✅ Customer C1001 upgraded: Standard → Premium
   Reason: Lifetime value exceeded $40,000

✅ Customer C1002 upgraded: Standard → Gold
   Reason: Strategic partnership established

All customer fields for C1001: ['id', 'name', 'email', 'tier', 'join_date', 'lifetime_value', 'status', 'phone', 'tier_change_reason']
Total fields tracked: 9

TechStart Inc operates in: Technology
```

### Exercise 2: Nested Dictionaries and Complex Data Structures

**Problem:** Build an employee management system where each employee has basic information plus nested data structures for contact details, assigned projects, and performance reviews. Demonstrate how to navigate and update nested structures safely.

**Solution Approach:**

```python
def create_employee_record(emp_id, name, department, salary):
    """Create comprehensive employee record with nested structures."""
    return {
        "employee_id": emp_id,
        "name": name,
        "department": department,
        "salary": salary,
        "contact": {
            "email": f"{name.lower().replace(' ', '.')}@company.com",
            "phone": None,
            "address": {}
        },
        "projects": [],
        "performance_reviews": []
    }

def assign_project(employee, project_name, role, hours_per_week):
    """Add a project to employee's workload."""
    project = {
        "name": project_name,
        "role": role,
        "hours_per_week": hours_per_week,
        "status": "active"
    }
    employee["projects"].append(project)
    print(f"✅ Assigned {employee['name']} to {project_name} as {role}")

def add_performance_review(employee, year, rating, comments):
    """Record a performance review."""
    review = {
        "year": year,
        "rating": rating,
        "comments": comments
    }
    employee["performance_reviews"].append(review)

def calculate_total_project_hours(employee):
    """Sum total weekly hours across all projects."""
    total_hours = sum(
        project["hours_per_week"] 
        for project in employee["projects"]
        if project["status"] == "active"
    )
    return total_hours

def display_employee_summary(employee):
    """Display comprehensive employee information."""
    print(f"\n{'=' * 60}")
    print(f"Employee: {employee['name']} ({employee['employee_id']})")
    print(f"{'=' * 60}")
    print(f"Department: {employee['department']}")
    print(f"Salary: ${employee['salary']:,}")
    
    # Access nested contact information
    email = employee["contact"]["email"]
    phone = employee["contact"].get("phone", "Not provided")
    print(f"\nContact:")
    print(f"  Email: {email}")
    print(f"  Phone: {phone}")
    
    # Display projects
    if employee["projects"]:
        print(f"\nProjects ({len(employee['projects'])}):")
        for i, project in enumerate(employee["projects"], 1):
            print(f"  {i}. {project['name']} - {project['role']}")
            print(f"     Hours/week: {project['hours_per_week']} | Status: {project['status']}")
        
        total_hours = calculate_total_project_hours(employee)
        print(f"\nTotal Active Project Hours: {total_hours}/week")
    
    # Display performance history
    if employee["performance_reviews"]:
        print(f"\nPerformance History:")
        for review in employee["performance_reviews"]:
            print(f"  {review['year']}: {review['rating']}/5 - {review['comments']}")

# Create employee records
sarah = create_employee_record("E1001", "Sarah Johnson", "Engineering", 120000)
mike = create_employee_record("E1002", "Mike Chen", "Product", 110000)

# Update nested contact information
sarah["contact"]["phone"] = "+1-555-0150"
sarah["contact"]["address"] = {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA"
}

mike["contact"]["phone"] = "+1-555-0151"

# Assign projects to employees
assign_project(sarah, "Customer Dashboard Redesign", "Tech Lead", 25)
assign_project(sarah, "API Performance Optimization", "Senior Engineer", 15)
assign_project(mike, "Customer Dashboard Redesign", "Product Manager", 30)
assign_project(mike, "Q3 Roadmap Planning", "Lead PM", 10)

# Add performance reviews
add_performance_review(sarah, 2023, 5, "Exceptional technical leadership")
add_performance_review(sarah, 2024, 5, "Consistently exceeds expectations")
add_performance_review(mike, 2023, 4, "Strong product vision and execution")

# Display comprehensive summaries
display_employee_summary(sarah)
display_employee_summary(mike)

# Demonstrate safe navigation of nested structures
print("\n" + "=" * 60)
print("Safe Access to Potentially Missing Fields:")
print("=" * 60)

# Safely check nested fields
if "address" in sarah["contact"] and "city" in sarah["contact"]["address"]:
    city = sarah["contact"]["address"]["city"]
    print(f"Sarah's office location: {city}")

# Using chained .get() for deep nesting
mike_city = mike.get("contact", {}).get("address", {}).get("city", "Unknown")
print(f"Mike's office location: {mike_city}")
```

**Output:**
```
✅ Assigned Sarah Johnson to Customer Dashboard Redesign as Tech Lead
✅ Assigned Sarah Johnson to API Performance Optimization as Senior Engineer
✅ Assigned Mike Chen to Customer Dashboard Redesign as Product Manager
✅ Assigned Mike Chen to Q3 Roadmap Planning as Lead PM

============================================================
Employee: Sarah Johnson (E1001)
============================================================
Department: Engineering
Salary: $120,000

Contact:
  Email: sarah.johnson@company.com
  Phone: +1-555-0150

Projects (2):
  1. Customer Dashboard Redesign - Tech Lead
     Hours/week: 25 | Status: active
  2. API Performance Optimization - Senior Engineer
     Hours/week: 15 | Status: active

Total Active Project Hours: 40/week

Performance History:
  2023: 5/5 - Exceptional technical leadership
  2024: 5/5 - Consistently exceeds expectations

============================================================
Employee: Mike Chen (E1002)
============================================================
Department: Product
Salary: $110,000

Contact:
  Email: mike.chen@company.com
  Phone: +1-555-0151

Projects (2):
  1. Customer Dashboard Redesign - Product Manager
     Hours/week: 30 | Status: active
  2. Q3 Roadmap Planning - Lead PM
     Hours/week: 10 | Status: active

Total Active Project Hours: 40/week

Performance History:
  2023: 4/5 - Strong product vision and execution

============================================================
Safe Access to Potentially Missing Fields:
============================================================
Sarah's office location: San Francisco
Mike's office location: Unknown
```

### Exercise 3: Advanced Dictionary Operations - Analytics and Aggregation

**Problem:** Build a sales analytics system that processes transaction data, aggregates metrics by multiple dimensions (region, product, salesperson), and generates business intelligence reports. Demonstrate practical patterns for grouping, counting, and calculating summary statistics.

**Solution Approach:**

```python
# Sample transaction data
transactions = [
    {"id": "T1001", "region": "West", "product": "Laptop", "salesperson": "Alice", "amount": 1200, "quantity": 1},
    {"id": "T1002", "region": "West", "product": "Mouse", "salesperson": "Alice", "amount": 25, "quantity": 2},
    {"id": "T1003", "region": "East", "product": "Laptop", "salesperson": "Bob", "amount": 1200, "quantity": 1},
    {"id": "T1004", "region": "East", "product": "Keyboard", "salesperson": "Bob", "amount": 75, "quantity": 3},
    {"id": "T1005", "region": "West", "product": "Monitor", "salesperson": "Alice", "amount": 400, "quantity": 2},
    {"id": "T1006", "region": "South", "product": "Laptop", "salesperson": "Carol", "amount": 1200, "quantity": 1},
    {"id": "T1007", "region": "East", "product": "Mouse", "salesperson": "Bob", "amount": 25, "quantity": 1},
    {"id": "T1008", "region": "South", "product": "Keyboard", "salesperson": "Carol", "amount": 75, "quantity": 2},
]

def aggregate_by_dimension(transactions, dimension_key):
    """
    Group transactions and calculate metrics by a specific dimension.
    Returns dict with aggregated revenue, count, and average.
    """
    aggregated = {}
    
    for transaction in transactions:
        dimension_value = transaction[dimension_key]
        
        # Initialize if first time seeing this value
        if dimension_value not in aggregated:
            aggregated[dimension_value] = {
                "revenue": 0,
                "transaction_count": 0,
                "total_quantity": 0
            }
        
        # Accumulate metrics
        aggregated[dimension_value]["revenue"] += transaction["amount"]
        aggregated[dimension_value]["transaction_count"] += 1
        aggregated[dimension_value]["total_quantity"] += transaction["quantity"]
    
    # Calculate averages
    for dimension_value in aggregated:
        metrics = aggregated[dimension_value]
        metrics["average_transaction"] = (
            metrics["revenue"] / metrics["transaction_count"]
        )
    
    return aggregated

def create_multidimensional_cube(transactions):
    """
    Create a multidimensional analysis cube for complex queries.
    Structure: {region: {product: {metrics}}}
    """
    cube = {}
    
    for transaction in transactions:
        region = transaction["region"]
        product = transaction["product"]
        
        # Ensure region exists
        if region not in cube:
            cube[region] = {}
        
        # Ensure product exists within region
        if product not in cube[region]:
            cube[region][product] = {
                "revenue": 0,
                "quantity": 0,
                "transactions": []
            }
        
        # Aggregate data
        cube[region][product]["revenue"] += transaction["amount"]
        cube[region][product]["quantity"] += transaction["quantity"]
        cube[region][product]["transactions"].append(transaction["id"])
    
    return cube

def generate_leaderboard(transactions, metric="amount"):
    """
    Rank salespeople by specified metric.
    Returns sorted list of (salesperson, total_metric) tuples.
    """
    salesperson_totals = {}
    
    for transaction in transactions:
        salesperson = transaction["salesperson"]
        value = transaction[metric]
        
        salesperson_totals[salesperson] = (
            salesperson_totals.get(salesperson, 0) + value
        )
    
    # Convert to sorted list
    leaderboard = sorted(
        salesperson_totals.items(),
        key=lambda x: x[1],
        reverse=True
    )
    
    return leaderboard

def display_report(title, data_dict):
    """Pretty print a report from a dictionary."""
    print(f"\n{'=' * 70}")
    print(f"{title:^70}")
    print(f"{'=' * 70}")
    
    for key, metrics in data_dict.items():
        print(f"\n{key}:")
        for metric_name, value in metrics.items():
            if isinstance(value, float):
                print(f"  {metric_name}: ${value:,.2f}" if "revenue" in metric_name or "average" in metric_name else f"  {metric_name}: {value:.2f}")
            elif isinstance(value, (int, float)):
                print(f"  {metric_name}: {value:,}")

# Generate regional analysis
regional_metrics = aggregate_by_dimension(transactions, "region")
display_report("REGIONAL PERFORMANCE ANALYSIS", regional_metrics)

# Generate product analysis
product_metrics = aggregate_by_dimension(transactions, "product")
display_report("PRODUCT PERFORMANCE ANALYSIS", product_metrics)

# Generate salesperson analysis
salesperson_metrics = aggregate_by_dimension(transactions, "salesperson")
display_report("SALESPERSON PERFORMANCE ANALYSIS", salesperson_metrics)

# Create and query multidimensional cube
print("\n" + "=" * 70)
print("MULTIDIMENSIONAL ANALYSIS - REGION × PRODUCT".center(70))
print("=" * 70)

cube = create_multidimensional_cube(transactions)

for region in sorted(cube.keys()):
    print(f"\n{region} Region:")
    for product, metrics in sorted(cube[region].items()):
        print(f"  {product}:")
        print(f"    Revenue: ${metrics['revenue']:,}")
        print(f"    Units Sold: {metrics['quantity']}")
        print(f"    Transactions: {len(metrics['transactions'])}")

# Generate leaderboard
print("\n" + "=" * 70)
print("SALES LEADERBOARD".center(70))
print("=" * 70)

revenue_leaderboard = generate_leaderboard(transactions, "amount")
print("\nBy Revenue:")
for rank, (salesperson, revenue) in enumerate(revenue_leaderboard, 1):
    print(f"  {rank}. {salesperson}: ${revenue:,}")

quantity_leaderboard = generate_leaderboard(transactions, "quantity")
print("\nBy Units Sold:")
for rank, (salesperson, quantity) in enumerate(quantity_leaderboard, 1):
    print(f"  {rank}. {salesperson}: {quantity} units")

# Calculate company-wide totals
total_revenue = sum(t["amount"] for t in transactions)
total_transactions = len(transactions)
total_quantity = sum(t["quantity"] for t in transactions)

print("\n" + "=" * 70)
print("COMPANY TOTALS".center(70))
print("=" * 70)
print(f"Total Revenue: ${total_revenue:,}")
print(f"Total Transactions: {total_transactions}")
print(f"Total Units Sold: {total_quantity}")
print(f"Average Transaction Value: ${total_revenue / total_transactions:,.2f}")
```

**Output:**
```
======================================================================
              REGIONAL PERFORMANCE ANALYSIS
======================================================================

West:
  revenue: $1,625
  transaction_count: 3
  total_quantity: 5
  average_transaction: $541.67

East:
  revenue: $1,300
  transaction_count: 3
  total_quantity: 5
  average_transaction: $433.33

South:
  revenue: $1,275
  transaction_count: 2
  total_quantity: 3
  average_transaction: $637.50

======================================================================
              PRODUCT PERFORMANCE ANALYSIS
======================================================================

Laptop:
  revenue: $3,600
  transaction_count: 3
  total_quantity: 3
  average_transaction: $1,200.00

Mouse:
  revenue: $50
  transaction_count: 2
  total_quantity: 3
  average_transaction: $25.00

Keyboard:
  revenue: $150
  transaction_count: 2
  total_quantity: 5
  average_transaction: $75.00

Monitor:
  revenue: $400
  transaction_count: 1
  total_quantity: 2
  average_transaction: $400.00

======================================================================
           SALESPERSON PERFORMANCE ANALYSIS
======================================================================

Alice:
  revenue: $1,625
  transaction_count: 3
  total_quantity: 5
  average_transaction: $541.67

Bob:
  revenue: $1,300
  transaction_count: 3
  total_quantity: 5
  average_transaction: $433.33

Carol:
  revenue: $1,275
  transaction_count: 2
  total_quantity: 3
  average_transaction: $637.50

======================================================================
          MULTIDIMENSIONAL ANALYSIS - REGION × PRODUCT
======================================================================

East Region:
  Keyboard:
    Revenue: $75
    Units Sold: 3
    Transactions: 1
  Laptop:
    Revenue: $1,200
    Units Sold: 1
    Transactions: 1
  Mouse:
    Revenue: $25
    Units Sold: 1
    Transactions: 1

South Region:
  Keyboard:
    Revenue: $75
    Units Sold: 2
    Transactions: 1
  Laptop:
    Revenue: $1,200
    Units Sold: 1
    Transactions: 1

West Region:
  Laptop:
    Revenue: $1,200
    Units Sold: 1
    Transactions: 1
  Monitor:
    Revenue: $400
    Units Sold: 2
    Transactions: 1
  Mouse:
    Revenue: $25
    Units Sold: 2
    Transactions: 1

======================================================================
                      SALES LEADERBOARD
======================================================================

By Revenue:
  1. Alice: $1,625
  2. Bob: $1,300
  3. Carol: $1,275

By Units Sold:
  1. Alice: 5 units
  2. Bob: 5 units
  3. Carol: 3 units

======================================================================
                       COMPANY TOTALS
======================================================================
Total Revenue: $4,200
Total Transactions: 8
Total Units Sold: 13
Average Transaction Value: $525.00
```

## ✅ Mastery Check

1. **Basic Understanding:** Explain the difference between accessing a dictionary with `customer["email"]` versus `customer.get("email", "N/A")`. When would each approach be appropriate in a production system?

2. **Practical Application:** You have a product catalog dictionary: `catalog = {"SKU-001": {"name": "Laptop", "price": 999, "stock": 50}}`. Write code to: (a) safely check if a product exists, (b) update its price, (c) add a new product, and (d) access the stock level for SKU-001.

3. **Nested Structures:** Design a dictionary structure to represent a customer order that includes: order ID, customer information (name, email), shipping address (street, city, state, zip), and a list of order items where each item has (product_name, quantity, unit_price). Provide example data and show how to calculate the order total.

4. **Performance Considerations:** You need to look up customer information 100,000 times during a data processing job. You have two options: (a) search through a list of 50,000 customer dictionaries each time, or (b) create a single dictionary with customer IDs as keys. Explain the performance difference and calculate the approximate time complexity for each approach.

5. **Production Architecture:** In a microservices architecture, Service A sends customer data to Service B via JSON. The JSON structure is `{"customer_id": "C001", "name": "John Doe", "tier": "Premium"}`. Service B expects this exact structure, but sometimes Service A's data is missing the "tier" field. Explain: (a) what happens when Service B tries to access `data["tier"]` on incomplete data, (b) how to make the code robust using .get(), and (c) what architectural patterns (like schema validation) would prevent such issues in production systems.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 07 – Sets](../Day_07_Sets/README.md) • **Next:** [Day 09 – Conditionals](../Day_09_Conditionals/README.md)

_You are on lesson 8 of 108._

<!-- LESSON_FOOTER_END -->
