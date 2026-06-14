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

> **RetailCo Vision Thread**: RetailCo needs to classify product images to automate their catalog (5 categories). The same model structure you learn on MNIST (Conv → Pool → Dense → Softmax) maps directly to this problem — swap MNIST's 10 digit classes for RetailCo's 5 product categories, and MNIST's 28×28 grayscale for RetailCo's 224×224 RGB images. The transfer learning section later in this lesson will show exactly how to adapt a pretrained model to RetailCo's catalog.

---

## The Technical Deep Dive

### CNN Fundamentals: Key Terms

| Term | Definition | Example |
|------|-----------|---------|
| **Channel** | Depth dimension of an image tensor. Grayscale: 1 channel. RGB: 3 channels. After conv layers: many channels (feature maps) | MNIST: (28, 28, 1); CIFAR-10: (32, 32, 3) |
| **Kernel / Filter** | A small weight matrix that slides across the image detecting a pattern | A 3×3 kernel detecting edges looks like [[-1,-1,-1],[0,0,0],[1,1,1]] |
| **Stride** | How many pixels the filter moves per step. Stride=1: shift by 1 pixel. Stride=2: downsample 2× | Stride=2 halves spatial dimensions without pooling |
| **Padding** | Adding zeros around the input so the output matches input size. `padding='same'` keeps dimensions | Without padding, a 3×3 kernel on 28×28 gives 26×26 output |
| **Receptive field** | The region of the input image that influences one output neuron. Grows with depth | After 3 conv layers with 3×3 kernels, each neuron "sees" a 7×7 patch of the input |
| **Feature map** | The output of applying one filter to the input — one per filter | Conv2D(32, (3,3)) produces 32 feature maps |
| **Pooling** | Downsampling operation. MaxPool takes the maximum value in each window | MaxPool(2×2): halves height and width, doubles effective receptive field |
| **Translation equivariance** | If the object shifts in the image, the feature map shifts accordingly — but the convolution detects it regardless of position | A cat in the top-left vs bottom-right: same filters fire |

**Visualizing shapes through a CNN:**
```
Input:          (batch, 28, 28, 1)    ← 28×28 grayscale image
Conv2D(32, 3):  (batch, 26, 26, 32)  ← 32 filters, no padding, 26=(28-3+1)
MaxPool(2):     (batch, 13, 13, 32)  ← halved spatial dims
Conv2D(64, 3):  (batch, 11, 11, 64)  ← 64 filters
MaxPool(2):     (batch, 5, 5, 64)    ← halved again
Flatten:        (batch, 1600)          ← 5×5×64 = 1600
Dense(128):     (batch, 128)
Dense(10):      (batch, 10)           ← 10 classes (digits 0-9)
```

### The Convolution Operation

The 2D **discrete convolution** of an input image $I$ with a kernel $K$ of shape $k_h \times k_w$ slides $K$ over $I$ and computes a weighted sum at every position. For an output pixel at $(i, j)$:

$$
S(i, j) = (I * K)(i, j) = \sum_{m=0}^{k_h - 1} \sum_{n=0}^{k_w - 1} I(i + m,\, j + n) \, K(m, n)
$$

For a colour input with $C$ channels and $F$ filters, each filter has shape $k_h \times k_w \times C$ and the layer output has $F$ channels:

$$
S_f(i, j) = \sum_{c=1}^{C} \sum_{m=0}^{k_h - 1} \sum_{n=0}^{k_w - 1} I_c(i + m,\, j + n) \, K^{(f)}_c(m, n) + b_f
$$

Given input size $H \times W$, kernel size $k$, stride $s$, and padding $p$, the **output spatial size** is:

$$
H_{\text{out}} = \left\lfloor \frac{H + 2p - k}{s} \right\rfloor + 1, \qquad
W_{\text{out}} = \left\lfloor \frac{W + 2p - k}{s} \right\rfloor + 1
$$

A **max-pooling** layer with $p \times p$ window and stride $s$ takes the maximum over each window:

