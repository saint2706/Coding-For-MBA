---
day: 26
title: "Statistics for Business"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "statistics-business"
duration: 55
difficulty: "intermediate"
tags: [python, statistics, analysis, numpy]
concepts: [descriptive statistics, distributions, correlation, hypothesis testing basics]
prerequisites: [22, 23]
outcomes: [Calculate descriptive statistics, Understand distributions, Interpret correlations]
---

# 🎯 Day 26: Statistics for Business

> *"Without data, you're just another person with an opinion." — W. Edwards Deming*

---

## The "Never-Coded" Bridge

Statistics answers business questions:
- "What's our average order value?" → Mean
- "What's a typical customer spend?" → Median
- "How spread out are our sales?" → Standard deviation
- "Does marketing spend affect revenue?" → Correlation

---

## The Technical Deep Dive

### Descriptive Statistics

```python
import numpy as np
import pandas as pd

sales = pd.Series([100, 150, 200, 180, 220, 300, 50, 175])

# Central tendency
sales.mean()      # Average: 171.88
sales.median()    # Middle value: 177.5
sales.mode()      # Most common (may be multiple)

# Spread
sales.std()       # Standard deviation
sales.var()       # Variance
sales.min(), sales.max()
sales.quantile([0.25, 0.5, 0.75])  # Quartiles

# Summary
sales.describe()
```

### When to Use Mean vs Median

| Scenario               | Use                           |
| ---------------------- | ----------------------------- |
| Symmetric data         | Mean                          |
| Skewed data (outliers) | Median                        |
| Salary analysis        | Median (outliers skew upward) |
| Test scores            | Mean (typically normal)       |

```python
incomes = [50000, 55000, 60000, 52000, 1000000]  # CEO outlier
np.mean(incomes)    # 243,400 (misleading!)
np.median(incomes)  # 55,000 (realistic)
```

### Correlation

```python
df = pd.DataFrame({
    "marketing_spend": [1000, 2000, 1500, 3000, 2500],
    "revenue": [10000, 18000, 14000, 28000, 22000]
})

# Correlation coefficient (-1 to 1)
df.corr()
# Strong positive: 0.7 to 1.0
# Weak: -0.3 to 0.3
# Strong negative: -1.0 to -0.7
```

### Distributions

```python
import numpy as np

# Normal distribution
normal_data = np.random.normal(loc=100, scale=15, size=1000)

# Uniform distribution
uniform_data = np.random.uniform(low=0, high=100, size=1000)

# Check normality (visual)
import matplotlib.pyplot as plt
plt.hist(normal_data, bins=30)
plt.title("Normal Distribution")
```

### Percentiles and Rankings

```python
df = pd.DataFrame({"sales": [100, 200, 150, 300, 250]})

# Percentile rank
df["percentile"] = df["sales"].rank(pct=True) * 100

# Top performers (above 75th percentile)
threshold = df["sales"].quantile(0.75)
top_performers = df[df["sales"] >= threshold]
```

---

## Hands-on Lab

```python
import pandas as pd
import numpy as np

# Sales data
np.random.seed(42)
df = pd.DataFrame({
    "region": np.random.choice(["North", "South", "East", "West"], 100),
    "sales": np.random.normal(5000, 1500, 100),
    "marketing": np.random.uniform(500, 2000, 100)
})

# Descriptive stats by region
print(df.groupby("region")["sales"].agg(["mean", "median", "std"]))

# Correlation matrix
print(df[["sales", "marketing"]].corr())

# Find outliers (beyond 2 std)
mean, std = df["sales"].mean(), df["sales"].std()
outliers = df[(df["sales"] < mean - 2*std) | (df["sales"] > mean + 2*std)]
print(f"Outliers: {len(outliers)}")
```

---

## Mastery Check

**Q1**: When to use median over mean? When data has outliers/is skewed.

**Q2**: Correlation of 0.85 means? Strong positive relationship.

**Q3**: Get 90th percentile: `df["col"].quantile(0.90)`

---

## Summary

- ✅ Mean, median, mode for central tendency
- ✅ Std, variance, range for spread
- ✅ Correlation measures relationships
- ✅ Percentiles for ranking and thresholds

**Tomorrow**: Data visualization fundamentals.
