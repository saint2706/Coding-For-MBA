Visualising key business metrics makes it easier to communicate findings and uncover patterns. Day 27 introduces reusable Matplotlib and Seaborn helpers that create core business charts for the sales dataset you prepared in Day 24.

## Environment Setup

1. (Recommended) Create a virtual environment and activate it.
1. Install dependencies from the root of the repository:
   ```bash
   pip install -r requirements.txt
   ```
1. Ensure `sales_data.csv` from Day 24 is available in this lesson folder (or update the helper to point to your copy).

## Run the Script

Generate the four lesson visuals from the command line:

```bash
python Day_27_Visualization/visualization.py
```

Each call loads the shared plotting helpers, displays a chart, and waits for you to close the window before moving on.

## Explore the Notebook

Open the companion notebook to iterate on the visuals and review interpretation guidance:

```bash
jupyter notebook Day_27_Visualization/visualization.ipynb
```

The notebook reuses the same plotting functions so you can experiment without duplicating logic.

## Run Tests

A pytest suite validates the chart configuration (titles, labels, legends) using a headless Matplotlib backend:

```bash
pytest tests/test_day_27.py
```

Running the full repository test suite is also supported:

```bash
pytest
```

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_27_Visualization/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_27_Visualization/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_27_Visualization/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_27_Visualization/solutions.ipynb){ .md-button }
- **visualization.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_27_Visualization/visualization.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_27_Visualization/visualization.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_27_Visualization/visualization.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_27_Visualization/visualization.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_27_Visualization/solutions.py)

    ```python title="solutions.py"
    """
    Day 27: Solutions to Exercises
    """

    from pathlib import Path

    import matplotlib.pyplot as plt
    import pandas as pd
    import seaborn as sns

    # --- Load and Prepare Data ---
    # We use the cleaned data from Day 24 for reliable plotting.
    resource_dir = Path(__file__).resolve().parent
    data_path = resource_dir / "sales_data.csv"

    try:
        # We use the data from Day 24, so we need to reference its path
        # parse_dates=['Date'] tells pandas to automatically convert the 'Date' column
        df = pd.read_csv(data_path, parse_dates=["Date"])
        df.dropna(inplace=True)  # Drop rows with missing values for simplicity
        print("Data loaded successfully for exercises.")
    except FileNotFoundError:
        print("Error: sales_data.csv not found. Keep the CSV beside this script.")
        df = pd.DataFrame()


    if not df.empty:
        # --- Exercise 1: Sales by Product ---
        print("\n--- Solution to Exercise 1 ---")
        plt.figure(figsize=(10, 6))
        # Group by Product and sum the Units Sold for each
        product_sales = df.groupby("Product")["Units Sold"].sum().reset_index()
        sns.barplot(x="Product", y="Units Sold", data=product_sales)
        plt.title("Total Units Sold by Product")
        plt.xlabel("Product Category")
        plt.ylabel("Total Units Sold")
        print("Displaying plot for Exercise 1. Please close the plot window.")
        plt.show()

        # --- Exercise 2: Revenue Over Time ---
        print("\n--- Solution to Exercise 2 ---")
        # Group the data by date and sum the revenue for each day
        daily_revenue = df.groupby("Date")["Revenue"].sum().reset_index()

        plt.figure(figsize=(12, 6))
        sns.lineplot(x="Date", y="Revenue", data=daily_revenue)
        plt.title("Daily Revenue Trend")
        plt.xlabel("Date")
        plt.ylabel("Total Revenue ($)")
        plt.xticks(rotation=45)
        plt.tight_layout()
        print("Displaying plot for Exercise 2. Please close the plot window.")
        plt.show()

        # --- Exercise 3: Price Distribution ---
        print("\n--- Solution to Exercise 3 ---")
        plt.figure(figsize=(10, 6))
        sns.histplot(data=df, x="Price", bins=8, kde=False)
        plt.title("Distribution of Product Prices")
        plt.xlabel("Price Bins ($)")
        plt.ylabel("Number of Products")
        print("Displaying plot for Exercise 3. Please close the plot window.")
        plt.show()
    else:
        print("\nSkipping exercises as DataFrame could not be loaded.")
    ```

