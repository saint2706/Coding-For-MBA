---
day: 29
title: "Interactive Visualization"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "interactive-visualization"
duration: 50
difficulty: "intermediate"
tags: [python, plotly, interactive, dashboards]
concepts: [Plotly basics, interactive charts, hover data, animations]
prerequisites: [27, 28]
outcomes: [Create interactive web-ready charts, Build zoomable/hoverable visualizations, Export to HTML]
---

# 🎯 Day 29: Interactive Visualization with Plotly

> *"Static charts show data. Interactive charts let users explore it."*

---

## The "Never-Coded" Bridge

Matplotlib makes images. Plotly makes experiences—charts you can zoom, hover, filter, and share as web pages.

---

## The Technical Deep Dive

### Plotly Express Basics

```python
import plotly.express as px
import pandas as pd

df = px.data.gapminder()

# Scatter plot
fig = px.scatter(df.query("year == 2007"), 
                 x="gdpPercap", y="lifeExp", 
                 size="pop", color="continent",
                 hover_name="country",
                 title="GDP vs Life Expectancy (2007)")
fig.show()
```

### Common Chart Types

```python
# Line chart
fig = px.line(df.query("country == 'United States'"), 
              x="year", y="gdpPercap", title="US GDP Over Time")

# Bar chart
fig = px.bar(df.query("year == 2007 and continent == 'Europe'"),
             x="country", y="pop", title="European Populations")

# Histogram
fig = px.histogram(df, x="lifeExp", nbins=30, title="Life Expectancy Distribution")

# Box plot
fig = px.box(df, x="continent", y="lifeExp", title="Life Expectancy by Continent")
```

### Customization

```python
fig = px.scatter(df.query("year == 2007"), 
                 x="gdpPercap", y="lifeExp",
                 color="continent", size="pop")

fig.update_layout(
    title=dict(text="Global Development", font=dict(size=24)),
    xaxis_title="GDP per Capita ($)",
    yaxis_title="Life Expectancy (years)",
    template="plotly_white"
)

fig.update_traces(marker=dict(opacity=0.7))
fig.show()
```

### Animations

```python
fig = px.scatter(df, x="gdpPercap", y="lifeExp",
                 animation_frame="year", animation_group="country",
                 size="pop", color="continent", hover_name="country",
                 range_x=[100, 100000], range_y=[25, 90],
                 log_x=True)
fig.show()
```

### Saving Charts

```python
# Save as HTML (interactive)
fig.write_html("chart.html")

# Save as image
fig.write_image("chart.png")
```

---

## Hands-on Lab

```python
import plotly.express as px
import pandas as pd
import numpy as np

# Sales data
np.random.seed(42)
df = pd.DataFrame({
    "date": pd.date_range("2024-01-01", periods=100),
    "region": np.random.choice(["North", "South", "East", "West"], 100),
    "sales": np.random.randint(1000, 10000, 100),
    "product": np.random.choice(["A", "B", "C"], 100)
})

# Interactive scatter
fig = px.scatter(df, x="date", y="sales", 
                 color="region", size="sales",
                 hover_data=["product"],
                 title="Daily Sales by Region")
fig.write_html("sales_interactive.html")
fig.show()
```

---

## Summary

- ✅ Plotly Express for quick interactive charts
- ✅ Hover, zoom, pan out of the box
- ✅ Animations show changes over time
- ✅ Export to HTML for sharing

**Tomorrow**: Web scraping to collect data from websites.
