---
day: 27
title: "Data Visualization"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "data-visualization"
duration: 55
difficulty: "intermediate"
tags:
  - python
  - matplotlib
  - visualization
  - charts
concepts:
  - "chart types"
  - "matplotlib basics"
  - "plot customization"
  - "choosing visualizations"
  - "storytelling with data"
prerequisites: [23, 26]
outcomes:
  - "Create common chart types with Matplotlib"
  - "Customize plots for professional presentations"
  - "Choose the right visualization for any data question"
  - "Build multi-panel figures for comprehensive reporting"
---

# 🎯 Day 27: Data Visualization

> *"A picture is worth a thousand rows of data."*

---

## The "Never-Coded" Bridge

**Imagine presenting quarterly results to executives.** You could show them a spreadsheet with 500 rows of sales data—or you could show them a single line chart that makes the trend crystal clear in 3 seconds.

Good visualizations don't just display data—they tell stories. They answer questions before they're asked.

**Match the chart to the question:**

- "How have sales changed over time?" → **Line chart**
- "Which regions perform best?" → **Bar chart**
- "What's the distribution of customer ages?" → **Histogram**
- "Is there a relationship between price and demand?" → **Scatter plot**
- "What percent of revenue comes from each product?" → **Pie chart** (use sparingly!)

**Real-world visualization decisions:**

- **Financial reports**: Line charts for trends, bar charts for comparisons
- **Marketing dashboards**: Funnel charts, conversion metrics
- **Operations**: Heatmaps for patterns, box plots for distributions
- **Executive summaries**: KPI cards with sparklines

---

## The Technical Deep Dive

### Why Visualization Rules Exist: Human Perception

Good charts aren't just aesthetically nice — they exploit how the human brain processes visual information. Violating these principles produces misleading or confusing charts:

**1. Humans compare length more accurately than area or angle.**

- Our brains are excellent at judging which bar is taller (length comparison).
- We are poor at judging which slice of a pie is bigger (angle/area comparison).
- **Rule:** Prefer bar charts over pie charts for most comparisons.

**2. Truncating axes exaggerates differences.**

- Starting a y-axis at 97 instead of 0 makes a 3% change look like a 100% change.
- **Rule:** Start continuous y-axes at zero for bar charts. (Line charts showing trends can start at a non-zero baseline, with clear axis labels.)

**3. Too many categories overwhelm pattern recognition.**

- Pie charts become unreadable with more than 5 slices.
- **Rule:** For >5 categories, use a bar chart or group into "Other."

**4. Color should encode meaning, not decoration.**

- Using 10 random colors for 10 bars adds no information.
- **Rule:** Use a consistent color for a single series; use different colors only to distinguish different series or highlight a specific data point.

**5. Chart selection guide:**

| Business Question | Best Chart | Why |
|-------------------|-----------|-----|
| How has X changed over time? | Line chart | Shows trends and momentum |
| Which category is biggest? | Bar chart (horizontal) | Length comparison is accurate |
| What's the distribution of X? | Histogram or box plot | Shows spread and skew |
| Is there a relationship between X and Y? | Scatter plot | Shows correlation patterns |
| What fraction does each part contribute? | Stacked bar (≤5 groups) | Better than pie for comparison |
| Comparison across two dimensions | Heatmap | Color encodes magnitude |

### Matplotlib Basics

Matplotlib is Python's foundational visualization library. Learn it well—it powers Seaborn and Pandas plotting.

```python
import matplotlib.pyplot as plt
import numpy as np

# Simple line plot
months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
sales = [10000, 15000, 13000, 18000, 22000, 20000]

plt.figure(figsize=(10, 6))
plt.plot(months, sales, marker="o", color="blue", linewidth=2, markersize=8)
plt.title("Monthly Sales Performance", fontsize=16, fontweight="bold")
plt.xlabel("Month", fontsize=12)
plt.ylabel("Revenue ($)", fontsize=12)
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

### Line Charts (Trends Over Time)

```python
import matplotlib.pyplot as plt
import numpy as np

