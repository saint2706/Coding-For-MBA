---
title: 'Day 50: MLOps - Model Deployment'
tags:
  - ML
  - MLOps
---

Welcome to our final day, Day 50! Today, we touch upon **MLOps (Machine Learning Operations)**,
which focuses on the practical side of deploying, monitoring, and maintaining machine learning
models in production environments. Our focus will be on a crucial first step: **saving and loading a
trained model**. Later lessons deepen each pillar:

- **Day 65 – MLOps Pipelines and CI/CD** scales persistence into feature stores, model registries,
  and GitHub Actions workflows.
- **Day 66 – Model Deployment and Serving** compares REST, gRPC, batch, streaming, and edge
  endpoints with FastAPI/BentoML-inspired adapters.
- **Day 67 – Model Monitoring and Reliability** adds drift detection, retraining triggers, and
  observability instrumentation.

## Key Concepts

### What is MLOps?

MLOps is a set of practices that aims to deploy and maintain machine learning models in production
reliably and efficiently. It's the intersection of Machine Learning, DevOps, and Data Engineering.

**Key MLOps concerns include:**

- **Model Deployment:** How do you make your trained model available to users or other systems?
- **Automation:** Automating the ML workflow from data ingestion to model training and deployment.
- **Monitoring:** Tracking the model's performance in production to detect degradation or drift.
- **Scalability & Reproducibility:** Ensuring your system can handle load and that your experiments
  can be reproduced.

### Saving and Loading Models

Before you can deploy a model, you need to save its learned state (the weights, parameters, etc.).
This process is often called **serialization**. Once saved, the model can be loaded into another
environment (like a web server) to make predictions without needing to be retrained.

- **For Scikit-learn:** The standard way is to use Python's `pickle` module or the more efficient
  `joblib` library. `joblib` is often preferred for objects that carry large NumPy arrays.

- **For TensorFlow/Keras:** TensorFlow has its own built-in saving and loading functionality
  (`model.save()` and `tf.keras.models.load_model()`). It can save the model's architecture,
  weights, and training configuration all in one place.

### Serving a Model via a Web API

A common way to deploy a model is to wrap it in a web API.

1. A client (e.g., a web or mobile app) sends a POST request with new data to an API endpoint (e.g.,
   `/predict`).
1. The server, running a web framework like **Flask** or **FastAPI**, receives the data.
1. The server loads the saved model and uses it to make a prediction on the data.
1. The prediction is sent back to the client in the API response (usually in JSON format).

______________________________________________________________________

## Practice Exercise

- The `solutions.py` file demonstrates the basic workflow of saving and loading a `scikit-learn`
  model using `joblib`.
- The `bonus_flask_api.py` file provides a simple example of how you could serve this saved model
  using the Flask web framework.
- The code covers:
  1. Training a simple model on the Iris dataset.
  1. Saving the trained model to a file (`iris_model.joblib`).
  1. Loading the model back from the file and using it to make a new prediction.
  1. (Bonus) A minimal Flask app that loads the model and exposes a `/predict` endpoint.

Review the code to understand the fundamental step of model persistence, which is the gateway to
model deployment. When you are ready to automate full pipelines, deploy APIs, and monitor production
behaviour, continue into Days 65–67 for the dedicated deep dives.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 49 – Day 49: Natural Language Processing (NLP)](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_49_NLP/README.md) • **Next:** [Day 51 – Day 51 – Regularised Models](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_51_Regularized_Models/README.md)

_You are on lesson 50 of 108._

<!-- LESSON_FOOTER_END -->

## Interactive Notebooks

Run this lesson's notebooks directly in your browser with the built-in JupyterLite runtime.

[🪐 Launch in JupyterLite](/jupyterlite/lab?path=Day_50_MLOps/bonus_flask_api.ipynb){ .md-button .md-button--primary }

## Additional Materials

- **bonus_flask_api.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_50_MLOps/bonus_flask_api.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_50_MLOps/bonus_flask_api.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_50_MLOps/bonus_flask_api.ipynb){ .md-button }
  [🪐 Launch in JupyterLite](/jupyterlite/lab?path=Day_50_MLOps/bonus_flask_api.ipynb){ .md-button }
- **solutions.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_50_MLOps/solutions.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_50_MLOps/solutions.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_50_MLOps/solutions.ipynb){ .md-button }
  [🪐 Launch in JupyterLite](/jupyterlite/lab?path=Day_50_MLOps/solutions.ipynb){ .md-button }

