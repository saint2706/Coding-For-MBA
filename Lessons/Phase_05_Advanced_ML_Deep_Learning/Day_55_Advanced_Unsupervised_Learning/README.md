---
day: 55
title: "Advanced Unsupervised Learning"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "advanced-unsupervised"
duration: 50
difficulty: "advanced"
tags: [machine-learning, clustering, anomaly-detection]
concepts: [DBSCAN, anomaly detection, autoencoders]
prerequisites: [44]
outcomes: [Use density-based clustering, Detect anomalies, Build autoencoders]
---

# 🎯 Day 55: Advanced Unsupervised Learning

> *"Finding patterns in the unlabeled wilderness."*

---

## The Technical Deep Dive

### DBSCAN

```python
from sklearn.cluster import DBSCAN

# eps: max distance, min_samples: cluster requirement
model = DBSCAN(eps=0.5, min_samples=5)
labels = model.fit_predict(X)

# Label -1 = noise/outlier
n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
```

### Anomaly Detection

```python
from sklearn.ensemble import IsolationForest

model = IsolationForest(contamination=0.1)
predictions = model.fit_predict(X)  # 1=normal, -1=anomaly

anomalies = X[predictions == -1]
```

### Autoencoders

```python
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense

# Encoder-Decoder architecture
input_dim = X.shape[1]
encoding_dim = 8

input_layer = Input(shape=(input_dim,))
encoded = Dense(encoding_dim, activation="relu")(input_layer)
decoded = Dense(input_dim, activation="sigmoid")(encoded)

autoencoder = Model(input_layer, decoded)
autoencoder.compile(optimizer="adam", loss="mse")
autoencoder.fit(X, X, epochs=50, batch_size=32)
```

---

## Summary

- ✅ DBSCAN finds arbitrary-shaped clusters
- ✅ Isolation Forest detects outliers
- ✅ Autoencoders learn compressed representations

**Tomorrow**: Time series forecasting.
