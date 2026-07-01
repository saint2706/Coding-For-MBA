"""
Case Study 11 — E-Commerce Customer Segmentation & CLV (Real Data)
====================================================================
Follow the step-by-step guide in README.md.

Usage:
    python data_loader.py      # first — downloads online_retail_ii.csv
    python starter.py          # then — runs this analysis
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

# ---------------------------------------------------------------------------
# Step 1 — Load the Real Dataset
# ---------------------------------------------------------------------------
# TODO: df = pd.read_csv("online_retail_ii.csv")
# TODO: print(df.shape)

# ---------------------------------------------------------------------------
# Step 2 — Clean the Real-World Mess
# ---------------------------------------------------------------------------
# TODO: Drop rows with missing Customer ID
# TODO: Remove cancelled invoices (Invoice starts with "C")
# TODO: Keep only Quantity > 0 and Price > 0
# TODO: Parse InvoiceDate, compute revenue = Quantity * Price

# ---------------------------------------------------------------------------
# Step 3 — RFM Feature Engineering
# ---------------------------------------------------------------------------
# TODO: Compute recency, frequency, monetary per Customer ID

# ---------------------------------------------------------------------------
# Step 4 — K-Means Segmentation
# ---------------------------------------------------------------------------
# TODO: Scale RFM features with StandardScaler
# TODO: Fit KMeans for k=2..7, plot inertia to find the elbow
# TODO: Refit with chosen k, assign segment labels

# ---------------------------------------------------------------------------
# Step 5 — CLV & Targeting Recommendation
# ---------------------------------------------------------------------------
# TODO: Compute avg_order_value and pct_of_revenue per segment
# TODO: Rank segments, write the targeting recommendation

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
