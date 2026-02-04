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
  - scipy
concepts:
  - "descriptive statistics"
  - "distributions"
  - "correlation and causation"
  - "hypothesis testing"
  - "confidence intervals"
prerequisites: [22, 23]
outcomes:
  - "Calculate and interpret descriptive statistics"
  - "Understand probability distributions"
  - "Analyze relationships between variables"
  - "Perform basic hypothesis testing"
---

# 🎯 Day 26: Statistics for Business

> *"Without data, you're just another person with an opinion." — W. Edwards Deming*

---

## The "Never-Coded" Bridge

**You're in a board meeting. The VP of Sales declares:**

"Our new campaign increased revenue by 15%! We should double the budget!"

**But the CFO asks the right question:**

"Is that 15% statistically significant, or just random variation?"

**Without statistics, you're gambling. With statistics, you're making informed decisions.**

Think of statistics as your BS detector:
- Your e-commerce site shows a 2% conversion rate increase after a redesign. Real improvement, or random noise?
- Employee satisfaction scores dropped 5 points. Fire the manager, or wait for more data?
- Two products have similar average ratings. Which has more consistent quality?

**Real-world impact:**
- Netflix saves $1B/year by A/B testing with statistical rigor
- Amazon changes button colors based on statistical significance
- Hospitals determine drug effectiveness through hypothesis testing

Statistics turns "I think" into "I know."

---

## The Technical Deep Dive

### Descriptive Statistics: The Foundation

```python
import numpy as np
import pandas as pd
from scipy import stats

# Sales data for a retail chain
sales = pd.Series([
    1200, 1350, 1180, 1420, 1380, 1290, 1450, 1320,
    1280, 1390, 1500, 1260, 1410, 1340, 1480, 1300
])

print("=== Descriptive Statistics ===")
print(f"Count: {sales.count()}")
print(f"Mean (Average): ${sales.mean():,.2f}")
print(f"Median (50th percentile): ${sales.median():,.2f}")
print(f"Mode (Most common): {sales.mode().values}")
print(f"Standard Deviation: ${sales.std():,.2f}")
print(f"Variance: {sales.var():,.2f}")
print(f"Min: ${sales.min():,.2f}")
print(f"Max: ${sales.max():,.2f}")
print(f"Range: ${sales.max() - sales.min():,.2f}")

# Quartiles
print(f"\n=== Quartiles ===")
print(f"25th percentile (Q1): ${sales.quantile(0.25):,.2f}")
print(f"50th percentile (Q2/Median): ${sales.quantile(0.50):,.2f}")
print(f"75th percentile (Q3): ${sales.quantile(0.75):,.2f}")
print(f"IQR (Q3-Q1): ${sales.quantile(0.75) - sales.quantile(0.25):,.2f}")

# Comprehensive summary
print(f"\n=== Pandas describe() ===")
print(sales.describe())
```

### When to Use Mean vs Median vs Mode

```python
def analyze_central_tendency(data, label):
    """
    Comprehensive analysis of central tendency.
    
    Decision tree:
    - Normal distribution, no outliers → Mean
    - Skewed distribution, has outliers → Median
    - Categorical/discrete → Mode
    """
    
    mean = np.mean(data)
    median = np.median(data)
    try:
        mode = stats.mode(data, keepdims=True)[0][0]
    except:
        mode = "No unique mode"
    
    # Check for skewness
    skewness = stats.skew(data)
    
    # Check for outliers (beyond 1.5 IQR)
    Q1, Q3 = np.percentile(data, [25, 75])
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    outliers = data[(data < lower_bound) | (data > upper_bound)]
    
    print(f"\n=== Central Tendency Analysis: {label} ===")
    print(f"Mean: {mean:,.2f}")
    print(f"Median: {median:,.2f}")
    print(f"Mode: {mode}")
    print(f"Skewness: {skewness:.2f} ", end="")
    
    if abs(skewness) < 0.5:
        print("(Approximately symmetric)")
    elif skewness > 0:
        print("(Right-skewed/positive skew)")
    else:
        print("(Left-skewed/negative skew)")
    
    print(f"Outliers: {len(outliers)} ({len(outliers)/len(data)*100:.1f}%)")
    
    # Recommendation
    if abs(skewness) < 0.5 and len(outliers) == 0:
        print("✓ Recommendation: Use MEAN (symmetric, no outliers)")
    elif len(outliers) > 0 or abs(skewness) > 0.5:
        print("✓ Recommendation: Use MEDIAN (skewed or has outliers)")
    
    return mean, median, mode

# Example 1: Employee salaries (right-skewed)
salaries = np.array([50000, 52000, 55000, 58000, 60000, 62000, 65000, 
                     68000, 70000, 75000, 80000, 95000, 250000])  # CEO
analyze_central_tendency(salaries, "Employee Salaries")

# Example 2: Test scores (symmetric)
test_scores = np.random.normal(75, 10, 100)
analyze_central_tendency(test_scores, "Test Scores")
```

