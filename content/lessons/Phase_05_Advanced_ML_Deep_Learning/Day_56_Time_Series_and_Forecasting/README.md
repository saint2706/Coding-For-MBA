---
day: 56
title: "Time Series & Forecasting"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "time-series"
duration: 60
difficulty: "advanced"
tags:
  - time-series
  - forecasting
  - arima
  - prophet
  - lstm
concepts:
  - "stationarity and differencing"
  - "ARIMA and SARIMAX models"
  - "Prophet for business forecasting"
  - "LSTM for sequence prediction"
  - "forecast evaluation metrics"
prerequisites: [48, 26]
outcomes:
  - "Analyze and decompose time series data"
  - "Build ARIMA models for stationary series"
  - "Use Prophet for trend and seasonality forecasting"
  - "Apply LSTM networks for complex temporal patterns"
---

# 🎯 Day 56: Time Series & Forecasting

> *"Predicting the future from patterns in the past."*

---

## The "Never-Coded" Bridge

**Imagine running a retail business.** Every week you need to order inventory. Order too little → stockouts, lost sales. Order too much → waste, storage costs.

**The answer? Forecast demand.**

Time series forecasting powers billion-dollar decisions:

**Retail & E-commerce:**

- **Amazon**: Forecasts product demand across millions of SKUs
- **Walmart**: Predicts sales 6 weeks ahead for supply chain optimization
- Impact: 5-10% reduction in inventory costs

**Finance:**

- **Stock trading**: Predict prices (even small edge = huge profits)
- **Risk management**: Forecast volatility for portfolio hedging
- **Fraud**: Detect unusual transaction patterns over time

**Operations:**

- **Energy**: Forecast electricity demand (prevent blackouts)
- **Staffing**: Predict call center volume (right-size teams)
- **Manufacturing**: Anticipate equipment failures (preventive maintenance)

**Healthcare:**

- **Hospital admissions**: Staff ICUs appropriately
- **Disease outbreaks**: Predict flu/COVID waves
- **Drug demand**: Ensure pharmacy stock levels

---

## The Technical Deep Dive

### Time Series Components

Every time series has 4 components:

1. **Trend**: Long-term increase/decrease
2. **Seasonality**: Regular patterns (daily, weekly, yearly)
3. **Cyclical**: Irregular ups/downs (business cycles)
4. **Residual/Noise**: Random fluctuations

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.seasonal import seasonal_decompose

# Generate synthetic retail sales data
np.random.seed(42)
dates = pd.date_range("2020-01-01", periods=365 * 3, freq="D")

# Trend: growing business
trend = np.linspace(100, 200, len(dates))

# Seasonal: weekly pattern (weekends higher)
seasonal_weekly = 20 * np.sin(2 * np.pi * np.arange(len(dates)) / 7)

# Seasonal: yearly pattern (holidays)
seasonal_yearly = 30 * np.sin(2 * np.pi * np.arange(len(dates)) / 365)

# Noise
noise = np.random.normal(0, 10, len(dates))

# Combined series
sales = trend + seasonal_weekly + seasonal_yearly + noise

df = pd.DataFrame({"date": dates, "sales": sales})
df.set_index("date", inplace=True)

# Decompose
decomposition = seasonal_decompose(df["sales"], model="additive", period=7)

# Plot
fig, axes = plt.subplots(4, 1, figsize=(12, 10))

df["sales"].plot(ax=axes[0], title="Original Time Series")
decomposition.trend.plot(ax=axes[1], title="Trend Component")
decomposition.seasonal.plot(ax=axes[2], title="Seasonal Component (Weekly)")
decomposition.resid.plot(ax=axes[3], title="Residual (Noise)")

plt.tight_layout()
plt.show()
```

### Stationarity Testing

**Stationary series:** Mean, variance, autocorrelation constant over time

**Why it matters:** Most classical models (ARIMA) require stationarity

```python
from statsmodels.tsa.stattools import adfuller, kpss


def test_stationarity(series, name=""):
    """Test if time series is stationary."""

    # Augmented Dickey-Fuller test
    # H0: Series has unit root (non-stationary)
    adf_result = adfuller(series.dropna())

    # KPSS test
    # H0: Series is stationary
    kpss_result = kpss(series.dropna(), regression="ct")

    print(f"=== Stationarity Tests for {name} ===")
    print(f"ADF Statistic: {adf_result[0]:.4f}")
    print(f"ADF p-value: {adf_result[1]:.4f}")
    print(
        f"  → {'Stationary' if adf_result[1] < 0.05 else 'Non-stationary'} (reject H0 if p<0.05)"
    )

    print(f"\nKPSS Statistic: {kpss_result[0]:.4f}")
    print(f"KPSS p-value: {kpss_result[1]:.4f}")
    print(
        f"  → {'Stationary' if kpss_result[1] > 0.05 else 'Non-stationary'} (fail to reject H0 if p>0.05)"
    )


# Test original series
test_stationarity(df["sales"], "Original Sales")

# Make stationary through differencing
df["sales_diff"] = df["sales"].diff()
test_stationarity(df["sales_diff"], "Differenced Sales")
```

### ARIMA: AutoRegressive Integrated Moving Average

**ARIMA(p, d, q)**:

- **p**: Autoregressive order (past values)
- **d**: Differencing order (make stationary)
- **q**: Moving average order (past errors)

```python
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf

