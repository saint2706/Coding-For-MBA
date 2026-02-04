---
title: "Day 10: Automation (Loops)"
tags:
  - Basics
  - Python
  - Automation
---

# Day 10: Loops (Automation & Repetition)

## 🌉 The "Never-Coded" Bridge

Imagine you're managing accounts receivable for a company with 5,000 customers. Each month, someone needs to review every account, check if payment is overdue, calculate late fees, and flag accounts for collection. Doing this manually—opening each customer file, checking dates, doing math—would take weeks. With loops, this becomes a five-minute automated process: write the logic once, tell the computer "do this for every customer," and walk away while it processes thousands of records with perfect consistency.

This is the fundamental promise of automation: transform repetitive tasks into systematic processes. Your sales team needs to send personalized follow-up emails to 500 leads? A loop personalizes and sends all of them. Your finance team reconciles hundreds of transactions against bank statements? A loop matches them in seconds. Every time you hear "we do this same task for every item in our list," you're hearing a loop waiting to be written. The difference between manual drudgery and scalable automation is often just a few lines of loop code.

The business impact extends beyond time savings. Humans get tired, make mistakes, and work inconsistently—the 500th invoice review gets sloppier than the first. Loops execute with identical precision from the first item to the millionth. They work nights and weekends without complaint. They document exactly what happened to every item. This consistency transforms operational reliability: when you can trust that every record was processed correctly, you make better strategic decisions based on complete, accurate data.

## 🔬 The Technical Deep Dive

Python provides two primary loop constructs: `for` loops for iterating over known collections, and `while` loops for repeating until a condition changes. The `for` loop is your workhorse for processing data collections—lists, dictionaries, database query results, file contents. The syntax is elegantly simple: `for item in collection:` followed by indented code that executes for each item.

```python
# Basic for loop - processing a list of sales figures
daily_sales = [1200, 1500, 980, 2100, 1750]
total_revenue = 0

for sale in daily_sales:
    total_revenue += sale
    print(f"Processed sale: ${sale} | Running total: ${total_revenue}")

print(f"Weekly total: ${total_revenue}")

# Output:
# Processed sale: $1200 | Running total: $1200
# Processed sale: $1500 | Running total: $2700
# Processed sale: $980 | Running total: $3680
# Processed sale: $2100 | Running total: $5780
# Processed sale: $1750 | Running total: $7530
# Weekly total: $7530
```

The accumulator pattern—initializing a variable before the loop, then updating it inside the loop—is fundamental to data processing. You'll use this constantly: summing values, counting matches, building new collections, finding maximums. Python's `for` loop works with any iterable object, not just lists. You can loop over dictionary keys, file lines, database rows, or ranges of numbers using `range()`.

```python
# Looping over different types of collections
customers = {
    "C001": {"name": "Acme Corp", "balance": 50000},
    "C002": {"name": "TechStart", "balance": 12000},
    "C003": {"name": "Global Industries", "balance": 75000}
}

# Loop over dictionary items (key-value pairs)
vip_customers = []
for customer_id, customer_data in customers.items():
    if customer_data["balance"] > 20000:
        vip_customers.append(customer_data["name"])
        print(f"{customer_data['name']} qualifies as VIP")

# Loop with range for indexed access
print("\nCustomer Summary:")
for i in range(1, len(vip_customers) + 1):
    print(f"{i}. {vip_customers[i-1]}")
```

The `while` loop runs as long as a condition remains true, making it perfect for simulations, user input validation, or processes with unknown duration. Classic examples include "keep doubling investment until it reaches $1 million" or "retry API call until it succeeds or max attempts reached." The danger with `while` loops is infinite loops—if the condition never becomes false, your program hangs forever. Always ensure your loop modifies something that eventually makes the condition false.

```python
# While loop for investment simulation
initial_investment = 10000
target = 50000
annual_return = 0.08
years = 0

balance = initial_investment
while balance < target:
    balance *= (1 + annual_return)
    years += 1
    print(f"Year {years}: ${balance:,.2f}")

print(f"Reached ${target:,} in {years} years")
```

## 🏗️ Senior-Level Insights

In production systems, loop performance becomes critical when processing large datasets. A naive loop processing a million records one by one might take minutes; vectorized operations in NumPy or Pandas do the same work in milliseconds. The principle: avoid explicit Python loops for numerical operations whenever possible. Use built-in functions like `sum()`, `max()`, `min()`, or library functions that operate on entire arrays at once. When you must loop, consider generators for memory efficiency—they process items one at a time without loading everything into RAM.

