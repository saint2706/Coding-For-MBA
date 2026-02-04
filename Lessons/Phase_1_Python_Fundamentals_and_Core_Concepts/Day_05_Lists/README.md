# Day 5: Lists

## 🌉 The "Never-Coded" Bridge

Imagine you're tracking monthly sales for your startup. In a spreadsheet, you'd create a row with 12 cells: January through December. But what if you want to calculate the average, find the best month, or sort by performance? You'd need to know exactly which cells contain your data, and formulas become brittle when rows get inserted or deleted.

A list in Python is like a smart, flexible column that knows its own contents. `monthly_sales = [45000, 52000, 48000, ...]` stores all your data in one named container. You can instantly calculate `sum(monthly_sales)`, find `max(monthly_sales)`, or `sort()` without worrying about cell references breaking. More powerfully, lists are dynamic—add a new month with `.append(56000)`, and every formula automatically includes it.

Lists are the foundation of data analysis. Every dataset—customer records, stock prices, survey responses—is fundamentally a collection of items. Mastering lists means you can process thousands of data points with the same code that handles ten. You're learning to think in collections, not individual values, which is how scalable systems work.

## 🔬 The Technical Deep Dive

Lists in Python are ordered, mutable sequences that can contain items of any type (including other lists). Created with square brackets, they support dynamic resizing and heterogeneous elements:

```python
sales = [100, 200, 150]  # Homogeneous (all integers)
mixed = [100, "Product", True, 19.99]  # Heterogeneous
nested = [[1, 2], [3, 4]]  # Lists containing lists
```

**Indexing and slicing** work like strings (zero-based, negative indices from end):
```python
products = ["Laptop", "Mouse", "Keyboard", "Monitor"]
first = products[0]  # "Laptop"
last = products[-1]  # "Monitor"
middle = products[1:3]  # ["Mouse", "Keyboard"] (end exclusive)
```

**Mutability** means lists can be modified in place:
```python
prices = [10, 20, 30]
prices[1] = 25  # Modify element: [10, 25, 30]
prices.append(40)  # Add element: [10, 25, 30, 40]
```

**Common list methods:**
- `.append(item)`: Add item to end (O(1) amortized)
- `.insert(index, item)`: Insert at specific position (O(n))
- `.remove(item)`: Remove first occurrence (O(n))
- `.pop(index)`: Remove and return item at index (O(n) for non-last, O(1) for last)
- `.sort()`: Sort in place (O(n log n))
- `.reverse()`: Reverse in place (O(n))
- `.extend(iterable)`: Add all items from another list (O(k) where k is items added)

**Built-in functions** for aggregation:
```python
numbers = [10, 20, 30, 40]
total = sum(numbers)  # 100
average = sum(numbers) / len(numbers)  # 25.0
minimum = min(numbers)  # 10
maximum = max(numbers)  # 40
count = len(numbers)  # 4
```

**List copying** has subtle behavior:
```python
original = [1, 2, 3]
shallow_copy = original  # Both names reference same list
shallow_copy[0] = 99  # original is now [99, 2, 3]!

proper_copy = original.copy()  # or original[:]
proper_copy[0] = 1  # original unaffected
```

Understanding references vs. copies prevents bugs where modifying one variable unexpectedly changes another.

**List membership** uses `in` operator:
```python
customers = ["Alice", "Bob", "Carol"]
is_customer = "Bob" in customers  # True (O(n) operation)
```

## 🏗️ Senior-Level Insights

Lists in CPython are implemented as dynamic arrays (not linked lists), providing O(1) indexed access but O(n) insertion/deletion at arbitrary positions. Understanding this affects performance-critical decisions. Repeatedly inserting at the start of a list causes O(n²) behavior—each insert shifts all subsequent elements. For queue behavior (FIFO), use `collections.deque` with O(1) append/pop from both ends.

Memory allocation uses over-allocation to avoid reallocating on every append. When a list's capacity is exceeded, CPython allocates a larger array (typically ~12.5% more) and copies elements. This amortization makes `.append()` O(1) on average, but individual operations can be O(n) during reallocation. For known-size lists, pre-allocating `[None] * size` and assigning elements avoids reallocation overhead.

In production systems processing millions of records, lists can exhaust memory. A list of 1 million 64-bit integers consumes ~8MB for data plus pointer overhead (~8MB additional for object references in CPython). For numeric operations at scale, NumPy arrays are contiguous, type-homogeneous, and consume 50-90% less memory with vectorized operations that outperform loops by orders of magnitude.

