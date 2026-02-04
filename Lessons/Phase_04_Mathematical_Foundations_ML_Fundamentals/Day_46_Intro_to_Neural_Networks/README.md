---
day: 46
title: "Introduction to Neural Networks"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "neural-networks-intro"
duration: 60
difficulty: "intermediate"
tags: [machine-learning, neural-networks, deep-learning]
concepts: [neurons, layers, activation functions, backpropagation]
prerequisites: [38, 39, 40]
outcomes: [Understand neural network architecture, Build simple networks, Train with backpropagation]
---

# 🎯 Day 46: Introduction to Neural Networks

> *"Neural networks: layers of simple math that learn complex patterns."*

---

## The "Never-Coded" Bridge

Neural networks mimic brain structure:
- **Neurons**: Simple units that compute
- **Layers**: Groups of neurons
- **Learning**: Adjusting weights to reduce error

---

## The Technical Deep Dive

### Single Neuron

```python
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

# Single neuron
inputs = np.array([1.0, 2.0, 3.0])
weights = np.array([0.5, 0.3, 0.2])
bias = 0.1

# Forward pass
z = np.dot(inputs, weights) + bias
output = sigmoid(z)
print(f"Output: {output:.4f}")
```

### Activation Functions

```python
def relu(x):
    return np.maximum(0, x)

def tanh(x):
    return np.tanh(x)

def softmax(x):
    exp_x = np.exp(x - np.max(x))
    return exp_x / exp_x.sum()
```

### Simple Network with Keras

```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense

model = Sequential([
    Dense(16, activation="relu", input_shape=(4,)),  # Hidden layer
    Dense(8, activation="relu"),                       # Hidden layer
    Dense(1, activation="sigmoid")                     # Output layer
])

model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
model.summary()
```

### Training

```python
# Train
history = model.fit(X_train, y_train, epochs=50, validation_split=0.2, verbose=1)

# Evaluate
loss, accuracy = model.evaluate(X_test, y_test)
print(f"Test accuracy: {accuracy:.2%}")
```

---

## Hands-on Lab

```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# Generate data
X, y = make_classification(n_samples=1000, n_features=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Build model
model = Sequential([
    Dense(32, activation="relu", input_shape=(10,)),
    Dense(16, activation="relu"),
    Dense(1, activation="sigmoid")
])

model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
model.fit(X_train, y_train, epochs=20, validation_split=0.2, verbose=0)

print(f"Test accuracy: {model.evaluate(X_test, y_test, verbose=0)[1]:.2%}")
```

---

## Summary

- ✅ Neurons compute weighted sums + activation
- ✅ Layers stack neurons for complexity
- ✅ Activation functions add non-linearity
- ✅ Keras makes building networks simple

**Tomorrow**: Convolutional Neural Networks.
