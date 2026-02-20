---
day: 55
title: "Advanced Unsupervised Learning"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "advanced-unsupervised"
duration: 50
difficulty: "advanced"
tags:
  - machine-learning
  - clustering
  - anomaly-detection
  - dimensionality-reduction
concepts:
  - "density-based clustering (DBSCAN, HDBSCAN)"
  - "anomaly detection (Isolation Forest, One-Class SVM)"
  - "autoencoders for compression"
  - "manifold learning (t-SNE, UMAP)"
  - "clustering evaluation metrics"
prerequisites: [44]
outcomes:
  - "Apply density-based clustering for arbitrary shapes"
  - "Detect anomalies and outliers in production"
  - "Build autoencoders for dimensionality reduction"
  - "Visualize high-dimensional data with manifold learning"
---

# 🎯 Day 55: Advanced Unsupervised Learning

> *"Finding patterns in the unlabeled wilderness."*

---

## The "Never-Coded" Bridge

**Imagine sorting 10,000 customer profiles without labels.** No "loyal" vs "at-risk" tags. Just raw data: purchase history, browsing patterns, demographics.

**K-Means (Day 44)** would force you to choose K clusters arbitrarily. But what if:

- Clusters have **different densities**? (Urban vs rural customers)
- Clusters have **irregular shapes**? (Not circular blobs)
- You need to **detect outliers**? (Fraudulent accounts)

**Advanced unsupervised learning** handles these real-world complexities:

**Real-world applications:**

**Anomaly detection:**

- **Cybersecurity**: Detect unusual network traffic (DDoS attacks)
- **Manufacturing**: Flag defective products from sensor data
- **Healthcare**: Identify rare diseases from patient biomarkers

**Customer segmentation:**

- **E-commerce**: Find natural customer groups for personalized marketing
- **Finance**: Segment investors by behavior (not predefined categories)

**Dimensionality reduction:**

- **Genomics**: Reduce 20,000 genes to 2D visualization
- **NLP**: Compress 300D word embeddings to 2D for plotting
- **Recommendation systems**: Latent factor models for collaborative filtering

---

## The Technical Deep Dive

### DBSCAN: Density-Based Clustering

**Idea**: Clusters are dense regions separated by sparse regions. No need to specify K!

**Parameters:**

- `eps`: Maximum distance between two points to be neighbors
- `min_samples`: Minimum points needed to form a dense region

```python
from sklearn.cluster import DBSCAN
from sklearn.datasets import make_moons, make_blobs
import matplotlib.pyplot as plt
import numpy as np

# Generate non-convex data (K-Means fails here)
X_moons, y_moons = make_moons(n_samples=300, noise=0.05, random_state=42)

# DBSCAN clustering
dbscan = DBSCAN(eps=0.2, min_samples=5)
labels_dbscan = dbscan.fit_predict(X_moons)

# Plot
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Ground truth
ax1.scatter(X_moons[:, 0], X_moons[:, 1], c=y_moons, cmap='viridis', edgecolors='k')
ax1.set_title('Ground Truth (2 crescent shapes)')

# DBSCAN result
scatter = ax2.scatter(X_moons[:, 0], X_moons[:, 1], c=labels_dbscan, cmap='viridis', edgecolors='k')
ax2.set_title(f'DBSCAN (eps=0.2, found {len(set(labels_dbscan)) - (1 if -1 in labels_dbscan else 0)} clusters)')

# Highlight outliers (label = -1)
outliers = X_moons[labels_dbscan == -1]
ax2.scatter(outliers[:, 0], outliers[:, 1], c='red', marker='x', s=100, label='Outliers')
ax2.legend()

plt.tight_layout()
plt.show()

print(f"Number of clusters: {len(set(labels_dbscan)) - (1 if -1 in labels_dbscan else 0)}")
print(f"Number of outliers: {np.sum(labels_dbscan == -1)}")
```

**Choosing eps:** Use K-distance graph

```python
from sklearn.neighbors import NearestNeighbors

# Compute distances to k-th nearest neighbor
k = 5  # min_samples
neighbors = NearestNeighbors(n_neighbors=k)
neighbors.fit(X_moons)
distances, indices = neighbors.kneighbors(X_moons)

# Sort distances
distances = np.sort(distances[:, k-1], axis=0)

# Plot elbow
plt.figure(figsize=(10, 6))
plt.plot(distances)
plt.xlabel('Points sorted by distance')
plt.ylabel(f'{k}-th Nearest Neighbor Distance')
plt.title('K-Distance Graph (Elbow suggests optimal eps)')
plt.grid(True, alpha=0.3)
plt.show()

# Choose eps at elbow (rapid increase)
# For this data: eps ≈ 0.2
```

### HDBSCAN: Hierarchical DBSCAN