months = np.arange(1, 13)
product_a = [10, 12, 15, 14, 18, 22, 25, 24, 28, 32, 35, 40]
product_b = [8, 10, 9, 12, 14, 15, 18, 20, 19, 22, 25, 28]

plt.figure(figsize=(12, 6))

# Multiple lines with legend
plt.plot(months, product_a, marker="o", label="Product A", color="#2196F3", linewidth=2)
plt.plot(months, product_b, marker="s", label="Product B", color="#FF9800", linewidth=2)

# Fill area between lines to show gap
plt.fill_between(months, product_a, product_b, alpha=0.2, color="green")

plt.title("Product Sales Comparison", fontsize=16, fontweight="bold")
plt.xlabel("Month")
plt.ylabel("Units Sold (thousands)")
plt.legend(loc="upper left")
plt.grid(True, alpha=0.3)
plt.xticks(
    months,
    [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ],
)
plt.tight_layout()
plt.show()
```

### Bar Charts (Category Comparisons)

```python
import matplotlib.pyplot as plt
import numpy as np

categories = ["Electronics", "Clothing", "Home", "Sports", "Books"]
values = [150000, 90000, 120000, 75000, 45000]

# Vertical bar chart with custom colors
plt.figure(figsize=(10, 6))
colors = ["#4CAF50" if v == max(values) else "#2196F3" for v in values]
bars = plt.bar(categories, values, color=colors, edgecolor="black")

# Add value labels on top of bars
for bar, value in zip(bars, values):
    plt.text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + 2000,
        f"${value:,}",
        ha="center",
        fontsize=10,
        fontweight="bold",
    )

plt.title("Revenue by Category", fontsize=16, fontweight="bold")
plt.xlabel("Category")
plt.ylabel("Revenue ($)")
plt.ylim(0, max(values) * 1.15)  # Add headroom for labels
plt.tight_layout()
plt.show()
```

### Horizontal Bar Charts (Rankings)

```python
import matplotlib.pyplot as plt

# Great for ranked data with long labels
products = [
    'MacBook Pro 16"',
    "iPhone 15 Pro",
    "iPad Air",
    "AirPods Pro",
    "Apple Watch",
    "Magic Keyboard",
]
revenue = [125000, 180000, 75000, 95000, 68000, 28000]

# Sort by value for better readability
sorted_pairs = sorted(zip(revenue, products))
revenue_sorted = [x[0] for x in sorted_pairs]
products_sorted = [x[1] for x in sorted_pairs]

plt.figure(figsize=(10, 6))
plt.barh(products_sorted, revenue_sorted, color="#2196F3", edgecolor="black")

# Add value labels at end of bars
for i, (value, product) in enumerate(zip(revenue_sorted, products_sorted)):
    plt.text(value + 2000, i, f"${value:,}", va="center", fontsize=10)

plt.title("Product Revenue Ranking", fontsize=16, fontweight="bold")
plt.xlabel("Revenue ($)")
plt.xlim(0, max(revenue_sorted) * 1.2)
plt.tight_layout()
plt.show()
```

### Histograms (Distributions)

```python
import matplotlib.pyplot as plt
import numpy as np

# Generate sample data
np.random.seed(42)
customer_ages = np.random.normal(35, 10, 1000)

plt.figure(figsize=(10, 6))
n, bins, patches = plt.hist(
    customer_ages, bins=30, edgecolor="black", color="#2196F3", alpha=0.7
)

# Add mean and median lines
mean_age = np.mean(customer_ages)
median_age = np.median(customer_ages)
plt.axvline(
    mean_age, color="red", linestyle="--", linewidth=2, label=f"Mean: {mean_age:.1f}"
)
plt.axvline(
    median_age,
    color="green",
    linestyle="-.",
    linewidth=2,
    label=f"Median: {median_age:.1f}",
)

