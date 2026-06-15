---
day: 46
title: "Introduction to Neural Networks"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "neural-networks-intro"
duration: 60
difficulty: "intermediate"
tags:
  - machine-learning
  - neural-networks
  - deep-learning
  - keras
concepts:
  - "neurons and layers"
  - "activation functions"
  - "forward propagation"
  - "backpropagation"
  - "loss functions"
prerequisites: [38, 39, 40]
outcomes:
  - "Understand neural network architecture"
  - "Build simple networks with Keras"
  - "Train networks with backpropagation"
  - "Choose appropriate activations and losses"
---

# 🎯 Day 46: Introduction to Neural Networks

> *"Neural networks learn by adjusting millions of tiny knobs until the output is right."*

---

## The "Never-Coded" Bridge

**You're trying to recognize handwritten digits.** A simple rule like "if there's a curve at the top, it's a 9" doesn't work—handwriting varies too much. But a neural network can learn: examine 60,000 examples, adjust internal weights, and eventually recognize patterns humans can't even describe.

**Neural networks in the real world:**

- **Google Photos**: Face recognition
- **Tesla**: Self-driving perception
- **Spotify**: Music recommendations
- **GPT/ChatGPT**: Language understanding
- **Netflix**: Content recommendations

---

## The Technical Deep Dive

### Neural Network Fundamentals: Key Terms

Before looking at Keras code, understand what each component does:

| Term | Definition | In Keras |
|------|-----------|---------|
| **Logits** | Raw model output scores before activation — not bounded to [0,1] | Last Dense layer without activation |
| **Softmax/Sigmoid** | Converts logits to probabilities: sigmoid for binary (0–1), softmax for multiclass (sum=1) | `activation='sigmoid'` or `'softmax'` |
| **Loss function** | Measures prediction error; what the optimizer minimizes | `model.compile(loss=...)` |
| **Binary cross-entropy** | Loss for binary classification: −[y log(ŷ) + (1−y) log(1−ŷ)] | `'binary_crossentropy'` |
| **Batch** | Subset of training samples processed together before a weight update | `model.fit(batch_size=32)` |
| **Epoch** | One full pass through the entire training dataset | `model.fit(epochs=50)` |
| **Optimizer** | Algorithm that updates weights to minimize loss | `model.compile(optimizer='adam')` |
| **Validation set** | Data held out during training (not test set!) to monitor for overfitting | `model.fit(validation_split=0.2)` |
| **Parameter** | A learnable weight or bias in the model; total count = model complexity | `model.summary()` shows total params |
| **Backpropagation** | Algorithm that computes gradients of the loss with respect to each parameter, using the chain rule | Automatic in Keras; called by `model.fit()` |

**Why the output activation/loss pair matters:**

| Task | Output Activation | Loss Function | Why |
|------|-----------------|--------------|-----|
| Binary classification | `sigmoid` | `binary_crossentropy` | sigmoid → probability in (0,1); log loss penalizes confident wrong predictions heavily |
| Multiclass classification | `softmax` | `categorical_crossentropy` | softmax sums to 1 (valid probability distribution over classes) |
| Regression | None (linear) | `mse` or `mae` | Unbounded output needed for continuous targets |

### The Neuron: The Basic Unit

A neuron computes a weighted sum of its inputs, adds a bias, and pushes the result through a non-linear activation $\sigma(\cdot)$:

$$
z = \sum_{i=1}^{n} w_i x_i + b = \mathbf{w}^\top \mathbf{x} + b, \qquad a = \sigma(z)
$$

A whole **fully-connected layer** with input $\mathbf{x} \in \mathbb{R}^{d_{\text{in}}}$, weight matrix $W \in \mathbb{R}^{d_{\text{out}} \times d_{\text{in}}}$, and bias $\mathbf{b} \in \mathbb{R}^{d_{\text{out}}}$ is just this operation in vector form:

$$
\mathbf{a} = \sigma(W \mathbf{x} + \mathbf{b})
$$

