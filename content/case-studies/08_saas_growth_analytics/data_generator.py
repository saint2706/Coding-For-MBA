"""
Synthetic data generator for Case Study 08 — SaaS Growth Analytics.
Run this first to create accounts.csv, events.csv, subscriptions.csv.

Usage:
    python data_generator.py
"""

import numpy as np
import pandas as pd

np.random.seed(42)

# --- Accounts ---
N_ACCOUNTS = 12_000
signup_dates = pd.date_range("2023-01-01", "2025-06-30", periods=N_ACCOUNTS)
plans = np.random.choice(["Free", "Starter", "Pro", "Enterprise"], N_ACCOUNTS,
                         p=[0.35, 0.30, 0.25, 0.10])
company_sizes = np.random.choice(["1-10", "11-50", "51-200", "201-1000", "1000+"],
                                 N_ACCOUNTS, p=[0.30, 0.25, 0.20, 0.15, 0.10])
industries = np.random.choice(["Tech", "Finance", "Healthcare", "Retail", "Education"],
                              N_ACCOUNTS, p=[0.30, 0.20, 0.15, 0.20, 0.15])

accounts = pd.DataFrame({
    "account_id": [f"ACC_{i:06d}" for i in range(N_ACCOUNTS)],
    "signup_date": signup_dates,
    "plan": plans,
    "company_size": company_sizes,
    "industry": industries,
    "is_active": np.random.binomial(1, 0.72, N_ACCOUNTS),  # ~72% active
})
accounts.to_csv("accounts.csv", index=False)

# --- Events ---
N_EVENTS = 500_000
features = ["dashboard_view", "report_create", "data_import", "export",
            "user_invite", "api_call", "integration_setup", "alert_config"]
event_types = ["signup", "first_login", "core_feature_used", "aha_moment",
               "paid_conversion", "feature_use"]

event_account_ids = np.random.choice(accounts["account_id"].values, N_EVENTS)
event_timestamps = pd.Timestamp("2023-01-01") + pd.to_timedelta(
    np.random.uniform(0, 2.5 * 365 * 24 * 3600, N_EVENTS), unit="s"
)
event_features = np.random.choice(features, N_EVENTS)
event_type_vals = np.random.choice(event_types, N_EVENTS,
                                   p=[0.02, 0.05, 0.08, 0.05, 0.03, 0.77])

events = pd.DataFrame({
    "event_id": [f"EVT_{i:08d}" for i in range(N_EVENTS)],
    "account_id": event_account_ids,
    "timestamp": event_timestamps.sort_values().values,
    "feature": event_features,
    "event_type": event_type_vals,
})
events.to_csv("events.csv", index=False)

# --- Subscriptions ---
mrr_categories = ["New", "Expansion", "Contraction", "Churned"]
sub_rows = []
for month in pd.date_range("2023-01-01", "2025-06-30", freq="MS"):
    for cat in mrr_categories:
        base = {"New": 80000, "Expansion": 40000, "Contraction": 25000, "Churned": 55000}[cat]
        mrr = base + np.random.normal(0, base * 0.15)
        sub_rows.append({
            "start_date": month,
            "mrr_category": cat,
            "mrr": max(0, round(mrr, 2)),
        })

subscriptions = pd.DataFrame(sub_rows)
subscriptions.to_csv("subscriptions.csv", index=False)

print(f"✅ Generated SaaS datasets — {N_ACCOUNTS} accounts, {N_EVENTS} events, "
      f"{len(subscriptions)} subscription records")
