"""
Synthetic data generator for Case Study 04 — E-Commerce Recommendations.
Run this first to create user_interactions.csv.

Usage:
    python data_generator.py
"""

import numpy as np
import pandas as pd

np.random.seed(42)

N_USERS = 5_000
N_PRODUCTS = 2_000
N_INTERACTIONS = 150_000

user_ids = np.random.randint(0, N_USERS, N_INTERACTIONS)
product_ids = np.random.randint(0, N_PRODUCTS, N_INTERACTIONS)
interaction_types = np.random.choice(
    ["view", "add_to_cart", "purchase"],
    N_INTERACTIONS,
    p=[0.70, 0.20, 0.10],
)

categories = np.random.choice(
    ["Electronics", "Clothing", "Home", "Sports", "Books", "Beauty"],
    N_PRODUCTS,
)
product_category = categories[product_ids]

timestamps = pd.Timestamp("2025-01-01") + pd.to_timedelta(
    np.random.uniform(0, 365 * 24 * 3600, N_INTERACTIONS), unit="s"
)

df = pd.DataFrame({
    "user_id": [f"U{u:05d}" for u in user_ids],
    "product_id": [f"P{p:05d}" for p in product_ids],
    "interaction_type": interaction_types,
    "product_category": product_category,
    "timestamp": timestamps.sort_values().values,
})

df.to_csv("user_interactions.csv", index=False)
print(f"✅ Generated user_interactions.csv — {len(df)} interactions, "
      f"{N_USERS} users, {N_PRODUCTS} products")