plt.title("Customer Age Distribution", fontsize=16, fontweight="bold")
plt.xlabel("Age")
plt.ylabel("Frequency")
plt.legend()
plt.tight_layout()
plt.show()
```

### Scatter Plots (Relationships)

```python
import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)
marketing_spend = np.random.uniform(1000, 10000, 50)
revenue = marketing_spend * 5 + np.random.normal(0, 5000, 50)

plt.figure(figsize=(10, 6))
plt.scatter(marketing_spend, revenue, s=100, c="#2196F3", alpha=0.7, edgecolor="black")

# Add trend line
z = np.polyfit(marketing_spend, revenue, 1)
p = np.poly1d(z)
plt.plot(
    marketing_spend,
    p(marketing_spend),
    "r--",
    linewidth=2,
    label=f"Trend (slope: {z[0]:.2f})",
)

plt.title("Marketing Spend vs Revenue", fontsize=16, fontweight="bold")
plt.xlabel("Marketing Spend ($)")
plt.ylabel("Revenue ($)")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

### Subplots (Multi-Panel Figures)

```python
import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)
months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
sales = [10, 15, 13, 18, 22, 20]
expenses = [8, 9, 8.5, 10, 11, 10.5]
profit = [s - e for s, e in zip(sales, expenses)]
categories = ["Electronics", "Clothing", "Home"]
category_values = [40, 35, 25]

fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Plot 1: Line chart
axes[0, 0].plot(months, sales, marker="o", label="Sales", color="green")
axes[0, 0].plot(months, expenses, marker="s", label="Expenses", color="red")
axes[0, 0].set_title("Sales vs Expenses", fontweight="bold")
axes[0, 0].legend()
axes[0, 0].grid(True, alpha=0.3)

# Plot 2: Bar chart
colors = ["green" if p > 0 else "red" for p in profit]
axes[0, 1].bar(months, profit, color=colors, edgecolor="black")
axes[0, 1].axhline(0, color="black", linewidth=0.5)
axes[0, 1].set_title("Monthly Profit/Loss", fontweight="bold")
axes[0, 1].set_ylabel("Profit ($K)")

# Plot 3: Pie chart
axes[1, 0].pie(
    category_values,
    labels=categories,
    autopct="%1.1f%%",
    colors=["#4CAF50", "#2196F3", "#FF9800"],
    startangle=90,
)
axes[1, 0].set_title("Sales by Category", fontweight="bold")

# Plot 4: Histogram
data = np.random.normal(100, 15, 500)
axes[1, 1].hist(data, bins=25, edgecolor="black", color="#2196F3", alpha=0.7)
axes[1, 1].axvline(np.mean(data), color="red", linestyle="--", label="Mean")
axes[1, 1].set_title("Order Value Distribution", fontweight="bold")
axes[1, 1].legend()

plt.suptitle("Q2 Business Dashboard", fontsize=18, fontweight="bold", y=1.02)
plt.tight_layout()
plt.savefig("dashboard.png", dpi=150, bbox_inches="tight")
plt.show()
```

---

## Senior-Level Insights

### Chart Selection Guide

| Question                                 | Best Chart   | Why                                   |
| ---------------------------------------- | ------------ | ------------------------------------- |
| How has X changed over time?             | Line chart   | Shows trends and patterns             |
| How does X compare across groups?        | Bar chart    | Easy categorical comparison           |
| What's the distribution of X?            | Histogram    | Shows shape, center, spread           |
| Is there a relationship between X and Y? | Scatter plot | Reveals correlations                  |
| What percent of total is each category?  | Pie chart    | Part-to-whole (use for ≤5 categories) |
| How do two+ variables relate?            | Heatmap      | Shows correlation matrix              |
| What's the range and outliers?           | Box plot     | Statistical summary                   |

### Design Best Practices

**Do:**

- Start y-axis at zero for bar charts (to avoid misleading)
- Use consistent colors across related charts
- Add clear titles that state the takeaway
- Include units on axes
- Use gridlines sparingly (low alpha)

