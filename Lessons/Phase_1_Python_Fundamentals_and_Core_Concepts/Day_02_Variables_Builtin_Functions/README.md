# Day 2: Variables and Built-in Functions

## 🌉 The "Never-Coded" Bridge

Imagine walking into a kitchen where every ingredient is unlabeled. You see a white powder—is it flour, sugar, or salt? In that chaos, cooking is impossible. Variables are the labels in your code's kitchen. When you write `quarterly_revenue = 245000`, you're not just storing a number; you're creating a named container that tells every future reader (including yourself in three months) exactly what this value represents.

In Excel, you might put revenue in cell B3, and six months later, you have no idea what B3 means without reading surrounding context. In Python, descriptive variable names make your code self-documenting. `customer_lifetime_value` is infinitely clearer than `x` or `value1`. This isn't just about being nice to other programmers—it's about creating business logic that survives beyond your tenure, that can be audited, that can scale from a one-person startup to a thousand-person enterprise.

Think of variables as the foundation of data-driven decision making. Every dashboard, every report, every automated alert starts with storing data in intelligently named containers. You're not memorizing syntax; you're learning the language of scalable business intelligence.

## 🔬 The Technical Deep Dive

Variables in Python are created through assignment using the `=` operator. Unlike statically-typed languages (Java, C++), Python uses dynamic typing—you don't declare types explicitly; the interpreter infers them. When you write `revenue = 100000`, Python creates an integer object and binds the name `revenue` to it. If you later assign `revenue = "one hundred thousand"`, the same name now references a string object.

Python's primary data types include:
- **int**: Arbitrary-precision integers (can grow to any size limited only by memory)
- **float**: Double-precision floating-point numbers (IEEE 754 standard)
- **str**: Immutable sequence of Unicode characters
- **bool**: Subclass of int with two values: `True` (1) and `False` (0)

Built-in functions operate on these types without needing imports. `len()` returns the length of sequences (strings, lists, tuples). `type()` returns the type object of any value. `int()`, `float()`, and `str()` perform type conversions. For example:

```python
price = "19.99"  # String type
price_numeric = float(price)  # Convert to float: 19.99
quantity = 5
total = price_numeric * quantity  # 99.95
```

F-strings (formatted string literals) use the `f""` prefix and embed expressions in `{}`. They're evaluated at runtime and offer powerful formatting options:

```python
name = "Alice"
salary = 75000
print(f"{name} earns ${salary:,.2f} annually")
# Output: Alice earns $75,000.00 annually
```

The `:,.2f` format specifier adds comma thousands separators and rounds to two decimal places—essential for business reporting.

Naming conventions follow PEP 8: use `snake_case` for variables and functions (lowercase with underscores), `UPPER_CASE` for constants, and descriptive names (avoid single letters except for counters like `i` in loops). Good names are self-documenting; they reduce the need for comments.

## 🏗️ Senior-Level Insights

In production systems, variable naming becomes an architectural decision. Inconsistent naming creates technical debt that compounds over time. A codebase where some developers use `user_id`, others use `userId`, and still others use `uid` becomes unmaintainable. Organizations establish style guides and enforce them with linters (like `pylint` or `black`) in CI/CD pipelines. Code reviews reject submissions with poor variable names before they reach production.

Type hints, introduced in Python 3.5+, bring optional static typing to Python. While the interpreter ignores them, tools like `mypy` perform static analysis to catch type errors before runtime:

```python
def calculate_roi(revenue: float, cost: float) -> float:
    return ((revenue - cost) / cost) * 100
```

This documentation is invaluable in large codebases where functions are called from dozens of locations. Type hints prevent the classic error of passing a string where a number was expected, catching bugs at development time rather than in production.

Memory management with variables matters at scale. Python uses reference counting and garbage collection. When you create millions of variables in a loop without proper scoping, you can exhaust memory. Understanding that `del variable` removes the reference (allowing garbage collection) or that local variables in functions are automatically cleaned up after execution prevents memory leaks in long-running services.

Performance optimization starts with understanding that dictionary lookups are O(1) while list searches are O(n). Choosing the right data structure based on access patterns—a decision informed by knowing variable types deeply—can mean the difference between a query taking milliseconds versus minutes at scale. Senior engineers design data models where variable types and structures align with business access patterns.

## 💻 Hands-on Lab

### Exercise 1: Employee Record System

**Problem:** Create a system to store and display employee information using appropriate variables and data types.

**Solution Approach:**
1. Define variables for employee attributes using descriptive names
2. Use appropriate data types for each attribute
3. Format output using f-strings for professional presentation

```python
# Employee data with appropriate types
employee_id = 1047
first_name = "Sarah"
last_name = "Chen"
monthly_salary = 8500.00
is_full_time = True
years_of_service = 3

# Calculate annual compensation
annual_salary = monthly_salary * 12

# Format and display employee record
print("=" * 50)
print("EMPLOYEE RECORD")
print("=" * 50)
print(f"ID: {employee_id}")
print(f"Name: {first_name} {last_name}")
print(f"Monthly Salary: ${monthly_salary:,.2f}")
print(f"Annual Salary: ${annual_salary:,.2f}")
print(f"Employment Type: {'Full-Time' if is_full_time else 'Part-Time'}")
print(f"Years of Service: {years_of_service}")
print("=" * 50)

# Demonstrate built-in functions
print(f"\nData Type Analysis:")
print(f"Employee ID type: {type(employee_id)}")
print(f"First name type: {type(first_name)}")
print(f"Salary type: {type(monthly_salary)}")
print(f"Full-time status type: {type(is_full_time)}")
print(f"Name length: {len(first_name + ' ' + last_name)} characters")
```

