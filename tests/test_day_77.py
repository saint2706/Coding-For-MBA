"""Tests for the Day 77 BI Domain Analytics and Value Drivers utilities."""

import os
import sys

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Day_77_BI_Domain_Analytics_and_Value_Drivers import (
    DOMAIN_GROUPS,
    calculate_operations_kpis,
    calculate_revenue_kpis,
    calculate_vertical_kpis,
    load_domain_topics,
)

EXPECTED_GROUPS = {
    "Revenue-facing": set(DOMAIN_GROUPS["Revenue-facing"]),
    "Operational excellence": set(DOMAIN_GROUPS["Operational excellence"]),
    "Industry verticals": set(DOMAIN_GROUPS["Industry verticals"]),
}


def test_load_domain_topics_matches_expected_titles() -> None:
    grouped = load_domain_topics()
    assert set(grouped) == set(EXPECTED_GROUPS)
    for name, expected_titles in EXPECTED_GROUPS.items():
        assert {topic.title for topic in grouped[name]} == expected_titles


def test_calculate_revenue_kpis_returns_expected_metrics() -> None:
    metrics = calculate_revenue_kpis(
        total_revenue=1_000_000.0,
        marketing_spend=200_000.0,
        customer_count=400,
        retained_customers=360,
        fraud_loss=10_000.0,
        compliance_cost=15_000.0,
    )

    assert metrics["avg_revenue_per_customer"] == pytest.approx(2_500.0)
    assert metrics["marketing_roi"] == pytest.approx(4.0)
    assert metrics["retention_rate"] == pytest.approx(0.9)
    assert metrics["risk_adjusted_revenue"] == pytest.approx(975_000.0)
    assert metrics["fraud_rate"] == pytest.approx(0.01)


def test_calculate_operations_kpis_returns_expected_metrics() -> None:
    metrics = calculate_operations_kpis(
        beginning_inventory=300_000.0,
        ending_inventory=270_000.0,
        cost_of_goods_sold=900_000.0,
        downtime_hours=12.0,
        scheduled_hours=180.0,
        defective_units=90,
        total_units=10_000,
    )

    assert metrics["inventory_turnover"] == pytest.approx(3.1578947, rel=1e-6)
    assert metrics["uptime_percentage"] == pytest.approx(0.9333333, rel=1e-6)
    assert metrics["first_pass_yield"] == pytest.approx(0.991)
    assert metrics["units_per_hour"] == pytest.approx(55.5555555, rel=1e-6)


def test_calculate_vertical_kpis_returns_expected_metrics() -> None:
    metrics = calculate_vertical_kpis(
        finance_revenue=2_000_000.0,
        finance_cost=1_500_000.0,
        retail_orders=5_000,
        retail_returns=200,
        healthcare_patients=400,
        healthcare_beds=450,
        hr_headcount=300,
        hr_separations=15,
        manufacturing_units_produced=20_000,
        manufacturing_units_defective=500,
    )

    assert metrics["finance_operating_margin"] == pytest.approx(0.25)
    assert metrics["retail_return_rate"] == pytest.approx(0.04)
    assert metrics["bed_utilization"] == pytest.approx(0.8888888, rel=1e-6)
    assert metrics["hr_turnover_rate"] == pytest.approx(0.05)
    assert metrics["manufacturing_yield"] == pytest.approx(0.975)
