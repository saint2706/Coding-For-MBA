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