### Measures of Spread: Understanding Variability

```python
def analyze_spread(data, label):
    """
    Analyze variability in data.
    
    Low variability = Consistent/predictable
    High variability = Inconsistent/risky
    """
    
    std = np.std(data, ddof=1)  # Sample standard deviation
    var = np.var(data, ddof=1)
    range_val = np.ptp(data)  # Peak to peak (max - min)
    
    # Coefficient of variation (CV): relative variability
    cv = (std / np.mean(data)) * 100
    
    print(f"\n=== Spread Analysis: {label} ===")
    print(f"Range: {range_val:,.2f}")
    print(f"Variance: {var:,.2f}")
    print(f"Standard Deviation: {std:,.2f}")
    print(f"Coefficient of Variation: {cv:.2f}%")
    
    # Interpretation
    if cv < 15:
        print("→ Low variability (consistent)")
    elif cv < 30:
        print("→ Moderate variability")
    else:
        print("→ High variability (inconsistent)")

# Product quality scores
product_a = np.array([4.5, 4.6, 4.4, 4.7, 4.5, 4.6, 4.5])  # Consistent
product_b = np.array([2.0, 5.0, 3.5, 4.8, 2.2, 4.9, 3.0])  # Inconsistent

analyze_spread(product_a, "Product A")
analyze_spread(product_b, "Product B")
```

### Correlation: Measuring Relationships

```python
def analyze_correlation(x, y, x_label, y_label):
    """
    Comprehensive correlation analysis.
    
    Correlation coefficient (r):
    - +1.0: Perfect positive correlation
    -  0.0: No correlation
    - -1.0: Perfect negative correlation
    
    Interpretation:
    - |r| > 0.7: Strong
    - |r| 0.4-0.7: Moderate
    - |r| < 0.4: Weak
    """
    
    # Pearson correlation (linear relationships)
    r, p_value = stats.pearsonr(x, y)
    
    # Spearman correlation (monotonic relationships, robust to outliers)
    r_spearman, p_spearman = stats.spearmanr(x, y)
    
    print(f"\n=== Correlation: {x_label} vs {y_label} ===")
    print(f"Pearson r: {r:.3f}")
    print(f"P-value: {p_value:.4f}")
    
    # Interpret strength
    if abs(r) > 0.7:
        strength = "Strong"
    elif abs(r) > 0.4:
        strength = "Moderate"
    else:
        strength = "Weak"
    
    direction = "positive" if r > 0 else "negative"
    print(f"Interpretation: {strength} {direction} correlation")
    
    # Statistical significance
    if p_value < 0.05:
        print("✓ Statistically significant (p < 0.05)")
    else:
        print("✗ NOT statistically significant (p >= 0.05)")
    
    # Coefficient of determination (R²)
    r_squared = r ** 2
    print(f"R² = {r_squared:.3f} ({r_squared*100:.1f}% of variance explained)")
    
    return r, p_value

# Example: Marketing spend vs Revenue
marketing = np.array([1000, 1500, 2000, 2500, 3000, 3500, 4000])
revenue = np.array([10000, 14000, 18000, 21000, 24000, 27000, 29000])

analyze_correlation(marketing, revenue, "Marketing Spend", "Revenue")

# Spurious correlation example
ice_cream_sales = np.array([100, 150, 200, 250, 300, 350, 400])
drowning_incidents = np.array([5, 7, 10, 12, 15, 18, 20])

analyze_correlation(ice_cream_sales, drowning_incidents, 
                   "Ice Cream Sales", "Drowning Incidents")
print("\n⚠️  WARNING: Correlation ≠ Causation!")
print("    Both are caused by hot weather (confounding variable)")
```

### Correlation Matrix for Multiple Variables

```python
# Create comprehensive business dataset
df = pd.DataFrame({
    'marketing_spend': [1000, 2000, 1500, 3000, 2500, 1800, 2200, 2800],
    'sales_calls': [50, 80, 60, 100, 90, 70, 85, 95],
    'customer_visits': [200, 350, 250, 450, 400, 300, 370, 420],
    'revenue': [10000, 18000, 14000, 28000, 22000, 16000, 19000, 25000],
    'customer_satisfaction': [4.2, 4.5, 4.0, 4.8, 4.6, 4.3, 4.4, 4.7]
})

# Calculate correlation matrix
corr_matrix = df.corr()

print("=== Correlation Matrix ===")
print(corr_matrix)

# Find strong correlations
print("\n=== Strong Correlations (|r| > 0.7) ===")
for i in range(len(corr_matrix.columns)):
    for j in range(i+1, len(corr_matrix.columns)):
        if abs(corr_matrix.iloc[i, j]) > 0.7:
            print(f"{corr_matrix.columns[i]} <-> {corr_matrix.columns[j]}: {corr_matrix.iloc[i, j]:.3f}")

# Visualize with heatmap (conceptual - would need matplotlib/seaborn)
print("\n=== Heatmap Code ===")
print("""
import matplotlib.pyplot as plt
import seaborn as sns

plt.figure(figsize=(10, 8))
sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0, 
            square=True, linewidths=1, cbar_kws={"shrink": 0.8})
plt.title('Correlation Heatmap')
plt.show()
""")
```

