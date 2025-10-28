# Day 39: Math Foundations - Calculus

## Overview

Calculus powers the optimisation routines that train machine learning models. Derivatives,
gradients, and the chain rule reveal how model parameters should change to reduce loss functions.

## Key Concepts

- **Derivatives:** Measure how a function changes with respect to its input; the slope guides the
  direction of parameter updates.
- **Gradients:** Vectors of partial derivatives for multivariate functions that point toward
  steepest ascent. Optimisation algorithms step in the opposite direction.
- **Chain Rule:** Provides the derivative of nested functions and forms the backbone of
  backpropagation in neural networks.

## Practice Exercises

1. **Symbolic Differentiation:** `symbolic_derivative()` returns a polynomial and its derivative
   using SymPy.
1. **Numerical Gradient:** `numerical_gradient()` estimates the gradient of `x^2*y + y^3` at
   `(2, 3)` via finite differences.
1. **Chain Rule Application:** `chain_rule_derivative()` expands `(2x + 1)^2` and differentiates it
   with respect to `x`.

## How to Use This Folder

- Run the worked examples: `python Day_39_Calculus/solutions.py`
- Execute the automated checks: `pytest tests/test_day_39.py`