# Plot ACF and PACF to determine p and q
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 4))
plot_acf(df["sales_diff"].dropna(), lags=30, ax=ax1, title="ACF")
plot_pacf(df["sales_diff"].dropna(), lags=30, ax=ax2, title="PACF")
plt.tight_layout()
plt.show()

# Split train/test
train_size = int(len(df) * 0.8)
train, test = df["sales"][:train_size], df["sales"][train_size:]

# Fit ARIMA model
model_arima = ARIMA(train, order=(2, 1, 2))  # p=2, d=1, q=2
fitted_arima = model_arima.fit()

print(fitted_arima.summary())

# Forecast
forecast_steps = len(test)
forecast_arima = fitted_arima.forecast(steps=forecast_steps)

# Plot
plt.figure(figsize=(14, 6))
plt.plot(train.index, train, label="Train", alpha=0.7)
plt.plot(test.index, test, label="Test (Actual)", alpha=0.7)
plt.plot(test.index, forecast_arima, label="ARIMA Forecast", linestyle="--")
plt.legend()
plt.title("ARIMA Forecasting")
plt.xlabel("Date")
plt.ylabel("Sales")
plt.grid(True, alpha=0.3)
plt.show()

# Evaluate
from sklearn.metrics import mean_absolute_error, mean_squared_error

mae = mean_absolute_error(test, forecast_arima)
rmse = np.sqrt(mean_squared_error(test, forecast_arima))

print(f"\n=== ARIMA Performance ===")
print(f"MAE: {mae:.2f}")
print(f"RMSE: {rmse:.2f}")
```

### SARIMAX: Seasonal ARIMA with Exogenous Variables

**SARIMAX(p,d,q)(P,D,Q,s)**: Handles seasonality explicitly

```python
from statsmodels.tsa.statespace.sarimax import SARIMAX

# SARIMAX with weekly seasonality (s=7)
model_sarimax = SARIMAX(
    train,
    order=(1, 1, 1),  # Non-seasonal: (p, d, q)
    seasonal_order=(1, 1, 1, 7),  # Seasonal: (P, D, Q, s)
    enforce_stationarity=False,
    enforce_invertibility=False,
)

fitted_sarimax = model_sarimax.fit(disp=False)

# Forecast
forecast_sarimax = fitted_sarimax.forecast(steps=forecast_steps)

# Plot
plt.figure(figsize=(14, 6))
plt.plot(train.index, train, label="Train")
plt.plot(test.index, test, label="Test (Actual)")
plt.plot(test.index, forecast_arima, label="ARIMA", linestyle="--", alpha=0.7)
plt.plot(test.index, forecast_sarimax, label="SARIMAX", linestyle="--", alpha=0.7)
plt.legend()
plt.title("Comparing ARIMA vs SARIMAX")
plt.xlabel("Date")
plt.ylabel("Sales")
plt.grid(True, alpha=0.3)
plt.show()

# Comparison
mae_sarimax = mean_absolute_error(test, forecast_sarimax)
rmse_sarimax = np.sqrt(mean_squared_error(test, forecast_sarimax))

print(f"\n=== Model Comparison ===")
print(f"ARIMA  - MAE: {mae:.2f}, RMSE: {rmse:.2f}")
print(f"SARIMAX - MAE: {mae_sarimax:.2f}, RMSE: {rmse_sarimax:.2f}")
```

### Prophet: Business-Friendly Forecasting

**Facebook Prophet**: Handles missing data, outliers, holidays automatically

```python
from prophet import Prophet

# Prophet requires 'ds' (date) and 'y' (value) columns
prophet_df = df.reset_index().rename(columns={"date": "ds", "sales": "y"})

train_prophet = prophet_df[:train_size]
test_prophet = prophet_df[train_size:]

# Build Prophet model
model_prophet = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=True,
    daily_seasonality=False,
    changepoint_prior_scale=0.05,  # Flexibility of trend changes
)

# Add custom seasonality if needed
model_prophet.add_seasonality(name="monthly", period=30.5, fourier_order=5)

# Fit
model_prophet.fit(train_prophet)

# Create future dataframe
future = model_prophet.make_future_dataframe(periods=forecast_steps, freq="D")

# Forecast
forecast_prophet = model_prophet.predict(future)

# Plot
fig1 = model_prophet.plot(forecast_prophet)
plt.title("Prophet Forecast")
plt.xlabel("Date")
plt.ylabel("Sales")
plt.show()

# Plot components (trend, seasonality)
fig2 = model_prophet.plot_components(forecast_prophet)
plt.show()

# Evaluate
forecast_values = forecast_prophet.tail(forecast_steps)["yhat"].values
mae_prophet = mean_absolute_error(test, forecast_values)
rmse_prophet = np.sqrt(mean_squared_error(test, forecast_values))

print(f"Prophet - MAE: {mae_prophet:.2f}, RMSE: {rmse_prophet:.2f}")
```

### LSTM for Time Series

**Long Short-Term Memory networks**: Capture long-range dependencies

```python
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler

# Prepare data for LSTM
scaler = MinMaxScaler()
sales_scaled = scaler.fit_transform(df["sales"].values.reshape(-1, 1))