**Improvement over DBSCAN:** Automatically finds optimal eps for different density regions.

```python
import hdbscan

# HDBSCAN
clusterer = hdbscan.HDBSCAN(min_cluster_size=10, min_samples=5)
labels_hdbscan = clusterer.fit_predict(X_moons)

print(f"HDBSCAN found {len(set(labels_hdbscan)) - (1 if -1 in labels_hdbscan else 0)} clusters")
print(f"Cluster persistence (strength of clustering):")
for i, prob in enumerate(clusterer.probabilities_[:5]):
    print(f"  Point {i}: {prob:.2%} confidence")
```

### Anomaly Detection: Isolation Forest

**Idea**: Anomalies are few and different → easier to isolate in random trees.

```python
from sklearn.ensemble import IsolationForest
from sklearn.datasets import make_classification

# Generate data with 5% anomalies
X, y = make_classification(
    n_samples=1000,
    n_features=2,
    n_informative=2,
    n_redundant=0,
    n_clusters_per_class=1,
    flip_y=0,
    class_sep=2.0,
    random_state=42
)

# Add anomalies
rng = np.random.RandomState(42)
X_outliers = rng.uniform(low=-6, high=6, size=(50, 2))
X_combined = np.vstack([X, X_outliers])
y_true = np.hstack([np.ones(1000), -np.ones(50)])  # 1=normal, -1=anomaly

# Isolation Forest
iso_forest = IsolationForest(contamination=0.05, random_state=42)
y_pred = iso_forest.fit_predict(X_combined)

# Evaluate
from sklearn.metrics import classification_report, confusion_matrix

print("=== Anomaly Detection Performance ===")
print(classification_report(y_true, y_pred, target_names=['Anomaly', 'Normal']))

# Visualize
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Ground truth
ax1.scatter(X_combined[y_true == 1, 0], X_combined[y_true == 1, 1], 
            c='blue', label='Normal', alpha=0.6, edgecolors='k')
ax1.scatter(X_combined[y_true == -1, 0], X_combined[y_true == -1, 1], 
            c='red', label='Anomaly', alpha=0.6, edgecolors='k', marker='x', s=100)
ax1.set_title('Ground Truth')
ax1.legend()

# Predictions
ax2.scatter(X_combined[y_pred == 1, 0], X_combined[y_pred == 1, 1], 
            c='blue', label='Normal', alpha=0.6, edgecolors='k')
ax2.scatter(X_combined[y_pred == -1, 0], X_combined[y_pred == -1, 1], 
            c='red', label='Anomaly', alpha=0.6, edgecolors='k', marker='x', s=100)
ax2.set_title('Isolation Forest Predictions')
ax2.legend()

plt.tight_layout()
plt.show()
```

### Autoencoders for Dimensionality Reduction

**Idea**: Neural network that learns to compress data through a bottleneck.

```python
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense
from tensorflow.keras.optimizers import Adam

# Load MNIST for demonstration
from tensorflow.keras.datasets import mnist
(X_train, y_train), (X_test, y_test) = mnist.load_data()

# Preprocess
X_train = X_train.reshape(-1, 784).astype('float32') / 255
X_test = X_test.reshape(-1, 784).astype('float32') / 255

# Build autoencoder
input_dim = 784
encoding_dim = 32  # Compress to 32 dimensions

# Encoder
input_layer = Input(shape=(input_dim,))
encoded = Dense(128, activation='relu')(input_layer)
encoded = Dense(64, activation='relu')(encoded)
encoded = Dense(encoding_dim, activation='relu')(encoded)

# Decoder
decoded = Dense(64, activation='relu')(encoded)
decoded = Dense(128, activation='relu')(decoded)
decoded = Dense(input_dim, activation='sigmoid')(decoded)

# Autoencoder model
autoencoder = Model(input_layer, decoded)
autoencoder.compile(optimizer=Adam(learning_rate=0.001), loss='mse')

# Train
history = autoencoder.fit(
    X_train, X_train,
    epochs=20,
    batch_size=256,
    validation_data=(X_test, X_test),
    verbose=1
)

# Encoder model (for embeddings)
encoder = Model(input_layer, encoded)
X_encoded = encoder.predict(X_test[:1000])

print(f"Original shape: {X_test.shape}")
print(f"Compressed shape: {X_encoded.shape}")

# Visualize reconstructions
n_samples = 10
decoded_imgs = autoencoder.predict(X_test[:n_samples])

fig, axes = plt.subplots(2, n_samples, figsize=(20, 4))
for i in range(n_samples):
    # Original
    axes[0, i].imshow(X_test[i].reshape(28, 28), cmap='gray')
    axes[0, i].axis('off')
    if i == 0:
        axes[0, i].set_title('Original', fontsize=12)
    
    # Reconstruction
    axes[1, i].imshow(decoded_imgs[i].reshape(28, 28), cmap='gray')
    axes[1, i].axis('off')
    if i == 0:
        axes[1, i].set_title('Reconstructed', fontsize=12)

plt.tight_layout()
plt.show()
```

