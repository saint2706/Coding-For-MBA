On Day 26 you expand beyond data wrangling and apply core statistical tools to
business datasets. The refactored lesson script now exposes reusable helper
functions for descriptive statistics, correlation analysis, and hypothesis
testing so you can integrate them directly into your own notebooks or projects.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to create your virtual environment and install the
required libraries.

## Exploring the Refactored Code

The `stats.py` module has been organized into testable functions that separate
computation from presentation.

1. **Review the Code:** Open `Day_26_Statistics/stats.py` and look at the new
   helpers:
   - `load_sales_data()` reads `sales_data.csv` and removes missing rows.
   - `summarize_revenue()` returns key revenue metrics and the full
     `DataFrame.describe()` output.
   - `compute_correlations()` produces a correlation matrix for the numeric
     sales fields.
   - `run_ab_test()` wraps SciPy's independent t-test and reports whether the
     difference is statistically significant.
   - `build_revenue_distribution_chart()` visualises the revenue histogram as an
     interactive Plotly figure.
   - `build_correlation_heatmap()` turns the correlation matrix into an
     interactive heatmap with hover labels and colourbar explanations.
1. **Run the Script:** From the project root, execute the module to see the
   printed analysis that the helpers power.
   ```bash
   python Day_26_Statistics/stats.py
   ```
1. **Run the Tests:** The automated tests create in-memory DataFrames and
   duration samples to validate each helper without touching disk.
   ```bash
   pytest tests/test_day_26.py
   ```

## 🧪 Explore the Interactive Notebooks

Static Matplotlib previews are great for reports, but sometimes you need to
hover over exact values or export a filtered view. Open the companion notebook
to try the Plotly charts side by side with their static counterparts:

1. Install notebook dependencies if you skipped them earlier:
   ```bash
   pip install notebook plotly
   ```
1. Launch Jupyter and open the walkthrough:
   ```bash
   jupyter notebook Day_26_Statistics/statistics_interactive.ipynb
   ```
1. Execute the notebook cells to compare the summary statistics, static plots,
   and the new interactive revenue distribution and correlation heatmap.

🎉 **Great job!** With these reusable statistics utilities you can move from
simple summaries to rigorous, testable insights in your analyses.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_26_Statistics/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_26_Statistics/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_26_Statistics/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_26_Statistics/solutions.ipynb){ .md-button }
- **stats.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_26_Statistics/stats.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_26_Statistics/stats.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_26_Statistics/stats.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_26_Statistics/stats.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_26_Statistics/solutions.py)

    ```python title="solutions.py"
    """
    Day 26: Solutions to Exercises
    """

    from pathlib import Path

    import pandas as pd
    from scipy.stats import ttest_ind

    # --- Exercise 1: Descriptive Statistics of Sales ---
    print("--- Solution to Exercise 1 ---")
    resource_dir = Path(__file__).resolve().parent
    data_path = resource_dir / "sales_data.csv"

    try:
        df = pd.read_csv(data_path)
        df.dropna(inplace=True)  # Clean the data first

        revenue = df["Revenue"]

        print(f"Mean Revenue: ${revenue.mean():,.2f}")
        print(f"Median Revenue: ${revenue.median():,.2f}")
        print(f"Standard Deviation of Revenue: ${revenue.std():,.2f}")
        print(f"Minimum Revenue: ${revenue.min():,.2f}")
        print(f"Maximum Revenue: ${revenue.max():,.2f}")

    except FileNotFoundError:
        print("Error: sales_data.csv not found. Keep the CSV beside this script.")
        df = pd.DataFrame()
    print("-" * 20)


    # --- Exercise 2: Correlation Analysis ---
    print("--- Solution to Exercise 2 ---")
    if not df.empty:
        # Select only the numerical columns
        numerical_cols = df[["Units Sold", "Price", "Revenue"]]

        # Calculate the correlation matrix
        correlation_matrix = numerical_cols.corr()

        print("Correlation Matrix:")
        print(correlation_matrix)
        print(
            "\nAnswer: 'Units Sold' and 'Revenue' have the strongest positive correlation (0.93)."
        )
    else:
        print("DataFrame not available for this exercise.")
    print("-" * 20)


    # --- Exercise 3: A/B Test Analysis (T-Test) ---
    print("--- Solution to Exercise 3 ---")
    group_a_durations = [10.5, 12.1, 11.8, 13.0, 12.5]
    group_b_durations = [12.8, 13.5, 13.2, 14.0, 13.8]

    print(f"Group A Durations: {group_a_durations}")
    print(f"Group B Durations: {group_b_durations}")

    # Perform the t-test
    t_stat, p_value = ttest_ind(group_a_durations, group_b_durations)

    print(f"\nP-value: {p_value:.4f}")

    # Conclusion based on the p-value
    if p_value < 0.05:  # pyright: ignore[reportOperatorIssue]
        print(
            "Conclusion: The result is statistically significant. The two headlines likely have different effects on session duration."
        )
    else:
        print(
            "Conclusion: The result is not statistically significant. We cannot conclude there is a difference between the headlines."
        )
    print("-" * 20)
    ```

