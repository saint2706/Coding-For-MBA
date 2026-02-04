---
title: "Day 12: List Comprehension - Elegant Data Manipulation"
tags:
  - Basics
  - Data
  - Python
---

# Day 12: List Comprehension (Elegant Data Transformation)

## 🌉 The "Never-Coded" Bridge

Think about how analysts actually work with data in spreadsheets. You have a column of raw sales figures, and you need a new column with each sale increased by 10% for budget forecasting. In Excel, you'd write a formula in one cell, then drag it down through hundreds of rows—effectively saying "apply this transformation to every item in this list." Or you have customer data and need to filter out everyone who spent less than $1,000—you'd set up an auto-filter or write a formula to extract matches. This pattern—transform every item or select items matching criteria—dominates data work.

Python's list comprehension is this spreadsheet operation condensed into one elegant line of code. Instead of initializing an empty list, writing a for loop, adding an if statement for filtering, and appending results, you express the entire operation declaratively: "here's what I want from each item that meets my criteria." What would take five lines of loop code becomes one readable line that clearly states your intent. Senior developers prefer comprehensions not just for brevity but for clarity—when you see a comprehension, you immediately know "this is creating a new list by transforming/filtering data."

The business impact is velocity and accuracy. Analysts who learn comprehensions transform data 10x faster than with explicit loops. Financial models that once took hours to build—extracting subsets, calculating ratios, reformatting displays—now take minutes. More importantly, comprehensions reduce errors: there's no risk of forgetting to initialize the result list, no off-by-one errors in loop indices, no accidentally modifying the original data. The code becomes self-documenting: `high_value_sales = [sale for sale in sales if sale > 10000]` reads like plain English.

## 🔬 The Technical Deep Dive

A list comprehension creates a new list in a single expression, enclosed in square brackets. The basic syntax has three components: an expression defining what goes in the new list, a `for` clause specifying the source iterable, and an optional `if` clause for filtering. The general form is `[expression for item in iterable if condition]`.

```python
# Traditional for loop approach
prices = [19.99, 29.99, 49.99, 99.99, 15.99]

# Old way: explicit loop
increased_prices = []
for price in prices:
    increased_prices.append(price * 1.10)

# List comprehension way: one line, same result
increased_prices = [price * 1.10 for price in prices]

print(increased_prices)
# Output: [21.989, 32.989, 54.989, 109.989, 17.589]
```

The expression part (what comes before `for`) can be any valid Python expression—arithmetic operations, function calls, method calls, or even nested comprehensions. This is where the transformation happens: you specify how to convert each input item into an output item.

```python
# More complex transformations
sales_data = [
    {'product': 'Widget A', 'quantity': 5, 'price': 19.99},
    {'product': 'Widget B', 'quantity': 2, 'price': 49.99},
    {'product': 'Widget C', 'quantity': 8, 'price': 9.99}
]

# Extract total revenue for each sale
revenues = [item['quantity'] * item['price'] for item in sales_data]
print(f"Revenues: {revenues}")
# Output: Revenues: [99.95, 99.98, 79.92]

# Extract and format product names
product_names = [item['product'].upper() for item in sales_data]
print(f"Products: {product_names}")
# Output: Products: ['WIDGET A', 'WIDGET B', 'WIDGET C']
```

The optional `if` clause provides filtering—only items that satisfy the condition make it into the new list. This combines transformation and filtering in one operation, replacing the pattern of looping with a nested if statement.

```python
# Filtering with conditions
daily_sales = [1200, 450, 2100, 890, 3400, 670, 2800]

# Extract only high-value sales (over 1000)
high_sales = [sale for sale in daily_sales if sale > 1000]
print(f"High sales: {high_sales}")
# Output: High sales: [1200, 2100, 3400, 2800]

# Filter AND transform: apply 10% bonus to high sales only
bonus_eligible = [sale * 1.10 for sale in daily_sales if sale > 1000]
print(f"With bonuses: {bonus_eligible}")
# Output: With bonuses: [1320.0, 2310.0, 3740.0, 3080.0]

# Complex filtering with multiple conditions
customers = [
    {'name': 'Acme', 'spent': 50000, 'member': True},
    {'name': 'TechCorp', 'spent': 12000, 'member': False},
    {'name': 'GlobalInc', 'spent': 75000, 'member': True},
    {'name': 'StartupXYZ', 'spent': 8000, 'member': True}
]

# VIP customers: members who spent over 20k
vip_names = [c['name'] for c in customers if c['member'] and c['spent'] > 20000]
print(f"VIP Customers: {vip_names}")
# Output: VIP Customers: ['Acme', 'GlobalInc']
```

