"""
Real-data loader for Case Study 14 — Credit Card Fraud Detection.

Downloads the actual "Credit Card Fraud Detection" dataset — real,
anonymised European cardholder transactions from September 2013 — via
Kaggle.

Dataset:  Credit Card Fraud Detection
Providers: Worldline and the Machine Learning Group, Universite Libre
           de Bruxelles (ULB)
Source:   https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
License:  Open Database License (ODbL) v1.0
Citation: Dal Pozzolo, A., Caelen, O., Johnson, R.A., & Bontempi, G. (2015).
          "Calibrating Probability with Undersampling for Unbalanced
          Classification." IEEE SSCI.

Usage:
    pip install kagglehub
    Set up a free Kaggle account + API token (~/.kaggle/kaggle.json),
    see https://www.kaggle.com/docs/api
    python data_loader.py
"""

from pathlib import Path

import pandas as pd

CACHE_FILE = "creditcard.csv"


def load_creditcard_fraud() -> pd.DataFrame:
    """Fetch the real ULB/Kaggle credit card fraud dataset."""
    import kagglehub

    dataset_path = Path(kagglehub.dataset_download("mlg-ulb/creditcardfraud"))
    csv_path = next(dataset_path.glob("*.csv"))
    return pd.read_csv(csv_path)


if __name__ == "__main__":
    df = load_creditcard_fraud()
    df.to_csv(CACHE_FILE, index=False)
    print(f"✅ Downloaded and cached {CACHE_FILE} — {len(df):,} rows")
    print(df["Class"].value_counts(normalize=True) * 100)
