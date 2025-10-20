Welcome to Day 46! Today, we begin our exploration of **Deep Learning** by introducing the fundamental building block: the **Artificial Neural Network (ANN)**. We'll also discuss the major frameworks used to build these powerful models.

> **Prerequisites:** Install TensorFlow with `pip install tensorflow` to run today's neural-network examples (this installs the CPU build; GPU acceleration requires following TensorFlow's CUDA setup). You'll also need scikit-learn for data prep with `pip install scikit-learn`. Need a refresher on using `pip`? Revisit the Day 20 Python Package Manager lesson.

## Key Concepts

### What is a Neural Network?

An Artificial Neural Network is a computational model inspired by the structure and function of the human brain. It consists of interconnected nodes, called **neurons**, organized in layers.

### Structure of a Neural Network

1. **Input Layer:** Receives the initial data or features. The number of neurons in this layer corresponds to the number of features in the dataset.

1. **Hidden Layers:** These are the intermediate layers between the input and output layers. A neural network can have zero or more hidden layers. A "deep" neural network has multiple hidden layers.

   - Each neuron in a hidden layer receives inputs from the previous layer, applies a mathematical operation (a weighted sum followed by an **activation function**), and passes the result to the next layer.

1. **Output Layer:** Produces the final result.

   - For a **regression** task, it might have a single neuron with a linear activation.
   - For a **classification** task, it might have multiple neurons (one for each class) with a softmax activation function to output probabilities.

### Activation Functions

Activation functions introduce non-linearity into the network, allowing it to learn complex patterns. Without them, a neural network would just be a linear regression model.

- **Common Examples:**
  - **ReLU (Rectified Linear Unit):** `f(x) = max(0, x)`. The most widely used activation function.
  - **Sigmoid:** `f(x) = 1 / (1 + e^(-x))`. Used in the output layer for binary classification.
  - **Softmax:** Generalizes the sigmoid function for multi-class classification.

### How Neural Networks Learn

They learn through a process called **backpropagation** and **gradient descent**.

1. The network makes a prediction (forward pass).
1. The prediction error is calculated using a **loss function**.
1. The backpropagation algorithm calculates the gradient of the loss function with respect to the network's weights.
1. The weights are updated using gradient descent to minimize the error.

## Deep Learning Frameworks

Building neural networks from scratch is complex. We use specialized libraries to handle the heavy lifting.

- **TensorFlow:** Developed by Google, it's a powerful and flexible ecosystem for machine learning. It's known for its production-readiness and scalability.
- **PyTorch:** Developed by Facebook's AI Research lab, it's known for its simplicity, ease of use, and Pythonic nature, making it a favorite in the research community.

______________________________________________________________________

## Practice Exercise

- The `solutions.py` module now exposes dedicated helper functions for each step of the workflow (data preparation, model construction, training, and evaluation). Import the pieces you need instead of running everything on import.
- The code covers:
  1. Loading and preparing the Iris dataset.
  1. Building a sequential model with dense (fully connected) layers.
  1. Compiling the model (specifying the optimizer, loss function, and metrics).
  1. Training the model.
  1. Evaluating its performance and making predictions.

### Running the example and tests

