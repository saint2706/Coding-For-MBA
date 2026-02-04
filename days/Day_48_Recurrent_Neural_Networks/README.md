---
title: 'Day 48: Recurrent Neural Networks (RNNs) for Sequence Data'
tags:
  - Data
  - ML
---

# Day 48: Recurrent Neural Networks (RNNs) for Sequence Data

Welcome to Day 48! Today, we explore **Recurrent Neural Networks (RNNs)**, a class of neural
networks designed specifically for handling **sequential data**, such as time series, text, or
audio.

> **Prerequisites:** Install TensorFlow with `pip install tensorflow` so you can build and train the
> RNN examples (CPU build by default; follow TensorFlow's GPU instructions if you have compatible
> hardware). Need to brush up on `pip` usage? Revisit the Day 20 Python Package Manager lesson.

## Key Concepts

### What are RNNs?

Unlike feedforward networks (like ANNs and CNNs), which process inputs independently, RNNs have
**loops** in them, allowing information to persist. This "memory" lets them use information from
prior inputs to influence the current input and output.

- **The Loop:** An RNN processes a sequence one element at a time. At each step, the output from the
  previous step is fed back as an input to the current step. This creates a hidden state that acts
  as a memory of the sequence seen so far.

### The Vanishing Gradient Problem

Simple RNNs struggle to learn long-range dependencies (patterns over long sequences). This is due to
the **vanishing gradient problem**, where the gradients used to update the network's weights become
very small during backpropagation, effectively stopping the learning process for earlier time steps.

### Advanced RNN Architectures

To solve this problem, more sophisticated RNN variants were developed:

1. **Long Short-Term Memory (LSTM)**

   - LSTMs are a special kind of RNN that are explicitly designed to avoid the long-term dependency
     problem.
   - They have a more complex internal structure called a **cell**, which includes three **gates**
     (forget, input, and output gates). These gates regulate the flow of information, allowing the
     network to remember or forget information over long periods.

1. **Gated Recurrent Unit (GRU)**

   - GRUs are a simplified version of LSTMs. They combine the forget and input gates into a single
     "update gate" and have fewer parameters.
   - They often perform similarly to LSTMs but are computationally more efficient.

### Typical RNN Architecture for Classification

1. **Input / Embedding Layer:** For text data, an `Embedding` layer is often used first to convert
   integer indices (representing words) into dense vectors.
1. **Recurrent Layer (LSTM or GRU):** This layer processes the sequence of vectors.
1. **Dense Layer:** A standard fully connected layer for classification.
1. **Output Layer:** Produces the final prediction.

______________________________________________________________________

## Practice Exercise

- The refactored `solutions.py` module exposes building blocks such as `prepare_imdb_data`,
  `build_rnn_model`, and `train_rnn_model`. Import what you need for notebooks or experiments;
  nothing trains automatically when the module is imported.
- The goal remains to classify IMDB reviews as `positive` or `negative`, and the workflow now
  mirrors the modular structure used for other deep-learning lessons.
- The code covers:
  1. Loading and preprocessing the IMDB text data. (Reviews are pre-processed into sequences of
     integers).
  1. Padding the sequences to ensure they all have the same length.
  1. Building a sequential model with an `Embedding` layer, an `LSTM` layer, and `Dense` layers.
  1. Compiling and training the RNN.
  1. Evaluating its performance on the test set.

### Running the example and tests

- Launch the full script with `python Day_48_Recurrent_Neural_Networks/solutions.py` to download
  IMDB, train the LSTM, and print evaluation metrics.
- For a very fast check, use `pytest tests/test_day_48.py`. The test stubs out the dataset loader
  with a handful of synthetic sequences and runs a single epoch so it finishes quickly.
- LSTM models benefit significantly from GPU acceleration. If you have CUDA/cuDNN configured,
  TensorFlow will pick it up automatically; otherwise the CPU execution path will still work (just
  slower).

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 47 – Day 47: Convolutional Neural Networks (CNNs) for Computer Vision](../Day_47_Convolutional_Neural_Networks/README.md) • **Next:** [Day 49 – Day 49: Natural Language Processing (NLP)](../Day_49_NLP/README.md)

_You are on lesson 48 of 108._

<!-- LESSON_FOOTER_END -->
