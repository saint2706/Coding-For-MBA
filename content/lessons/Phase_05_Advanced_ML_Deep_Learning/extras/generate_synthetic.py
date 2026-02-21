"""
generate_synthetic.py — Phase 5 Extras
Generates synthetic ML datasets for hands-on exercises.
Covers: movie reviews (NLP), stock prices (time series), employee attrition (tabular ML).
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

np.random.seed(42)
random.seed(42)


def generate_movie_reviews(output_path: str = "movie_reviews.csv", n: int = 2000):
    """
    Generate labeled movie reviews dataset for NLP classification exercises.
    Labels: positive (1) or negative (0).
    """
    positive_templates = [
        "An absolute masterpiece. {} was breathtaking.",
        "I loved every minute of this film. {} shines brilliantly.",
        "A cinematic triumph. The direction and {} are outstanding.",
        "Easily one of the best films I've seen. {} is unforgettable.",
        "Brilliant storytelling. {} gave a career-defining performance.",
    ]
    negative_templates = [
        "Completely unwatchable. {} was a total disappointment.",
        "A waste of two hours. {} could not save this disaster.",
        "I fell asleep halfway through. {} was painfully dull.",
        "Terrible script and worse acting. {} should know better.",
        "One of the worst films in years. {} was miscast and lifeless.",
    ]
    actors = ["The lead actor", "The cast", "The director", "The ensemble", "The hero"]

    reviews = []
    for i in range(n):
        is_positive = random.random() > 0.4
        templates = positive_templates if is_positive else negative_templates
        text = random.choice(templates).format(random.choice(actors))
        # Add noise words
        noise = random.choice(["", " Highly recommended.", " Skip it at all costs.", "", " Worth watching once."])
        reviews.append({
            "review_id": f"REV-{i:05d}",
            "text": text + noise,
            "sentiment": int(is_positive),
            "rating": random.randint(7, 10) if is_positive else random.randint(1, 4),
        })

    df = pd.DataFrame(reviews)
    df.to_csv(output_path, index=False)
    print(f"Generated: {output_path} ({len(df)} rows, {df['sentiment'].mean():.1%} positive)")
    return df


def generate_stock_prices(output_path: str = "stock_prices.csv", days: int = 730):
    """
    Generate synthetic daily stock price data (geometric Brownian motion) for time-series exercises.
    Covers 5 tickers over 2 years.
    """
    tickers = ["NXUS", "VELO", "PERI", "ARCO", "QDRA"]
    start_prices = {"NXUS": 120, "VELO": 45, "PERI": 280, "ARCO": 95, "QDRA": 1500}
    volatilities = {"NXUS": 0.018, "VELO": 0.025, "PERI": 0.015, "ARCO": 0.022, "QDRA": 0.020}

    rows = []
    base_date = datetime(2024, 1, 1)

    for ticker in tickers:
        price = start_prices[ticker]
        vol = volatilities[ticker]
        drift = 0.0003  # Daily drift ~8% annual

        for day in range(days):
            date = base_date + timedelta(days=day)
            if date.weekday() >= 5:  # Skip weekends
                continue
            # Geometric Brownian Motion
            shock = np.random.normal(drift, vol)
            price = price * (1 + shock)
            open_price = price * random.uniform(0.99, 1.01)
            high = max(price, open_price) * random.uniform(1.001, 1.02)
            low = min(price, open_price) * random.uniform(0.98, 0.999)
            volume = int(abs(np.random.normal(1_000_000, 200_000)))
            rows.append({
                "date": date.strftime("%Y-%m-%d"),
                "ticker": ticker,
                "open": round(open_price, 2),
                "high": round(high, 2),
                "low": round(low, 2),
                "close": round(price, 2),
                "volume": volume,
            })

    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    print(f"Generated: {output_path} ({len(df)} rows, {len(tickers)} tickers)")
    return df


def generate_employee_attrition(output_path: str = "employee_attrition.csv", n: int = 1500):
    """
    Generate HR employee attrition dataset for tabular ML classification.
    Target: Attrition (1=Left, 0=Stayed)
    """
    departments = ["Engineering", "Sales", "Marketing", "Finance", "HR", "Operations"]
    job_levels = [1, 2, 3, 4, 5]

    rows = []
    for i in range(n):
        salary = random.gauss(80000, 25000)
        satisfaction = random.randint(1, 5)
        years_at_company = random.randint(0, 20)
        dept = random.choice(departments)
        job_level = random.choice(job_levels)
        monthly_overtime_hrs = random.randint(0, 60)

        # Attrition is higher with low satisfaction, high overtime, low salary
        attrition_prob = (
            0.05 +
            (5 - satisfaction) * 0.04 +
            monthly_overtime_hrs / 60 * 0.15 +
            (50000 - max(40000, salary)) / 50000 * 0.1 +
            (10 - min(10, years_at_company)) / 10 * 0.08
        )
        attrition_prob = min(0.85, max(0.02, attrition_prob))
        attrition = int(random.random() < attrition_prob)

        rows.append({
            "employee_id": f"EMP-{i:05d}",
            "department": dept,
            "job_level": job_level,
            "annual_salary": round(max(30000, salary), 2),
            "job_satisfaction": satisfaction,
            "years_at_company": years_at_company,
            "monthly_overtime_hrs": monthly_overtime_hrs,
            "num_promotions": random.randint(0, min(5, years_at_company // 3 + 1)),
            "has_remote": random.choice([0, 1]),
            "attrition": attrition,
        })

    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    attrition_rate = df["attrition"].mean()
    print(f"Generated: {output_path} ({len(df)} rows, {attrition_rate:.1%} attrition rate)")
    return df


if __name__ == "__main__":
    print("Generating Phase 5 synthetic datasets...\n")
    generate_movie_reviews()
    generate_stock_prices()
    generate_employee_attrition()
    print("\nAll done! Use these in Phase 5 exercises:")
    print("  movie_reviews.csv      → NLP, sentiment classification (Day 53)")
    print("  stock_prices.csv       → Time series, LSTM forecasting (Day 56)")
    print("  employee_attrition.csv → Tabular ML, Gradient Boosting (Day 52)")