???+ example "bonus_flask_api.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_50_MLOps/bonus_flask_api.py)

    ```python title="bonus_flask_api.py"
    import joblib
    from flask import Flask, jsonify, request

    # NOTE: To run this script, you need to install Flask:
    # pip install Flask

    # 1. Initialize the Flask app
    app = Flask(__name__)

    # 2. Load the trained model
    # This is done once when the app starts.
    model_filename = "iris_model.joblib"
    try:
        model = joblib.load(model_filename)
        print(f"Model '{model_filename}' loaded successfully.")
    except FileNotFoundError:
        print(
            f"Error: Model file '{model_filename}' not found. Please run solutions.py first."
        )
        model = None


    # 3. Define the prediction endpoint
    @app.route("/predict", methods=["POST"])
    def predict():
        """
        Receives a POST request with JSON data and returns a prediction.
        """
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        # Get the JSON data from the request
        data = request.get_json()

        # Basic validation
        if not data or "features" not in data:
            return jsonify({"error": "Invalid input: 'features' key not found"}), 400

        try:
            # Extract features and convert to a list of lists for prediction
            features = [data["features"]]

            # Make a prediction
            prediction_index = model.predict(features)

            # Get the class name from the index
            iris_target_names = [
                "setosa",
                "versicolor",
                "virginica",
            ]  # In a real app, load this properly
            predicted_class = iris_target_names[prediction_index[0]]

            # Return the result as JSON
            return jsonify(
                {
                    "prediction": predicted_class,
                    "prediction_index": int(prediction_index[0]),
                }
            )

        except Exception as e:
            return jsonify({"error": f"An error occurred: {str(e)}"}), 500


    # --- How to Run This API ---
    # 1. Make sure 'iris_model.joblib' exists by running solutions.py.
    # 2. Run this script from your terminal: `python bonus_flask_api.py`
    # 3. The server will start, usually on http://127.0.0.1:5000.
    #
    # --- How to Test This API ---
    # You can use a tool like 'curl' from another terminal:
    #
    # curl -X POST http://127.0.0.1:5000/predict \
    # -H "Content-Type: application/json" \
    # -d '{"features": [6.0, 2.5, 4.5, 1.5]}'
    #
    # Expected Response:
    # {
    #   "prediction": "versicolor",
    #   "prediction_index": 1
    # }

    if __name__ == "__main__":
        # The `debug=True` flag allows for auto-reloading when you save changes.
        # Do not use `debug=True` in a production environment.
        import os

        # Skip running the server in test/automated environments
        if os.environ.get("FLASK_RUN_TEST_MODE") != "1":
            app.run(debug=False)
        else:
            print("Flask app created successfully (test mode - not starting server)")
            print("Model loaded:" if model is not None else "Model not loaded")
            print("Routes available:")
            print("  - POST /predict")
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_50_MLOps/solutions.py)

    ```python title="solutions.py"
    """Reusable helpers for the Day 50 MLOps lesson.

    The original script demonstrated how to train, persist, load, and reuse a
    scikit-learn model.  The logic now lives in functions that can be imported from
    tests or other projects.
    """

    from __future__ import annotations

    from collections import Counter
    from math import ceil
    from pathlib import Path
    from typing import Iterable, Optional, Sequence, Tuple

    import joblib
    import numpy as np
    from sklearn.datasets import load_iris
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import accuracy_score
    from sklearn.model_selection import train_test_split


    def train_iris_model(
        *,
        test_size: float = 0.2,
        random_state: int = 42,
        max_iter: int = 200,
        subset_size: Optional[int] = None,
    ) -> Tuple[LogisticRegression, float, np.ndarray, np.ndarray, np.ndarray]:
        """Train a Logistic Regression model on the Iris dataset.

        Parameters
        ----------
        test_size:
            Fraction of the dataset to hold back for evaluation.
        random_state:
            Seed that controls the train/test split and optional sub-sampling.
        max_iter:
            Maximum number of iterations for the Logistic Regression solver.
        subset_size:
            If provided, draw a deterministic subset of this size before
            training. This is useful for demonstrations and tests where you want a
            smaller, reproducible dataset.

        Returns
        -------
        model:
            The trained scikit-learn estimator.
        accuracy:
            Accuracy on the held-out test set.
        X_test, y_test:
            The evaluation features and labels so callers can verify behaviour.
        target_names:
            Names of the Iris species corresponding to prediction indices.
        """

        iris = load_iris()
        X, y = iris.data, iris.target
        full_classes = np.unique(iris.target)

        if subset_size is not None:
            if subset_size <= 0:
                raise ValueError("subset_size must be a positive integer")
            if subset_size > len(X):
                raise ValueError("subset_size cannot exceed the dataset size")
            rng = np.random.RandomState(random_state)
            indices = rng.choice(len(X), subset_size, replace=False)
            X = X[indices]
            y = y[indices]

        present_classes = np.unique(y)
        missing_classes = sorted(set(full_classes) - set(present_classes))
        if missing_classes:
            raise ValueError(
                "Sub-sampled dataset is missing the following Iris classes: "
                f"{missing_classes}. Increase the subset_size to include all classes."
            )

        class_counts = Counter(int(label) for label in np.asarray(y))
        y_length = len(y)
        effective_test_ratio: Optional[float] = None
        if isinstance(test_size, (float, int)):
            if isinstance(test_size, float):
                if not 0 < test_size < 1:
                    raise ValueError(
                        "test_size must be between 0 and 1 when provided as a float"
                    )
                effective_test_ratio = test_size
            else:
                test_size_int = int(test_size)
                if test_size_int <= 0 or test_size_int >= y_length:
                    raise ValueError(
                        "test_size must leave at least one sample in both the train and test sets"
                    )
                effective_test_ratio = test_size_int / y_length

        for label in full_classes:
            count = class_counts[int(label)]
            if count < 2:
                raise ValueError(
                    "Sub-sampled dataset must contain at least two samples per class to allow a stratified split."
                )
            if effective_test_ratio is not None:
                test_allocation = ceil(count * effective_test_ratio)
                if test_allocation == 0 or test_allocation >= count:
                    raise ValueError(
                        "Sub-sampled dataset does not have enough samples of class "
                        f"{label} to satisfy test_size={test_size}. "
                        "Increase the subset_size or adjust test_size."
                    )

        try:
            X_train, X_test, y_train, y_test = train_test_split(
                X,
                y,
                test_size=test_size,
                random_state=random_state,
                stratify=y,
            )
        except ValueError as exc:
            raise ValueError(
                "Unable to perform a stratified train/test split with the requested "
                "parameters. Ensure each class has sufficient samples for the chosen "
                "test_size."
            ) from exc

        model = LogisticRegression(max_iter=max_iter)
        model.fit(X_train, y_train)

        accuracy = accuracy_score(y_test, model.predict(X_test))
        return model, accuracy, X_test, y_test, iris.target_names


    def save_model(model: LogisticRegression, path: Path | str) -> Path:
        """Persist the trained model to disk and return the resolved path."""

        path = Path(path).expanduser().resolve()
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(model, path)
        return path


    def load_model(path: Path | str) -> LogisticRegression:
        """Load a persisted model from disk."""

        path = Path(path)
        return joblib.load(path)


    def predict_sample(
        model: LogisticRegression,
        sample: Iterable[float],
        target_names: Optional[Sequence[str]] = None,
    ) -> Tuple[int, Optional[str]]:
        """Predict the Iris class for a single feature vector.

        Parameters
        ----------
        model:
            A trained scikit-learn estimator.
        sample:
            Iterable of feature values (sepal length, sepal width, petal length,
            petal width).
        target_names:
            Optional sequence of class labels. If provided, the corresponding name
            is returned alongside the numeric prediction.
        """

        array = np.asarray(sample, dtype=float)
        if array.ndim == 1:
            array = array.reshape(1, -1)
        prediction = model.predict(array)[0]
        name = None
        if target_names is not None:
            name = target_names[prediction]
        return prediction, name


    def _demo() -> None:
        """Replicate the original script as a simple CLI demonstration."""

        print("--- Model Persistence Example ---")
        model, accuracy, X_test, y_test, target_names = train_iris_model()
        print(f"Model trained with an accuracy of: {accuracy * 100:.2f}%")
        print("-" * 30)

        model_filename = save_model(model, "iris_model.joblib")
        print(f"Model saved to '{model_filename}'")
        print("-" * 30)

        print("Loading model from file...")
        loaded_model = load_model(model_filename)
        print("Model loaded successfully.")
        print("-" * 30)

        new_sample = np.array([6.0, 2.5, 4.5, 1.5])
        prediction, predicted_class_name = predict_sample(
            loaded_model, new_sample, target_names
        )

        print("--- Making a Prediction with the Loaded Model ---")
        print(f"New sample data: {new_sample.tolist()}")
        print(f"Predicted class index: {prediction}")
        print(f"Predicted class name: '{predicted_class_name}'")
        print("This demonstrates that our saved model retains its knowledge.")
        print("-" * 30)
        print(
            "\nCheck out 'bonus_flask_api.py' for an example of how to serve this model in a web API."
        )


    if __name__ == "__main__":
        _demo()
    ```
