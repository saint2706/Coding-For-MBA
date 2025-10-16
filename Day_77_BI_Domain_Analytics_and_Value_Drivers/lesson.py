# %%
"""Day 77 – BI Domain Analytics and Value Drivers classroom script."""

# %%
from __future__ import annotations

from pathlib import Path
from typing import Iterable, Mapping

import pandas as pd

from Day_77_BI_Domain_Analytics_and_Value_Drivers import (
    DOMAIN_GROUPS,
    calculate_operations_kpis,
    calculate_revenue_kpis,
    calculate_vertical_kpis,
    load_domain_topics,
)

# %%
TOPIC_GROUPS = load_domain_topics()

# %%
DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "fortune1000_final.csv"

# %%
REVENUE_SCENARIOS: tuple[dict[str, object], ...] = (
    {
        "title": "Sales Performance",
        "total_revenue": 1_250_000.0,
        "marketing_spend": 185_000.0,
        "customer_count": 420,
        "retained_customers": 378,
        "fraud_loss": 12_500.0,
        "compliance_cost": 8_900.0,
    },
    {
        "title": "Marketing Campaigns",
        "total_revenue": 980_000.0,
        "marketing_spend": 210_000.0,
        "customer_count": 320,
        "retained_customers": 244,
        "fraud_loss": 5_200.0,
        "compliance_cost": 6_400.0,
    },
    {
        "title": "CLV",
        "total_revenue": 1_430_000.0,
        "marketing_spend": 165_000.0,
        "customer_count": 510,
        "retained_customers": 459,
        "fraud_loss": 9_800.0,
        "compliance_cost": 7_600.0,
    },
    {
        "title": "Risk Analytics",
        "total_revenue": 890_000.0,
        "marketing_spend": 120_000.0,
        "customer_count": 280,
        "retained_customers": 250,
        "fraud_loss": 21_000.0,
        "compliance_cost": 11_500.0,
    },
    {
        "title": "Fraud Detection",
        "total_revenue": 760_000.0,
        "marketing_spend": 92_000.0,
        "customer_count": 240,
        "retained_customers": 222,
        "fraud_loss": 8_100.0,
        "compliance_cost": 9_200.0,
    },
    {
        "title": "Compliance Reporting",
        "total_revenue": 640_000.0,
        "marketing_spend": 75_000.0,
        "customer_count": 210,
        "retained_customers": 198,
        "fraud_loss": 3_800.0,
        "compliance_cost": 12_500.0,
    },
)

# %%
OPERATIONS_SCENARIOS: tuple[dict[str, object], ...] = (
    {
        "title": "Inventory Optimization",
        "beginning_inventory": 420_000.0,
        "ending_inventory": 395_000.0,
        "cost_of_goods_sold": 980_000.0,
        "downtime_hours": 16.0,
        "scheduled_hours": 200.0,
        "defective_units": 120,
        "total_units": 12_800,
    },
    {
        "title": "Supply Chain Analytics",
        "beginning_inventory": 510_000.0,
        "ending_inventory": 470_000.0,
        "cost_of_goods_sold": 1_250_000.0,
        "downtime_hours": 24.0,
        "scheduled_hours": 240.0,
        "defective_units": 150,
        "total_units": 14_500,
    },
    {
        "title": "Supply chain optimization",
        "beginning_inventory": 365_000.0,
        "ending_inventory": 358_000.0,
        "cost_of_goods_sold": 1_080_000.0,
        "downtime_hours": 12.0,
        "scheduled_hours": 180.0,
        "defective_units": 98,
        "total_units": 11_200,
    },
    {
        "title": "Predictive Maintenance",
        "beginning_inventory": 412_000.0,
        "ending_inventory": 400_000.0,
        "cost_of_goods_sold": 1_010_000.0,
        "downtime_hours": 9.0,
        "scheduled_hours": 210.0,
        "defective_units": 82,
        "total_units": 12_050,
    },
    {
        "title": "Production Efficiency",
        "beginning_inventory": 335_000.0,
        "ending_inventory": 342_000.0,
        "cost_of_goods_sold": 925_000.0,
        "downtime_hours": 18.0,
        "scheduled_hours": 195.0,
        "defective_units": 132,
        "total_units": 13_480,
    },
    {
        "title": "Quality Control",
        "beginning_inventory": 288_000.0,
        "ending_inventory": 274_000.0,
        "cost_of_goods_sold": 845_000.0,
        "downtime_hours": 11.0,
        "scheduled_hours": 188.0,
        "defective_units": 64,
        "total_units": 10_400,
    },
)

# %%
VERTICAL_DEFAULTS = {
    "finance_revenue": 2_750_000.0,
    "finance_cost": 1_980_000.0,
    "retail_orders": 18_500,
    "retail_returns": 1_020,
    "healthcare_patients": 860,
    "healthcare_beds": 920,
    "hr_headcount": 620,
    "hr_separations": 48,
    "manufacturing_units_produced": 32_500,
    "manufacturing_units_defective": 1_040,
}

# %%