### Probability Distributions

```python
def demonstrate_distributions():
    """
    Common distributions in business analytics.
    """
    
    # 1. Normal Distribution (Gaussian)
    print("=== Normal Distribution ===")
    print("Use cases: Heights, test scores, measurement errors")
    
    normal_data = np.random.normal(loc=100, scale=15, size=1000)
    print(f"Mean: {np.mean(normal_data):.2f}")
    print(f"Std: {np.std(normal_data):.2f}")
    print(f"68% of data between: {100-15:.2f} and {100+15:.2f}")
    print(f"95% of data between: {100-2*15:.2f} and {100+2*15:.2f}")
    print(f"99.7% of data between: {100-3*15:.2f} and {100+3*15:.2f}")
    
    # 2. Uniform Distribution
    print("\n=== Uniform Distribution ===")
    print("Use cases: Random sampling, simulations")
    
    uniform_data = np.random.uniform(low=0, high=100, size=1000)
    print(f"All values equally likely between 0 and 100")
    print(f"Mean: {np.mean(uniform_data):.2f} (should be ~50)")
    
    # 3. Exponential Distribution
    print("\n=== Exponential Distribution ===")
    print("Use cases: Time between events (customer arrivals, failures)")
    
    # Average time between customers = 5 minutes
    time_between_customers = np.random.exponential(scale=5, size=1000)
    print(f"Average time between customers: {np.mean(time_between_customers):.2f} min")
    
    # 4. Poisson Distribution
    print("\n=== Poisson Distribution ===")
    print("Use cases: Count of events (website visits per hour, defects per batch)")
    
    # Average 10 website visits per hour
    visits_per_hour = np.random.poisson(lam=10, size=100)
    print(f"Average visits per hour: {np.mean(visits_per_hour):.2f}")
    
    # 5. Binomial Distribution
    print("\n=== Binomial Distribution ===")
    print("Use cases: Success/failure outcomes (conversions, defects)")
    
    # 100 trials, 30% success rate
    successes = np.random.binomial(n=100, p=0.3, size=1000)
    print(f"Expected successes out of 100 trials: {np.mean(successes):.2f}")

demonstrate_distributions()
```

### Hypothesis Testing Basics

```python
def perform_hypothesis_test(sample1, sample2, label1, label2):
    """
    Two-sample t-test: Are two groups significantly different?
    
    H0 (Null Hypothesis): No difference between groups
    H1 (Alternative): Groups are different
    
    If p-value < 0.05: Reject H0 (significant difference)
    If p-value >= 0.05: Fail to reject H0 (no significant difference)
    """
    
    # Two-sample t-test
    t_stat, p_value = stats.ttest_ind(sample1, sample2)
    
    print(f"\n=== Hypothesis Test: {label1} vs {label2} ===")
    print(f"{label1} mean: {np.mean(sample1):.2f}")
    print(f"{label2} mean: {np.mean(sample2):.2f}")
    print(f"Difference: {np.mean(sample1) - np.mean(sample2):.2f}")
    print(f"\nT-statistic: {t_stat:.3f}")
    print(f"P-value: {p_value:.4f}")
    
    # Interpretation
    alpha = 0.05
    if p_value < alpha:
        print(f"✓ SIGNIFICANT (p < {alpha})")
        print(f"  → Reject null hypothesis")
        print(f"  → Groups ARE significantly different")
    else:
        print(f"✗ NOT SIGNIFICANT (p >= {alpha})")
        print(f"  → Fail to reject null hypothesis")
        print(f"  → No significant difference detected")
    
    # Effect size (Cohen's d)
    pooled_std = np.sqrt((np.var(sample1) + np.var(sample2)) / 2)
    cohens_d = (np.mean(sample1) - np.mean(sample2)) / pooled_std
    print(f"\nEffect size (Cohen's d): {cohens_d:.3f}")
    
    if abs(cohens_d) < 0.2:
        print("  → Small effect")
    elif abs(cohens_d) < 0.8:
        print("  → Medium effect")
    else:
        print("  → Large effect")
    
    return p_value

# Example: A/B Test - Old vs New Website Design
old_design_conversions = np.random.normal(2.5, 0.5, 100)  # 2.5% conversion rate
new_design_conversions = np.random.normal(2.8, 0.5, 100)  # 2.8% conversion rate

perform_hypothesis_test(old_design_conversions, new_design_conversions,
                       "Old Design", "New Design")

# Example 2: Two Marketing Campaigns
campaign_a_sales = np.random.normal(5000, 1000, 50)
campaign_b_sales = np.random.normal(5200, 1000, 50)

perform_hypothesis_test(campaign_a_sales, campaign_b_sales,
                       "Campaign A", "Campaign B")
```