def create_sequences(data, seq_length):
    X, y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[i : i + seq_length])
        y.append(data[i + seq_length])
    return np.array(X), np.array(y)


seq_length = 30  # Use past 30 days to predict next day

X, y = create_sequences(sales_scaled, seq_length)

# Train/test split
X_train, X_test = X[: train_size - seq_length], X[train_size - seq_length :]
y_train, y_test = y[: train_size - seq_length], y[train_size - seq_length :]

# Build LSTM model
model_lstm = Sequential(
    [
        LSTM(50, return_sequences=True, input_shape=(seq_length, 1)),
        Dropout(0.2),
        LSTM(50, return_sequences=False),
        Dropout(0.2),
        Dense(25, activation="relu"),
        Dense(1),
    ]
)

model_lstm.compile(optimizer="adam", loss="mse")

# Train
history = model_lstm.fit(
    X_train, y_train, epochs=50, batch_size=32, validation_split=0.1, verbose=1
)

# Forecast
y_pred_scaled = model_lstm.predict(X_test)
y_pred = scaler.inverse_transform(y_pred_scaled)
y_test_actual = scaler.inverse_transform(y_test)

# Evaluate
mae_lstm = mean_absolute_error(y_test_actual, y_pred)
rmse_lstm = np.sqrt(mean_squared_error(y_test_actual, y_pred))

print(f"\nLSTM - MAE: {mae_lstm:.2f}, RMSE: {rmse_lstm:.2f}")

# Plot
plt.figure(figsize=(14, 6))
plt.plot(range(len(y_test_actual)), y_test_actual, label="Actual")
plt.plot(range(len(y_pred)), y_pred, label="LSTM Forecast", linestyle="--")
plt.legend()
plt.title("LSTM Time Series Forecasting")
plt.xlabel("Time Steps")
plt.ylabel("Sales")
plt.grid(True, alpha=0.3)
plt.show()
```

---

## Senior-Level Insights

### Model Selection Guide

| Model       | Best For                          | Pros                             | Cons                                 |
| ----------- | --------------------------------- | -------------------------------- | ------------------------------------ |
| **ARIMA**   | Short-term, stationary series     | Interpretable, fast              | Requires stationarity, manual tuning |
| **SARIMAX** | Seasonal data with exog variables | Handles seasonality well         | Slow for large datasets              |
| **Prophet** | Business forecasting, holidays    | Easy to use, robust              | Less accurate for complex patterns   |
| **LSTM**    | Complex, non-linear patterns      | Powerful, handles long sequences | Needs lots of data, slow to train    |

### Forecast Evaluation Metrics

```python
# Never use R² for time series (misleading)!
# Use these instead:

# MAE: Mean Absolute Error (same units as data)
mae = np.mean(np.abs(actual - forecast))

# RMSE: Root Mean Squared Error (penalizes large errors)
rmse = np.sqrt(np.mean((actual - forecast) ** 2))

# MAPE: Mean Absolute Percentage Error (scale-independent)
mape = np.mean(np.abs((actual - forecast) / actual)) * 100

# Directional Accuracy (for trading)
directional_acc = np.mean(
    np.sign(actual[1:] - actual[:-1]) == np.sign(forecast[1:] - forecast[:-1])
)
```

### Cross-Validation for Time Series

**CRITICAL:** Never shuffle! Use time-based splits

```python
from sklearn.model_selection import TimeSeriesSplit

tscv = TimeSeriesSplit(n_splits=5)

for train_idx, test_idx in tscv.split(X):
    X_train, X_test = X[train_idx], X[test_idx]
    # Train and evaluate
```

---

## Hands-on Lab

### Exercise 1: Stock Price Forecasting with ARIMA

```python
import yfinance as yf

# Download stock data
ticker = yf.Ticker("AAPL")
stock_data = ticker.history(period="2y")

# Use closing price
prices = stock_data["Close"]

# Log returns (more stationary)
log_returns = np.log(prices / prices.shift(1)).dropna()

# Test stationarity
test_stationarity(log_returns, "Log Returns")

# Auto ARIMA (finds best p, d, q)
from pmdarima import auto_arima

auto_model = auto_arima(
    log_returns,
    seasonal=False,
    stepwise=True,
    suppress_warnings=True,
    error_action="ignore",
)

print(auto_model.summary())

# Forecast next 30 days
forecast_log_returns = auto_model.predict(n_periods=30)

# Convert back to prices
last_price = prices.iloc[-1]
forecast_prices = last_price * np.exp(np.cumsum(forecast_log_returns))

print(f"\nForecast for next 30 days:")
print(forecast_prices)
```

---

### Exercise 2: Demand Forecasting with Prophet

```python
# Simulate e-commerce demand with holidays
np.random.seed(42)
dates = pd.date_range("2021-01-01", "2023-12-31", freq="D")

# Base demand
demand = 1000 + 200 * np.sin(2 * np.pi * np.arange(len(dates)) / 365)

# Weekday effect
weekday = pd.Series(dates).dt.dayofweek
demand += (weekday < 5) * 100  # Higher on weekdays

# Holiday spikes (Black Friday, Christmas)
holidays = [
    ("2021-11-26", 500),
    ("2021-12-25", 700),
    ("2022-11-25", 550),
    ("2022-12-25", 750),
    ("2023-11-24", 600),
    ("2023-12-25", 800),
]

