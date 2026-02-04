---
day: 47
title: "Convolutional Neural Networks"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "cnn"
duration: 60
difficulty: "intermediate"
tags: [deep-learning, cnn, computer-vision]
concepts: [convolutions, pooling, feature maps, image classification]
prerequisites: [46]
outcomes: [Understand CNN architecture, Build image classifiers, Apply filters and pooling]
---

# 🎯 Day 47: Convolutional Neural Networks

> *"CNNs see patterns in images the way you recognize faces."*

---

## The "Never-Coded" Bridge

CNNs are designed for images:
- **Convolutions**: Detect edges, textures, shapes
- **Pooling**: Reduce size while keeping important info
- **Stacking**: Simple features → complex patterns

---

## The Technical Deep Dive

### CNN Architecture

```
Input Image → [Conv + ReLU → Pool] × N → Flatten → Dense → Output
```

### Building a CNN

```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense

model = Sequential([
    Conv2D(32, (3, 3), activation="relu", input_shape=(28, 28, 1)),
    MaxPooling2D((2, 2)),
    Conv2D(64, (3, 3), activation="relu"),
    MaxPooling2D((2, 2)),
    Flatten(),
    Dense(64, activation="relu"),
    Dense(10, activation="softmax")  # 10 classes
])

model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
```

### MNIST Example

```python
from tensorflow.keras.datasets import mnist

# Load data
(X_train, y_train), (X_test, y_test) = mnist.load_data()

# Preprocess
X_train = X_train.reshape(-1, 28, 28, 1) / 255.0
X_test = X_test.reshape(-1, 28, 28, 1) / 255.0

# Train
model.fit(X_train, y_train, epochs=5, validation_split=0.1)
print(f"Test accuracy: {model.evaluate(X_test, y_test)[1]:.2%}")
```

---

## Hands-on Lab

```python
from tensorflow.keras.datasets import mnist
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
import matplotlib.pyplot as plt

# Load and preprocess
(X_train, y_train), (X_test, y_test) = mnist.load_data()
X_train = X_train.reshape(-1, 28, 28, 1) / 255.0
X_test = X_test.reshape(-1, 28, 28, 1) / 255.0

# Build and train
model = Sequential([
    Conv2D(32, (3, 3), activation="relu", input_shape=(28, 28, 1)),
    MaxPooling2D((2, 2)),
    Flatten(),
    Dense(64, activation="relu"),
    Dense(10, activation="softmax")
])
model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
model.fit(X_train, y_train, epochs=3, verbose=1)

# Predict
predictions = model.predict(X_test[:5])
for i, pred in enumerate(predictions):
    print(f"Predicted: {pred.argmax()}, Actual: {y_test[i]}")
```

---

## Summary

- ✅ Conv2D extracts spatial features
- ✅ MaxPooling reduces dimensions
- ✅ Flatten connects to Dense layers
- ✅ CNNs excel at image tasks

**Tomorrow**: Recurrent Neural Networks.