Loop invariants and exit conditions deserve careful thought in production code. A loop invariant is something that remains true before and after each iteration—for example, "total equals the sum of all items processed so far." Thinking in invariants helps you write correct loops and catch subtle bugs. Exit conditions for `while` loops should always be reachable, and you should typically include a maximum iteration count as a safety valve. In financial systems, an infinite loop in a trading algorithm can cost millions while someone frantically kills the process.

The architecture of loop-heavy code benefits from separation of concerns: extract the loop body into a function, making it testable independently. This also enables parallelization—if each loop iteration is independent, you can process batches concurrently using multiprocessing or distributed systems. For ETL pipelines processing millions of records nightly, this architectural choice transforms a six-hour job into a thirty-minute job. Modern Python supports parallel mapping with `concurrent.futures` or `multiprocessing.Pool.map()`, essentially running your loop across multiple CPU cores or even multiple machines.

Error handling within loops requires strategy. If processing 10,000 customer records and one fails, should you abort everything or continue? Production systems typically log errors, collect failures in a separate list for review, and continue processing. This graceful degradation means one corrupted record doesn't stop month-end closing. Use try-except blocks inside loops, maintain counters for successes and failures, and generate detailed error reports that help operations teams resolve issues efficiently.

## 💻 Hands-on Lab

### Exercise 1: Monthly Sales Report Generator
**Problem:** You have daily sales data for a month. Calculate total sales, average daily sales, count of days exceeding target ($5,000), and identify the best sales day.

**Solution Approach:**
```python
def generate_sales_report(daily_sales, target=5000):
    """
    Analyze daily sales data and generate comprehensive report.
    
    Args:
        daily_sales: List of daily sales figures
        target: Daily sales target for performance tracking
        
    Returns:
        dict: Report with key metrics
    """
    # Initialize accumulators
    total = 0
    above_target_count = 0
    max_sale = 0
    max_sale_day = 0
    
    # Process each day
    for day_number, sale in enumerate(daily_sales, start=1):
        total += sale
        
        if sale > target:
            above_target_count += 1
            
        if sale > max_sale:
            max_sale = sale
            max_sale_day = day_number
    
    average = total / len(daily_sales) if daily_sales else 0
    
    return {
        'total_sales': total,
        'average_daily_sales': average,
        'days_above_target': above_target_count,
        'best_day': max_sale_day,
        'best_day_sales': max_sale,
        'total_days': len(daily_sales)
    }

# Test with sample data
march_sales = [4500, 6200, 5800, 4100, 7200, 5500, 6800, 
               4800, 5200, 6500, 7100, 5900, 4700, 6300,
               5400, 6900, 5100, 5600, 6400, 7500, 5300,
               6100, 5700, 6600, 7300, 5000, 6200, 5800, 6000, 6700]

report = generate_sales_report(march_sales, target=6000)

print("MARCH SALES REPORT")
print("=" * 50)
print(f"Total Sales: ${report['total_sales']:,.2f}")
print(f"Average Daily Sales: ${report['average_daily_sales']:,.2f}")
print(f"Days Exceeding Target: {report['days_above_target']} of {report['total_days']}")
print(f"Best Performance: Day {report['best_day']} with ${report['best_day_sales']:,.2f}")
```

**Key Learning:** The accumulator pattern is everywhere in data analysis. We initialize multiple tracking variables (`total`, `above_target_count`, etc.) and update them each iteration. The `enumerate()` function gives us both the item and its position, crucial for tracking which day had the best sales.

### Exercise 2: Customer Account Review System
**Problem:** Process a list of customer accounts. For each account, check if payment is overdue (more than 30 days since last payment) and calculate late fees (1.5% per month overdue). Generate a list of accounts needing collection agency referral (over 90 days).