**Don't:**

- Use pie charts with >5 categories
- Use 3D effects (they distort perception)
- Truncate axes to exaggerate differences
- Use rainbow color schemes
- Pack too many data series on one chart

### Accessibility Considerations

```python
# Color-blind friendly palettes
colorblind_palette = ["#0072B2", "#E69F00", "#009E73", "#D55E00", "#CC79A7"]

# Use patterns/markers in addition to color
plt.plot(
    x, y1, color=colorblind_palette[0], marker="o", linestyle="-", label="Series A"
)
plt.plot(
    x, y2, color=colorblind_palette[1], marker="s", linestyle="--", label="Series B"
)

# Ensure sufficient contrast and font sizes
plt.rcParams.update(
    {
        "font.size": 12,
        "axes.labelsize": 14,
        "axes.titlesize": 16,
        "legend.fontsize": 12,
    }
)
```

### Export Best Practices

```python
# For presentations (PNG, high DPI)
plt.savefig("chart.png", dpi=300, bbox_inches="tight", facecolor="white")

# For web (PNG, smaller file)
plt.savefig("chart_web.png", dpi=150, bbox_inches="tight")

# For publications (vector format)
plt.savefig("chart.pdf", bbox_inches="tight")
plt.savefig("chart.svg", bbox_inches="tight")
```

### Accessibility in Data Visualization

Good dashboards are readable by everyone, including the ~8% of people with color vision deficiency (color blindness):

- **Use colorblind-safe palettes:** Replace red/green combinations (the most common deficiency) with blue/orange or blue/red.

  ```python
  # Colorblind-friendly palette (Okabe-Ito)
  colors = ["#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2"]
  plt.rcParams["axes.prop_cycle"] = plt.cycler(color=colors)
  ```

- **Don't rely on color alone:** Add pattern fills, direct labels, or shape markers to encode information redundantly.
- **Label data points directly** where possible, rather than requiring legend lookups.

---

## Hands-on Lab

### Exercise 1: Sales Trend Report

**Business Scenario:** The CFO needs a Year-over-Year (YoY) sales trend chart for the upcoming board presentation. She wants a clean line chart for Product A and Product B over 12 months, with the performance gap shaded to visually emphasize Product A's lead.

**Your Task:**

1. Create a multi-line chart showing monthly sales for Product A and Product B
2. Add a filled area between the two lines to highlight the gap
3. Add proper title, axis labels, legend, and grid
4. Save or display the chart

**Expected Output:** A 12×6 inch chart titled "Product Sales Comparison" with two labeled lines (blue = Product A, orange = Product B), a green-shaded area between them, and month numbers 1–12 on the x-axis.

```python
import matplotlib.pyplot as plt
import numpy as np

# Monthly data for 2023 and 2024
months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
]
sales_2023 = [85, 92, 88, 95, 102, 98, 105, 115, 108, 120, 135, 150]
sales_2024 = [95, 105, 100, 112, 118, 125, 130, 142, 138, 155, 0, 0]  # Incomplete year


def create_yoy_comparison(months, data_2023, data_2024):
    """Create year-over-year sales comparison chart."""
    plt.figure(figsize=(12, 6))

    x = np.arange(len(months))
    width = 0.35

    # Create grouped bar chart
    bars_2023 = plt.bar(
        x - width / 2,
        data_2023,
        width,
        label="2023",
        color="#2196F3",
        edgecolor="black",
    )

    # Only plot 2024 where we have data (non-zero)
    data_2024_masked = [v if v > 0 else np.nan for v in data_2024]
    bars_2024 = plt.bar(
        x + width / 2,
        data_2024_masked,
        width,
        label="2024",
        color="#4CAF50",
        edgecolor="black",
    )

    # Calculate and annotate YoY growth
    for i, (v23, v24) in enumerate(zip(data_2023, data_2024)):
        if v24 > 0:
            growth = ((v24 - v23) / v23) * 100
            color = "green" if growth > 0 else "red"
            plt.text(
                i + width / 2,
                v24 + 3,
                f"+{growth:.0f}%" if growth > 0 else f"{growth:.0f}%",
                ha="center",
                fontsize=8,
                color=color,
                fontweight="bold",
            )

    plt.title("Year-over-Year Sales Comparison", fontsize=16, fontweight="bold")
    plt.xlabel("Month")
    plt.ylabel("Sales ($K)")
    plt.xticks(x, months)
    plt.legend()
    plt.grid(True, alpha=0.3, axis="y")
    plt.tight_layout()
    plt.savefig("yoy_comparison.png", dpi=150)
    plt.show()


create_yoy_comparison(months, sales_2023, sales_2024)
```