- Execute the full walkthrough from the command line with `python Day_46_Intro_to_Neural_Networks/solutions.py`. The script prints the data shapes, model summary, and evaluation metrics.
- Need a quick confidence check without the full 50-epoch run? The automated test performs a single, deterministic epoch: `pytest tests/test_day_46.py`.
- Training on GPU hardware is optional for this small dataset, but TensorFlow will automatically leverage your GPU if it's available and correctly configured.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_46_Intro_to_Neural_Networks/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_46_Intro_to_Neural_Networks/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_46_Intro_to_Neural_Networks/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_46_Intro_to_Neural_Networks/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_46_Intro_to_Neural_Networks/solutions.py)

    ```python title="solutions.py"
    """Utility functions for training a simple neural network on the Iris dataset.

    The original tutorial for Day 46 walked through the full workflow of preparing
    data, building a model, fitting it, and evaluating the results using
    print statements.  This refactor exposes each major step as a reusable
    function so that the workflow can be unit tested and reused from other
    scripts without executing expensive training at import time.

    The helper functions are intentionally lightweight: callers control the
    number of training epochs, verbosity, and whether validation data is used.
    Each function returns rich objects (e.g. `History` instances or metric
    dictionaries) so tests can assert on their contents.
    """

    from __future__ import annotations

    from dataclasses import dataclass
    from typing import Dict, Iterable, Tuple

    import numpy as np
    import tensorflow as tf
    from sklearn.datasets import load_iris
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import OneHotEncoder, StandardScaler

    DEFAULT_SEED = 42


    @dataclass
    class IrisData:
        """Container for the Iris dataset splits and fitted preprocessors."""

        X_train: np.ndarray
        X_test: np.ndarray
        y_train: np.ndarray
        y_test: np.ndarray
        scaler: StandardScaler
        encoder: OneHotEncoder
        target_names: Iterable[str]


    def set_global_seed(seed: int = DEFAULT_SEED) -> None:
        """Ensure reproducible results across NumPy and TensorFlow."""

        np.random.seed(seed)
        tf.keras.utils.set_random_seed(seed)


    def prepare_iris_data(
        test_size: float = 0.2, random_state: int = DEFAULT_SEED
    ) -> IrisData:
        """Load, scale, and encode the Iris dataset.

        Args:
            test_size: Fraction of samples to allocate to the test split.
            random_state: Deterministic seed used for the train/test split.

        Returns:
            An :class:`IrisData` instance containing the dataset splits along with
            the fitted preprocessing objects.
        """

        iris = load_iris()
        X, y = iris.data, iris.target

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # ``sparse_output`` is available in newer scikit-learn releases; fall back
        # to the legacy ``sparse`` flag when running on older versions.
        try:
            encoder = OneHotEncoder(sparse_output=False)  # type: ignore[arg-type]
        except TypeError:  # pragma: no cover - executed on older scikit-learn
            encoder = OneHotEncoder(sparse=False)
        y_onehot = encoder.fit_transform(y.reshape(-1, 1))

        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y_onehot, test_size=test_size, random_state=random_state
        )

        return IrisData(
            X_train=X_train,
            X_test=X_test,
            y_train=y_train,
            y_test=y_test,
            scaler=scaler,
            encoder=encoder,
            target_names=iris.target_names,
        )


    def build_iris_model(
        input_shape: int, num_classes: int, hidden_units: Tuple[int, ...] = (10, 10)
    ) -> tf.keras.Model:
        """Create and compile the neural network used for Iris classification."""

        model = tf.keras.Sequential()
        model.add(tf.keras.layers.Input(shape=(input_shape,)))
        for units in hidden_units:
            model.add(tf.keras.layers.Dense(units, activation="relu"))

        model.add(tf.keras.layers.Dense(num_classes, activation="softmax"))

        model.compile(
            optimizer="adam",
            loss="categorical_crossentropy",
            metrics=["accuracy"],
        )

        return model


    def train_iris_model(
        model: tf.keras.Model,
        X_train: np.ndarray,
        y_train: np.ndarray,
        *,
        epochs: int = 50,
        batch_size: int = 8,
        validation_split: float = 0.2,
        verbose: int = 0,
        shuffle: bool = True,
    ) -> tf.keras.callbacks.History:
        """Fit the neural network and return the resulting history object."""

        history = model.fit(
            X_train,
            y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=verbose,
            shuffle=shuffle,
        )
        return history


    def evaluate_iris_model(
        model: tf.keras.Model, X_test: np.ndarray, y_test: np.ndarray, *, verbose: int = 0
    ) -> Dict[str, float]:
        """Evaluate the trained model and return the metrics as a dictionary."""

        return model.evaluate(X_test, y_test, verbose=verbose, return_dict=True)


    def run_full_workflow(
        *,
        epochs: int = 50,
        batch_size: int = 8,
        validation_split: float = 0.2,
        verbose: int = 0,
        seed: int = DEFAULT_SEED,
    ) -> Tuple[tf.keras.callbacks.History, Dict[str, float], tf.keras.Model, IrisData]:
        """Execute the end-to-end Iris training workflow.

        This helper is convenient for interactive exploration while keeping the
        individual steps separately testable.
        """

        set_global_seed(seed)
        data = prepare_iris_data(random_state=seed)
        model = build_iris_model(data.X_train.shape[1], data.y_train.shape[1])
        history = train_iris_model(
            model,
            data.X_train,
            data.y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=verbose,
            shuffle=True,
        )
        metrics = evaluate_iris_model(model, data.X_test, data.y_test, verbose=verbose)
        return history, metrics, model, data


    if __name__ == "__main__":
        history, metrics, model, data = run_full_workflow(verbose=1)

        print("--- Neural Network for Iris Classification ---")
        print(f"Training set shape: {data.X_train.shape}")
        print(f"One-hot encoded target shape: {data.y_train.shape}")
        print("-" * 30)

        print("Model Summary:")
        model.summary()
        print("-" * 30)

        print(
            "Training complete. Final validation accuracy:"
            f" {history.history['val_accuracy'][-1]:.3f}"
        )
        print("Test metrics:")
        for name, value in metrics.items():
            print(f"  {name}: {value:.4f}")
        print("-" * 30)

        # Demonstrate an example prediction using the fitted scaler.
        sample = np.array([[5.1, 3.5, 1.4, 0.2]])
        sample_scaled = data.scaler.transform(sample)
        prediction = model.predict(sample_scaled)
        predicted_class = np.argmax(prediction, axis=1)[0]

        print("Prediction for a new sample:")
        print(f"Probabilities: {prediction[0]}")
        print(f"Predicted class index: {predicted_class}")
        print(f"Predicted class name: {data.target_names[predicted_class]}")
    ```