for holiday_date, spike in holidays:
    idx = (dates == holiday_date).argmax()
    demand[idx] += spike

# Noise
demand += np.random.normal(0, 50, len(dates))

# DataFrame
df_demand = pd.DataFrame({"ds": dates, "y": demand})

# Prophet with holidays
model_demand = Prophet()

# Add custom holidays
us_holidays = pd.DataFrame(
    {
        "holiday": "christmas",
        "ds": pd.to_datetime(["2021-12-25", "2022-12-25", "2023-12-25"]),
        "lower_window": -7,  # Effect starts 7 days before
        "upper_window": 1,  # Effect ends 1 day after
    }
)

model_demand = Prophet(holidays=us_holidays, yearly_seasonality=True)
model_demand.fit(df_demand)

# Forecast 2024
future = model_demand.make_future_dataframe(periods=365, freq="D")
forecast_demand = model_demand.predict(future)

# Plot
model_demand.plot(forecast_demand)
plt.title("E-commerce Demand Forecasting with Holidays")
plt.show()

model_demand.plot_components(forecast_demand)
plt.show()
```

---

### Exercise 3: Multi-Step LSTM Forecasting

```python
# Build model that predicts next 7 days (not just 1)


def create_multi_step_sequences(data, input_len, output_len):
    X, y = [], []
    for i in range(len(data) - input_len - output_len + 1):
        X.append(data[i : i + input_len])
        y.append(data[i + input_len : i + input_len + output_len])
    return np.array(X), np.array(y)


input_len = 30
output_len = 7  # Predict next week

X_multi, y_multi = create_multi_step_sequences(sales_scaled, input_len, output_len)

# Split
split_idx = int(len(X_multi) * 0.8)
X_train_multi, X_test_multi = X_multi[:split_idx], X_multi[split_idx:]
y_train_multi, y_test_multi = y_multi[:split_idx], y_multi[split_idx:]

# Multi-output LSTM
model_multi_lstm = Sequential(
    [
        LSTM(100, return_sequences=True, input_shape=(input_len, 1)),
        Dropout(0.2),
        LSTM(100),
        Dropout(0.2),
        Dense(50, activation="relu"),
        Dense(output_len),  # Output 7 values
    ]
)

model_multi_lstm.compile(optimizer="adam", loss="mse")

history_multi = model_multi_lstm.fit(
    X_train_multi,
    y_train_multi,
    epochs=50,
    batch_size=32,
    validation_split=0.1,
    verbose=1,
)

# Predict
y_pred_multi_scaled = model_multi_lstm.predict(X_test_multi)
y_pred_multi = scaler.inverse_transform(y_pred_multi_scaled)
y_test_multi_actual = scaler.inverse_transform(y_test_multi)

# Evaluate each forecast horizon
for i in range(output_len):
    mae_horizon = mean_absolute_error(y_test_multi_actual[:, i], y_pred_multi[:, i])
    print(f"Day +{i + 1} MAE: {mae_horizon:.2f}")

# Plot first 3 test samples
fig, axes = plt.subplots(3, 1, figsize=(14, 10))
for i, ax in enumerate(axes):
    ax.plot(range(output_len), y_test_multi_actual[i], label="Actual", marker="o")
    ax.plot(range(output_len), y_pred_multi[i], label="Forecast", marker="x")
    ax.set_title(f"Test Sample {i + 1}: 7-Day Forecast")
    ax.legend()
    ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

---

## Mastery Check

### Question 1: Stationarity Requirement

Why do classical models like ARIMA require stationary data?

<details>
<summary>Click for Answer</summary>

**Answer:** Non-stationary data has time-varying statistics (mean, variance), making model parameters unreliable and forecasts inaccurate. Stationary data ensures consistent relationships over time.

**Non-stationary problems:**

**1. Changing mean (trend)**

```python
# Sales growing 10% per year
# Today: mean = 1000
# Next year: mean = 1100

# ARIMA trained on today's data predicts around 1000
# But next year's actual mean is 1100 → systematic underperformance
```

**2. Changing variance (heteroscedasticity)**

```
Small company: sales variance = ±50
Large company: sales variance = ±500

Model trained on small variance will be overconfident for large variance
```

**3. Spurious correlations**

```python
# Two non-stationary series (both trending up)
# May appear correlated even if unrelated
# Example: Ice cream sales and shark attacks (both increase in summer)
```

**Making data stationary:**

**Differencing:**

```python
# removes trend
diff = series - series.shift(1)

# Second differencing (for quadratic trends)
diff2 = diff - diff.shift(1)
```

**Log transformation:**

```python
# Stabilizes variance (multiplicative seasonality → additive)
log_series = np.log(series)
```

**Detrending:**

```python
from scipy import signal

detrended = signal.detrend(series)
```

**Why it matters for ARIMA:**

- **AR** (autoregressive): Assumes past values predict future with constant coefficients
  - Non-stationary → coefficients change over time → unreliable
- **MA** (moving average): Assumes errors have constant variance
  - Heteroscedasticity → violates assumption

**Testing stationarity:**

```python
# ADF test: H0 = non-stationary
# If p < 0.05 → reject H0 → stationary

# KPSS test: H0 = stationary
# If p > 0.05 → fail to reject H0 → stationary

# Use both tests (confirm with multiple methods)
```

