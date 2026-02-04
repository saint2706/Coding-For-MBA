"""Reusable helpers for BI visualization and dashboard design demos."""

from __future__ import annotations

from typing import Dict, List, Tuple

# Matplotlib is used for palette demonstrations where traces are not required.
import matplotlib.pyplot as plt
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.graph_objs import Figure

BASICS_CATEGORY = "Visualization basics"
DESIGN_GUARDRAILS_CATEGORY = "Design guardrails"

BASICS_TITLES: Tuple[str, ...] = (
    "Visualization Fundamentals",
    "Barplot",
    "Lineplot",
    "Scatterplot",
    "Heatmap",
    "Histogram",
    "Map",
)

DESIGN_TITLES: Tuple[str, ...] = (
    "Color theory",
    "Misleading charts",
    "Accessibility",
    "Mobile-responsiveness",
    "Design principles",
    "Dashboard Design",
)


def build_visualization_topics_df() -> pd.DataFrame:
    """Return a curriculum outline that groups visualization titles by theme."""

    records: List[Dict[str, str]] = []
    for title in BASICS_TITLES:
        records.append(
            {
                "title": title,
                "category": BASICS_CATEGORY,
            }
        )

    for title in DESIGN_TITLES:
        records.append(
            {
                "title": title,
                "category": DESIGN_GUARDRAILS_CATEGORY,
            }
        )

    df = pd.DataFrame(records)
    return df


# --- Plotly helpers -------------------------------------------------------


def create_barplot() -> Figure:
    """Return a simple Plotly bar chart showing category totals."""
    data = pd.DataFrame(
        {
            "Department": ["Sales", "Marketing", "Finance"],
            "Revenue": [120, 80, 95],
        }
    )
    fig = px.bar(data, x="Department", y="Revenue", title="Revenue by Department")
    return fig


def create_lineplot() -> Figure:
    """Return a Plotly line chart that depicts a trend over time."""
    data = pd.DataFrame(
        {
            "Month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "Active Users": [120, 135, 150, 165, 170, 180],
        }
    )
    fig = px.line(
        data, x="Month", y="Active Users", markers=True, title="Monthly Active Users"
    )
    return fig


def create_scatterplot() -> Figure:
    """Return a scatter plot that compares revenue versus marketing spend."""
    data = pd.DataFrame(
        {
            "Marketing Spend": [10, 20, 30, 40, 50, 60],
            "Revenue": [30, 42, 55, 63, 80, 92],
        }
    )
    fig = px.scatter(
        data,
        x="Marketing Spend",
        y="Revenue",
        trendline="ols",
        title="Marketing Spend vs Revenue",
    )
    return fig


def create_heatmap() -> Figure:
    """Return a heatmap that highlights regional engagement intensity."""
    data = pd.DataFrame(
        {
            "Region": ["North", "South", "East", "West"],
            "Channel A": [70, 55, 40, 65],
            "Channel B": [60, 50, 45, 55],
            "Channel C": [50, 45, 35, 40],
        }
    )
    fig = go.Figure(
        data=go.Heatmap(
            z=data.drop(columns="Region").values,
            x=data.columns[1:],
            y=data["Region"],
            colorscale="Blues",
            colorbar_title="Engagement",
        )
    )
    fig.update_layout(title="Engagement Heatmap by Region and Channel")
    return fig


def create_histogram() -> Figure:
    """Return a histogram that shows distribution of order sizes."""
    data = pd.DataFrame(
        {
            "Order Size": [5, 8, 12, 7, 9, 15, 4, 11, 6, 10, 13, 7, 9, 5],
        }
    )
    fig = px.histogram(
        data, x="Order Size", nbins=5, title="Distribution of Order Sizes"
    )
    fig.update_traces(marker_color="#636EFA")
    return fig


def create_map() -> Figure:
    """Return a simple choropleth map using Gapminder GDP per capita data."""
    gapminder = px.data.gapminder().query("year == 2007")
    subset = gapminder[gapminder["continent"].isin(["Europe", "Americas"])]
    fig = px.choropleth(
        subset,
        locations="iso_alpha",
        color="gdpPercap",
        hover_name="country",
        scope="world",
        title="GDP per Capita (2007)",
        color_continuous_scale="Viridis",
    )
    return fig


# --- Matplotlib helpers ---------------------------------------------------


def create_color_palette_demo() -> Tuple[plt.Figure, plt.Axes]:
    """Showcase accessible color choices with Matplotlib swatches."""
    fig, ax = plt.subplots(figsize=(6, 2))
    colors = ["#003f5c", "#58508d", "#bc5090", "#ff6361", "#ffa600"]
    ax.imshow(
        [list(range(len(colors)))], cmap=plt.matplotlib.colors.ListedColormap(colors)
    )
    ax.set_xticks(range(len(colors)))
    ax.set_xticklabels(["Primary", "Secondary", "Accent 1", "Accent 2", "Accent 3"])
    ax.set_yticks([])
    ax.set_title("Accessible Palette Demo")
    fig.tight_layout()
    return fig, ax


__all__ = [
    "BASICS_CATEGORY",
    "DESIGN_GUARDRAILS_CATEGORY",
    "BASICS_TITLES",
    "DESIGN_TITLES",
    "build_visualization_topics_df",
    "create_barplot",
    "create_lineplot",
    "create_scatterplot",
    "create_heatmap",
    "create_histogram",
    "create_map",
    "create_color_palette_demo",
]