### t-SNE and UMAP: Manifold Learning

**Visualize high-dimensional data in 2D while preserving local structure.**

```python
from sklearn.manifold import TSNE
import umap

# Encode MNIST to 32D
X_encoded_large = encoder.predict(X_test[:5000])
y_subset = y_test[:5000]

# t-SNE (slower, preserves local structure)
tsne = TSNE(n_components=2, random_state=42, perplexity=30)
X_tsne = tsne.fit_transform(X_encoded_large)

# UMAP (faster, preserves global + local structure)
umap_model = umap.UMAP(n_components=2, random_state=42)
X_umap = umap_model.fit_transform(X_encoded_large)

# Visualize
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))

# t-SNE
scatter1 = ax1.scatter(X_tsne[:, 0], X_tsne[:, 1], c=y_subset, cmap='tab10', alpha=0.6, s=5)
ax1.set_title('t-SNE Visualization of MNIST')
ax1.set_xlabel('t-SNE Dimension 1')
ax1.set_ylabel('t-SNE Dimension 2')
plt.colorbar(scatter1, ax=ax1, label='Digit')

# UMAP
scatter2 = ax2.scatter(X_umap[:, 0], X_umap[:, 1], c=y_subset, cmap='tab10', alpha=0.6, s=5)
ax2.set_title('UMAP Visualization of MNIST')
ax2.set_xlabel('UMAP Dimension 1')
ax2.set_ylabel('UMAP Dimension 2')
plt.colorbar(scatter2, ax=ax2, label='Digit')

plt.tight_layout()
plt.show()
```

---

## Senior-Level Insights

### Clustering Algorithm Comparison

| Algorithm            | Shape      | K Required? | Outliers? | Scalability  | When to Use                      |
| -------------------- | ---------- | ----------- | --------- | ------------ | -------------------------------- |
| **K-Means**          | Spherical  | ✅ Yes       | ❌ No      | ⚡ O(n)       | Fast baseline, convex clusters   |
| **DBSCAN**           | Arbitrary  | ❌ No        | ✅ Yes     | 🔥 O(n log n) | Irregular shapes, noise handling |
| **HDBSCAN**          | Arbitrary  | ❌ No        | ✅ Yes     | 🔥 O(n log n) | Varying densities                |
| **Gaussian Mixture** | Elliptical | ✅ Yes       | ❌ No      | ⚡ O(n)       | Soft clustering, probabilistic   |
| **Hierarchical**     | Any        | ❌ No        | ❌ No      | 🐌 O(n²)      | Dendrograms, small datasets      |

### Anomaly Detection Methods

```python
methods = {
    "Isolation Forest": {
        "Best for": "High-dimensional data, fast",
        "Assumption": "Anomalies are easily separated",
        "Scalability": "100k+ samples"
    },
    "One-Class SVM": {
        "Best for": "Small datasets, bounded anomalies",
        "Assumption": "Normal data forms tight boundary",
        "Scalability": "< 10k samples"
    },
    "Autoencoder": {
        "Best for": "Complex patterns, images",
        "Assumption": "Anomalies reconstruct poorly",
        "Scalability": "Millions (with GPUs)"
    },
    "Local Outlier Factor": {
        "Best for": "Local density deviations",
        "Assumption": "Anomalies have different density",
        "Scalability": "< 100k samples"
    }
}
```

### t-SNE vs UMAP

| Feature             | t-SNE                       | UMAP                             |
| ------------------- | --------------------------- | -------------------------------- |
| **Speed**           | 🐌 Slow (O(n²))              | ⚡ Fast (O(n log n))              |
| **Preserves**       | Local structure             | Local + global structure         |
| **Hyperparameters** | perplexity (5-50)           | n_neighbors, min_dist            |
| **Reproducibility** | Stochastic (varies per run) | More stable                      |
| **Use Case**        | Exploration, visualization  | Visualization + downstream tasks |

---

## Hands-on Lab

### Exercise 1: Customer Segmentation with DBSCAN

