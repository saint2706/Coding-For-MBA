---
title: 'Day 46: Introduction to Neural Networks & Frameworks'
tags:
- ML
- Python
---
# Day 46: Introduction to Neural Networks & Frameworks

Welcome to Day 46! Today, we begin our exploration of **Deep Learning** by introducing the
fundamental building block: the **Artificial Neural Network (ANN)**. We'll also discuss the major
frameworks used to build these powerful models.

> **Prerequisites:** Install TensorFlow with `pip install tensorflow` to run today's neural-network
> examples (this installs the CPU build; GPU acceleration requires following TensorFlow's CUDA
> setup). You'll also need scikit-learn for data prep with `pip install scikit-learn`. Need a
> refresher on using `pip`? Revisit the Day 20 Python Package Manager lesson.

## Key Concepts

### What is a Neural Network?

An Artificial Neural Network is a computational model inspired by the structure and function of the
human brain. It consists of interconnected nodes, called **neurons**, organized in layers.

### Structure of a Neural Network

1. **Input Layer:** Receives the initial data or features. The number of neurons in this layer
   corresponds to the number of features in the dataset.

1. **Hidden Layers:** These are the intermediate layers between the input and output layers. A
   neural network can have zero or more hidden layers. A "deep" neural network has multiple hidden
   layers.

   - Each neuron in a hidden layer receives inputs from the previous layer, applies a mathematical
     operation (a weighted sum followed by an **activation function**), and passes the result to the
     next layer.

1. **Output Layer:** Produces the final result.

   - For a **regression** task, it might have a single neuron with a linear activation.
   - For a **classification** task, it might have multiple neurons (one for each class) with a
     softmax activation function to output probabilities.

### Activation Functions

Activation functions introduce non-linearity into the network, allowing it to learn complex
patterns. Without them, a neural network would just be a linear regression model.

- **Common Examples:**
  - **ReLU (Rectified Linear Unit):** `f(x) = max(0, x)`. The most widely used activation function.
  - **Sigmoid:** `f(x) = 1 / (1 + e^(-x))`. Used in the output layer for binary classification.
  - **Softmax:** Generalizes the sigmoid function for multi-class classification.

### How Neural Networks Learn

They learn through a process called **backpropagation** and **gradient descent**.

1. The network makes a prediction (forward pass).
1. The prediction error is calculated using a **loss function**.
1. The backpropagation algorithm calculates the gradient of the loss function with respect to the
   network's weights.
1. The weights are updated using gradient descent to minimize the error.

## Deep Learning Frameworks

Building neural networks from scratch is complex. We use specialized libraries to handle the heavy
lifting.

- **TensorFlow:** Developed by Google, it's a powerful and flexible ecosystem for machine learning.
  It's known for its production-readiness and scalability.
- **PyTorch:** Developed by Facebook's AI Research lab, it's known for its simplicity, ease of use,
  and Pythonic nature, making it a favorite in the research community.

______________________________________________________________________

## Practice Exercise

- The `solutions.py` module now exposes dedicated helper functions for each step of the workflow
  (data preparation, model construction, training, and evaluation). Import the pieces you need
  instead of running everything on import.
- The code covers:
  1. Loading and preparing the Iris dataset.
  1. Building a sequential model with dense (fully connected) layers.
  1. Compiling the model (specifying the optimizer, loss function, and metrics).
  1. Training the model.
  1. Evaluating its performance and making predictions.

### Running the example and tests

- Execute the full walkthrough from the command line with
  `python Day_46_Intro_to_Neural_Networks/solutions.py`. The script prints the data shapes, model
  summary, and evaluation metrics.
- Need a quick confidence check without the full 50-epoch run? The automated test performs a single,
  deterministic epoch: `pytest tests/test_day_46.py`.
- Training on GPU hardware is optional for this small dataset, but TensorFlow will automatically
  leverage your GPU if it's available and correctly configured.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 45 – Day 45: Feature Engineering & Model Evaluation](../Day_45_Feature_Engineering_and_Evaluation/README.md) • **Next:** [Day 47 – Day 47: Convolutional Neural Networks (CNNs) for Computer Vision](../Day_47_Convolutional_Neural_Networks/README.md)

_You are on lesson 46 of 108._

<!-- LESSON_FOOTER_END -->