---

### Exercise 2: Regional Performance Dashboard

**Business Scenario:** The VP of Sales wants a regional comparison dashboard. She needs to see which of five regions is performing best this quarter, comparing actual revenue to target. A grouped or stacked bar chart will make it easy to spot over/under-performers at a glance.

**Your Task:**

1. Create a grouped bar chart comparing actual vs. target revenue for 5 regions
2. Color bars so "actual" and "target" are visually distinct
3. Annotate bars with their values for easy reading
4. Add a title, labels, and legend

**Expected Output:** A side-by-side bar chart with 5 region groups, each group having 2 bars (actual in blue, target in orange), with the region names on the x-axis and revenue on the y-axis.

```python
import matplotlib.pyplot as plt
import numpy as np

regions = ["North", "South", "East", "West"]
revenue = [450000, 380000, 520000, 290000]
growth = [12, -5, 18, 3]  # YoY growth percentage
employees = [45, 38, 52, 29]


def create_regional_dashboard(regions, revenue, growth, employees):
    """Create multi-metric regional performance dashboard."""
    fig, axes = plt.subplots(1, 3, figsize=(16, 5))

    # Chart 1: Revenue bars
    colors = ["#4CAF50" if g > 0 else "#F44336" for g in growth]
    bars = axes[0].bar(regions, revenue, color=colors, edgecolor="black")
    for bar, val in zip(bars, revenue):
        axes[0].text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 10000,
            f"${val / 1000:.0f}K",
            ha="center",
            fontweight="bold",
        )
    axes[0].set_title("Revenue by Region", fontweight="bold")
    axes[0].set_ylabel("Revenue ($)")
    axes[0].set_ylim(0, max(revenue) * 1.15)

    # Chart 2: Growth bars (can be negative)
    colors = ["#4CAF50" if g > 0 else "#F44336" for g in growth]
    bars = axes[1].bar(regions, growth, color=colors, edgecolor="black")
    axes[1].axhline(0, color="black", linewidth=0.5)
    for bar, val in zip(bars, growth):
        offset = 1 if val > 0 else -3
        axes[1].text(
            bar.get_x() + bar.get_width() / 2,
            val + offset,
            f"{val:+d}%",
            ha="center",
            fontweight="bold",
        )
    axes[1].set_title("YoY Growth Rate", fontweight="bold")
    axes[1].set_ylabel("Growth (%)")

    # Chart 3: Revenue per employee (efficiency)
    efficiency = [r / e for r, e in zip(revenue, employees)]
    axes[2].barh(regions, efficiency, color="#2196F3", edgecolor="black")
    for i, val in enumerate(efficiency):
        axes[2].text(val + 200, i, f"${val:,.0f}", va="center", fontweight="bold")
    axes[2].set_title("Revenue per Employee", fontweight="bold")
    axes[2].set_xlabel("Revenue/Employee ($)")
    axes[2].set_xlim(0, max(efficiency) * 1.15)

    plt.suptitle(
        "Regional Performance Dashboard - Q3 2024",
        fontsize=18,
        fontweight="bold",
        y=1.02,
    )
    plt.tight_layout()
    plt.savefig("regional_dashboard.png", dpi=150, bbox_inches="tight")
    plt.show()


create_regional_dashboard(regions, revenue, growth, employees)
```

