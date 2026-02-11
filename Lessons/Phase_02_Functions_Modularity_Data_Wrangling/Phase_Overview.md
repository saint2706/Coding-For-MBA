---
phase: 2
title: "Functions, Modularity & Data Wrangling"
days: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
totalDuration: 610
difficulty: "intermediate"
---

# 🚀 Phase 2: Functions, Modularity & Data Wrangling

> *"Write code that's modular, maintainable, and ready for real data."*

---

## Phase Summary

You've leveled up from Python fundamentals to professional-grade programming. This phase taught you to organize code, handle errors gracefully, and process data at scale.

### What You've Accomplished

**Days 13-15: Advanced Function Patterns**
Higher-order functions, closures, and functional programming with `map`, `filter`, `reduce`. Module organization and package structure. Robust exception handling that keeps programs running under adverse conditions.

**Days 16-17: Data I/O & Pattern Matching**
File handling for CSV, JSON, and text files. Regular expressions for validating, extracting, and transforming text data—essential skills for data cleaning.

**Days 18-19: Object-Oriented Programming**
Classes, encapsulation, and inheritance. Date/time handling for business applications—scheduling, aging, time zones.

**Days 20-21: Environment Management**
pip for package management, virtual environments for project isolation. The foundation for reproducible, shareable projects.

**Days 22-24: Data Science Foundation**
NumPy for fast numerical computing. Pandas for data wrangling, analysis, and transformation. GroupBy, merges, pivots—the tools that turn raw data into insights.

### Skills Unlocked

| Skill                      | Tools                             |
| -------------------------- | --------------------------------- |
| **Functional Programming** | map, filter, reduce, lambda       |
| **Code Organization**      | Modules, packages, **init**.py    |
| **Error Handling**         | try/except, custom exceptions     |
| **Data I/O**               | csv, json, pathlib                |
| **Pattern Matching**       | re (regular expressions)          |
| **OOP**                    | Classes, inheritance, properties  |
| **Package Management**     | pip, venv, requirements.txt       |
| **Numerical Computing**    | NumPy arrays, broadcasting        |
| **Data Analysis**          | Pandas DataFrames, groupby, merge |

---

## The Expert's Toolkit

### Documentation

- [NumPy Documentation](https://numpy.org/doc/)
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [Python re Module](https://docs.python.org/3/library/re.html)

### Cheat Sheets

- [Pandas Cheat Sheet](https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf)
- [NumPy Cheat Sheet](https://www.datacamp.com/cheat-sheet/numpy-cheat-sheet-data-analysis-in-python)
- [Regex Cheat Sheet](https://www.rexegg.com/regex-quickstart.html)

### Practice Platforms

- [Kaggle Learn](https://www.kaggle.com/learn) — Free data science courses
- [DataCamp](https://www.datacamp.com/) — Interactive tutorials
- [LeetCode Database](https://leetcode.com/problemset/database/) — SQL practice

---

## Phase Milestone Exam

### Question 1: Data Pipeline

**Combines**: File Handling, Regex, Pandas, Exception Handling

Build a data pipeline that:

1. Reads multiple CSV files from a directory
2. Validates email format using regex
3. Cleans and standardizes names
4. Merges into a single DataFrame
5. Handles missing files gracefully

```python
from pathlib import Path
import pandas as pd
import re

def process_data_files(directory):
    """Process all CSV files in directory."""
    pass  # Your implementation
```

<details>
<summary>💡 Hints</summary>

- Use `Path.glob("*.csv")` to find files
- Wrap file reads in try/except
- Use regex for email validation
- Concatenate DataFrames with `pd.concat()`

</details>

---

### Question 2: Sales Analytics Class

**Combines**: OOP, Pandas, DateTime, GroupBy

Create a `SalesAnalyzer` class that:

1. Loads sales data from CSV
2. Calculates YoY growth
3. Identifies top N products by revenue
4. Generates summary statistics by time period

```python
class SalesAnalyzer:
    def __init__(self, data_path):
        pass
    
    def yoy_growth(self, column):
        pass
    
    def top_products(self, n=10):
        pass
    
    def summary_by_period(self, period="M"):
        pass
```

<details>
<summary>💡 Hints</summary>

- Parse dates on load with `parse_dates`
- Use `resample()` for time-based grouping
- Calculate growth: (current - previous) / previous * 100

</details>

---

### Question 3: Log Analyzer

**Combines**: Regex, File Handling, Higher-Order Functions

Parse log files to extract:

1. Timestamps and log levels
2. Error messages and stack traces
3. Aggregate errors by type
4. Find time patterns (errors per hour)

Log format: `[2024-01-15 14:30:45] ERROR: Database connection failed`

```python
def analyze_logs(log_path):
    """Return structured analysis of log file."""
    pass
```

<details>
<summary>💡 Hints</summary>

- Regex pattern: `r"\[(.+?)\] (\w+): (.+)"`
- Use `collections.Counter` for aggregation
- Parse time with `datetime.strptime()`

</details>

---

### Question 4: Virtual Environment Automation

**Combines**: Modules, File Handling, Exception Handling

Create a project scaffolding tool that:

1. Creates project directory structure
2. Initializes virtual environment
3. Creates requirements.txt template
4. Generates README with project info

```python
def create_project(name, packages=None):
    """
    Create a new Python project with structure:
    project_name/
    ├── src/
    ├── tests/
    ├── requirements.txt
    ├── README.md
    └── .gitignore
    """
    pass
```

<details>
<summary>💡 Hints</summary>

- Use `pathlib.Path.mkdir(parents=True)`
- Use `subprocess.run()` for venv creation
- Write templates with `Path.write_text()`

</details>

---

## Completion Checklist

Before moving to Phase 3, ensure you can:

- [ ] Write and use higher-order functions
- [ ] Create and import custom modules
- [ ] Handle exceptions without program crashes
- [ ] Read/write CSV, JSON, and text files
- [ ] Use regex for text validation and extraction
- [ ] Design classes with proper encapsulation
- [ ] Work with dates and time zones
- [ ] Manage packages with pip and venv
- [ ] Perform vectorized operations with NumPy
- [ ] Analyze data with Pandas groupby and merge

---

**Congratulations on completing Phase 2!** 🎉

You now have the tools to build real-world data applications. In **Phase 3**, you'll apply these skills to web development and data visualization.
