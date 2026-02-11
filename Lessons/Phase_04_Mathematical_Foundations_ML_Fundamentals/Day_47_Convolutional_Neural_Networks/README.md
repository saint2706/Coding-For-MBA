---
day: 47
title: "Convolutional Neural Networks"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "cnn-intro"
duration: 60
difficulty: "intermediate"
tags:
  - deep-learning
  - cnn
  - computer-vision
  - keras
concepts:
  - "convolution operation"
  - "pooling layers"
  - "feature maps"
  - "image classification"
prerequisites: [46]
outcomes:
  - "Understand how CNNs process images"
  - "Build CNNs for image classification"
  - "Apply data augmentation"
  - "Use transfer learning"
---

# 🎯 Day 47: Convolutional Neural Networks

> *"CNNs see the world through sliding windows—detecting edges, shapes, then objects."*

---

## The "Never-Coded" Bridge

**Imagine identifying a cat in a photo.** You don't look at individual pixels—you notice edges, then shapes (ears, whiskers), then the whole cat. CNNs work the same way: early layers detect edges, middle layers detect parts, final layers detect objects.

**CNNs in action:**

- **iPhone/Android**: Face unlock
- **Instagram**: Filter effects
- **Tesla**: Object detection
- **Medical imaging**: Tumor detection
- **Agriculture**: Crop disease identification

---

## The Technical Deep Dive

### The Convolution Operation

```python
import numpy as np
import matplotlib.pyplot as plt

# Simple 2D convolution demonstration
image = np.array([
    [100, 100, 100, 0, 0],
    [100, 100, 100, 0, 0],
    [100, 100, 100, 0, 0],
    [100, 100, 100, 0, 0],
    [100, 100, 100, 0, 0]
], dtype=float)

# Edge detection filter
edge_filter = np.array([
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1]
])

# Manual convolution
def convolve2d(image, kernel):
    h, w = image.shape
    kh, kw = kernel.shape
    output = np.zeros((h - kh + 1, w - kw + 1))
    
    for i in range(output.shape[0]):
        for j in range(output.shape[1]):
            output[i, j] = np.sum(image[i:i+kh, j:j+kw] * kernel)
    return output

result = convolve2d(image, edge_filter)

fig, axes = plt.subplots(1, 3, figsize=(12, 4))
axes[0].imshow(image, cmap='gray')
axes[0].set_title('Original Image')
axes[1].imshow(edge_filter, cmap='RdBu')
axes[1].set_title('Edge Filter')
axes[2].imshow(result, cmap='gray')
axes[2].set_title('After Convolution')
plt.tight_layout()
plt.show()

print("Edge detected! Notice the strong response at the edge.")
```

### Building a CNN with Keras

```python
from tensorflow import keras
from tensorflow.keras import layers

# CNN for image classification (e.g., MNIST digits)
model = keras.Sequential([
    # Convolutional layers: extract features
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
    layers.MaxPooling2D((2, 2)),
    
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    
    layers.Conv2D(64, (3, 3), activation='relu'),
    
    # Dense layers: classify
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')  # 10 digit classes
])

model.summary()

# Compile
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)
```

### Training on MNIST

```python
# Load and prepare MNIST
from tensorflow.keras.datasets import mnist

(X_train, y_train), (X_test, y_test) = mnist.load_data()

# Normalize and reshape
X_train = X_train.reshape(-1, 28, 28, 1).astype('float32') / 255
X_test = X_test.reshape(-1, 28, 28, 1).astype('float32') / 255

print(f"Training samples: {X_train.shape}")
print(f"Test samples: {X_test.shape}")

# Train
history = model.fit(
    X_train, y_train,
    epochs=5,
    batch_size=64,
    validation_split=0.1,
    verbose=1
)

# Evaluate
test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"\nTest accuracy: {test_acc:.3f}")
```

### Understanding CNN Layers