### Confidence Intervals

```python
def calculate_confidence_interval(data, confidence=0.95):
    """
    Calculate confidence interval for mean.
    
    95% CI means: "We're 95% confident the true population mean
    falls within this range."
    """
    
    n = len(data)
    mean = np.mean(data)
    std_err = stats.sem(data)  # Standard error of the mean
    
    # T-distribution for small samples
    t_critical = stats.t.ppf((1 + confidence) / 2, n - 1)
    
    margin_of_error = t_critical * std_err
    ci_lower = mean - margin_of_error
    ci_upper = mean + margin_of_error
    
    print(f"\n=== {confidence*100:.0f}% Confidence Interval ===")
    print(f"Sample size: {n}")
    print(f"Sample mean: {mean:.2f}")
    print(f"Standard error: {std_err:.2f}")
    print(f"Margin of error: ±{margin_of_error:.2f}")
    print(f"Confidence interval: [{ci_lower:.2f}, {ci_upper:.2f}]")
    print(f"\nInterpretation:")
    print(f"We are {confidence*100:.0f}% confident that the true population mean")
    print(f"is between {ci_lower:.2f} and {ci_upper:.2f}")
    
    return ci_lower, ci_upper

# Example: Customer satisfaction scores
satisfaction_scores = np.random.normal(4.2, 0.8, 50)
calculate_confidence_interval(satisfaction_scores, confidence=0.95)
```

---

## Senior-Level Insights

### Statistical Power and Sample Size

```python
def calculate_required_sample_size(effect_size, power=0.8, alpha=0.05):
    """
    Calculate sample size needed for hypothesis testing.
    
    Parameters:
    - effect_size: Expected difference (Cohen's d)
    - power: Probability of detecting effect if it exists (typically 0.8)
    - alpha: Significance level (typically 0.05)
    
    Common effect sizes:
    - Small: 0.2
    - Medium: 0.5
    - Large: 0.8
    """
    
    from scipy.stats import norm
    
    z_alpha = norm.ppf(1 - alpha/2)
    z_beta = norm.ppf(power)
    
    n = 2 * ((z_alpha + z_beta) / effect_size) ** 2
    
    print(f"\n=== Sample Size Calculation ===")
    print(f"Effect size (Cohen's d): {effect_size}")
    print(f"Power: {power} (% chance of detecting effect)")
    print(f"Significance level (α): {alpha}")
    print(f"Required sample size per group: {int(np.ceil(n))}")
    
    return int(np.ceil(n))

# Example: A/B test planning
print("Planning an A/B test:")
print("Expected conversion rate increase: 2% to 2.4% (20% relative increase)")
calculate_required_sample_size(effect_size=0.2, power=0.8)  # Small effect
calculate_required_sample_size(effect_size=0.5, power=0.8)  # Medium effect
```

### Multiple Testing Correction (Bonferroni)

```python
def bonferroni_correction(p_values, alpha=0.05):
    """
    Adjust significance level for multiple comparisons.
    
    Problem: Testing 20 hypotheses at α=0.05 gives ~64% chance
    of at least one false positive.
    
    Solution: Divide α by number of tests.
    """
    
    n_tests = len(p_values)
    adjusted_alpha = alpha / n_tests
    
    print(f"\n=== Bonferroni Correction ===")
    print(f"Number of tests: {n_tests}")
    print(f"Original α: {alpha}")
    print(f"Adjusted α: {adjusted_alpha:.4f}")
    
    print(f"\nResults:")
    for i, p in enumerate(p_values):
        significant = "✓ Significant" if p < adjusted_alpha else "✗ Not significant"
        print(f"Test {i+1}: p={p:.4f} {significant}")
    
    return adjusted_alpha

# Example: Testing multiple product variants
p_values = [0.03, 0.01, 0.08, 0.15, 0.02]
bonferroni_correction(p_values)
```

### Simpson's Paradox

