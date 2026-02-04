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
