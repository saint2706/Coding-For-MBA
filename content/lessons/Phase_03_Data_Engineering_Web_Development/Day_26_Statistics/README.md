---
day: 26
title: "Statistics for Business"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "statistics-business"
duration: 55
difficulty: "intermediate"
tags:
  - python
  - statistics
  - analysis
  - numpy
concepts:
  - "descriptive statistics"
  - "distributions"
  - "correlation"
  - "percentiles"
  - "hypothesis testing basics"
prerequisites: [22, 23]
outcomes:
  - "Calculate and interpret descriptive statistics"
  - "Understand data distributions"
  - "Measure and interpret correlations"
  - "Use percentiles for ranking and segmentation"
---

# 🎯 Day 26: Statistics for Business

> *"Without data, you're just another person with an opinion." — W. Edwards Deming*

---

## The "Never-Coded" Bridge

**Imagine you're presenting to the CEO.** She asks: "What's the average order value?" You say $150. She follows up: "But what does a *typical* customer actually spend?"

Suddenly you realize—a few whale customers spending $10,000+ are pulling that average up. The *typical* customer spends only $75. You just learned the difference between mean and median the hard way.

**Statistics answers business questions:**

- "What's our average order value?" → **Mean**
- "What does a typical customer spend?" → **Median** (robust to outliers)
- "How spread out are sales figures?" → **Standard deviation**
- "Does marketing spend affect revenue?" → **Correlation**
- "Who are our top 10% customers?" → **Percentiles**
- "Is this month's performance unusual?" → **Z-scores**

**Real-world applications:**

- **Amazon**: Uses percentile-based ranking for product recommendations
- **Netflix**: Correlation analysis to understand viewing patterns
- **Insurance**: Standard deviation to price risk
- **HR**: Salary benchmarking with percentiles (P25, P50, P75)

---

## The Technical Deep Dive

### Measures of Central Tendency

Central tendency tells you where the "center" of your data lies.

```python
import numpy as np
import pandas as pd

sales = pd.Series(
    [100, 150, 200, 180, 220, 300, 50, 175, 10000]
)  # Note: 10000 is outlier

# Mean: Sum divided by count
mean_sales = sales.mean()
print(f"Mean: ${mean_sales:,.2f}")  # $1,263.89 - pulled up by outlier!

# Median: Middle value (50th percentile)
median_sales = sales.median()
print(f"Median: ${median_sales:,.2f}")  # $180.00 - not affected by outlier

# Mode: Most frequent value (for categorical/discrete data)
categories = pd.Series(
    ["Electronics", "Clothing", "Electronics", "Home", "Electronics"]
)
print(f"Mode: {categories.mode()[0]}")  # Electronics
```

### When to Use Mean vs Median

| Scenario                    | Use    | Reason                          |
| --------------------------- | ------ | ------------------------------- |
| Symmetric data, no outliers | Mean   | Best estimate of expected value |
| Skewed data or outliers     | Median | Robust to extreme values        |
| Salary analysis             | Median | CEO salaries skew mean upward   |
| Test scores                 | Mean   | Typically normally distributed  |
| Home prices                 | Median | Luxury homes distort mean       |
| Response times              | Median | Slow requests create right skew |

```python
# Classic example: Income data
incomes = [50000, 55000, 60000, 52000, 1000000]  # CEO outlier

print(f"Mean income: ${np.mean(incomes):,.0f}")  # $243,400 (misleading!)
print(f"Median income: ${np.median(incomes):,.0f}")  # $55,000 (realistic)
```

### Measures of Spread

Spread tells you how dispersed your data is around the center.

