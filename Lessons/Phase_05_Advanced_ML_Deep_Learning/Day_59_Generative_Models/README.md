---
day: 59
title: "Generative Models"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "generative-models"
duration: 55
difficulty: "advanced"
tags: [deep-learning, gan, vae, generation]
concepts: [GANs, VAEs, diffusion models, image generation]
prerequisites: [46, 47]
outcomes: [Understand generative architectures, Build simple GANs, Know modern approaches]
---

# 🎯 Day 59: Generative Models

> *"Creating new data that looks real. Art, images, text."*

---

## The Technical Deep Dive

### GAN Architecture

```
Generator: Random noise → Fake images
Discriminator: Real/Fake → Classification

Training: Generator fools Discriminator
          Discriminator catches fakes
          Both improve together
```

### Simple GAN

```python
from tensorflow.keras.layers import Dense, LeakyReLU, Reshape, Flatten
from tensorflow.keras.models import Sequential

# Generator
generator = Sequential([
    Dense(128, input_dim=100),
    LeakyReLU(0.2),
    Dense(784, activation="tanh"),
    Reshape((28, 28, 1))
])

# Discriminator
discriminator = Sequential([
    Flatten(input_shape=(28, 28, 1)),
    Dense(128),
    LeakyReLU(0.2),
    Dense(1, activation="sigmoid")
])
```

### Modern Approaches

- **Diffusion Models**: Stable Diffusion, DALL-E
- **Large Language Models**: GPT-4, Claude, Llama

---

## Summary

- ✅ GANs: generator vs discriminator game
- ✅ VAEs: probabilistic generation
- ✅ Diffusion: noise → image

**Tomorrow**: Graph and Geometric Learning.