---

### Exercise 3: Distribution Analysis

**Business Scenario:** HR wants to understand the distribution of employee salaries by department. Are salaries tightly clustered or widely spread? Are there outliers? A histogram or box plot will reveal the shape of each department's pay distribution.

**Your Task:**

1. Create a histogram for one department's salary distribution
2. Add a box plot alongside it (use subplots)
3. Annotate the mean and median lines on the histogram
4. Describe in a comment what the shape tells you about the data

**Expected Output:** A 2-panel figure (1 row, 2 columns): left panel is a histogram with mean/median lines annotated, right panel is a box plot showing quartiles and any outlier points.

```python
import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)

# Generate realistic order value distributions
website_orders = np.random.exponential(75, 500)  # Skewed right (many small orders)
enterprise_orders = np.random.normal(5000, 1500, 100)  # Normal (large contracts)


def compare_distributions(data1, data2, label1, label2):
    """Compare two distributions with statistics overlay."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Website orders
    axes[0].hist(data1, bins=30, edgecolor="black", color="#2196F3", alpha=0.7)
    axes[0].axvline(
        np.mean(data1),
        color="red",
        linestyle="--",
        linewidth=2,
        label=f"Mean: ${np.mean(data1):,.0f}",
    )
    axes[0].axvline(
        np.median(data1),
        color="green",
        linestyle="-.",
        linewidth=2,
        label=f"Median: ${np.median(data1):,.0f}",
    )
    axes[0].set_title(f"{label1} Order Distribution", fontweight="bold")
    axes[0].set_xlabel("Order Value ($)")
    axes[0].set_ylabel("Frequency")
    axes[0].legend()

    # Enterprise orders
    axes[1].hist(data2, bins=20, edgecolor="black", color="#FF9800", alpha=0.7)
    axes[1].axvline(
        np.mean(data2),
        color="red",
        linestyle="--",
        linewidth=2,
        label=f"Mean: ${np.mean(data2):,.0f}",
    )
    axes[1].axvline(
        np.median(data2),
        color="green",
        linestyle="-.",
        linewidth=2,
        label=f"Median: ${np.median(data2):,.0f}",
    )
    axes[1].set_title(f"{label2} Order Distribution", fontweight="bold")
    axes[1].set_xlabel("Order Value ($)")
    axes[1].set_ylabel("Frequency")
    axes[1].legend()

    # Add annotations about distribution shape
    axes[0].text(
        0.95,
        0.95,
        "Right-skewed\n(many small orders)",
        transform=axes[0].transAxes,
        ha="right",
        va="top",
        bbox=dict(boxstyle="round", facecolor="wheat"),
    )
    axes[1].text(
        0.95,
        0.95,
        "Normal distribution\n(centered around mean)",
        transform=axes[1].transAxes,
        ha="right",
        va="top",
        bbox=dict(boxstyle="round", facecolor="wheat"),
    )

    plt.suptitle("Order Value Distribution Comparison", fontsize=16, fontweight="bold")
    plt.tight_layout()
    plt.savefig("distribution_comparison.png", dpi=150)
    plt.show()


compare_distributions(website_orders, enterprise_orders, "Website", "Enterprise")
```

---

## Mastery Check

### Question 1: Chart Selection

You need to show how five product categories contribute to total revenue. What chart should you use?

<details>
<summary>Click for Answer</summary>

**Pie chart** is appropriate here because:

- You have 5 categories (≤5 is the rule)
- You're showing part-to-whole relationship
- Readers want to see percentages

**Alternative**: A horizontal bar chart sorted by value would work too and is often easier to read.

```python
# Pie chart
plt.pie(values, labels=categories, autopct="%1.1f%%")

# Or horizontal bar (often clearer)
plt.barh(categories, values)
```

**Don't use pie charts** when:

- More than 5-6 categories
- Values are very similar (hard to compare slice sizes)
- Showing changes over time

