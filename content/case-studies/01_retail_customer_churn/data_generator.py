"""
Synthetic data generator for Case Study 01 — Retail Customer Churn.
Run this first to create retail_customers.csv.

Usage:
    python data_generator.py
"""

import numpy as np
import pandas as pd

np.random.seed(42)
N = 10_000

segments = np.random.choice(["Premium", "Standard", "Basic"], N, p=[0.2, 0.5, 0.3])
channels = np.random.choice(["Online", "In-Store", "Mobile"], N, p=[0.4, 0.35, 0.25])
tenure = np.random.exponential(24, N).clip(1, 120).astype(int)
frequency = np.random.poisson(lam=6, size=N).clip(0, 50)
monetary = np.random.lognormal(mean=5.5, sigma=1.0, size=N).round(2)
recency = np.random.exponential(30, N).clip(1, 365).astype(int)
support_tickets = np.random.poisson(lam=1.5, size=N)
last_3m_spend = np.random.lognormal(mean=4.5, sigma=1.2, size=N).round(2)
prev_3m_spend = last_3m_spend * np.random.uniform(0.6, 1.4, N)
num_orders = np.random.poisson(lam=8, size=N).clip(1, 60)
total_spend = monetary * num_orders

# Churn probability driven by recency, support, and spend trend
churn_score = (
    0.3 * (recency / 365)
    + 0.25 * (support_tickets / 10)
    + 0.2 * np.clip((prev_3m_spend - last_3m_spend) / (prev_3m_spend + 1), 0, 1)
    + 0.15 * (1 - tenure / 120)
    + 0.1 * np.random.uniform(0, 1, N)
)
churn_prob = 1 / (1 + np.exp(-5 * (churn_score - 0.35)))
churned = (np.random.uniform(0, 1, N) < churn_prob).astype(int)

last_purchase_date = pd.Timestamp.now() - pd.to_timedelta(recency, unit="D")

df = pd.DataFrame({
    "customer_id": [f"CUST_{i:05d}" for i in range(N)],
    "customer_segment": segments,
    "preferred_channel": channels,
    "tenure_months": tenure,
    "frequency": frequency,
    "monetary": monetary,
    "recency_days": recency,
    "total_spend": total_spend.round(2),
    "num_orders": num_orders,
    "support_tickets": support_tickets,
    "last_3m_spend": last_3m_spend,
    "prev_3m_spend": prev_3m_spend.round(2),
    "last_purchase_date": last_purchase_date.strftime("%Y-%m-%d"),
    "churned": churned,
})

df.to_csv("retail_customers.csv", index=False)
print(f"✅ Generated retail_customers.csv — {len(df)} rows, churn rate: {churned.mean():.1%}")
