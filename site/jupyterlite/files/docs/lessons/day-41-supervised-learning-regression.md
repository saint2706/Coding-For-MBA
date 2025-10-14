## What's in this folder?

- `solutions.py` – modular helpers for generating synthetic regression data, training a linear regression model, evaluating it, and saving visualisations.
- `tests/test_day_41.py` – pytest coverage for the helper functions and the end-to-end demo workflow.

## How to run the demo

```bash
python Day_41_Supervised_Learning_Regression/solutions.py
```

This command prints the evaluation metrics and saves `regression_fit.png` in the working directory.

## Key functions

| Function | Description |
| --- | --- |
| `generate_regression_data` | Creates a deterministic dataset using NumPy for reproducible experimentation. |
| `train_regression_model` | Fits a `LinearRegression` model on the provided training split. |
| `make_regression_predictions` | Returns predictions for a trained model. |
| `evaluate_regression_model` | Computes Mean Squared Error (MSE) and the coefficient of determination (R²). |
| `plot_regression_results` | Saves a scatter plot with the fitted regression line to disk. |
| `run_linear_regression_demo` | Orchestrates the full pipeline and returns the evaluation metrics. |

## Tests

Run the regression unit tests with:

```bash
pytest tests/test_day_41.py
```



## Interactive Notebooks

Run this lesson's code interactively in your browser:

- [🚀 Launch solutions in JupyterLite](../../jupyterlite/lab?path=Day_41_Supervised_Learning_Regression/solutions.ipynb){ .md-button .md-button--primary }

!!! tip "About JupyterLite"
    JupyterLite runs entirely in your browser using WebAssembly. No installation or server required! Note: First launch may take a moment to load.
## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_41_Supervised_Learning_Regression/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_41_Supervised_Learning_Regression/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_41_Supervised_Learning_Regression/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_41_Supervised_Learning_Regression/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_41_Supervised_Learning_Regression/solutions.py)

    ```python title="solutions.py"
    """Reusable helpers for the Day 41 regression lesson.

    The module exposes composable utilities to generate synthetic data,
    train a linear regression model, evaluate it, and optionally persist
    visualisations.  When executed as a script it will run the full demo and
    save a regression plot to ``regression_fit.png``.
    """

    from __future__ import annotations

    from pathlib import Path
    from typing import Dict, Tuple

    import matplotlib.pyplot as plt
    import numpy as np
    from sklearn.linear_model import LinearRegression
    from sklearn.metrics import mean_squared_error, r2_score
    from sklearn.model_selection import train_test_split


    def generate_regression_data(
        n_samples: int = 100,
        slope: float = 2.5,
        intercept: float = 10.0,
        noise_std: float = 1.0,
        random_state: int = 42,
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Create a deterministic synthetic regression dataset."""
        rng = np.random.default_rng(random_state)
        X = 2 * rng.random((n_samples, 1))
        noise = rng.normal(0.0, noise_std, n_samples)
        y = intercept + slope * X.flatten() + noise
        return X, y


    def split_regression_data(
        X: np.ndarray,
        y: np.ndarray,
        test_size: float = 0.2,
        random_state: int = 42,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Split features and labels into train/test sets."""
        return train_test_split(X, y, test_size=test_size, random_state=random_state)


    def train_regression_model(
        X_train: np.ndarray, y_train: np.ndarray
    ) -> LinearRegression:
        """Fit a :class:`~sklearn.linear_model.LinearRegression` model."""
        model = LinearRegression()
        model.fit(X_train, y_train)
        return model


    def make_regression_predictions(model: LinearRegression, X: np.ndarray) -> np.ndarray:
        """Return predictions for the provided features."""
        return model.predict(X)


    def evaluate_regression_model(
        y_true: np.ndarray, y_pred: np.ndarray
    ) -> Dict[str, float]:
        """Calculate common regression metrics for the provided predictions."""
        return {
            "mse": mean_squared_error(y_true, y_pred),
            "r2": r2_score(y_true, y_pred),
        }


    def plot_regression_results(
        X: np.ndarray,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        filepath: str | Path = "regression_fit.png",
    ) -> Tuple[plt.Figure, Path]:
        """Create and save a scatter/line plot of the regression fit."""
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.scatter(X, y_true, color="blue", label="Actual values")
        # Sorting ensures the regression line is displayed correctly.
        sorted_indices = np.argsort(X.flatten())
        ax.plot(
            X.flatten()[sorted_indices],
            y_pred[sorted_indices],
            color="red",
            linewidth=2,
            label="Regression line",
        )
        ax.set_title("Linear Regression Fit")
        ax.set_xlabel("Independent Variable (X)")
        ax.set_ylabel("Dependent Variable (y)")
        ax.grid(True)
        ax.legend()

        output_path = Path(filepath)
        fig.savefig(output_path)
        return fig, output_path


    def run_linear_regression_demo(
        save_path: str | Path = "regression_fit.png",
    ) -> Dict[str, float]:
        """Execute the full demo workflow and return evaluation metrics."""
        X, y = generate_regression_data()
        X_train, X_test, y_train, y_test = split_regression_data(X, y)
        model = train_regression_model(X_train, y_train)
        y_pred = make_regression_predictions(model, X_test)
        metrics = evaluate_regression_model(y_test, y_pred)
        plot_regression_results(X_test, y_test, y_pred, filepath=save_path)
        return metrics


    if __name__ == "__main__":
        metrics = run_linear_regression_demo()
        print("--- Linear Regression Example ---")
        print("Generated a dataset with 100 samples.")
        print("Training set size: 80 samples")
        print("Testing set size: 20 samples")
        print("-" * 30)
        print(f"Learned metrics -> MSE: {metrics['mse']:.4f}, R^2: {metrics['r2']:.4f}")
        print("Saved a plot of the regression fit to 'regression_fit.png'")
    ```