</details>

---

### Question 2: Prophet vs ARIMA

Your retail company wants to forecast sales for next quarter. When should you use Prophet instead of ARIMA?

<details>
<summary>Click for Answer</summary>

**Answer:** Use Prophet when you have strong seasonality, holidays/events, missing data, or need quick business forecasts without manual tuning. Use ARIMA for cleaner data and when you need granular control.

**Prophet advantages:**

**1. Handles holidays/events automatically**

```python
# Black Friday, Christmas, Prime Day
# Prophet models these as special regressors

prophet_model = Prophet(holidays=us_holidays)
# ARIMA: You'd need exogenous variables + manual feature engineering
```

**2. Robust to missing data**

```python
# Sales data with gaps (system downtime)
# Prophet: Interpolates automatically
# ARIMA: Requires imputation preprocessing
```

**3. Multiple seasonality**

```python
# Daily + weekly + yearly patterns
prophet_model.add_seasonality(name="daily", period=1, fourier_order=5)
prophet_model.add_seasonality(name="weekly", period=7, fourier_order=3)
# ARIMA: Would need SARIMAX with complex seasonal orders
```

**4. Business-friendly uncertainty intervals**

```python
# Prophet gives 80% and 95% confidence intervals
forecast = prophet_model.predict(future)
# forecast contains 'yhat_lower' and 'yhat_upper'

# Great for business: "Sales will be 1000 ±100 with 95% confidence"
```

**5. Trend changepoints**

```python
# Prophet detects trend changes automatically
# E.g., COVID-19 impact, new product launch

# ARIMA: Assumes constant trend dynamics
```

**ARIMA advantages:**

**1. Statistical rigor**

```python
# Prophet is a "black box" GLM
# ARIMA: Clear p, d, q interpretation
# - AR(2): Uses past 2 values
# - MA(1): Uses past 1 error term
```

**2. Short-term accuracy**

```python
# For next 1-7 days, ARIMA often beats Prophet
# Prophet better for longer horizons (weeks/months)
```

**3. Stationary series**

```python
# If data is already clean and stationary
# ARIMA is simpler and faster
```

**Decision matrix:**

| Factor                | Prophet | ARIMA             |
| --------------------- | ------- | ----------------- |
| Holidays matter       | ✅       | ❌                 |
| Multiple seasonality  | ✅       | ⚠️ (needs SARIMAX) |
| Missing data          | ✅       | ❌                 |
| Trend changepoints    | ✅       | ❌                 |
| Interpretability      | ❌       | ✅                 |
| Short-term (< 1 week) | ⚠️       | ✅                 |
| Long-term (> 1 month) | ✅       | ⚠️                 |
| Quick deployment      | ✅       | ❌ (tuning needed) |

**Best practice:** Try both! Ensemble them:

```python
forecast_final = 0.6 * forecast_prophet + 0.4 * forecast_arima
```

</details>

---

### Question 3: LSTM Sequence Length

For time series forecasting with LSTM, how do you choose the sequence length (lookback window)?

<details>
<summary>Click for Answer</summary>

**Answer:** Choose sequence length based on the longest meaningful pattern in your data (e.g., 7 for weekly, 30 for monthly). Balance between capturing dependencies and avoiding overfitting.

**Guiding principles:**

**1. Domain knowledge**

```python
# Stock prices: 5-20 days (traders look at 1-4 week windows)
seq_length = 10

# Monthly sales: 12-24 months (yearly seasonality)
seq_length = 12

# Hourly electricity: 24-168 hours (daily/weekly patterns)
seq_length = 24 * 7  # 1 week
```

**2. Autocorrelation analysis**

```python
from statsmodels.graphics.tsaplots import plot_acf

plot_acf(sales, lags=60)
# Cutoff at lag where autocorrelation drops to near zero
# If significant correlation up to lag 30 → use seq_length=30
```

**3. Experimentation**

```python
seq_lengths = [7, 14, 30, 60, 90]
results = {}

for seq_len in seq_lengths:
    X, y = create_sequences(data, seq_len)
    # Train LSTM, evaluate on validation
    mae = evaluate_model(X, y)
    results[seq_len] = mae

best_seq_length = min(results, key=results.get)
print(f"Optimal sequence length: {best_seq_length}")
```

**Trade-offs:**

**Too short (e.g., seq_length=3)**

```
- Misses long-term patterns
- Example: Can't capture weekly seasonality with only 3 days
- Underfitting
```

**Too long (e.g., seq_length=365 for daily data)**

```
- Fewer training samples (n - seq_length samples)
- More parameters → overfitting
- Longer training time
- Vanishing gradient problems (even with LSTM)
```

**Practical guidelines:**

**Daily data:**

- Short-term forecast (1-7 days): seq_length = 14-30
- Medium-term (1-4 weeks): seq_length = 30-60
- Long-term (1-3 months): seq_length = 60-90

**Hourly data:**

- Next hour: seq_length = 24 (1 day)
- Next day: seq_length = 168 (1 week)

**Minute data (high-frequency trading):**

- Next minute: seq_length = 60-300 (1-5 hours)

**Advanced technique: Multi-scale inputs**

```python
# Use multiple sequence lengths
input_short = X[:, -7:, :]  # Last week
input_medium = X[:, -30:, :]  # Last month
input_long = X[:, -90:, :]  # Last quarter

# Separate LSTM branches, then concat
# Captures patterns at different time scales
```