Mutability creates aliasing bugs in complex systems. Passing lists to functions can lead to unexpected modifications:
```python
def add_tax(prices):
    for i in range(len(prices)):
        prices[i] *= 1.1  # Modifies original!
    return prices
```

Defensive programming copies inputs or uses immutable tuples for data that shouldn't change. Type hints help document intent: `def process(items: List[int]) -> List[int]:` signals a new list is returned.

Choosing the right data structure matters architecturally. Lists excel at indexed access and iteration. For membership testing (`if item in collection`), sets provide O(1) lookups vs. O(n) for lists. For key-value mappings, dictionaries (hashmaps) offer O(1) access. Performance-conscious architects profile access patterns before choosing structures—premature optimization wastes time, but ignoring algorithmic complexity creates unfixable bottlenecks.

## 💻 Hands-on Lab

### Exercise 1: Sales Analysis Dashboard

**Problem:** Analyze quarterly sales data to generate executive summary statistics.

**Solution Approach:**
1. Store sales data in a list
2. Use built-in functions for statistical analysis
3. Format results for business presentation

```python
# Quarterly sales data (in thousands)
q1_sales = [45, 52, 48, 51, 55, 49, 53, 58, 50, 54, 56, 60]  # Monthly sales
q2_sales = [62, 58, 65, 61, 67, 63, 68, 70, 64, 69, 71, 66]
q3_sales = [72, 68, 70, 74, 69, 73, 75, 71, 76, 78, 72, 77]
q4_sales = [80, 75, 82, 79, 85, 81, 84, 88, 83, 86, 89, 87]

# Combine all quarters
annual_sales = q1_sales + q2_sales + q3_sales + q4_sales

# Calculate key metrics
total_revenue = sum(annual_sales)
average_monthly = sum(annual_sales) / len(annual_sales)
best_month_sales = max(annual_sales)
worst_month_sales = min(annual_sales)
best_month_index = annual_sales.index(best_month_sales) + 1  # +1 for human-readable
worst_month_index = annual_sales.index(worst_month_sales) + 1

# Calculate quarter totals
q1_total = sum(q1_sales)
q2_total = sum(q2_sales)
q3_total = sum(q3_sales)
q4_total = sum(q4_sales)

# Display executive summary
print("ANNUAL SALES EXECUTIVE SUMMARY")
print("=" * 60)
print(f"\nAnnual Performance:")
print(f"  Total Revenue: ${total_revenue:,}K")
print(f"  Average Monthly: ${average_monthly:,.2f}K")
print(f"  Best Month: Month {best_month_index} (${best_month_sales}K)")
print(f"  Worst Month: Month {worst_month_index} (${worst_month_sales}K)")
print(f"  Range: ${best_month_sales - worst_month_sales}K")

print(f"\nQuarterly Breakdown:")
quarters = [
    ("Q1", q1_total, q1_sales),
    ("Q2", q2_total, q2_sales),
    ("Q3", q3_total, q3_sales),
    ("Q4", q4_total, q4_sales)
]

for quarter_name, total, sales in quarters:
    avg = total / len(sales)
    growth = ((sales[-1] - sales[0]) / sales[0]) * 100
    print(f"  {quarter_name}: ${total:,}K total, ${avg:.2f}K avg, {growth:+.1f}% growth")

# Year-over-year projection
yoy_growth = ((q4_total - q1_total) / q1_total) * 100
projected_next_year = total_revenue * (1 + yoy_growth / 100)
print(f"\nProjections:")
print(f"  YoY Growth Rate: {yoy_growth:.1f}%")
print(f"  Projected Next Year: ${projected_next_year:,.0f}K")
```

This demonstrates practical list operations, aggregation functions, and business analytics.

### Exercise 2: Dynamic Inventory Management

**Problem:** Build an inventory system that tracks products, handles stock updates, and identifies low-stock items.

**Solution Approach:**
1. Use lists to store inventory data
2. Implement add, remove, and update operations
3. Generate alerts based on business rules

