# 📦 Case Study 06: Operations Demand Forecasting

> **Phases covered**: Phase 5 (Advanced ML & Deep Learning)
> **Difficulty**: Intermediate → Advanced
> **Estimated time**: 8–10 hours

---

## 🎯 Case Overview

**FreshGrocers**, a grocery chain with 150 stores, wastes **$9 M/year** in
spoiled produce and loses **$6 M/year** in stockouts of high-demand items.
The supply chain VP wants a **demand forecasting system** that predicts
daily sales per store-product combination 14 days ahead, enabling optimal
ordering and reducing waste by 30%.

Your mission: build time-series forecasting models using ARIMA, Prophet,
and a gradient-boosted approach, then evaluate them with proper time-series
cross-validation.

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Stores | 150 |
| SKUs tracked | 2,000 |
| Annual waste (spoilage) | $9 M |
| Annual stockout cost | $6 M |
| Current forecast accuracy (MAPE) | 35% |
| Target forecast accuracy | MAPE ≤ 15% |

**Key question:** *How many units of each product should each store order
for the next 14 days?*

---

## 🗂️ Project Structure

```
06_operations_demand_forecasting/
├── README.md           ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs
└── data_generator.py   ← creates synthetic daily sales dataset
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 5 | Time series decomposition, stationarity, ACF/PACF |
| Phase 5 | ARIMA/SARIMA, Facebook Prophet, lag features |
| Phase 4 | Feature engineering, cross-validation for time series |
| Phase 37B | Seasonality, trend, autocorrelation |

---

## 🤝 Hand-Holding Walkthrough

### Step 1 — Generate & Explore Sales Data

**What:** Create 2 years of synthetic daily sales for 5 product categories
across 3 store formats (urban, suburban, rural) with trend, seasonality,
and holiday effects.

**Why:** Demand forecasting requires understanding temporal patterns:
weekly cycles (weekends), monthly cycles (paydays), and annual seasonality
(holidays, summer).

**How:**

```python
python data_generator.py          # creates daily_sales.csv
df = pd.read_csv("daily_sales.csv", parse_dates=["date"])
print(df.shape)
print(df.groupby("product_category")["units_sold"].describe())

# Plot time series for one product
import matplotlib.pyplot as plt
prod = df[df["product_category"] == "Produce"]
prod.groupby("date")["units_sold"].sum().plot(figsize=(14, 4), title="Daily Produce Sales")
plt.show()
```

**✅ Checkpoint:** You should see clear weekly and seasonal patterns.
Weekends should have higher sales than weekdays.

---

### Step 2 — Time Series Decomposition

**What:** Decompose the series into trend, seasonality, and residual
components.

**Why:** Understanding these components guides model selection — strong
seasonality favours SARIMA/Prophet; a trend shift favours adaptive models.

**How:**

```python
from statsmodels.tsa.seasonal import seasonal_decompose

# Aggregate to daily total for one category
ts = df[df["product_category"] == "Produce"].groupby("date")["units_sold"].sum()
result = seasonal_decompose(ts, period=7, model="additive")
result.plot()
plt.tight_layout()
plt.savefig("decomposition.png")
```

**✅ Checkpoint:** The seasonal component should show a clear 7-day cycle.
The trend should be gently upward.

---

### Step 3 — ARIMA / SARIMA Model

**What:** Fit a SARIMA model to capture both non-seasonal and seasonal
autocorrelation.

**Why:** SARIMA is the statistical baseline for time series. If SARIMA
achieves MAPE 20%, you know the series has strong autoregressive structure,
and ML models should beat it.

**How:**

```python
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_percentage_error

# Train/test split: last 14 days as test
train = ts[:-14]
test = ts[-14:]

model = SARIMAX(train, order=(1, 1, 1), seasonal_order=(1, 1, 1, 7))
fit = model.fit(disp=False)
forecast = fit.forecast(steps=14)

mape = mean_absolute_percentage_error(test, forecast)
print(f"SARIMA MAPE: {mape:.1%}")

# Plot
plt.figure(figsize=(14, 4))
train[-30:].plot(label="Train")
test.plot(label="Actual")
forecast.plot(label="Forecast", linestyle="--")
plt.legend()
plt.savefig("sarima_forecast.png")
```

**✅ Checkpoint:** MAPE should be 15–25%. If > 30%, try different (p,d,q)
orders using `auto_arima` from pmdarima.

---

### Step 4 — Facebook Prophet

**What:** Fit a Prophet model that handles holidays and changepoints
automatically.

**Why:** Prophet is designed for business time series with human-
interpretable components. It's easy to add holiday effects (Black Friday,
Christmas) that ARIMA can't model natively.

**How:**

```python
from prophet import Prophet

