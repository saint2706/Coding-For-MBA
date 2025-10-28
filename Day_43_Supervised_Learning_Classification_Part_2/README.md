# Day 43 · Supervised Learning – Classification (Part 2)

## What's in this folder?

- `solutions.py` – modular helpers for preparing the Iris dataset, fitting SVM and decision tree
  classifiers, and evaluating them.
- `tests/test_day_43.py` – pytest checks covering dataset preparation and accuracy scoring for both
  models.

## How to run the demo

```bash
python Day_43_Supervised_Learning_Classification_Part_2/solutions.py
```

This command trains the SVM and decision tree models, printing their accuracy scores.

## Key functions

| Function | Description | | --- | --- | | `load_and_prepare_iris` | Splits and scales the Iris
dataset for use with multiple classifiers. | | `train_svm_classifier` | Trains a deterministic SVM
classifier using the RBF kernel. | | `train_decision_tree_classifier` | Fits a decision tree
classifier with a fixed random seed. | | `evaluate_classifier` | Computes accuracy for a fitted
classifier. | | `run_classification_demo` | Executes the full workflow and returns accuracy metrics
for both models. |

## Tests

Run the advanced classification unit tests with:

```bash
pytest tests/test_day_43.py
```
