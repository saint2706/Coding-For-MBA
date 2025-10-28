---
title: 'Day 24: Advanced Pandas - Working with Real Data'
tags:
  - Advanced
  - Data
---

You'll rarely create data from scratch. The most common workflow is to load data from external
sources like CSV files. Today, we'll focus on loading data and using powerful methods to select,
filter, and clean it.

## Advanced Selection: `.loc` and `.iloc`

For complex selections, Pandas provides two powerful indexers:

- **`.loc` (Label-based):** Selects data based on **row and column labels**.
  ```python
  # Selects row with index label 3, and only the 'Product' and 'Revenue' columns
  subset = df.loc[3, ['Product', 'Revenue']]
  ```
- **`.iloc` (Integer-position based):** Selects data based on its **integer position**.
  ```python
  # Selects the first three rows (positions 0, 1, 2) and the first two columns (0, 1)
  subset = df.iloc[0:3, 0:2]
  ```

## Conditional Filtering (Boolean Indexing)

This is one of the most powerful features of Pandas. You can filter your DataFrame by providing a
boolean (`True`/`False`) condition.

```python
# Find all high-revenue sales from the 'North' region
# Note the parentheses around each condition
high_rev_north = df[(df['Revenue'] > 50000) & (df['Region'] == 'North')]
```

## Handling Missing Data

Real-world data is often messy and has missing values, represented as `NaN`.

- `df.isnull().sum()`: A crucial command to count missing values in each column.
- `df.dropna()`: Drops rows that contain any missing values.
- `df.fillna(value)`: Fills missing values with a specified value (e.g., 0 or the column's mean).

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `pandas_adv.py`, has been refactored to place each advanced operation
into its own testable function.

1. **Review the Code:** Open `Day_24_Pandas_Advanced/pandas_adv.py`. Examine functions like
   `filter_by_high_revenue()`, `filter_by_product_and_region()`, and `handle_missing_data()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_24_Pandas_Advanced/pandas_adv.py
   ```
   If the CSV file is missing, the refactored `handle_missing_data()` helper now raises a clear
   `ValueError` explaining how to restore the dataset before continuing.
1. **Run the Tests:** The tests use a sample DataFrame created in memory, so they don't depend on
   the external CSV file.
   ```bash
   pytest tests/test_day_24.py
   ```

## ✨ Interactive Plotly Visualisations

Plotly chart builders now sit alongside the existing data-wrangling helpers:

- `build_revenue_by_region_bar_chart()` aggregates revenue totals for each region and renders an
  interactive bar chart.
- `build_units_vs_price_scatter()` plots price sensitivity using `Units Sold` on the y-axis and
  encodes the point colour scale for quick outlier detection.

To experiment locally:

1. Install notebook dependencies if you have not done so already:
   ```bash
   pip install notebook plotly
   ```
1. Launch Jupyter from the project root and open the companion notebook:
   ```bash
   jupyter notebook Day_24_Pandas_Advanced/pandas_adv_interactive.ipynb
   ```
1. Run the cells to compare the quick Matplotlib baseline with the interactive Plotly versions.
   Hover, filter, and export the Plotly figures directly from the notebook toolbar.

## 🔬 Profiling the Workflow

Curious about where Pandas spends its time? Launch the shared profiling helper to benchmark the
lesson workflow:

```bash
python Day_24_Pandas_Advanced/profile_pandas_adv.py --mode cprofile
python Day_24_Pandas_Advanced/profile_pandas_adv.py --mode timeit --repeat 5 --number 3
```

The first command prints a truncated `cProfile` report. In our baseline run the CSV load
(`pandas.read_csv`) and the follow-up cleaning call (`handle_missing_data`) dominated the runtime,
confirming that disk I/O and DataFrame materialisation are the hot spots.【732170†L1-L28】 The
`timeit` helper highlights how quickly the full workflow executes once the operating system cache is
warm—about 3 ms per iteration on average across five repeats.【af7429†L1-L7】 If you plan to reuse the
dataset across multiple analyses, load the CSV once and reuse the DataFrame rather than calling
`read_csv` inside a tight loop.

## 💻 Exercises: Day 24

1. **Load and Inspect:**

   - In a new script (`my_solutions_24.py`), import `pandas as pd` and `pathlib`.
   - Load the `sales_data.csv` file (located in the `Day_24_Pandas_Advanced` directory) into a
     DataFrame.
   - Use `.head()` and `.info()` to inspect the loaded data.

1. **Select and Filter:**

   - Using the DataFrame from the previous exercise, import and use the
     `filter_by_product_and_region` function to find all sales of `"Mouse"` in the `"South"` region.
     Print the result.
   - Import and use the `filter_by_high_revenue` function to find all sales with revenue over
     $70,000.

1. **Basic Data Cleaning:**

   - Import the `handle_missing_data` function.
   - Call the function twice on your DataFrame:
     - Once with `strategy='drop'` to remove rows with missing data.
     - Once with `strategy='fill'` to fill missing revenue with the column average.
   - Print the `.shape` of both resulting DataFrames to see how they differ.

🎉 **Excellent work!** You're now working with data like a real analyst—loading it from files,
inspecting it, and using powerful tools to filter and clean it. These are foundational skills for
every data analysis project.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 23 – Day 23: Pandas - Your Data Analysis Superpower](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_23_Pandas/README.md) • **Next:** [Day 25 – Day 25: Data Cleaning - The Most Important Skill in Analytics](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_25_Data_Cleaning/README.md)