$$
\text{MaxPool}(I)(i, j) = \max_{0 \le m, n < p} I\big(s i + m,\, s j + n\big)
$$


```python
import numpy as np
import matplotlib.pyplot as plt

# Simple 2D convolution demonstration
image = np.array(
    [
        [100, 100, 100, 0, 0],
        [100, 100, 100, 0, 0],
        [100, 100, 100, 0, 0],
        [100, 100, 100, 0, 0],
        [100, 100, 100, 0, 0],
    ],
    dtype=float,
)

# Edge detection filter
edge_filter = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]])


# Manual convolution
def convolve2d(image, kernel):
    h, w = image.shape
    kh, kw = kernel.shape
    output = np.zeros((h - kh + 1, w - kw + 1))

    for i in range(output.shape[0]):
        for j in range(output.shape[1]):
            output[i, j] = np.sum(image[i : i + kh, j : j + kw] * kernel)
    return output


result = convolve2d(image, edge_filter)

fig, axes = plt.subplots(1, 3, figsize=(12, 4))
axes[0].imshow(image, cmap="gray")
axes[0].set_title("Original Image")
axes[1].imshow(edge_filter, cmap="RdBu")
axes[1].set_title("Edge Filter")
axes[2].imshow(result, cmap="gray")
axes[2].set_title("After Convolution")
plt.tight_layout()
plt.show()

print("Edge detected! Notice the strong response at the edge.")
```

### Building a CNN with Keras

```python
from tensorflow import keras
from tensorflow.keras import layers

# CNN for image classification (e.g., MNIST digits)
model = keras.Sequential(
    [
        # Convolutional layers: extract features
        layers.Conv2D(32, (3, 3), activation="relu", input_shape=(28, 28, 1)),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation="relu"),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation="relu"),
        # Dense layers: classify
        layers.Flatten(),
        layers.Dense(64, activation="relu"),
        layers.Dense(10, activation="softmax"),  # 10 digit classes
    ]
)

model.summary()

# Compile
model.compile(
    optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"]
)
```

#### Why These Architectural Choices?

**Why 3×3 kernels?**
- Two 3×3 layers have the same receptive field as one 5×5 layer, but with fewer parameters: 2×(9) = 18 vs 25.
- 3×3 is the smallest kernel that can capture 2D spatial context.
- VGG, ResNet, and most modern architectures use only 3×3 convolutions.

**Why 32 filters in first layer, 64 in second?**
- Deeper layers should detect more complex patterns → need more filter capacity.
- Convention: double filters each time you halve spatial resolution (maintains total computation).
- 32 filters capture low-level features (edges, textures); 64 capture mid-level (shapes, curves).

**Why MaxPooling instead of strided convolution?**
- MaxPooling adds translation invariance: the exact position of a feature doesn't matter.
- It aggressively downsamples, reducing computation significantly.
- Alternative: strided convolution (stride=2) is learned — often preferred in modern architectures.

**Why batch normalization after conv layers?**
- Normalizes feature map distributions across the batch.
- Allows higher learning rates, faster convergence.
- Acts as mild regularization.

**Why these epoch counts?**
- MNIST converges quickly (~10 epochs with batch norm, ~20 without).
- Complex datasets (CIFAR-100, ImageNet) may need 100–300 epochs.
- Always use EarlyStopping to avoid over- or under-training.

**How choices affect shape, compute, and accuracy:**
```python
# Measure parameter counts and training time for different configs
from tensorflow.keras.utils import plot_model

# Small: 32 filters
model_small = build_cnn(filters=[32, 64], dense=128)
print(f"Small params: {model_small.count_params():,}")  # ~200k

# Medium: 64 filters  
model_medium = build_cnn(filters=[64, 128], dense=256)
print(f"Medium params: {model_medium.count_params():,}")  # ~800k

# Accuracy typically improves 2–5% with medium vs small for simple datasets
```

### Training on MNIST

