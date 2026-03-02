"""
Synthetic data generator for Case Study 07 — HR Attrition Prediction.
Run this first to create hr_employees.csv.

Usage:
    python data_generator.py
"""

import numpy as np
import pandas as pd

np.random.seed(42)
N = 5_000

departments = np.random.choice(
    ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"],
    N, p=[0.30, 0.20, 0.15, 0.10, 0.12, 0.13],
)
job_levels = np.random.choice([1, 2, 3, 4, 5], N, p=[0.30, 0.30, 0.20, 0.12, 0.08])
gender = np.random.choice(["Male", "Female", "Non-binary"], N, p=[0.48, 0.48, 0.04])
age = np.random.normal(35, 10, N).clip(22, 65).astype(int)
years_at_company = np.random.exponential(5, N).clip(0.5, 30).round(1)
years_since_last_promotion = np.random.exponential(2.5, N).clip(0, years_at_company).round(1)
monthly_salary = (3000 + job_levels * 2000 + np.random.normal(0, 800, N)).clip(2500, 25000).round(0).astype(int)
overtime = np.random.choice(["Yes", "No"], N, p=[0.30, 0.70])
commute_distance = np.random.exponential(10, N).clip(1, 50).round(1)
num_companies_worked = np.random.poisson(lam=2, size=N).clip(0, 10)
training_times = np.random.poisson(lam=3, size=N).clip(0, 10)

# Satisfaction scores (1-4 scale)
job_satisfaction = np.random.choice([1, 2, 3, 4], N, p=[0.10, 0.20, 0.40, 0.30])
environment_satisfaction = np.random.choice([1, 2, 3, 4], N, p=[0.12, 0.22, 0.38, 0.28])
relationship_satisfaction = np.random.choice([1, 2, 3, 4], N, p=[0.08, 0.18, 0.42, 0.32])
work_life_balance = np.random.choice([1, 2, 3, 4], N, p=[0.10, 0.25, 0.40, 0.25])
performance_rating = np.random.choice([1, 2, 3, 4], N, p=[0.05, 0.15, 0.55, 0.25])

# Attrition probability
attrition_score = (
    0.15 * (overtime == "Yes")
    + 0.12 * (1 - job_satisfaction / 4)
    + 0.10 * (1 - monthly_salary / 25000)
    + 0.10 * (years_since_last_promotion / 10)
    + 0.08 * (commute_distance / 50)
    + 0.08 * (1 - work_life_balance / 4)
    + 0.07 * (num_companies_worked / 10)
    + 0.05 * (1 - years_at_company / 30)
    + 0.05 * np.random.uniform(0, 1, N)
)
attrition_prob = 1 / (1 + np.exp(-6 * (attrition_score - 0.30)))
attrited = (np.random.uniform(0, 1, N) < attrition_prob).astype(int)

df = pd.DataFrame({
    "employee_id": [f"EMP_{i:05d}" for i in range(N)],
    "department": departments,
    "job_level": job_levels,
    "gender": gender,
    "age": age,
    "years_at_company": years_at_company,
    "years_since_last_promotion": years_since_last_promotion,
    "monthly_salary": monthly_salary,
    "overtime": overtime,
    "commute_distance": commute_distance,
    "num_companies_worked": num_companies_worked,
    "training_times_last_year": training_times,
    "job_satisfaction": job_satisfaction,
    "environment_satisfaction": environment_satisfaction,
    "relationship_satisfaction": relationship_satisfaction,
    "work_life_balance": work_life_balance,
    "performance_rating": performance_rating,
    "attrited": attrited,
})

df.to_csv("hr_employees.csv", index=False)
print(f"✅ Generated hr_employees.csv — {len(df)} employees, attrition rate: {attrited.mean():.1%}")
