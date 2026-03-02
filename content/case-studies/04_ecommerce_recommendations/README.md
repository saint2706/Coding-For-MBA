# 🛍️ Case Study 04: E-Commerce Recommendation Engine

> **Phases covered**: Phase 5 (Advanced ML & Deep Learning)
> **Difficulty**: Intermediate → Advanced
> **Estimated time**: 8–10 hours

---

## 🎯 Case Overview

**ShopWave**, a mid-size e-commerce platform with 500,000 active users and
50,000 products, wants to increase average order value (AOV) by 15% through
personalised product recommendations. Currently, the "You Might Also Like"
section uses a simple "customers who bought X also bought Y" heuristic that
converts at only 2.1%.

Your mission: build a **collaborative filtering recommendation system** that
generates personalised product suggestions, then evaluate it with offline
ranking metrics and an A/B test design.

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Active users | 500,000 |
| Product catalogue | 50,000 SKUs |
| Current AOV | $68 |
| Recommendation CTR | 2.1% |
| Target AOV increase | +15% ($78) |
| Revenue impact (estimated) | +$12 M/year |

**Key question:** *What products should we recommend to each user to maximise
conversion and basket size?*

---

## 🗂️ Project Structure

```
04_ecommerce_recommendations/
├── README.md           ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs
└── data_generator.py   ← creates synthetic interaction dataset
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 5 | Collaborative filtering (user-based, item-based, matrix factorisation) |
| Phase 5 | Embeddings, cosine similarity, neural collaborative filtering |
| Phase 4 | Evaluation metrics — precision@k, recall@k, NDCG |
| Phase 37B | Similarity metrics, distance functions |

---

## 🤝 Hand-Holding Walkthrough

### Step 1 — Generate & Explore Interaction Data

**What:** Create a synthetic dataset of user-product interactions (views,
add-to-cart, purchases) with implicit feedback signals.

**Why:** Recommendation systems work with interaction matrices. Understanding
data sparsity (typically 99%+ sparse) is critical for choosing the right
algorithm.

**How:**

```python
python data_generator.py          # creates user_interactions.csv
df = pd.read_csv("user_interactions.csv")
print(f"Users: {df['user_id'].nunique()}")
print(f"Products: {df['product_id'].nunique()}")
print(f"Interactions: {len(df)}")
sparsity = 1 - len(df) / (df['user_id'].nunique() * df['product_id'].nunique())
print(f"Sparsity: {sparsity:.4%}")
```

**✅ Checkpoint:** Sparsity should be ≥ 99%. This is normal for e-commerce.

---

### Step 2 — Build the User-Item Matrix

**What:** Create a user × product matrix where values represent interaction
strength (e.g., view = 1, add-to-cart = 3, purchase = 5).

**Why:** Most recommendation algorithms operate on this matrix. The weighting
scheme converts raw events into a signal of user preference.

**How:**

```python
# Weight interactions by engagement level
weight_map = {"view": 1, "add_to_cart": 3, "purchase": 5}
df["weight"] = df["interaction_type"].map(weight_map)

# Aggregate per user-product pair
interactions = df.groupby(["user_id", "product_id"])["weight"].sum().reset_index()

# Pivot to user-item matrix
from scipy.sparse import csr_matrix

user_ids = interactions["user_id"].astype("category")
product_ids = interactions["product_id"].astype("category")
user_item = csr_matrix(
    (interactions["weight"], (user_ids.cat.codes, product_ids.cat.codes))
)
print(f"User-Item matrix shape: {user_item.shape}")
```

**✅ Checkpoint:** Matrix should be (num_users × num_products) with ≤ 1%
non-zero entries.

---

### Step 3 — Item-Based Collaborative Filtering

**What:** Compute item-item similarity using cosine similarity, then
recommend items similar to what a user has already interacted with.

**Why:** Item-based CF is the simplest production-ready approach. Amazon
popularised it because item similarities are more stable than user
similarities (items don't change; user tastes do).

**How:**

```python
from sklearn.metrics.pairwise import cosine_similarity

# Transpose: items as rows, users as features
item_similarity = cosine_similarity(user_item.T)
print(f"Item similarity matrix: {item_similarity.shape}")

def recommend_items(user_idx, user_item_matrix, item_sim, k=10):
    """Recommend top-k items for a user based on item similarity."""
    user_vector = user_item_matrix[user_idx].toarray().flatten()
    scores = item_sim.dot(user_vector)
    # Zero out already-interacted items
    scores[user_vector > 0] = 0
    top_k = np.argsort(scores)[-k:][::-1]
    return top_k, scores[top_k]

