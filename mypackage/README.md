# 📦 MyPackage - Business Analytics Python Package

## Overview

**MyPackage** is a custom Python package designed specifically for MBA students learning business
analytics with Python. This package demonstrates how to create reusable business functions that can
be imported and used across multiple projects - a crucial skill for building scalable business
analytics solutions.

## 🎯 Learning Objectives

By studying and using this package, you will learn:

1. **Python Package Structure** - How to organize code into reusable modules
1. **Business Function Design** - Creating functions tailored for business calculations
1. **Code Documentation** - Writing professional docstrings and type hints
1. **Import Systems** - Understanding Python's module and package system
1. **Business Logic Separation** - Keeping calculation logic separate from presentation

## 📁 Package Structure

```text
mypackage/
├── __init__.py          # Package initialization and public interface
├── arithmetics.py       # Mathematical operations for business calculations
└── greet.py            # Business messaging and communication functions
```

## 🛠️ Modules

### 📊 arithmetics.py - Business Mathematical Operations

Contains essential mathematical functions commonly used in business analysis:

- **`add_numbers(*args)`** - Sum multiple values (revenue streams, expenses, etc.)
- **`subtract(a, b)`** - Calculate differences (profit, variance, etc.)
- **`multiply(a, b)`** - Product calculations (total costs, scaling, etc.)
- **`divide(a, b)`** - Division operations (ratios, averages, unit costs)
- **`remainder(a, b)`** - Modulo operations (inventory management, scheduling)
- **`power(base, exponent)`** - Exponential calculations (compound interest, growth)

### 👋 greet.py - Business Communication Functions

Provides functions for business messaging and customer communication:

- **`greet_person(firstname, lastname)`** - Generate professional greetings

## 💼 Business Use Cases

### Financial Analysis

```python
from mypackage import add_numbers, subtract, divide

# Calculate quarterly performance
q1_revenue, q2_revenue, q3_revenue, q4_revenue = 125000, 150000, 175000, 200000
annual_revenue = add_numbers(q1_revenue, q2_revenue, q3_revenue, q4_revenue)

# Calculate profit margin
total_costs = 450000
profit = subtract(annual_revenue, total_costs)
profit_margin = divide(profit, annual_revenue) * 100

print(f"Annual Revenue: ${annual_revenue:,.2f}")
print(f"Net Profit: ${profit:,.2f}")
print(f"Profit Margin: {profit_margin:.2f}%")
```

### Customer Management

```python
from mypackage import greet_person

# Generate personalized customer communications
customers = [("John", "Smith"), ("Sarah", "Johnson"), ("Mike", "Brown")]

for first_name, last_name in customers:
    welcome_message = greet_person(first_name, last_name)
    print(welcome_message)
```

### Inventory Calculations

```python
from mypackage import multiply, remainder

# Calculate total inventory value
units_in_stock = 1250
unit_cost = 45.75
total_inventory_value = multiply(units_in_stock, unit_cost)

# Calculate remaining items after packaging
items_per_package = 12
remaining_items = remainder(units_in_stock, items_per_package)

print(f"Total Inventory Value: ${total_inventory_value:,.2f}")
print(f"Items remaining after packaging: {remaining_items}")
```

## 🚀 Getting Started

### Installation & Import

Since this is a local package in your project, you can import it directly:

```python
# Import the entire package
import mypackage

# Import specific functions
from mypackage import add_numbers, greet_person

# Import all functions from a module
from mypackage.arithmetics import *
```

### Basic Usage

```python
# Import functions you need
from mypackage import add_numbers, subtract, greet_person

# Perform business calculations
monthly_sales = [45000, 52000, 48000, 61000]
total_sales = add_numbers(*monthly_sales)

# Calculate growth
previous_total = 180000
growth = subtract(total_sales, previous_total)

# Generate business communication
ceo_greeting = greet_person("Jane", "Executive")

print(f"Total Monthly Sales: ${total_sales:,.2f}")
print(f"Growth: ${growth:,.2f}")
print(ceo_greeting)
```

## 🔧 Advanced Features

### Type Hints for Business Data

All functions use modern Python type hints to make business calculations more reliable:

```python
def calculate_roi(investment: float, returns: float) -> float:
    """Calculate Return on Investment percentage."""
    return divide(subtract(returns, investment), investment) * 100
```

### Error Handling for Business Logic

Functions include proper error handling for business scenarios:

```python
# Division by zero protection for financial ratios
try:
    debt_to_equity = divide(total_debt, shareholders_equity)
except ZeroDivisionError:
    print("Cannot calculate debt-to-equity: no shareholder equity")
```

## 📚 Integration with Course Materials

This package is designed to work seamlessly with other course materials:

- **Day 11 - Functions**: Learn how these functions are structured
- **Day 14 - Modules**: Understand how to import and use packages
- **Day 22-24 - Pandas**: Use these functions in data analysis workflows
- **Day 35 - Flask**: Import these functions into web applications

## 🎓 Best Practices Demonstrated

1. **Clean Code Structure** - Organized, readable, and maintainable
1. **Comprehensive Documentation** - Every function has detailed docstrings
1. **Type Safety** - Type hints prevent common business calculation errors
1. **Error Handling** - Graceful handling of edge cases
1. **Business Context** - Functions designed with real business scenarios in mind

## 🔄 Extending the Package

As you progress in your Python journey, you can extend this package with additional business
functions:

```python
# Add to arithmetics.py
def calculate_compound_interest(principal: float, rate: float, time: int) -> float:
    """Calculate compound interest for investment analysis."""
    return principal * power(1 + rate, time) - principal

# Add to greet.py
def generate_invoice_message(customer_name: str, amount: float) -> str:
    """Generate professional invoice messages."""
    return f"Dear {customer_name}, your invoice amount is ${amount:.2f}"
```

______________________________________________________________________

*This package represents professional-grade Python development practices applied to business
analytics. Study the code structure, documentation style, and function design to elevate your own
Python business applications!* 🎯
