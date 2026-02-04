---
day: 27
title: "Data Visualization"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "data-visualization"
duration: 55
difficulty: "intermediate"
tags: [python, matplotlib, visualization, charts]
concepts: [chart types, matplotlib basics, plot customization, choosing visualizations]
prerequisites: [23, 26]
outcomes: [Create common chart types, Customize plots for presentations, Choose appropriate visualizations]
---

# 🎯 Day 27: Data Visualization

> *"A picture is worth a thousand rows of data."*

---

## The "Never-Coded" Bridge

Numbers in tables are hard to grasp. Visualizations reveal:
- Trends over time (line charts)
- Comparisons between categories (bar charts)
- Distributions (histograms)
- Relationships (scatter plots)

---

## The Technical Deep Dive

### Matplotlib Basics

```python
import matplotlib.pyplot as plt
import numpy as np

# Simple line plot
x = [1, 2, 3, 4, 5]
y = [10, 15, 13, 18, 20]

plt.figure(figsize=(10, 6))
plt.plot(x, y, marker='o', color='blue', linewidth=2)
plt.title("Sales Trend", fontsize=14)
plt.xlabel("Month")
plt.ylabel("Revenue ($K)")
plt.grid(True, alpha=0.3)
plt.show()
```

### Common Chart Types

```python
import pandas as pd
import matplotlib.pyplot as plt

df = pd.DataFrame({
    "category": ["Electronics", "Clothing", "Food", "Home"],
    "sales": [150, 90, 120, 75]
})

# Bar Chart
plt.figure(figsize=(8, 5))
plt.bar(df["category"], df["sales"], color="steelblue")
plt.title("Sales by Category")
plt.show()

# Horizontal Bar
plt.barh(df["category"], df["sales"])

# Pie Chart
plt.pie(df["sales"], labels=df["category"], autopct="%1.1f%%")
```

### Histogram (Distribution)

```python
import numpy as np

data = np.random.normal(100, 15, 1000)

plt.figure(figsize=(8, 5))
plt.hist(data, bins=30, edgecolor="black", alpha=0.7)
plt.title("Score Distribution")
plt.xlabel("Score")
plt.ylabel("Frequency")
plt.axvline(np.mean(data), color="red", linestyle="--", label=f"Mean: {np.mean(data):.1f}")
plt.legend()
plt.show()
```

### Scatter Plot (Relationships)

```python
marketing = [100, 200, 300, 400, 500]
revenue = [1000, 1800, 2500, 3800, 4500]

plt.figure(figsize=(8, 5))
plt.scatter(marketing, revenue, s=100, c="green", alpha=0.7)
plt.title("Marketing vs Revenue")
plt.xlabel("Marketing Spend ($)")
plt.ylabel("Revenue ($)")
plt.show()
```

### Subplots

```python
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

axes[0, 0].plot([1, 2, 3], [1, 4, 9])
axes[0, 0].set_title("Line Plot")

axes[0, 1].bar(["A", "B", "C"], [10, 20, 15])
axes[0, 1].set_title("Bar Chart")

axes[1, 0].hist(np.random.randn(100), bins=20)
axes[1, 0].set_title("Histogram")

axes[1, 1].scatter([1, 2, 3], [1, 4, 9])
axes[1, 1].set_title("Scatter Plot")

plt.tight_layout()
plt.show()
```

### Chart Selection Guide

| Question            | Chart Type   |
| ------------------- | ------------ |
| Trend over time?    | Line chart   |
| Compare categories? | Bar chart    |
| Part of whole?      | Pie chart    |
| Distribution?       | Histogram    |
| Relationship?       | Scatter plot |

---

## Hands-on Lab

```python
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Monthly sales data
months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
sales = [12000, 15000, 14000, 18000, 22000, 20000]
expenses = [8000, 9000, 8500, 10000, 11000, 10500]

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Sales trend
axes[0].plot(months, sales, marker="o", label="Sales", color="green")
axes[0].plot(months, expenses, marker="s", label="Expenses", color="red")
axes[0].fill_between(months, sales, expenses, alpha=0.2, color="green")
axes[0].set_title("Sales vs Expenses")
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# Profit bar chart
profit = [s - e for s, e in zip(sales, expenses)]
colors = ["green" if p > 0 else "red" for p in profit]
axes[1].bar(months, profit, color=colors)
axes[1].set_title("Monthly Profit")
axes[1].axhline(0, color="black", linewidth=0.5)

plt.tight_layout()
plt.savefig("sales_report.png", dpi=150)
plt.show()
```

---

## Mastery Check

**Q1**: Best chart for trends over time? Line chart.

**Q2**: Save figure: `plt.savefig("filename.png", dpi=150)`

**Q3**: Add legend: `plt.legend()`

---

## Summary

- ✅ Line charts for trends
- ✅ Bar charts for comparisons
- ✅ Histograms for distributions
- ✅ Scatter plots for relationships

**Tomorrow**: Advanced visualization with Seaborn.