**Solution Approach:**
```python
from datetime import datetime, timedelta

def process_overdue_accounts(accounts, current_date=None):
    """
    Process accounts receivable and flag issues.
    
    Args:
        accounts: List of account dictionaries
        current_date: Date for calculations (defaults to today)
        
    Returns:
        dict: Processing results and action items
    """
    if current_date is None:
        current_date = datetime.now()
    
    overdue_accounts = []
    collection_referrals = []
    total_late_fees = 0
    
    for account in accounts:
        customer_id = account['customer_id']
        customer_name = account['name']
        balance = account['balance']
        last_payment_date = account['last_payment']
        
        # Calculate days overdue
        days_overdue = (current_date - last_payment_date).days
        
        if days_overdue > 30:
            # Calculate late fee (1.5% per 30-day period)
            months_overdue = days_overdue // 30
            late_fee = balance * 0.015 * months_overdue
            total_late_fees += late_fee
            
            overdue_info = {
                'customer_id': customer_id,
                'name': customer_name,
                'balance': balance,
                'days_overdue': days_overdue,
                'late_fee': late_fee,
                'total_owed': balance + late_fee
            }
            
            overdue_accounts.append(overdue_info)
            
            # Flag for collections if over 90 days
            if days_overdue > 90:
                collection_referrals.append(overdue_info)
                print(f"⚠️  COLLECTION ALERT: {customer_name} - "
                      f"{days_overdue} days overdue, "
                      f"${balance + late_fee:,.2f} total owed")
            else:
                print(f"📧 Send reminder: {customer_name} - "
                      f"{days_overdue} days overdue")
    
    return {
        'overdue_accounts': overdue_accounts,
        'collection_referrals': collection_referrals,
        'total_late_fees': total_late_fees,
        'accounts_processed': len(accounts),
        'overdue_count': len(overdue_accounts),
        'collection_count': len(collection_referrals)
    }

# Sample account data
test_accounts = [
    {
        'customer_id': 'C001',
        'name': 'Acme Corp',
        'balance': 15000,
        'last_payment': datetime.now() - timedelta(days=45)
    },
    {
        'customer_id': 'C002',
        'name': 'TechStart Inc',
        'balance': 8000,
        'last_payment': datetime.now() - timedelta(days=105)
    },
    {
        'customer_id': 'C003',
        'name': 'Global Industries',
        'balance': 22000,
        'last_payment': datetime.now() - timedelta(days=20)
    },
    {
        'customer_id': 'C004',
        'name': 'Small Business LLC',
        'balance': 5500,
        'last_payment': datetime.now() - timedelta(days=67)
    }
]

print("ACCOUNTS RECEIVABLE REVIEW")
print("=" * 70)
result = process_overdue_accounts(test_accounts)
print("\nSUMMARY")
print(f"Total Accounts Processed: {result['accounts_processed']}")
print(f"Overdue Accounts: {result['overdue_count']}")
print(f"Collection Referrals: {result['collection_count']}")
print(f"Total Late Fees: ${result['total_late_fees']:,.2f}")
```

**Key Learning:** Real business logic combines loops with conditionals and calculations. Notice how we build multiple result lists simultaneously—some accounts need reminders, others need collections. The loop processes each account once, but branches to different outcomes based on business rules. This pattern appears everywhere in enterprise software.

### Exercise 3: Investment Portfolio Rebalancing
**Problem:** You have a portfolio of stocks that should maintain target percentages. Write a simulation that rebalances monthly: sell overweight positions, buy underweight positions, track transaction costs (0.1% per trade), and calculate if the strategy beats buy-and-hold over 5 years.

