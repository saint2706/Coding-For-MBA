---
day: 48
title: "Recurrent Neural Networks"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "rnn"
duration: 60
difficulty: "intermediate"
tags: [deep-learning, rnn, lstm, sequences]
concepts: [sequence modeling, memory, LSTM, time series]
prerequisites: [46]
outcomes: [Understand RNN architecture, Model sequences, Apply LSTMs]
---

# 🎯 Day 48: Recurrent Neural Networks

> *"RNNs remember. They process sequences like language and time series."*

---

## The "Never-Coded" Bridge

RNNs handle sequences:
- **Text**: Word order matters
- **Time series**: Past values predict future
- **Memory**: Hidden state carries information

---

## The Technical Deep Dive

### RNN Concept

```
Input sequence: [x1, x2, x3, ..., xn]
                  ↓    ↓    ↓         ↓
Hidden state:   h1 → h2 → h3 → ... → hn
                                      ↓
                                   Output
```

### Simple RNN in Keras

```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import SimpleRNN, Dense

model = Sequential([
    SimpleRNN(64, input_shape=(10, 1)),  # 10 timesteps, 1 feature
    Dense(1)
])
model.compile(optimizer="adam", loss="mse")
```

### LSTM (Long Short-Term Memory)

```python
from tensorflow.keras.layers import LSTM

model = Sequential([
    LSTM(64, input_shape=(10, 1)),
    Dense(1)
])
model.compile(optimizer="adam", loss="mse")
```

### Time Series Prediction

```python
import numpy as np

# Create sequences
def create_sequences(data, seq_length):
    X, y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[i:i+seq_length])
        y.append(data[i+seq_length])
    return np.array(X), np.array(y)

# Example: predict next value from last 10
data = np.sin(np.linspace(0, 100, 1000))
X, y = create_sequences(data, 10)
X = X.reshape(-1, 10, 1)
```

---

## Hands-on Lab

```python
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import matplotlib.pyplot as plt

# Generate sine wave
t = np.linspace(0, 10 * np.pi, 1000)
data = np.sin(t)

# Create sequences
def create_sequences(data, length):
    X, y = [], []
    for i in range(len(data) - length):
        X.append(data[i:i+length])
        y.append(data[i+length])
    return np.array(X), np.array(y)

X, y = create_sequences(data, 20)
X = X.reshape(-1, 20, 1)

# Build and train
model = Sequential([LSTM(50, input_shape=(20, 1)), Dense(1)])
model.compile(optimizer="adam", loss="mse")
model.fit(X[:800], y[:800], epochs=10, verbose=0)

# Predict
predictions = model.predict(X[800:])
plt.plot(y[800:], label="Actual")
plt.plot(predictions, label="Predicted")
plt.legend()
plt.show()
```

---

## Summary

- ✅ RNNs process sequences with memory
- ✅ LSTM solves vanishing gradient problem
- ✅ Great for time series and text
- ✅ Input shape: (timesteps, features)

**🎉 Congratulations!** You've completed **Phase 4: Mathematical Foundations & ML Fundamentals**!