```python
# Load and prepare MNIST
from tensorflow.keras.datasets import mnist

(X_train, y_train), (X_test, y_test) = mnist.load_data()

# Normalize and reshape
X_train = X_train.reshape(-1, 28, 28, 1).astype("float32") / 255
X_test = X_test.reshape(-1, 28, 28, 1).astype("float32") / 255

print(f"Training samples: {X_train.shape}")
print(f"Test samples: {X_test.shape}")

# Train
history = model.fit(
    X_train, y_train, epochs=5, batch_size=64, validation_split=0.1, verbose=1
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
    ax.imshow(first_layer_weights[:, :, 0, i], cmap="gray")
    ax.axis("off")
plt.suptitle("First Layer Filters (Edge Detectors)")
plt.tight_layout()
plt.show()
```

### Data Augmentation

```python
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Augmentation increases effective training data
datagen = ImageDataGenerator(
    rotation_range=10,  # Random rotation
    width_shift_range=0.1,  # Horizontal shift
    height_shift_range=0.1,  # Vertical shift
    zoom_range=0.1,  # Random zoom
    horizontal_flip=True,  # For non-digit images
)

# Example: augment a single image
sample = X_train[0].reshape(1, 28, 28, 1)
aug_iter = datagen.flow(sample, batch_size=1)

fig, axes = plt.subplots(2, 5, figsize=(10, 4))
for i, ax in enumerate(axes.flatten()):
    augmented = next(aug_iter)[0].reshape(28, 28)
    ax.imshow(augmented, cmap="gray")
    ax.axis("off")
plt.suptitle("Data Augmentation Examples")
plt.tight_layout()
plt.show()
```

### Transfer Learning

```python
from tensorflow.keras.applications import VGG16

# Load pre-trained model (trained on ImageNet)
base_model = VGG16(weights="imagenet", include_top=False, input_shape=(224, 224, 3))
base_model.trainable = False  # Freeze weights

# Add custom classification head
model_transfer = keras.Sequential(
    [
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(256, activation="relu"),
        layers.Dropout(0.5),
        layers.Dense(10, activation="softmax"),  # Your classes
    ]
)

print(f"Base model layers: {len(base_model.layers)}")
print(f"Total parameters: {model_transfer.count_params():,}")
print(
    f"Trainable parameters: {sum(np.prod(w.shape) for w in model_transfer.trainable_weights):,}"
)
```

### Advanced CNN Topics

**Class Imbalance in Image Classification**
Image datasets are often imbalanced. Solutions:
```python
# Class weights
class_weight = {0: 1.0, 1: 5.0, 2: 2.0}  # Upweight rare classes
model.fit(X_train, y_train, class_weight=class_weight)

# Per-class sample generation
from tensorflow.keras.preprocessing.image import ImageDataGenerator
datagen = ImageDataGenerator(rotation_range=10, horizontal_flip=True)
```

**Data Augmentation: When It's Valid**
Augmentation creates synthetic training examples by transforming existing images. Each augmentation must be semantically valid:
- ✅ Horizontal flip: Valid for most objects (dogs, products, scenes)
- ❌ Horizontal flip: Invalid for text, digits (6 becomes 9), medical imaging (left/right matters)
- ✅ Small rotations (< 15°): Usually valid
- ❌ Large rotations: Invalid for objects with strong orientation
- ✅ Brightness/contrast: Valid unless exact color is the feature

**Transfer Learning and Fine-Tuning Strategy**
```python
# Stage 1: Feature extraction (freeze pretrained backbone)
base_model = MobileNetV2(include_top=False, weights='imagenet', input_shape=(224,224,3))
base_model.trainable = False  # Freeze all pretrained layers

# Stage 2: Fine-tuning (unfreeze top layers, use very small lr)
base_model.trainable = True
for layer in base_model.layers[:-20]:  # Keep early layers frozen
    layer.trainable = False
model.compile(optimizer=Adam(1e-5))  # Very small lr to avoid destroying pretrained features
```

**Image Leakage and Near-Duplicates**
If the same physical object appears in both train and test (e.g., different photos of the same product), the model memorizes it — creating a form of leakage. Always:
- Deduplicate by image hash before splitting
- Split by object/subject ID if multiple images per object exist