prophet_df = ts.reset_index()
prophet_df.columns = ["ds", "y"]

m = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=True,
    daily_seasonality=False,
    changepoint_prior_scale=0.05,
)
m.fit(prophet_df[:-14])

future = m.make_future_dataframe(periods=14)
pred = m.predict(future)

# Evaluate
forecast_vals = pred.tail(14)["yhat"].values
mape_prophet = mean_absolute_percentage_error(test.values, forecast_vals)
print(f"Prophet MAPE: {mape_prophet:.1%}")
```

**✅ Checkpoint:** Prophet should match or beat SARIMA. Plot the component
decomposition with `m.plot_components(pred)`.

---

### Step 5 — ML Approach (Gradient Boosting with Lag Features)

**What:** Engineer lag features and calendar features, then train a
LightGBM model.

**Why:** ML models can incorporate external features (weather, promotions,
holidays) that pure time-series models can't. In practice, gradient-
boosted trees with lag features often win forecasting competitions.

**How:**

```python
# Feature engineering
def create_lag_features(df, lags=[1, 7, 14, 28]):
    for lag in lags:
        df[f"lag_{lag}"] = df["units_sold"].shift(lag)
    df["rolling_7d_mean"] = df["units_sold"].rolling(7).mean()
    df["rolling_28d_mean"] = df["units_sold"].rolling(28).mean()
    df["day_of_week"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)
    return df.dropna()

from sklearn.ensemble import GradientBoostingRegressor

ts_df = create_lag_features(ts.reset_index())
ts_df.columns = ["date", "units_sold"] + list(ts_df.columns[2:])

feature_cols = [c for c in ts_df.columns if c not in ["date", "units_sold"]]
train_df = ts_df[:-14]
test_df = ts_df[-14:]

gb = GradientBoostingRegressor(n_estimators=200, max_depth=5, random_state=42)
gb.fit(train_df[feature_cols], train_df["units_sold"])
preds = gb.predict(test_df[feature_cols])

mape_gb = mean_absolute_percentage_error(test_df["units_sold"], preds)
print(f"GradientBoosting MAPE: {mape_gb:.1%}")
```

**✅ Checkpoint:** ML model should achieve MAPE ≤ 15%. Compare all three
models in a summary table.

---

### Step 6 — Model Comparison & Ordering Recommendation

**What:** Compare SARIMA, Prophet, and GBM, select the best, and
generate a 14-day ordering plan.

**Why:** The supply chain team needs a single forecast they can use to
place orders with suppliers.

**How:**

```python
comparison = pd.DataFrame({
    "Model": ["SARIMA", "Prophet", "GradientBoosting"],
    "MAPE": [mape, mape_prophet, mape_gb],
})
comparison["Rank"] = comparison["MAPE"].rank()
print(comparison.sort_values("Rank"))

# Generate ordering plan with safety stock
best_forecast = preds  # or whichever model won
safety_factor = 1.15   # 15% safety stock
order_plan = pd.DataFrame({
    "Date": test_df["date"].values,
    "Forecast_Units": best_forecast.round(0).astype(int),
    "Order_Quantity": (best_forecast * safety_factor).round(0).astype(int),
})
print(order_plan)
```

**✅ Checkpoint:** The order plan should show daily quantities with safety
stock. Estimate waste reduction vs. the current 35% MAPE forecast.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | Time series EDA with decomposition plot | Jupyter / .py |
| 2 | SARIMA, Prophet, and GBM models | .py |
| 3 | Model comparison table (MAPE, RMSE) | Markdown |
| 4 | 14-day ordering plan with safety stock | CSV |
| 5 | Executive summary for supply chain VP | Markdown |

---

## 🏆 Stretch Goals

- [ ] Add weather data as an external regressor in Prophet
- [ ] Implement a neural forecast model (N-BEATS or TFT)
- [ ] Build a multi-step recursive vs. direct forecasting comparison
- [ ] Create a Streamlit dashboard with forecast visualisations
- [ ] Add probabilistic forecasting (prediction intervals)

---

## 📚 Reference Lessons

- Day 53–56: Time series fundamentals, stationarity, ARIMA (Phase 5)
- Day 57–60: Advanced modelling — ensemble methods for regression (Phase 5)
- Day 37B: Autocorrelation, seasonal patterns, statistical tests
- Day 125: Orchestration — scheduling daily forecast runs (Phase 11)

---

*Deploy this forecasting pipeline to show you can reduce waste and
stockouts — a massive ROI story for operations roles.*