```python
import numpy as np


def neuron(inputs, weights, bias, activation="relu"):
    """A single artificial neuron."""
    # Weighted sum
    z = np.dot(inputs, weights) + bias

    # Activation function
    if activation == "relu":
        return np.maximum(0, z)
    elif activation == "sigmoid":
        return 1 / (1 + np.exp(-z))
    elif activation == "linear":
        return z


# Example: 3 inputs → 1 output
inputs = np.array([0.5, 0.3, 0.2])
weights = np.array([0.4, -0.2, 0.8])
bias = 0.1

output = neuron(inputs, weights, bias)
print(f"Inputs: {inputs}")
print(f"Weights: {weights}")
print(f"Bias: {bias}")
print(f"Output: {output:.3f}")
```

### Activation Functions

Activations introduce the non-linearity that lets stacked layers represent functions a single linear layer never could. The four workhorses:

$$
\text{ReLU}(z) = \max(0, z), \qquad
\sigma(z) = \frac{1}{1 + e^{-z}}, \qquad
\tanh(z) = \frac{e^{z} - e^{-z}}{e^{z} + e^{-z}}
$$

For multi-class outputs, the **softmax** turns a vector of $K$ scores into a probability distribution that sums to $1$:

$$
\text{softmax}(\mathbf{z})_k = \frac{e^{z_k}}{\sum_{j=1}^{K} e^{z_j}}
$$

The corresponding loss for a one-hot target $\mathbf{y}$ is the **categorical cross-entropy**:

$$
\mathcal{L}_{\text{CE}} = -\sum_{k=1}^{K} y_k \log \hat{p}_k
$$

```python
import matplotlib.pyplot as plt

x = np.linspace(-5, 5, 100)

# Common activations
relu = np.maximum(0, x)
sigmoid = 1 / (1 + np.exp(-x))
tanh = np.tanh(x)

plt.figure(figsize=(12, 4))

plt.subplot(1, 3, 1)
plt.plot(x, relu, "b-", linewidth=2)
plt.title("ReLU: max(0, x)")
plt.grid(True, alpha=0.3)
plt.axhline(y=0, color="k", linewidth=0.5)
plt.axvline(x=0, color="k", linewidth=0.5)

plt.subplot(1, 3, 2)
plt.plot(x, sigmoid, "g-", linewidth=2)
plt.title("Sigmoid: 1/(1+e^-x)")
plt.grid(True, alpha=0.3)

plt.subplot(1, 3, 3)
plt.plot(x, tanh, "r-", linewidth=2)
plt.title("Tanh: (e^x - e^-x)/(e^x + e^-x)")
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

print("Activation Usage:")
print("  ReLU: Hidden layers (default)")
print("  Sigmoid: Binary output (0-1)")
print("  Softmax: Multi-class output")
print("  Linear: Regression output")
```

### Building a Neural Network with Keras

```python
import numpy as np
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Generate classification data
np.random.seed(42)
n = 1000

X = np.random.randn(n, 10)
y = ((X[:, 0] + X[:, 1] - X[:, 2] ** 2 + 0.5 * X[:, 3] * X[:, 4]) > 0).astype(int)

# Split and scale
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Build model
model = keras.Sequential(
    [
        layers.Dense(64, activation="relu", input_shape=(10,)),
        layers.Dense(32, activation="relu"),
        layers.Dense(1, activation="sigmoid"),
    ]
)

# Compile
model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])

# Summary
model.summary()
```

### Training the Network

```python
# Train
history = model.fit(
    X_train, y_train, epochs=50, batch_size=32, validation_split=0.2, verbose=1
)

# Evaluate
test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"\nTest accuracy: {test_acc:.3f}")

# Plot training history
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 2, figsize=(12, 4))

axes[0].plot(history.history["loss"], label="Train")
axes[0].plot(history.history["val_loss"], label="Validation")
axes[0].set_xlabel("Epoch")
axes[0].set_ylabel("Loss")
axes[0].set_title("Loss over Training")
axes[0].legend()

axes[1].plot(history.history["accuracy"], label="Train")
axes[1].plot(history.history["val_accuracy"], label="Validation")
axes[1].set_xlabel("Epoch")
axes[1].set_ylabel("Accuracy")
axes[1].set_title("Accuracy over Training")
axes[1].legend()

plt.tight_layout()
plt.show()
```

### Understanding Backpropagation

For a network of $L$ layers, the **forward pass** computes:

$$
\mathbf{z}^{(\ell)} = W^{(\ell)} \mathbf{a}^{(\ell-1)} + \mathbf{b}^{(\ell)}, \qquad \mathbf{a}^{(\ell)} = \sigma\!\big(\mathbf{z}^{(\ell)}\big)
$$

