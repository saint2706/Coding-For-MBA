---
day: 48
title: "Recurrent Neural Networks"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "rnn-intro"
duration: 60
difficulty: "intermediate"
tags:
  - deep-learning
  - rnn
  - lstm
  - sequences
  - nlp
concepts:
  - "recurrent connections"
  - "LSTM and GRU cells"
  - "sequence modeling"
  - "vanishing gradients"
prerequisites: [46]
outcomes:
  - "Understand how RNNs process sequences"
  - "Build LSTM models for time series"
  - "Apply RNNs to text data"
  - "Compare RNN, LSTM, and GRU"
---

# 🎯 Day 48: Recurrent Neural Networks

> *"RNNs have memory—they remember what they saw before."*

---

## The "Never-Coded" Bridge

**You're reading a sentence.** Understanding "bank" requires context—is it a river bank or a money bank? You carry meaning from previous words. RNNs work the same way: they process sequences one step at a time, maintaining a "memory" of past inputs.

**RNNs in action:**

- **Google Translate**: Sequence-to-sequence translation
- **Autocomplete**: Predicting next word
- **Stock prediction**: Time series forecasting
- **Speech recognition**: Audio → text
- **Music generation**: Creating melodies

---

## The Technical Deep Dive

### RNN and Sequence Modeling: Key Terms