```python
def demonstrate_simpsons_paradox():
    """
    Simpson's Paradox: A trend in subgroups reverses when combined.
    
    Real example: UC Berkeley admission rates by gender
    """
    
    # Department A
    dept_a = pd.DataFrame({
        'Gender': ['Male', 'Female'],
        'Applied': [500, 100],
        'Admitted': [400, 90],
    })
    dept_a['Admit_Rate'] = dept_a['Admitted'] / dept_a['Applied']
    
    # Department B
    dept_b = pd.DataFrame({
        'Gender': ['Male', 'Female'],
        'Applied': [100, 500],
        'Admitted': [30, 200],
    })
    dept_b['Admit_Rate'] = dept_b['Admitted'] / dept_b['Applied']
    
    print("=== Simpson's Paradox Example ===")
    print("\nDepartment A (Easy to get in):")
    print(dept_a)
    print(f"  Male: {dept_a.iloc[0]['Admit_Rate']:.1%}")
    print(f"  Female: {dept_a.iloc[1]['Admit_Rate']:.1%}")
    
    print("\nDepartment B (Hard to get in):")
    print(dept_b)
    print(f"  Male: {dept_b.iloc[0]['Admit_Rate']:.1%}")
    print(f"  Female: {dept_b.iloc[1]['Admit_Rate']:.1%}")
    
    # Combined
    total_male_applied = 500 + 100
    total_male_admitted = 400 + 30
    total_female_applied = 100 + 500
    total_female_admitted = 90 + 200
    
    print("\nCombined (Both departments):")
    print(f"  Male: {total_male_admitted/total_male_applied:.1%}")
    print(f"  Female: {total_female_admitted/total_female_applied:.1%}")
    
    print("\n📊 Paradox: Females have HIGHER rate in each department,")
    print("   but LOWER rate overall! (confounded by department choice)")

demonstrate_simpsons_paradox()
```

### Production Monitoring Dashboards

```python
class StatisticalMonitor:
    """
    Real-time statistical monitoring for production systems.
    
    Use cases:
    - Monitor KPIs for anomalies
    - Alert on statistical significance
    - Track trends over time
    """
    
    def __init__(self, baseline_data):
        self.baseline_mean = np.mean(baseline_data)
        self.baseline_std = np.std(baseline_data)
        self.n_baseline = len(baseline_data)
    
    def is_anomaly(self, new_value, n_sigma=3):
        """
        Z-score based anomaly detection.
        
        Alerts if value is beyond n standard deviations.
        """
        z_score = (new_value - self.baseline_mean) / self.baseline_std
        
        is_anomalous = abs(z_score) > n_sigma
        
        if is_anomalous:
            print(f"🚨 ANOMALY DETECTED!")
            print(f"   Value: {new_value:.2f}")
            print(f"   Z-score: {z_score:.2f}")
            print(f"   Expected range: [{self.baseline_mean - n_sigma*self.baseline_std:.2f}, "
                  f"{self.baseline_mean + n_sigma*self.baseline_std:.2f}]")
        
        return is_anomalous
    
    def compare_to_baseline(self, new_sample):
        """
        Compare new sample to baseline with t-test.
        """
        t_stat, p_value = stats.ttest_ind(
            [self.baseline_mean] * self.n_baseline,  # Baseline
            new_sample
        )
        
        if p_value < 0.05:
            change = "INCREASE" if np.mean(new_sample) > self.baseline_mean else "DECREASE"
            print(f"⚠️  Significant {change} detected (p={p_value:.4f})")
        
        return p_value

# Example usage
baseline_response_times = np.random.normal(100, 15, 100)  # 100ms baseline
monitor = StatisticalMonitor(baseline_response_times)

# Check new values
monitor.is_anomaly(150)  # Within range
monitor.is_anomaly(200)  # Likely anomaly
```

---

## Hands-on Lab

### Exercise 1: Customer Segmentation Analysis

**Goal**: Analyze customer spending patterns across different segments.

```python
import pandas as pd
import numpy as np
from scipy import stats

# Generate customer data
np.random.seed(42)
n_customers = 300

df = pd.DataFrame({
    'customer_id': range(1, n_customers + 1),
    'segment': np.random.choice(['Bronze', 'Silver', 'Gold'], n_customers, p=[0.5, 0.3, 0.2]),
    'monthly_spend': np.concatenate([
        np.random.normal(100, 30, 150),   # Bronze
        np.random.normal(250, 50, 90),    # Silver
        np.random.normal(500, 100, 60)    # Gold
    ])
})

print("=== Customer Segmentation Analysis ===\n")

# 1. Descriptive statistics by segment
print("Descriptive Statistics by Segment:")
segment_stats = df.groupby('segment')['monthly_spend'].agg([
    ('Count', 'count'),
    ('Mean', 'mean'),
    ('Median', 'median'),
    ('Std Dev', 'std'),
    ('Min', 'min'),
    ('Max', 'max')
])
print(segment_stats)

# 2. Compare segments statistically
bronze = df[df['segment'] == 'Bronze']['monthly_spend']
silver = df[df['segment'] == 'Silver']['monthly_spend']
gold = df[df['segment'] == 'Gold']['monthly_spend']

print("\n=== Statistical Comparison ===")

# Bronze vs Silver
t_stat, p_value = stats.ttest_ind(bronze, silver)
print(f"\nBronze vs Silver:")
print(f"  Mean difference: ${np.mean(silver) - np.mean(bronze):.2f}")
print(f"  P-value: {p_value:.4f}")
print(f"  Significant: {'Yes' if p_value < 0.05 else 'No'}")

# Silver vs Gold
t_stat, p_value = stats.ttest_ind(silver, gold)
print(f"\nSilver vs Gold:")
print(f"  Mean difference: ${np.mean(gold) - np.mean(silver):.2f}")
print(f"  P-value: {p_value:.4f}")
print(f"  Significant: {'Yes' if p_value < 0.05 else 'No'}")

# 3. Identify high-value customers (top 10%)
threshold_90 = df['monthly_spend'].quantile(0.90)
high_value = df[df['monthly_spend'] >= threshold_90]

print(f"\n=== High-Value Customers (Top 10%) ===")
print(f"Threshold: ${threshold_90:.2f}")
print(f"Number of customers: {len(high_value)}")
print(f"Segment distribution:\n{high_value['segment'].value_counts()}")
```