with $\mathbf{a}^{(0)} = \mathbf{x}$ and final prediction $\hat{\mathbf{y}} = \mathbf{a}^{(L)}$.

The **backward pass** uses the chain rule to compute the loss gradient w.r.t. every parameter. Define the layer error:

$$
\boldsymbol{\delta}^{(\ell)} = \frac{\partial \mathcal{L}}{\partial \mathbf{z}^{(\ell)}}
$$

Then the recursion is:

$$
\boldsymbol{\delta}^{(L)} = \nabla_{\mathbf{a}} \mathcal{L} \,\odot\, \sigma'\!\big(\mathbf{z}^{(L)}\big), \qquad
\boldsymbol{\delta}^{(\ell)} = \big(W^{(\ell+1)}\big)^{\!\top} \boldsymbol{\delta}^{(\ell+1)} \,\odot\, \sigma'\!\big(\mathbf{z}^{(\ell)}\big)
$$

and the parameter gradients are:

$$
\frac{\partial \mathcal{L}}{\partial W^{(\ell)}} = \boldsymbol{\delta}^{(\ell)} \big(\mathbf{a}^{(\ell-1)}\big)^{\!\top}, \qquad
\frac{\partial \mathcal{L}}{\partial \mathbf{b}^{(\ell)}} = \boldsymbol{\delta}^{(\ell)}
$$

Finally the parameters are updated by SGD: $W^{(\ell)} \leftarrow W^{(\ell)} - \eta \, \partial \mathcal{L} / \partial W^{(\ell)}$.

```python
"""
Forward Pass:
  Input → Hidden Layer 1 → Hidden Layer 2 → Output

  At each layer:
    z = weights @ input + bias
    a = activation(z)

Backward Pass (Backpropagation):
  1. Compute loss: L = loss_function(prediction, target)
  2. Compute gradient: dL/dw for each weight
  3. Update weights: w = w - learning_rate * dL/dw

The chain rule propagates gradients backward through layers.
"""

# Simplified gradient descent visualization
losses = []
weights = 5.0  # Start far from optimal
learning_rate = 0.1

for i in range(50):
    # Simulated loss: (w - 2)^2 (optimal at w=2)
    loss = (weights - 2) ** 2
    gradient = 2 * (weights - 2)
    weights = weights - learning_rate * gradient
    losses.append(loss)

plt.figure(figsize=(8, 4))
plt.plot(losses, "b-", linewidth=2)
plt.xlabel("Iteration")
plt.ylabel("Loss")
plt.title("Gradient Descent Reducing Loss")
plt.grid(True, alpha=0.3)
plt.show()
```

### Neural Network Engineering: Critical Concepts

**Weight Initialization**
How weights are initialized affects whether gradients can flow through the network:

- **Glorot/Xavier uniform** (default for tanh): Variance = 2/(fan_in + fan_out) — prevents vanishing/exploding
- **He initialization** (default for relu): Variance = 2/fan_in — accounts for ReLU killing half the signal

```python
Dense(64, activation='relu', kernel_initializer='he_uniform')
```

**Vanishing and Exploding Gradients**

- **Vanishing**: In deep networks, gradients shrink as they propagate backward — early layers learn very slowly. Fix: ReLU activations, residual connections (ResNet), batch normalization.
- **Exploding**: Gradients grow exponentially — loss becomes NaN. Fix: gradient clipping, lower learning rate.

```python
optimizer = Adam(learning_rate=0.001, clipnorm=1.0)  # Clip gradient norm to 1.0
```

**Batch Normalization**
Normalizes layer inputs within each mini-batch to zero mean and unit variance:

```python
model = Sequential([
    Dense(128, activation='relu'),
    BatchNormalization(),  # After activation or before — depends on convention
    Dense(64, activation='relu'),
    BatchNormalization(),
    Dense(1, activation='sigmoid')
])
```

Benefits: Faster convergence, allows higher learning rates, reduces sensitivity to initialization.

**Reproducibility**

```python
import tensorflow as tf
import numpy as np
import random

def set_seeds(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    tf.random.set_seed(seed)
    
set_seeds(42)  # Call before model creation AND training
```

**When Neural Networks Are a Poor Choice for Tabular Data**
Tabular data (structured, with meaningful feature names) is the domain where tree models often outperform neural networks:

