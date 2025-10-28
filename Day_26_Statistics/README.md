# 📘 Day 26: Practical Statistics for Business Analysis

On Day 26 you expand beyond data wrangling and apply core statistical tools to business datasets.
The refactored lesson script now exposes reusable helper functions for descriptive statistics,
correlation analysis, and hypothesis testing so you can integrate them directly into your own
notebooks or projects.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to create your virtual environment and install the required libraries.

## Exploring the Refactored Code

The `stats.py` module has been organized into testable functions that separate computation from
presentation.

1. **Review the Code:** Open `Day_26_Statistics/stats.py` and look at the new helpers:
   - `load_sales_data()` reads `sales_data.csv` and removes missing rows.
   - `summarize_revenue()` returns key revenue metrics and the full `DataFrame.describe()` output.
   - `compute_correlations()` produces a correlation matrix for the numeric sales fields.
   - `run_ab_test()` wraps SciPy's independent t-test and reports whether the difference is
     statistically significant.
   - `build_revenue_distribution_chart()` visualises the revenue histogram as an interactive Plotly
     figure.
   - `build_correlation_heatmap()` turns the correlation matrix into an interactive heatmap with
     hover labels and colourbar explanations.
1. **Run the Script:** From the project root, execute the module to see the printed analysis that
   the helpers power.
   ```bash
   python Day_26_Statistics/stats.py
   ```
1. **Run the Tests:** The automated tests create in-memory DataFrames and duration samples to
   validate each helper without touching disk.
   ```bash
   pytest tests/test_day_26.py
   ```

## 🧪 Explore the Interactive Notebooks

Static Matplotlib previews are great for reports, but sometimes you need to hover over exact values
or export a filtered view. Open the companion notebook to try the Plotly charts side by side with
their static counterparts:

1. Install notebook dependencies if you skipped them earlier:
   ```bash
   pip install notebook plotly
   ```
1. Launch Jupyter and open the walkthrough:
   ```bash
   jupyter notebook Day_26_Statistics/statistics_interactive.ipynb
   ```
1. Execute the notebook cells to compare the summary statistics, static plots, and the new
   interactive revenue distribution and correlation heatmap.

🎉 **Great job!** With these reusable statistics utilities you can move from simple summaries to
rigorous, testable insights in your analyses.