---

### Exercise 2: A/B Test Analysis

**Goal**: Determine if a new checkout flow improves conversion rates.

```python
# Generate A/B test data
np.random.seed(42)

control_group = pd.DataFrame({
    'group': 'Control',
    'converted': np.random.binomial(1, 0.10, 1000)  # 10% baseline
})

treatment_group = pd.DataFrame({
    'group': 'Treatment',
    'converted': np.random.binomial(1, 0.12, 1000)  # 12% with new flow
})

ab_test = pd.concat([control_group, treatment_group], ignore_index=True)

print("=== A/B Test Analysis ===\n")

# 1. Basic metrics
print("Conversion Rates:")
conversion_rates = ab_test.groupby('group')['converted'].agg([
    ('Total Users', 'count'),
    ('Conversions', 'sum'),
    ('Conversion Rate', 'mean')
])
print(conversion_rates)

# 2. Statistical significance
control_conversions = control_group['converted']
treatment_conversions = treatment_group['converted']

# Two-proportion z-test
from statsmodels.stats.proportion import proportions_ztest

n_control = len(control_conversions)
n_treatment = len(treatment_conversions)
conversions = [control_conversions.sum(), treatment_conversions.sum()]
nobs = [n_control, n_treatment]

z_stat, p_value = proportions_ztest(conversions, nobs)

print(f"\n=== Statistical Test ===")
print(f"Z-statistic: {z_stat:.3f}")
print(f"P-value: {p_value:.4f}")

if p_value < 0.05:
    print("✓ SIGNIFICANT: New checkout flow improves conversion!")
    
    # Calculate lift
    control_rate = control_conversions.mean()
    treatment_rate = treatment_conversions.mean()
    lift = ((treatment_rate - control_rate) / control_rate) * 100
    print(f"  Lift: {lift:.1f}%")
    
    # Calculate confidence interval for lift
    from statsmodels.stats.proportion import proportion_confint
    ci_control = proportion_confint(conversions[0], nobs[0], alpha=0.05)
    ci_treatment = proportion_confint(conversions[1], nobs[1], alpha=0.05)
    
    print(f"  Control 95% CI: [{ci_control[0]:.3f}, {ci_control[1]:.3f}]")
    print(f"  Treatment 95% CI: [{ci_treatment[0]:.3f}, {ci_treatment[1]:.3f}]")
else:
    print("✗ NOT SIGNIFICANT: No conclusive evidence of improvement")

# 3. Business impact projection
if p_value < 0.05:
    annual_visitors = 500000
    control_rate = control_conversions.mean()
    treatment_rate = treatment_conversions.mean()
    avg_order_value = 150
    
    additional_conversions = annual_visitors * (treatment_rate - control_rate)
    additional_revenue = additional_conversions * avg_order_value
    
    print(f"\n=== Business Impact (Annual) ===")
    print(f"Additional conversions: {additional_conversions:,.0f}")
    print(f"Additional revenue: ${additional_revenue:,.2f}")
```

---

### Exercise 3: Sales Performance Analysis

**Goal**: Analyze sales rep performance and identify coaching opportunities.