```python
"""
CNN Architecture:

INPUT (28, 28, 1)
    ↓
Conv2D(32 filters, 3×3) → 32 feature maps (26, 26, 32)
    ↓
MaxPooling2D(2×2) → Reduce spatial size (13, 13, 32)
    ↓
Conv2D(64 filters, 3×3) → 64 feature maps (11, 11, 64)
    ↓
MaxPooling2D(2×2) → (5, 5, 64)
    ↓
Flatten → 1600 values
    ↓
Dense(64) → 64 values
    ↓
Dense(10) → 10 class probabilities (softmax)
"""

# Visualize what filters learn
first_layer_weights = model.layers[0].get_weights()[0]
print(f"First conv layer: {first_layer_weights.shape}")
# Shape: (3, 3, 1, 32) = 32 filters of size 3×3

# Plot some filters
fig, axes = plt.subplots(4, 8, figsize=(10, 5))
for i, ax in enumerate(axes.flatten()):
    ax.imshow(first_layer_weights[:, :, 0, i], cmap='gray')
    ax.axis('off')
plt.suptitle('First Layer Filters (Edge Detectors)')
plt.tight_layout()
plt.show()
```

### Data Augmentation

```python
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Augmentation increases effective training data
datagen = ImageDataGenerator(
    rotation_range=10,        # Random rotation
    width_shift_range=0.1,    # Horizontal shift
    height_shift_range=0.1,   # Vertical shift
    zoom_range=0.1,           # Random zoom
    horizontal_flip=True      # For non-digit images
)

# Example: augment a single image
sample = X_train[0].reshape(1, 28, 28, 1)
aug_iter = datagen.flow(sample, batch_size=1)

fig, axes = plt.subplots(2, 5, figsize=(10, 4))
for i, ax in enumerate(axes.flatten()):
    augmented = next(aug_iter)[0].reshape(28, 28)
    ax.imshow(augmented, cmap='gray')
    ax.axis('off')
plt.suptitle('Data Augmentation Examples')
plt.tight_layout()
plt.show()
```

### Transfer Learning

```python
from tensorflow.keras.applications import VGG16

# Load pre-trained model (trained on ImageNet)
base_model = VGG16(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
base_model.trainable = False  # Freeze weights

# Add custom classification head
model_transfer = keras.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(10, activation='softmax')  # Your classes
])

print(f"Base model layers: {len(base_model.layers)}")
print(f"Total parameters: {model_transfer.count_params():,}")
print(f"Trainable parameters: {sum(np.prod(w.shape) for w in model_transfer.trainable_weights):,}")
```

---

## Senior-Level Insights

### CNN Architecture Choices

| Component       | Options                 | Use Case                                               |
| --------------- | ----------------------- | ------------------------------------------------------ |
| **Filter size** | 3×3 (default), 5×5, 7×7 | Smaller = more layers, larger = bigger receptive field |
| **Stride**      | 1 (default), 2          | 2 = downsample without pooling                         |
| **Padding**     | 'valid', 'same'         | 'same' preserves dimensions                            |
| **Pooling**     | Max (default), Average  | Max for classification, Avg for regression             |

### When to Use Transfer Learning

| Scenario                        | Strategy                            |
| ------------------------------- | ----------------------------------- |
| Small dataset, similar domain   | Freeze base, train head only        |
| Small dataset, different domain | Fine-tune last few layers           |
| Large dataset                   | Train from scratch or fine-tune all |

---

## Hands-on Lab

### Exercise 1: MNIST Classification

```python
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.datasets import mnist

(X_train, y_train), (X_test, y_test) = mnist.load_data()
X_train = X_train.reshape(-1, 28, 28, 1).astype('float32') / 255
X_test = X_test.reshape(-1, 28, 28, 1).astype('float32') / 255

model = keras.Sequential([
    layers.Conv2D(32, 3, activation='relu', input_shape=(28, 28, 1)),
    layers.MaxPooling2D(2),
    layers.Conv2D(64, 3, activation='relu'),
    layers.MaxPooling2D(2),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(10, activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(X_train, y_train, epochs=5, validation_split=0.1, verbose=1)
print(f"Test accuracy: {model.evaluate(X_test, y_test, verbose=0)[1]:.3f}")
```

