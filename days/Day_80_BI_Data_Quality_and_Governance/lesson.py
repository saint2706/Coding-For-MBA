"""Interactive lesson script for Day 80: BI Data Quality and Governance."""

from __future__ import annotations

import pandas as pd
from Day_80_BI_Data_Quality_and_Governance.solutions import (
    build_data_quality_scorecard,
    build_governance_scorecard,
    load_topic_groups,
)

TARGET_THRESHOLDS = {
    "Accuracy": 0.98,
    "Coherence": 0.95,
    "Interpretability": 0.90,
    "Timeliness": 0.92,
    "Relevance": 0.75,
    "Accessibility": 0.95,
}


def _to_datetime(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce")


def build_demo_orders() -> pd.DataFrame:
    """Return a small dataset with intentional quality quirks."""

    orders = pd.DataFrame(
        {
            "order_id": [101, 102, 103, 104, 105, 106],
            "expected_amount": [2400.0, 1250.0, 860.0, 990.0, 540.0, 1200.0],
            "recorded_amount": [2400.0, 1200.0, 865.0, 980.0, 500.0, 1215.0],
            "source_region": ["EMEA", "NA", "NA", "APAC", "EMEA", "LATAM"],
            "reported_region": [
                "EMEA",
                "North America",
                "NA",
                "Asia Pacific",
                "EMEA",
                "LATAM",
            ],
            "due_at": [
                "2024-03-05",
                "2024-03-07",
                "2024-03-09",
                "2024-03-12",
                "2024-03-15",
                "2024-03-18",
            ],
            "delivered_at": [
                "2024-03-05",
                "2024-03-09",
                "2024-03-08",
                "2024-03-13",
                "2024-03-16",
                "2024-03-18",
            ],
            "owner": [
                "Finance",
                "Sales",
                "Sales",
                "Operations",
                "Finance",
                "Operations",
            ],
        }
    )
    orders["due_at"] = _to_datetime(orders["due_at"])
    orders["delivered_at"] = _to_datetime(orders["delivered_at"])
    return orders


def build_metadata_catalogue() -> pd.DataFrame:
    """Create a metadata table to evaluate interpretability."""

    catalog = pd.DataFrame(
        {
            "field": [
                "order_id",
                "expected_amount",
                "recorded_amount",
                "source_region",
                "reported_region",
                "due_at",
                "delivered_at",
            ],
            "documented": [True, True, True, True, False, True, True],
        }
    )
    return catalog


def build_access_audit() -> pd.DataFrame:
    """Return mock provisioning data for accessibility analysis."""

    audit = pd.DataFrame(
        {
            "role": ["Executive", "Manager", "Analyst", "Engineer"],
            "required_users": [25, 60, 80, 20],
            "provisioned_users": [25, 58, 76, 19],
        }
    )
    return audit


def build_adoption_snapshot() -> pd.DataFrame:
    """Simulate governance reporting on stakeholder adoption."""

    snapshot = pd.DataFrame(
        {
            "department": ["Finance", "Sales", "Operations", "Marketing"],
            "active_users": [42, 53, 38, 12],
            "eligible_users": [50, 60, 40, 30],
        }
    )
    return snapshot


def calculate_dimension_scores() -> pd.DataFrame:
    """Compute BI data quality metrics suitable for a dashboard view."""

    orders = build_demo_orders()
    metadata = build_metadata_catalogue()
    access = build_access_audit()
    adoption = build_adoption_snapshot()

    accuracy = (
        1
        - (orders["expected_amount"] - orders["recorded_amount"]).abs().sum()
        / orders["expected_amount"].sum()
    )
    normalised_source = (
        orders["source_region"].str.lower().str.replace(" ", "", regex=False)
    )
    normalised_reported = (
        orders["reported_region"].str.lower().str.replace(" ", "", regex=False)
    )
    coherence = (normalised_source == normalised_reported).mean()
    interpretability = metadata["documented"].mean()
    timeliness = (orders["delivered_at"] <= orders["due_at"]).mean()
    relevance = adoption["active_users"].sum() / adoption["eligible_users"].sum()
    accessibility = access["provisioned_users"].sum() / access["required_users"].sum()

    metrics = {
        "Accuracy": accuracy,
        "Coherence": coherence,
        "Interpretability": interpretability,
        "Timeliness": timeliness,
        "Relevance": relevance,
        "Accessibility": accessibility,
    }

    rows: list[dict[str, object]] = []
    for dimension, score in metrics.items():
        target = TARGET_THRESHOLDS.get(dimension, 0.0)
        rows.append(
            {
                "dimension": dimension,
                "score": round(float(score), 3),
                "target": target,
                "status": "On Track" if score >= target else "Needs Attention",
            }
        )
    dashboard = pd.DataFrame(rows, columns=["dimension", "score", "target", "status"])
    return dashboard


def summarise_governance_highlights() -> pd.DataFrame:
    """Return a lightweight status table for governance and ethics controls."""

    scorecard = build_governance_scorecard()
    statuses = [
        "Operational",
        "Operational",
        "In Review",
        "In Review",
        "Monitoring",
        "Mitigating",
        "Compliant",
        "Compliant",
    ]
    scorecard = scorecard.copy()
    scorecard["status"] = statuses
    return scorecard[["domain", "status", "control_focus", "evidence", "checklist"]]


def main() -> None:
    grouped_topics = load_topic_groups()
    data_quality_scorecard = build_data_quality_scorecard()
    governance_scorecard = build_governance_scorecard()
    dashboard = calculate_dimension_scores()
    governance_status = summarise_governance_highlights()

    print("=== Roadmap Topics ===")
    for group, topics in grouped_topics.items():
        print(f"\n{group}:")
        for topic in topics:
            print(f" - {topic.title}")

    print("\n=== Data Quality Scorecard Template ===")
    print(data_quality_scorecard.to_string(index=False))

    print("\n=== Governance & Ethics Scorecard Template ===")
    print(governance_scorecard.to_string(index=False))

    print("\n=== Dashboard Metrics ===")
    print(dashboard.to_string(index=False))

    print("\n=== Governance Control Highlights ===")
    print(governance_status.to_string(index=False))


if __name__ == "__main__":
    main()