```python
df = pd.DataFrame({"revenue": [1000, 1100, 1050, 1200, 950, 1150, 1000, 1100]})

# Range: Max - Min
data_range = df["revenue"].max() - df["revenue"].min()
print(f"Range: ${data_range}")  # $250

# Variance: Average squared distance from mean
variance = df["revenue"].var()
print(f"Variance: {variance:,.2f}")

# Standard Deviation: Square root of variance (same units as data)
std_dev = df["revenue"].std()
print(f"Std Dev: ${std_dev:,.2f}")  # Typical deviation from mean

# Interquartile Range (IQR): Q3 - Q1 (robust to outliers)
Q1 = df["revenue"].quantile(0.25)
Q3 = df["revenue"].quantile(0.75)
IQR = Q3 - Q1
print(f"IQR: ${IQR:,.2f}")

# Quick summary
print(df["revenue"].describe())
```

### Correlation

Correlation measures the strength and direction of relationships between variables.

```python
df = pd.DataFrame(
    {
        "marketing_spend": [1000, 2000, 1500, 3000, 2500, 4000, 3500],
        "revenue": [10000, 18000, 14000, 28000, 22000, 35000, 32000],
        "temperature": [72, 68, 75, 80, 65, 78, 82],
    }
)

# Correlation matrix
correlation = df.corr()
print(correlation)

# Individual correlation
marketing_revenue_corr = df["marketing_spend"].corr(df["revenue"])
print(f"Marketing vs Revenue correlation: {marketing_revenue_corr:.3f}")
```

**Interpreting Correlation Coefficients:**

| Range        | Strength   | Interpretation                   |
| ------------ | ---------- | -------------------------------- |
| 0.7 to 1.0   | Strong +   | Variables move together strongly |
| 0.3 to 0.7   | Moderate + | Noticeable positive relationship |
| -0.3 to 0.3  | Weak       | Little to no linear relationship |
| -0.7 to -0.3 | Moderate - | Inverse relationship             |
| -1.0 to -0.7 | Strong -   | Variables move opposite strongly |

> ⚠️ **Remember**: Correlation does not imply causation! Ice cream sales and drowning deaths are correlated—both increase in summer.

### Percentiles and Rankings

Percentiles divide your data into 100 equal parts. Essential for benchmarking.

**What is a Percentile?** A **percentile** tells you what percentage of values in a dataset fall *below* a given value. For example, if your salary is at the **75th percentile**, 75% of people earn less than you. Percentiles divide ranked data into 100 equal parts.

**What is a Quantile?** A **quantile** is the generalized form. Quantiles divide data into equal-sized groups using proportions (0 to 1) instead of percentages (0 to 100). So the **0.75 quantile** is the same as the **75th percentile**. Pandas uses the 0–1 scale: `df["col"].quantile(0.75)`.

**Business uses of percentiles:**
- **P50 (Median)**: The "typical" value — half the data is above, half below
- **P75**: The threshold above which the top 25% of values lie (e.g., "top quartile" performers)
- **P90 / P95**: Common SLA thresholds (e.g., "95% of requests complete under 200ms")
- **P25**: The lower quartile — 25% of data falls below this point

```python
df = pd.DataFrame(
    {
        "sales_rep": ["Alice", "Bob", "Charlie", "Diana", "Eve"],
        "revenue": [50000, 75000, 125000, 200000, 300000],
    }
)

# Calculate percentiles
print(f"25th percentile: ${df['revenue'].quantile(0.25):,.0f}")
print(f"50th percentile (median): ${df['revenue'].quantile(0.50):,.0f}")
print(f"75th percentile: ${df['revenue'].quantile(0.75):,.0f}")
print(f"90th percentile: ${df['revenue'].quantile(0.90):,.0f}")

# Percentile rank (where does each value stand?)
df["percentile_rank"] = df["revenue"].rank(pct=True) * 100
print(df)

# Identify top performers (above 75th percentile)
threshold = df["revenue"].quantile(0.75)
top_performers = df[df["revenue"] >= threshold]
print(f"\nTop 25% performers:\n{top_performers}")
```

### Distributions

Understanding distributions helps you choose the right statistical methods.