_You are on lesson 24 of 108._

<!-- LESSON_FOOTER_END -->

## Additional Materials

- **pandas_adv.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_24_Pandas_Advanced/pandas_adv.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_24_Pandas_Advanced/pandas_adv.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_24_Pandas_Advanced/pandas_adv.ipynb){ .md-button }
- **profile_pandas_adv.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_24_Pandas_Advanced/profile_pandas_adv.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_24_Pandas_Advanced/profile_pandas_adv.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_24_Pandas_Advanced/profile_pandas_adv.ipynb){ .md-button }
- **solutions.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_24_Pandas_Advanced/solutions.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_24_Pandas_Advanced/solutions.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_24_Pandas_Advanced/solutions.ipynb){ .md-button }

???+ example "pandas_adv.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_24_Pandas_Advanced/pandas_adv.py)

````
```python title="pandas_adv.py"
"""
Day 24: Advanced Pandas - Working with Real Data (Refactored)

This script demonstrates loading data from a CSV file and
using advanced selection and cleaning techniques with Pandas,
refactored into testable functions.
"""

from pathlib import Path
from typing import Any, List, Optional

import pandas as pd
import plotly.graph_objects as go


def load_sales_data(file_path: str) -> Optional[pd.DataFrame]:
    """Loads sales data from a CSV file into a Pandas DataFrame."""
    try:
        return pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"❌ Error: The file was not found at {file_path}")
        return None


def select_by_label(
    df: pd.DataFrame, index_label: Any, columns: List[str]
) -> Optional[pd.Series]:
    """Selects data by row label and column names using .loc."""
    if df is None or df.empty:
        return None
    try:
        return df.loc[index_label, columns]
    except KeyError:
        return None


def select_by_position(
    df: pd.DataFrame, row_pos: int, col_slice: slice
) -> Optional[pd.Series]:
    """Selects data by integer position using .iloc."""
    if df is None or df.empty:
        return None
    try:
        return df.iloc[row_pos, col_slice]
    except IndexError:
        return None


def filter_by_high_revenue(df: pd.DataFrame, threshold: float) -> pd.DataFrame:
    """Filters the DataFrame for rows where Revenue exceeds a threshold."""
    if df is None or "Revenue" not in df.columns:
        return pd.DataFrame()
    return df[df["Revenue"] > threshold]


def filter_by_product_and_region(
    df: pd.DataFrame, product: str, region: str
) -> pd.DataFrame:
    """Filters the DataFrame for a specific product and region."""
    if df is None or "Product" not in df.columns or "Region" not in df.columns:
        return pd.DataFrame()
    product_normalized = product.strip().casefold()
    region_normalized = region.strip().casefold()

    normalized_product_series = (
        df["Product"].astype("string").str.strip().str.casefold()
    )
    normalized_region_series = df["Region"].astype("string").str.strip().str.casefold()

    mask = (normalized_product_series == product_normalized) & (
        normalized_region_series == region_normalized
    )
    return df[mask]


def handle_missing_data(
    df: Optional[pd.DataFrame], strategy: str = "drop", fill_value=None
) -> pd.DataFrame:
    """Handles missing data by either dropping rows or filling with a value."""
    if df is None or df.empty:
        raise ValueError(
            "No sales data is available. Ensure the CSV exists and contains rows before"
            " calling handle_missing_data."
        )

    df_copy = df.copy()
    if strategy == "drop":
        return df_copy.dropna()
    elif strategy == "fill":
        if fill_value is None:
            # Default to filling with the mean for numeric columns
            for col in df_copy.columns:
                if pd.api.types.is_numeric_dtype(df_copy[col]):
                    df_copy[col] = df_copy[col].fillna(df_copy[col].mean())
        else:
            df_copy = df_copy.fillna(fill_value)
    return df_copy


def build_revenue_by_region_bar_chart(df: pd.DataFrame) -> go.Figure:
    """Build an interactive bar chart comparing revenue across regions."""

    if df is None or df.empty:
        raise ValueError("DataFrame must not be empty")
    if not {"Region", "Revenue"}.issubset(df.columns):
        raise KeyError("DataFrame must include 'Region' and 'Revenue' columns")

    regional_revenue = (
        df.groupby("Region", dropna=False)["Revenue"]
        .sum(min_count=1)
        .sort_values(ascending=False)
    )
    figure = go.Figure(
        data=[
            go.Bar(
                x=regional_revenue.index.astype(str),
                y=regional_revenue.values,
                marker_color="#00A1D6",
                hovertemplate="Region: %{x}<br>Revenue: %{y:$,.0f}<extra></extra>",
            )
        ]
    )
    figure.update_layout(
        title="Revenue by Region",
        xaxis_title="Region",
        yaxis_title="Total Revenue",
        template="plotly_white",
    )
    return figure


def build_units_vs_price_scatter(df: pd.DataFrame) -> go.Figure:
    """Return a scatter plot showing how pricing relates to units sold."""

    if df is None or df.empty:
        raise ValueError("DataFrame must not be empty")
    required_columns = {"Units Sold", "Price", "Product"}
    if not required_columns.issubset(df.columns):
        missing = ", ".join(sorted(required_columns - set(df.columns)))
        raise KeyError(f"Missing required columns: {missing}")

    figure = go.Figure(
        data=[
            go.Scatter(
                x=df["Price"],
                y=df["Units Sold"],
                mode="markers",
                marker=dict(
                    size=10,
                    color=df["Units Sold"],
                    colorscale="Viridis",
                    showscale=True,
                ),
                text=df["Product"],
                hovertemplate=(
                    "Product: %{text}<br>Price: %{x:$,.0f}<br>Units Sold: %{y}<extra></extra>"
                ),
            )
        ]
    )
    figure.update_layout(
        title="Units Sold vs. Price",
        xaxis_title="Price",
        yaxis_title="Units Sold",
        template="plotly_white",
    )
    return figure


def main():
    """Main function to demonstrate advanced Pandas operations."""
    print("--- Loading and Inspecting sales_data.csv ---")
    resource_dir = Path(__file__).resolve().parent
    data_path = resource_dir / "sales_data.csv"
    df = load_sales_data(str(data_path))

    if df is not None:
        print(df.head())
        print("-" * 20)

        print("--- Advanced Data Selection ---")
        product_3 = select_by_label(df, 3, ["Product", "Revenue"])
        print(f"Product and Revenue for row index 3 (using .loc):\n{product_3}\n")

        row_0 = select_by_position(df, 0, slice(0, 3))
        print(f"First row, first 3 columns (using .iloc):\n{row_0}\n")
        print("-" * 20)

        print("--- Conditional Filtering ---")
        high_revenue_df = filter_by_high_revenue(df, 50000)
        print(f"Found {len(high_revenue_df)} sales with revenue > $50,000.")

        laptop_north_df = filter_by_product_and_region(df, "Laptop", "North")
        print(f"Found {len(laptop_north_df)} 'Laptop' sales in the 'North' region.")
        print("-" * 20)

        print("--- Handling Missing Data ---")
        print(f"Original shape: {df.shape}")
        print(f"Missing values count:\n{df.isnull().sum()}\n")

        df_dropped = handle_missing_data(df, strategy="drop")
        print(f"Shape after dropping missing rows: {df_dropped.shape}")

        df_filled = handle_missing_data(df, strategy="fill")
        print(
            f"Missing values after filling with mean:\n{df_filled.isnull().sum().sum()}"
        )
        print("-" * 20)


if __name__ == "__main__":
    main()
```
````

