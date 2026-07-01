"""
Case Study 15 — Market-Entry Strategy with Real Macro Data
=============================================================
Follow the step-by-step guide in README.md.

Usage:
    python data_loader.py      # first — pulls macro_indicators.csv from World Bank API
    python starter.py          # then — runs this analysis
"""

import pandas as pd
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.cluster import KMeans

# ---------------------------------------------------------------------------
# Step 1 — Load Real World Bank Indicators
# ---------------------------------------------------------------------------
# TODO: df = pd.read_csv("macro_indicators.csv")
# TODO: print(df["country"].unique())

# ---------------------------------------------------------------------------
# Step 2 — Reshape & Handle Real Gaps
# ---------------------------------------------------------------------------
# TODO: Pivot long -> wide (index=[country, year], columns=indicator)
# TODO: country_avg = wide.groupby("country").mean(numeric_only=True)

# ---------------------------------------------------------------------------
# Step 3 — Build a Weighted Attractiveness Index
# ---------------------------------------------------------------------------
# TODO: MinMaxScaler on growth/positive indicators
# TODO: Invert scale for inflation/unemployment (lower is better)
# TODO: Combine into weighted attractiveness_score

# ---------------------------------------------------------------------------
# Step 4 — Cluster Countries into Peer Groups
# ---------------------------------------------------------------------------
# TODO: StandardScaler + KMeans(n_clusters=3) on the indicator set

# ---------------------------------------------------------------------------
# Step 5 — Risk & Recommendation
# ---------------------------------------------------------------------------
# TODO: Compute GDP growth volatility (std dev) per country
# TODO: risk_adjusted_score = attractiveness_score / (1 + gdp_volatility / 10)

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