**Vision Transformers (ViT) — A Modern Alternative**
CNNs assume local patterns (nearby pixels relate). Vision Transformers (ViT) treat image patches as sequences and use self-attention:
- **Advantage**: Captures long-range dependencies; scales better with very large datasets
- **Disadvantage**: Needs much more data to train from scratch; pre-trained ViTs available via Hugging Face
- **When to use**: Large dataset (> 1M images) or when using pretrained ViT checkpoints
- **Current best practice**: For image classification tasks with < 100k images, pretrained CNN (EfficientNet, MobileNetV2) still outperforms ViT

```python
# Using a pretrained ViT via Hugging Face
from transformers import ViTForImageClassification
model = ViTForImageClassification.from_pretrained('google/vit-base-patch16-224')
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

### Senior-Level CNN Considerations

**Dataset Licensing and Privacy**
- ImageNet, COCO, and common datasets have usage licenses — check before commercial deployment
- If training on customer images (face recognition, medical imaging), ensure privacy compliance (GDPR, HIPAA)
- Never scrape images for training without verifying licensing

**Subgroup Performance**
CV models routinely underperform for underrepresented groups. Always audit:
```python
for demographic in ['age_group', 'skin_tone', 'region']:
    for group in test_df[demographic].unique():
        mask = test_df[demographic] == group
        acc = accuracy_score(y_test[mask], y_pred[mask])
        print(f"{demographic}={group}: accuracy={acc:.3f} (n={mask.sum()})")
```

**Adversarial Robustness**
CNN predictions can be fooled by imperceptible pixel perturbations (adversarial examples):
- A panda misclassified as a gibbon with 99.9% confidence after adding ε noise
- For business-critical applications (medical, security), test adversarial robustness before deployment

**Domain Shift**
A model trained on studio product photos will fail on customer-submitted phone photos. Domain shift is the most common cause of production CV model failure:
- Collect real production images during deployment
- Periodically retrain on production data distribution
- Monitor confidence score distributions — sharp drops indicate domain shift

**Model Size and Latency**
| Model | Params | Top-1 ImageNet Acc | Inference (CPU) | Use Case |
|-------|--------|-------------------|----------------|---------|
| MobileNetV2 | 3.4M | 72.0% | ~50ms | Mobile/edge |
| EfficientNet-B0 | 5.3M | 77.1% | ~60ms | Balanced |
| EfficientNet-B4 | 19M | 82.9% | ~200ms | High accuracy |
| ViT-Base | 86M | 81.8% | ~300ms | Research/large scale |

**Human Review Workflows**
For high-stakes image decisions (medical, financial, legal):
- Route low-confidence predictions (score between 0.4–0.6) to human review
- Track human override rate — if > 20%, model needs retraining

---

## Hands-on Lab

### Exercise 1: MNIST Classification

**Business Scenario:** A bank's mail processing center scans thousands of handwritten deposit forms daily. You are building a digit recognition system to automatically read amounts, reducing manual data entry by 80%.

**Goal:** Build a CNN that achieves > 98% test accuracy on digit classification; analyze errors.

**Tasks:**
1. Establish a non-CNN baseline: train a Logistic Regression on flattened 28×28 pixels
2. Build a CNN with Conv2D(32, 3) → MaxPool → Conv2D(64, 3) → MaxPool → Dense(128) → Dense(10, softmax)
3. Train for 20 epochs with EarlyStopping and validation_split=0.1
4. Plot training/validation accuracy curves
5. Generate confusion matrix; identify which digit pairs are most confused
6. Compute: at what accuracy does this system become viable? (Error rate must be < 1% to beat manual entry with 99% accuracy)

**Expected Output:**
Logistic Regression baseline test accuracy: ~0.925 (92.5%)
CNN test accuracy: ~0.990–0.993 (99.0–99.3%)
Early stopping triggered at: ~12–15 epochs

Confusion Matrix: Most confusions are typically:
- 4 vs 9 (similar upper portions)
- 3 vs 8 (similar curves)
- 7 vs 1 (style-dependent)

Business Viability: CNN at 99.2% error rate (0.8%) — better than 1% threshold. Viable for deployment.

```python
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.datasets import mnist