???+ example "visualization.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_27_Visualization/visualization.py)

    ```python title="visualization.py"
    """Day 27: Creating Business Visualizations.

    This module provides reusable plotting functions for the lesson so that the
    charts can be tested and embedded in notebooks without relying on the GUI
    backend.  Each function returns a :class:`matplotlib.figure.Figure` instance.
    """

    from __future__ import annotations

    from pathlib import Path
    from typing import Iterable

    import matplotlib.pyplot as plt
    import pandas as pd
    import seaborn as sns

    # Matplotlib/Seaborn global configuration
    sns.set_theme(style="whitegrid")

    RESOURCE_DIR = Path(__file__).resolve().parent
    DEFAULT_DATA_PATHS: Iterable[Path] = (
        RESOURCE_DIR / "sales_data.csv",
        RESOURCE_DIR.parent / "Day_24_Pandas_Advanced" / "sales_data.csv",
    )


    def load_sales_data(paths: Iterable[Path] = DEFAULT_DATA_PATHS) -> pd.DataFrame:
        """Load the sales dataset used throughout the visualisation lesson.

        Parameters
        ----------
        paths:
            Candidate file paths that will be checked in order.  The first existing
            CSV file is read.

        Returns
        -------
        pandas.DataFrame
            The cleaned sales data with parsed dates.  An empty DataFrame is
            returned if none of the paths exist.
        """

        for path in paths:
            if path.exists():
                df = pd.read_csv(path, parse_dates=["Date"])
                df.dropna(inplace=True)
                return df

        print("Error: sales_data.csv not found. Keep the CSV beside this script.")
        return pd.DataFrame()


    def _validate_dataframe(df: pd.DataFrame, required_columns: Iterable[str]) -> None:
        missing = [col for col in required_columns if col not in df.columns]
        if missing:
            raise ValueError(f"DataFrame is missing required columns: {missing}")
        if df.empty:
            raise ValueError("DataFrame is empty; cannot build visualization.")


    def build_revenue_by_region_plot(df: pd.DataFrame) -> plt.Figure:
        """Create a bar chart showing total revenue by region."""

        _validate_dataframe(df, ["Region", "Revenue"])

        fig, ax = plt.subplots(figsize=(10, 6))
        sns.barplot(x="Region", y="Revenue", data=df, estimator=sum, errorbar=None, ax=ax)
        ax.set_title("Total Revenue by Region", fontsize=16)
        ax.set_ylabel("Total Revenue ($)")
        ax.set_xlabel("Region")
        fig.tight_layout()
        return fig


    def build_daily_revenue_plot(df: pd.DataFrame) -> plt.Figure:
        """Create a line chart showing daily total revenue."""

        _validate_dataframe(df, ["Date", "Revenue"])

        daily_revenue = df.groupby("Date")["Revenue"].sum().reset_index()
        fig, ax = plt.subplots(figsize=(12, 6))
        sns.lineplot(x="Date", y="Revenue", data=daily_revenue, ax=ax)
        ax.set_title("Daily Revenue Trend", fontsize=16)
        ax.set_xlabel("Date")
        ax.set_ylabel("Total Revenue ($)")
        for label in ax.get_xticklabels():
            label.set_rotation(45)
        fig.tight_layout()
        return fig


    def build_units_sold_distribution_plot(df: pd.DataFrame) -> plt.Figure:
        """Create a histogram showing the distribution of units sold."""

        _validate_dataframe(df, ["Units Sold"])

        fig, ax = plt.subplots(figsize=(10, 6))
        sns.histplot(x="Units Sold", data=df, bins=10, kde=True, ax=ax)
        ax.set_title("Distribution of Units Sold per Transaction", fontsize=16)
        ax.set_xlabel("Units Sold")
        ax.set_ylabel("Frequency")
        fig.tight_layout()
        return fig


    def build_price_vs_units_sold_plot(df: pd.DataFrame) -> plt.Figure:
        """Create a scatter plot comparing price to units sold."""

        _validate_dataframe(df, ["Price", "Units Sold", "Product"])

        fig, ax = plt.subplots(figsize=(10, 6))
        sns.scatterplot(x="Price", y="Units Sold", data=df, hue="Product", ax=ax)
        ax.set_title("Price vs. Units Sold", fontsize=16)
        ax.set_xlabel("Price ($)")
        ax.set_ylabel("Units Sold")
        ax.legend(title="Product")
        fig.tight_layout()
        return fig


    def main() -> None:
        """Load the data and display the standard lesson charts."""

        df = load_sales_data()
        if df.empty:
            return

        print(
            "Displaying Bar Chart: Total Revenue by Region. Close the window to continue."
        )
        build_revenue_by_region_plot(df).show()

        print("Displaying Line Chart: Daily Revenue Trend. Close the window to continue.")
        build_daily_revenue_plot(df).show()

        print(
            "Displaying Histogram: Distribution of Units Sold. Close the window to continue."
        )
        build_units_sold_distribution_plot(df).show()

        print(
            "Displaying Scatter Plot: Price vs. Units Sold. Close the window to continue."
        )
        build_price_vs_units_sold_plot(df).show()


    if __name__ == "__main__":
        main()
    ```
