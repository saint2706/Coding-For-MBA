"""
Synthetic data generator for Case Study 02 — Finance Fraud Detection.
Run this first to create transactions.csv.

Usage:
    python data_generator.py
"""

import numpy as np
import pandas as pd

np.random.seed(42)
N = 100_000
FRAUD_RATE = 0.0012

card_ids = np.random.randint(1000, 9999, N)
amounts = np.random.lognormal(mean=3.5, sigma=1.5, size=N).clip(0.50, 15000).round(2)
hours = np.random.choice(range(24), N, p=[
    0.02, 0.01, 0.01, 0.01, 0.01, 0.02, 0.03, 0.05, 0.07, 0.08,
    0.08, 0.07, 0.07, 0.06, 0.06, 0.06, 0.06, 0.05, 0.04, 0.04,
    0.03, 0.03, 0.02, 0.02,
])
categories = np.random.choice(
    ["grocery", "electronics", "travel", "dining", "gas", "online_retail"],
    N, p=[0.25, 0.15, 0.10, 0.20, 0.10, 0.20],
)
countries = np.random.choice(["US", "UK", "CA", "DE", "FR", "BR", "IN", "NG"], N,
                             p=[0.45, 0.15, 0.10, 0.08, 0.07, 0.06, 0.05, 0.04])
card_countries = np.random.choice(["US", "UK", "CA", "DE", "FR", "BR", "IN", "NG"], N,
                                  p=[0.50, 0.15, 0.10, 0.08, 0.07, 0.05, 0.03, 0.02])

base_ts = pd.Timestamp("2025-01-01")
timestamps = base_ts + pd.to_timedelta(np.random.uniform(0, 365 * 24 * 3600, N), unit="s")

# Generate fraud labels — fraud is more common at night, for high amounts, cross-border
fraud_prob = (
    0.001
    + 0.003 * (amounts > 500)
    + 0.005 * (countries != card_countries)
    + 0.002 * ((hours < 5) | (hours > 22))
)
is_fraud = (np.random.uniform(0, 1, N) < fraud_prob).astype(int)

df = pd.DataFrame({
    "txn_id": [f"TXN_{i:07d}" for i in range(N)],
    "card_id": [f"CARD_{c}" for c in card_ids],
    "timestamp": timestamps.sort_values().values,
    "amount": amounts,
    "hour": hours,
    "merchant_category": categories,
    "merchant_country": countries,
    "card_country": card_countries,
    "is_fraud": is_fraud,
})

df.to_csv("transactions.csv", index=False)
print(f"✅ Generated transactions.csv — {len(df)} rows, fraud rate: {is_fraud.mean():.4%}")
