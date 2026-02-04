---
title: "Day 47: Convolutional Neural Networks (CNNs) for Computer Vision"
tags:
  - ML
---

# Day 47: Convolutional Neural Networks (CNNs) for Computer Vision

Welcome to Day 47! Today, we dive into **Convolutional Neural Networks (CNNs)**, a specialized type
of neural network that has revolutionized the field of **Computer Vision**.

> **Prerequisites:** Ensure TensorFlow is installed with `pip install tensorflow` (CPU build by
> default; use TensorFlow's GPU installation guide if you have compatible hardware). Need to review
> package installation basics? Revisit the Day 20 Python Package Manager lesson.

## Key Concepts

### What are CNNs?

CNNs are designed to automatically and adaptively learn spatial hierarchies of features from images.
Unlike standard neural networks, which treat inputs as flat vectors, CNNs preserve the spatial
relationship between pixels.

### Core Components of a CNN

1. **Convolutional Layer (`Conv2D`)**
   - This is the main building block of a CNN. It uses **filters** (or kernels) to slide over the
     input image and perform a convolution operation.
   - This process creates **feature maps** that highlight specific patterns like edges, corners, or
     textures in the image. The network learns the optimal values for these filters during training.

1. **Pooling Layer (`MaxPooling2D`)**
   - The pooling layer is used to downsample the feature maps, reducing their spatial dimensions.
   - This reduces the number of parameters and computation in the network, helping to control
     overfitting.
   - **Max Pooling** is the most common type, where a filter slides over the feature map and takes
     the maximum value from each region.

1. **Flatten Layer**
   - After the convolutional and pooling layers have extracted features, the resulting
     multi-dimensional feature maps are flattened into a single one-dimensional vector.
   - This vector is then fed into a standard fully connected neural network (like the one from Day
     46\) for classification.

### A Typical CNN Architecture

A common CNN architecture consists of a stack of `Conv2D` and `MaxPooling2D` layers, followed by one
or more `Dense` layers for classification.

1. **Input Image**
1. **\[Conv2D -> ReLU Activation -> MaxPooling2D\]** (This block can be repeated multiple times)
1. **Flatten Layer**
1. **Dense Layer (with ReLU)**
1. **Output Dense Layer (with Softmax for classification)**

---

## Practice Exercise

- The `solutions.py` module now exports granular helpers (`prepare_mnist_data`, `build_cnn_model`,
  `train_cnn_model`, etc.) so you can mix and match pieces in notebooks or tests without kicking off
  a full five-epoch training run on import.
- The code covers:
  1. Loading and preprocessing the MNIST image data. (Images are normalized to be between 0 and 1).
  1. Building a sequential CNN model with `Conv2D`, `MaxPooling2D`, `Flatten`, and `Dense` layers.
  1. Compiling and training the CNN.
  1. Evaluating its performance on the test set. A well-trained CNN can achieve very high accuracy
     on this task.

### Running the example and tests

- For the full demonstration run `python Day_47_Convolutional_Neural_Networks/solutions.py`. Expect
  a few epochs of training output plus the final metrics.
- To verify the pipeline quickly (and without downloading the entire MNIST dataset), use the short
  smoke test: `pytest tests/test_day_47.py`. The test swaps in a tiny synthetic dataset and trains
  for a single epoch.
- CNN training benefits from GPU acceleration. TensorFlow will automatically use your GPU if the
  drivers and CUDA/cuDNN stack are configured; otherwise the CPU-only run will simply take longer.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 46 – Day 46: Introduction to Neural Networks & Frameworks](../Day_46_Intro_to_Neural_Networks/README.md) • **Next:** [Day 48 – Day 48: Recurrent Neural Networks (RNNs) for Sequence Data](../Day_48_Recurrent_Neural_Networks/README.md)

_You are on lesson 47 of 108._

<!-- LESSON_FOOTER_END -->
