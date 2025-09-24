# 📘 Day 21: Interactive Visualization with Plotly

Static charts are good for reports, but in the modern era of business intelligence, users expect to be able to *interact* with their data. They want to hover over data points to get more details, zoom into specific time ranges, and filter data on the fly.

For this, we use **Plotly**. Plotly is a powerful Python library for creating interactive, publication-quality graphs online. The charts can be displayed in Python notebooks, saved as HTML files, or embedded in web applications and dashboards.

## Plotly Express: The Easy Way to Plot

Plotly is a large library, but its `plotly.express` module (standardly imported as `px`) is a simple, high-level interface for creating entire figures at once. It's the recommended starting point for most use cases.

The syntax for `plotly.express` is very similar to Seaborn's, which makes it easy to learn.

## Creating Interactive Charts

Let's see how to create interactive versions of the charts we made previously. When you run this code, Plotly will typically open the chart in your web browser. You can then interact with it.

### 1. Interactive Bar Chart

```python
import plotly.express as px

# Assuming 'df' is a DataFrame with 'Region' and 'Revenue'
# We first group the data to get total revenue per region
region_revenue = df.groupby('Region')['Revenue'].sum().reset_index()

fig = px.bar(region_revenue, x='Region', y='Revenue', title='Total Revenue by Region')
fig.show()
```
**Interaction:** Hover over the bars to see the exact revenue for each region.

### 2. Interactive Line Chart

```python
# Assuming 'daily_revenue' is a DataFrame with 'Date' and 'Revenue'
fig = px.line(daily_revenue, x='Date', y='Revenue', title='Daily Revenue Trend')
fig.show()
```
**Interaction:** Hover along the line to see the date and revenue for any point. Click and drag to zoom into a specific time period. Double-click to zoom back out.

### 3. Interactive Scatter Plot

```python
# Assuming 'df' has 'Price' and 'Units Sold'
fig = px.scatter(df, x='Price', y='Units Sold', color='Product', hover_data=['Region'], title='Price vs. Units Sold')
fig.show()
```
**Interaction:** Hover over any point to see the Price, Units Sold, Product, and Region for that specific transaction. Click on items in the legend to toggle product categories on and off.

## Saving Your Plot

You can save your interactive chart as a standalone HTML file that anyone can open in their web browser.

```python
# After creating your figure with px...
fig.write_html("interactive_revenue_chart.html")
```

## 💻 Exercises: Day 21

For these exercises, you will use the cleaned `sales_data.csv` from Day 17.

1.  **Interactive Sales by Product:**
    *   Load the cleaned sales data.
    *   Group the data by `Product` to get the sum of `Revenue` for each product.
    *   Create an interactive bar chart using `plotly.express` that shows the total `Revenue` for each `Product`.
    *   Give your chart a descriptive title.
    *   When you hover over a bar, it should show the Product and its total Revenue.

2.  **Interactive Revenue vs. Units Sold:**
    *   Load the cleaned sales data.
    *   Create an interactive scatter plot showing `Revenue` on the y-axis and `Units Sold` on the x-axis.
    *   Color the points on the scatter plot by `Region`.
    *   Give the plot a title.
    *   Save the resulting chart to an HTML file named `revenue_scatterplot.html`.

🎉 **Incredible!** You've now stepped into the world of interactive data visualization. Being able to create and share plots that allow stakeholders to explore the data for themselves is a highly valuable skill for any modern analyst.
