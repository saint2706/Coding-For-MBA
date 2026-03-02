"""
Synthetic data generator for Case Study 10 — Banking Credit Scoring.
Run this first to create credit_applications.csv.

Usage:
    python data_generator.py
"""

import numpy as np
import pandas as pd

np.random.seed(42)
N = 50_000

age = np.random.normal(38, 12, N).clip(18, 80).astype(int)
age_group = pd.cut(age, bins=[17, 25, 35, 50, 65, 100],
                   labels=["18-25", "26-35", "36-50", "51-65", "65+"])
gender = np.random.choice(["Male", "Female"], N, p=[0.52, 0.48])
annual_income = np.random.lognormal(mean=10.8, sigma=0.6, size=N).clip(15000, 500000).round(0)
employment_years = np.random.exponential(5, N).clip(0, 40).round(1)
credit_score = np.random.normal(680, 80, N).clip(300, 850).astype(int)
debt_to_income = np.random.beta(2, 5, N).clip(0, 0.8).round(3)
num_credit_lines = np.random.poisson(lam=5, size=N).clip(0, 20)
num_delinquencies = np.random.poisson(lam=0.5, size=N).clip(0, 10)
loan_amount = np.random.lognormal(mean=9.0, sigma=0.7, size=N).clip(1000, 50000).round(0)
loan_purpose = np.random.choice(
    ["Debt Consolidation", "Home Improvement", "Auto", "Education", "Personal"],
    N, p=[0.35, 0.20, 0.15, 0.10, 0.20],
)
months_since_last_delinq = np.where(
    num_delinquencies > 0,
    np.random.exponential(24, N).clip(1, 120).astype(int),
    -1  # no delinquency
)

# Default probability
default_score = (
    0.20 * (1 - credit_score / 850)
    + 0.15 * debt_to_income
    + 0.12 * (num_delinquencies / 10)
    + 0.10 * (1 - annual_income / 500000)
    + 0.08 * (loan_amount / 50000)
    + 0.08 * (1 - employment_years / 40)
    + 0.07 * (1 - age / 80)
    + 0.05 * np.random.uniform(0, 1, N)
)
default_prob = 1 / (1 + np.exp(-8 * (default_score - 0.30)))
default = (np.random.uniform(0, 1, N) < default_prob).astype(int)

df = pd.DataFrame({
    "application_id": [f"APP_{i:06d}" for i in range(N)],
    "age": age,
    "age_group": age_group,
    "gender": gender,
    "annual_income": annual_income.astype(int),
    "employment_years": employment_years,
    "credit_score": credit_score,
    "debt_to_income": debt_to_income,
    "num_credit_lines": num_credit_lines,
    "num_delinquencies": num_delinquencies,
    "months_since_last_delinq": months_since_last_delinq,
    "loan_amount": loan_amount.astype(int),
    "loan_purpose": loan_purpose,
    "default": default,
})

df.to_csv("credit_applications.csv", index=False)
print(f"✅ Generated credit_applications.csv — {len(df)} applications, "
      f"default rate: {default.mean():.1%}")
