---
day: 45
title: "Feature Engineering and Evaluation"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "feature-engineering-evaluation"
duration: 55
difficulty: "intermediate"
tags:
  - machine-learning
  - feature-engineering
  - evaluation
  - cross-validation
concepts:
  - "feature creation"
  - "encoding categorical variables"
  - "cross-validation strategies"
  - "data leakage prevention"
prerequisites: [40, 41, 42, 43]
outcomes:
  - "Create and transform features effectively"
  - "Encode categorical data properly"
  - "Implement robust cross-validation"
  - "Build end-to-end ML pipelines"
---

# 🎯 Day 45: Feature Engineering and Evaluation

> *"Great features make mediocre algorithms perform well. Bad features make great algorithms fail."*

---

## The "Never-Coded" Bridge

**You're building a house price predictor.** The raw data has `year_built=1995`. But what the model really needs to know is: "How old is this house?" Converting `year_built` to `house_age` is feature engineering.

**Feature engineering in industry:**

- **Finance**: Calculating rolling averages, volatility ratios
- **E-commerce**: Extracting month/day from timestamps
- **Healthcare**: Deriving BMI from height/weight
- **Marketing**: Creating RFM scores

---

## The Technical Deep Dive

### Key Feature Engineering Concepts

**Leakage Categories**

| Leakage Type | Description | Example | Detection |
|-------------|------------|---------|----------|
| **Target leakage** | Feature computed using or correlated with the target after the fact | Using `days_to_next_purchase` to predict churn — only known after churn occurs | Feature availability timeline audit |
| **Temporal leakage** | Using future information to predict the past | Including sales from next month as a feature when predicting this month's sales | Check all date columns; ensure features are available at prediction time |
| **Preprocessing leakage** | Fitting preprocessing (scaler, imputer) on full data before splitting | `scaler.fit_transform(X)` before `train_test_split` | Always use Pipeline or fit only on X_train |
| **Duplicate leakage** | Near-duplicate training and test samples (e.g., augmented images from same source) | Image dataset where the same person appears in train and test | Deduplication before splitting |

**Nominal vs Ordinal Variables**

- **Nominal**: No meaningful order. Color (Red, Blue, Green), Region (North, South). Use **One-Hot Encoding**.
- **Ordinal**: Natural order exists. Education (High School < Bachelor < Master < PhD), Rating (1–5). Use **Ordinal Encoding** — preserve the order.
- **High cardinality nominal** (City, Product ID with 1000+ values): One-hot creates huge sparse matrices. Use **Target Encoding**, **Hash Encoding**, or **Embeddings**.

**Skewness**

- **Right skew** (positive): Long tail to the right; mean > median. Common in income, price, transaction amount. Fix: log transform (`np.log1p`) or Box-Cox.
- **Left skew** (negative): Long tail to the left. Less common. Fix: square or exponential transform.
- **Why it matters**: Linear models and distance-based models assume approximately symmetric features; extreme skew can cause one feature to dominate.

**Feature Scaling**

- **StandardScaler** (z-score): Mean=0, Std=1. Required for: logistic regression, SVM, KNN, neural networks, PCA, regularized models.
- **MinMaxScaler**: Scales to [0, 1]. Use when you need bounded range; sensitive to outliers.
- **RobustScaler**: Uses median and IQR. Best for data with outliers.
- **Tree models (RF, GBM)**: Do NOT require scaling — they only use rank order of values.

**Feature Availability at Prediction Time**
A feature is only valid if it would be available when the model needs to make a prediction. Create a feature availability timeline:

```
Prediction Time: "Will this customer churn in the next 30 days?"
✅ Available: age, historical spending, days_since_last_purchase, num_past_complaints
❌ NOT available: next_purchase_date, cancellation_reason, refund_amount_next_quarter
```

### Common Feature Transformations

A few standard transformations cover most numerical preprocessing. Each fixes a different distributional problem:

**Standardization (z-score)** — centers and rescales to mean $0$, std $1$:

$$
x'_j = \frac{x_j - \mu_j}{\sigma_j}
$$

**Min–max normalization** — squashes a feature into $[0, 1]$:

$$
x'_j = \frac{x_j - \min(x_j)}{\max(x_j) - \min(x_j)}
$$

**Robust scaling** — uses median and IQR instead, so it ignores outliers:

$$
x'_j = \frac{x_j - \text{median}(x_j)}{Q_{0.75}(x_j) - Q_{0.25}(x_j)}
$$

