---
day: 14
title: "Modules & Packages"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "modules-packages"
duration: 45
difficulty: "intermediate"
tags:
  - python
  - modules
  - packages
  - imports
concepts:
  - "importing modules"
  - "creating custom modules"
  - "package structure"
  - "the __name__ variable"
prerequisites: [11]
outcomes:
  - "Import and use standard library modules"
  - "Create your own reusable modules"
  - "Understand Python package structure"
---

# 🎯 Day 14: Modules & Packages

> *"Great code isn't written in one file—it's organized across modules that each do one thing well."*

---

## The "Never-Coded" Bridge

**Think about how a company organizes departments:**

- Finance handles budgets and payments
- HR manages hiring and policies
- Engineering builds products

Each department has specialized knowledge. When Finance needs engineering input, they don't learn engineering—they consult the Engineering department.

**Modules work the same way.** Instead of writing everything from scratch:

- Need math? Import the `math` module
- Need dates? Import the `datetime` module
- Need to read files? Import appropriate modules

```python
import math
print(math.sqrt(16))  # 4.0 - We didn't write this code!
```

Your custom code can be organized into modules too, making it reusable across projects.

---

## The Technical Deep Dive

### Importing Modules

```python
# Import entire module
import math
print(math.pi)       # 3.14159...
print(math.sqrt(16)) # 4.0

# Import specific items
from math import pi, sqrt
print(pi)       # 3.14159...
print(sqrt(16)) # 4.0

# Import with alias
import pandas as pd
import numpy as np

# Import all (avoid in production)
from math import *  # Not recommended
```

### The Standard Library

Python includes powerful built-in modules:

| Module        | Purpose                       |
| ------------- | ----------------------------- |
| `math`        | Mathematical functions        |
| `datetime`    | Date and time handling        |
| `random`      | Random number generation      |
| `os`          | Operating system interactions |
| `json`        | JSON encoding/decoding        |
| `csv`         | CSV file handling             |
| `collections` | Advanced data structures      |
| `itertools`   | Iteration tools               |
| `functools`   | Function tools                |
| `re`          | Regular expressions           |

```python
# Examples
import random
print(random.randint(1, 100))

import datetime
print(datetime.date.today())

import json
data = json.loads('{"name": "Alice"}')
```

### Creating Your Own Module

Any `.py` file is a module:

```python
# utils.py
def calculate_tax(amount, rate=0.08):
    """Calculate tax for an amount."""
    return amount * rate

def format_currency(amount):
    """Format as USD currency."""
    return f"${amount:,.2f}"

TAX_RATE = 0.08
```

```python
# main.py
import utils

tax = utils.calculate_tax(100)
print(utils.format_currency(tax))  # $8.00
print(utils.TAX_RATE)              # 0.08

# Or import specific items
from utils import calculate_tax, format_currency
```

### The `__name__` Variable

```python
# mymodule.py
def main():
    print("Running as main program")

if __name__ == "__main__":
    main()  # Only runs if executed directly
```

- When run directly: `__name__` is `"__main__"`
- When imported: `__name__` is the module name

### Creating Packages

A package is a directory with modules:

```
my_package/
├── __init__.py      # Makes it a package
├── module_a.py
├── module_b.py
└── subpackage/
    ├── __init__.py
    └── module_c.py
```

```python
# Import from package
from my_package import module_a
from my_package.subpackage import module_c
```

### The `__init__.py` File

Controls what's available when importing the package:

```python
# my_package/__init__.py
from .module_a import function_a
from .module_b import function_b

__all__ = ['function_a', 'function_b']
```

```python
# Usage
from my_package import function_a  # Clean import
```

---

## Senior-Level Insights

### Absolute vs Relative Imports

```python
# Absolute imports (recommended)
from my_package.module_a import function

# Relative imports (within package)
from . import module_b          # Same level
from .. import parent_module    # Parent level
from .subpackage import module_c
```

### Circular Imports

```python
# a.py
from b import function_b  # Imports b

# b.py
from a import function_a  # Imports a → CIRCULAR!
```

**Solutions:**

1. Import inside functions (delay import)
2. Restructure to break the cycle
3. Use a third module both can import

### Module Search Path

```python
import sys
print(sys.path)  # List of directories Python searches
```

### Lazy Loading (Python 3.7+)

```python
# Only import when first accessed
def get_heavy_module():
    import heavy_module
    return heavy_module
```

---

## Hands-on Lab

### Exercise 1: Create a Finance Module

