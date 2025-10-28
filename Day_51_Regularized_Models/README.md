# Day 51 – Regularised Models

This lesson extends the regression toolkit with L2 (ridge), L1 (lasso), and elastic net penalties
before introducing generalised linear models (GLMs). The core notebook and `solutions.py` module
walk through the following:

- Building a reproducible synthetic regression dataset and benchmarking ridge, lasso, and elastic
  net pipelines with cross-validation.
- Measuring coefficient shrinkage to understand how regularisation combats overfitting and
  highlights the most important predictors.
- Training a Poisson regression GLM for count outcomes so you can generalise linear modelling
  concepts beyond ordinary least squares.

Run `python Day_51_Regularized_Models/solutions.py` to execute the full demo and review the printed
comparison table.
