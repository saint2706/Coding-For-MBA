# Day 40: Introduction to Machine Learning & Core Concepts

## Overview

This lesson introduces the machine learning workflow and highlights how evaluation techniques ensure
reliable models. You'll generate data, configure cross-validation, train a linear model, and compute
mean squared error metrics.

> **Prerequisites:** Install scikit-learn with `pip install scikit-learn` before running the
> exercises.

## Key Concepts

- **Learning Paradigms:** Supervised, unsupervised, and reinforcement learning cover most ML
  problems and inform how we collect data and labels.
- **Bias–Variance Trade-off:** Balances model simplicity and flexibility; too much bias underfits,
  too much variance overfits.
- **Cross-Validation:** Splits data into multiple folds so every observation is used for both
  training and validation, yielding a robust performance estimate.

## Practice Exercises

1. **Dataset Generation:** `generate_dataset()` creates a noisy linear regression dataset for
   experimentation.
1. **Cross-Validation Setup:** `setup_kfold()` configures the resampling strategy, while
   `train_linear_regression()` and `evaluate_model()` encapsulate model training and scoring.
1. **Model Assessment:** `cross_validate_model()` runs the full loop and reports per-fold and
   average mean squared error.

## How to Use This Folder

- Run the worked examples: `python Day_40_Intro_to_ML/solutions.py`
- Execute the automated checks: `pytest tests/test_day_40.py`

### What's next?

Explore the full [Machine Learning Curriculum Roadmap](../docs/ml_curriculum.md) to see how the Day
40 lesson fits into a multi-phase path covering deep learning, responsible AI, and MLOps.