```python
# Generate sales rep data
np.random.seed(42)
n_reps = 50

sales_data = pd.DataFrame({
    'rep_id': range(1, n_reps + 1),
    'deals_closed': np.random.poisson(20, n_reps),
    'revenue': np.random.normal(150000, 50000, n_reps),
    'calls_made': np.random.poisson(100, n_reps),
    'experience_years': np.random.uniform(1, 10, n_reps)
})

print("=== Sales Performance Analysis ===\n")

# 1. Descriptive statistics
print("Performance Metrics:")
print(sales_data[['deals_closed', 'revenue', 'calls_made']].describe())

# 2. Identify top and bottom performers
q75 = sales_data['revenue'].quantile(0.75)
q25 = sales_data['revenue'].quantile(0.25)

top_performers = sales_data[sales_data['revenue'] >= q75]
bottom_performers = sales_data[sales_data['revenue'] <= q25]

print(f"\n=== Performance Segmentation ===")
print(f"Top Performers (≥75th percentile): {len(top_performers)}")
print(f"  Avg Revenue: ${top_performers['revenue'].mean():,.2f}")
print(f"  Avg Deals: {top_performers['deals_closed'].mean():.1f}")
print(f"  Avg Calls: {top_performers['calls_made'].mean():.1f}")

print(f"\nBottom Performers (≤25th percentile): {len(bottom_performers)}")
print(f"  Avg Revenue: ${bottom_performers['revenue'].mean():,.2f}")
print(f"  Avg Deals: {bottom_performers['deals_closed'].mean():.1f}")
print(f"  Avg Calls: {bottom_performers['calls_made'].mean():.1f}")

# 3. Correlation analysis
print(f"\n=== Correlation Analysis ===")
corr_matrix = sales_data[['deals_closed', 'revenue', 'calls_made', 'experience_years']].corr()
print(corr_matrix)

# 4. Predictive insights
r_calls_revenue, p_calls_revenue = stats.pearsonr(sales_data['calls_made'], sales_data['revenue'])
r_exp_revenue, p_exp_revenue = stats.pearsonr(sales_data['experience_years'], sales_data['revenue'])

print(f"\n=== Key Insights ===")
print(f"Calls → Revenue: r={r_calls_revenue:.3f}, p={p_calls_revenue:.4f}")
if abs(r_calls_revenue) > 0.4:
    print("  ✓ Strong relationship: More calls = More revenue")

print(f"\nExperience → Revenue: r={r_exp_revenue:.3f}, p={p_exp_revenue:.4f}")
if abs(r_exp_revenue) > 0.4:
    print("  ✓ Experience matters: Invest in training")

# 5. Statistical comparison
t_stat, p_value = stats.ttest_ind(top_performers['calls_made'], bottom_performers['calls_made'])
print(f"\n=== Top vs Bottom: Calls Made ===")
print(f"P-value: {p_value:.4f}")
if p_value < 0.05:
    print("✓ Top performers make significantly more calls")
    print("  → Coaching opportunity: Increase call activity for bottom performers")
```

---

## Mastery Check

### Question 1: Mean vs Median

Given this salary data, which measure is more appropriate and why?

```python
salaries = [45000, 48000, 50000, 52000, 55000, 58000, 250000]
```

<details>
<summary>Click for Answer</summary>

**Answer: Median ($52,000)**

**Reasoning:**
```python
mean = np.mean(salaries)     # $79,714 (inflated by CEO)
median = np.median(salaries)  # $52,000 (typical employee)
```

- The mean is heavily influenced by the $250k outlier (CEO)
- The median represents the "typical" employee better
- Skewness = 2.44 (highly right-skewed)
- Use median for skewed distributions with outliers

**When to use mean:**
- Symmetric distributions
- No significant outliers
- When total matters (total payroll = mean × employees)

</details>

---

### Question 2: Correlation Interpretation

Your analysis shows:
- Marketing spend vs Revenue: r = 0.85, p = 0.001
- Ice cream sales vs Drowning: r = 0.92, p < 0.001

Can you conclude causation from either?

<details>
<summary>Click for Answer</summary>

**Answer: NO to both!**

**Marketing vs Revenue (r = 0.85):**
- Strong positive correlation ✓
- Statistically significant ✓
- But: Could be confounded by seasonality, economy, competitor actions
- Need: Controlled experiment (A/B test) to prove causation

**Ice Cream vs Drowning (r = 0.92):**
- Stronger correlation, but SPURIOUS
- Both caused by warm weather (confounding variable)
- Classic example of "correlation ≠ causation"

**Key Principle:**
```
Correlation → "Variables move together"
Causation → "Variable A causes variable B"

To prove causation, you need:
1. Randomized controlled trial, OR
2. Causal inference methods (beyond correlation)
```

</details>

---

### Question 3: Hypothesis Test Interpretation

You run an A/B test:
- Control: 100 visitors, 10 conversions (10%)
- Treatment: 100 visitors, 15 conversions (15%)
- P-value: 0.12

Should you launch the new feature?

<details>
<summary>Click for Answer</summary>

**Answer: NO - Not yet**

**Analysis:**
```python
# Conversion rates
control_rate = 10 / 100      # 10%
treatment_rate = 15 / 100    # 15%
lift = (15 - 10) / 10 * 100  # 50% relative improvement

# Statistical significance
p_value = 0.12  # Above 0.05 threshold
```

**Interpretation:**
- ✗ P-value (0.12) > 0.05 → Not statistically significant
- ✗ Could be due to random chance
- ✗ Risk of false positive

**Options:**
1. **Continue testing** (recommended)
   - Increase sample size to gain statistical power
   - Target: p < 0.05 with larger N

2. **Calculate required sample size:**
   ```python
   # For 50% lift, need ~385 per group for 80% power
   ```

3. **Business decision:**
   - If low-cost/low-risk: Can test in production with monitoring
   - If high-cost/high-risk: Wait for significance

**Key lesson:** Don't launch based on promising but non-significant results!

</details>

