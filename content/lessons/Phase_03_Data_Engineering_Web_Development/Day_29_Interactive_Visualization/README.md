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
outcomes: [Create interactive web-ready charts, Build zoomable visualizations, Export to HTML]
---

# 🎯 Day 29: Interactive Visualization with Plotly

> *"Static charts show data. Interactive charts let users explore it."*

---

## The "Never-Coded" Bridge

**Imagine presenting to executives.** With static charts, you show one view. When someone asks "What about Q2?" or "Can we zoom into that spike?", you scramble for different slides.

**With Plotly:** The CFO hovers to see exact values. The VP zooms into their region. One visualization answers multiple questions.

**Real-world applications:**

- **Dashboards**: Zoom into date ranges, filter by category
- **Presentations**: Hover for details without slide changes
- **Analysis**: Explore outliers by clicking points

---

## The Technical Deep Dive

### Plotly Express Basics

```python
import plotly.express as px

df = px.data.gapminder()

fig = px.scatter(
    df.query("year == 2007"),
    x="gdpPercap",
    y="lifeExp",
    size="pop",
    color="continent",
    hover_name="country",
    log_x=True,
    title="GDP vs Life Expectancy (2007)",
)
fig.show()
```

### Common Chart Types

```python
import plotly.express as px

df = px.data.gapminder()

# Line chart
fig = px.line(
    df.query("country == 'United States'"),
    x="year",
    y="gdpPercap",
    title="US GDP Over Time",
)

# Bar chart
fig = px.bar(
    df.query("year == 2007 and continent == 'Europe'").nlargest(10, "pop"),
    x="country",
    y="pop",
    title="European Populations",
)

# Histogram
fig = px.histogram(df, x="lifeExp", nbins=30, title="Life Expectancy Distribution")

# Box plot
fig = px.box(df, x="continent", y="lifeExp", title="Life Expectancy by Continent")
```

### Customization

```python
fig = px.scatter(
    df.query("year == 2007"), x="gdpPercap", y="lifeExp", color="continent"
)

fig.update_layout(
    title=dict(text="Global Development", font=dict(size=24)),
    xaxis_title="GDP per Capita ($)",
    yaxis_title="Life Expectancy (years)",
    template="plotly_white",
)
fig.update_traces(marker=dict(opacity=0.7))
fig.show()
```

### Animations

```python
fig = px.scatter(
    df,
    x="gdpPercap",
    y="lifeExp",
    animation_frame="year",
    animation_group="country",
    size="pop",
    color="continent",
    hover_name="country",
    range_x=[100, 100000],
    range_y=[25, 90],
    log_x=True,
)
fig.show()
```

### Saving Charts

```python
fig.write_html("chart.html")  # Interactive HTML
fig.write_image("chart.png", scale=2)  # Static image (needs kaleido)
```

---

## Senior-Level Insights

### Performance Tips

| Scenario        | Solution                     |
| --------------- | ---------------------------- |
| >10K points     | Use `render_mode="webgl"`    |
| Slow animations | Reduce frames, simplify data |
| Many traces     | Combine with color mapping   |

### When to Use Plotly vs Matplotlib

| Use Case               | Recommendation     |
| ---------------------- | ------------------ |
| Static publication     | Matplotlib/Seaborn |
| Web dashboards         | Plotly             |
| Exploratory analysis   | Plotly             |
| Complex custom layouts | Matplotlib         |

---

## Hands-on Lab

### Exercise 1: Sales Dashboard

```python
import plotly.express as px
import pandas as pd
import numpy as np

np.random.seed(42)
dates = pd.date_range("2024-01-01", periods=90, freq="D")
df = pd.DataFrame(
    {
        "date": dates,
        "revenue": np.cumsum(np.random.randn(90) * 500 + 300),
        "region": np.random.choice(["North", "South", "East"], 90),
    }
)

# Revenue trend
fig = px.line(df, x="date", y="revenue", title="Daily Revenue")
fig.show()

# By region
fig = px.bar(
    df.groupby("region")["revenue"].sum().reset_index(),
    x="region",
    y="revenue",
    color="region",
)
fig.show()
```

### Exercise 2: Time Series with Range Selector

```python
import plotly.express as px
import pandas as pd
import numpy as np

dates = pd.date_range("2020-01-01", periods=365, freq="D")
df = pd.DataFrame({"date": dates, "value": np.cumsum(np.random.randn(365) * 10)})

fig = px.line(df, x="date", y="value", title="Interactive Time Series")
fig.update_xaxes(
    rangeslider_visible=True,
    rangeselector=dict(
        buttons=[
            dict(count=1, label="1M", step="month"),
            dict(count=3, label="3M", step="month"),
            dict(step="all", label="All"),
        ]
    ),
)
fig.show()
```

### Exercise 3: Animated Scatter

```python
import plotly.express as px

df = px.data.gapminder()
fig = px.scatter(
    df,
    x="gdpPercap",
    y="lifeExp",
    animation_frame="year",
    size="pop",
    color="continent",
    hover_name="country",
    log_x=True,
    range_x=[100, 100000],
    range_y=[25, 90],
)
fig.write_html("animated_scatter.html")
fig.show()
```

---

## Mastery Check

### Question 1: Interactivity Benefits

When is an interactive chart clearly better than static?

<details>
<summary>Click for Answer</summary>

- Executive dashboards (self-service exploration)
- Large datasets (zoom to find patterns)
- Client presentations (filter live for their segment)
- Exploratory analysis (hover to identify outliers)

</details>

### Question 2: Performance

Your 100K point scatter is slow. What helps?

<details>
<summary>Click for Answer</summary>

```python
fig = px.scatter(df, x="x", y="y", render_mode="webgl")
# Or reduce data with sampling
df_sample = df.sample(10000)
```

</details>

### Question 3: Animation vs Facets

When use animation_frame vs faceted charts?

<details>
<summary>Click for Answer</summary>

**Animation**: Showing change over time, storytelling
**Facets**: Need to compare states simultaneously, print output

</details>

### Question 4: HTML Export Bug

Chart shows in Jupyter but HTML is blank after `fig.write_html("chart.html", include_plotlyjs=False)`. Why?

<details>
<summary>Click for Answer</summary>

No JavaScript included. Fix: `include_plotlyjs=True` or `include_plotlyjs="cdn"`

</details>

### Question 5: Design Scenario

Building 5-chart dashboard. How organize?

<details>
<summary>Click for Answer</summary>

- KPIs at top
- Primary trend chart (large)
- Supporting details (smaller)
- Consistent filtering across charts
- Use Dash for linked interactivity

</details>

---

## Summary

- ✅ Plotly Express for quick interactive charts
- ✅ Hover, zoom, pan out of the box
- ✅ Animations show changes over time
- ✅ Export to HTML for sharing
- ✅ Use webgl for large datasets

**Tomorrow**: Web scraping to collect data from websites.
