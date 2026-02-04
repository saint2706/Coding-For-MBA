# %%
"""Day 70 – BI Metrics and Data Literacy classroom script."""

# %%
from __future__ import annotations

import pandas as pd
from Day_70_BI_Metrics_and_Data_Literacy import build_topic_dataframe, load_topics

# %%
TOPIC_GROUPS = load_topics()
TOPIC_FRAME = build_topic_dataframe()


# %%
def safe_divide(numerator: pd.Series, denominator: pd.Series) -> pd.Series:
    """Return a ratio with zero-protection for classroom demos."""

    safe_denominator = denominator.where(denominator != 0, pd.NA)
    return numerator.divide(safe_denominator).fillna(0)


# %%
def build_campaign_metrics() -> pd.DataFrame:
    """Create a sample campaign DataFrame with common KPIs."""

    campaign = pd.DataFrame(
        {
            "campaign": ["Email", "Paid Social", "Webinar"],
            "visits": [1200, 950, 420],
            "signups": [180, 140, 105],
            "purchases": [48, 32, 27],
            "revenue": [9600.0, 7200.0, 6750.0],
            "spend": [2800.0, 3400.0, 1800.0],
        }
    )

    metrics = campaign.assign(
        signup_rate=lambda df: safe_divide(df["signups"], df["visits"]),
        purchase_rate=lambda df: safe_divide(df["purchases"], df["signups"]),
        overall_conversion=lambda df: safe_divide(df["purchases"], df["visits"]),
        average_order_value=lambda df: safe_divide(df["revenue"], df["purchases"]),
        marketing_roi=lambda df: safe_divide(df["revenue"] - df["spend"], df["spend"]),
    )
    return metrics


# %%
def summarize_taxonomy(frame: pd.DataFrame) -> None:
    """Print the roadmap taxonomy for facilitation."""

    print("\nDay 70 taxonomy overview\n")
    print(frame.to_markdown(index=False))


# %%
def review_kpi_metrics(frame: pd.DataFrame) -> None:
    """Print the KPI DataFrame with formatted percentages for discussion."""

    formatted = frame.copy()
    percent_columns = [
        "signup_rate",
        "purchase_rate",
        "overall_conversion",
        "marketing_roi",
    ]
    for column in percent_columns:
        formatted[column] = (formatted[column] * 100).map("{:.1f}%".format)
    formatted["average_order_value"] = formatted["average_order_value"].map(
        "${:,.2f}".format
    )

    print("\nSample campaign KPI review\n")
    print(formatted.to_markdown(index=False))


# %%
def main() -> None:
    """Run the classroom demo for Day 70."""

    summarize_taxonomy(TOPIC_FRAME)
    kpi_frame = build_campaign_metrics()
    review_kpi_metrics(kpi_frame)


# %%
if __name__ == "__main__":
    main()
