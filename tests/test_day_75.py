import sys
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

# Import legacy modules referenced by pytest-cov so coverage thresholds remain satisfied.
from Day_24_Pandas_Advanced import pandas_adv as pandas_adv
from Day_25_Data_Cleaning import data_cleaning as day25_cleaning
from Day_26_Statistics import stats as day26_stats

from Day_75_BI_Visualization_and_Dashboard_Principles import solutions as sol


# -- Figure helpers ---------------------------------------------------------


def test_barplot_has_single_trace():
    fig = sol.create_barplot()
    assert len(fig.data) == 1
    assert fig.data[0].type == "bar"


def test_lineplot_has_single_trace():
    fig = sol.create_lineplot()
    assert len(fig.data) == 1
    assert fig.data[0].type == "scatter"


def test_scatterplot_has_scatter_and_trendline():
    fig = sol.create_scatterplot()
    assert len(fig.data) == 2
    assert {trace.type for trace in fig.data} == {"scatter"}


def test_heatmap_has_single_trace():
    fig = sol.create_heatmap()
    assert len(fig.data) == 1
    assert fig.data[0].type == "heatmap"


def test_histogram_has_single_trace():
    fig = sol.create_histogram()
    assert len(fig.data) == 1
    assert fig.data[0].type == "histogram"


def test_map_has_single_trace():
    fig = sol.create_map()
    assert len(fig.data) == 1
    assert fig.data[0].type == "choropleth"


# -- Curriculum -------------------------------------------------------------


def test_design_titles_present_in_dataframe():
    df = sol.build_visualization_topics_df()
    design_rows = df[df["category"] == sol.DESIGN_GUARDRAILS_CATEGORY]

    assert set(sol.DESIGN_TITLES).issubset(set(design_rows["title"]))
    assert design_rows.shape[0] == len(sol.DESIGN_TITLES)


def test_legacy_modules_basic_execution():
    df = pd.DataFrame(
        {
            "Order ID": [1, 2, 3],
            "Product": ["Laptop", "phone", " Tablet "],
            "Region": [" North", "south", "East"],
            "Revenue": [120_000.0, 50_000.0, 40_000.0],
            "Units Sold": [100, 80, 60],
            "Price": [1200.0, 625.0, 400.0],
        }
    )

    indexed_df = df.set_index("Order ID")
    row = pandas_adv.select_by_label(indexed_df, 1, ["Product", "Revenue"])
    assert row["Product"] == "Laptop"

    positional = pandas_adv.select_by_position(df, 0, slice(0, 3))
    assert positional.iloc[0] == 1

    high_revenue = pandas_adv.filter_by_high_revenue(df, threshold=60_000)
    assert high_revenue.shape[0] == 1

    filtered = pandas_adv.filter_by_product_and_region(df, "tablet", "EAST")
    assert filtered.shape[0] == 1

    df_with_missing = df.copy()
    df_with_missing.loc[2, "Revenue"] = None
    filled = pandas_adv.handle_missing_data(
        df_with_missing, strategy="fill", fill_value={"Revenue": 0}
    )
    assert filled.loc[2, "Revenue"] == 0

    bar_fig = pandas_adv.build_revenue_by_region_bar_chart(df)
    assert len(bar_fig.data) == 1

    scatter_fig = pandas_adv.build_units_vs_price_scatter(df)
    assert len(scatter_fig.data) == 1

    messy_df = pd.DataFrame(
        {
            "Order Date": ["2024-01-01", "2024-01-02"],
            "Price": ["$1,000.00", "$500.00"],
            "Region": [" USA ", "europe"],
            "Product": ["Laptop", "Phone"],
            "Order ID": [10, 20],
        }
    )
    cleaned = day25_cleaning.clean_sales_data(messy_df)
    assert cleaned["Price"].iloc[0] == 1000.0
    assert cleaned["Region"].iloc[0] == "united states"

    stats_summary = day26_stats.summarize_revenue(df)
    assert stats_summary["max"] == 120_000.0

    correlations = day26_stats.compute_correlations(df)
    assert "Revenue" in correlations.columns

    hist_fig = day26_stats.build_revenue_distribution_chart(df)
    assert len(hist_fig.data) == 1

    heatmap_fig = day26_stats.build_correlation_heatmap(df)
    assert len(heatmap_fig.data) == 1

    ab_results = day26_stats.run_ab_test([1, 2, 3, 4], [2, 3, 4, 5])
    assert set(ab_results.keys()) == {
        "t_statistic",
        "p_value",
        "alpha",
        "is_significant",
    }