```python
# Initial inventory (product names)
products = ["Laptop", "Mouse", "Keyboard", "Monitor", "Webcam"]
stock_levels = [25, 150, 75, 30, 45]
reorder_thresholds = [20, 100, 50, 25, 30]
unit_prices = [999.99, 24.99, 79.99, 299.99, 89.99]

print("INVENTORY MANAGEMENT SYSTEM")
print("=" * 70)

# Display current inventory
print("\nCurrent Inventory:")
for i in range(len(products)):
    total_value = stock_levels[i] * unit_prices[i]
    print(f"  {products[i]:15} - Stock: {stock_levels[i]:4} units, "
          f"Value: ${total_value:,.2f}")

# Calculate total inventory value
total_value = sum(stock_levels[i] * unit_prices[i] for i in range(len(products)))
print(f"\nTotal Inventory Value: ${total_value:,.2f}")

# Identify low-stock items
low_stock_items = []
for i in range(len(products)):
    if stock_levels[i] < reorder_thresholds[i]:
        low_stock_items.append(products[i])

print(f"\nLow Stock Alerts ({len(low_stock_items)} items):")
if low_stock_items:
    for product in low_stock_items:
        idx = products.index(product)
        shortage = reorder_thresholds[idx] - stock_levels[idx]
        print(f"  ⚠️  {product}: {stock_levels[idx]} units "
              f"(need {shortage} more to reach threshold)")
else:
    print("  ✅ All items adequately stocked")

# Simulate sales transaction
print("\n" + "-" * 70)
print("Simulating Sales Transaction...")
sales = [("Laptop", 3), ("Mouse", 25), ("Webcam", 10)]

for product, quantity in sales:
    if product in products:
        idx = products.index(product)
        if stock_levels[idx] >= quantity:
            stock_levels[idx] -= quantity
            print(f"  ✅ Sold {quantity} {product}(s) - Remaining: {stock_levels[idx]}")
        else:
            print(f"  ❌ Insufficient stock for {product} (need {quantity}, have {stock_levels[idx]})")

# Add new product
print("\n" + "-" * 70)
print("Adding New Product...")
new_product = "USB Hub"
new_stock = 60
new_threshold = 40
new_price = 34.99

products.append(new_product)
stock_levels.append(new_stock)
reorder_thresholds.append(new_threshold)
unit_prices.append(new_price)

print(f"  ✅ Added {new_product}: {new_stock} units at ${new_price}")

# Sort products by value (highest first)
print("\n" + "-" * 70)
print("Top 3 Products by Inventory Value:")

# Create list of (product, value) tuples
product_values = []
for i in range(len(products)):
    value = stock_levels[i] * unit_prices[i]
    product_values.append((products[i], value))

# Sort by value (descending)
product_values.sort(key=lambda x: x[1], reverse=True)

for i in range(min(3, len(product_values))):
    product, value = product_values[i]
    print(f"  {i+1}. {product}: ${value:,.2f}")
```

This exercise demonstrates parallel lists (related data across multiple lists), list manipulation operations, and complex business logic.

### Exercise 3: Customer Segmentation Analysis

**Problem:** Segment customers based on purchase behavior and generate targeted marketing lists.

**Solution Approach:**
1. Store customer purchase data in lists
2. Apply business rules to categorize customers
3. Generate segmented lists for marketing campaigns

