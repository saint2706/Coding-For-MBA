"""Utilities for the Day 77 BI Domain Analytics and Value Drivers lesson."""

from __future__ import annotations

from typing import Dict, Mapping, Sequence

from mypackage.bi_curriculum import BiTopic, group_topics_by_titles

DOMAIN_GROUPS: Mapping[str, Sequence[str]] = {
    "Revenue-facing": (
        "Sales Performance",
        "Marketing Campaigns",
        "CLV",
        "Risk Analytics",
        "Fraud Detection",
        "Compliance Reporting",
    ),
    "Operational excellence": (
        "Inventory Optimization",
        "Supply Chain Analytics",
        "Supply chain optimization",
        "Predictive Maintenance",
        "Production Efficiency",
        "Quality Control",
    ),
    "Industry verticals": (
        "Finance",
        "Retail & E-commerce",
        "Healthcare",
        "Patient management",
        "Hospital Efficiency",
        "Manufacturing",
        "HR",
        "Operations",
    ),
}


def load_domain_topics(
    groups: Mapping[str, Sequence[str]] = DOMAIN_GROUPS,
) -> Dict[str, list[BiTopic]]:
    """Return roadmap topics grouped by BI business domain."""

    return group_topics_by_titles(groups)


def calculate_revenue_kpis(
    *,
    total_revenue: float,
    marketing_spend: float,
    customer_count: int,
    retained_customers: int,
    fraud_loss: float = 0.0,
    compliance_cost: float = 0.0,
) -> Dict[str, float]:
    """Compute foundational KPIs for revenue-facing teams."""

    avg_revenue_per_customer = total_revenue / customer_count if customer_count else 0.0
    marketing_roi = (
        (total_revenue - marketing_spend) / marketing_spend if marketing_spend else 0.0
    )
    retention_rate = retained_customers / customer_count if customer_count else 0.0
    risk_adjusted_revenue = total_revenue - fraud_loss - compliance_cost
    fraud_rate = fraud_loss / total_revenue if total_revenue else 0.0

    return {
        "avg_revenue_per_customer": avg_revenue_per_customer,
        "marketing_roi": marketing_roi,
        "retention_rate": retention_rate,
        "risk_adjusted_revenue": risk_adjusted_revenue,
        "fraud_rate": fraud_rate,
    }


def calculate_operations_kpis(
    *,
    beginning_inventory: float,
    ending_inventory: float,
    cost_of_goods_sold: float,
    downtime_hours: float,
    scheduled_hours: float,
    defective_units: int,
    total_units: int,
) -> Dict[str, float]:
    """Compute manufacturing and supply chain efficiency KPIs."""

    average_inventory = (beginning_inventory + ending_inventory) / 2
    inventory_turnover = (
        cost_of_goods_sold / average_inventory if average_inventory else 0.0
    )
    uptime_percentage = (
        (scheduled_hours - downtime_hours) / scheduled_hours if scheduled_hours else 0.0
    )
    first_pass_yield = 1 - (defective_units / total_units) if total_units else 0.0
    units_per_hour = total_units / scheduled_hours if scheduled_hours else 0.0

    return {
        "inventory_turnover": inventory_turnover,
        "uptime_percentage": uptime_percentage,
        "first_pass_yield": first_pass_yield,
        "units_per_hour": units_per_hour,
    }


def calculate_vertical_kpis(
    *,
    finance_revenue: float,
    finance_cost: float,
    retail_orders: int,
    retail_returns: int,
    healthcare_patients: int,
    healthcare_beds: int,
    hr_headcount: int,
    hr_separations: int,
    manufacturing_units_produced: int,
    manufacturing_units_defective: int,
) -> Dict[str, float]:
    """Compute sample KPIs tailored to BI industry verticals."""

    operating_margin = (
        (finance_revenue - finance_cost) / finance_revenue if finance_revenue else 0.0
    )
    retail_return_rate = retail_returns / retail_orders if retail_orders else 0.0
    bed_utilization = healthcare_patients / healthcare_beds if healthcare_beds else 0.0
    hr_turnover_rate = hr_separations / hr_headcount if hr_headcount else 0.0
    manufacturing_yield = (
        (manufacturing_units_produced - manufacturing_units_defective)
        / manufacturing_units_produced
        if manufacturing_units_produced
        else 0.0
    )

    return {
        "finance_operating_margin": operating_margin,
        "retail_return_rate": retail_return_rate,
        "bed_utilization": bed_utilization,
        "hr_turnover_rate": hr_turnover_rate,
        "manufacturing_yield": manufacturing_yield,
    }


__all__ = [
    "DOMAIN_GROUPS",
    "load_domain_topics",
    "calculate_revenue_kpis",
    "calculate_operations_kpis",
    "calculate_vertical_kpis",
]
