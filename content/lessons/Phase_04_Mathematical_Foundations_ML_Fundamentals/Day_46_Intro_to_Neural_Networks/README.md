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

---

## Hands-on Lab

### Exercise 1: Building Your First Neural Network

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