**What is Skewness?** Skewness measures the asymmetry of a distribution:

- **Right-skewed (positive skew):** The tail extends to the right. The mean is pulled *above* the median by high outliers. Most business data (revenue, salaries, customer spend) is right-skewed — a few large values drag the mean up.
- **Left-skewed (negative skew):** The tail extends to the left. The mean falls *below* the median.
- **Symmetric (skew ≈ 0):** Mean ≈ median (e.g., heights of adults).

**Why skewness matters for your analysis:** When data is skewed, the **mean is misleading** as a measure of "typical." Always check skewness before using the mean in a report. Use `df["col"].skew()` — values above 1 or below -1 indicate significant skew.

**`np.random.exponential` vs `np.random.normal`:** We use `np.random.exponential` to simulate **right-skewed** data (like customer purchase amounts, where most buy small amounts but a few buy a lot) and `np.random.normal` to simulate **symmetric, bell-curve** data (like product ratings or measurement errors). This distinction matters: using the wrong distribution assumption for a test can produce misleading p-values.

```python
import numpy as np
import matplotlib.pyplot as plt

# Normal (Gaussian) distribution - bell curve
normal_data = np.random.normal(loc=100, scale=15, size=1000)

# Uniform distribution - equal probability
uniform_data = np.random.uniform(low=0, high=100, size=1000)

# Skewed distribution (common in business data)
skewed_data = np.random.exponential(scale=50, size=1000)

# Visualize
fig, axes = plt.subplots(1, 3, figsize=(15, 4))
axes[0].hist(normal_data, bins=30, edgecolor="black")
axes[0].set_title("Normal Distribution")
axes[1].hist(uniform_data, bins=30, edgecolor="black")
axes[1].set_title("Uniform Distribution")
axes[2].hist(skewed_data, bins=30, edgecolor="black")
axes[2].set_title("Skewed Distribution")
plt.tight_layout()
plt.show()

# Check skewness
from scipy.stats import skew

print(f"Normal skew: {skew(normal_data):.3f}")  # Near 0
print(f"Skewed data skew: {skew(skewed_data):.3f}")  # Positive = right skew
```

---

## Senior-Level Insights

### Statistical Significance vs Practical Significance

> **Just because something is statistically significant doesn't mean it matters for business.**

Example: You run an A/B test and find that Version B increases conversion by 0.1% with p < 0.05. Statistically significant—but is a 0.1% improvement worth the engineering effort to implement?

Always ask:

1. Is the effect size meaningful for the business?
2. What's the cost to implement vs. expected revenue gain?
3. Is the sample representative of your actual user base?

### Common Statistical Mistakes in Business

| Mistake                              | Reality Check                                           |
| ------------------------------------ | ------------------------------------------------------- |
| Confusing correlation with causation | Run controlled experiments before concluding X causes Y |
| Using mean with skewed data          | Check distribution first; consider median               |
| Ignoring sample size                 | Small samples = unreliable statistics                   |
| Cherry-picking time periods          | "Revenue up 50%!" vs. "from all-time low last week"     |
| Averaging percentages                | Must weight by sample size                              |

### When to Escalate to a Data Scientist

Handle these yourself:

- Descriptive statistics (mean, median, std)
- Simple correlations
- Percentile-based segmentation
- Basic A/B test interpretation

Escalate when:

- Hypothesis testing with multiple comparisons
- Causal inference is needed
- Predictive modeling requirements
- Time series with seasonality adjustments
- Sample size calculations for new experiments

### Production Considerations

```python
# Always validate data before computing statistics
def safe_statistics(series, name="column"):
    """Compute statistics with validation."""
    if series.isnull().all():
        raise ValueError(f"{name}: All values are null")

    n = len(series.dropna())
    if n < 30:
        print(
            f"Warning: {name} has only {n} valid values. Statistics may be unreliable."
        )

    return {
        "count": n,
        "mean": series.mean(),
        "median": series.median(),
        "std": series.std(),
        "min": series.min(),
        "max": series.max(),
    }
```