### Exercise 2: Visualizing Predictions

```python
import matplotlib.pyplot as plt

# Predictions
predictions = model.predict(X_test[:25])
pred_classes = predictions.argmax(axis=1)

# Visualize
fig, axes = plt.subplots(5, 5, figsize=(10, 10))
for i, ax in enumerate(axes.flatten()):
    ax.imshow(X_test[i].reshape(28, 28), cmap='gray')
    color = 'green' if pred_classes[i] == y_test[i] else 'red'
    ax.set_title(f'Pred: {pred_classes[i]}', color=color)
    ax.axis('off')
plt.tight_layout()
plt.show()
```

### Exercise 3: Architecture Comparison

```python
architectures = [
    ([32], []),             # Simple
    ([32, 64], []),         # Medium
    ([32, 64, 64], [128]),  # Deep
]

for conv_layers, dense_layers in architectures:
    model = keras.Sequential()
    model.add(layers.Conv2D(conv_layers[0], 3, activation='relu', input_shape=(28, 28, 1)))
    model.add(layers.MaxPooling2D(2))
    
    for filters in conv_layers[1:]:
        model.add(layers.Conv2D(filters, 3, activation='relu'))
        model.add(layers.MaxPooling2D(2))
    
    model.add(layers.Flatten())
    for units in dense_layers:
        model.add(layers.Dense(units, activation='relu'))
    model.add(layers.Dense(10, activation='softmax'))
    
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    model.fit(X_train, y_train, epochs=3, verbose=0)
    acc = model.evaluate(X_test, y_test, verbose=0)[1]
    print(f"Conv: {conv_layers}, Dense: {dense_layers}, Accuracy: {acc:.3f}")
```

---

## Mastery Check

### Question 1: Why Convolutions?

Why use convolution instead of fully connected layers for images?

<details>
<summary>Answer</summary>

**Parameter sharing and spatial invariance.**

- Fully connected: 28×28 image = 784 inputs × 1000 neurons = 784,000 weights
- Conv layer: 32 filters × 3×3 = 288 weights

Convolutions detect patterns regardless of location (a cat in any corner).

</details>

### Question 2: Pooling Purpose

What does MaxPooling2D(2,2) do and why use it?

<details>
<summary>Answer</summary>

Takes maximum value in each 2×2 region, reducing dimensions by half. Benefits:

- Reduces computation
- Provides translation invariance
- Increases receptive field

</details>

### Question 3: Input Shape

Why reshape MNIST to (28, 28, 1) instead of (28, 28)?

<details>
<summary>Answer</summary>

CNNs expect (height, width, channels). The **1** indicates grayscale (1 channel). Color images use (height, width, 3) for RGB.

</details>

### Question 4: Transfer Learning

When would you freeze the base model vs fine-tune it?

<details>
<summary>Answer</summary>

- **Freeze**: Small dataset, similar to ImageNet (natural images)
- **Fine-tune**: Larger dataset or different domain (medical images, satellite)

Start frozen, then unfreeze if accuracy plateaus.

</details>

### Question 5: Data Augmentation

Why does augmentation help CNN performance?

<details>
<summary>Answer</summary>

Creates variations (rotated, shifted) the model hasn't seen. Prevents memorization, improves generalization—especially with small datasets.

</details>

---

## Summary

- ✅ CNNs use sliding filters to detect spatial patterns
- ✅ Early layers detect edges, deeper layers detect objects
- ✅ Pooling reduces dimensions and adds invariance
- ✅ Data augmentation prevents overfitting
- ✅ Transfer learning leverages pre-trained models

**Tomorrow**: Recurrent Neural Networks for sequential data.