recs, scores = recommend_items(0, user_item, item_similarity, k=10)
print(f"Top 10 recommendations for user 0: {recs}")
```

**✅ Checkpoint:** Recommendations should not include items the user has
already interacted with.

---

### Step 4 — Matrix Factorisation (SVD)

**What:** Decompose the user-item matrix into latent factors using SVD
(Singular Value Decomposition).

**Why:** SVD captures hidden patterns — e.g., a user who buys running shoes
and protein powder shares a "fitness" latent factor with users who buy
yoga mats. This generalises better than raw similarity.

**How:**

```python
from scipy.sparse.linalg import svds

# Decompose into k latent factors
k = 50
U, sigma, Vt = svds(user_item.astype(float), k=k)
sigma_diag = np.diag(sigma)

# Predicted ratings = U × Sigma × Vt
predicted_ratings = U @ sigma_diag @ Vt

def recommend_svd(user_idx, predicted, already_interacted, k=10):
    """Recommend top-k items from SVD predictions."""
    scores = predicted[user_idx]
    scores[already_interacted] = -np.inf
    top_k = np.argsort(scores)[-k:][::-1]
    return top_k, scores[top_k]
```

**✅ Checkpoint:** Compare SVD recommendations with item-based CF — they
should partially overlap but SVD should surface more diverse items.

---

### Step 5 — Evaluation Metrics

**What:** Evaluate recommendation quality using Precision@K, Recall@K,
and NDCG@K.

**Why:** Unlike classification accuracy, recommendation quality is measured
by ranking — are the relevant items at the *top* of the list?

**How:**

```python
def precision_at_k(recommended, relevant, k=10):
    """Fraction of recommended items that are relevant."""
    return len(set(recommended[:k]) & set(relevant)) / k

def recall_at_k(recommended, relevant, k=10):
    """Fraction of relevant items that are recommended."""
    if len(relevant) == 0:
        return 0.0
    return len(set(recommended[:k]) & set(relevant)) / len(relevant)

def ndcg_at_k(recommended, relevant, k=10):
    """Normalised Discounted Cumulative Gain."""
    dcg = sum(1 / np.log2(i + 2) for i, item in enumerate(recommended[:k])
              if item in relevant)
    idcg = sum(1 / np.log2(i + 2) for i in range(min(len(relevant), k)))
    return dcg / idcg if idcg > 0 else 0.0

# Evaluate on held-out test interactions
# TODO: Split interactions into train/test, compute metrics
```

**✅ Checkpoint:** Precision@10 ≥ 5% and NDCG@10 ≥ 0.10 (these are typical
for sparse e-commerce data).

---

### Step 6 — A/B Test Design

**What:** Design an A/B test plan to validate the model in production.

**Why:** Offline metrics don't always translate to online gains. An A/B test
measures real impact on CTR and AOV.

**How:**

```markdown
## A/B Test Plan

- **Hypothesis:** Personalised CF recommendations increase AOV by ≥ 10%
- **Control:** Current "also bought" heuristic
- **Treatment:** SVD-based collaborative filtering
- **Primary metric:** Average Order Value (AOV)
- **Secondary metrics:** Recommendation CTR, items per order
- **Sample size:** 50,000 users per arm (α=0.05, β=0.20)
- **Duration:** 2 weeks (to capture weekly patterns)
- **Guardrail metrics:** Page load time, bounce rate
```

**✅ Checkpoint:** Calculate the minimum detectable effect (MDE) for your
sample size using a power calculator.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | User-item matrix and sparsity analysis | Jupyter / .py |
| 2 | Item-based CF recommendation function | .py module |
| 3 | SVD matrix factorisation model | .py module |
| 4 | Evaluation report (P@K, R@K, NDCG@K) | Markdown |
| 5 | A/B test design document | Markdown |

---

## 🏆 Stretch Goals

- [ ] Implement neural collaborative filtering (NCF) with PyTorch
- [ ] Add content-based features (product descriptions via TF-IDF)
- [ ] Build a hybrid recommender (collaborative + content-based)
- [ ] Create a Streamlit demo with real-time recommendations
- [ ] Implement an online learning approach (update recommendations in real-time)

---

## 📚 Reference Lessons

- Day 53–56: Dimensionality reduction, embeddings, similarity metrics (Phase 5)
- Day 57–60: Deep learning — neural networks for collaborative filtering (Phase 5)
- Day 37B: Statistics — similarity metrics, distance functions
- Day 138: A/B Testing at Scale (Phase 12)

---

*Build this case study to showcase recommendation system skills — a must-have
for product data science roles in e-commerce and media.*