```python
# Customer purchase data
customer_names = ["Alice", "Bob", "Carol", "David", "Eve", "Frank", "Grace", "Henry"]
purchase_counts = [25, 3, 45, 12, 2, 38, 7, 51]
total_spent = [5500, 450, 12000, 2400, 180, 8900, 890, 15000]  # in dollars
days_since_purchase = [5, 45, 3, 20, 90, 8, 60, 2]

print("CUSTOMER SEGMENTATION ANALYSIS")
print("=" * 70)

# Calculate average order value
average_order_values = []
for i in range(len(customer_names)):
    aov = total_spent[i] / purchase_counts[i]
    average_order_values.append(aov)

# Define segmentation criteria
VIP_MIN_PURCHASES = 20
VIP_MIN_SPENT = 5000
ACTIVE_MAX_DAYS = 30
RISK_MIN_DAYS = 60

# Segment customers
vip_customers = []
active_customers = []
at_risk_customers = []
churned_customers = []

for i in range(len(customer_names)):
    name = customer_names[i]
    purchases = purchase_counts[i]
    spent = total_spent[i]
    days = days_since_purchase[i]
    aov = average_order_values[i]
    
    # VIP segment
    if purchases >= VIP_MIN_PURCHASES and spent >= VIP_MIN_SPENT:
        vip_customers.append(name)
    
    # Activity-based segmentation
    if days <= ACTIVE_MAX_DAYS:
        active_customers.append(name)
    elif days >= RISK_MIN_DAYS:
        if purchases < 5:
            churned_customers.append(name)
        else:
            at_risk_customers.append(name)

# Display segmentation results
print("\n📊 Customer Segments:")
print(f"\n  💎 VIP Customers ({len(vip_customers)}):")
for name in vip_customers:
    idx = customer_names.index(name)
    print(f"     {name}: {purchase_counts[idx]} purchases, ${total_spent[idx]:,} lifetime value")

print(f"\n  ✅ Active Customers ({len(active_customers)}):")
for name in active_customers:
    idx = customer_names.index(name)
    print(f"     {name}: Last purchase {days_since_purchase[idx]} days ago")

print(f"\n  ⚠️  At-Risk Customers ({len(at_risk_customers)}):")
for name in at_risk_customers:
    idx = customer_names.index(name)
    print(f"     {name}: {days_since_purchase[idx]} days since last purchase")

print(f"\n  ❌ Likely Churned ({len(churned_customers)}):")
for name in churned_customers:
    idx = customer_names.index(name)
    print(f"     {name}: {days_since_purchase[idx]} days inactive, only {purchase_counts[idx]} purchases")

# Generate marketing campaign priorities
print(f"\n{'=' * 70}")
print("📧 Marketing Campaign Recommendations:")
print(f"\n1. VIP Appreciation Campaign:")
print(f"   Target: {', '.join(vip_customers)}")
print(f"   Action: Exclusive offers, early access to new products")

print(f"\n2. Win-Back Campaign:")
print(f"   Target: {', '.join(at_risk_customers + churned_customers)}")
print(f"   Action: 20% discount coupon, 'We miss you' messaging")

# Calculate segment metrics
total_customers = len(customer_names)
vip_revenue = sum(total_spent[customer_names.index(name)] for name in vip_customers)
total_revenue = sum(total_spent)
vip_revenue_percent = (vip_revenue / total_revenue) * 100

print(f"\n{'=' * 70}")
print("💰 Revenue Analysis:")
print(f"  VIP customers represent {len(vip_customers)}/{total_customers} "
      f"({len(vip_customers)/total_customers*100:.1f}%) of customer base")
print(f"  VIP customers generate ${vip_revenue:,} "
      f"({vip_revenue_percent:.1f}%) of total revenue")
print(f"  Classic Pareto Principle validation!")
```

This advanced exercise combines multiple lists, complex segmentation logic, business rule application, and actionable insights generation.

## ✅ Mastery Check

1. **Basic Implementation:** Create a list of five product prices: `[19.99, 45.50, 102.00, 8.99, 67.25]`. Write code to: (a) add a new price of `$34.99`, (b) calculate the total, (c) find the most expensive item, (d) count how many items cost more than $50.

2. **Applied Understanding:** You have a list of monthly revenues: `revenues = [100000, 105000, 98000, 110000]`. Write code to calculate the month-over-month growth rate for each month. Growth rate formula: `(current - previous) / previous * 100`. Store results in a new list called `growth_rates`.

3. **Debugging Challenge:** This code is supposed to find all sales above $1000, but it has a bug:
   ```python
   sales = [800, 1200, 950, 1500, 1100]
   high_sales = []
   for sale in sales:
       if sale > 1000:
           high_sales = sale
   print(high_sales)
   ```
   What's wrong? Fix it so `high_sales` contains all qualifying sales.

4. **Design Scenario:** You're building a priority queue system for customer support tickets. Tickets have IDs, priorities (1-5, where 5 is highest), and creation timestamps. Using lists, design a data structure to store tickets and write pseudo-code for: (a) adding a new ticket, (b) retrieving the highest-priority ticket, (c) removing resolved tickets. Should you use one list or multiple parallel lists? Justify your design choice considering maintainability and performance.

5. **Synthesis Challenge:** Explain why this code behaves unexpectedly:
   ```python
   prices = [10, 20, 30]
   backup = prices
   backup.append(40)
   print(prices)  # Prints [10, 20, 30, 40] - why?
   ```
   Discuss the concept of object references vs. copies in Python. How does this relate to the difference between mutable (lists) and immutable (strings, tuples) types? In a production system where multiple functions modify lists, what defensive programming practices prevent unintended side effects? Provide a specific example where this aliasing bug could cause financial miscalculation.