**Log transform** — compresses heavy right tails for skewed monetary or count data:

$$
x' = \log(1 + x)
$$

**Pearson correlation** — quantifies linear association between two features (useful for diagnosing multicollinearity):

$$
\rho_{XY} = \frac{\mathrm{Cov}(X, Y)}{\sigma_X \sigma_Y} = \frac{\sum_i (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_i (x_i - \bar{x})^2} \, \sqrt{\sum_i (y_i - \bar{y})^2}} \in [-1, 1]
$$

### Feature Creation

> **Why these transformations?** Log transform compresses right-skewed monetary data (where a few high-value transactions dominate) into a more symmetrical distribution. Date features (day_of_week, is_weekend) capture temporal patterns in customer behavior that the raw timestamp cannot convey to a model.

```python
import numpy as np
import pandas as pd

np.random.seed(42)
n = 500

data = pd.DataFrame(
    {
        "transaction_date": pd.date_range("2024-01-01", periods=n, freq="D"),
        "amount": np.random.exponential(100, n),
        "tenure_days": np.random.randint(1, 1000, n),
    }
)

# Date features
data["day_of_week"] = data["transaction_date"].dt.dayofweek
data["month"] = data["transaction_date"].dt.month
data["is_weekend"] = data["day_of_week"].isin([5, 6]).astype(int)

# Numeric transformations
data["log_amount"] = np.log1p(data["amount"])
data["amount_per_tenure"] = data["amount"] / data["tenure_days"]

print(data[["day_of_week", "is_weekend", "log_amount"]].head())
```

### Encoding Categorical Variables

> **Why different encoders?** One-Hot Encoding creates a binary column per category — correct for nominal variables where no order exists (no category is "more" than another). Ordinal Encoding maps categories to integers — correct only when a real ordering exists (Low < Medium < High). Using Ordinal on a nominal variable implies a false ordering that can mislead the model.

```python
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, OrdinalEncoder

categories = pd.DataFrame(
    {"color": ["Red", "Blue", "Green"], "quality": ["Low", "Medium", "High"]}
)

# One-hot for nominal variables
categories_onehot = pd.get_dummies(categories["color"], prefix="color")

# Ordinal for ordered variables
oe = OrdinalEncoder(categories=[["Low", "Medium", "High"]])
categories["quality_encoded"] = oe.fit_transform(categories[["quality"]])

print("One-Hot:", categories_onehot.values)
print("Ordinal:", categories["quality_encoded"].values)
```

### Cross-Validation Strategies

> **Why cross-validate rather than a single validation split?** A single 80/20 split gives one estimate of performance. With cross-validation, we average over 5 different train/validation configurations — reducing the variance of our estimate and using all data for both training and evaluation.

```python
from sklearn.model_selection import cross_val_score, KFold, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier

np.random.seed(42)
X = np.random.randn(300, 5)
y = (X[:, 0] + X[:, 1] > 0).astype(int)

model = RandomForestClassifier(n_estimators=50, random_state=42)

# Standard K-Fold
kfold = KFold(n_splits=5, shuffle=True, random_state=42)
scores_kfold = cross_val_score(model, X, y, cv=kfold)
print(f"K-Fold: {scores_kfold.mean():.3f} ± {scores_kfold.std():.3f}")

# Stratified K-Fold (preserves class distribution)
skfold = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores_strat = cross_val_score(model, X, y, cv=skfold)
print(f"Stratified: {scores_strat.mean():.3f} ± {scores_strat.std():.3f}")
```

### Data Leakage Prevention

> **Why does leakage inflate scores?** The scaler fitted on all data "knows" the test set's mean and std. When it standardizes test features using test statistics, the transformation is optimized for the test set — giving the model a subtle advantage it won't have on truly new data. Pipeline prevents this by ensuring fit() is only ever called on training data.

```python
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

# ❌ WRONG: Fit scaler on ALL data
scaler_wrong = StandardScaler()
X_scaled = scaler_wrong.fit_transform(X)  # Sees test data!

# ✅ CORRECT: Fit only on training data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)  # Transform only, no fitting!
```

### Sklearn Pipelines

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