def load_fortune_1000(path: Path = DATA_PATH) -> pd.DataFrame:
    """Load a cleaned slice of the Fortune 1000 dataset for classroom demos."""

    frame = pd.read_csv(path)
    numeric_columns = ["Revenues ($M)", "Profits ($M)", "Assets ($M)"]
    for column in numeric_columns:
        frame[column] = (
            frame[column]
            .astype(str)
            .str.replace("$", "", regex=False)
            .str.replace(",", "", regex=False)
            .str.replace(" ", "", regex=False)
            .str.replace("\"", "", regex=False)
        )
        frame[column] = pd.to_numeric(frame[column], errors="coerce")
    return frame.dropna(subset=numeric_columns)


# %%

def build_revenue_dashboard() -> pd.DataFrame:
    """Return a table summarizing revenue-facing KPI stories."""

    records: list[dict[str, object]] = []
    for scenario in REVENUE_SCENARIOS:
        metrics = calculate_revenue_kpis(
            **{key: value for key, value in scenario.items() if key != "title"}
        )
        for metric, value in metrics.items():
            records.append({
                "domain": scenario["title"],
                "metric": metric,
                "value": value,
            })
    return pd.DataFrame(records)


# %%

def build_operations_dashboard() -> pd.DataFrame:
    """Return KPIs for manufacturing and supply chain storytelling."""

    records: list[dict[str, object]] = []
    for scenario in OPERATIONS_SCENARIOS:
        metrics = calculate_operations_kpis(
            **{key: value for key, value in scenario.items() if key != "title"}
        )
        for metric, value in metrics.items():
            records.append({
                "domain": scenario["title"],
                "metric": metric,
                "value": value,
            })
    return pd.DataFrame(records)


# %%

def build_vertical_dashboard(frame: pd.DataFrame | None = None) -> pd.DataFrame:
    """Summarize KPIs by vertical using the Fortune 1000 dataset."""

    if frame is None:
        frame = load_fortune_1000()

    selectors = {
        "Finance": frame[frame["Sector"] == "Financials"],
        "Retail & E-commerce": frame[frame["Sector"] == "Retailing"],
        "Healthcare": frame[frame["Industry"].str.contains("Health", case=False, na=False)],
        "Manufacturing": frame[frame["Sector"] == "Industrials"],
    }

    records: list[dict[str, object]] = []
    for vertical, subset in selectors.items():
        if subset.empty:
            continue
        revenue = subset["Revenues ($M)"].sum()
        profit = subset["Profits ($M)"].sum()
        margin = profit / revenue if revenue else 0.0
        avg_assets = subset["Assets ($M)"].mean()
        records.append(
            {
                "vertical": vertical,
                "companies": len(subset),
                "revenue": revenue,
                "profit": profit,
                "profit_margin": margin,
                "avg_assets": avg_assets,
            }
        )

    default_metrics = calculate_vertical_kpis(**VERTICAL_DEFAULTS)
    records.append(
        {
            "vertical": "BI KPI baselines",
            "companies": len(frame),
            "revenue": VERTICAL_DEFAULTS["finance_revenue"],
            "profit": VERTICAL_DEFAULTS["finance_revenue"] - VERTICAL_DEFAULTS["finance_cost"],
            "profit_margin": default_metrics["finance_operating_margin"],
            "avg_assets": default_metrics["manufacturing_yield"],
        }
    )

    return pd.DataFrame(records)


# %%

def summarize_groups(
    groups: Mapping[str, Iterable[str]],
    grouped_topics: Mapping[str, Iterable[object]],
) -> None:
    """Print the roadmap groupings in a classroom-friendly format."""

    print("\nDay 77 domain groupings\n")
    for name, titles in groups.items():
        print(f"{name}:")
        for title in titles:
            print(f"  • {title}")
        roadmap_titles = ", ".join(
            getattr(topic, "title", str(topic)) for topic in grouped_topics.get(name, [])
        )
        if roadmap_titles:
            print(f"    ↳ Roadmap validation: {roadmap_titles}")


# %%

def review_dashboard(title: str, frame: pd.DataFrame, value_columns: Iterable[str]) -> None:
    """Print a KPI dashboard with friendly formatting."""

    print(f"\n{title}\n")
    dashboard = frame.copy()
    for column in value_columns:
        if column in dashboard:
            dashboard[column] = dashboard[column].map(lambda val: f"{val:,.2f}")
    print(dashboard.to_markdown(index=False))


# %%

def main() -> None:
    """Run the domain analytics classroom walk-through."""

    summarize_groups(DOMAIN_GROUPS, TOPIC_GROUPS)

    revenue_dashboard = build_revenue_dashboard()
    review_dashboard(
        "Revenue-facing KPI storyboard",
        revenue_dashboard,
        ["value"],
    )

    operations_dashboard = build_operations_dashboard()
    review_dashboard(
        "Operations KPI storyboard",
        operations_dashboard,
        ["value"],
    )

    vertical_dashboard = build_vertical_dashboard()
    review_dashboard(
        "Vertical insights",
        vertical_dashboard,
        ["revenue", "profit", "profit_margin", "avg_assets"],
    )


# %%
if __name__ == "__main__":
    main()
