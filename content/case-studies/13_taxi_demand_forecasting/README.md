# 🚕 Case Study 13: Taxi Fleet Demand Forecasting (Real Data)

> **Phases covered**: Phase 2 (Data Wrangling) · Phase 5 (Advanced ML)
> **Difficulty**: Intermediate → Advanced
> **Estimated time**: 8–10 hours

---

## 🎯 Case Overview

You're the analytics lead for a taxi dispatch operation using **New York
City's own official trip record data** — millions of real, GPS-timestamped
rides published monthly by the city. No synthetic generator: this is the
actual government open dataset that ride-hail researchers and NYC's own TLC
regulators use.

The dispatch team currently pre-positions drivers based on gut feel. They
want an hourly demand forecast by pickup zone so they can reposition the
fleet ahead of demand spikes and set a data-driven surge multiplier instead
of an arbitrary one.

---

## 📊 Data Source & Attribution

| | |
| --- | --- |
| **Dataset** | TLC Trip Record Data (Yellow Taxi) |
| **Provider** | NYC Taxi & Limousine Commission (a NYC government agency) |
| **URL** | https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page |
| **Direct file pattern** | `https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_YYYY-MM.parquet` |
| **Zone lookup table** | `https://d37ci6vzurychx.cloudfront.net/misc/taxi_zone_lookup.csv` |
| **License** | Public domain — published by NYC Open Data as open government data |
| **Size** | ~3 million trips per month (yellow cabs alone) |

We'll work with **one month** of data to keep the exercise tractable; the
pipeline generalises to any month TLC has published.

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Fleet size | 400 vehicles |
| Avg. fare per trip | $18 |
| Cost of an idle driver-hour | $25 |
| Cost of an unmet-demand event (rider abandons) | $12 in lost goodwill/fare |
| Pickup zones tracked | 263 (TLC taxi zones) |

**Key question:** *How many rides should we expect in each zone, each hour,
for tomorrow — and where should surge pricing kick in?*

---

## 🗂️ Project Structure

```
13_taxi_demand_forecasting/
├── README.md          ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs — follow step by step
└── data_loader.py       ← downloads one month of real TLC trip data
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 2 | Pandas datetime handling, groupby aggregation at scale |
| Phase 5 | Time-series forecasting, lag/rolling features, gradient boosting regression |
| Phase 4 | Regression evaluation (MAE, MAPE) |

---

## 🤝 Hand-Holding Walkthrough

### Step 1 — Download Real Trip Data

**What:** Pull one month of real yellow taxi trips directly from the TLC's
public CDN, plus the zone lookup table.

**Why:** This is the actual dataset regulators and academic researchers use
to study NYC mobility — working with it end-to-end (including the file size
and column quirks) is a realistic "big-ish data" exercise.

**How:**

```python
python data_loader.py             # downloads yellow_tripdata_2024-01.parquet
                                   # + taxi_zone_lookup.csv

import pandas as pd
trips = pd.read_parquet("yellow_tripdata_2024-01.parquet")
zones = pd.read_csv("taxi_zone_lookup.csv")
print(trips.shape)
print(trips.columns.tolist())
```

**✅ Checkpoint:** ~2.5–3 million rows, columns including
`tpep_pickup_datetime`, `PULocationID`, `trip_distance`, `fare_amount`.

---

### Step 2 — Clean & Aggregate to Hourly Demand

**What:** Filter obviously bad rows (negative fares, zero-distance trips,
trips outside the target month), then aggregate to **pickups per zone per
hour**.

**Why:** Real GPS/meter data has recording errors — a handful of trips will
have negative fares or 0-mile "trips" that are actually meter glitches. The
forecasting model needs a clean, regular hourly time series, not raw
trip-level rows.

**How:**

```python
trips = trips[(trips["fare_amount"] > 0) & (trips["trip_distance"] > 0)]
trips["pickup_hour"] = trips["tpep_pickup_datetime"].dt.floor("h")