---

### Question 4: Outlier Decision

You have transaction amounts: [10, 12, 15, 18, 20, 22, 500]

The $500 is beyond 3 standard deviations. What should you do?

<details>
<summary>Click for Answer</summary>

**Answer: Investigate before removing!**

**Analysis Steps:**

1. **Verify legitimacy:**
   ```python
   # Is it a data error?
   - Check: Extra zero? ($50 entered as $500)
   - Check: Wrong decimal? ($5.00 entered as $500)
   
   # Or is it legitimate?
   - Large bulk order
   - VIP customer
   - Special promotion
   ```

2. **Statistical detection:**
   ```python
   Q1, Q3 = np.percentile([10,12,15,18,20,22,500], [25, 75])
   IQR = Q3 - Q1
   upper_bound = Q3 + 1.5 * IQR
   # 500 > upper_bound → Outlier confirmed
   ```

3. **Treatment options:**

   **If ERROR:**
   - ✓ Remove or correct
   
   **If LEGITIMATE:**
   - ✓ Keep, but flag: `df['is_large_order'] = df['amount'] > 100`
   - ✓ Use median instead of mean for averages
   - ✓ Cap at percentile: `df['amount_capped'] = df['amount'].clip(upper=percentile_99)`
   - ✓ Transform: `df['amount_log'] = np.log1p(df['amount'])`
   - ✓ Segment: Analyze small/large orders separately

**Business Context Matters:**
- In fraud detection: Flag for review
- In revenue analysis: Include but segment
- In statistical modeling: May need transformation

</details>

---

### Question 5: Production Scenario

**Scenario:** You're monitoring API response times. Baseline: mean=100ms, std=15ms. 

Today, 5 consecutive requests take: [140, 145, 138, 142, 144] ms.

Is this an anomaly requiring immediate action?

<details>
<summary>Click for Answer</summary>

**Answer: YES - Investigate immediately**

**Statistical Analysis:**

```python
baseline_mean = 100
baseline_std = 15
new_sample = [140, 145, 138, 142, 144]
new_mean = np.mean(new_sample)  # 141.8 ms

# Z-score for sample mean
n = len(new_sample)
std_error = baseline_std / np.sqrt(n)  # 6.71
z_score = (new_mean - baseline_mean) / std_error  # 6.23

# P-value (probability this is random)
p_value = 2 * (1 - stats.norm.cdf(abs(z_score)))  # < 0.001
```

**Interpretation:**
- 🚨 Z-score = 6.23 (way beyond ±3σ threshold)
- 🚨 P-value < 0.001 (< 0.1% chance this is random)
- 🚨 41.8% increase in response time

**Action Plan:**

1. **Immediate:**
   - Check server CPU/memory
   - Review recent deployments
   - Check database query times
   - Look for traffic spikes

2. **Short-term:**
   - Set up automated alerts: `if response_time > mean + 3*std`
   - Implement percentile monitoring (p50, p95, p99)

3. **Long-term:**
   - Establish SLOs (Service Level Objectives)
   - Implement statistical process control charts
   - Automated rollback on anomalies

**Code for Automated Monitoring:**
```python
class ResponseTimeMonitor:
    def __init__(self, baseline_mean, baseline_std):
        self.baseline_mean = baseline_mean
        self.baseline_std = baseline_std
        self.alert_threshold = 3  # sigma
    
    def check_anomaly(self, response_time):
        z_score = (response_time - self.baseline_mean) / self.baseline_std
        
        if abs(z_score) > self.alert_threshold:
            self.send_alert(response_time, z_score)
            return True
        return False
    
    def send_alert(self, value, z_score):
        print(f"🚨 ALERT: Response time {value}ms")
        print(f"   Z-score: {z_score:.2f}")
        print(f"   Expected: {self.baseline_mean}±{self.alert_threshold*self.baseline_std}ms")
```

</details>

---

## Summary

Today you learned:
- ✅ **Descriptive statistics**: Mean, median, mode for central tendency; std dev, variance for spread
- ✅ **When to use what**: Mean for symmetric data, median for skewed/outliers
- ✅ **Correlation**: Measures relationships (but not causation!); ranges -1 to +1
- ✅ **Probability distributions**: Normal, uniform, exponential, Poisson for modeling real-world phenomena
- ✅ **Hypothesis testing**: Use t-tests to determine statistical significance (p < 0.05)
- ✅ **Confidence intervals**: Quantify uncertainty in estimates
- ✅ **Production considerations**: Sample size calculations, multiple testing corrections, anomaly detection

**Key Takeaways for Business:**
1. **Always check for statistical significance** before making decisions
2. **Correlation ≠ Causation** - look for confounding variables
3. **Use the right metric**: Mean for totals, median for typical values
4. **Plan sample sizes** before running experiments
5. **Monitor continuously** with statistical process control

**Tomorrow**: Data visualization fundamentals - turning numbers into insights.