```python
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
import pandas as pd

# Generate synthetic customer data
np.random.seed(42)
n_customers = 1000

data = {
    'recency': np.random.exponential(scale=30, size=n_customers),  # Days since last purchase
    'frequency': np.random.poisson(lam=5, size=n_customers),       # Purchases per year
    'monetary': np.random.gamma(shape=2, scale=50, size=n_customers)  # Average spend
}

df = pd.DataFrame(data)

# Standardize (important for DBSCAN!)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df)

# DBSCAN
dbscan = DBSCAN(eps=0.5, min_samples=10)
labels = dbscan.fit_predict(X_scaled)

df['Cluster'] = labels

# Analyze clusters
print("=== Cluster Statistics ===")
for cluster_id in sorted(set(labels)):
    if cluster_id == -1:
        cluster_name = "Outliers"
    else:
        cluster_name = f"Cluster {cluster_id}"
    
    cluster_data = df[df['Cluster'] == cluster_id]
    print(f"\n{cluster_name} (n={len(cluster_data)}):")
    print(cluster_data[['recency', 'frequency', 'monetary']].describe())

# Visualize
from mpl_toolkits.mplot3d import Axes3D

fig = plt.figure(figsize=(12, 8))
ax = fig.add_subplot(111, projection='3d')

colors = ['blue', 'green', 'orange', 'purple', 'red']
for cluster_id in sorted(set(labels)):
    if cluster_id == -1:
        color = 'red'
        marker = 'x'
        label = 'Outliers'
    else:
        color = colors[cluster_id % len(colors)]
        marker = 'o'
        label = f'Cluster {cluster_id}'
    
    cluster_data = df[df['Cluster'] == cluster_id]
    ax.scatter(cluster_data['recency'], cluster_data['frequency'], 
               cluster_data['monetary'], c=color, marker=marker, label=label, s=50, alpha=0.6)

ax.set_xlabel('Recency (days)')
ax.set_ylabel('Frequency (purchases/year)')
ax.set_zlabel('Monetary (avg spend)')
ax.set_title('Customer Segmentation with DBSCAN')
ax.legend()
plt.show()
```

---

### Exercise 2: Fraud Detection with Isolation Forest

```python
from sklearn.ensemble import IsolationForest
from sklearn.metrics import classification_report, roc_auc_score, precision_recall_curve

# Simulate credit card transactions
np.random.seed(42)
n_normal = 9500
n_fraud = 500

# Normal transactions
normal_transactions = {
    'amount': np.random.gamma(shape=2, scale=50, size=n_normal),
    'time': np.random.uniform(0, 24, size=n_normal),
    'merchant_risk': np.random.beta(a=2, b=5, size=n_normal)
}

# Fraudulent transactions (different distribution)
fraud_transactions = {
    'amount': np.random.gamma(shape=5, scale=200, size=n_fraud),  # Larger amounts
    'time': np.random.uniform(22, 6, size=n_fraud) % 24,  # Late night
    'merchant_risk': np.random.beta(a=5, b=2, size=n_fraud)  # Risky merchants
}

# Combine
X_normal = pd.DataFrame(normal_transactions)
X_fraud = pd.DataFrame(fraud_transactions)
X_combined = pd.concat([X_normal, X_fraud], ignore_row_index=True)
y_true = np.hstack([np.ones(n_normal), -np.ones(n_fraud)])

# Train Isolation Forest
iso_forest = IsolationForest(contamination=0.05, random_state=42)
y_pred = iso_forest.fit_predict(X_combined)

# Get anomaly scores (lower = more anomalous)
scores = iso_forest.score_samples(X_combined)

# Metrics
print("=== Fraud Detection Performance ===")
print(classification_report(y_true, y_pred, target_names=['Fraud', 'Normal']))
print(f"\nROC-AUC: {roc_auc_score(y_true, -scores):.3f}")

# Precision-Recall curve
precision, recall, thresholds = precision_recall_curve(y_true, -scores)

plt.figure(figsize=(10, 6))
plt.plot(recall, precision, marker='.')
plt.xlabel('Recall')
plt.ylabel('Precision')
plt.title('Precision-Recall Curve for Fraud Detection')
plt.grid(True, alpha=0.3)
plt.show()

# Show top anomalies
anomaly_scores_df = pd.DataFrame({
    'amount': X_combined['amount'],
    'time': X_combined['time'],
    'merchant_risk': X_combined['merchant_risk'],
    'anomaly_score': -scores,
    'predicted': y_pred,
    'true_label': y_true
})

print("\n=== Top 10 Most Anomalous Transactions ===")
print(anomaly_scores_df.nlargest(10, 'anomaly_score'))
```

---

### Exercise 3: Image Compression with Autoencoders

