---
day: 44
title: "Unsupervised Learning"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "unsupervised-learning"
duration: 55
difficulty: "intermediate"
tags: [machine-learning, clustering, dimensionality-reduction]
concepts: [K-means clustering, hierarchical clustering, PCA]
prerequisites: [40]
outcomes: [Cluster data with K-means, Reduce dimensions with PCA, Discover patterns without labels]
---

# 🎯 Day 44: Unsupervised Learning

> *"No labels. Just patterns. Let the data speak for itself."*

---

## The "Never-Coded" Bridge

No target variable. We find structure:
- **Clustering**: Group similar customers
- **Dimensionality Reduction**: Simplify complex data
- **Anomaly Detection**: Find unusual patterns

---

## The Technical Deep Dive

### K-Means Clustering

```python
from sklearn.cluster import KMeans
import numpy as np

# Generate data
X = np.random.randn(300, 2)

# Cluster into 3 groups
kmeans = KMeans(n_clusters=3, random_state=42)
labels = kmeans.fit_predict(X)

# Cluster centers
centers = kmeans.cluster_centers_
print(f"Cluster centers:\n{centers}")
```

### Choosing K (Elbow Method)

```python
inertias = []
for k in range(1, 10):
    kmeans = KMeans(n_clusters=k, random_state=42)
    kmeans.fit(X)
    inertias.append(kmeans.inertia_)

plt.plot(range(1, 10), inertias, marker="o")
plt.xlabel("Number of clusters")
plt.ylabel("Inertia")
plt.title("Elbow Method")
plt.show()
```

### PCA (Dimensionality Reduction)

```python
from sklearn.decomposition import PCA

# Reduce to 2 dimensions
pca = PCA(n_components=2)
X_reduced = pca.fit_transform(X)

# Explained variance
print(f"Explained variance: {pca.explained_variance_ratio_}")
print(f"Total: {sum(pca.explained_variance_ratio_):.2%}")
```

### Hierarchical Clustering

```python
from sklearn.cluster import AgglomerativeClustering
from scipy.cluster.hierarchy import dendrogram, linkage

# Cluster
model = AgglomerativeClustering(n_clusters=3)
labels = model.fit_predict(X)

# Dendrogram
linkage_matrix = linkage(X, method="ward")
dendrogram(linkage_matrix)
plt.show()
```

---

## Hands-on Lab

```python
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

# Generate clustered data
X, _ = make_blobs(n_samples=300, centers=4, random_state=42)

# Cluster
kmeans = KMeans(n_clusters=4, random_state=42)
labels = kmeans.fit_predict(X)

# Visualize
plt.figure(figsize=(10, 5))

plt.subplot(1, 2, 1)
plt.scatter(X[:, 0], X[:, 1], c=labels, cmap="viridis")
plt.scatter(kmeans.cluster_centers_[:, 0], kmeans.cluster_centers_[:, 1], 
            c="red", marker="X", s=200)
plt.title("K-Means Clustering")

plt.subplot(1, 2, 2)
pca = PCA(n_components=1)
X_1d = pca.fit_transform(X)
plt.hist(X_1d, bins=30)
plt.title("PCA Reduction to 1D")

plt.tight_layout()
plt.show()
```

---

## Summary

- ✅ K-means groups similar data points
- ✅ Elbow method finds optimal K
- ✅ PCA reduces dimensions while preserving variance
- ✅ Unsupervised = discovery without labels

**Tomorrow**: Feature Engineering & Model Evaluation.
