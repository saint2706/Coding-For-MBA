---
phase: 3
title: "Data Engineering & Web Development"
days: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]
totalDuration: 640
difficulty: "intermediate"
---

# 🚀 Phase 3: Data Engineering & Web Development

> *"Turn raw data into clean insights, and Python scripts into web applications."*

---

## Phase Summary

This phase bridged data analysis and software engineering. You learned to clean messy data, visualize insights, gather data from the web, and build applications.

### What You've Accomplished

**Days 25-26: Data Analysis Foundations**
Data cleaning techniques for real-world messy data. Statistical foundations for business analysis.

**Days 27-29: Visualization Mastery**
Matplotlib for custom charts, Seaborn for statistical visualizations, Plotly for interactive dashboards.

**Days 30-32: Data Sources**
Web scraping with BeautifulSoup, SQL databases with sqlite3, NoSQL with MongoDB concepts.

**Days 33-36: Web Development**
Consuming APIs, building APIs with FastAPI, full web apps with Flask, end-to-end pipeline design.

### Skills Unlocked

| Skill             | Tools                                  |
| ----------------- | -------------------------------------- |
| **Data Cleaning** | Pandas, regex, type conversion         |
| **Statistics**    | Mean, median, correlation, percentiles |
| **Visualization** | Matplotlib, Seaborn, Plotly            |
| **Web Scraping**  | BeautifulSoup, requests                |
| **Databases**     | SQLite, PostgreSQL, MongoDB            |
| **APIs**          | requests, FastAPI                      |
| **Web Apps**      | Flask, Jinja2 templates                |

---

## Phase Milestone Exam

### Question 1: Data Pipeline

Build an ETL pipeline that:
1. Fetches JSON from an API
2. Cleans and transforms the data
3. Stores in SQLite
4. Generates a visualization

<details>
<summary>💡 Solution Outline</summary>

```python
import requests
import pandas as pd
import sqlite3
import matplotlib.pyplot as plt

# Extract
data = requests.get("https://api.example.com/data").json()
df = pd.DataFrame(data)

# Transform
df = df.dropna()
df["date"] = pd.to_datetime(df["date"])

# Load
with sqlite3.connect("data.db") as conn:
    df.to_sql("records", conn, if_exists="replace")

# Visualize
df.groupby("category")["value"].sum().plot(kind="bar")
plt.savefig("report.png")
```
</details>

---

### Question 2: Web Scraper

Create a scraper that extracts product data and handles pagination.

---

### Question 3: REST API

Build a FastAPI endpoint that:
1. Accepts POST with product data
2. Validates input with Pydantic
3. Returns confirmation with generated ID

---

### Question 4: Flask Dashboard

Create a Flask app that:
1. Loads data from SQLite
2. Displays in HTML table
3. Includes filter functionality

---

## Completion Checklist

- [ ] Clean messy data with Pandas
- [ ] Calculate descriptive statistics
- [ ] Create publication-quality visualizations
- [ ] Scrape websites ethically
- [ ] Query SQL databases from Python
- [ ] Consume and build REST APIs
- [ ] Create Flask web applications

**Congratulations on completing Phase 3!** 🎉