**Solution Approach:**
```python
def simulate_rebalancing_strategy(initial_investment, target_allocations, 
                                  monthly_returns, transaction_cost_pct=0.001):
    """
    Simulate a portfolio rebalancing strategy.
    
    Args:
        initial_investment: Starting portfolio value
        target_allocations: Dict of {stock: target_percentage}
        monthly_returns: List of monthly return dicts for each stock
        transaction_cost_pct: Trading cost as decimal (0.1% = 0.001)
        
    Returns:
        dict: Simulation results with detailed history
    """
    # Initialize portfolio
    portfolio = {}
    for stock, target_pct in target_allocations.items():
        portfolio[stock] = initial_investment * target_pct
    
    total_value = initial_investment
    total_transaction_costs = 0
    rebalancing_history = []
    month = 0
    
    # Simulate each month
    for month_returns in monthly_returns:
        month += 1
        
        # Apply returns to each position
        for stock in portfolio:
            if stock in month_returns:
                portfolio[stock] *= (1 + month_returns[stock])
        
        # Calculate new total and current percentages
        total_value = sum(portfolio.values())
        current_allocations = {
            stock: value / total_value 
            for stock, value in portfolio.items()
        }
        
        # Check if rebalancing needed (any position off by >5%)
        needs_rebalancing = False
        for stock, current_pct in current_allocations.items():
            target_pct = target_allocations[stock]
            if abs(current_pct - target_pct) > 0.05:
                needs_rebalancing = True
                break
        
        # Rebalance if needed
        if needs_rebalancing:
            trades_cost = 0
            for stock, target_pct in target_allocations.items():
                target_value = total_value * target_pct
                current_value = portfolio[stock]
                trade_amount = abs(target_value - current_value)
                trades_cost += trade_amount * transaction_cost_pct
                portfolio[stock] = target_value
            
            total_value -= trades_cost
            total_transaction_costs += trades_cost
            
            # Adjust portfolio for costs
            for stock in portfolio:
                portfolio[stock] *= (total_value / sum(portfolio.values()))
            
            rebalancing_history.append({
                'month': month,
                'portfolio_value': total_value,
                'transaction_costs': trades_cost
            })
    
    return {
        'final_value': total_value,
        'initial_investment': initial_investment,
        'total_return': (total_value - initial_investment) / initial_investment,
        'total_transaction_costs': total_transaction_costs,
        'rebalancing_events': len(rebalancing_history),
        'months_simulated': month,
        'history': rebalancing_history
    }

# Test with 12 months of data
target_allocations = {
    'Stock_A': 0.40,
    'Stock_B': 0.35,
    'Stock_C': 0.25
}

# Simulated monthly returns (in practice, use historical data)
monthly_returns_data = [
    {'Stock_A': 0.02, 'Stock_B': 0.03, 'Stock_C': -0.01},
    {'Stock_A': 0.05, 'Stock_B': -0.02, 'Stock_C': 0.04},
    {'Stock_A': -0.03, 'Stock_B': 0.06, 'Stock_C': 0.02},
    {'Stock_A': 0.04, 'Stock_B': 0.01, 'Stock_C': 0.03},
    {'Stock_A': 0.07, 'Stock_B': -0.01, 'Stock_C': 0.02},
    {'Stock_A': -0.02, 'Stock_B': 0.04, 'Stock_C': 0.05},
    {'Stock_A': 0.03, 'Stock_B': 0.02, 'Stock_C': -0.02},
    {'Stock_A': 0.06, 'Stock_B': 0.03, 'Stock_C': 0.04},
    {'Stock_A': -0.01, 'Stock_B': 0.05, 'Stock_C': 0.01},
    {'Stock_A': 0.04, 'Stock_B': -0.03, 'Stock_C': 0.06},
    {'Stock_A': 0.02, 'Stock_B': 0.04, 'Stock_C': 0.02},
    {'Stock_A': 0.05, 'Stock_B': 0.02, 'Stock_C': 0.03}
]

result = simulate_rebalancing_strategy(100000, target_allocations, monthly_returns_data)

print("PORTFOLIO REBALANCING SIMULATION")
print("=" * 60)
print(f"Initial Investment: ${result['initial_investment']:,.2f}")
print(f"Final Value: ${result['final_value']:,.2f}")
print(f"Total Return: {result['total_return']:.2%}")
print(f"Rebalancing Events: {result['rebalancing_events']}")
print(f"Transaction Costs: ${result['total_transaction_costs']:,.2f}")
print(f"\nNet Gain: ${result['final_value'] - result['initial_investment']:,.2f}")
```

**Key Learning:** This showcases the power of `while` and `for` loops working together. The main loop iterates through time periods (months), while the inner logic uses loops to process each stock position. This nested loop pattern is common in simulations and modeling. Notice how we track multiple metrics simultaneously—portfolio values, transaction costs, rebalancing events—all updated within the loop structure.

## ✅ Mastery Check

1. **Basic Understanding:** What's the difference between a `for` loop and a `while` loop? Give a business scenario where each would be more appropriate.

2. **Intermediate Application:** Write a loop that processes a list of product prices and creates two new lists: one with prices under $50 and another with prices $50 and above. How would you track the count of items in each category?

3. **Business Problem:** You have monthly revenue data for 3 years (36 data points). Write code that calculates the quarter-over-quarter growth rate for each quarter. What loop pattern would you use?

4. **Debugging:** What's wrong with this code, and how would you fix it?
   ```python
   balance = 1000
   target = 5000
   while balance < target:
       print(f"Balance: {balance}")
   ```

5. **Advanced Architecture:** You need to process 10 million customer records nightly, running calculations that take 1 second per record. A sequential loop would take over 115 days. What strategies would you employ to make this viable for a production system with a 4-hour processing window?

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 09 – Conditionals](../Day_09_Conditionals/README.md) • **Next:** [Day 11 – Functions](../Day_11_Functions/README.md)

_You are on lesson 10 of 108._

<!-- LESSON_FOOTER_END -->