???+ example "profile_pandas_adv.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_24_Pandas_Advanced/profile_pandas_adv.py)

````
```python title="profile_pandas_adv.py"
"""Command-line helpers for profiling the Pandas advanced lesson."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Callable

try:
    from mypackage.profiling import print_report, profile_callable
except ImportError:
    PROJECT_ROOT = Path(__file__).resolve().parents[1]
    if str(PROJECT_ROOT) not in sys.path:
        sys.path.append(str(PROJECT_ROOT))
    from mypackage.profiling import print_report, profile_callable

try:  # pragma: no cover - runtime guard for script execution
    from .pandas_adv import (
        filter_by_high_revenue,
        filter_by_product_and_region,
        handle_missing_data,
        load_sales_data,
    )
except ImportError:  # pragma: no cover - allows ``python profile_pandas_adv.py``
    CURRENT_DIR = Path(__file__).resolve().parent
    if str(CURRENT_DIR) not in sys.path:
        sys.path.append(str(CURRENT_DIR))
    from pandas_adv import (  # type: ignore  # pylint: disable=import-error
        filter_by_high_revenue,
        filter_by_product_and_region,
        handle_missing_data,
        load_sales_data,
    )


def build_pipeline(
    data_path: Path, threshold: float, product: str, region: str, missing_strategy: str
) -> Callable[[], None]:
    """Return a callable that executes the common lesson workflow."""

    def pipeline() -> None:
        df = load_sales_data(str(data_path))
        if df is None or df.empty:
            raise ValueError(
                f"Sales data could not be loaded from {data_path}. Ensure the CSV exists"
                " and contains data."
            )

        filter_by_high_revenue(df, threshold)
        filter_by_product_and_region(df, product, region)
        handle_missing_data(df, strategy=missing_strategy)

    return pipeline


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--mode",
        choices=("cprofile", "timeit"),
        default="cprofile",
        help="Profiling backend to use (default: cprofile)",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=50_000,
        help="Revenue threshold used in filter_by_high_revenue",
    )
    parser.add_argument(
        "--product",
        default="Laptop",
        help="Product name used for filter_by_product_and_region",
    )
    parser.add_argument(
        "--region",
        default="North",
        help="Region used for filter_by_product_and_region",
    )
    parser.add_argument(
        "--missing-strategy",
        choices=("drop", "fill"),
        default="fill",
        help="Strategy used when calling handle_missing_data",
    )
    parser.add_argument(
        "--repeat",
        type=int,
        default=5,
        help="Number of timing repeats when --mode=timeit",
    )
    parser.add_argument(
        "--number",
        type=int,
        default=1,
        help="Number of calls per repeat when --mode=timeit",
    )
    args = parser.parse_args()

    data_path = Path(__file__).resolve().parent / "sales_data.csv"
    pipeline = build_pipeline(
        data_path=data_path,
        threshold=args.threshold,
        product=args.product,
        region=args.region,
        missing_strategy=args.missing_strategy,
    )

    profile_report, timing_report = profile_callable(
        pipeline,
        mode=args.mode,
        repeat=args.repeat,
        number=args.number,
    )
    print_report(profile_report=profile_report, timing_report=timing_report)


if __name__ == "__main__":
    main()
```
````