- **Gradient Boosting (XGBoost, LightGBM) is usually better** for tabular data with < 100k rows
- NNs shine on: images, text, audio, sequences — where feature interactions are spatial/temporal
- For tabular data: NNs need more tuning, more data, and more compute for similar accuracy
- **Rule of thumb**: If Random Forest AUC > 0.85 on your tabular problem, try GBM before investing in neural network architecture search

| Data Type | Recommended First Try | Neural Network Suitable? |
|-----------|----------------------|------------------------|
| Structured tabular (< 100k rows) | Random Forest or LightGBM | Rarely — NNs often underperform |
| Structured tabular (> 500k rows) | LightGBM or wide NN | Possible with embeddings for categoricals |
| Image | CNN | Yes — primary use case |
| Text | Transformer (BERT, GPT) | Yes — primary use case |
| Time series | LightGBM with lags, LSTM | Both; start with tree models |

---

## Senior-Level Insights

### Network Architecture Guide

| Task                      | Output Layer       | Loss Function            |
| ------------------------- | ------------------ | ------------------------ |
| **Binary classification** | 1 neuron, sigmoid  | binary_crossentropy      |
| **Multi-class**           | N neurons, softmax | categorical_crossentropy |
| **Regression**            | 1 neuron, linear   | mse                      |

### Common Hyperparameters

| Parameter             | Typical Values   | Effect                                   |
| --------------------- | ---------------- | ---------------------------------------- |
| **Hidden layers**     | 1-5              | More = more capacity (risk overfitting)  |
| **Neurons per layer** | 32, 64, 128, 256 | More = more capacity                     |
| **Learning rate**     | 0.001, 0.01      | Lower = slower, more stable              |
| **Batch size**        | 32, 64, 128      | Smaller = noisier, may generalize better |
| **Epochs**            | 10-100           | Use early stopping                       |

#### Hyperparameter Choices: Why These Defaults?

| Hyperparameter | Typical Default | Justification | When to Change |
|---------------|----------------|--------------|----------------|
| **Hidden layer size** | 64–256 neurons | Rule of thumb: 2× input features; start moderate to avoid overfit | Increase if validation loss is still high; decrease if model overfits fast |
| **Number of layers** | 1–3 hidden | More layers = more capacity but harder to train; tabular data rarely needs > 3 | Increase for image/text where local patterns need hierarchical extraction |
| **Epochs** | 50–200 | Enough to converge; use EarlyStopping to stop when validation stops improving | Set high; let EarlyStopping decide actual stopping point |
| **Batch size** | 32 | Powers of 2 for GPU efficiency; 32 is a robust default that balances noise and speed | Larger (256) for smoother training but may hurt generalization; smaller (8) for tiny datasets |
| **Validation split** | 0.2 | 80/20 echoes standard train/test convention; ensure val set is large enough to be reliable | Increase if imbalanced classes cause unstable validation metrics |
| **Optimizer** | Adam | Adaptive per-parameter learning rates; requires minimal tuning; default learning_rate=0.001 works broadly | Switch to SGD with momentum for large models where Adam's memory footprint matters |
| **Learning rate** | 0.001 (Adam default) | Generally stable starting point; adjust if loss spikes (too high) or barely decreases (too low) | Use ReduceLROnPlateau callback to auto-reduce |

### Preventing Overfitting

```python
from tensorflow.keras import layers, regularizers

model = keras.Sequential(
    [
        layers.Dense(64, activation="relu", kernel_regularizer=regularizers.l2(0.01)),
        layers.Dropout(0.3),  # Randomly zero 30% of neurons during training
        layers.Dense(32, activation="relu"),
        layers.Dropout(0.2),
        layers.Dense(1, activation="sigmoid"),
    ]
)

# Early stopping
early_stop = keras.callbacks.EarlyStopping(
    monitor="val_loss", patience=5, restore_best_weights=True
)

# history = model.fit(..., callbacks=[early_stop])
```

### Senior-Level Neural Network Insights

**GPU vs CPU Tradeoffs**

| Consideration | CPU | GPU |
|--------------|-----|-----|
| Small models (< 1M params) | Often faster (no transfer overhead) | Slower (transfer latency dominates) |
| Large models, large batches | Too slow for training | 10–100× faster |
| Inference latency | Lower for single sample | Higher for single sample |
| Cost | Free (existing hardware) | Cloud: $0.50–$3/hr |