You can nest comprehensions for multi-dimensional data, though readability suffers beyond two levels. A common pattern is flattening nested lists: `flattened = [item for sublist in nested_list for item in sublist]`. You can also use comprehensions with dictionaries (`{key: value for...}`) and sets (`{item for...}`).

```python
# Dictionary comprehension: create lookup tables
products = ['Widget', 'Gadget', 'Doodad']
prices = [19.99, 29.99, 39.99]

# Create price dictionary from parallel lists
price_dict = {product: price for product, price in zip(products, prices)}
print(price_dict)
# Output: {'Widget': 19.99, 'Gadget': 29.99, 'Doodad': 39.99}

# Transform dictionary: apply discount to all prices
discounted = {prod: price * 0.85 for prod, price in price_dict.items()}
print(discounted)
# Output: {'Widget': 16.9915, 'Gadget': 25.4915, 'Doodad': 33.9915}
```

## 🏗️ Senior-Level Insights

List comprehensions in Python are fast—typically 2-3x faster than equivalent for loops because the iteration happens in optimized C code. However, they're not always the best choice. For simple built-in operations like summing or finding max, use the built-in functions: `sum(sales)` beats `sum([sale for sale in sales])` because it avoids creating an intermediate list. For complex transformations or operations with side effects (printing, writing to database), use explicit loops for clarity.

Memory consumption is a consideration with large datasets. A list comprehension evaluates eagerly—it creates the entire result list in memory immediately. If you're processing millions of records and only need to iterate once, use a generator expression instead: `(item * 2 for item in huge_list)` with parentheses instead of brackets. This creates a generator that yields items lazily, one at a time, using constant memory regardless of input size. In data pipelines processing gigabytes, this distinction prevents out-of-memory crashes.

Readability trumps cleverness. A three-level nested comprehension with multiple filters might be technically impressive, but it's maintenance hell. The guideline: if your comprehension doesn't fit comfortably on one line or takes more than a few seconds to understand, refactor it into an explicit loop or break it into multiple simpler comprehensions. Production code values clarity over showing off language features.

The functional programming paradigm that comprehensions represent—transforming data through pipelines of operations—scales exceptionally well to distributed computing. Frameworks like Spark and Dask let you write comprehension-like code that executes across hundreds of machines. Understanding comprehensions deeply prepares you for big data tools where `sales.map(lambda x: x * 1.1).filter(lambda x: x > 1000)` processes terabytes as naturally as a list comprehension processes kilobytes.

## 💻 Hands-on Lab

### Exercise 1: Sales Data Transformation Pipeline
**Problem:** You have raw sales data with product IDs, quantities, and unit prices. Create a pipeline that: 1) calculates revenue for each sale, 2) filters for sales over $500, 3) applies a 15% commission, and 4) formats results as currency strings.

**Solution Approach:**
```python
# Sample raw sales data
sales_data = [
    {'product_id': 'P001', 'quantity': 5, 'unit_price': 45.99},
    {'product_id': 'P002', 'quantity': 2, 'unit_price': 199.99},
    {'product_id': 'P003', 'quantity': 15, 'unit_price': 12.50},
    {'product_id': 'P004', 'quantity': 3, 'unit_price': 89.99},
    {'product_id': 'P005', 'quantity': 8, 'unit_price': 75.00}
]

# Step 1: Calculate revenue for each sale
revenues = [sale['quantity'] * sale['unit_price'] for sale in sales_data]
print(f"All revenues: {revenues}")

# Step 2: Filter for sales over $500
high_value_revenues = [
    sale['quantity'] * sale['unit_price'] 
    for sale in sales_data 
    if sale['quantity'] * sale['unit_price'] > 500
]
print(f"High-value revenues: {high_value_revenues}")

# Step 3: Calculate 15% commission on high-value sales
commissions = [
    sale['quantity'] * sale['unit_price'] * 0.15 
    for sale in sales_data 
    if sale['quantity'] * sale['unit_price'] > 500
]
print(f"Commissions: {commissions}")

# Step 4: Complete pipeline with formatting
# Combine product ID with formatted commission
commission_report = [
    f"{sale['product_id']}: ${sale['quantity'] * sale['unit_price'] * 0.15:,.2f}"
    for sale in sales_data
    if sale['quantity'] * sale['unit_price'] > 500
]

print("\nCOMMISSION REPORT - Sales Over $500")
print("=" * 50)
for entry in commission_report:
    print(entry)

# Alternative: Create detailed report dictionaries
detailed_report = [
    {
        'product_id': sale['product_id'],
        'revenue': sale['quantity'] * sale['unit_price'],
        'commission': sale['quantity'] * sale['unit_price'] * 0.15
    }
    for sale in sales_data
    if sale['quantity'] * sale['unit_price'] > 500
]

print("\nDETAILED COMMISSION BREAKDOWN")
print("=" * 50)
for item in detailed_report:
    print(f"Product: {item['product_id']}")
    print(f"  Revenue: ${item['revenue']:,.2f}")
    print(f"  Commission: ${item['commission']:,.2f}")
```

