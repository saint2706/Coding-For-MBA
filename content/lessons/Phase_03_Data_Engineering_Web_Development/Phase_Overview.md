---
phase: 3
title: "Data Engineering & Web Development"
days: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, "36B", "36C"]
totalDuration: 640
difficulty: "intermediate"
---

# 🚀 Phase 3: Data Engineering & Web Development

> *"Turn raw data into clean insights, and Python scripts into web applications."*

---

## Phase Summary

This phase bridges the gap between data analysis and software engineering. You've learned to transform messy real-world data into actionable insights, create compelling visualizations that tell stories, and build web applications that serve data to users worldwide.

### What You've Accomplished

**Days 25-26: Data Analysis Foundations**
You mastered the art of data cleaning—handling missing values, fixing inconsistent formats, removing duplicates, and detecting outliers. You built statistical intuition for business analysis: when to use mean vs. median, how to interpret correlations, and what percentiles reveal about your data distribution.

**Days 27-29: Visualization Mastery**
You progressed from basic Matplotlib charts to sophisticated Seaborn statistical visualizations and interactive Plotly dashboards. You learned to choose the right chart for every question: line charts for trends, bar charts for comparisons, scatter plots for relationships, and heatmaps for correlations.

**Days 30-32: Data Sources**
You discovered that data doesn't always arrive in clean CSVs. You learned to scrape websites ethically with BeautifulSoup, query relational databases with SQL, and understand when NoSQL document stores like MongoDB make sense. You can now pull data from anywhere.

**Days 33-36C: Web Development**
You evolved from consuming APIs to building them. The sequencing at the end of this phase is explicit: **Day 36 = ETL Case Study**, **Day 36B = Docker Fundamentals**, and **Day 36C = Async Python + FastAPI (after creation)**. You created REST endpoints with FastAPI, built full web applications with Flask, and designed end-to-end data pipelines that extract, transform, and load data automatically.

### Skills Unlocked

| Skill             | Tools                                    |
| ----------------- | ---------------------------------------- |
| **Data Cleaning** | Pandas, regex, type conversion, outliers |
| **Statistics**    | Mean, median, correlation, percentiles   |
| **Visualization** | Matplotlib, Seaborn, Plotly              |
| **Web Scraping**  | BeautifulSoup, requests, CSS selectors   |
| **Databases**     | SQLite, PostgreSQL, MongoDB, SQLAlchemy  |
| **APIs**          | requests, FastAPI, Pydantic              |
| **Web Apps**      | Flask, Jinja2, forms, sessions           |

---

## The Expert's Toolkit

### Official Documentation

