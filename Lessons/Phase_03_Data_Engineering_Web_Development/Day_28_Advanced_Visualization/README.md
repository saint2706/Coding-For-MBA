---
day: 28
title: "Advanced Visualization"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "advanced-visualization"
duration: 50
difficulty: "intermediate"
tags: [python, seaborn, visualization, statistics]
concepts: [seaborn plots, statistical visualization, heatmaps, pair plots]
prerequisites: [27]
outcomes: [Create publication-quality charts, Visualize statistical relationships, Build complex multi-panel figures]
---

# 🎯 Day 28: Advanced Visualization with Seaborn

> *"Seaborn: where statistics meets beautiful charts."*

---

## The "Never-Coded" Bridge

Matplotlib gives you control. Seaborn gives you beauty and intelligence—it understands statistics and creates publication-ready visuals with less code.

---

## The Technical Deep Dive

### Seaborn Basics

```python
import seaborn as sns
import pandas as pd
import matplotlib.pyplot as plt

# Set theme
sns.set_theme(style="whitegrid")

# Sample dataset
tips = sns.load_dataset("tips")
```

### Distribution Plots

```python
# Histogram with KDE
sns.histplot(tips["total_bill"], kde=True)

# KDE only
sns.kdeplot(tips["total_bill"], fill=True)

# Box plot (shows median, quartiles, outliers)
sns.boxplot(x="day", y="total_bill", data=tips)

# Violin plot (distribution shape)
sns.violinplot(x="day", y="total_bill", data=tips)
```

### Categorical Plots

```python
# Count plot
sns.countplot(x="day", data=tips)

# Bar plot with aggregation
sns.barplot(x="day", y="total_bill", data=tips, estimator="mean")

# Strip plot (individual points)
sns.stripplot(x="day", y="total_bill", data=tips, jitter=True)
```

### Relationship Plots

```python
# Scatter with regression line
sns.regplot(x="total_bill", y="tip", data=tips)

# Scatter with categories
sns.scatterplot(x="total_bill", y="tip", hue="smoker", data=tips)

# Pair plot (all pairwise relationships)
sns.pairplot(tips, hue="smoker")
```

### Heatmaps

```python
# Correlation heatmap
corr = tips[["total_bill", "tip", "size"]].corr()
sns.heatmap(corr, annot=True, cmap="coolwarm", vmin=-1, vmax=1)

# Pivot table heatmap
pivot = tips.pivot_table(values="tip", index="day", columns="time", aggfunc="mean")
sns.heatmap(pivot, annot=True, fmt=".2f", cmap="YlGnBu")
```

### FacetGrid (Multi-panel)

```python
# Create grid of plots
g = sns.FacetGrid(tips, col="time", row="smoker")
g.map(sns.histplot, "total_bill")

# Same with relplot
sns.relplot(x="total_bill", y="tip", col="time", hue="smoker", data=tips)
```

---

## Hands-on Lab

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset("tips")

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# 1. Box plot by day
sns.boxplot(x="day", y="total_bill", hue="time", data=tips, ax=axes[0, 0])
axes[0, 0].set_title("Bill Distribution by Day")

# 2. Scatter with regression
sns.regplot(x="total_bill", y="tip", data=tips, ax=axes[0, 1])
axes[0, 1].set_title("Tips vs Bill Amount")

# 3. Heatmap
corr = tips[["total_bill", "tip", "size"]].corr()
sns.heatmap(corr, annot=True, cmap="coolwarm", ax=axes[1, 0])
axes[1, 0].set_title("Correlation Matrix")

# 4. Count by day and time
sns.countplot(x="day", hue="time", data=tips, ax=axes[1, 1])
axes[1, 1].set_title("Visits by Day and Time")

plt.tight_layout()
plt.savefig("tips_analysis.png", dpi=150)
plt.show()
```

---

## Mastery Check

**Q1**: Show distribution with statistics: `sns.boxplot()`

**Q2**: Correlation visualization: `sns.heatmap(corr, annot=True)`

**Q3**: Scatter with trend line: `sns.regplot()`

---

## Summary

- ✅ Seaborn simplifies statistical visualization
- ✅ Box/violin plots show distributions
- ✅ Heatmaps reveal correlations
- ✅ FacetGrid creates multi-panel layouts

**Tomorrow**: Interactive visualization with Plotly.