**Key Learning:** Notice how we can build progressively complex comprehensions. The early examples calculate once per comprehension. The later examples combine filtering and transformation in one pass. The detailed report shows you can create dictionaries in a comprehension, not just simple values. This pattern—start simple, add complexity incrementally—is how you build real data pipelines.

### Exercise 2: Customer Segmentation and Targeting
**Problem:** You have a customer database. Create multiple targeted lists: 1) VIP customers (spent >$10k AND member), 2) At-risk customers (members who haven't purchased in 90+ days), 3) Upsell targets (spent $2k-$10k, not members), and 4) Email list with personalized greetings.

**Solution Approach:**
```python
from datetime import datetime, timedelta

# Sample customer database
customers = [
    {'id': 'C001', 'name': 'Acme Corp', 'total_spent': 15000, 'is_member': True, 
     'last_purchase': datetime.now() - timedelta(days=15)},
    {'id': 'C002', 'name': 'TechStart', 'total_spent': 5000, 'is_member': False,
     'last_purchase': datetime.now() - timedelta(days=45)},
    {'id': 'C003', 'name': 'Global Industries', 'total_spent': 75000, 'is_member': True,
     'last_purchase': datetime.now() - timedelta(days=120)},
    {'id': 'C004', 'name': 'Small Biz LLC', 'total_spent': 1200, 'is_member': True,
     'last_purchase': datetime.now() - timedelta(days=30)},
    {'id': 'C005', 'name': 'Enterprise Systems', 'total_spent': 50000, 'is_member': True,
     'last_purchase': datetime.now() - timedelta(days=10)},
    {'id': 'C006', 'name': 'Startup Innovations', 'total_spent': 8000, 'is_member': False,
     'last_purchase': datetime.now() - timedelta(days=60)},
    {'id': 'C007', 'name': 'Mid-Market Inc', 'total_spent': 3500, 'is_member': True,
     'last_purchase': datetime.now() - timedelta(days=95)}
]

current_date = datetime.now()

# Segment 1: VIP customers (spent >$10k AND member)
vip_customers = [
    customer['name'] 
    for customer in customers 
    if customer['total_spent'] > 10000 and customer['is_member']
]

print("VIP CUSTOMERS")
print("=" * 50)
for name in vip_customers:
    print(f"  • {name}")

# Segment 2: At-risk customers (members inactive 90+ days)
at_risk_customers = [
    {
        'name': customer['name'],
        'days_inactive': (current_date - customer['last_purchase']).days,
        'total_spent': customer['total_spent']
    }
    for customer in customers
    if customer['is_member'] and (current_date - customer['last_purchase']).days >= 90
]

print("\nAT-RISK CUSTOMERS (90+ Days Inactive)")
print("=" * 50)
for customer in at_risk_customers:
    print(f"  • {customer['name']}: {customer['days_inactive']} days "
          f"(Lifetime value: ${customer['total_spent']:,})")

# Segment 3: Upsell targets (spent $2k-$10k, not members)
upsell_targets = [
    {
        'name': customer['name'],
        'spent': customer['total_spent'],
        'potential': customer['total_spent'] * 0.20  # Estimate 20% increase if member
    }
    for customer in customers
    if 2000 <= customer['total_spent'] <= 10000 and not customer['is_member']
]

print("\nUPSELL TARGETS (Non-Members, $2K-$10K Spent)")
print("=" * 50)
for target in upsell_targets:
    print(f"  • {target['name']}: ${target['spent']:,} spent, "
          f"${target['potential']:,.0f} potential uplift")

# Segment 4: Personalized email greetings
email_greetings = [
    f"Dear {customer['name']},\n"
    f"Thank you for being a valued {'Premium Member' if customer['is_member'] else 'customer'}. "
    f"Your total purchases of ${customer['total_spent']:,} make a real difference!\n"
    for customer in customers
]

print("\nPERSONALIZED EMAIL GREETINGS (Sample)")
print("=" * 50)
print(email_greetings[0])  # Show first greeting as example

# Advanced: Multi-criteria scoring
customer_scores = [
    {
        'name': customer['name'],
        'score': (
            (customer['total_spent'] / 1000) +  # 1 point per $1k spent
            (20 if customer['is_member'] else 0) +  # 20 point bonus for members
            (10 if (current_date - customer['last_purchase']).days < 30 else 0)  # Recent purchase bonus
        )
    }
    for customer in customers
]

# Sort by score and show top performers
top_customers = sorted(customer_scores, key=lambda x: x['score'], reverse=True)[:3]

print("\nTOP CUSTOMER ENGAGEMENT SCORES")
print("=" * 50)
for rank, customer in enumerate(top_customers, 1):
    print(f"{rank}. {customer['name']}: {customer['score']:.1f} points")
```

**Key Learning:** Real business applications require multiple views of the same data. List comprehensions excel at this—create different filtered and transformed views efficiently. Notice how we can include complex calculations in the expression part (the days_inactive calculation) and how we build dictionaries with multiple fields for rich output. The scoring system shows you can combine multiple factors in a comprehension, making it perfect for business rules engines.

### Exercise 3: Financial Data Cleaning and Analysis
**Problem:** Import messy transaction data (some negative values for refunds, some missing data, inconsistent formatting). Clean it using comprehensions: remove invalid entries, normalize formats, categorize transactions, and generate summary statistics by category.

**Solution Approach:**
```python
# Raw, messy transaction data (simulating real-world data quality issues)
raw_transactions = [
    {'date': '2024-01-15', 'amount': 1250.50, 'category': 'sales', 'status': 'completed'},
    {'date': '2024-01-16', 'amount': -75.00, 'category': 'sales', 'status': 'refund'},
    {'date': '2024-01-16', 'amount': None, 'category': 'sales', 'status': 'pending'},
    {'date': '2024-01-17', 'amount': 3200.00, 'category': 'Sales', 'status': 'completed'},  # Inconsistent case
    {'date': '2024-01-17', 'amount': 450.75, 'category': 'consulting', 'status': 'completed'},
    {'date': '2024-01-18', 'amount': -120.00, 'category': 'consulting', 'status': 'refund'},
    {'date': '2024-01-18', 'amount': 0, 'category': 'marketing', 'status': 'error'},  # Invalid
    {'date': '2024-01-19', 'amount': 5500.00, 'category': 'SALES', 'status': 'completed'},
    {'date': '2024-01-19', 'amount': 890.25, 'category': 'consulting', 'status': 'completed'},
    {'date': '2024-01-20', 'amount': 2100.00, 'category': 'sales', 'status': 'completed'}
]

# Step 1: Clean data - remove invalid entries (None amounts, zero amounts, error status)
valid_transactions = [
    txn for txn in raw_transactions
    if txn['amount'] is not None 
    and txn['amount'] != 0 
    and txn['status'] != 'error'
]

print(f"Data Cleaning: {len(raw_transactions)} raw → {len(valid_transactions)} valid transactions")

# Step 2: Normalize category names (lowercase)
normalized_transactions = [
    {
        'date': txn['date'],
        'amount': txn['amount'],
        'category': txn['category'].lower(),
        'status': txn['status']
    }
    for txn in valid_transactions
]

# Step 3: Separate into positive and negative (refunds)
revenue_transactions = [
    txn for txn in normalized_transactions 
    if txn['amount'] > 0
]

refund_transactions = [
    {**txn, 'amount': abs(txn['amount'])}  # Convert to positive for reporting
    for txn in normalized_transactions 
    if txn['amount'] < 0
]

print(f"\nTransaction Types:")
print(f"  Revenue: {len(revenue_transactions)}")
print(f"  Refunds: {len(refund_transactions)}")

# Step 4: Calculate totals by category (revenue only)
categories = set(txn['category'] for txn in revenue_transactions)

category_totals = [
    {
        'category': category,
        'total_revenue': sum(
            txn['amount'] for txn in revenue_transactions 
            if txn['category'] == category
        ),
        'transaction_count': len([
            txn for txn in revenue_transactions 
            if txn['category'] == category
        ]),
        'average_transaction': sum(
            txn['amount'] for txn in revenue_transactions 
            if txn['category'] == category
        ) / len([
            txn for txn in revenue_transactions 
            if txn['category'] == category
        ])
    }
    for category in categories
]

# Sort by revenue
category_totals = sorted(category_totals, key=lambda x: x['total_revenue'], reverse=True)

print("\nREVENUE BY CATEGORY")
print("=" * 70)
for cat in category_totals:
    print(f"{cat['category'].title()}: "
          f"${cat['total_revenue']:,.2f} "
          f"({cat['transaction_count']} transactions, "
          f"${cat['average_transaction']:,.2f} avg)")

# Step 5: Create alert list for high-value refunds (over $100)
high_value_refunds = [
    f"⚠️ {txn['category'].title()} refund: ${txn['amount']:,.2f} on {txn['date']}"
    for txn in refund_transactions
    if txn['amount'] > 100
]

if high_value_refunds:
    print("\nHIGH-VALUE REFUND ALERTS")
    print("=" * 70)
    for alert in high_value_refunds:
        print(alert)

# Step 6: Generate executive summary
total_revenue = sum(txn['amount'] for txn in revenue_transactions)
total_refunds = sum(txn['amount'] for txn in refund_transactions)
net_revenue = total_revenue - total_refunds

summary_metrics = {
    'total_revenue': total_revenue,
    'total_refunds': total_refunds,
    'net_revenue': net_revenue,
    'refund_rate': (total_refunds / total_revenue * 100) if total_revenue > 0 else 0,
    'average_transaction': total_revenue / len(revenue_transactions) if revenue_transactions else 0
}

print("\nEXECUTIVE SUMMARY")
print("=" * 70)
print(f"Gross Revenue: ${summary_metrics['total_revenue']:,.2f}")
print(f"Refunds: ${summary_metrics['total_refunds']:,.2f} "
      f"({summary_metrics['refund_rate']:.1f}% refund rate)")
print(f"Net Revenue: ${summary_metrics['net_revenue']:,.2f}")
print(f"Average Transaction: ${summary_metrics['average_transaction']:,.2f}")

# Step 7: Generate CSV-ready output (list of formatted strings)
csv_lines = [
    f"{txn['date']},{txn['category']},{txn['amount']:.2f},{txn['status']}"
    for txn in normalized_transactions
]

print(f"\nCSV Export: {len(csv_lines)} lines generated")
print("Sample:", csv_lines[0])
```

**Key Learning:** This exercise demonstrates the power of chaining multiple comprehensions for data pipeline work—exactly what analysts do daily. Each step transforms data: filtering, normalizing, categorizing, aggregating. Notice how we use comprehensions for different purposes: filtering (`[txn for txn if condition]`), transforming (`[{**txn, 'new_field': value}]`), aggregating (with `sum()` and comprehensions), and formatting (creating strings). In production, you'd use Pandas for this scale, but understanding these comprehension patterns makes you proficient with Pandas' similar operations.

## ✅ Mastery Check

1. **Basic Understanding:** Explain the difference between these two pieces of code:
   ```python
   result1 = [x * 2 for x in range(10)]
   result2 = (x * 2 for x in range(10))
   ```

2. **Intermediate Application:** Write a list comprehension that takes a list of prices and returns a new list with: prices under $50 discounted by 10%, prices $50-$100 unchanged, and prices over $100 with $10 flat discount.

3. **Business Problem:** You have a list of employee dictionaries with 'name', 'department', and 'salary'. Write comprehensions to: a) Extract names of employees in 'Engineering' making over $100k, b) Create a dictionary mapping department names to their total salary costs.

4. **Performance Understanding:** When processing 10 million records, what's the difference in memory usage between `[item * 2 for item in huge_list]` and `(item * 2 for item in huge_list)`? When would you use each?

5. **Advanced Architecture:** You need to process transaction data: filter for valid records, normalize formats, calculate derived fields, and group by category—but the data is 50GB and doesn't fit in memory. How would you modify your comprehension-based approach for this scale? Consider generators, chunking, or distributed computing frameworks.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 11 – Day 11: Functions - Creating Reusable Business Tools](../Day_11_Functions/README.md) • **Next:** [Day 13 – Day 13: Higher-Order Functions & Lambda](../Day_13_Higher_Order_Functions/README.md)

_You are on lesson 12 of 108._

<!-- LESSON_FOOTER_END -->
