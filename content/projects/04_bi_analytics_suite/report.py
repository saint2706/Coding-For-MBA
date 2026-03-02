"""
Project 04: BI Analytics Suite — Python Report Builder Scaffold
===============================================================
Phase 6–7 skills showcase.

Fill in every section marked TODO.
Run with:  python report.py
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

import pandas as pd

DB_PATH = Path("bi_analytics.db")
SQL_FILE = Path("queries.sql")
OUTPUT_DIR = Path("output")


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 7 — Python Report Builder
# ─────────────────────────────────────────────────────────────────────────────


def setup_database() -> sqlite3.Connection:
    """
    Create the database and run queries.sql to set up schema and seed data.

    TODO:
    1. Open a sqlite3.connect(DB_PATH) connection.
    2. Read the SQL file with SQL_FILE.read_text().
    3. Execute it with conn.executescript(sql).
    4. Commit and return the connection.
    """
    # Your implementation here...
    raise NotImplementedError("Implement setup_database()")


def load_view(conn: sqlite3.Connection, view_name: str) -> pd.DataFrame:
    """
    Run SELECT * FROM <view_name> and return the result as a DataFrame.

    TODO:
    1. Use pd.read_sql(f"SELECT * FROM {view_name}", conn).
    2. Return the DataFrame.
    """
    # Your implementation here...
    raise NotImplementedError("Implement load_view()")


def print_summary(df: pd.DataFrame, title: str) -> None:
    """
    Print a formatted summary table to the console.

    TODO:
    1. Print a header line: f"\n{'='*55}\n  {title}\n{'='*55}".
    2. Print df.to_string(index=False).
    """
    # Your implementation here...
    raise NotImplementedError("Implement print_summary()")


def save_chart(df: pd.DataFrame, x: str, y: str, title: str, filename: str) -> None:
    """
    Save a simple matplotlib bar chart to output/<filename>.

    TODO:
    1. Import matplotlib.pyplot as plt.
    2. Create OUTPUT_DIR with mkdir(exist_ok=True).
    3. Plot df.plot.bar(x=x, y=y, title=title, figsize=(10, 5), legend=False).
    4. Save to OUTPUT_DIR / filename with tight_layout().
    5. Print f"  Chart saved → {OUTPUT_DIR / filename}".

    Hint:
        import matplotlib.pyplot as plt
        ax = df.plot.bar(x=x, y=y, title=title, figsize=(10, 5), legend=False)
        ax.figure.tight_layout()
        ax.figure.savefig(OUTPUT_DIR / filename)
        plt.close()
    """
    # Your implementation here...
    raise NotImplementedError("Implement save_chart()")


if __name__ == "__main__":
    print("=" * 55)
    print("  MarketingCo BI Analytics Suite")
    print("=" * 55)

    conn = setup_database()

    print("\n[1/5] Channel ROI...")
    roi_df = load_view(conn, "vw_channel_roi")
    print_summary(roi_df, "Channel ROI")
    save_chart(roi_df, x="month", y="roi_pct", title="Channel ROI (%)", filename="roi.png")

    print("\n[2/5] Funnel Analysis...")
    funnel_df = load_view(conn, "vw_funnel")
    print_summary(funnel_df, "Funnel Analysis")

    print("\n[3/5] Attribution...")
    attr_df = load_view(conn, "vw_attribution")
    print_summary(attr_df, "Multi-Touch Attribution")

    print("\n[4/5] Cohort Retention...")
    cohort_df = load_view(conn, "vw_cohort_retention")
    print_summary(cohort_df, "Cohort Retention")

    print("\n[5/5] CTR Anomalies...")
    anomaly_df = load_view(conn, "vw_ctr_anomalies")
    flagged = anomaly_df[anomaly_df.get("is_anomaly", pd.Series(0)) == 1]
    print(f"  {len(flagged)} anomalous days detected.")

    conn.close()
    print("\n✅ BI Analytics Suite complete — charts saved to output/")