Practical rule: Use CPU for development and small experiments; use GPU (Colab free tier, AWS g4dn) for training > 100 epochs on > 10k samples.

**Experiment Tracking**

```python
# Log every run with its hyperparameters and results
import mlflow

with mlflow.start_run():
    mlflow.log_params({'learning_rate': 0.001, 'batch_size': 32, 'epochs': 100})
    mlflow.log_metric('val_auc', val_auc)
    mlflow.keras.log_model(model, 'model')
```

**Checkpointing**

```python
from tensorflow.keras.callbacks import ModelCheckpoint

checkpoint = ModelCheckpoint(
    'best_model.keras',
    monitor='val_loss',
    save_best_only=True,  # Only saves when val_loss improves
    mode='min'
)
```

**Model Serving and Monitoring**

- Export model: `model.save('churn_v1.keras')` or `model.export('serving_model')` for TF Serving
- Monitor: Log input feature distributions, prediction score distributions, and (when labels arrive) actual accuracy
- Alert when: mean predicted probability shifts > 10% month-over-month

**Responsible Deployment**

- Evaluate on demographic subgroups before deployment
- Document model limitations (e.g., "trained on data from 2022–2024; may not reflect post-2025 customer behavior")
- Set a model expiry date and retraining schedule

### Neural Network Troubleshooting Guide

| Symptom | Likely Cause | Intervention |
|---------|-------------|-------------|
| Loss is NaN from epoch 1 | Exploding gradients; learning rate too high | Reduce learning rate (10× smaller); add gradient clipping |
| Training loss high, doesn't decrease | Learning rate too low; model too small; wrong loss | Try learning rate 10× larger; add more layers/neurons; verify loss matches task |
| Training loss low, val loss high (large gap) | Overfitting | Add Dropout(0.3–0.5); reduce model size; add more training data; L2 regularization |
| Both losses plateau early | Learning rate too high after initial drop; data issue | Use ReduceLROnPlateau; check for label noise |
| Val loss decreases then sharply increases | Overfitting kicking in | Use EarlyStopping with patience=10, restore_best_weights=True |
| Model performs poorly despite low loss | Wrong loss function for task | Binary problem? Use binary_crossentropy, not mse; check class imbalance |
| Results vary across runs | Non-deterministic operations | Set all seeds; use deterministic mode |

---

## Hands-on Lab

### Exercise 1: Building Your First Neural Network

**Business Scenario:** RetailCo wants to predict customer churn (binary classification). The team wants to test whether a neural network outperforms the Random Forest baseline.

**Goal:** Build, train, and evaluate a neural network; compare to a non-neural baseline.

**Compute Budget:** < 5 minutes on CPU. If training takes longer, reduce epochs to 30 or batch_size to 64.

**Tasks:**

1. Establish a non-neural baseline: train LogisticRegression and report test AUC
2. Build a 2-layer neural network (128 → 64 → sigmoid); compile with Adam + binary_crossentropy
3. Train for 100 epochs with EarlyStopping(patience=10, restore_best_weights=True) and validation_split=0.2
4. Plot training vs validation loss curves — diagnose: is the model overfitting?
5. Report test AUC; compare to LogisticRegression baseline
6. Debug task: Change learning_rate to 10.0 — observe what happens to the loss curve. Report: "The loss curve shows ***which indicates***."

**Expected Output:**

```
LogisticRegression baseline AUC: ~0.78
Neural network test AUC: ~0.80–0.84
Early stopping triggered at: ~45–65 epochs
Training stopped before epoch 100: confirms model converged

Training/validation loss (healthy training):
Epoch 1:  train_loss=0.65, val_loss=0.63
Epoch 30: train_loss=0.41, val_loss=0.44
Epoch 50 (EarlyStopping): train_loss=0.38, val_loss=0.43 (small gap = not overfitting)

Debug (learning_rate=10.0):
Epoch 1: train_loss=0.69
Epoch 2: train_loss=nan  ← Loss explodes; NaN indicates gradient explosion
Diagnosis: "Learning rate too large — gradients explode, causing NaN loss. Fix: reduce learning_rate to 0.001."
```

