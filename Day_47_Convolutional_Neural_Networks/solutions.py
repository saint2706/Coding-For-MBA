"""Reusable helpers for building and training a small CNN on MNIST images."""

from __future__ import annotations

from typing import Dict, Tuple

import numpy as np
import tensorflow as tf
from tensorflow.keras import datasets, layers, models

DEFAULT_SEED = 42


def set_global_seed(seed: int = DEFAULT_SEED) -> None:
    """Synchronise NumPy and TensorFlow RNGs for deterministic runs."""

    np.random.seed(seed)
    tf.keras.utils.set_random_seed(seed)


def prepare_mnist_data(
    normalize: bool = True,
) -> Tuple[Tuple[np.ndarray, np.ndarray], Tuple[np.ndarray, np.ndarray]]:
    """Load MNIST images, optionally normalise pixels, and add a channel axis."""

    (train_images, train_labels), (test_images, test_labels) = (
        datasets.mnist.load_data()
    )

    train_images = train_images.astype("float32")
    test_images = test_images.astype("float32")

    if normalize:
        train_images /= 255.0
        test_images /= 255.0

    train_images = train_images[..., tf.newaxis]
    test_images = test_images[..., tf.newaxis]

    return (train_images, train_labels), (test_images, test_labels)


def build_cnn_model(
    input_shape: Tuple[int, int, int] = (28, 28, 1),
    num_classes: int = 10,
    conv_filters: Tuple[int, int, int] = (32, 64, 64),
    dense_units: int = 64,
) -> tf.keras.Model:
    """Create an MNIST classifier mirroring the tutorial architecture."""

    model = models.Sequential()
    model.add(layers.Input(shape=input_shape))
    for index, filters in enumerate(conv_filters):
        model.add(layers.Conv2D(filters, (3, 3), activation="relu"))
        if index < len(conv_filters) - 1:
            model.add(layers.MaxPooling2D((2, 2)))

    model.add(layers.Flatten())
    model.add(layers.Dense(dense_units, activation="relu"))
    model.add(layers.Dense(num_classes, activation="softmax"))

    return model


def compile_cnn_model(
    model: tf.keras.Model,
    optimizer: str = "adam",
    loss: str = "sparse_categorical_crossentropy",
    metrics: Tuple[str, ...] = ("accuracy",),
) -> tf.keras.Model:
    """Compile the CNN with sensible defaults for classification."""

    model.compile(optimizer=optimizer, loss=loss, metrics=list(metrics))
    return model


def train_cnn_model(
    model: tf.keras.Model,
    train_images: np.ndarray,
    train_labels: np.ndarray,
    *,
    epochs: int = 5,
    batch_size: int = 64,
    validation_data: Tuple[np.ndarray, np.ndarray] | None = None,
    validation_split: float = 0.0,
    verbose: int = 1,
    shuffle: bool = True,
) -> tf.keras.callbacks.History:
    """Fit the CNN and return the training history."""

    history = model.fit(
        train_images,
        train_labels,
        epochs=epochs,
        batch_size=batch_size,
        validation_data=validation_data,
        validation_split=validation_split,
        verbose=verbose,
        shuffle=shuffle,
    )
    return history


def evaluate_cnn_model(
    model: tf.keras.Model,
    test_images: np.ndarray,
    test_labels: np.ndarray,
    *,
    verbose: int = 2,
) -> Dict[str, float]:
    """Evaluate the trained CNN on the test split."""

    return model.evaluate(test_images, test_labels, verbose=verbose, return_dict=True)


def run_full_workflow(
    *,
    epochs: int = 5,
    batch_size: int = 64,
    verbose: int = 1,
    seed: int = DEFAULT_SEED,
) -> Tuple[tf.keras.callbacks.History, Dict[str, float], tf.keras.Model]:
    """Train and evaluate the CNN end-to-end, returning the artifacts."""

    set_global_seed(seed)
    (train_images, train_labels), (test_images, test_labels) = prepare_mnist_data()
    model = build_cnn_model(input_shape=train_images.shape[1:])
    compile_cnn_model(model)
    history = train_cnn_model(
        model,
        train_images,
        train_labels,
        epochs=epochs,
        batch_size=batch_size,
        validation_data=(test_images, test_labels),
        verbose=verbose,
    )
    metrics = evaluate_cnn_model(model, test_images, test_labels, verbose=verbose)
    return history, metrics, model


if __name__ == "__main__":
    import os

    # Use fewer epochs for automated testing to avoid timeouts
    epochs = 1 if os.environ.get("QUICK_TEST_MODE") == "1" else 5

    history, metrics, model = run_full_workflow(epochs=epochs, verbose=0)

    print("--- CNN for MNIST Classification ---")
    model.summary()
    print("-" * 30)
    print(f"Trained for {epochs} epoch(s)")
    print("Final training accuracy:", history.history["accuracy"][-1])
    print("Test metrics:")
    for name, value in metrics.items():
        print(f"  {name}: {value:.4f}")