???+ example "solutions.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_24_Pandas_Advanced/solutions.py)

````
```python title="solutions.py"
"""
Day 24: Solutions to Exercises
"""

from pathlib import Path

import pandas as pd

# --- Exercise 1: Load and Inspect ---
print("--- Solution to Exercise 1 ---")
# Load the data
resource_dir = Path(__file__).resolve().parent
data_path = resource_dir / "sales_data.csv"

try:
    df = pd.read_csv(data_path)
    print("Successfully loaded sales_data.csv")

    # View the first few rows
    print("\n.head():")
    print(df.head())

    # Check data types and for missing values
    print("\n.info():")
    df.info()

    # Get statistical overview
    print("\n.describe():")
    print(df.describe())

except FileNotFoundError:
    print(
        "Error: sales_data.csv not found in the Day_24_Pandas_Advanced folder."
        " Keep the CSV beside this script."
    )
print("-" * 20)


# --- Exercise 2: Select and Filter ---
print("--- Solution to Exercise 2 ---")
if "df" in locals():  # Check if the DataFrame was loaded successfully
    # Select 'Product' and 'Revenue' for the first 5 rows using .loc
    # Index labels are 0-4 for the first 5 rows.
    product_revenue_subset = df.loc[  # pyright: ignore[reportPossiblyUnboundVariable]
        0:4, ["Product", "Revenue"]
    ]  # pyright: ignore[reportPossiblyUnboundVariable]
    print("Product and Revenue for first 5 rows:")
    print(product_revenue_subset)
    print()

    # Select all sales from the 'South' region
    south_sales = df[  # pyright: ignore[reportPossiblyUnboundVariable]
        df["Region"] == "South"  # pyright: ignore[reportPossiblyUnboundVariable]
    ]  # pyright: ignore[reportPossiblyUnboundVariable]
    print("All sales from the 'South' region:")
    print(south_sales)
    print()

    # Select sales with Units Sold > 100 AND Revenue > $20,000
    high_performers = df[  # pyright: ignore[reportPossiblyUnboundVariable]
        (df["Units Sold"] > 100)  # pyright: ignore[reportPossiblyUnboundVariable]
        & (df["Revenue"] > 20000)  # pyright: ignore[reportPossiblyUnboundVariable]
    ]  # pyright: ignore[reportPossiblyUnboundVariable]
    print("Sales with >100 Units Sold and >$20,000 Revenue:")
    print(high_performers)
else:
    print("DataFrame 'df' not available for this exercise.")
print("-" * 20)


# --- Exercise 3: Basic Data Cleaning ---
print("--- Solution to Exercise 3 ---")
if "df" in locals():
    # Count missing values in each column
    print("Count of missing values per column:")
    print(df.isnull().sum())  # pyright: ignore[reportPossiblyUnboundVariable]
    print()

    # Create a new DataFrame by dropping rows with missing values
    df_cleaned = df.dropna()  # pyright: ignore[reportPossiblyUnboundVariable]
    print(
        "Shape of original df:",
        df.shape,  # pyright: ignore[reportPossiblyUnboundVariable]
    )  # pyright: ignore[reportPossiblyUnboundVariable]
    print("Shape of cleaned df (after dropna):", df_cleaned.shape)
    print("Missing values count in cleaned df:")
    print(df_cleaned.isnull().sum())
    print()

    # Create another DataFrame where missing Revenue is filled with the mean
    mean_revenue = df[  # pyright: ignore[reportPossiblyUnboundVariable]
        "Revenue"
    ].mean()  # pyright: ignore[reportPossiblyUnboundVariable]
    print(f"Mean revenue to be used for filling: ${mean_revenue:,.2f}")
    df_filled = df.copy()  # pyright: ignore[reportPossiblyUnboundVariable]
    df_filled["Revenue"] = df_filled["Revenue"].fillna(mean_revenue)
    print("Missing values count in filled df:")
    print(df_filled.isnull().sum())
    print("First 5 rows of the filled DataFrame:")
    print(df_filled.head())
else:
    print("DataFrame 'df' not available for this exercise.")
print("-" * 20)
```
````