### A/B Testing Fundamentals

A/B testing is how businesses use statistics to make decisions. You show version A to one group of customers and version B to another, then test whether any observed difference is **statistically significant** or just random noise.

**Key concepts:**

- **Null Hypothesis (H₀):** There is no difference between A and B (the observed difference is due to chance)
- **Alternative Hypothesis (H₁):** B is genuinely different from A
- **p-value:** The probability of seeing a difference this large *by chance alone*, assuming H₀ is true. A p-value < 0.05 is the standard threshold for "statistical significance."
- **Statistical significance vs. practical significance:** A result can be statistically significant (p < 0.05) but so small it doesn't matter for the business. Always report **effect size** alongside p-values.

```python
from scipy import stats
import numpy as np

np.random.seed(42)
# Conversion rates: Version A = 10%, Version B = 12%
control = np.random.binomial(1, 0.10, 1000)   # Group A
treatment = np.random.binomial(1, 0.12, 1000)  # Group B

t_stat, p_value = stats.ttest_ind(control, treatment)
print(f"Control conversion rate: {control.mean():.1%}")
print(f"Treatment conversion rate: {treatment.mean():.1%}")
print(f"p-value: {p_value:.4f}")

if p_value < 0.05:
    print("✓ Statistically significant — B outperforms A")
else:
    print("✗ Not significant — could be random variation")
```

---

## Hands-on Lab

### Exercise 1: Revenue Analysis

**Business Scenario:** You are the CFO's analyst. Monthly revenue data for the past year includes one unusually large month (July) caused by a one-time enterprise contract. The CFO wants to know: (a) how much this outlier inflates the average, (b) what the "normal" baseline revenue looks like, and (c) what number to use for forecasting.

**Your Task:**
1. Compute mean, median, and standard deviation WITH the outlier included
2. Detect the outlier using the IQR method
3. Compute the same statistics WITHOUT the outlier
4. Print a business insight explaining the distortion and the recommended forecast figure

```python
import pandas as pd
import numpy as np

# Monthly revenue data with outlier
monthly_revenue = pd.DataFrame(
    {
        "month": pd.date_range("2024-01-01", periods=12, freq="M"),
        "revenue": [
            50000,
            55000,
            48000,
            62000,
            58000,
            65000,
            500000,  # Outlier: one-time large contract
            70000,
            72000,
            68000,
            75000,
            80000,
        ],
    }
)


# Task: Analyze revenue with and without the outlier
def analyze_revenue(df):
    """Compare statistics with and without outliers."""
    revenue = df["revenue"]

    # With outlier
    print("=== With Outlier ===")
    print(f"Mean: ${revenue.mean():,.2f}")
    print(f"Median: ${revenue.median():,.2f}")
    print(f"Std Dev: ${revenue.std():,.2f}")

    # Detect outlier using IQR
    Q1, Q3 = revenue.quantile(0.25), revenue.quantile(0.75)
    IQR = Q3 - Q1
    outliers = df[(revenue < Q1 - 1.5 * IQR) | (revenue > Q3 + 1.5 * IQR)]
    print(f"\nOutliers detected: {len(outliers)}")
    print(outliers)

    # Without outlier
    clean_revenue = revenue[(revenue >= Q1 - 1.5 * IQR) & (revenue <= Q3 + 1.5 * IQR)]
    print("\n=== Without Outlier ===")
    print(f"Mean: ${clean_revenue.mean():,.2f}")
    print(f"Median: ${clean_revenue.median():,.2f}")
    print(f"Std Dev: ${clean_revenue.std():,.2f}")

    # Business insight
    print("\n=== Business Insight ===")
    print(
        f"The outlier inflated the mean by ${revenue.mean() - clean_revenue.mean():,.2f}"
    )
    print(
        f"For forecasting, use median (${revenue.median():,.2f}) or exclude one-time contracts"
    )


analyze_revenue(monthly_revenue)
```

