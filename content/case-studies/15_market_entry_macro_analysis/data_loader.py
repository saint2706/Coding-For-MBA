"""
Real-data loader for Case Study 15 — Market-Entry Strategy with Real Macro
Data.

Pulls real macroeconomic indicators for a shortlist of candidate countries
directly from the World Bank's public Open Data API. No API key required.

Dataset:  World Development Indicators (WDI)
Provider: The World Bank
Source:   https://data.worldbank.org/
License:  CC BY 4.0

Usage:
    pip install pandas-datareader
    python data_loader.py
"""

import pandas as pd

CACHE_FILE = "macro_indicators.csv"

CANDIDATE_COUNTRIES = ["BR", "IN", "ID", "MX", "VN", "NG", "PL", "ZA"]

INDICATORS = [
    "NY.GDP.MKTP.KD.ZG",  # GDP growth (annual %)
    "FP.CPI.TOTL.ZG",  # Inflation, consumer prices (annual %)
    "SL.UEM.TOTL.ZS",  # Unemployment (% of labor force)
    "IT.NET.USER.ZS",  # Individuals using the Internet (% of population)
    "SP.POP.TOTL",  # Total population
]


def load_macro_indicators(start_year: int = 2014, end_year: int = 2023) -> pd.DataFrame:
    """Fetch real World Bank indicators for the candidate countries."""
    from pandas_datareader import wb

    raw = wb.download(
        indicator=INDICATORS,
        country=CANDIDATE_COUNTRIES,
        start=start_year,
        end=end_year,
    ).reset_index()
    long_df = raw.melt(
        id_vars=["country", "year"],
        value_vars=INDICATORS,
        var_name="indicator",
        value_name="value",
    )
    return long_df


if __name__ == "__main__":
    df = load_macro_indicators()
    df.to_csv(CACHE_FILE, index=False)
    print(f"✅ Downloaded and cached {CACHE_FILE} — {len(df):,} rows")
    print(df["country"].unique())