(X_train, y_train), (X_test, y_test) = mnist.load_data()
X_train = X_train.reshape(-1, 28, 28, 1).astype("float32") / 255
X_test = X_test.reshape(-1, 28, 28, 1).astype("float32") / 255

model = keras.Sequential(
    [
        layers.Conv2D(32, 3, activation="relu", input_shape=(28, 28, 1)),
        layers.MaxPooling2D(2),
        layers.Conv2D(64, 3, activation="relu"),
        layers.MaxPooling2D(2),
        layers.Flatten(),
        layers.Dense(128, activation="relu"),
        layers.Dropout(0.5),
        layers.Dense(10, activation="softmax"),
    ]
)

model.compile(
    optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"]
)
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
    ax.imshow(X_test[i].reshape(28, 28), cmap="gray")
    color = "green" if pred_classes[i] == y_test[i] else "red"
    ax.set_title(f"Pred: {pred_classes[i]}", color=color)
    ax.axis("off")
plt.tight_layout()
plt.show()
```

### Exercise 3: Architecture Comparison

```python
architectures = [
    ([32], []),  # Simple
    ([32, 64], []),  # Medium
    ([32, 64, 64], [128]),  # Deep
]

for conv_layers, dense_layers in architectures:
    model = keras.Sequential()
    model.add(
        layers.Conv2D(conv_layers[0], 3, activation="relu", input_shape=(28, 28, 1))
    )
    model.add(layers.MaxPooling2D(2))

    for filters in conv_layers[1:]:
        model.add(layers.Conv2D(filters, 3, activation="relu"))
        model.add(layers.MaxPooling2D(2))

    model.add(layers.Flatten())
    for units in dense_layers:
        model.add(layers.Dense(units, activation="relu"))
    model.add(layers.Dense(10, activation="softmax"))

    model.compile(
        optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"]
    )
    model.fit(X_train, y_train, epochs=3, verbose=0)
    acc = model.evaluate(X_test, y_test, verbose=0)[1]
    print(f"Conv: {conv_layers}, Dense: {dense_layers}, Accuracy: {acc:.3f}")
```

### Exercise 4: Transfer Learning Lab

**Business Scenario:** RetailCo wants to classify product images into 5 categories (Electronics, Clothing, Home, Books, Sports) to automate their online catalog. You have only 2,000 labeled images.

**Goal:** Use transfer learning to achieve > 85% accuracy with limited data.

**Tasks:**
1. Load MobileNetV2 pretrained on ImageNet; freeze all layers
2. Add a classification head: GlobalAveragePooling → Dense(256, relu) → Dense(5, softmax)
3. Train the head for 20 epochs; report accuracy
4. Fine-tune: unfreeze top 20 layers of MobileNetV2; train with lr=1e-5 for 10 more epochs
5. Compare frozen vs fine-tuned accuracy; explain why fine-tuning requires lower learning rate

**Expected Output:**
Frozen base accuracy: ~0.78 (78%) — ImageNet features partially transfer
After fine-tuning: ~0.87–0.91 (87–91%)
Fine-tuning reason: Top layers adapted to retail-specific visual patterns; low lr prevents destroying pretrained weights

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

- ✅ Convolution: $S(i, j) = \sum_{m, n} I(i + m, j + n) K(m, n)$ slides filters over the input
- ✅ Output size: $H_{\text{out}} = \lfloor (H + 2p - k)/s \rfloor + 1$
- ✅ Early layers detect edges, deeper layers detect objects
- ✅ Pooling reduces dimensions and adds spatial invariance
- ✅ Data augmentation expands effective dataset and prevents overfitting
- ✅ Transfer learning leverages pre-trained models

**Tomorrow**: Recurrent Neural Networks for sequential data.