**Expected Output:**
```
=== With Outlier ===
Mean: $97,500.00
Median: $66,500.00
Std Dev: $123,614.27

Outliers detected: 1
        month  revenue
6  2024-07-31   500000

=== Without Outlier ===
Mean: $63,909.09
Median: $65,000.00
Std Dev: $10,124.27

=== Business Insight ===
The outlier inflated the mean by $33,590.91
For forecasting, use median ($66,500.00) or exclude one-time contracts
```

---

### Exercise 2: Customer Segmentation

**Business Scenario:** The marketing team wants to move from "one-size-fits-all" campaigns to targeted messaging. They need customers segmented by three dimensions: **total lifetime spend** (how valuable), **average order value** (what they buy), and **recency** (how recently they purchased). The goal is to identify Champions (high value, recent buyers) vs. At-Risk customers (previously active but gone quiet).

**Your Task:**
1. Compute percentile rank for `total_purchases`, `avg_order_value`, and `days_since_last_order`
2. Note: for recency, a LOWER `days_since_last_order` means MORE recent — so invert the ranking
3. Assign each customer to a segment based on the thresholds in `assign_segment()`
4. Produce a summary table showing count, mean/median spend, and median recency per segment

```python
import pandas as pd
import numpy as np

np.random.seed(42)
customers = pd.DataFrame(
    {
        "customer_id": range(1, 101),
        "total_purchases": np.random.exponential(500, 100),  # Skewed distribution
        "avg_order_value": np.random.normal(75, 25, 100),
        "days_since_last_order": np.random.exponential(30, 100),
    }
)


def segment_customers(df):
    """Segment customers using percentile-based approach."""

    # Calculate percentiles for each metric
    df["purchase_percentile"] = df["total_purchases"].rank(pct=True) * 100
    df["aov_percentile"] = df["avg_order_value"].rank(pct=True) * 100
    df["recency_percentile"] = (
        1 - df["days_since_last_order"].rank(pct=True)
    ) * 100  # Inverse for recency

    # Create segments
    def assign_segment(row):
        if row["purchase_percentile"] >= 80 and row["recency_percentile"] >= 50:
            return "Champions"
        elif row["purchase_percentile"] >= 50:
            return "Loyal Customers"
        elif row["recency_percentile"] >= 80:
            return "Recent Customers"
        elif row["recency_percentile"] <= 20:
            return "At Risk"
        else:
            return "Average"

    df["segment"] = df.apply(assign_segment, axis=1)

    # Summary by segment
    summary = (
        df.groupby("segment")
        .agg(
            {
                "customer_id": "count",
                "total_purchases": ["mean", "median"],
                "days_since_last_order": "median",
            }
        )
        .round(2)
    )

    return df, summary


segmented, summary = segment_customers(customers)
print("=== Customer Segment Summary ===")
print(summary)
print(f"\nSegment distribution:\n{segmented['segment'].value_counts()}")
```

**Expected Output (values are approximate due to random seed):**
```
=== Customer Segment Summary ===
                   customer_id total_purchases           days_since_last_order
                         count            mean   median                 median
segment
At Risk                     21          135.46    87.23                 134.56
Average                     44          432.18   352.41                  38.21
Champions                   12         1876.23  1654.32                   5.41
Loyal Customers             18          789.34   623.45                  28.67
Recent Customers             5          112.34    98.23                   2.34

Segment distribution:
Average            44
At Risk            21
Loyal Customers    18
Champions          12
Recent Customers    5
```

---

### Exercise 3: Correlation Dashboard

**Business Scenario:** The Head of Growth wants to understand which variables actually drive revenue. She suspects marketing spend is the primary driver, but wants to rule out external factors like weather. You have 100 weeks of data covering marketing spend, website traffic, revenue, and average temperature.

