"""
Real-data loader for Case Study 11 — E-Commerce Customer Segmentation.

Downloads the actual "Online Retail II" dataset from the UCI Machine
Learning Repository and caches it locally as online_retail_ii.csv.

Dataset:  Online Retail II
Author:   Dr Daqing Chen, London South Bank University
Source:   https://archive.ics.uci.edu/dataset/502/online+retail+ii
License:  CC BY 4.0
Citation: Chen, D. (2019). Online Retail II [Dataset].
          UCI Machine Learning Repository. https://doi.org/10.24432/C5CG6D

Usage:
    pip install ucimlrepo
    python data_loader.py
"""

import pandas as pd

CACHE_FILE = "online_retail_ii.csv"


def load_online_retail_ii() -> pd.DataFrame:
    """Fetch the real UCI Online Retail II dataset (both sheets combined)."""
    from ucimlrepo import fetch_ucirepo

    dataset = fetch_ucirepo(id=502)
    # ucimlrepo splits features/targets; this dataset has no target column,
    # so everything of interest lives in .data.features
    df = dataset.data.features
    return df


if __name__ == "__main__":
    df = load_online_retail_ii()
    df.to_csv(CACHE_FILE, index=False)
    print(f"✅ Downloaded and cached {CACHE_FILE} — {len(df):,} rows")
    print(df.head())
