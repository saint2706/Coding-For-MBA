# Day 53 – Model Tuning and Feature Selection

Optimisation is the bridge between baseline models and production-grade performance. Day 53
introduces reproducible workflows for:

- Running grid search and Bayesian optimisation (via `skopt.BayesSearchCV`) to tune hyperparameters
  efficiently.
- Calculating permutation importance scores to quantify feature contributions.
- Applying recursive feature elimination (RFE) and evaluating the reduced feature set with
  cross-validation to check that accuracy holds steady.

Execute `python Day_53_Model_Tuning_and_Feature_Selection/solutions.py` to see both search
strategies in action alongside feature importance diagnostics.
