## What's in this folder?

- `solutions.py` – modular helpers for preparing the Iris dataset, fitting SVM and decision tree classifiers, and evaluating them.
- `tests/test_day_43.py` – pytest checks covering dataset preparation and accuracy scoring for both models.

## How to run the demo

```bash
python Day_43_Supervised_Learning_Classification_Part_2/solutions.py
```

This command trains the SVM and decision tree models, printing their accuracy scores.

## Key functions

| Function | Description |
| --- | --- |
| `load_and_prepare_iris` | Splits and scales the Iris dataset for use with multiple classifiers. |
| `train_svm_classifier` | Trains a deterministic SVM classifier using the RBF kernel. |
| `train_decision_tree_classifier` | Fits a decision tree classifier with a fixed random seed. |
| `evaluate_classifier` | Computes accuracy for a fitted classifier. |
| `run_classification_demo` | Executes the full workflow and returns accuracy metrics for both models. |

## Tests

Run the advanced classification unit tests with:

```bash
pytest tests/test_day_43.py
```

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_43_Supervised_Learning_Classification_Part_2/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_43_Supervised_Learning_Classification_Part_2/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_43_Supervised_Learning_Classification_Part_2/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_43_Supervised_Learning_Classification_Part_2/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_43_Supervised_Learning_Classification_Part_2/solutions.py)

    ```python title="solutions.py"
    """Reusable helpers for SVM and Decision Tree classifiers on the Iris dataset."""

    from __future__ import annotations

    from dataclasses import dataclass
    from typing import Dict

    import numpy as np
    from sklearn.datasets import load_iris
    from sklearn.metrics import accuracy_score
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler
    from sklearn.svm import SVC
    from sklearn.tree import DecisionTreeClassifier


    @dataclass
    class IrisData:
        X_train: np.ndarray
        X_test: np.ndarray
        y_train: np.ndarray
        y_test: np.ndarray
        X_train_scaled: np.ndarray
        X_test_scaled: np.ndarray
        scaler: StandardScaler


    def load_and_prepare_iris(
        test_size: float = 0.3,
        random_state: int = 42,
    ) -> IrisData:
        """Load the Iris dataset and return scaled/unscaled splits."""
        iris = load_iris()
        X_train, X_test, y_train, y_test = train_test_split(
            iris.data,
            iris.target,
            test_size=test_size,
            random_state=random_state,
            stratify=iris.target,
        )
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        return IrisData(
            X_train=X_train,
            X_test=X_test,
            y_train=y_train,
            y_test=y_test,
            X_train_scaled=X_train_scaled,
            X_test_scaled=X_test_scaled,
            scaler=scaler,
        )


    def train_svm_classifier(
        X_train: np.ndarray,
        y_train: np.ndarray,
        *,
        kernel: str = "rbf",
        random_state: int = 42,
    ) -> SVC:
        """Train an SVM classifier with deterministic hyperparameters."""
        model = SVC(kernel=kernel, random_state=random_state)
        model.fit(X_train, y_train)
        return model


    def train_decision_tree_classifier(
        X_train: np.ndarray,
        y_train: np.ndarray,
        *,
        random_state: int = 42,
    ) -> DecisionTreeClassifier:
        """Train a decision tree classifier."""
        model = DecisionTreeClassifier(random_state=random_state)
        model.fit(X_train, y_train)
        return model


    def evaluate_classifier(
        model,
        X_test: np.ndarray,
        y_test: np.ndarray,
    ) -> Dict[str, float]:
        """Return a dictionary of evaluation metrics for the classifier."""
        accuracy = accuracy_score(y_test, model.predict(X_test))
        return {"accuracy": accuracy}


    def run_classification_demo() -> Dict[str, Dict[str, float]]:
        """Run the Day 43 classification demo and return the metrics."""
        data = load_and_prepare_iris()
        svm_model = train_svm_classifier(data.X_train_scaled, data.y_train)
        tree_model = train_decision_tree_classifier(data.X_train, data.y_train)
        return {
            "svm": evaluate_classifier(svm_model, data.X_test_scaled, data.y_test),
            "decision_tree": evaluate_classifier(tree_model, data.X_test, data.y_test),
        }


    if __name__ == "__main__":
        metrics = run_classification_demo()
        print("--- Advanced Classification on Iris Dataset ---")
        for model_name, model_metrics in metrics.items():
            print(
                f"{model_name.replace('_', ' ').title()} accuracy: {model_metrics['accuracy']:.4f}"
            )
    ```
