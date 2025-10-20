## Overview

This lesson introduces the machine learning workflow and highlights how evaluation techniques ensure reliable models. You'll generate data, configure cross-validation, train a linear model, and compute mean squared error metrics.

> **Prerequisites:** Install scikit-learn with `pip install scikit-learn` before running the exercises.

## Key Concepts

- **Learning Paradigms:** Supervised, unsupervised, and reinforcement learning cover most ML problems and inform how we collect data and labels.
- **Bias–Variance Trade-off:** Balances model simplicity and flexibility; too much bias underfits, too much variance overfits.
- **Cross-Validation:** Splits data into multiple folds so every observation is used for both training and validation, yielding a robust performance estimate.

## Practice Exercises

1. **Dataset Generation:** `generate_dataset()` creates a noisy linear regression dataset for experimentation.
1. **Cross-Validation Setup:** `setup_kfold()` configures the resampling strategy, while `train_linear_regression()` and `evaluate_model()` encapsulate model training and scoring.
1. **Model Assessment:** `cross_validate_model()` runs the full loop and reports per-fold and average mean squared error.

## How to Use This Folder

- Run the worked examples: `python Day_40_Intro_to_ML/solutions.py`
- Execute the automated checks: `pytest tests/test_day_40.py`

### What's next?

Explore the full [Machine Learning Curriculum Roadmap](https://github.com/saint2706/Coding-For-MBA/blob/main/docs/ml_curriculum.md) to see how the Day 40 lesson fits into a multi-phase path covering deep learning, responsible AI, and MLOps.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_40_Intro_to_ML/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_40_Intro_to_ML/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_40_Intro_to_ML/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_40_Intro_to_ML/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_40_Intro_to_ML/solutions.py)

    ```python title="solutions.py"
    import numpy as np
    from sklearn.linear_model import LinearRegression
    from sklearn.metrics import mean_squared_error
    from sklearn.model_selection import KFold


    def generate_dataset(
        num_samples=100, start=0.0, stop=10.0, noise_scale=3.0, random_state=None
    ):
        """Generate a simple linear dataset with Gaussian noise."""

        rng = np.random.default_rng(random_state)
        X = np.linspace(start, stop, num_samples, dtype=float).reshape(-1, 1)
        noise = rng.normal(0.0, noise_scale, num_samples)
        y = 3 * X.flatten() + 5 + noise
        return X, y


    def setup_kfold(n_splits=5, shuffle=True, random_state=42):
        """Return a configured KFold cross-validator."""

        return KFold(n_splits=n_splits, shuffle=shuffle, random_state=random_state)


    def train_linear_regression(X_train, y_train):
        """Train and return a LinearRegression model."""

        model = LinearRegression()
        model.fit(X_train, y_train)
        return model


    def evaluate_model(model, X_test, y_test):
        """Return the mean squared error of predictions."""

        predictions = model.predict(X_test)
        return mean_squared_error(y_test, predictions)


    def cross_validate_model(X, y, kfold=None):
        """Perform k-fold cross-validation and return per-fold and average MSEs."""

        if kfold is None:
            kfold = setup_kfold()

        mse_scores = []
        for train_index, test_index in kfold.split(X):
            X_train, X_test = X[train_index], X[test_index]
            y_train, y_test = y[train_index], y[test_index]
            model = train_linear_regression(X_train, y_train)
            mse_scores.append(evaluate_model(model, X_test, y_test))

        return mse_scores, float(np.mean(mse_scores))


    def main():
        X, y = generate_dataset()
        print(f"Generated a dataset with {X.shape[0]} samples.")
        print("-" * 30)

        print("Performing 5-fold cross-validation...")
        mse_scores, average_mse = cross_validate_model(X, y)
        for fold, mse in enumerate(mse_scores, start=1):
            print(f"Fold {fold}: MSE = {mse:.4f}")

        print("-" * 30)
        print(f"Average MSE across 5 folds: {average_mse:.4f}")
        print(
            "This average score is a more robust estimate of how the model will perform on unseen data."
        )
        print("-" * 30)


    if __name__ == "__main__":
        main()
    ```
