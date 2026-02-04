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
