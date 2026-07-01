"""
Real-data loader for Case Study 12 — Bank Telemarketing Conversion.

Downloads the actual "Bank Marketing" dataset from the UCI Machine
Learning Repository and caches it locally as bank_marketing.csv.

Dataset:  Bank Marketing
Authors:  Sergio Moro, Paulo Rita, Paulo Cortez
Source:   https://archive.ics.uci.edu/dataset/222/bank+marketing
License:  CC BY 4.0
Citation: Moro, S., Rita, P., & Cortez, P. (2014). Bank Marketing [Dataset].
          UCI Machine Learning Repository. https://doi.org/10.24432/C5K306

Usage:
    pip install ucimlrepo
    python data_loader.py
"""

import pandas as pd

CACHE_FILE = "bank_marketing.csv"


def load_bank_marketing() -> pd.DataFrame:
    """Fetch the real UCI Bank Marketing dataset (features + target)."""
    from ucimlrepo import fetch_ucirepo

    dataset = fetch_ucirepo(id=222)
    df = dataset.data.features.copy()
    df["y"] = dataset.data.targets["y"]
    return df


if __name__ == "__main__":
    df = load_bank_marketing()
    df.to_csv(CACHE_FILE, index=False)
    print(f"✅ Downloaded and cached {CACHE_FILE} — {len(df):,} rows")
    print(df["y"].value_counts(normalize=True))