**Rule of thumb:** Start with the dominant seasonality period (7 for weekly, 30 for monthly), then tune ±50%.

</details>

---

### Question 4: Forecast Horizon Degradation

You build a model with MAE=10 for 1-day-ahead forecasts. For 7-days-ahead, MAE=50. Why does performance degrade, and how can you improve it?

<details>
<summary>Click for Answer</summary>

**Answer:** Performance degrades because error compounds over time (recursive forecasting) and uncertainty increases. Improve with direct multi-horizon models, ensemble methods, or external regressors.

**Why degradation occurs:**

**1. Recursive forecasting compounds errors**

```python
# Day 1: Forecast tomorrow using today's actual → MAE=10
# Day 2: Forecast using Day 1's forecast (not actual) → Error grows
# Day 3: Forecast using Day 2's forecast → Error grows further
# ...
# Day 7: Error accumulated over 7 steps → MAE~50

# Math: If each step has error σ, and errors are independent:
# 7-step error ~ sqrt(7) * σ ≈ 2.6σ
# Here: 50 / 10 = 5, worse than sqrt(7) → errors are correlated!
```

**2. Increasing uncertainty**

```
- Near-term: High confidence (tomorrow's weather)
- Long-term: Low confidence (weather 30 days out)
- Information decays over time
```

**3. Unforeseen events**

```python
# Days 1-3: Normal patterns hold
# Day 5: Competitor launches sale (not in training data)
# → Large forecast error
```

**Solutions:**

**1. Direct multi-horizon forecasting**

```python
# Instead of: forecast→forecast→forecast (recursive)
# Train separate model for each horizon (direct)

model_day1 = train_model(X, y_day1)  # Target: t+1
model_day7 = train_model(X, y_day7)  # Target: t+7

# Pros: No error compounding
# Cons: Need K models for K horizons
```

**2. Multi-output models**

```python
# Single model outputs all 7 days at once
model = Sequential(
    [
        LSTM(100, input_shape=(30, 1)),
        Dense(7),  # Output 7 values simultaneously
    ]
)

# Learns dependencies between future time steps
```

**3. Ensemble across horizons**

```python
# Short horizon: Use ARIMA (accurate for 1-3 days)
# Long horizon: Use Prophet (better at capturing trends)

if horizon <= 3:
    forecast = arima_model.forecast(horizon)
else:
    forecast = prophet_model.predict(horizon)
```

**4. External regressors**

```python
# Add features to reduce uncertainty
# - Promotions schedule (known ahead)
# - Weather forecast
# - Economic indicators

sarimax_model = SARIMAX(sales, exog=external_features, ...)
# Reduces error by explaining variance
```

**5. Update forecasts daily (rolling)**

```python
# Don't forecast 7 days ahead once
# Forecast 1 day ahead, then update with new data tomorrow

# Day 1: Forecast Days 2-8 (using Day 1 actual)
# Day 2: Forecast Days 3-9 (using Day 2 actual)
# ...
# Always forecasting 1-day-ahead (low error)
```

**6. Probabilistic forecasts**

```python
# Accept that long-horizon forecasts are uncertain
# Provide prediction intervals

prophet_forecast["yhat_lower"]  # 80% lower bound
prophet_forecast["yhat_upper"]  # 80% upper bound

# Day 1: ±5 uncertainty
# Day 7: ±30 uncertainty (wider interval)
```

**Realistic expectations:**

| Horizon      | Typical MAE Increase (vs 1-day) |
| ------------ | ------------------------------- |
| 1-day-ahead  | 1x (baseline)                   |
| 3-day-ahead  | 1.5-2x                          |
| 7-day-ahead  | 2-4x                            |
| 30-day-ahead | 5-10x                           |

**Key insight:** Perfect long-term forecasts are impossible. Focus on calibrated uncertainty and frequent updates.

</details>

---

### Question 5: Production Monitoring

Your time series model has been in production for 3 months. How do you monitor it to detect when retrain is needed?

<details>
<summary>Click for Answer</summary>

**Answer:** Track forecast error over time (MAE/RMSE), detect concept drift, monitor residual patterns, and retrain when performance degrades beyond threshold or data distribution shifts.

**Monitoring metrics:**

**1. Rolling forecast accuracy**

```python
# Daily tracking
window = 30  # Last 30 days
rolling_mae = []

for day in production_days:
    actual = get_actual(day)
    forecast = get_forecast(day)
    error = abs(actual - forecast)

    recent_errors = errors[-window:]
    rolling_mae.append(np.mean(recent_errors))

# Alert if MAE exceeds baseline by 50%
if current_mae > baseline_mae * 1.5:
    trigger_retrain()
```

**2. Forecast bias**

```python
# Systematic over/under-forecasting
bias = np.mean(forecast - actual)

# Model predicting too high: bias > 0
# Model predicting too low: bias < 0

# Alert if |bias| > threshold
if abs(bias) > 10:
    print("Model is biased! Retrain needed.")
```

**3. Residual patterns**

```python
# Residuals should be random (white noise)
#  If patterns emerge → model missing something

residuals = actual - forecast

# Test for autocorrelation
from statsmodels.stats.diagnostic import acorr_ljungbox

lb_stat, p_value = acorr_ljungbox(residuals, lags=[10])

if p_value < 0.05:
    print("Residuals are autocorrelated! Model needs improvement.")
```

