Welcome to Day 48! Today, we explore **Recurrent Neural Networks (RNNs)**, a class of neural networks designed specifically for handling **sequential data**, such as time series, text, or audio.

> **Prerequisites:** Install TensorFlow with `pip install tensorflow` so you can build and train the RNN examples (CPU build by default; follow TensorFlow's GPU instructions if you have compatible hardware). Need to brush up on `pip` usage? Revisit the Day 20 Python Package Manager lesson.

## Key Concepts

### What are RNNs?

Unlike feedforward networks (like ANNs and CNNs), which process inputs independently, RNNs have **loops** in them, allowing information to persist. This "memory" lets them use information from prior inputs to influence the current input and output.

- **The Loop:** An RNN processes a sequence one element at a time. At each step, the output from the previous step is fed back as an input to the current step. This creates a hidden state that acts as a memory of the sequence seen so far.

### The Vanishing Gradient Problem

Simple RNNs struggle to learn long-range dependencies (patterns over long sequences). This is due to the **vanishing gradient problem**, where the gradients used to update the network's weights become very small during backpropagation, effectively stopping the learning process for earlier time steps.

### Advanced RNN Architectures

To solve this problem, more sophisticated RNN variants were developed:

1. **Long Short-Term Memory (LSTM)**

   - LSTMs are a special kind of RNN that are explicitly designed to avoid the long-term dependency problem.
   - They have a more complex internal structure called a **cell**, which includes three **gates** (forget, input, and output gates). These gates regulate the flow of information, allowing the network to remember or forget information over long periods.

1. **Gated Recurrent Unit (GRU)**

   - GRUs are a simplified version of LSTMs. They combine the forget and input gates into a single "update gate" and have fewer parameters.
   - They often perform similarly to LSTMs but are computationally more efficient.

### Typical RNN Architecture for Classification

1. **Input / Embedding Layer:** For text data, an `Embedding` layer is often used first to convert integer indices (representing words) into dense vectors.
1. **Recurrent Layer (LSTM or GRU):** This layer processes the sequence of vectors.
1. **Dense Layer:** A standard fully connected layer for classification.
1. **Output Layer:** Produces the final prediction.

______________________________________________________________________

## Practice Exercise

- The refactored `solutions.py` module exposes building blocks such as `prepare_imdb_data`, `build_rnn_model`, and `train_rnn_model`. Import what you need for notebooks or experiments; nothing trains automatically when the module is imported.
- The goal remains to classify IMDB reviews as `positive` or `negative`, and the workflow now mirrors the modular structure used for other deep-learning lessons.
- The code covers:
  1. Loading and preprocessing the IMDB text data. (Reviews are pre-processed into sequences of integers).
  1. Padding the sequences to ensure they all have the same length.
  1. Building a sequential model with an `Embedding` layer, an `LSTM` layer, and `Dense` layers.
  1. Compiling and training the RNN.
  1. Evaluating its performance on the test set.

### Running the example and tests

- Launch the full script with `python Day_48_Recurrent_Neural_Networks/solutions.py` to download IMDB, train the LSTM, and print evaluation metrics.
- For a very fast check, use `pytest tests/test_day_48.py`. The test stubs out the dataset loader with a handful of synthetic sequences and runs a single epoch so it finishes quickly.
- LSTM models benefit significantly from GPU acceleration. If you have CUDA/cuDNN configured, TensorFlow will pick it up automatically; otherwise the CPU execution path will still work (just slower).

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_48_Recurrent_Neural_Networks/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_48_Recurrent_Neural_Networks/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_48_Recurrent_Neural_Networks/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_48_Recurrent_Neural_Networks/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_48_Recurrent_Neural_Networks/solutions.py)

    ```python title="solutions.py"
    """Utility functions for building and training a small LSTM on the IMDB dataset."""

    from __future__ import annotations

    from typing import Dict, Tuple

    import numpy as np
    import tensorflow as tf
    from tensorflow.keras import datasets, layers, models
    from tensorflow.keras.preprocessing.sequence import pad_sequences

    DEFAULT_SEED = 42


    def set_global_seed(seed: int = DEFAULT_SEED) -> None:
        """Synchronise NumPy and TensorFlow RNGs for deterministic runs."""

        np.random.seed(seed)
        tf.keras.utils.set_random_seed(seed)


    def prepare_imdb_data(
        *, vocab_size: int = 10_000, max_length: int = 256
    ) -> Tuple[Tuple[np.ndarray, np.ndarray], Tuple[np.ndarray, np.ndarray]]:
        """Load the IMDB sentiment dataset and pad sequences to a uniform length."""

        (train_data, train_labels), (test_data, test_labels) = datasets.imdb.load_data(
            num_words=vocab_size
        )

        train_data_padded = pad_sequences(train_data, maxlen=max_length, padding="post")
        test_data_padded = pad_sequences(test_data, maxlen=max_length, padding="post")

        return (train_data_padded, np.array(train_labels)), (
            test_data_padded,
            np.array(test_labels),
        )


    def build_rnn_model(
        *,
        vocab_size: int = 10_000,
        embedding_dim: int = 16,
        max_length: int = 256,
        lstm_units: int = 64,
        dense_units: int = 64,
    ) -> tf.keras.Model:
        """Create an LSTM-based classifier mirroring the tutorial architecture."""

        model = models.Sequential(
            [
                layers.Input(shape=(max_length,)),
                layers.Embedding(input_dim=vocab_size, output_dim=embedding_dim),
                layers.LSTM(lstm_units),
                layers.Dense(dense_units, activation="relu"),
                layers.Dense(1, activation="sigmoid"),
            ]
        )

        model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
        return model


    def train_rnn_model(
        model: tf.keras.Model,
        train_data: np.ndarray,
        train_labels: np.ndarray,
        *,
        epochs: int = 5,
        batch_size: int = 128,
        validation_split: float = 0.2,
        verbose: int = 1,
        shuffle: bool = True,
    ) -> tf.keras.callbacks.History:
        """Fit the RNN and return the training history."""

        history = model.fit(
            train_data,
            train_labels,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=verbose,
            shuffle=shuffle,
        )
        return history


    def evaluate_rnn_model(
        model: tf.keras.Model,
        test_data: np.ndarray,
        test_labels: np.ndarray,
        *,
        verbose: int = 2,
    ) -> Dict[str, float]:
        """Evaluate the trained RNN on the held-out test data."""

        return model.evaluate(test_data, test_labels, verbose=verbose, return_dict=True)


    def run_full_workflow(
        *,
        vocab_size: int = 10_000,
        max_length: int = 256,
        epochs: int = 5,
        batch_size: int = 128,
        verbose: int = 1,
        seed: int = DEFAULT_SEED,
    ) -> Tuple[tf.keras.callbacks.History, Dict[str, float], tf.keras.Model]:
        """Train and evaluate the IMDB LSTM classifier end-to-end."""

        set_global_seed(seed)
        (train_data, train_labels), (test_data, test_labels) = prepare_imdb_data(
            vocab_size=vocab_size, max_length=max_length
        )
        model = build_rnn_model(
            vocab_size=vocab_size, embedding_dim=16, max_length=max_length
        )
        history = train_rnn_model(
            model,
            train_data,
            train_labels,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.2,
            verbose=verbose,
        )
        metrics = evaluate_rnn_model(model, test_data, test_labels, verbose=verbose)
        return history, metrics, model


    if __name__ == "__main__":
        import os

        # Use fewer epochs for automated testing to avoid timeouts
        epochs = 1 if os.environ.get("QUICK_TEST_MODE") == "1" else 5

        history, metrics, model = run_full_workflow(epochs=epochs, verbose=0)

        print("--- RNN (LSTM) for IMDB Sentiment Classification ---")
        model.summary()
        print("-" * 30)
        print(f"Trained for {epochs} epoch(s)")
        print("Final training accuracy:", history.history["accuracy"][-1])
        print("Test metrics:")
        for name, value in metrics.items():
            print(f"  {name}: {value:.4f}")
    ```