**Your Task:**
1. Build a full correlation matrix for all four variables
2. For each key pair, print the correlation coefficient and classify its strength (Strong/Moderate/Weak)
3. Identify which variable is the best predictor of revenue
4. Note which variable shows near-zero correlation (the control variable)

```python
import pandas as pd
import numpy as np

np.random.seed(42)

# Generate correlated marketing data
n = 100
marketing_spend = np.random.uniform(1000, 10000, n)
website_traffic = marketing_spend * 5 + np.random.normal(
    0, 5000, n
)  # Strong correlation
revenue = website_traffic * 0.1 + np.random.normal(0, 500, n)  # Moderate correlation
temperature = np.random.normal(70, 10, n)  # No correlation (control variable)

df = pd.DataFrame(
    {
        "marketing_spend": marketing_spend,
        "website_traffic": website_traffic,
        "revenue": revenue,
        "temperature": temperature,
    }
)


def correlation_analysis(df):
    """Analyze and interpret correlations."""
    corr_matrix = df.corr()

    print("=== Correlation Matrix ===")
    print(corr_matrix.round(3))

    print("\n=== Interpretation ===")
    pairs = [
        ("marketing_spend", "website_traffic"),
        ("marketing_spend", "revenue"),
        ("website_traffic", "revenue"),
        ("temperature", "revenue"),
    ]

    for var1, var2 in pairs:
        r = df[var1].corr(df[var2])
        strength = "Strong" if abs(r) > 0.7 else "Moderate" if abs(r) > 0.3 else "Weak"
        direction = "positive" if r > 0 else "negative"
        print(f"{var1} vs {var2}: r = {r:.3f} ({strength} {direction})")

    # Business recommendations
    print("\n=== Business Insights ===")
    mkt_traffic = df["marketing_spend"].corr(df["website_traffic"])
    if mkt_traffic > 0.5:
        print(f"✓ Marketing spend strongly drives traffic (r={mkt_traffic:.2f})")
        print("  → Continue investing in marketing channels")


correlation_analysis(df)
```

**Expected Output (values are approximate due to random seed):**
```
=== Correlation Matrix ===
                  marketing_spend  website_traffic  revenue  temperature
marketing_spend             1.000            0.894    0.765        0.053
website_traffic             0.894            1.000    0.889        0.047
revenue                     0.765            0.889    1.000        0.021
temperature                 0.053            0.047    0.021        1.000

=== Interpretation ===
marketing_spend vs website_traffic: r = 0.894 (Strong positive)
marketing_spend vs revenue: r = 0.765 (Strong positive)
website_traffic vs revenue: r = 0.889 (Strong positive)
temperature vs revenue: r = 0.021 (Weak positive)

=== Business Insights ===
✓ Marketing spend strongly drives traffic (r=0.89)
  → Continue investing in marketing channels
```

---

## Mastery Check

### Question 1: Mean vs Median

A startup reports "average salary is $150,000." You suspect this is misleading. What additional statistic would you request, and why?

<details>
<summary>Click for Answer</summary>

**Request the median salary.**

The mean can be inflated by a few high-earners (founders, executives). If the median is significantly lower (e.g., $80,000), it indicates:

- Most employees earn far less than the "average"
- The distribution is right-skewed
- The mean misrepresents typical employee compensation

**Also useful:**

- Salary percentiles (P25, P50, P75)
- Breakdown by role/level

</details>

---

### Question 2: Correlation Interpretation

Marketing shows you a correlation of 0.95 between social media posts and sales. Should you 10x your social media budget?

<details>
<summary>Click for Answer</summary>

**Not necessarily.** Consider these cautions:

1. **Correlation ≠ causation**: Both might be driven by a third variable (e.g., holiday season increases both)

2. **Diminishing returns**: The relationship may not be linear at higher spending levels

