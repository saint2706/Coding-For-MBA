"""
Real-data loader for Case Study 13 — Taxi Fleet Demand Forecasting.

Downloads one month of real NYC Yellow Taxi trip records plus the taxi
zone lookup table, directly from the TLC's public data CDN.

Dataset:  TLC Trip Record Data (Yellow Taxi)
Provider: NYC Taxi & Limousine Commission (NYC government agency)
Source:   https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page
License:  Public domain (NYC Open Data / open government data)

Usage:
    python data_loader.py [YYYY-MM]

    If no month is given, defaults to 2024-01. Any month TLC has
    published (see the "About" page above) can be substituted.
"""

import sys

import pandas as pd

BASE_URL = "https://d37ci6vzurychx.cloudfront.net/trip-data"
ZONE_LOOKUP_URL = "https://d37ci6vzurychx.cloudfront.net/misc/taxi_zone_lookup.csv"


def load_month(year_month: str = "2024-01") -> pd.DataFrame:
    """Download one month of real yellow taxi trip records as a DataFrame."""
    url = f"{BASE_URL}/yellow_tripdata_{year_month}.parquet"
    return pd.read_parquet(url)


def load_zone_lookup() -> pd.DataFrame:
    """Download the real TLC taxi zone lookup table (zone ID -> borough/zone name)."""
    return pd.read_csv(ZONE_LOOKUP_URL)


if __name__ == "__main__":
    year_month = sys.argv[1] if len(sys.argv) > 1 else "2024-01"

    trips = load_month(year_month)
    trips.to_parquet(f"yellow_tripdata_{year_month}.parquet", index=False)
    print(f"✅ Downloaded yellow_tripdata_{year_month}.parquet — {len(trips):,} trips")

    zones = load_zone_lookup()
    zones.to_csv("taxi_zone_lookup.csv", index=False)
    print(f"✅ Downloaded taxi_zone_lookup.csv — {len(zones)} zones")