| Term | Definition | Example |
|------|-----------|---------|
| **Hidden state** | A vector that carries information from previous timesteps to the current one; the RNN's "memory" | h_t = tanh(W_h × h_{t-1} + W_x × x_t) |
| **Timestep** | One element in a sequence | One day's sales, one word in a sentence, one sensor reading |
| **Sequence window (lookback)** | How many past timesteps the model uses as input | 10-day window: use sales from t-10 to t-1 to predict t |
| **Horizon** | How many steps ahead the model predicts | 1-step: predict tomorrow; 7-step: predict next week |
| **Vanishing gradient** | Gradients shrink exponentially as they propagate through many timesteps — early timesteps get almost no learning signal | Problem for vanilla RNNs on sequences > 20 timesteps |
| **Gate** | A learned component in LSTM/GRU that controls information flow (forget, input, output gates) | Forget gate: multiplies h_{t-1} by values in [0,1] to selectively erase memory |
| **Teacher forcing** | During training, using the true target at time t as input to predict t+1 (instead of the model's own prediction) | Speeds up training; can cause instability at inference time (exposure bias) |
| **Autoregressive forecasting** | At inference, feeding the model's own prediction as the next input | Multi-step: predict t+1, feed it back to predict t+2, and so on |
| **Masking** | Telling the model to ignore padded timesteps (zeros added to make sequences equal length) | `Masking(mask_value=0.0)` in Keras |
| **Bidirectional** | Processing the sequence both forward and backward; can only be used when the full sequence is available | Text classification (whole sentence known); NOT for real-time forecasting (future unknown) |

### The Recurrent Connection

A recurrent layer maintains a hidden state $\mathbf{h}_t$ that summarizes everything seen so far. At every time step it updates the state from the new input $\mathbf{x}_t$ and the previous state $\mathbf{h}_{t-1}$:

$$
\mathbf{h}_t = \tanh\!\big(W_x \mathbf{x}_t + W_h \mathbf{h}_{t-1} + \mathbf{b}\big), \qquad
\hat{y}_t = W_y \mathbf{h}_t + \mathbf{b}_y
$$

The same weight matrices $W_x, W_h$ are reused at every step (parameter sharing across time).

The **vanishing-gradient problem** of vanilla RNNs comes from backpropagating through time: $\partial \mathbf{h}_t / \partial \mathbf{h}_0 \approx \prod_{k=1}^{t} W_h \cdot \mathrm{diag}(\tanh'(\cdot))$. When eigenvalues of $W_h$ are below $1$ this product collapses to zero exponentially fast — the network forgets long-range dependencies.

```python
import numpy as np


def simple_rnn_cell(x_t, h_prev, Wx, Wh, b):
    """One step of a simple RNN.

    Args:
        x_t: Current input
        h_prev: Previous hidden state (memory)
        Wx, Wh: Weight matrices
        b: Bias
    """
    h_t = np.tanh(np.dot(x_t, Wx) + np.dot(h_prev, Wh) + b)
    return h_t


# Example: Process a sequence
sequence = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]  # 3 time steps, 3 features
hidden_size = 4

# Initialize weights
np.random.seed(42)
Wx = np.random.randn(3, hidden_size) * 0.1
Wh = np.random.randn(hidden_size, hidden_size) * 0.1
b = np.zeros(hidden_size)

# Process sequence
h = np.zeros(hidden_size)  # Initial hidden state
print("Processing sequence:")
for t, x_t in enumerate(sequence):
    h = simple_rnn_cell(np.array(x_t), h, Wx, Wh, b)
    print(f"  Step {t}: h = {h.round(3)}")

print("\nFinal hidden state carries information from entire sequence!")
```

### Building RNNs with Keras

```python
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np

# Generate sequence data (sine wave prediction)
np.random.seed(42)
x = np.linspace(0, 100, 1000)
y = np.sin(x) + np.random.randn(1000) * 0.1


# Create sequences (10 steps → predict next)
def create_sequences(data, seq_length):
    X, Y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[i : i + seq_length])
        Y.append(data[i + seq_length])
    return np.array(X), np.array(Y)


seq_length = 20
X, Y = create_sequences(y, seq_length)
X = X.reshape(-1, seq_length, 1)  # (samples, timesteps, features)

# Split
train_size = int(len(X) * 0.8)
X_train, X_test = X[:train_size], X[train_size:]
Y_train, Y_test = Y[:train_size], Y[train_size:]

print(f"Training samples: {X_train.shape}")
print(f"Each sample: {seq_length} timesteps, 1 feature")
```

### Simple RNN vs LSTM

```python
# Simple RNN (suffers from vanishing gradients)
model_rnn = keras.Sequential(
    [layers.SimpleRNN(32, input_shape=(seq_length, 1)), layers.Dense(1)]
)

# LSTM (Long Short-Term Memory) - handles long dependencies
model_lstm = keras.Sequential(
    [layers.LSTM(32, input_shape=(seq_length, 1)), layers.Dense(1)]
)

# GRU (Gated Recurrent Unit) - simpler than LSTM, often similar performance
model_gru = keras.Sequential(
    [layers.GRU(32, input_shape=(seq_length, 1)), layers.Dense(1)]
)

# Compare models
models = {"SimpleRNN": model_rnn, "LSTM": model_lstm, "GRU": model_gru}

for name, model in models.items():
    model.compile(optimizer="adam", loss="mse")
    model.fit(X_train, Y_train, epochs=20, verbose=0)
    mse = model.evaluate(X_test, Y_test, verbose=0)
    print(f"{name}: MSE = {mse:.4f}")
```

### Understanding LSTM

The LSTM solves vanishing gradients by adding a **cell state** $\mathbf{c}_t$ that flows through time with only additive interactions, controlled by three sigmoid **gates**. Letting $[\mathbf{h}_{t-1}, \mathbf{x}_t]$ denote the concatenation of the previous hidden state and the current input:

$$
\mathbf{f}_t = \sigma\!\big(W_f [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_f\big) \quad \text{(forget gate)}
$$

$$
\mathbf{i}_t = \sigma\!\big(W_i [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_i\big), \qquad
\tilde{\mathbf{c}}_t = \tanh\!\big(W_c [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_c\big) \quad \text{(input gate + candidate)}
$$

$$
\mathbf{c}_t = \mathbf{f}_t \odot \mathbf{c}_{t-1} + \mathbf{i}_t \odot \tilde{\mathbf{c}}_t \quad \text{(cell state update)}
$$

$$
\mathbf{o}_t = \sigma\!\big(W_o [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_o\big), \qquad
\mathbf{h}_t = \mathbf{o}_t \odot \tanh(\mathbf{c}_t) \quad \text{(output gate + hidden state)}
$$

The forget gate $\mathbf{f}_t$ near $1$ means "remember"; near $0$ means "forget". Because $\mathbf{c}_t$ is updated additively (rather than multiplicatively), gradients can flow across hundreds of time steps without vanishing.

The simpler **GRU** merges the forget and input gates into a single update gate $\mathbf{z}_t$ and uses a reset gate $\mathbf{r}_t$:

$$
\mathbf{z}_t = \sigma(W_z [\mathbf{h}_{t-1}, \mathbf{x}_t]), \quad
\mathbf{r}_t = \sigma(W_r [\mathbf{h}_{t-1}, \mathbf{x}_t]), \quad
\mathbf{h}_t = (1 - \mathbf{z}_t) \odot \mathbf{h}_{t-1} + \mathbf{z}_t \odot \tanh\!\big(W_h [\mathbf{r}_t \odot \mathbf{h}_{t-1}, \mathbf{x}_t]\big)
$$

```python
"""
LSTM Cell Components:

┌─────────────────────────────────────────┐
│                                         │
│  Forget Gate: What to forget           │
│  f_t = sigmoid(Wf · [h_prev, x_t] + bf) │
│                                         │
│  Input Gate: What new info to store    │
│  i_t = sigmoid(Wi · [h_prev, x_t] + bi) │
│  c̃_t = tanh(Wc · [h_prev, x_t] + bc)   │
│                                         │
│  Cell State Update:                     │
│  c_t = f_t * c_prev + i_t * c̃_t        │
│                                         │
│  Output Gate: What to output           │
│  o_t = sigmoid(Wo · [h_prev, x_t] + bo) │
│  h_t = o_t * tanh(c_t)                  │
│                                         │
└─────────────────────────────────────────┘

Key: The cell state (c_t) can carry information unchanged
through many timesteps - solving vanishing gradients!
"""

# Visualize predictions
model_lstm.fit(X_train, Y_train, epochs=50, verbose=0)
predictions = model_lstm.predict(X_test, verbose=0)

import matplotlib.pyplot as plt

plt.figure(figsize=(12, 4))
plt.plot(Y_test[:100], "b-", label="Actual", alpha=0.7)
plt.plot(predictions[:100], "r--", label="Predicted", alpha=0.7)
plt.xlabel("Time Step")
plt.ylabel("Value")
plt.title("LSTM Predictions on Sine Wave")
plt.legend()
plt.show()
```

### Stacked RNNs for Complex Patterns

```python
# Stacked LSTM for more complex sequences
model_stacked = keras.Sequential(
    [
        layers.LSTM(64, return_sequences=True, input_shape=(seq_length, 1)),
        layers.LSTM(32, return_sequences=False),
        layers.Dense(16, activation="relu"),
        layers.Dense(1),
    ]
)

model_stacked.compile(optimizer="adam", loss="mse")
model_stacked.summary()

# Note: return_sequences=True passes output at each timestep to next layer
# return_sequences=False only passes final hidden state
```

### Text Classification with LSTM

```python
from tensorflow.keras.datasets import imdb
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Load IMDB reviews (word indices)
vocab_size = 10000
max_length = 200

(X_train, y_train), (X_test, y_test) = imdb.load_data(num_words=vocab_size)

# Pad sequences to same length
X_train = pad_sequences(X_train, maxlen=max_length)
X_test = pad_sequences(X_test, maxlen=max_length)

print(f"Training samples: {X_train.shape}")
print(f"Each review: {max_length} words (padded)")

# Build model
model_text = keras.Sequential(
    [
        layers.Embedding(vocab_size, 128, input_length=max_length),
        layers.LSTM(64, dropout=0.2),
        layers.Dense(1, activation="sigmoid"),
    ]
)

model_text.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
model_text.fit(
    X_train, y_train, epochs=3, batch_size=64, validation_split=0.2, verbose=1
)

print(f"Test accuracy: {model_text.evaluate(X_test, y_test, verbose=0)[1]:.3f}")
```

---

## Senior-Level Insights

### RNN vs LSTM vs GRU

| Model         | Memory | Parameters | Best For                          |
| ------------- | ------ | ---------- | --------------------------------- |
| **SimpleRNN** | Short  | Fewest     | Short sequences                   |
| **LSTM**      | Long   | Most       | Long dependencies, default choice |
| **GRU**       | Long   | Medium     | Similar to LSTM, faster training  |

### Common Architectures

| Task                        | Architecture                |
| --------------------------- | --------------------------- |
| **Sequence classification** | LSTM → Dense                |
| **Sequence-to-sequence**    | Encoder LSTM → Decoder LSTM |
| **Time series forecasting** | Stacked LSTM → Dense        |
| **Bidirectional**           | Forward + Backward LSTM     |

### Handling Sequences

```python
# Variable length sequences: use masking
model = keras.Sequential(
    [
        layers.Masking(mask_value=0, input_shape=(max_length, features)),
        layers.LSTM(32),
        layers.Dense(1),
    ]
)

# Bidirectional: process forward and backward
model = keras.Sequential(
    [
        layers.Bidirectional(layers.LSTM(32), input_shape=(seq_length, 1)),
        layers.Dense(1),
    ]
)
```

---

## Hands-on Lab

### Exercise 1: Time Series Prediction

```python
import numpy as np
from tensorflow import keras
from tensorflow.keras import layers

# Generate data
np.random.seed(42)
x = np.linspace(0, 50, 500)
y = np.sin(x) * np.exp(-0.02 * x) + np.random.randn(500) * 0.1

# Create sequences
seq_length = 15
X, Y = [], []
for i in range(len(y) - seq_length):
    X.append(y[i : i + seq_length])
    Y.append(y[i + seq_length])
X, Y = np.array(X).reshape(-1, seq_length, 1), np.array(Y)

# Split
train_size = int(len(X) * 0.8)
X_train, X_test = X[:train_size], X[train_size:]
Y_train, Y_test = Y[:train_size], Y[train_size:]

# Model
model = keras.Sequential(
    [layers.LSTM(32, input_shape=(seq_length, 1)), layers.Dense(1)]
)
model.compile(optimizer="adam", loss="mse")
model.fit(X_train, Y_train, epochs=30, verbose=0)

print(f"Test MSE: {model.evaluate(X_test, Y_test, verbose=0):.4f}")
```

### Exercise 2: Comparing RNN Architectures

```python
architectures = [
    ("SimpleRNN", lambda: layers.SimpleRNN(32)),
    ("LSTM", lambda: layers.LSTM(32)),
    ("GRU", lambda: layers.GRU(32)),
    ("Stacked LSTM", lambda: [layers.LSTM(32, return_sequences=True), layers.LSTM(16)]),
]

for name, layer_fn in architectures:
    model = keras.Sequential()
    if "Stacked" in name:
        for layer in layer_fn():
            model.add(layer)
    else:
        model.add(layer_fn())
    model.add(layers.Dense(1))

    model.compile(optimizer="adam", loss="mse")
    model.fit(X_train, Y_train, epochs=20, verbose=0)
    mse = model.evaluate(X_test, Y_test, verbose=0)
    print(f"{name}: MSE = {mse:.4f}")
```

### Exercise 3: Multi-Step Forecasting

```python
# Predict multiple steps ahead
future_steps = 5


def create_multistep_data(data, seq_length, future_steps):
    X, Y = [], []
    for i in range(len(data) - seq_length - future_steps):
        X.append(data[i : i + seq_length])
        Y.append(data[i + seq_length : i + seq_length + future_steps])
    return np.array(X), np.array(Y)


X_multi, Y_multi = create_multistep_data(y, seq_length, future_steps)
X_multi = X_multi.reshape(-1, seq_length, 1)

train_size = int(len(X_multi) * 0.8)
X_train_m, X_test_m = X_multi[:train_size], X_multi[train_size:]
Y_train_m, Y_test_m = Y_multi[:train_size], Y_multi[train_size:]

model_multi = keras.Sequential(
    [
        layers.LSTM(64, input_shape=(seq_length, 1)),
        layers.Dense(32, activation="relu"),
        layers.Dense(future_steps),  # Output multiple steps
    ]
)

model_multi.compile(optimizer="adam", loss="mse")
model_multi.fit(X_train_m, Y_train_m, epochs=30, verbose=0)
print(f"Multi-step MSE: {model_multi.evaluate(X_test_m, Y_test_m, verbose=0):.4f}")
```

---

## Mastery Check

### Question 1: Why LSTM over SimpleRNN?

What problem does LSTM solve that SimpleRNN cannot?

<details>
<summary>Answer</summary>

**Vanishing gradient problem.** In long sequences, SimpleRNN gradients shrink to near-zero, preventing learning long-range dependencies. LSTM's cell state allows gradients to flow unchanged.

</details>

### Question 2: return_sequences

What does `return_sequences=True` do in LSTM?

<details>
<summary>Answer</summary>

Returns output at **every timestep** instead of just the final output. Use when stacking RNN layers (next layer needs all timesteps) or for sequence-to-sequence tasks.

</details>

### Question 3: Input Shape

LSTM expects input shape (samples, timesteps, features). What do these mean?

<details>
<summary>Answer</summary>

- **samples**: Number of sequences (batch)
- **timesteps**: Sequence length (e.g., 20 words, 50 time steps)
- **features**: Dimensions at each timestep (1 for univariate, more for multivariate)

</details>

### Question 4: Bidirectional

When would you use a Bidirectional LSTM?

<details>
<summary>Answer</summary>

When **future context matters** for understanding present. Examples: text classification (full sentence available), named entity recognition. NOT for real-time prediction (future unavailable).

</details>

### Question 5: LSTM vs GRU

When choose GRU over LSTM?

<details>
<summary>Answer</summary>

- **Faster training** (fewer parameters)
- **Similar performance** on many tasks
- Choose GRU for experimentation speed
- Choose LSTM when proven effective for your task

</details>

---

## Summary

- ✅ RNNs maintain a hidden state: $\mathbf{h}_t = \tanh(W_x \mathbf{x}_t + W_h \mathbf{h}_{t-1} + \mathbf{b})$
- ✅ Vanilla RNNs suffer vanishing gradients because $\partial \mathbf{h}_t / \partial \mathbf{h}_0$ involves $\prod W_h$
- ✅ LSTMs add a cell state and three gates ($\mathbf{f}, \mathbf{i}, \mathbf{o}$) so gradients flow additively
- ✅ Cell update: $\mathbf{c}_t = \mathbf{f}_t \odot \mathbf{c}_{t-1} + \mathbf{i}_t \odot \tilde{\mathbf{c}}_t$
- ✅ GRU merges into update + reset gates with fewer parameters
- ✅ Stack RNN layers for complex patterns
- ✅ Use Bidirectional when full context is available
- ✅ Embedding layer converts text to dense vectors

**Phase 4 Complete!** You now understand ML fundamentals from math to deep learning.
