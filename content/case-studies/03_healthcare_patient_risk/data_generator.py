"""
Synthetic data generator for Case Study 03 — Healthcare Patient Risk.
Run this first to create patient_encounters.csv.

Usage:
    python data_generator.py
"""

import numpy as np
import pandas as pd

np.random.seed(42)
N = 20_000

age = np.random.normal(65, 15, N).clip(18, 100).astype(int)
gender = np.random.choice(["M", "F"], N, p=[0.48, 0.52])
insurance = np.random.choice(["Medicare", "Medicaid", "Private", "Self-pay"], N,
                             p=[0.40, 0.20, 0.30, 0.10])
diagnosis = np.random.choice(
    ["Heart Failure", "Pneumonia", "COPD", "Hip Replacement", "Sepsis", "Stroke"],
    N, p=[0.20, 0.18, 0.15, 0.12, 0.15, 0.20],
)
length_of_stay = np.random.lognormal(mean=1.2, sigma=0.6, size=N).clip(1, 30).astype(int)
num_medications = np.random.poisson(lam=7, size=N).clip(0, 25)
prior_admissions = np.random.poisson(lam=1.2, size=N).clip(0, 10)
ed_visits_6m = np.random.poisson(lam=0.8, size=N).clip(0, 8)

has_diabetes = np.random.binomial(1, 0.30, N)
has_heart_failure = np.random.binomial(1, 0.20, N)
has_copd = np.random.binomial(1, 0.15, N)
has_renal_disease = np.random.binomial(1, 0.12, N)

hemoglobin = np.random.normal(12.5, 2.5, N).clip(5, 20).round(1)
creatinine = np.random.lognormal(mean=0.0, sigma=0.5, size=N).clip(0.3, 10).round(2)
sodium = np.random.normal(140, 4, N).clip(120, 160).round(0).astype(int)

# Introduce ~5% missing values in lab columns
for col_data in [hemoglobin, creatinine, sodium]:
    mask = np.random.random(N) < 0.05
    col_data[mask] = np.nan

# Readmission probability
comorbidity = has_diabetes + has_heart_failure + has_copd + has_renal_disease
readmit_score = (
    0.15 * (age / 100)
    + 0.20 * (comorbidity / 4)
    + 0.15 * (prior_admissions / 10)
    + 0.10 * (length_of_stay / 30)
    + 0.10 * (num_medications / 25)
    + 0.10 * (ed_visits_6m / 8)
    + 0.10 * np.where(np.isnan(hemoglobin), 0.5, (hemoglobin < 10) * 1.0)
    + 0.10 * np.random.uniform(0, 1, N)
)
readmit_prob = 1 / (1 + np.exp(-6 * (readmit_score - 0.35)))
readmitted = (np.random.uniform(0, 1, N) < readmit_prob).astype(int)

df = pd.DataFrame({
    "patient_id": [f"PAT_{i:06d}" for i in range(N)],
    "age": age,
    "gender": gender,
    "insurance_type": insurance,
    "primary_diagnosis": diagnosis,
    "length_of_stay": length_of_stay,
    "num_medications": num_medications,
    "prior_admissions_12m": prior_admissions,
    "ed_visits_6m": ed_visits_6m,
    "has_diabetes": has_diabetes,
    "has_heart_failure": has_heart_failure,
    "has_copd": has_copd,
    "has_renal_disease": has_renal_disease,
    "hemoglobin": hemoglobin,
    "creatinine": creatinine,
    "sodium": sodium,
    "readmitted_30d": readmitted,
})

df.to_csv("patient_encounters.csv", index=False)
print(f"✅ Generated patient_encounters.csv — {len(df)} rows, readmission rate: {readmitted.mean():.1%}")
