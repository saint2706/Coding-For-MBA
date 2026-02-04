---
day: 39
title: "Calculus for ML"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "calculus-ml"
duration: 50
difficulty: "intermediate"
tags: [math, calculus, optimization, gradients]
concepts: [derivatives, gradients, optimization, gradient descent]
prerequisites: [38]
outcomes: [Understand derivatives conceptually, Apply gradient descent, Optimize functions]
---

# 🎯 Day 39: Calculus for Machine Learning

> *"Calculus finds the bottom of the hill. That's where the best model lives."*

---

## The "Never-Coded" Bridge

ML models learn by minimizing error. Calculus tells us:
- **Derivative**: How does error change if we adjust weights?
- **Gradient**: Which direction reduces error fastest?
- **Gradient Descent**: Walk downhill until error is minimal

---

## The Technical Deep Dive

### Derivatives: Rate of Change

```python
# f(x) = x^2
# f'(x) = 2x (derivative)

def f(x):
    return x**2

def f_derivative(x):
    return 2*x

# At x=3, slope is 6 (rising steeply)
# At x=0, slope is 0 (minimum!)
```

### Gradient Descent

```python
import numpy as np

def loss(x):
    """Function to minimize: (x-3)^2"""
    return (x - 3)**2

def gradient(x):
    """Derivative of loss"""
    return 2 * (x - 3)

# Gradient descent
x = 0.0  # Start anywhere
learning_rate = 0.1

for i in range(20):
    grad = gradient(x)
    x = x - learning_rate * grad  # Move opposite to gradient
    print(f"Step {i+1}: x={x:.4f}, loss={loss(x):.4f}")

# Converges to x=3 (minimum)
```

### Multivariate Gradient

```python
def loss_2d(w1, w2):
    """Loss surface: (w1-2)^2 + (w2+1)^2"""
    return (w1 - 2)**2 + (w2 + 1)**2

def gradient_2d(w1, w2):
    """Partial derivatives"""
    return np.array([2*(w1 - 2), 2*(w2 + 1)])

# Gradient descent in 2D
w = np.array([0.0, 0.0])
lr = 0.1

for i in range(50):
    grad = gradient_2d(w[0], w[1])
    w = w - lr * grad

print(f"Optimal weights: {w}")  # [2, -1]
```

### Learning Rate Impact

```python
# Too small: slow convergence
# Too large: overshooting (divergence)
# Just right: smooth convergence

learning_rates = [0.01, 0.1, 0.5]  # Experiment!
```

---

## Hands-on Lab

```python
import numpy as np
import matplotlib.pyplot as plt

# Visualize gradient descent
def loss(x):
    return x**4 - 3*x**3 + 2

def gradient(x):
    return 4*x**3 - 9*x**2

# Track descent
x = 3.0
history = [x]

for _ in range(50):
    x = x - 0.01 * gradient(x)
    history.append(x)

# Plot
x_range = np.linspace(-1, 3.5, 100)
plt.figure(figsize=(10, 5))
plt.plot(x_range, loss(x_range), label="Loss function")
plt.scatter(history, [loss(h) for h in history], c=range(len(history)), cmap="Reds")
plt.title("Gradient Descent Path")
plt.xlabel("x")
plt.ylabel("Loss")
plt.show()
```

---

## Summary

- ✅ Derivatives measure rate of change
- ✅ Gradient points "uphill"
- ✅ Gradient descent walks "downhill"
- ✅ Learning rate controls step size

**Tomorrow**: Introduction to Machine Learning.