```python
# Build variational autoencoder for better compression
from tensorflow.keras.layers import Lambda
from tensorflow.keras import backend as K

# Sampling layer for VAE
def sampling(args):
    z_mean, z_log_var = args
    batch = K.shape(z_mean)[0]
    dim = K.int_shape(z_mean)[1]
    epsilon = K.random_normal(shape=(batch, dim))
    return z_mean + K.exp(0.5 * z_log_var) * epsilon

# VAE architecture
latent_dim = 16

# Encoder
inputs = Input(shape=(784,))
h = Dense(256, activation='relu')(inputs)
h = Dense(128, activation='relu')(h)
z_mean = Dense(latent_dim)(h)
z_log_var = Dense(latent_dim)(h)
z = Lambda(sampling, output_shape=(latent_dim,))([z_mean, z_log_var])

encoder_vae = Model(inputs, [z_mean, z_log_var, z])

# Decoder
latent_inputs = Input(shape=(latent_dim,))
h_decoded = Dense(128, activation='relu')(latent_inputs)
h_decoded = Dense(256, activation='relu')(h_decoded)
outputs = Dense(784, activation='sigmoid')(h_decoded)

decoder_vae = Model(latent_inputs, outputs)

# VAE model
outputs_vae = decoder_vae(encoder_vae(inputs)[2])
vae = Model(inputs, outputs_vae)

# VAE loss
reconstruction_loss = tf.keras.losses.binary_crossentropy(inputs, outputs_vae) * 784
kl_loss = -0.5 * K.sum(1 + z_log_var - K.square(z_mean) - K.exp(z_log_var), axis=-1)
vae_loss = K.mean(reconstruction_loss + kl_loss)

vae.add_loss(vae_loss)
vae.compile(optimizer='adam')

# Train
vae.fit(X_train, epochs=20, batch_size=128, validation_data=(X_test, None))

# Compare compression
print(f"Original size: 784 pixels")
print(f"Compressed size: {latent_dim} dimensions")
print(f"Compression ratio: {784 / latent_dim:.1f}x")

# Generate new samples from latent space
n_samples = 10
random_latent = np.random.normal(size=(n_samples, latent_dim))
generated_images = decoder_vae.predict(random_latent)

fig, axes = plt.subplots(1, n_samples, figsize=(20, 2))
for i, ax in enumerate(axes):
    ax.imshow(generated_images[i].reshape(28, 28), cmap='gray')
    ax.axis('off')
plt.suptitle('Generated Images from Random Latent Vectors', fontsize=14)
plt.show()
```

---

## Mastery Check

### Question 1: DBSCAN vs K-Means

When would you choose DBSCAN over K-Means for customer segmentation?

<details>
<summary>Click for Answer</summary>

**Answer:** Choose DBSCAN when clusters have irregular shapes, varying densities, or you need to identify outliers—scenarios where K-Means' assumptions fail.

**K-Means assumptions:**

- Spherical clusters of similar size
- All points belong to a cluster
- K is known in advance

**DBSCAN advantages:**

**1. Arbitrary cluster shapes**

```python
# Urban vs suburban vs rural customers
# Urban: dense, compact (high purchase frequency, specific locations)
# Suburban: medium density, spread out
# Rural: sparse, isolated

# K-Means: Forces circular clusters, misses geographic patterns
# DBSCAN: Naturally finds elongated suburb clusters, compact urban clusters
```

**2. Varying densities**

```
High-value segment: 50 VIP customers (dense in feature space)
Mid-tier: 5000 customers (moderate density)
Low-value: 20,000 customers (sparse)

K-Means: Splits VIPs into multiple clusters or merges with mid-tier
DBSCAN: Correctly identifies VIPs as separate dense region
```

**3. Outlier detection**

```python
# Identify:
# - Fraud suspects (unusual behavior)
# - Data errors (impossible values)
# - One-time buyers (don't fit any segment)

# DBSCAN labels these as -1 (noise)
# K-Means forces them into nearest cluster (contaminates segments)
```

**4. Unknown K**

```
How many customer segments exist? 3? 5? 10?
DBSCAN: Discovers this automatically
K-Means: Requires elbow method, silhouette analysis (time-consuming)
```

**When K-Means is still better:**

- Large datasets (n > 1M): DBSCAN is O(n log n), K-Means is O(n)
- Convex clusters: K-Means works fine, faster
- Need exactly K clusters: Business requirement (e.g., 3-tier loyalty program)

</details>

---

### Question 2: Isolation Forest Contamination

Your Isolation Forest has `contamination=0.05` but only 2% of data is truly anomalous. What happens and how do you fix it?

<details>
<summary>Click for Answer</summary>

**Answer:** The model will flag 5% of data as anomalies (including false positives) because `contamination` is the expected proportion of outliers. Set it to match your true anomaly rate (0.02) or use anomaly scores flexibly.

**How contamination works:**

```python
IsolationForest(contamination=0.05)
# → Model flags top 5% most anomalous points as outliers
# → Threshold is set to achieve this proportion
```

**Problem:**

```
True anomalies: 2% (20 out of 1000)
contamination=0.05 → flags 50 points
→ 20 true + 30 false positives
→ Precision = 20/50 = 40%
```