hourly_demand = (
    trips.groupby(["PULocationID", "pickup_hour"])
    .size()
    .reset_index(name="pickups")
)
print(hourly_demand.shape)
```

**✅ Checkpoint:** Roughly 263 zones × ~720 hours in a month = up to ~190,000
zone-hour rows (fewer in practice — quiet zones have gaps with zero trips).

---

### Step 3 — Time-Series Feature Engineering

**What:** For a handful of the busiest zones, build lag and rolling-average
features plus hour-of-day/day-of-week indicators.

**Why:** Taxi demand is heavily driven by real, recurring patterns —
weekday rush hours, weekend nightlife, airport zones spiking around flight
banks. Lag features let a regression model capture that recurring
structure without hand-coding every rule.

**How:**

```python
top_zone = hourly_demand.groupby("PULocationID")["pickups"].sum().idxmax()
zone_ts = (
    hourly_demand[hourly_demand["PULocationID"] == top_zone]
    .set_index("pickup_hour")
    .asfreq("h", fill_value=0)
)

zone_ts["hour_of_day"] = zone_ts.index.hour
zone_ts["day_of_week"] = zone_ts.index.dayofweek
zone_ts["lag_1h"] = zone_ts["pickups"].shift(1)
zone_ts["lag_24h"] = zone_ts["pickups"].shift(24)
zone_ts["rolling_24h_avg"] = zone_ts["pickups"].rolling(24).mean()
zone_ts = zone_ts.dropna()
```

**✅ Checkpoint:** Plot `pickups` over a week — you should clearly see daily
peaks (e.g. evening rush) and a weekday/weekend shape difference.

---

### Step 4 — Forecast & Evaluate

**What:** Train a gradient boosting regressor on the engineered features,
using a time-based (not random) train/test split, and evaluate with MAPE.

**Why:** Shuffling time-series data before splitting leaks future
information into training — a time-based split (train on earlier weeks,
test on the last week) mirrors how the model would actually be used in
production.

**How:**

```python
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_percentage_error

features = ["hour_of_day", "day_of_week", "lag_1h", "lag_24h", "rolling_24h_avg"]
split_point = zone_ts.index.max() - pd.Timedelta(days=7)

train = zone_ts[zone_ts.index <= split_point]
test = zone_ts[zone_ts.index > split_point]

model = GradientBoostingRegressor(random_state=42)
model.fit(train[features], train["pickups"])
preds = model.predict(test[features])

mape = mean_absolute_percentage_error(test["pickups"], preds)
print(f"MAPE: {mape:.1%}")
```

**✅ Checkpoint:** A reasonable model on the busiest zone should land under
~20–25% MAPE. Plot actual vs. predicted for the test week.

---

### Step 5 — Translate Forecasts into Surge Pricing

**What:** Compare forecasted demand to fleet supply capacity per zone-hour
and recommend a surge multiplier where demand exceeds supply.

**Why:** A forecast is only useful if it drives a decision. This step
closes the loop from "predicted 340 pickups" to "set a 1.4x multiplier in
zone 132 from 5–7pm."

**How:**

```python
FLEET_CAPACITY_PER_HOUR = 60  # illustrative dispatch capacity per zone-hour

test = test.copy()
test["predicted_pickups"] = preds
test["demand_supply_ratio"] = test["predicted_pickups"] / FLEET_CAPACITY_PER_HOUR
test["surge_multiplier"] = test["demand_supply_ratio"].clip(lower=1.0, upper=2.5).round(2)

print(test[["predicted_pickups", "surge_multiplier"]].describe())
```

**✅ Checkpoint:** Surge multipliers should stay at 1.0 during quiet hours
and rise above 1.3–1.5 during identified peak windows — sanity check this
against the hour-of-day pattern from Step 3.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | Cleaned hourly zone-level demand table | .py / parquet |
| 2 | Forecast model with time-based validation & MAPE | Jupyter / .py |
| 3 | Actual vs. predicted demand chart | PNG |
| 4 | Surge-multiplier recommendation table | Markdown |
| 5 | Executive summary for fleet operations | Markdown |

---

## 🏆 Stretch Goals

- [ ] Extend the model to all top-20 zones instead of just one
- [ ] Add weather data (a real external feature) and measure lift
- [ ] Compare gradient boosting against a classical SARIMA baseline
- [ ] Join `taxi_zone_lookup.csv` borough info to compare borough-level patterns
- [ ] Build a simple map visualization (folium/plotly) of predicted demand by zone

---

## 📚 Reference Lessons

- Day 23–24D: Pandas & EDA at scale (Phase 2)
- Day 56: Time series and forecasting (Phase 5)
- Day 45: Feature engineering and evaluation (Phase 4)

---

*This case study works with the same public dataset NYC's own regulators
and academic transportation researchers use — a good introduction to
"big enough to be annoying" real government open data.*