```python
import numpy as np
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Load data
data = load_breast_cancer()
X, y = data.data, data.target

# Prepare
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Build
model = keras.Sequential(
    [
        layers.Dense(32, activation="relu", input_shape=(30,)),
        layers.Dense(16, activation="relu"),
        layers.Dense(1, activation="sigmoid"),
    ]
)

model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])

# Train
history = model.fit(X_train, y_train, epochs=50, validation_split=0.2, verbose=0)

# Evaluate
print(f"Test accuracy: {model.evaluate(X_test, y_test, verbose=0)[1]:.3f}")
```

### Exercise 2: Comparing Architectures

```python
architectures = [
    [32],  # Shallow
    [64, 32],  # Medium
    [128, 64, 32],  # Deep
]

for arch in architectures:
    model = keras.Sequential()
    model.add(layers.Dense(arch[0], activation="relu", input_shape=(30,)))
    for units in arch[1:]:
        model.add(layers.Dense(units, activation="relu"))
    model.add(layers.Dense(1, activation="sigmoid"))

    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    model.fit(X_train, y_train, epochs=30, verbose=0)
    acc = model.evaluate(X_test, y_test, verbose=0)[1]
    print(f"Architecture {arch}: Accuracy = {acc:.3f}")
```

### Exercise 3: Regression with Neural Networks

```python
from sklearn.datasets import fetch_california_housing

# Load regression data
data = fetch_california_housing()
X, y = data.data, data.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Regression model (linear output, MSE loss)
model = keras.Sequential(
    [
        layers.Dense(64, activation="relu", input_shape=(8,)),
        layers.Dense(32, activation="relu"),
        layers.Dense(1),  # Linear activation for regression
    ]
)

model.compile(optimizer="adam", loss="mse", metrics=["mae"])
model.fit(X_train, y_train, epochs=50, validation_split=0.2, verbose=0)

print(f"Test MAE: {model.evaluate(X_test, y_test, verbose=0)[1]:.3f}")
```

---

## Mastery Check

### Question 1: Activation Choice

Why use ReLU in hidden layers instead of sigmoid?

<details>
<summary>Answer</summary>

ReLU avoids **vanishing gradient problem**. Sigmoid squashes values to 0-1, making gradients very small in deep networks. ReLU has constant gradient for positive values.

</details>

### Question 2: Output Layer Design

Binary classification with outputs "spam" or "not spam". What's the output layer?

<details>
<summary>Answer</summary>

`Dense(1, activation='sigmoid')` with `binary_crossentropy` loss. Sigmoid outputs probability 0-1; threshold at 0.5 for classification.

</details>

### Question 3: Overfitting Signs

Training accuracy is 98% but validation is 75%. What's happening?

<details>
<summary>Answer</summary>

**Overfitting** - model memorized training data. Solutions: add dropout, reduce layers/neurons, use regularization, add more data, early stopping.

</details>

### Question 4: Learning Rate

Learning rate 0.1 causes loss to jump around; 0.0001 is too slow. What to do?

<details>
<summary>Answer</summary>

Use **adaptive optimizers** like Adam (auto-adjusts learning rate), or try 0.001-0.01 range. Adam is the default choice and handles this automatically.

</details>

### Question 5: Batch Size

What's the difference between batch_size=32 and batch_size=512?

<details>
<summary>Answer</summary>

- **32**: More updates per epoch, noisier gradients, may generalize better
- **512**: Fewer updates, smoother gradients, faster training, may overfit

Start with 32; increase if memory allows and training is too slow.

</details>

---

## Summary

- ✅ Neural networks learn by adjusting weights via backpropagation
- ✅ A neuron computes $a = \sigma(\mathbf{w}^\top \mathbf{x} + b)$; a layer is $\mathbf{a} = \sigma(W \mathbf{x} + \mathbf{b})$
- ✅ ReLU $\max(0, z)$ for hidden layers; sigmoid/softmax for classification output
- ✅ Backprop recursion: $\boldsymbol{\delta}^{(\ell)} = \big(W^{(\ell+1)}\big)^\top \boldsymbol{\delta}^{(\ell+1)} \odot \sigma'(\mathbf{z}^{(\ell)})$
- ✅ Use dropout and early stopping to prevent overfitting
- ✅ Match loss function to task (BCE for classification, MSE for regression)

**Tomorrow**: Convolutional Neural Networks for image data.
