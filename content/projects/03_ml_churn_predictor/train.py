"""
Project 03: ML Churn Predictor — Scaffold
==========================================
Phase 4–5 skills showcase.

Fill in every section marked TODO.
Run with:  python train.py
Expected output: "✅ Best model AUC-ROC: 0.8X — saved to models/churn_model.pkl"
"""

from __future__ import annotations

import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    RocCurveDisplay,
)
from sklearn.model_selection import (
    GridSearchCV,
    StratifiedKFold,
    train_test_split,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")

MODELS_DIR = Path("models")
MODELS_DIR.mkdir(exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# Synthetic dataset generator (produces a realistic churn dataset)
# ─────────────────────────────────────────────────────────────────────────────


def _generate_dataset(n_customers: int = 8000, seed: int = 42) -> pd.DataFrame:
    """Generate a synthetic telecom churn dataset."""
    rng = np.random.default_rng(seed)

    tenure = rng.integers(1, 72, size=n_customers)
    total_spend = (tenure * rng.uniform(30, 120, size=n_customers)).round(2)
    support_tickets = rng.integers(0, 10, size=n_customers)
    plan = rng.choice(["Basic", "Standard", "Premium"], size=n_customers, p=[0.3, 0.5, 0.2])

    # Churn probability driven by high support usage + low spend + short tenure
    logit = (
        -2.5
        + 0.05 * support_tickets
        - 0.01 * (total_spend / tenure)
        - 0.02 * tenure
        + rng.normal(0, 0.3, size=n_customers)
    )
    churn_prob = 1 / (1 + np.exp(-logit))
    churn = (rng.uniform(size=n_customers) < churn_prob).astype(int)

    return pd.DataFrame({
        "customer_id": [f"CUST_{i:06d}" for i in range(n_customers)],
        "tenure_months": tenure,
        "total_spend": total_spend,
        "support_tickets": support_tickets,
        "plan": plan,
        "churn": churn,
    })


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 1 — EDA & Feature Engineering (Phase 4)
# ─────────────────────────────────────────────────────────────────────────────


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create features for the churn model.

    TODO:
    1. Add 'avg_monthly_spend' = total_spend / tenure_months.
    2. Add 'support_rate'      = support_tickets / tenure_months.
    3. Add 'plan_encoded': map {"Basic": 0, "Standard": 1, "Premium": 2}.
    4. Drop the original 'plan' and 'customer_id' columns.
    5. Fill any remaining NaN values with column medians.
    6. Print the class distribution of the 'churn' column.
    7. Return the feature-engineered DataFrame.
    """
    df = df.copy()

    # Your implementation here...
    raise NotImplementedError("Implement engineer_features()")


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 2 — Baseline Logistic Regression (Phase 4)
# ─────────────────────────────────────────────────────────────────────────────


def build_baseline(X_train: pd.DataFrame, y_train: pd.Series) -> Pipeline:
    """
    Train a Logistic Regression baseline pipeline.

    TODO:
    1. Create a Pipeline with steps:
       - ('scaler', StandardScaler())
       - ('clf', LogisticRegression(class_weight="balanced", max_iter=1000))
    2. Fit the pipeline on X_train, y_train.
    3. Return the fitted pipeline.
    """
    # Your implementation here...
    raise NotImplementedError("Implement build_baseline()")


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 3 — GradientBoosting with Hyperparameter Tuning (Phase 5)
# ─────────────────────────────────────────────────────────────────────────────


def build_best_model(X_train: pd.DataFrame, y_train: pd.Series) -> Pipeline:
    """
    Train a GradientBoostingClassifier with GridSearchCV.

    TODO:
    1. Create a Pipeline: ('clf', GradientBoostingClassifier()).
    2. Define a param_grid, e.g.:
       {
           "clf__n_estimators": [100, 200],
           "clf__max_depth": [3, 5],
           "clf__learning_rate": [0.05, 0.1],
       }
    3. Run GridSearchCV with cv=StratifiedKFold(5), scoring="roc_auc".
    4. Print the best params and best CV AUC.
    5. Return the best_estimator_.

    Hint:
        search = GridSearchCV(pipe, param_grid, cv=StratifiedKFold(5),
                              scoring="roc_auc", n_jobs=-1)
        search.fit(X_train, y_train)
        print("Best params:", search.best_params_)
        print("Best CV AUC:", search.best_score_)
        return search.best_estimator_
    """
    # Your implementation here...
    raise NotImplementedError("Implement build_best_model()")


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 4 — Evaluation & Explainability (Phase 5)
# ─────────────────────────────────────────────────────────────────────────────


def evaluate_model(model: Pipeline, X_test: pd.DataFrame, y_test: pd.Series, name: str) -> float:
    """
    Print classification report and AUC-ROC. Return the AUC score.

    TODO:
    1. Generate predictions: y_pred = model.predict(X_test).
    2. Generate probabilities: y_prob = model.predict_proba(X_test)[:, 1].
    3. Print name, classification_report(y_test, y_pred), and
       f"AUC-ROC: {roc_auc_score(y_test, y_prob):.4f}".
    4. Return roc_auc_score(y_test, y_prob).
    """
    # Your implementation here...
    raise NotImplementedError("Implement evaluate_model()")


def explain_model(model: Pipeline, X_test: pd.DataFrame) -> None:
    """
    Compute and print SHAP feature importances (top 5 features).

    TODO:
    1. Import shap.
    2. Create a shap.Explainer from the fitted classifier step (model[-1]).
    3. Compute shap_values on X_test (a sample of 200 rows is fine).
    4. Print the top 5 features by mean |SHAP value|.
    5. (Stretch) Plot shap.plots.bar(shap_values).

    Hint:
        import shap
        explainer = shap.Explainer(model[-1], X_test)
        shap_values = explainer(X_test.sample(200))
    """
    # Your implementation here...
    pass  # SHAP is optional; replace `pass` with your implementation


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 5 — Serialise & Predict (Phase 5)
# ─────────────────────────────────────────────────────────────────────────────


def save_model(model: Pipeline, path: Path = MODELS_DIR / "churn_model.pkl") -> None:
    """
    Save the fitted pipeline with joblib.

    TODO:
    1. Call joblib.dump(model, path).
    2. Print f"Model saved → {path}".
    """
    # Your implementation here...
    raise NotImplementedError("Implement save_model()")


def predict_churn(customer: dict, model_path: Path = MODELS_DIR / "churn_model.pkl") -> dict:
    """
    Load the model and return a churn prediction for a single customer.

    Expected input dict keys: tenure_months, total_spend, support_tickets,
    avg_monthly_spend, support_rate, plan_encoded.

    TODO:
    1. Load the model with joblib.load(model_path).
    2. Convert customer dict to a single-row DataFrame.
    3. Get probability: prob = model.predict_proba(df)[0, 1].
    4. Return {"churn_probability": round(prob, 4), "churn_flag": prob >= 0.5}.
    """
    # Your implementation here...
    raise NotImplementedError("Implement predict_churn()")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────


if __name__ == "__main__":
    print("=" * 55)
    print("  TelecomX Churn Predictor — Training Pipeline")
    print("=" * 55)

    print("\n[1/5] Generating dataset and engineering features...")
    raw = _generate_dataset()
    df = engineer_features(raw)

    FEATURE_COLS = [c for c in df.columns if c != "churn"]
    X = df[FEATURE_COLS]
    y = df["churn"]

    print(f"\n[2/5] Splitting data (80/20 stratified) — {len(X):,} rows, "
          f"{y.mean():.1%} churn rate...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    print("\n[3/5] Training baseline (Logistic Regression)...")
    baseline = build_baseline(X_train, y_train)
    baseline_auc = evaluate_model(baseline, X_test, y_test, "Baseline (LR)")

    print("\n[4/5] Training best model (GradientBoosting + tuning)...")
    best_model = build_best_model(X_train, y_train)
    best_auc = evaluate_model(best_model, X_test, y_test, "Best (GBM)")

    print("\n[4b/5] Explaining best model with SHAP...")
    explain_model(best_model, X_test)

    print("\n[5/5] Saving best model...")
    save_model(best_model)
    print(f"\n✅ Best model AUC-ROC: {best_auc:.2f} — saved to {MODELS_DIR}/churn_model.pkl")

    # Quick smoke-test of predict_churn()
    sample = X_test.iloc[0].to_dict()
    result = predict_churn(sample)
    print(f"\nSample prediction: {result}")