- [Pandas User Guide](https://pandas.pydata.org/docs/user_guide/) — Complete data manipulation reference
- [Matplotlib Tutorials](https://matplotlib.org/stable/tutorials/) — Visualization fundamentals
- [Seaborn Tutorial](https://seaborn.pydata.org/tutorial.html) — Statistical graphics
- [Plotly Documentation](https://plotly.com/python/) — Interactive charts
- [FastAPI Documentation](https://fastapi.tiangolo.com/) — Modern API framework
- [Flask Documentation](https://flask.palletsprojects.com/) — Web application framework

### Cheat Sheets

- [Pandas Cheat Sheet](https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf) — Quick reference
- [Matplotlib Cheat Sheet](https://matplotlib.org/cheatsheets/) — Common plot patterns
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) — API response codes

### Practice Platforms

- [Kaggle Datasets](https://www.kaggle.com/datasets) — Real-world data for cleaning practice
- [Quotes to Scrape](http://quotes.toscrape.com/) — Safe scraping sandbox
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/) — Fake API for testing

### Industry Resources

- [Data Engineering Weekly](https://www.dataengineeringweekly.com/) — Industry trends
- [Real Python Flask Tutorials](https://realpython.com/tutorials/flask/) — Production patterns
- [REST API Design Best Practices](https://restfulapi.net/) — API standards

---

## Phase Milestone Exam

> ⚠️ **Synthetic Challenge Questions**  
> Each question requires combining knowledge from 3-4 days to solve.

---

### Question 1: The ETL Pipeline

**Combines**: APIs (Day 33), Data Cleaning (Day 25), Databases (Day 31), Visualization (Day 27)

**Scenario**: Build an automated data pipeline for a financial dashboard.

1. Fetch stock price data from a public API
2. Clean the data: handle missing values, normalize dates, convert types
3. Store in SQLite with proper schema
4. Generate a visualization showing price trends

**Sample Data Structure**:

```python
# API returns data like:
{
    "symbol": "AAPL",
    "prices": [
        {"date": "2024-01-15", "close": "185.92", "volume": "50000000"},
        {"date": "2024-01-16", "close": None, "volume": "48000000"},
        # ... more entries
    ],
}
```

**Requirements**:

```python
def fetch_stock_data(symbol: str) -> pd.DataFrame:
    """Fetch and parse stock data from API."""
    pass


def clean_stock_data(df: pd.DataFrame) -> pd.DataFrame:
    """Handle missing values, convert types, validate dates."""
    pass


def store_to_database(df: pd.DataFrame, db_path: str):
    """Store cleaned data in SQLite with proper schema."""
    pass


def generate_price_chart(db_path: str, symbol: str):
    """Create line chart from database data."""
    pass


def run_pipeline(symbol: str):
    """Execute complete ETL pipeline."""
    pass
```

<details>
<summary>💡 Hints</summary>

1. Use `requests.get()` with proper error handling for the API call
2. For missing prices, consider forward-fill (`ffill`) for continuity
3. Convert price strings to floats: `df["close"].astype(float)`
4. Use `pd.to_sql()` with `if_exists="append"` for incremental loads
5. Add logging to track pipeline progress and catch failures

</details>

---

### Question 2: The Multi-Page Web Scraper

**Combines**: Web Scraping (Day 30), Data Cleaning (Day 25), Statistics (Day 26), Databases (Day 31)

**Scenario**: Build a price comparison tool that scrapes product data from multiple pages.

1. Scrape product listings across paginated results
2. Clean and standardize price formats
3. Calculate statistics: average price, price range, outliers
4. Store results and generate a summary report

**Requirements**:

```python
def scrape_all_pages(base_url: str, max_pages: int = 5) -> list:
    """
    Scrape products across multiple pages.
    Handle pagination, rate limiting, and errors.
    """
    pass


def clean_product_data(products: list) -> pd.DataFrame:
    """
    Standardize product data:
    - Clean price strings ("$1,299.99" → 1299.99)
    - Normalize names (strip whitespace, title case)
    - Remove duplicates
    """
    pass


def analyze_prices(df: pd.DataFrame) -> dict:
    """
    Return statistics:
    - mean, median, std
    - price range (min, max)
    - outliers (beyond 2 std)
    - count by category
    """
    pass


def generate_report(df: pd.DataFrame, stats: dict) -> str:
    """Create formatted summary report."""
    pass
```

<details>
<summary>💡 Hints</summary>

1. Add `time.sleep(1)` between requests to be polite
2. Use `User-Agent` header to identify your scraper
3. Price cleaning: `re.sub(r"[^0-9.]", "", price_string)`
4. Outlier detection: values beyond `mean ± 2*std`
5. Handle missing products gracefully with try/except

</details>

---

### Question 3: The REST API with Database

**Combines**: Building APIs (Day 34), Databases (Day 31), Data Cleaning (Day 25), OOP (Day 18)

**Scenario**: Create a product inventory API with full CRUD operations.

**Requirements**:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
import sqlite3


class Product(BaseModel):
    name: str
    price: float
    category: str
    stock: int = 0

    @validator("price")
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Price must be positive")
        return round(v, 2)

    @validator("name")
    def name_must_be_clean(cls, v):
        return v.strip().title()


# Implement these endpoints:
# GET /products - List all products (with optional category filter)
# GET /products/{id} - Get single product
# POST /products - Create product (validate and clean input)
# PUT /products/{id} - Update product
# DELETE /products/{id} - Delete product
# GET /products/stats - Return category statistics
```

**Expected Behavior**:

```python
# POST /products with {"name": "  laptop  ", "price": 999.999, "category": "electronics"}
# Should return: {"id": 1, "name": "Laptop", "price": 999.99, "category": "electronics", "stock": 0}

# GET /products?category=electronics
# Should return only electronics products

# GET /products/stats
# Should return: {"electronics": {"count": 5, "total_value": 4500.00}, ...}
```

<details>
<summary>💡 Hints</summary>

1. Use Pydantic validators for input cleaning
2. Store products in SQLite for persistence
3. Use query parameters for filtering: `category: str = None`
4. Return proper HTTP status codes: 201 for created, 404 for not found
5. Use `HTTPException` for error responses

</details>

---

### Question 4: The Flask Analytics Dashboard

**Combines**: Flask (Day 35), Visualization (Day 27-29), Databases (Day 31), Statistics (Day 26)

**Scenario**: Build a web dashboard that displays sales analytics.

**Requirements**:

```python
# Flask app structure:
# /                  - Homepage with summary cards
# /sales             - Table view with filters
# /charts            - Interactive visualizations
# /api/sales         - JSON endpoint for chart data

# Features:
# 1. Load sales data from SQLite
# 2. Display KPIs: total revenue, average order, top product
# 3. Filter by date range and category
# 4. Show charts: revenue trend, category breakdown, regional comparison
# 5. Export filtered data as CSV
```

**Template Structure**:

```html
<!-- templates/dashboard.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Sales Dashboard</title>
</head>
<body>
    <div class="kpi-cards">
        <div class="card">
            <h3>Total Revenue</h3>
            <p>${{ "%.2f"|format(stats.total_revenue) }}</p>
        </div>
        <!-- More KPI cards -->
    </div>
    
    <div class="filters">
        <form method="GET">
            <input type="date" name="start_date" value="{{ filters.start_date }}">
            <input type="date" name="end_date" value="{{ filters.end_date }}">
            <select name="category">
                {% for cat in categories %}
                <option value="{{ cat }}">{{ cat }}</option>
                {% endfor %}
            </select>
            <button type="submit">Filter</button>
        </form>
    </div>
    
    <div id="chart"></div>
    <!-- Use Plotly or embed chart image -->
</body>
</html>
```

<details>
<summary>💡 Hints</summary>

1. Use `request.args.get()` to read filter parameters
2. Build SQL queries dynamically based on filter values
3. For Plotly charts, save as HTML and embed with `<iframe>` or use JavaScript
4. Add `@app.route("/export")` for CSV download with `send_file()`
5. Use Jinja2's `|format` filter for currency formatting

</details>

---

## Completion Checklist

Before moving to Phase 4, ensure you can:

- [ ] Clean messy data: handle nulls, duplicates, type conversions
- [ ] Calculate and interpret descriptive statistics
- [ ] Choose the right chart type for any business question
- [ ] Create interactive visualizations with Plotly
- [ ] Scrape websites ethically with proper rate limiting
- [ ] Design and query relational databases
- [ ] Understand when to use SQL vs. NoSQL
- [ ] Consume REST APIs with authentication
- [ ] Build REST APIs with FastAPI and Pydantic validation
- [ ] Create Flask web applications with templates and forms
- [ ] Design end-to-end data pipelines

---

**Congratulations on completing Phase 3!** 🎉

You've transformed from a script writer to a full-stack data professional. You can now gather data from anywhere, clean and analyze it, visualize insights, and deliver them through web applications and APIs.

In **Phase 4**, you'll dive into mathematical foundations and machine learning—teaching computers to learn from your data.