```python
# finance.py
"""Financial calculation utilities."""

def calculate_roi(revenue, cost):
    """Calculate Return on Investment."""
    if cost == 0:
        return None
    return ((revenue - cost) / cost) * 100

def calculate_compound_interest(principal, rate, years):
    """Calculate compound interest."""
    return principal * (1 + rate) ** years

def calculate_break_even(fixed_costs, price, variable_cost):
    """Calculate break-even units."""
    margin = price - variable_cost
    if margin <= 0:
        return None
    return fixed_costs / margin

if __name__ == "__main__":
    # Test when run directly
    print(f"ROI: {calculate_roi(150000, 100000):.1f}%")
    print(f"Future value: ${calculate_compound_interest(10000, 0.05, 10):,.2f}")
    print(f"Break-even: {calculate_break_even(50000, 25, 10):.0f} units")
```

---

### Exercise 2: Build a Utils Package

```
utils/
├── __init__.py
├── string_utils.py
└── number_utils.py
```

```python
# utils/string_utils.py
def clean_text(text):
    return text.strip().lower()

def create_slug(text):
    return text.lower().replace(" ", "-")
```

```python
# utils/number_utils.py
def format_currency(amount):
    return f"${amount:,.2f}"

def calculate_percentage(part, whole):
    return (part / whole) * 100 if whole else 0
```

```python
# utils/__init__.py
from .string_utils import clean_text, create_slug
from .number_utils import format_currency, calculate_percentage
```

```python
# main.py
from utils import clean_text, format_currency
print(clean_text("  HELLO WORLD  "))  # "hello world"
print(format_currency(1234.5))         # "$1,234.50"
```

---

### Exercise 3: Working with Standard Library

```python
import math
import random
import datetime
from collections import Counter

# Math operations
print(f"Square root of 144: {math.sqrt(144)}")
print(f"Log base 10 of 1000: {math.log10(1000)}")

# Random operations
numbers = [1, 2, 3, 4, 5]
print(f"Random choice: {random.choice(numbers)}")
random.shuffle(numbers)
print(f"Shuffled: {numbers}")

# Date operations
today = datetime.date.today()
future = today + datetime.timedelta(days=30)
print(f"30 days from now: {future}")

# Counter for frequency analysis
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
freq = Counter(words)
print(f"Word frequency: {freq.most_common()}")
```

---

## Mastery Check

### Question 1: Import Syntax

What's the difference?

```python
import math
from math import sqrt
```

<details>
<summary>Click for Answer</summary>

- `import math` — imports the module, access via `math.sqrt()`
- `from math import sqrt` — imports just `sqrt`, access directly as `sqrt()`

</details>

---

### Question 2: Module Execution

When does this print?

```python
# myfile.py
print("Loading module")

if __name__ == "__main__":
    print("Running directly")
```

<details>
<summary>Click for Answer</summary>

- "Loading module" prints **always** (when loaded)
- "Running directly" prints **only** when run as `python myfile.py`

When imported, only "Loading module" appears.

</details>

---

### Question 3: Package Structure

Given this structure, how do you import `helper`?

```
project/
├── utils/
│   ├── __init__.py
│   └── helper.py
└── main.py
```

<details>
<summary>Click for Answer</summary>

```python
# In main.py
from utils import helper
# or
from utils.helper import specific_function
```

</details>

---

### Question 4: Standard Library

Which module would you use for:

1. Generating random passwords
2. Parsing JSON from an API
3. Finding today's date

<details>
<summary>Click for Answer</summary>

1. `random` (for random.choices with character set)
2. `json` (json.loads for parsing)
3. `datetime` (datetime.date.today())

</details>

---

### Question 5: Design Scenario

**Scenario**: Organize an analytics project with:

- Data loading utilities
- Statistical calculations
- Visualization helpers
- Report generators

Design the package structure.

<details>
<summary>Click for Answer</summary>

```
analytics/
├── __init__.py
├── data/
│   ├── __init__.py
│   ├── loaders.py      # CSV, JSON, database loaders
│   └── cleaners.py     # Data cleaning functions
├── stats/
│   ├── __init__.py
│   ├── descriptive.py  # Mean, median, std
│   └── inferential.py  # Hypothesis tests
├── viz/
│   ├── __init__.py
│   └── charts.py       # Chart generators
└── reports/
    ├── __init__.py
    └── generators.py   # Report creation
```

Usage:

```python
from analytics.data import loaders
from analytics.stats import descriptive
from analytics.viz import charts
```

</details>

---

## Summary

Today you learned:

- ✅ Import modules with `import` and `from`
- ✅ Python's standard library provides powerful tools
- ✅ Any `.py` file can be a module
- ✅ Packages are directories with `__init__.py`
- ✅ `__name__ == "__main__"` for script detection

**Tomorrow**: We'll master **exception handling**—making code robust against errors.
