---
title: 'Day 44: Unsupervised Learning'
tags:
- ML
---
# Day 44: Unsupervised Learning

## Overview

Day 44 introduces two foundational unsupervised learning workflows:

- **K-Means clustering** groups unlabeled observations into clusters using distance to learned
  centroids.
- **Principal Component Analysis (PCA)** compresses high-dimensional data into a smaller number of
  orthogonal components for easier visualization and downstream modeling.

Install scikit-learn before running the examples:

```bash
pip install scikit-learn
```

## What's inside

- `solutions.py` – reusable functions for generating blob data, fitting K-Means, and projecting
  datasets with PCA. Executing the file still creates the original visualisations.
- `README.md` – lesson summary (this document).

## Running the lesson script

Execute the scripted walkthrough, which will save clustering and PCA plots to the project directory:

```bash
python Day_44_Unsupervised_Learning/solutions.py
```

## Running the tests

Automated tests validate the reusable helpers. Run just the Day 44 checks with:

```bash
pytest tests/test_day_44.py
```

To execute the entire suite, simply call `pytest` from the repository root.

## Further exploration

- Experiment with different numbers of clusters in `fit_kmeans` to observe how centroids move.
- Try increasing the number of PCA components and inspect the cumulative explained variance to
  decide how many dimensions to keep.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 43 – Day 43 · Supervised Learning – Classification (Part 2)](../Day_43_Supervised_Learning_Classification_Part_2/README.md) • **Next:** [Day 45 – Day 45: Feature Engineering & Model Evaluation](../Day_45_Feature_Engineering_and_Evaluation/README.md)

_You are on lesson 44 of 108._

<!-- LESSON_FOOTER_END -->