**4. Distribution shift detection**

```python
# Compare recent data to training data distribution

from scipy.stats import ks_2samp

# Kolmogorov-Smirnov test
recent_data = sales[-90:]  # Last 3 months
training_data = historical_sales

stat, p_value = ks_2samp(recent_data, training_data)

if p_value < 0.05:
    print("Data distribution has shifted! Retrain model.")
```

**5. Business metric impact**

```python
# Forecast error → business cost

# Example: Inventory management
overstock_cost = np.sum(np.maximum(0, forecast - actual)) * cost_per_unit_storage
understock_cost = np.sum(np.maximum(0, actual - forecast)) * cost_per_unit_shortage

total_cost = overstock_cost + understock_cost

# Retrain if cost exceeds budget
if total_cost > monthly_budget:
    trigger_retrain()
```

**Retraining triggers:**

**Time-based:**

```python
# Retrain every N months (simple, works for stable environments)
if datetime.now() - last_retrain_date > timedelta(days=90):
    retrain()
```

**Performance-based:**

```python
# Retrain when error degrades
if rolling_mae > baseline_mae * 1.3:  # 30% worse
    retrain()
```

**Event-based:**

```python
# Retrain after known changepoints
events = [
    "2023-03-15",  # New product launch
    "2023-06-20",  # Pricing change
    "2023-09-01",  # Market expansion
]

if today in events:
    retrain()
```

**Drift detection algorithms:**

```python
from alibi_detect import AdversarialDrift, KSDrift

# KS Drift Detector
cd = KSDrift(X_train, p_val=0.05)

# Test recent data
recent_batch = X_recent[-1000:]
drift_detected = cd.predict(recent_batch)

if drift_detected["data"]["is_drift"]:
    print("Drift detected! Retraining...")
    retrain()
```

**Dashboard for monitoring:**

```
Time Series Model Health Dashboard
-----------------------------------
Model: Sales Forecast LSTM
Last Retrain: 2023-11-01
Days Since Retrain: 47

Performance Metrics:
- MAE (7-day avg): 12.5 (baseline: 10.0) ⚠️ +25%
- RMSE (7-day avg): 18.3 (baseline: 15.0) ⚠️ +22%
- Bias (7-day avg): +3.2 (overforecasting)
- MAPE: 8.5%

Alerts:
⚠️ MAE increased by 25% (threshold: 30%)
✅ No distribution shift detected
✅ Residuals are white noise

Recommendation: Monitor closely. Retrain if MAE reaches +30%.
```

**Best practices:**

- **Automate retraining**: Trigger automatically when drift detected
- **A/B test new models**: Champion vs challenger in production
- **Log everything**: Forecasts, actuals, features, model versions
- **Version models**: Rollback if new model underperforms

</details>

---

## Senior-Level Insights: Advanced Forecasting

### Multivariate Time Series

Most real business forecasting problems involve multiple correlated series. Demand for Product A affects demand for Product B; temperature affects energy consumption which affects grid pricing. Univariate models ignore these cross-series relationships.

```python
import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.varmax import VARMAX

# Example: jointly forecast daily sales for 3 product categories
# Each category influences the others (substitution + complementarity effects)
np.random.seed(42)
n = 200
dates = pd.date_range("2023-01-01", periods=n, freq="D")

# Simulate correlated product sales
electronics = np.random.randn(n).cumsum() + 100
accessories = 0.6 * electronics + np.random.randn(n) * 5  # accessories follow electronics
software = 0.3 * electronics + 0.4 * accessories + np.random.randn(n) * 3

df = pd.DataFrame(
    {"electronics": electronics, "accessories": accessories, "software": software},
    index=dates,
)

# VAR model: models all series jointly, capturing cross-series dynamics
train_df = df.iloc[:-30]
test_df = df.iloc[-30:]

var_model = VARMAX(train_df, order=(2, 0))  # VAR(2) — use 2 lags
var_fit = var_model.fit(disp=False)

# Forecast next 30 days for all three products simultaneously
forecast = var_fit.forecast(steps=30)
forecast.columns = ["electronics", "accessories", "software"]

print("VAR 30-day forecast:")
print(forecast.head())

# Granger causality: test whether electronics Granger-causes accessories
from statsmodels.tsa.stattools import grangercausalitytests
gc_result = grangercausalitytests(df[["accessories", "electronics"]], maxlag=5, verbose=False)
# If p < 0.05 for lag k, electronics at k days ago helps predict accessories
```

**When to use multivariate forecasting:**

| Approach | When to use | Example |
|---------|-------------|---------|
| Univariate (ARIMA/Prophet) | Single KPI, minimal cross-dependencies | Website traffic forecast |
| VAR/VARMAX | Multiple correlated KPIs, executive-level planning | Multi-SKU demand planning |
| LSTM with multiple inputs | Complex nonlinear cross-series relationships | Energy grid load forecasting |
| Hierarchical forecasting | Forecast at multiple aggregation levels (SKU → category → brand) | Retail inventory allocation |

### Forecast Combination: The Free Lunch

Averaging forecasts from multiple models almost always outperforms any single model — this is the forecasting equivalent of ensemble methods:

```python
# Forecast combination: simple average (hard to beat)
arima_forecast = ...   # Your ARIMA predictions
prophet_forecast = ... # Your Prophet predictions
lstm_forecast = ...    # Your LSTM predictions

# Simple average (surprisingly effective)
combined_simple = (arima_forecast + prophet_forecast + lstm_forecast) / 3

# Optimal weights (minimize validation MAE)
from scipy.optimize import minimize

def portfolio_mae(weights, forecasts, actuals):
    """Objective: minimize MAE of weighted combination."""
    combined = sum(w * f for w, f in zip(weights, forecasts))
    return np.mean(np.abs(combined - actuals))

result = minimize(
    portfolio_mae,
    x0=[1/3, 1/3, 1/3],
    args=([arima_forecast, prophet_forecast, lstm_forecast], val_actuals),
    constraints={"type": "eq", "fun": lambda w: sum(w) - 1},
    bounds=[(0, 1)] * 3,
)
optimal_weights = result.x
# Output: e.g., [0.45, 0.30, 0.25] — ARIMA gets more weight if data is stationary

# Rule of thumb: if optimal weight beats equal weight by < 0.5% MAPE,
# keep equal weight — it's more robust out of sample.
```

---

## Summary

Today you learned:

- ✅ Time series components: trend, seasonality, cyclical, noise
- ✅ Stationarity testing and differencing for ARIMA requirements
- ✅ ARIMA and SARIMAX for classical forecasting
- ✅ Prophet for business-friendly forecasting with holidays
- ✅ LSTM networks for complex, non-linear temporal patterns
- ✅ Forecast evaluation (MAE, RMSE, MAPE vs R²)
- ✅ Production monitoring for concept drift and model degradation

**Tomorrow**: Recommender systems—collaborative filtering, matrix factorization, and content-based recommendations.

---

## Glossary

- **Stationarity**: A property of a time series where mean, variance, and autocorrelation structure do not change over time; required by classical models like ARIMA.
- **Trend**: The long-term directional movement in a time series (upward, downward, or flat), distinct from short-term fluctuations.
- **Seasonality**: Regular, repeating patterns in a time series tied to a fixed calendar period (daily, weekly, yearly), such as holiday sales spikes.
- **Autocorrelation**: The correlation of a time series with a lagged version of itself; used to identify how much past values predict future values.
- **ARIMA (Autoregressive Integrated Moving Average)**: A classical forecasting model combining autoregressive terms (past values), differencing (to achieve stationarity), and moving average terms (past errors); parameterized as ARIMA(p, d, q).
- **SARIMAX**: Seasonal ARIMA with eXogenous variables; extends ARIMA with explicit seasonal components (P, D, Q, s) and optional external regressors.
- **Prophet**: An open-source forecasting library from Meta designed for business time series; handles trends, multiple seasonalities, holidays, and missing data automatically.
- **Walk-forward validation**: A time-series cross-validation strategy that trains on past data and tests on subsequent windows sequentially, preserving temporal order to avoid data leakage.
- **Mean Absolute Percentage Error (MAPE)**: A scale-independent forecast accuracy metric: the average absolute percentage difference between forecasted and actual values; useful for comparing across series with different scales.
- **Horizon**: The number of future time steps a forecast covers; short-horizon forecasts (1–7 days) are generally more accurate than long-horizon forecasts (months).

---

## Cross-References

- **Day 48 — RNNs and LSTMs**: Provides the deep learning foundation for sequential data; LSTMs are the neural alternative to ARIMA/Prophet for complex, nonlinear time series patterns.
- **Day 55 — Advanced Unsupervised Learning**: Covers anomaly detection methods (Isolation Forest, autoencoders) that complement time series forecasting when detecting outliers in historical series.
- **Day 57 — Recommender Systems**: Demand forecasting connects directly to inventory optimization, which in turn informs recommendation systems by ensuring popular items are in stock.
- **Day 50 — MLOps**: Production monitoring concepts apply to detecting forecast drift over time and triggering model retraining when performance degrades.

---

## Optional Build Tracks (Day 49-60 Extension)

Keep the **core lab tasks** in this lesson common for all learners, then add one optional extension artifact per track:

| Track | Day 56 assignment artifact |
| --- | --- |
| **NLP** | Temporal text trend model baseline (moving-average keyword trends) vs advanced sequence model for text-driven demand. |
| **Forecasting** | Core time-series assignment baseline (ARIMA/Prophet) vs advanced deep forecaster (TFT/LSTM). |
| **Recommenders/Graph** | Time-aware recommendation features baseline (recency heuristics) vs advanced sequential interaction model. |

### Track requirements (apply to all three tracks)

1. **Baseline + advanced model comparison (required):** report offline metrics, error slices, and deployment trade-offs.
2. **Constraint scenario test (required):** run at least one scenario each day from: **limited data**, **latency limit**, **explainability requirement**.
3. **Refactoring checkpoint #1 (Day 53):** modularize data prep, training, evaluation, and inference into reusable pipeline components.
4. **Refactoring checkpoint #2 (Day 58):** externalize hyperparameters/model settings into versioned config files.
5. **Final deliverable (Day 60):** submit a concise **performance + business-impact memo** tying model lift to ROI, risk, and rollout recommendation.
