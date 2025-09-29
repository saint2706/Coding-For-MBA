# Day 42 · Supervised Learning – Classification (Part 1)

## What's in this folder?

- `solutions.py` – reusable helpers for loading the Iris dataset, scaling features, and training logistic regression and KNN classifiers with deterministic settings.
- `tests/test_day_42.py` – pytest coverage for the dataset preparation utilities and classification metrics.

## How to run the demo

```bash
python Day_42_Supervised_Learning_Classification_Part_1/solutions.py
```

This command trains both classifiers and prints their accuracy scores.

## Key functions

| Function | Description |
| --- | --- |
| `load_and_prepare_iris` | Splits the Iris dataset and returns both raw and standardised feature matrices. |
| `train_logistic_regression` | Fits a multi-class logistic regression model with a deterministic random seed. |
| `train_knn_classifier` | Trains a K-Nearest Neighbours classifier on the scaled features. |
| `evaluate_classifier` | Computes the accuracy score for a trained classifier. |
| `run_classification_demo` | Executes the full workflow and returns a metrics dictionary for both models. |

## Tests

Run the classification unit tests with:

```bash
pytest tests/test_day_42.py
```
