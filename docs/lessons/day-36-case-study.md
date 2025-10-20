## Overview

Day 36 ties together the full analytics workflow. You will load the
`case_study_sales.csv` dataset, clean it, surface core revenue insights, and
present a concise set of recommendations. The helpers in this folder mirror the
solution structure so that you can focus on translating business questions into
Python code.

## Files

| File | Description |
| --- | --- |
| [`case_study.py`](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_36_Case_Study/case_study.py) | Student-facing template containing callable helpers and a minimal `main()` driver you can customize. |
| [`case_study_sales.csv`](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_36_Case_Study/case_study_sales.csv) | Sales dataset that powers the analysis. |
| [`solutions.py`](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_36_Case_Study/solutions.py) | Fully worked reference solution with detailed walkthrough code. |

## Suggested Workflow

1. Use `load_case_study_data()` to import the CSV with parsed dates.
1. Call `clean_case_study_data()` to enforce schema expectations and rebuild the
   `Revenue` column when necessary.
1. Explore metrics via `summarize_case_study()` or write your own aggregations
   and visualizations.
1. Capture narrative takeaways for the Head of Sales along with supporting
   charts or tables.

Running the script directly executes the helper pipeline and prints the top-line
revenue summaries:

```bash
python Day_36_Case_Study/case_study.py
```

## Tests

Automated tests validate the helpers against the bundled dataset. From the
repository root run:

```bash
pytest tests/test_day_36.py
```

## Additional Materials

- **case_study.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_36_Case_Study/case_study.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_36_Case_Study/case_study.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_36_Case_Study/case_study.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_36_Case_Study/case_study.ipynb){ .md-button }
- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_36_Case_Study/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_36_Case_Study/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_36_Case_Study/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_36_Case_Study/solutions.ipynb){ .md-button }