**Solutions:**

**1. Adjust contamination**

```python
IsolationForest(contamination=0.02)
# Flags closer to true rate
```

**2. Use anomaly scores instead of labels**

```python
iso_forest = IsolationForest(contamination='auto')  # No hard threshold
scores = iso_forest.score_samples(X)

# Manual threshold based on business cost
threshold = np.percentile(scores, 2)  # Bottom 2%
y_pred = (scores < threshold).astype(int)
```

**3. Calibrate threshold with labeled data**

```python
# If you have some labeled anomalies (semi-supervised)
from sklearn.metrics import precision_recall_curve

# Train on unlabeled data
iso_forest.fit(X_train)

# Evaluate on validation set with labels
scores_val = iso_forest.score_samples(X_val)
precision, recall, thresholds = precision_recall_curve(y_val, -scores_val)

# Choose threshold for desired precision (e.g., 90%)
target_precision = 0.9
best_threshold_idx = np.argmax(precision >= target_precision)
best_threshold = thresholds[best_threshold_idx]

# Apply in production
anomalies = scores_prod < best_threshold
```

**4. Ensemble approach**

```python
# Combine multiple contamination values
contaminations = [0.01, 0.02, 0.05]
predictions = []

for cont in contaminations:
    iso = IsolationForest(contamination=cont)
    predictions.append(iso.fit_predict(X))

# Majority vote
final_pred = np.sign(np.sum(predictions, axis=0))  # -1 if majority says anomaly
```

**Key insight:** `contamization` is a **prior assumption**, not ground truth. In production, use it as a starting point and calibrate with data.

</details>

---

### Question 3: Autoencoder Reconstruction Error

You train an autoencoder for anomaly detection. Normal samples have mean reconstruction error = 0.05, anomalies = 0.15. A new sample has error = 0.08. Is it anomalous?

<details>
<summary>Click for Answer</summary>

**Answer:** It depends on the threshold you set based on acceptable false positive/negative rates. 0.08 is between normal and anomalous means—context and business cost determine the decision.

**Statistical approach:**

**Assume Gaussian errors:**

```python
# Normal samples: error ~ N(0.05, σ)
# Anomalies: error ~ N(0.15, σ)

# Need to estimate σ from training data
normal_errors = [0.03, 0.04, 0.05, 0.06, 0.07]  # Example
σ = np.std(normal_errors)  # Say σ = 0.015

# How many standard deviations is 0.08 from normal mean?
z_score = (0.08 - 0.05) / 0.015 = 2.0

# Rule: Flag if > 3σ from normal (99.7% confidence)
# 0.08 is 2σ → Not anomalous by this rule
```

**ROC-based threshold:**

```python
# Plot ROC curve on validation set
from sklearn.metrics import roc_curve, auc

# Reconstruction errors on validation set
errors_normal = [0.03, 0.04, 0.05, ...]
errors_anomaly = [0.12, 0.15, 0.18, ...]

y_true = [0]*len(errors_normal) + [1]*len(errors_anomaly)
errors_combined = errors_normal + errors_anomaly

fpr, tpr, thresholds = roc_curve(y_true, errors_combined)

# Choose threshold at desired TPR/FPR
# E.g., TPR=95% (catch 95% of anomalies)
target_tpr = 0.95
idx = np.argmin(np.abs(tpr - target_tpr))
threshold = thresholds[idx]

print(f"Threshold: {threshold:.3f}")
# If threshold = 0.10, then 0.08 → Normal
# If threshold = 0.07, then 0.08 → Anomaly
```

**Cost-sensitive threshold:**

```python
# False Positive cost: $10 (unnecessary investigation)
# False Negative cost: $1000 (missed fraud)

# Minimize expected cost
def expected_cost(threshold, errors, y_true, cost_fp, cost_fn):
    y_pred = (errors > threshold).astype(int)
    FP = np.sum((y_pred == 1) & (y_true == 0))
    FN = np.sum((y_pred == 0) & (y_true == 1))
    return FP * cost_fp + FN * cost_fn

thresholds_test = np.linspace(0.03, 0.20, 100)
costs = [expected_cost(t, errors_combined, y_true, 10, 1000) for t in thresholds_test]
optimal_threshold = thresholds_test[np.argmin(costs)]

# With high FN cost, threshold will be LOW → flag 0.08 as anomaly
```

**Practical answer for error = 0.08:**

```
If cost of missing anomaly is high (fraud, safety):
→ Threshold = 0.07 → Flag as 0.08 anomaly

If cost of false alarm is high (alert fatigue):
→ Threshold = 0.10 → Treat 0.08 as normal
```

**Best practice:** Don't hardcode a single threshold. Use a scoring system:

