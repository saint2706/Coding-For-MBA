"""
Synthetic data generator for Case Study 05 — Marketing Campaign Attribution.
Run this first to create customer_journeys.csv.

Usage:
    python data_generator.py
"""

import numpy as np
import pandas as pd

np.random.seed(42)
N_JOURNEYS = 50_000
CHANNELS = ["Search", "Social", "Email", "Display", "Affiliate", "Direct"]

rows = []
for j in range(N_JOURNEYS):
    path_length = np.random.geometric(p=0.3, size=1)[0]
    path_length = min(max(path_length, 1), 8)

    # Channel probabilities shift along the path (awareness → conversion)
    ab_group = np.random.choice(["control", "treatment"])
    journey_channels = []
    for t in range(path_length):
        if t == 0:
            probs = [0.10, 0.30, 0.15, 0.25, 0.10, 0.10]  # top-funnel
        elif t == path_length - 1:
            probs = [0.35, 0.10, 0.20, 0.05, 0.10, 0.20]  # bottom-funnel
        else:
            probs = [0.20, 0.15, 0.25, 0.15, 0.10, 0.15]  # mid-funnel
        channel = np.random.choice(CHANNELS, p=probs)
        journey_channels.append(channel)

    # Conversion depends on path length and channels
    conv_score = (
        0.05
        + 0.02 * path_length
        + 0.03 * ("Email" in journey_channels)
        + 0.02 * ("Search" in journey_channels)
        + 0.01 * (ab_group == "treatment")
    )
    converted = int(np.random.random() < conv_score)

    for t, ch in enumerate(journey_channels):
        rows.append({
            "journey_id": f"J{j:06d}",
            "touch_order": t,
            "channel": ch,
            "ab_group": ab_group,
            "converted": converted,
        })

df = pd.DataFrame(rows)
df.to_csv("customer_journeys.csv", index=False)
conv_rate = df.groupby("journey_id")["converted"].first().mean()
print(f"✅ Generated customer_journeys.csv — {N_JOURNEYS} journeys, "
      f"conversion rate: {conv_rate:.1%}")