</details>

---

### Question 2: Axis Manipulation

A bar chart shows sales from 50 to 60 units, but the y-axis starts at 48. Why is this problematic?

<details>
<summary>Click for Answer</summary>

**This is misleading visualization.** By not starting at zero, the visual differences are exaggerated.

**The problem:**

- A bar at 60 looks ~6x taller than a bar at 50 (12 units vs 2 units on truncated axis)
- In reality, 60 is only 20% more than 50

**Best practice:**

```python
# BAD: Truncated axis
plt.ylim(48, 62)  # Exaggerates differences

# GOOD: Start at zero
plt.ylim(0, 65)  # Accurate representation
```

**Exception**: Line charts can use truncated axes when showing trends, but should be clearly labeled.

</details>

---

### Question 3: Figure Saving

What's wrong with `plt.savefig("chart.png")` for a presentation?

<details>
<summary>Click for Answer</summary>

**Issues:**

1. **Low resolution** - Default DPI is 100, which looks pixelated on projectors
2. **May crop content** - Tight layout not guaranteed
3. **May have wrong background** - Could be transparent or wrong color

**Better approach:**

```python
plt.savefig(
    "chart.png",
    dpi=300,  # High resolution
    bbox_inches="tight",  # Include all elements
    facecolor="white",  # White background
    edgecolor="none",
)  # No border
```

For different uses:

- Presentations: 300 DPI
- Web: 150 DPI
- Print: 300-600 DPI

</details>

---

### Question 4: Debugging Challenge

This code should create a bar chart, but nothing appears. Find the bug:

```python
import matplotlib.pyplot as plt

categories = ["A", "B", "C"]
values = [10, 20, 15]

plt.bar(categories, values)
# nothing appears
```

<details>
<summary>Click for Answer</summary>

**Missing `plt.show()`**

The plot is created but never displayed. Add:

```python
plt.bar(categories, values)
plt.show()  # Required to display the plot
```

**Other common issues:**

- In Jupyter: Use `%matplotlib inline` at the start
- Backend not set: `matplotlib.use('TkAgg')` before importing pyplot
- Running in script without display: Save to file instead with `plt.savefig()`

</details>

---

### Question 5: Design Scenario

You need to create a monthly report showing: (1) revenue trend, (2) revenue by category, (3) top 10 customers. How would you structure this as a single figure?

<details>
<summary>Click for Answer</summary>

**Use a 2x2 subplot layout:**

```python
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Top left: Revenue trend (line chart)
axes[0, 0].plot(months, revenue, marker="o")
axes[0, 0].set_title("Monthly Revenue Trend")

# Top right: Category breakdown (pie or bar)
axes[0, 1].bar(categories, values)
axes[0, 1].set_title("Revenue by Category")

# Bottom left: Top 10 customers (horizontal bar)
axes[1, 0].barh(customer_names, customer_revenue)
axes[1, 0].set_title("Top 10 Customers")

# Bottom right: Summary KPIs or leave as text
axes[1, 1].text(
    0.5,
    0.5,
    f"Total: ${total:,}\nGrowth: {growth}%",
    ha="center",
    va="center",
    fontsize=20,
)
axes[1, 1].set_title("Key Metrics")
axes[1, 1].axis("off")

plt.suptitle("Monthly Revenue Report - October 2024", fontsize=18)
plt.tight_layout()
```

**Design tips:**

- Keep related metrics adjacent
- Use consistent color scheme
- Add a main title to tie it together
- Leave whitespace for readability

</details>

---

## Summary

Today you learned:

- ✅ Create line charts for trends, bar charts for comparisons
- ✅ Build histograms to show distributions
- ✅ Use scatter plots to reveal relationships
- ✅ Customize colors, labels, and styling
- ✅ Create multi-panel dashboards with subplots
- ✅ Choose the right chart for any business question

**Tomorrow**: Advanced visualization with Seaborn—statistical graphics with beautiful defaults.
