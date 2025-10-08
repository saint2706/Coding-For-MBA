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

## Additional Materials

- [solutions.py](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_41_Supervised_Learning_Regression/solutions.py)
