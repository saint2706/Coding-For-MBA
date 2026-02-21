"""
generate_data.py — Phase 2 Extras
Generates synthetic dirty datasets for Data Cleaning exercises.
"""
import pandas as pd
import numpy as np
import random
import csv
from pathlib import Path

random.seed(42)
np.random.seed(42)

def generate_dirty_customer_data(output_path: str = "dirty_customer_data.csv", n: int = 200):
    """Generate messy customer data for Phase 2 cleaning exercises."""
    names = ["John Doe", "jane smith", "BOB WILSON", "  Alice Jones  ","PRIYA SHARMA"]
    domains = ["@email.com", "@COMPANY.ORG", "@test.com", "@gmail.com"]
    phones = ["555-123-4567", "555.987.6543", "5551234568", "invalid-phone", "   "]

    rows = []
    for i in range(n):
        name = random.choice(names) if random.random() < 0.3 else f"Customer {i:03d}"
        email = f"user{i}{random.choice(domains)}"
        if random.random() < 0.1:
            email = email.upper()  # Dirty: uppercase email
        phone = random.choice(phones) if random.random() < 0.2 else f"555-{random.randint(100,999)}-{random.randint(1000,9999)}"
        rows.append({
            "Name": name,
            "Email": email,
            "Phone": phone,
            "Age": random.randint(18, 80) if random.random() > 0.05 else None,
            "City": random.choice(["Mumbai", "delhi", "BANGALORE", "  Chennai  ", None]),
            "Revenue": round(random.gauss(5000, 2000), 2) if random.random() > 0.05 else -random.randint(1, 1000),
        })

    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    print(f"Generated: {output_path} ({len(df)} rows)")
    return df


def generate_sales_data(output_path: str = "sales_2024.csv", n: int = 1000):
    """Generate clean(ish) sales data for Pandas exercises."""
    products = ["Laptop Pro", "Mouse WL", "Keyboard Mech", "Monitor 4K", "Headphones BT"]
    regions = ["North", "South", "East", "West"]

    rows = []
    for i in range(n):
        date = pd.Timestamp("2024-01-01") + pd.Timedelta(days=random.randint(0, 365))
        rows.append({
            "order_id": f"ORD-{i:05d}",
            "date": date.strftime("%Y-%m-%d"),
            "product": random.choice(products),
            "region": random.choice(regions),
            "quantity": random.randint(1, 10),
            "unit_price": round(random.uniform(20, 1500), 2),
            "discount_pct": random.choice([0, 5, 10, 15, 20]),
        })

    df = pd.DataFrame(rows)
    df["revenue"] = df["quantity"] * df["unit_price"] * (1 - df["discount_pct"] / 100)
    df["revenue"] = df["revenue"].round(2)
    df.to_csv(output_path, index=False)
    print(f"Generated: {output_path} ({len(df)} rows)")
    return df


if __name__ == "__main__":
    Path(".").mkdir(exist_ok=True)
    generate_dirty_customer_data()
    generate_sales_data()
    print("\nRun these for Phase 2 exercises:")
    print("  python generate_data.py")
    print("  # Then load with: pd.read_csv('dirty_customer_data.csv')")
