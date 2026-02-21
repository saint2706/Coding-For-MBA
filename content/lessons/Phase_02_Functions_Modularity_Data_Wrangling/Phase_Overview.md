---
phase: 2
title: "Functions, Modularity & Data Wrangling"
days: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, "24B", "24C"]
totalDuration: 730
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

**Days 22-24C: Data Science Foundation + EDA + Cleaning Playbook**
NumPy for fast numerical computing. Pandas for data wrangling, analysis, and transformation. GroupBy, merges, pivots, and business-first exploratory data analysis (EDA)—the workflow that validates assumptions before visualization. Day 24B is the bridge to Phase 3: you learn which patterns are trustworthy enough to visualize and present to decision-makers. Day 24C adds the operational cleaning playbook (profiling, null strategy, deduplication, coercion, and assertions) so your analyses are reproducible under real data quality constraints.

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

## The Business Value Proposition

### ROI by Technique

| Technique                  | Industry Example                         | Impact                                           |
| -------------------------- | ---------------------------------------- | ------------------------------------------------ |
| **Pandas GroupBy + Merge** | Customer segmentation at a fintech       | 3-day manual Excel process → 2-minute script     |
| **Regex + Validation**     | CRM data cleaning at a SaaS company      | 35% reduction in duplicate records               |
| **Exception Handling**     | Production ETL pipeline at e-commerce    | 99.8% uptime vs 72% before hardening             |
| **OOP + Classes**          | Reusable report generator at consultancy | 8 one-off scripts → 1 parametric class           |
| **NumPy Broadcasting**     | Pricing model at insurance company       | 40-minute pricing run → 12-second vectorized run |
| **Virtual Environments**   | Team of 5 data scientists                | Zero "it doesn't work on my machine" issues      |
| **Higher-Order Functions** | Pipeline transformation layer            | Code reduced 60%, readability doubled            |
| **DateTime Handling**      | SLA breach detection at SaaS             | Automated detection capturing 100% of breaches   |

---

## Skills Matrix

### Foundational Skills (All students)

- ✅ Write pure functions with clear inputs and outputs
- ✅ Use `map`, `filter`, and `reduce` for data transformations
- ✅ Organize code into reusable modules with proper imports
- ✅ Handle exceptions at the right level (caller vs callee)
- ✅ Read and write CSV, JSON, and text files with `pathlib`
- ✅ Validate and extract data with regular expressions
- ✅ Design classes with `__init__`, properties, and methods
- ✅ Work with dates, timedeltas, and timezone-aware timestamps
- ✅ Create reproducible environments with `pip` and `venv`
- ✅ Perform vectorized arithmetic with NumPy arrays
- ✅ Load, clean, group, merge, and pivot with Pandas

### Advanced Skills (For practitioners)

- ⚡ Write closures and factory functions for parameterized behavior
- ⚡ Use `functools.partial` and `functools.lru_cache` for performance
- ⚡ Implement `__repr__`, `__eq__`, `__hash__` for production-ready classes
- ⚡ Optimize DataFrame memory usage with `category` dtypes and chunking
- ⚡ Build multi-file data pipelines with logging and retry logic
- ⚡ Use `pandas.Timestamp` with business day offsets (`BDay`, `MonthEnd`)

### Expert Skills (For architects)

- 🔬 Design composable function pipelines (pipe operator pattern)
- 🔬 Build class hierarchies with abstract base classes (`abc.ABC`)
- 🔬 Profile Pandas bottlenecks with `%timeit` and `.memory_usage()`
- 🔬 Scale Pandas to 100M+ rows via chunking, Dask, or Polars

---

## Real-World Application Scenarios

### Scenario 1: Customer Data Quality Pipeline

**Company**: B2B SaaS with 50,000 customers imported from a dozen CRM systems.

**Problem**: The combined dataset has inconsistent name casing, invalid emails, duplicate entries (same company under different spellings), and missing revenue figures.

**Your Phase 2 Solution**:

```python
from pathlib import Path
import pandas as pd
import re


class CustomerDataPipeline:
    EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
        self.errors = []

    def load_all(self) -> pd.DataFrame:
        dfs = []
        for f in self.data_dir.glob("*.csv"):
            try:
                dfs.append(pd.read_csv(f, encoding="utf-8-sig"))
            except Exception as e:
                self.errors.append({"file": f.name, "error": str(e)})
        return pd.concat(dfs, ignore_index=True)

    def clean(self, df: pd.DataFrame) -> pd.DataFrame:
        df["name"] = df["name"].str.strip().str.title()
        df["email"] = df["email"].str.strip().str.lower()
        df["is_valid_email"] = df["email"].map(
            lambda e: bool(self.EMAIL_REGEX.match(str(e)))
        )
        df["annual_revenue"] = pd.to_numeric(df["annual_revenue"], errors="coerce")
        df = df.drop_duplicates(subset=["email"], keep="last")
        return df

    def report(self, df: pd.DataFrame) -> dict:
        return {
            "total_records": len(df),
            "valid_emails": df["is_valid_email"].sum(),
            "missing_revenue": df["annual_revenue"].isna().sum(),
            "load_errors": len(self.errors),
        }


pipeline = CustomerDataPipeline("data/crm_exports/")
raw = pipeline.load_all()
clean = pipeline.clean(raw)
print(pipeline.report(clean))
```

**Business Impact**: Automated a process that took 3 days in Excel → 2 minutes. Zero manual errors. Re-runnable on new data exports.

---

### Scenario 2: Revenue Analytics with Pandas

**Company**: E-commerce marketplace tracking sales from 1,000 sellers.

**Problem**: Monthly revenue reports take 4 hours to compile manually in spreadsheets. The team wants a self-serve script Product Managers can run.

**Your Phase 2 Solution**:

```python
class RevenueAnalyzer:
    def __init__(self, filepath: str):
        self.df = pd.read_csv(filepath, parse_dates=["order_date"])
        self.df["month"] = self.df["order_date"].dt.to_period("M")

    def monthly_summary(self) -> pd.DataFrame:
        return (
            self.df.groupby("month")
            .agg(
                revenue=("revenue", "sum"),
                orders=("order_id", "count"),
                avg_order_value=("revenue", "mean"),
                unique_sellers=("seller_id", "nunique"),
            )
            .assign(mom_growth=lambda x: x["revenue"].pct_change() * 100)
            .round(2)
        )

    def top_sellers(self, n: int = 10, period: str = None) -> pd.DataFrame:
        df = self.df
        if period:
            df = df[df["month"] == period]
        return (
            df.groupby("seller_id")["revenue"]
            .sum()
            .nlargest(n)
            .reset_index(name="total_revenue")
        )

    def cohort_retention(self) -> pd.DataFrame:
        """Basic cohort: month of first purchase vs subsequent activity."""
        first = self.df.groupby("customer_id")["month"].min().rename("cohort")
        df = self.df.join(first, on="customer_id")
        return df.groupby(["cohort", "month"])["customer_id"].nunique().unstack()


analyzer = RevenueAnalyzer("sales_2024.csv")
print(analyzer.monthly_summary())
print(analyzer.top_sellers(n=5, period="2024-11"))
```

**Business Impact**: 4-hour monthly report → 10 seconds. PMs now run it themselves. Added cohort analysis that was previously impossible in Excel.

---

### Scenario 3: Log Monitoring System

**Company**: SaaS platform with 50 microservices generating 10GB of logs daily.

**Problem**: On-call engineers spend 2 hours each morning manually reviewing log files. Error spikes go undetected for hours.

**Your Phase 2 Solution**:

```python
import re
from typing import Generator
from datetime import datetime
from collections import Counter

LOG_PATTERN = re.compile(
    r"\[(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] "
    r"(?P<level>DEBUG|INFO|WARNING|ERROR|CRITICAL): "
    r"(?P<message>.+)"
)


def parse_log_line(line: str) -> dict | None:
    m = LOG_PATTERN.match(line.strip())
    if not m:
        return None
    return {
        "timestamp": datetime.strptime(m["timestamp"], "%Y-%m-%d %H:%M:%S"),
        "level": m["level"],
        "message": m["message"],
    }


def stream_log_lines(filepath: str) -> Generator[dict, None, None]:
    """Memory-efficient: process 10GB log without loading into RAM."""
    with open(filepath, encoding="utf-8", errors="replace") as f:
        for line in f:
            parsed = parse_log_line(line)
            if parsed:
                yield parsed


def error_spike_detector(filepath: str, threshold: int = 50) -> list[str]:
    """Detect hours with unusually high ERROR rate."""
    hourly_errors: Counter = Counter()
    for entry in stream_log_lines(filepath):
        if entry["level"] in {"ERROR", "CRITICAL"}:
            hour_key = entry["timestamp"].strftime("%Y-%m-%d %H:00")
            hourly_errors[hour_key] += 1
    return [hour for hour, count in hourly_errors.items() if count >= threshold]


spikes = error_spike_detector("app.log", threshold=50)
print(f"Error spikes detected at: {spikes}")
```

