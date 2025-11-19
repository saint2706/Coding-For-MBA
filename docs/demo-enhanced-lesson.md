# Demo: Enhanced Lesson Page

This is a demonstration of what an enhanced lesson page would look like with all the new features.

!!! info "Lesson Overview" **Estimated Time**: 25 minutes\
**Difficulty**: Intermediate\
**Prerequisites**: Day 22 (NumPy)\
**Tags**: python-basics, data-analysis

______________________________________________________________________

## Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand core concepts
- ✅ Apply techniques in real scenarios
- ✅ Build practical solutions

______________________________________________________________________

## Interactive Notebooks

Run this lesson's code interactively in your browser:

.md-button--primary }

installation or server required! Note: First launch may take a moment to load.

### Or Launch in Cloud

Run on Binder (cloud-based Jupyter environment):

[![Launch in Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_23_Pandas/pandas.ipynb)

______________________________________________________________________

## Lesson Content

### Introduction

Welcome to this enhanced lesson! You can now interact with code directly in your browser.

### Interactive Example

Try running this Python code:

<div class="interactive-code">
```python
# Calculate business metrics
revenue = 1_000_000
costs = 750_000
profit = revenue - costs
margin = (profit / revenue) * 100

print(f"Revenue: ${revenue:,}") print(f"Costs: ${costs:,}") print(f"Profit: ${profit:,}")
print(f"Margin: {margin:.1f}%")

````
</div>

!!! note "Interactive Code"
    Click the "▶ Run Code" button above to execute this code in your browser!
    You can also edit the code and try different values.

### Working with Data

Here's another interactive example with data analysis:

<div class="interactive-code">
```python
# Analyze sales data
sales = [45000, 52000, 48000, 61000, 55000]
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May']

# Calculate statistics
average = sum(sales) / len(sales)
total = sum(sales)
growth = ((sales[-1] - sales[0]) / sales[0]) * 100

print(f"Total Sales: ${total:,}")
print(f"Average Monthly Sales: ${average:,.0f}")
print(f"Growth (Jan to May): {growth:.1f}%")

# Find best month
best_month_idx = sales.index(max(sales))
print(f"Best Month: {months[best_month_idx]} (${max(sales):,})")
````

</div>

### Code Blocks

Regular code blocks still work as before:

```python
def calculate_roi(investment, return_value):
    """Calculate Return on Investment."""
    roi = ((return_value - investment) / investment) * 100
    return roi

# Example
investment = 10000
return_value = 15000
roi = calculate_roi(investment, return_value)
print(f"ROI: {roi:.1f}%")
```

______________________________________________________________________

## Practice Exercises

### Exercise 1: Sales Analysis

Use the interactive console below to solve this problem:

**Task**: Calculate the quarterly revenue from these monthly figures:

- Q1: Jan ($45k), Feb ($52k), Mar ($48k)
- Q2: Apr ($61k), May ($55k), Jun ($58k)

<div id="exercise1"></div>
<script>
if (typeof createInteractiveWidget !== 'undefined') {
  createInteractiveWidget(
    document.getElementById('exercise1'),
    '# Calculate quarterly revenue\nq1_sales = [45000, 52000, 48000]\nq2_sales = [61000, 55000, 58000]\n\n# Your code here\n'
  );
}
</script>

??? success "Solution" \`\`\`python q1_sales = \[45000, 52000, 48000\] q2_sales = \[61000, 55000,
58000\]

````
q1_total = sum(q1_sales)
q2_total = sum(q2_sales)

print(f"Q1 Revenue: ${q1_total:,}")
print(f"Q2 Revenue: ${q2_total:,}")
print(f"Total: ${q1_total + q2_total:,}")

growth = ((q2_total - q1_total) / q1_total) * 100
print(f"Q2 Growth: {growth:.1f}%")
```
````

______________________________________________________________________

## Key Takeaways

!!! success "What You Learned" - 📊 How to analyze business data with Python - 💻 Interactive coding
in your browser - 📈 Calculating key business metrics - 🎯 Practical applications for MBA scenarios

______________________________________________________________________

## What's Next?

### Prerequisites for This Lesson

- [Day 22: NumPy Fundamentals](lessons/day-22-numpy.md)
- [Day 21: Virtual Environments](lessons/day-21-virtual-environments.md)

### Continue Your Journey

- [Day 24: Advanced Pandas](lessons/day-24-pandas-advanced.md)
- [Day 25: Data Cleaning](lessons/day-25-data-cleaning.md)

______________________________________________________________________

## Additional Materials

???+ example "pandas.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_23_Pandas/pandas.py)

````
```python title="pandas.py"
"""Introduction to Pandas for data analysis."""

import pandas as pd
import numpy as np

def create_sample_dataframe():
    """Create a sample sales DataFrame."""
    data = {
        'Product': ['Laptop', 'Phone', 'Tablet', 'Monitor'],
        'Price': [1200, 800, 500, 300],
        'Quantity': [10, 25, 15, 30],
        'Region': ['North', 'South', 'East', 'West']
    }
    return pd.DataFrame(data)

def calculate_revenue(df):
    """Calculate total revenue per product."""
    df['Revenue'] = df['Price'] * df['Quantity']
    return df

if __name__ == '__main__':
    df = create_sample_dataframe()
    df = calculate_revenue(df)
    print(df)
```
````

### Download Files

- [📓 Download Notebook](https://github.com/saint2706/Coding-For-MBA/raw/main/Day_23_Pandas/pandas.ipynb)
- [🐍 Download Python Script](https://github.com/saint2706/Coding-For-MBA/raw/main/Day_23_Pandas/pandas.py)

______________________________________________________________________

## Feedback

Was this lesson helpful?

<div style="display: flex; gap: 1rem; margin: 1rem 0;">
  <button onclick="alert('Thank you for your feedback!')" style="padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">👍 Yes, very helpful!</button>
  <button onclick="alert('Thanks for letting us know. We\'ll work on improving this lesson.')" style="padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">👎 Could be better</button>
</div>

______________________________________________________________________

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin: 2rem 0;">
  <h3 style="color: white; margin-top: 0;">🎓 Ready to Practice?</h3>
  <p>Try the complete lesson in an interactive environment!</p>
  <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
    <a href="https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_23_Pandas/pandas.ipynb" style="display: inline-block; padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.2); color: white; text-decoration: none; border: 2px solid white; border-radius: 8px; font-weight: 600;">Launch Binder</a>
  </div>
</div>

______________________________________________________________________

*Last updated: 2024-10-13 | Reading time: ~25 minutes*