???+ example "stats.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_26_Statistics/stats.py)

    ```python title="stats.py"
    """Day 26: Practical Statistics in Python.

    This module provides helper functions for loading sales data, generating
    summary statistics, computing correlations, and running a simple A/B test.

    All side effects (such as printing to the console) are encapsulated in the
    ``main`` function so that the individual helpers are easy to import and test.
    """

    from __future__ import annotations

    from pathlib import Path
    from typing import Iterable, Mapping, MutableMapping

    import pandas as pd
    import plotly.graph_objects as go
    from pandas import DataFrame, Series
    from scipy.stats import ttest_ind


    def load_sales_data(csv_path: Path | str | None = None) -> DataFrame:
        """Load and clean the sales CSV file."""

        resource_dir = Path(__file__).resolve().parent
        path = Path(csv_path) if csv_path is not None else resource_dir / "sales_data.csv"

        try:
            df = pd.read_csv(path)
        except FileNotFoundError:
            return pd.DataFrame()

        return df.dropna(axis=0, how="any")


    def summarize_revenue(df: DataFrame) -> Mapping[str, float | Series | DataFrame]:
        """Return descriptive statistics for the ``Revenue`` column."""

        if "Revenue" not in df:
            raise KeyError("DataFrame must contain a 'Revenue' column")

        revenue = df["Revenue"]
        summary: MutableMapping[str, float | Series | DataFrame] = {
            "mean": float(revenue.mean()),
            "median": float(revenue.median()),
            "std": float(revenue.std()),
            "min": float(revenue.min()),
            "max": float(revenue.max()),
            "describe": df.describe(),
        }
        return summary


    def compute_correlations(df: DataFrame) -> DataFrame:
        """Return the correlation matrix for the key numeric columns."""

        columns = [col for col in ("Units Sold", "Price", "Revenue") if col in df.columns]
        if len(columns) < 2:
            raise ValueError(
                "At least two of 'Units Sold', 'Price', or 'Revenue' must be present"
            )

        return df[columns].corr()


    def build_revenue_distribution_chart(df: DataFrame) -> go.Figure:
        """Create a histogram visualising the distribution of the ``Revenue`` column."""

        if "Revenue" not in df:
            raise KeyError("DataFrame must contain a 'Revenue' column")

        revenue = df["Revenue"].dropna()
        figure = go.Figure(
            data=[
                go.Histogram(
                    x=revenue,
                    nbinsx=min(30, max(5, revenue.nunique() // 2 or 5)),
                    marker_color="#636EFA",
                    opacity=0.85,
                    hovertemplate="Revenue: %{x:$,.0f}<extra></extra>",
                )
            ]
        )
        figure.update_layout(
            title="Revenue Distribution",
            xaxis_title="Revenue",
            yaxis_title="Frequency",
            template="plotly_white",
            bargap=0.05,
        )
        return figure


    def build_correlation_heatmap(df: DataFrame) -> go.Figure:
        """Create a heatmap to visualise correlations between key numeric metrics."""

        correlations = compute_correlations(df)
        heatmap = go.Heatmap(
            z=correlations.values,
            x=list(correlations.columns),
            y=list(correlations.index),
            colorscale="Blues",
            zmin=-1,
            zmax=1,
            hovertemplate="%{y} vs %{x}: %{z:.2f}<extra></extra>",
            colorbar=dict(title="Correlation"),
        )
        figure = go.Figure(data=[heatmap])
        figure.update_layout(
            title="Correlation Heatmap",
            template="plotly_white",
        )
        return figure


    def run_ab_test(
        group_a: Iterable[float], group_b: Iterable[float], alpha: float = 0.05
    ) -> Mapping[str, float | bool]:
        """Run an independent t-test on two groups of durations."""

        t_statistic, p_value = ttest_ind(list(group_a), list(group_b))
        return {
            "t_statistic": float(t_statistic),
            "p_value": float(p_value),
            "alpha": float(alpha),
            "is_significant": bool(p_value < alpha),
        }


    def main() -> None:
        """Execute the lesson workflow with helpful console output."""

        print("--- 1. Descriptive Statistics of Sales Data ---")
        df = load_sales_data()
        if df.empty:
            print("Error: sales_data.csv not found. Keep the CSV beside this script.")
        else:
            revenue_summary = summarize_revenue(df)
            print(f"Mean Revenue: ${revenue_summary['mean']:,.2f}")
            print(f"Median Revenue: ${revenue_summary['median']:,.2f}")
            print(f"Standard Deviation of Revenue: ${revenue_summary['std']:,.2f}")
            print(f"Minimum Revenue: ${revenue_summary['min']:,.2f}")
            print(f"Maximum Revenue: ${revenue_summary['max']:,.2f}")
            print("\nFull descriptive statistics (df.describe()):")
            print(revenue_summary["describe"])
        print("-" * 20)

        print("--- 2. Correlation Analysis ---")
        if not df.empty:
            correlation_matrix = compute_correlations(df)
            print("Correlation Matrix:")
            print(correlation_matrix)
            print(
                "\nAnalysis: 'Units Sold' and 'Revenue' have a strong positive correlation (0.93)."
            )
            print("'Price' and 'Revenue' also have a strong positive correlation (0.83).")
            print(
                "'Price' and 'Units Sold' have a weak negative correlation (-0.23), which might be expected (higher price can sometimes mean fewer units)."
            )
        else:
            print("DataFrame not available for this exercise.")
        print("-" * 20)

        print("--- 3. A/B Test Analysis (T-Test) ---")
        group_a_durations = [10.5, 12.1, 11.8, 13.0, 12.5, 11.9, 12.3]
        group_b_durations = [12.8, 13.5, 13.2, 14.0, 13.8, 14.1, 13.6]
        print(f"Group A (Old Headline) Durations: {group_a_durations}")
        print(f"Group B (New Headline) Durations: {group_b_durations}")

        test_results = run_ab_test(group_a_durations, group_b_durations)
        print(f"\nT-statistic: {test_results['t_statistic']:.4f}")
        print(f"P-value: {test_results['p_value']:.4f}")

        if test_results["is_significant"]:
            print("\nConclusion: The difference is statistically significant.")
            print(
                "We can conclude that the new headline (Group B) likely leads to longer session durations."
            )
        else:
            print("\nConclusion: The difference is not statistically significant.")
            print(
                "We cannot conclude that the new headline had a real effect on session duration."
            )
        print("-" * 20)


    if __name__ == "__main__":
        main()
    ```