3. **Sample bias**: Was this measured during a promotional period?

4. **What to do instead:**
   - Run a controlled A/B test with actual budget changes
   - Analyze by channel to see which platforms actually drive conversions
   - Check if the correlation holds across different time periods

The 0.95 correlation is a signal to investigate further, not a mandate to scale.

</details>

---

### Question 3: Percentile Application

HR asks you to determine "competitive salary" for a role. How would you use percentiles?

<details>
<summary>Click for Answer</summary>

**Use market data percentiles:**

- **P25 (25th percentile)**: Entry-level or below-market targeting
- **P50 (50th percentile)**: "Competitive" middle-of-market
- **P75-P90**: Premium positioning to attract top talent

**Practical approach:**

```python
market_salaries = [..."industry data"]
print(f"Entry-level target: P25 = ${np.percentile(market_salaries, 25):,.0f}")
print(f"Competitive target: P50 = ${np.percentile(market_salaries, 50):,.0f}")
print(f"Premium target: P75 = ${np.percentile(market_salaries, 75):,.0f}")
```

**Recommendation formula:**

- "Meet market": Pay at P50
- "Lead market": Pay at P60-P75
- "Lag market" (cost-cutting): Pay at P25-P40

</details>

---

### Question 4: Debugging Challenge

Your colleague calculates that the average of [20%, 50%, 80%] is 50%. But when you check the underlying data, the weighted average is 35%. What went wrong?

<details>
<summary>Click for Answer</summary>

**You can't simply average percentages without weighting by sample size.**

**Example:**

```python
# Three groups with different sizes
group_a = {"success_rate": 0.20, "sample_size": 1000}
group_b = {"success_rate": 0.50, "sample_size": 100}
group_c = {"success_rate": 0.80, "sample_size": 50}

# Wrong: Simple average
simple_avg = (0.20 + 0.50 + 0.80) / 3  # 0.50 or 50%

# Correct: Weighted average
total_successes = 0.20 * 1000 + 0.50 * 100 + 0.80 * 50  # 200 + 50 + 40 = 290
total_samples = 1000 + 100 + 50  # 1150
weighted_avg = total_successes / total_samples  # 290/1150 ≈ 0.252 or 25.2%
```

The simple average over-weights small groups. Always weight by sample size.

</details>

---

### Question 5: Design Scenario

You need to set up automated alerts for "unusual" daily sales. How would you define "unusual" statistically?

<details>
<summary>Click for Answer</summary>

**Use Z-scores or percentile-based thresholds:**

**Method 1: Z-score approach**

```python
mean = df["daily_sales"].mean()
std = df["daily_sales"].std()


def is_unusual(value, threshold=2):
    z_score = (value - mean) / std
    return abs(z_score) > threshold  # Alert if beyond 2 std deviations


# Alert conditions:
# z > 2: Unusually high (investigate opportunity)
# z < -2: Unusually low (investigate problem)
```

**Method 2: Percentile approach (robust to outliers)**

```python
p5 = df["daily_sales"].quantile(0.05)  # Lower bound
p95 = df["daily_sales"].quantile(0.95)  # Upper bound


def is_unusual(value):
    return value < p5 or value > p95
```

**Best practice:**

- Start with 2 standard deviations (catches ~5% of days)
- Adjust threshold based on false alert rate
- Consider day-of-week patterns (Monday vs. Saturday may differ)
- Track running statistics to adapt to trends

</details>

---

## Summary

Today you learned:

- ✅ Mean vs. median: choose based on distribution shape
- ✅ Standard deviation: quantify data spread
- ✅ Correlation: measure relationship strength (but not causation!)
- ✅ Percentiles: rank data and define thresholds
- ✅ Distributions: understand data shape before analysis
- ✅ Business context: statistical significance vs. practical significance

**Tomorrow**: Data visualization fundamentals—transforming these statistics into compelling visuals.