```python
def risk_score(error):
    if error < 0.06:
        return "Low risk"
    elif error < 0.10:
        return "Medium risk - Monitor"
    else:
        return "High risk - Investigate"
```

</details>

---

### Question 4: t-SNE Interpretation

You visualize data with t-SNE and see 5 clear clusters. Can you use this to claim the data has 5 true clusters?

<details>
<summary>Click for Answer</summary>

**Answer:** **No.** t-SNE can create artificial clusters due to its non-linear transformations and hyperparameter sensitivity (perplexity). Always validate with clustering metrics in original high-dimensional space.

**Why t-SNE is misleading:**

**1. Non-convexity:** t-SNE can "break apart" true clusters

```python
# True data: 1 cluster (elongated)
# t-SNE with low perplexity: Breaks into 3-4 clusters visually
```

**2. Hyperparameter sensitivity:**

```python
# Same data, different perplexity
tsne_5 = TSNE(perplexity=5)   → Shows many small clusters
tsne_50 = TSNE(perplexity=50) → Shows few large clusters
```

**3. Artificial structure:**

```
t-SNE exaggerates distances → Creates visual separation even for noise
Random data can look "clustered" in t-SNE!
```

**Correct workflow:**

**Step 1: Visualize with t-SNE (exploration)**

```python
tsne = TSNE(n_components=2, perplexity=30, random_state=42)
X_tsne = tsne.fit_transform(X)

plt.scatter(X_tsne[:, 0], X_tsne[:, 1], alpha=0.6)
plt.title("t-SNE Visualization (Exploration Only!)")
# Observation: Looks like 5 clusters
```

**Step 2: Validate in original space**

```python
from sklearn.cluster import KMeans
from sk learn.metrics import silhouette_score

# Try different K values in ORIGINAL high-dimensional space
silhouette_scores = []
for k in range(2, 10):
    kmeans = KMeans(n_clusters=k, random_state=42)
    labels = kmeans.fit_predict(X)  # X, not X_tsne!
    score = silhouette_score(X, labels)
    silhouette_scores.append(score)

optimal_k = np.argmax(silhouette_scores) + 2
print(f"Optimal clusters in original space: {optimal_k}")
# May be 3, not 5!
```

**Step 3: Compare visualizations**

```python
# Overlay optimal clustering on t-SNE
labels_optimal = KMeans(n_clusters=optimal_k).fit_predict(X)

plt.scatter(X_tsne[:, 0], X_tsne[:, 1], c=labels_optimal, cmap='tab10')
plt.title(f"t-SNE with {optimal_k} True Clusters")
# May show that "5 visual clusters" actually belong to 3 true clusters
```

**t-SNE best practices:**

- **Don't cluster on t-SNE output** → Cluster on original data
- **Use t-SNE for exploration** → Follow up with quantitative validation
- **Try multiple perplexities** (5-50) → Check consistency
- **Compare with UMAP** → UMAP preserves global structure better

**What t-SNE IS good for:**

- Visualizing high-dimensional data
- Checking if classes separate
- Exploratory data analysis
- Presentations and reports

**What t-SNE is NOT good for:**

- Determining number of clusters
- Measuring exact distances
- Downstream ML tasks (use embeddings from autoencoder instead)

</details>

---

### Question 5: Production Anomaly Detection

Your anomaly detection model flags 500 alerts/day but analysts can only review 50. How do you prioritize?

<details>
<summary>Click for Answer</summary>

**Answer:** Rank anomalies by **severity score** combining anomaly confidence, business impact, and historical patterns. Send top-K to analysts, auto-resolve low-impact, and batch similar anomalies.

**Multi-factor scoring system:**

**1. Anomaly confidence**

```python
# Isolation Forest anomaly score
iso_scores = iso_forest.score_samples(X)
confidence = -iso_scores  # Higher = more anomalous
```

**2. Business impact**

```python
def business_impact(transaction):
    impact = 0
    
    # Transaction amount
    impact += transaction['amount'] / 100  # $100 = 1 point
    
    # User tier
    if transaction['user_tier'] == 'VIP':
        impact *= 3  # VIPs are high-priority
    
    # Merchant risk
    impact *= (1 + transaction['merchant_risk_score'])
    
    # Time sensitivity
    if transaction['hours_since'] < 1:
        impact *= 2  # Recent = prioritize
    
    return impact
```

**3. Historical pattern**

```python
def historical_risk(user_id):
    user_history = get_history(user_id)
    
    # Previous fraud
    if user_history['fraud_count'] > 0:
        return 10  # High priority
    
    # First-time anomaly
    if user_history['anomaly_count'] == 0:
        return 0.5  # May be false positive
    
    # Repeat anomalies
    return min(user_history['anomaly_count'], 5)
```

**Combined severity score:**