**Business Impact**: 2-hour manual review → instant automated alert. MTTR (Mean Time to Resolve) dropped from 140 minutes to 23 minutes.

---

## Common Pitfalls & Solutions

### Pitfall 1: "My code reads the whole file into memory and crashes"
**Why**: `f.read()` or `pd.read_csv()` loads everything at once.
**Fix**: Use generators (`yield`) for line-by-line processing, or `pd.read_csv(chunksize=10000)` for chunked Pandas. For 10GB+ files, streaming is non-negotiable.

```python
# ❌ Memory bomb
data = open("huge.csv").read()

# ✅ Memory-efficient
with open("huge.csv") as f:
    for line in f:  # Reads one line at a time
        process(line)
```

### Pitfall 2: "My regex works on 90% of data but silently fails on the rest"
**Why**: Regex patterns are often too strict (rejecting valid data) or too loose (accepting invalid data).
**Fix**: Test with real, messy data — not clean examples. Always handle the `None` case from `re.match()`. Use `re.VERBOSE` for readable complex patterns.

```python
# ❌ Crashes when no match
def get_domain(email: str) -> str:
    return re.search(r"@(.+)", email).group(1)  # AttributeError if None


# ✅ Safe
def get_domain(email: str) -> str | None:
    m = re.search(r"@(.+)", email)
    return m.group(1) if m else None
```

### Pitfall 3: "My exception handling swallows bugs"
**Why**: `except Exception: pass` hides errors silently.
**Fix**: Only catch what you can handle. Log the error. Never silence exceptions in production.

```python
# ❌ Swallows all errors — bugs become invisible
try:
    process_data(df)
except Exception:
    pass

# ✅ Handle specific, log everything else
try:
    process_data(df)
except FileNotFoundError as e:
    print(f"Warning: {e}. Skipping.")
except Exception as e:
    logging.error(f"Unexpected error in process_data: {e}", exc_info=True)
    raise  # Re-raise — don't hide the bug
```

### Pitfall 4: "My Pandas code is slow (applying Python loops over DataFrames)"
**Why**: `df.apply()` with a Python function is 100x slower than vectorized operations.
**Fix**: Use vectorized Pandas/NumPy operations first. `apply()` is only for complex logic with no vectorized equivalent.

```python
# ❌ Python loop — 100x slower
df["discounted"] = df.apply(
    lambda row: row["price"] * 0.9 if row["is_member"] else row["price"], axis=1
)

# ✅ Vectorized — instant
df["discounted"] = df["price"].where(~df["is_member"], df["price"] * 0.9)
```

### Pitfall 5: "My class works but it's tightly coupled — impossible to test"
**Why**: Classes that directly instantiate dependencies (`self.db = Database()`) can't be tested without a real database.
**Fix**: Inject dependencies through the constructor. This is the Dependency Injection principle — it enables mocking in tests.

```python
# ❌ Hard to test — requires a real database
class Analyzer:
    def __init__(self):
        self.db = Database("production")  # Hardcoded!


# ✅ Testable — inject any data source
class Analyzer:
    def __init__(self, data_source):
        self.db = data_source  # Can inject a mock in tests


# In production
analyzer = Analyzer(Database("production"))
# In tests
analyzer = Analyzer(MockDatabase({"revenue": [100, 200]}))
```

---

## Completion Checklist

Before moving to Phase 3, ensure you can:

- [ ] Write and use higher-order functions (`map`, `filter`, `functools.reduce`)
- [ ] Create and import custom modules with proper `__init__.py`
- [ ] Write exception handlers that log errors and re-raise when appropriate
- [ ] Read/write CSV, JSON, and text files with `pathlib` and context managers
- [ ] Use regex for text validation and structured data extraction
- [ ] Design classes with `__init__`, properties, and methods
- [ ] Work with dates, timedeltas, and timezone-aware timestamps
- [ ] Create reproducible environments with `pip` and `venv`
- [ ] Perform vectorized operations with NumPy (no Python loops over arrays)
- [ ] Analyze data with Pandas `groupby`, `merge`, and `pivot_table`
- [ ] Profile code performance and know when to use chunking vs in-memory

---

**Congratulations on completing Phase 2!** 🎉

You now have the professional-grade Python skills to work with real business data. In **Phase 3**, you'll apply these skills to data engineering pipelines, web APIs, and data visualization.

> 🔗 **Forward reference**: The Pandas skills from Days 22–24 are the foundation for Phases 4–6's ML preprocessing pipelines. The OOP patterns from Days 18–19 appear in sklearn's Transformer/Estimator pattern. Exception handling from Days 13–15 is critical for Phase 3's API development.
