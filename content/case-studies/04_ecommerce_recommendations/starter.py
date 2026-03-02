"""
Case Study 04 — E-Commerce Recommendation Engine
=================================================
Follow the step-by-step guide in README.md.

Usage:
    python data_generator.py   # first — creates user_interactions.csv
    python starter.py          # then — runs this analysis
"""

import pandas as pd
import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse.linalg import svds
from sklearn.metrics.pairwise import cosine_similarity

# ---------------------------------------------------------------------------
# Step 1 — Load Data
# ---------------------------------------------------------------------------
# TODO: Load user_interactions.csv
# df = pd.read_csv("user_interactions.csv")
# print(f"Users: {df['user_id'].nunique()}, Products: {df['product_id'].nunique()}")

# ---------------------------------------------------------------------------
# Step 2 — Build User-Item Matrix
# ---------------------------------------------------------------------------
# TODO: Weight interactions (view=1, add_to_cart=3, purchase=5)
# TODO: Create sparse user-item matrix

# ---------------------------------------------------------------------------
# Step 3 — Item-Based Collaborative Filtering
# ---------------------------------------------------------------------------
# TODO: Compute item-item cosine similarity
# TODO: Implement recommend_items(user_idx, ...) function

# ---------------------------------------------------------------------------
# Step 4 — Matrix Factorisation (SVD)
# ---------------------------------------------------------------------------
# TODO: Decompose user-item matrix with SVD (k=50)
# TODO: Implement recommend_svd(user_idx, ...) function

# ---------------------------------------------------------------------------
# Step 5 — Evaluation Metrics
# ---------------------------------------------------------------------------
# TODO: Implement precision_at_k, recall_at_k, ndcg_at_k
# TODO: Evaluate on held-out test set

# ---------------------------------------------------------------------------
# Step 6 — A/B Test Design
# ---------------------------------------------------------------------------
# TODO: Write A/B test plan (see README.md Step 6)

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