```python
def severity_score(anomaly):
    conf = anomaly_confidence(anomaly)
    impact = business_impact(anomaly)
    hist = historical_risk(anomaly['user_id'])
    
    return conf * impact * hist

# Rank all 500 anomalies
anomalies_ranked = sorted(anomalies, key=severity_score, reverse=True)

# Top 50 to analysts
high_priority = anomalies_ranked[:50]
```

**Tiered response:**

```python
# Tier 1: Top 50 (manual review)
send_to_analysts(high_priority)

# Tier 2: Next 150 (automated checks + batch review)
medium_priority = anomalies_ranked[50:200]
automated_rules_check(medium_priority)
batch_review_tomorrow(medium_priority)

# Tier 3: Bottom 300 (log and monitor)
low_priority = anomalies_ranked[200:]
log_for_retrospective_analysis(low_priority)

# Auto-resolve if score < threshold
for anomaly in low_priority:
    if severity_score(anomaly) < 2.0:
        auto_resolve(anomaly, reason="Low severity")
```

**Similar anomaly clustering:**

```python
# Group similar anomalies
from sklearn.cluster import DBSCAN

# Cluster 500 anomalies by pattern
similarities = compute_similarity_matrix(anomalies)
clusters = DBSCAN(eps=0.3, min_samples=2).fit_predict(similarities)

# Send 1 representative per cluster to analyst
for cluster_id in set(clusters):
    if cluster_id == -1:  # Unique anomalies
        continue
    cluster_anomalies = [a for a, c in zip(anomalies, clusters) if c == cluster_id]
    representative = cluster_anomalies[0]  # Highest severity in cluster
    send_to_analyst(representative, similar_count=len(cluster_anomalies))
```

**Feedback loop:**

```python
# Learn from analyst decisions
analyst_labels = get_analyst_feedback()  # True fraud vs false alarm

# Retrain severity model
X_features = extract_features(anomalies)
y_true_fraud = analyst_labels

# Train severity predictor
severity_model = RandomForestClassifier()
severity_model.fit(X_features, y_true_fraud)

# Use predictions to improve ranking
predicted_fraud_prob = severity_model.predict_proba(new_anomalies)[:, 1]
```

**Dashboard for analysts:**

```
Priority Queue (50 items):
1. [CRITICAL] $50,000 transaction, new merchant, user flagged 3x this month
2. [HIGH] VIP customer, unusual login location + time
3. [HIGH] $5,000, merchant risk=0.9, first-time customer
...

Batch Review (150 items grouped into 12 patterns):
- Pattern A: 45 similar anomalies (low-value, same IP range)
- Pattern B: 30 similar (failed login attempts from bot)
...

Auto-resolved (300 items): Available for audit
```

**Key metrics to track:**

- **Precision@K**: Of top K alerts, how many are true fraud?
- **Coverage**: % of true fraud caught in top K
- **Analyst efficiency**: Time to review vs alert volume
- **False negative rate**: Fraud missed entirely

</details>

---

## Summary

Today you learned:

- ✅ DBSCAN finds arbitrary-shaped clusters without specifying K
- ✅ Isolation Forest detects anomalies by isolating outliers in random trees
- ✅ Autoencoders compress data through bottleneck layers, useful for dimensionality reduction
- ✅ t-SNE and UMAP visualize high-dimensional data in 2D (exploration, not truth)
- ✅ Production anomaly detection requires severity scoring and analyst workflow integration
- ✅ Always validate clustering results with metrics in original high-dimensional space

**Tomorrow**: Time series forecasting—predicting future values from sequential data.

---

## Optional Build Tracks (Day 49-60 Extension)

Keep the **core lab tasks** in this lesson common for all learners, then add one optional extension artifact per track:

| Track | Day 55 assignment artifact |
| --- | --- |
| **NLP** | Document clustering baseline (k-means on TF-IDF) vs advanced topic/embedding clustering. |
| **Forecasting** | Demand regime discovery baseline (k-means on aggregate stats) vs advanced latent-state clustering. |
| **Recommenders/Graph** | User/item segmentation baseline (k-means) vs advanced graph/representation clustering. |

### Track requirements (apply to all three tracks)

1. **Baseline + advanced model comparison (required):** report offline metrics, error slices, and deployment trade-offs.
2. **Constraint scenario test (required):** run at least one scenario each day from: **limited data**, **latency limit**, **explainability requirement**.
3. **Refactoring checkpoint #1 (Day 53):** modularize data prep, training, evaluation, and inference into reusable pipeline components.
4. **Refactoring checkpoint #2 (Day 58):** externalize hyperparameters/model settings into versioned config files.
5. **Final deliverable (Day 60):** submit a concise **performance + business-impact memo** tying model lift to ROI, risk, and rollout recommendation.