???+ example "case_study.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_36_Case_Study/case_study.py)

    ```python title="case_study.py"
    """Utility helpers for the Day 36 capstone case study."""

    from __future__ import annotations

    from pathlib import Path
    from typing import Any, Dict

    import pandas as pd

    DATA_PATH = Path(__file__).with_name("case_study_sales.csv")


    def load_case_study_data(path: str | Path = DATA_PATH) -> pd.DataFrame:
        """Return the raw sales data as a :class:`~pandas.DataFrame`.

        Parameters
        ----------
        path:
            Location of the ``case_study_sales.csv`` file. Defaults to the copy that
            ships with the repository.
        """

        return pd.read_csv(path, parse_dates=["Date"])


    def clean_case_study_data(data: pd.DataFrame) -> pd.DataFrame:
        """Clean the raw case-study data for downstream analysis.

        The helper performs a light-touch cleanup that mirrors the steps students
        complete in the lesson notebook:

        * ensure the ``Date`` column uses ``datetime64`` values,
        * coerce numeric fields to numbers while dropping unparseable records,
        * calculate ``Revenue`` from ``Price`` and ``Units Sold`` when it is
          missing.
        """

        cleaned = data.copy()

        cleaned["Date"] = pd.to_datetime(cleaned["Date"], errors="coerce")

        numeric_columns = ["Price", "Units Sold"]
        has_revenue = "Revenue" in cleaned.columns
        if has_revenue:
            numeric_columns.append("Revenue")

        for column in numeric_columns:
            cleaned[column] = pd.to_numeric(cleaned[column], errors="coerce")

        cleaned = cleaned.dropna(subset=["Date", "Price", "Units Sold"])

        if not has_revenue:
            cleaned["Revenue"] = cleaned["Price"] * cleaned["Units Sold"]
        else:
            missing_revenue = cleaned["Revenue"].isna()
            if missing_revenue.any():
                cleaned.loc[missing_revenue, "Revenue"] = (
                    cleaned.loc[missing_revenue, "Price"]
                    * cleaned.loc[missing_revenue, "Units Sold"]
                )

        cleaned["Units Sold"] = cleaned["Units Sold"].round().astype("Int64")
        cleaned["Revenue"] = cleaned["Revenue"].astype(float)

        return cleaned.reset_index(drop=True)


    def summarize_case_study(data: pd.DataFrame, *, top_n: int = 5) -> Dict[str, Any]:
        """Generate headline metrics for the capstone analysis."""

        if data.empty:
            raise ValueError("Cannot summarize an empty DataFrame.")

        summary: Dict[str, Any] = {
            "top_products": data.groupby("Product")["Revenue"]
            .sum()
            .sort_values(ascending=False)
            .head(top_n),
            "region_revenue": data.groupby("Region")["Revenue"]
            .sum()
            .sort_values(ascending=False),
            "segment_revenue": data.groupby("Customer Segment")["Revenue"]
            .sum()
            .sort_values(ascending=False),
            "channel_revenue": data.groupby("Sales Channel")["Revenue"]
            .sum()
            .sort_values(ascending=False),
            "price_units_correlation": data[["Price", "Units Sold"]]
            .corr()
            .loc["Price", "Units Sold"],
            "monthly_revenue": data.set_index("Date")["Revenue"].resample("M").sum(),
        }

        return summary


    def main() -> None:
        """Run a minimal command-line summary for the case study."""

        raw = load_case_study_data()
        cleaned = clean_case_study_data(raw)
        summary = summarize_case_study(cleaned)

        print("Top products by revenue:")
        print(summary["top_products"])
        print("\nRevenue by region:")
        print(summary["region_revenue"])


    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_36_Case_Study/solutions.py)

    ```python title="solutions.py"
    """
    Day 36: Solution to the Capstone Case Study
    """

    import matplotlib.pyplot as plt
    import pandas as pd

    # --- Step 1 & 2: Load and Clean the Data ---
    print("--- Step 1 & 2: Loading and Cleaning Data ---")
    try:
        df = pd.read_csv("case_study_sales.csv", parse_dates=["Date"])
        print("Data loaded successfully.")

        # Check for missing values
        if df.isnull().sum().sum() > 0:
            print("Missing values found. Dropping rows with missing data.")
            df.dropna(inplace=True)

        # Ensure numeric columns are properly typed
        numeric_columns = ["Price", "Units Sold"]
        has_revenue_column = "Revenue" in df.columns
        if has_revenue_column:
            numeric_columns.append("Revenue")
        for col in numeric_columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        if has_revenue_column:
            if df["Revenue"].isnull().any():
                print(
                    "Revenue column contained missing or non-numeric values. Recalculating from Price and Units Sold."
                )
                df["Revenue"] = df["Price"] * df["Units Sold"]
        else:
            print("Revenue column not found. Creating it from Price and Units Sold.")
            df["Revenue"] = df["Price"] * df["Units Sold"]

        print("Data cleaned and 'Revenue' column created.")

    except FileNotFoundError:
        print("Error: case_study_sales.csv not found.")
        df = pd.DataFrame()

    if not df.empty:
        # --- Step 3: Exploratory Data Analysis (EDA) ---
        print("\n--- Step 3: Answering Key Business Questions ---")

        # 1. Top 5 products by total revenue
        top_products = (
            df.groupby("Product")["Revenue"].sum().sort_values(ascending=False).head(5)
        )
        print("\n1. Top 5 Products by Revenue:")
        print(top_products)

        # 2. Top sales region by revenue
        region_revenue = df.groupby("Region")["Revenue"].sum().sort_values(ascending=False)
        print("\n2. Revenue by Region:")
        print(region_revenue)

        # 3. Customer segment and sales channel performance
        segment_revenue = (
            df.groupby("Customer Segment")["Revenue"].sum().sort_values(ascending=False)
        )
        channel_revenue = (
            df.groupby("Sales Channel")["Revenue"].sum().sort_values(ascending=False)
        )
        print("\n3. Revenue by Customer Segment:")
        print(segment_revenue)
        print("\n4. Revenue by Sales Channel:")
        print(channel_revenue)

        # 4. Correlation between Price and Units Sold
        correlation = df[["Price", "Units Sold"]].corr()
        print("\n5. Correlation between Price and Units Sold:")
        print(correlation)

        # 5. Monthly revenue trend
        monthly_revenue = df.set_index("Date")["Revenue"].resample("M").sum()
        print("\n6. Monthly Revenue Trend:")
        print(monthly_revenue)

        # --- Step 4: Visualize Your Findings ---
        print("\n--- Step 4: Generating Visualizations ---")

        # Plot 1: Top 5 Products by Revenue
        plt.figure(figsize=(10, 6))
        top_products.plot(kind="bar")
        plt.title("Top 5 Products by Total Revenue", fontsize=16)
        plt.ylabel("Total Revenue ($)")
        plt.xlabel("Product")
        plt.xticks(rotation=45)
        print("Displaying plot 1...")
        plt.show()

        # Plot 2: Revenue by Region
        plt.figure(figsize=(10, 6))
        region_revenue.plot(kind="pie", autopct="%1.1f%%", startangle=90)
        plt.title("Revenue Contribution by Region", fontsize=16)
        plt.ylabel("")  # Hide the y-label for pie charts
        print("Displaying plot 2...")
        plt.show()

        # Plot 3: Revenue by Customer Segment
        plt.figure(figsize=(10, 6))
        segment_revenue.plot(kind="bar")
        plt.title("Revenue by Customer Segment", fontsize=16)
        plt.ylabel("Total Revenue ($)")
        plt.xlabel("Customer Segment")
        plt.xticks(rotation=45)
        print("Displaying plot 3...")
        plt.show()

        # Plot 4: Monthly Revenue Trend
        plt.figure(figsize=(12, 6))
        monthly_revenue.plot(kind="line", marker="o")
        plt.title("Monthly Revenue Trend", fontsize=16)
        plt.ylabel("Total Revenue ($)")
        plt.xlabel("Date")
        print("Displaying plot 4...")
        plt.show()

        # --- Step 5: Summary and Recommendations ---
        print("\n--- Step 5: Summary and Recommendations ---")
        summary = """
        Key Insights:
        1. Laptops continue to dominate revenue, with smartphones and tablets forming a strong secondary tier.
        2. The North and South regions lead performance, but international sales are a growing share thanks to strong marketplace channels.
        3. Enterprise customers drive the bulk of revenue across both online and partner channels, while consumer sales excel through retail and marketplace partners.
        4. There remains only a modest relationship between price and units sold, so pricing adjustments should be paired with targeted marketing.

        Recommendations:
        1. Double-down on laptop bundles and smartphone upsells for enterprise and consumer segments, respectively.
        2. Invest in the marketplace channel internationally while reinforcing partner relationships in top-performing regions.
        3. Monitor pricing experiments carefully, coupling them with targeted campaigns rather than broad discounts.
        """
        print(summary)

    else:
        print("\nSkipping analysis as DataFrame could not be loaded.")
    ```