# Preprocessing pipelines
numeric_transformer = Pipeline(
    [("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]
)

categorical_transformer = Pipeline(
    [
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ]
)

# Full pipeline with model
preprocessor = ColumnTransformer(
    [
        ("num", numeric_transformer, ["age", "income"]),
        ("cat", categorical_transformer, ["education"]),
    ]
)

pipeline = Pipeline(
    [("preprocessor", preprocessor), ("classifier", RandomForestClassifier())]
)

# Cross-validate entire pipeline (no leakage!)
# cv_scores = cross_val_score(pipeline, df, y, cv=5)
```

### Advanced Feature Engineering Topics

**Rare and Unseen Categories**

```python
# In production, new categories appear that weren't in training
encoder = OneHotEncoder(handle_unknown='ignore')  # Unseen → all-zero vector
encoder = OneHotEncoder(handle_unknown='infrequent_if_exist', min_frequency=10)
# Categories seen < 10 times in training are grouped into 'infrequent' bucket
```

**High-Cardinality Encoding**
For features like City (500+ values) where one-hot creates massive sparse matrices:

```python
# Target Encoding: replace category with mean target value
# ⚠️ LEAKAGE RISK: must be computed on training data only
from sklearn.preprocessing import TargetEncoder
te = TargetEncoder(smooth='auto')  # sklearn ≥ 1.3
X_train['city_encoded'] = te.fit_transform(X_train[['city']], y_train)
X_test['city_encoded'] = te.transform(X_test[['city']])  # Uses training statistics only
```

**Missingness Indicators**
Sometimes the fact that a value is missing is itself informative:

```python
df['income_missing'] = df['income'].isna().astype(int)  # Binary flag
df['income_filled'] = df['income'].fillna(df['income'].median())  # Fill with median
# Now the model can learn that "income is missing" correlates with certain behaviors
```

**Outlier Features**

```python
# Flag extreme values (beyond 3 sigma) as binary feature
df['income_outlier'] = (np.abs(stats.zscore(df['income'])) > 3).astype(int)
```

**Temporal and Grouped Cross-Validation**

```python
from sklearn.model_selection import TimeSeriesSplit, GroupKFold

# Time-ordered data: always train on past, validate on future
tscv = TimeSeriesSplit(n_splits=5)
for train_idx, val_idx in tscv.split(X):
    # Train indices always precede validation indices
    pass

# Grouped data: same customer cannot be in both train and validation
gkf = GroupKFold(n_splits=5)
for train_idx, val_idx in gkf.split(X, y, groups=customer_ids):
    pass
```

### Robust Model Evaluation

**Bias–Variance Decomposition in Practice**

The bias–variance tradeoff is best diagnosed through learning curves and validation curves:

```python
from sklearn.model_selection import learning_curve, validation_curve
import matplotlib.pyplot as plt

# Learning Curve: train on increasing data sizes
train_sizes, train_scores, val_scores = learning_curve(
    model, X, y, cv=5, train_sizes=np.linspace(0.1, 1.0, 10),
    scoring='neg_mean_squared_error'
)
# High bias (underfitting): both curves plateau at high error, close together
# High variance (overfitting): training error low, validation error high with a large gap

# Validation Curve: vary one hyperparameter
param_range = [1, 2, 5, 10, 20, 50]
train_scores, val_scores = validation_curve(
    DecisionTreeRegressor(), X, y, param_name='max_depth',
    param_range=param_range, cv=5
)
# Optimal max_depth: where validation score peaks before declining
```

**Baseline Selection**
Before claiming a model "works," always compare to trivial baselines:

| Problem Type | Baseline | sklearn |
|-------------|---------|---------|
| Regression | Predict mean of training y | `DummyRegressor(strategy='mean')` |
| Classification | Always predict majority class | `DummyClassifier(strategy='most_frequent')` |
| Time series | Predict last observed value | `DummyRegressor(strategy='constant', constant=y_train[-1])` |

**Nested Cross-Validation**
When both tuning hyperparameters and estimating generalization, use nested CV:

```python
from sklearn.model_selection import cross_val_score, GridSearchCV

inner_cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
outer_cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# Inner loop: hyperparameter tuning
grid = GridSearchCV(RandomForestClassifier(), param_grid={'max_depth': [5, 10, None]}, cv=inner_cv)

# Outer loop: generalization estimation
nested_scores = cross_val_score(grid, X, y, cv=outer_cv, scoring='roc_auc')
print(f"Nested CV AUC: {nested_scores.mean():.3f} ± {nested_scores.std():.3f}")
```

**Confidence Intervals on CV Scores**

```python
scores = cross_val_score(model, X, y, cv=10)
mean, std = scores.mean(), scores.std()
ci_lower, ci_upper = mean - 2*std, mean + 2*std
print(f"95% CI (approximate): [{ci_lower:.3f}, {ci_upper:.3f}]")
# Note: this CI is approximate because CV folds are not independent
```

**Statistical Comparison of Models**

```python
from scipy import stats

scores_A = cross_val_score(model_A, X, y, cv=10)
scores_B = cross_val_score(model_B, X, y, cv=10)
t_stat, p_value = stats.ttest_rel(scores_A, scores_B)
print(f"Model A vs B: p-value={p_value:.4f}")
# p < 0.05: significant difference; but apply Bonferroni if comparing many models
```

**Threshold Tuning and Calibration**

```python
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import precision_recall_curve

# Find threshold that maximizes F1
prec, rec, thresholds = precision_recall_curve(y_test, y_prob)
f1_scores = 2 * prec * rec / (prec + rec + 1e-8)
best_threshold = thresholds[np.argmax(f1_scores[:-1])]

# Calibrate probabilities
calibrated = CalibratedClassifierCV(model, cv=5, method='isotonic')
calibrated.fit(X_train, y_train)
```

**Subgroup / Fairness Checks**

```python
# Evaluate separately by group
for group in df['region'].unique():
    mask = (X_test_df['region'] == group)
    if mask.sum() > 20:  # Skip tiny groups
        group_f1 = f1_score(y_test[mask], y_pred[mask])
        print(f"{group}: F1={group_f1:.3f} (n={mask.sum()})")
```

---

## Senior-Level Insights

### Feature Engineering Best Practices

| Category        | Technique         | When to Use           |
| --------------- | ----------------- | --------------------- |
| **Numeric**     | Log transform     | Right-skewed data     |
|                 | Binning           | Non-linear effects    |
| **Categorical** | One-hot           | Low cardinality (<10) |
|                 | Ordinal           | Natural order exists  |
| **Temporal**    | Day/month/quarter | Seasonality           |

### CV Strategy Guide

| CV Strategy | When to Use | Leakage Risk | Tradeoff | When NOT to Use |
|------------|-------------|-------------|---------|----------------|
| **KFold** | Default; balanced classes; no time order; no grouping | Low | Good variance/bias tradeoff | Imbalanced classes; time-ordered data |
| **StratifiedKFold** | Classification with imbalanced classes | Low | Preserves class ratio; add overhead | Regression (stratification by continuous target is not standard) |
| **TimeSeriesSplit** | Time-ordered data (sales, prices, usage) | Low (enforces temporal order) | No shuffling; later folds have more training data | Non-temporal data |
| **GroupKFold** | Repeated measures (same patient, same user, same store across months) | Low | Prevents data leakage across groups | Data without meaningful grouping |
| **Nested CV** | Tuning hyperparameters AND estimating generalization | Low | Unbiased performance estimate | Small datasets (computationally expensive) |
| **LOOCV** | Very small datasets (n < 50) | Low | Uses maximum training data per fold | Large datasets (computationally infeasible) |
| **Random split only** | Prototyping, large datasets where speed matters | Moderate (single estimate variance) | Fast | Any production model evaluation |

### Senior-Level Feature Engineering Insights

**Train/Serve Skew**
The most common cause of production ML failures: the features computed during training are computed differently in production.

- Training: `income_per_year = income / (age - 17)` (age from database)
- Production: `income_per_year = income / (current_year - birth_year)` (different age calculation)
Solution: Put all feature engineering logic in a versioned, tested function called identically during training and serving.

**Feature Lineage**
For every feature in production, document:

- Where does the raw data come from? (source table, API, stream)
- How is it transformed? (exact code, version)
- When was it last updated? (staleness window)
- Is it available at prediction time? (latency, pipeline dependency)

**Feature Drift**
When input distributions shift, model performance degrades silently:

```python
# Monitor feature statistics over time
from scipy.stats import ks_2samp

for feature in X_train.columns:
    ks_stat, p_val = ks_2samp(X_train[feature], X_production[feature])
    if p_val < 0.05:
        print(f"⚠️ Drift detected in {feature}: KS={ks_stat:.3f}")
```

**Feature Governance Review**
Before deploying features, check:

- Are any features proxies for protected attributes (race, gender, age)? Income and zip code can be proxies.
- Are features reproducible from the same raw data across environments?
- Have features been reviewed for point-in-time correctness (no future leakage)?

---

## Hands-on Lab

### Exercise 1: Feature Engineering Pipeline

**Business Scenario:** RetailCo's data science team needs to prepare customer features for a churn prediction model. Raw features include age, income, and tenure — all of which need transformation before modeling.

**Goal:** Build a reproducible feature engineering pipeline that a new team member can understand and run.

**Sample Input:**

| customer_id | age | income | tenure |
|------------|-----|--------|--------|
| 1 | 34 | 75000 | 365 |
| 2 | 55 | 210000 | 1200 |
| 3 | 22 | 28000 | 45 |

**Tasks:**

1. Create `log_income` (log1p transform of income) and verify it reduces skewness
2. Create `income_per_year` = income / (age - 17) — "annual income relative to working years"
3. Plot histograms of `income` vs `log_income` to visually confirm reduced skew
4. Check: does the engineered feature make business sense? Is it monotonically related to churn risk?

**Expected Output:**

```
Original income skewness: ~2.3 (right-skewed)
log_income skewness: ~0.4 (much more symmetric)
income_per_year range: approximately 1,200–15,000 (customers with higher earning relative to age)
```

```python
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

np.random.seed(42)
df = pd.DataFrame(
    {
        "age": np.random.randint(18, 70, 500),
        "income": np.random.exponential(50000, 500),
        "tenure": np.random.randint(1, 1000, 500),
    }
)

# Engineer features
df["log_income"] = np.log1p(df["income"])
df["income_per_year"] = df["income"] / (df["age"] - 17)

print(df.describe())
```

### Exercise 2: CV Strategy Comparison

**Business Scenario:** You are validating a customer churn model. The dataset is imbalanced (12% churn rate). You need to verify that your cross-validation strategy preserves the class balance.

**Goal:** Compare KFold vs StratifiedKFold on an imbalanced dataset; observe the practical difference.

**Tasks:**

1. Run KFold(5) and StratifiedKFold(5) on imbalanced dataset (y where only ~12% are class 1)
2. For each fold, print the fraction of positive cases in the validation set
3. Report mean F1 ± std for both strategies
4. Explain in one sentence why the scores differ

**Expected Output:**

```
KFold fold positive rates: [0.07, 0.19, 0.11, 0.08, 0.17] (variable — some folds miss positives)
StratifiedKFold fold positive rates: [0.12, 0.12, 0.12, 0.12, 0.12] (consistent)
KFold F1: 0.31 ± 0.14 (high variance due to uneven folds)
Stratified F1: 0.38 ± 0.03 (more reliable estimate)
```

**Leakage/Evaluation Acceptance Criteria:**

- Pass: Stratified F1 std < 0.05 (stable estimate)
- Fail: If any single fold has < 5% positive rate — class underrepresented

```python
from sklearn.model_selection import cross_val_score, StratifiedKFold, KFold
from sklearn.linear_model import LogisticRegression

np.random.seed(42)
X = np.random.randn(200, 5)
y = (X[:, 0] > 1).astype(int)  # Imbalanced

model = LogisticRegression()

for cv_name, cv in [("KFold", KFold(5)), ("Stratified", StratifiedKFold(5))]:
    scores = cross_val_score(model, X, y, cv=cv, scoring="f1")
    print(f"{cv_name}: {scores.mean():.3f} ± {scores.std():.3f}")
```

### Exercise 3: Leakage Detection

**Business Scenario:** A data scientist reports 99.5% accuracy on their churn model. You suspect data leakage. Your job is to audit the pipeline.

**Goal:** Identify the leakage, quantify its impact, and fix it.

**Tasks:**

1. Run the WRONG approach (fit scaler on all data) and report accuracy
2. Run the CORRECT approach (fit scaler only on training data) and report accuracy
3. Compute the inflation: (leaky_accuracy - correct_accuracy) / correct_accuracy × 100%
4. Write a 1-sentence diagnosis explaining WHY the leakage inflated the score

**Expected Output (Leakage Detection):**

```
Leaky accuracy: 0.982 (suspiciously high)
Correct accuracy: 0.856 (realistic)
Inflation: 14.7% (the leaky model appears 14.7% better than it actually is)
Diagnosis: "The scaler fitted on all data encoded test set statistics into the transformation, giving the model implicit access to test data during training."
```

```python
# Spot the leakage!
from sklearn.preprocessing import StandardScaler

# WRONG
scaler = StandardScaler()
X_all = scaler.fit_transform(X)  # Leakage!
X_train, X_test = X_all[:160], X_all[160:]

# CORRECT
X_train, X_test = X[:160], X[160:]
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)
```

---

## Mastery Check

### Question 1: Choosing Encoding

Feature 'education': High School, Bachelor, Master, PhD. Which encoding?

<details>
<summary>Answer</summary>

**Ordinal Encoding** - education has natural order. Use `OrdinalEncoder(categories=[['High School', 'Bachelor', 'Master', 'PhD']])`.

</details>

### Question 2: Stratified K-Fold

When is Stratified K-Fold essential?

<details>
<summary>Answer</summary>

**Imbalanced classes** - ensures each fold has same class ratio. Without it, some folds might have 0% of minority class.

</details>

### Question 3: Spotting Leakage

99.5% CV accuracy but 70% on production. What happened?

<details>
<summary>Answer</summary>

**Data leakage** - test data information leaked into training. Common causes: preprocessing before split, features derived from target.

</details>

### Question 4: Log Transform

Why log transform income data?

<details>
<summary>Answer</summary>

Income is **right-skewed**. Log transform makes it more normal, reduces outlier impact, helps linear models.

</details>

### Question 5: Pipeline Benefits

Why use sklearn Pipeline over manual preprocessing?

<details>
<summary>Answer</summary>

- Prevents data leakage automatically
- Single object to save/load
- Grid search across preprocessing + model
- Clear, reproducible code

</details>

---

## Math-to-Debug Tasks

1. **Leakage detection protocol**: Audit each feature with a timestamp and data-availability table; flag any feature that is unavailable at prediction time or computed before split.
2. **Metric selection under class imbalance**: For the same model, compare accuracy, balanced accuracy, F1, ROC-AUC, and PR-AUC; justify which metric should govern decisions when positives are rare.
3. **Why-model-failed case**: Offline AUC is excellent but production performance collapses. Explain conceptually *why the model failed* (target leakage + metric mismatch), then take corrective action by rebuilding a leakage-safe pipeline, enforcing temporal validation, and selecting threshold/metric based on minority-class business cost.

---

## Glossary

| Term | Definition |
|------|-----------|
| Feature engineering | Creating or transforming input variables to improve model performance |
| Leakage | When information from outside the training period enters the model, inflating performance |
| Nominal variable | Categorical variable with no inherent order (colors, regions, product types) |
| Ordinal variable | Categorical variable with meaningful order (ratings, education levels) |
| Skewness | Measure of distribution asymmetry; right-skewed data has a long right tail |
| Standardization | Transform to mean=0, std=1: x' = (x − μ)/σ |
| Normalization | Transform to [0, 1]: x' = (x − min)/(max − min) |
| One-hot encoding | Binary column per category value; for nominal variables |
| Target encoding | Replace category with mean target value; leakage-prone without careful implementation |
| Bias–variance tradeoff | Model error = bias² + variance + noise; reducing one often increases the other |
| Nested CV | Two-level CV: inner for tuning, outer for evaluation; prevents hyperparameter overfitting |
| Feature drift | When production feature distributions shift away from training distributions |

## Cross-References

- **Day 45 → Day 37C**: The ColumnTransformer and Pipeline patterns introduced in Day 37C are the production implementation of the leakage prevention principles taught here
- **Day 45 → Day 46**: Neural network evaluation uses the same CV framework and calibration concepts — but adds epoch-level validation curves specific to gradient-based training
- **Day 45 → Day 42**: Classification thresholding and PR-AUC metrics taught in Day 42 are the business-cost evaluation framework that completes the picture started here

---

## Summary

- ✅ Feature engineering transforms raw data into model-ready signals
- ✅ Standardize with $x' = (x - \mu)/\sigma$; normalize with $x' = (x - \min)/(\max - \min)$
- ✅ Use $\log(1 + x)$ for right-skewed monetary/count data
- ✅ Diagnose multicollinearity via $\rho_{XY} = \mathrm{Cov}(X, Y) / (\sigma_X \sigma_Y)$
- ✅ Choose encoding based on categorical type (ordinal vs nominal)
- ✅ Stratified K-Fold preserves class balance
- ✅ Data leakage inflates scores, fails in production
- ✅ Pipelines prevent leakage automatically

**Tomorrow**: Introduction to Neural Networks.