This demonstrates proper variable naming, type selection, f-string formatting with numeric formatting, and practical use of built-in functions.

### Exercise 2: Product Inventory Management

**Problem:** Build an inventory system that tracks product information, validates data types, and calculates inventory value.

**Solution Approach:**
1. Create variables for product attributes
2. Use built-in functions for validation and calculation
3. Handle type conversions for user-friendly output

```python
# Product information
product_sku = "LAPTOP-DELL-XPS15"
product_name = "Dell XPS 15 Laptop"
unit_price = 1299.99
quantity_in_stock = 47
minimum_stock_level = 20
is_active = True

# Calculate inventory metrics
total_inventory_value = unit_price * quantity_in_stock
needs_reorder = quantity_in_stock < minimum_stock_level

# Display product information
print(f"Product Analysis: {product_name}")
print(f"SKU: {product_sku}")
print(f"Unit Price: ${unit_price:.2f}")
print(f"Stock Level: {quantity_in_stock} units")
print(f"Total Inventory Value: ${total_inventory_value:,.2f}")
print(f"Status: {'Active' if is_active else 'Discontinued'}")
print(f"Reorder Needed: {'Yes' if needs_reorder else 'No'}")

# Data validation using built-in functions
print(f"\nData Validation:")
print(f"SKU length: {len(product_sku)} characters")
print(f"SKU is valid length (>= 10): {len(product_sku) >= 10}")

# Type checking
print(f"\nType Verification:")
print(f"Price is numeric: {isinstance(unit_price, (int, float))}")
print(f"Quantity is integer: {type(quantity_in_stock).__name__}")
```

This exercise showcases validation logic, boolean operations, type checking with `isinstance()`, and business logic implementation using variables.

### Exercise 3: Financial Dashboard Data Preparation

**Problem:** Prepare quarterly financial data for dashboard display, including data type conversions and formatting.

**Solution Approach:**
1. Store financial metrics in appropriately typed variables
2. Perform calculations and format results for executive presentation
3. Use type conversion functions to handle mixed data types

```python
# Quarterly financial data
quarter = "Q1"
year = 2024
revenue = 2_450_000  # Underscores for readability (Python 3.6+)
operating_expenses = 1_650_000
marketing_spend = 425_000
headcount = 87

# Calculations
gross_profit = revenue - operating_expenses
profit_margin = (gross_profit / revenue) * 100
revenue_per_employee = revenue / headcount
marketing_as_percent_of_revenue = (marketing_spend / revenue) * 100

# Executive Summary Report
company_name = "TechVenture Analytics"
report_title = f"{company_name} - {quarter} {year} Financial Summary"

print(report_title)
print("=" * len(report_title))
print(f"\nRevenue: ${revenue:,}")
print(f"Operating Expenses: ${operating_expenses:,}")
print(f"Gross Profit: ${gross_profit:,}")
print(f"Profit Margin: {profit_margin:.1f}%")
print(f"\nOperational Metrics:")
print(f"Headcount: {headcount} employees")
print(f"Revenue per Employee: ${revenue_per_employee:,.2f}")
print(f"Marketing Spend: ${marketing_spend:,} ({marketing_as_percent_of_revenue:.1f}% of revenue)")

# Data type demonstration
print(f"\n--- Technical Details ---")
print(f"Revenue data type: {type(revenue).__name__}")
print(f"Profit margin data type: {type(profit_margin).__name__}")
print(f"Quarter data type: {type(quarter).__name__}")

# Type conversion example
revenue_as_string = str(revenue)
print(f"Revenue as string for logging: '{revenue_as_string}' (type: {type(revenue_as_string).__name__})")
```

This advanced exercise combines multiple concepts: numeric literals with underscores, complex calculations, advanced f-string formatting, type introspection, and practical business reporting structure.

## ✅ Mastery Check

1. **Basic Implementation:** Create three variables: `product_name` (string), `price` (float), and `in_stock` (boolean). Use the `type()` function to verify each variable's type and print the results. What are the three type names Python returns?

2. **Applied Understanding:** You have two variables: `monthly_active_users = "15000"` (note: it's a string) and `conversion_rate = 0.05`. Write code to calculate the number of conversions, but first convert the string to an integer. Then format the output to display: "Conversions: 750 users". What function do you use for the conversion?

3. **Debugging Challenge:** A developer wrote this code but it produces an error:
   ```python
   first_name = "John"
   last_name = "Smith"
   age = 32
   bio = "Employee name: " + first_name + " " + last_name + ", Age: " + age
   print(bio)
   ```
   Why does this fail? Fix it using two different approaches: one with type conversion and one with f-strings.

4. **Design Scenario:** You're building a customer database that stores customer profiles. Each profile needs: customer ID (unique number), name, email, phone, account balance, is_premium_member status, and signup date. For each field, determine the most appropriate data type and explain why. For example, should account balance be an int or float? Should customer ID be an int or string? Justify each choice from a business and technical perspective.

5. **Synthesis Challenge:** Explain the relationship between variable naming conventions, code maintainability, and total cost of ownership in enterprise software. If poor variable naming adds an average of 5 minutes per code review and your team does 50 reviews per week, what's the annual time cost? Now consider that confusing variable names also cause bugs—how does this compound the business impact? Propose three specific naming standards your team should adopt.
