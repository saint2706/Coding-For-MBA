Day 75 codifies the BI visualization fundamentals that analysts rely on to communicate
credibly, and it layers in the design guardrails that keep dashboards inclusive and
trustworthy. Use this lesson to practice building each core chart type while checking
your work against accessibility and storytelling heuristics.

## Learning objectives

- Differentiate when to use bar, line, scatter, heatmap, histogram, and map charts.
- Apply color, annotation, and layout techniques that reduce the risk of misleading
  insights.
- Stress test dashboards for accessibility, mobile responsiveness, and executive
  consumption.

## Assets

| File | Description |
| --- | --- |
| [`lesson.py`](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_75_BI_Visualization_and_Dashboard_Principles/lesson.py) | Walks through each chart helper and prints trace counts so you can confirm the setup in headless environments. |
| [`solutions.py`](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_75_BI_Visualization_and_Dashboard_Principles/solutions.py) | Exposes reusable helpers to build Plotly figures for every chart type plus a Matplotlib palette demo, and a curriculum outline DataFrame grouping fundamentals versus guardrails. |

Run the interactive demo:

```bash
python Day_75_BI_Visualization_and_Dashboard_Principles/lesson.py
```

## Visualization fundamentals

| Chart | When to use | Design do | Design don't |
| --- | --- | --- | --- |
| Bar | Compare discrete categories such as departmental revenue. | Sort bars, annotate totals, and start axes at zero. | Overload colors or rotate labels unless necessary. |
| Line | Show change over ordered time. | Highlight key turning points and label end values directly. | Mix unrelated measures on the same axis or truncate time spans. |
| Scatter | Reveal correlations between two measures. | Use consistent point sizes and call out notable clusters or outliers. | Combine more than two measures without encoding size/colour intentionally. |
| Heatmap | Contrast intensity across two categorical dimensions. | Keep the colour scale perceptually uniform and annotate extremes. | Use rainbow gradients or omit a legend. |
| Histogram | Understand distribution spread and skew. | Pick bin widths that match the audience's mental buckets. | Stack dissimilar distributions without faceting. |
| Map | Communicate geographic comparisons. | Add tooltips for values and provide context on projection or boundaries. | Map sparse data without normalising by population/area. |

## Design guardrails

- **Color theory:** Favor accessible palettes (see `create_color_palette_demo`) and test
  contrast ratios with WCAG guidelines.
- **Misleading charts:** Avoid dual axes with mismatched scales, truncated axes, and
  unnecessary 3D effects.
- **Accessibility:** Provide descriptive titles, alt text for exported images, and
  keyboard-friendly interactions.
- **Mobile-responsiveness:** Prototype small-screen layouts with stacked tiles and
  simplified navigation.
- **Design principles:** Use whitespace, alignment, and grouping to guide the reader's
  eye along the intended narrative.
- **Dashboard design:** Start with business questions, draft mockups before building,
  and iterate with stakeholders to validate usefulness.


## Additional Materials

???+ example "lesson.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_75_BI_Visualization_and_Dashboard_Principles/lesson.py)

    ```python title="lesson.py"
    """Demonstrations for BI visualization and dashboard design principles."""

    from __future__ import annotations

    from pprint import pprint

    from . import solutions as sol


    def showcase_curriculum() -> None:
        """Print the grouped curriculum titles for the day."""
        df = sol.build_visualization_topics_df()
        print("\nDay 75 curriculum outline:\n")
        pprint(df.to_dict(orient="records"))


    def showcase_plotly_demos() -> None:
        """Show the Plotly figure metadata for each chart helper."""
        chart_creators = {
            "Bar": sol.create_barplot,
            "Line": sol.create_lineplot,
            "Scatter": sol.create_scatterplot,
            "Heatmap": sol.create_heatmap,
            "Histogram": sol.create_histogram,
            "Map": sol.create_map,
        }

        for name, factory in chart_creators.items():
            fig = factory()
            print(
                f"\n{name} chart demo -> traces: {len(fig.data)}, layout title: {fig.layout.title.text}"
            )


    def showcase_matplotlib_palette() -> None:
        """Render the color palette demo in a headless-safe way."""
        fig, ax = sol.create_color_palette_demo()
        print(
            f"\nPalette demo ready -> title: {ax.get_title()}, swatches: {len(ax.get_xticklabels())}"
        )
        # Close the figure so running the script in CI does not leak GUI resources.
        fig.clf()


    def main() -> None:
        showcase_curriculum()
        showcase_plotly_demos()
        showcase_matplotlib_palette()


    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_75_BI_Visualization_and_Dashboard_Principles/solutions.py)

    ```python title="solutions.py"
    """Reusable helpers for BI visualization and dashboard design demos."""

    from __future__ import annotations

    from typing import Dict, List, Tuple

    import pandas as pd
    import plotly.express as px
    import plotly.graph_objects as go
    from plotly.graph_objs import Figure

    # Matplotlib is used for palette demonstrations where traces are not required.
    import matplotlib.pyplot as plt


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
    ```
