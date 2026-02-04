"""Utilities for the Day 80 BI Data Quality and Governance lesson."""

from __future__ import annotations

from typing import Iterable, Mapping

import pandas as pd

from mypackage.bi_curriculum import BiTopic, group_topics_by_titles

TOPIC_GROUPS: Mapping[str, list[str]] = {
    "Data quality dimensions": [
        "Accuracy",
        "Coherence",
        "Interpretability",
        "Timeliness",
        "Relevance",
        "Accessibility",
    ],
    "Governance & ethics": [
        "Data Quality",
        "Data Lineage",
        "Privacy",
        "Ethical Data Use",
        "Bias Recognition",
        "Mitigation Strategies",
        "GDPR",
        "CCPA",
    ],
}

DATA_QUALITY_CHECKS: Mapping[str, Mapping[str, Iterable[str]]] = {
    "Accuracy": {
        "metric": ["Error rate"],
        "threshold": ["< 2% variance vs source of truth"],
        "checklist": [
            "Automate field-level validation rules",
            "Review exception logs for systematic issues",
            "Reconcile against trusted reference data",
        ],
    },
    "Coherence": {
        "metric": ["Cross-table consistency"],
        "threshold": ["> 95% of joins without mismatches"],
        "checklist": [
            "Compare aggregates across systems",
            "Flag orphaned dimension keys",
            "Monitor conflicting business rule implementations",
        ],
    },
    "Interpretability": {
        "metric": ["Metadata completeness"],
        "threshold": ["> 90% fields documented"],
        "checklist": [
            "Maintain business definitions in a glossary",
            "Annotate calculations within dashboards",
            "Provide owner and SME contacts for critical tables",
        ],
    },
    "Timeliness": {
        "metric": ["Pipeline latency"],
        "threshold": ["< 4 hours from source refresh"],
        "checklist": [
            "Monitor job runtimes against SLAs",
            "Alert on late extractions or loads",
            "Document cut-off windows for reporting",
        ],
    },
    "Relevance": {
        "metric": ["Stakeholder adoption"],
        "threshold": ["> 75% active usage"],
        "checklist": [
            "Review dashboards with business owners quarterly",
            "Retire unused metrics and visualisations",
            "Align backlog grooming with strategic OKRs",
        ],
    },
    "Accessibility": {
        "metric": ["Role-based coverage"],
        "threshold": ["> 95% of authorised users provisioned"],
        "checklist": [
            "Implement least-privilege access controls",
            "Audit sharing settings and licence assignments",
            "Provide alternative formats that meet accessibility standards",
        ],
    },
}

GOVERNANCE_CHECKS: Mapping[str, Mapping[str, Iterable[str]]] = {
    "Data Quality": {
        "control_focus": ["Stewardship operating model"],
        "evidence": ["Data quality policy, stewardship RACI"],
        "checklist": [
            "Appoint data owners and stewards for critical domains",
            "Publish remediation SLAs for priority issues",
            "Report quality metrics to governance council",
        ],
    },
    "Data Lineage": {
        "control_focus": ["Traceability"],
        "evidence": ["End-to-end lineage diagrams"],
        "checklist": [
            "Map system hops from source to consumption",
            "Record transformation logic and business rules",
            "Version-control lineage documentation",
        ],
    },
    "Privacy": {
        "control_focus": ["Data minimisation"],
        "evidence": ["Data inventory with classification"],
        "checklist": [
            "Catalogue PII and sensitive fields",
            "Apply retention and deletion policies",
            "Document lawful basis for collection",
        ],
    },
    "Ethical Data Use": {
        "control_focus": ["Responsible analytics"],
        "evidence": ["Ethics review logs"],
        "checklist": [
            "Conduct ethics impact assessments for new models",
            "Provide opt-out mechanisms for sensitive tracking",
            "Review insights for potential harm scenarios",
        ],
    },
    "Bias Recognition": {
        "control_focus": ["Detection"],
        "evidence": ["Bias testing scripts"],
        "checklist": [
            "Benchmark key segments for disparate impact",
            "Document bias findings and remediation",
            "Escalate high-risk imbalances to governance council",
        ],
    },
    "Mitigation Strategies": {
        "control_focus": ["Corrective actions"],
        "evidence": ["Mitigation playbooks"],
        "checklist": [
            "Define fallback rules for incomplete or biased data",
            "Implement human-in-the-loop approvals where needed",
            "Track mitigation effectiveness over time",
        ],
    },
    "GDPR": {
        "control_focus": ["Regulatory compliance"],
        "evidence": ["Records of processing activities"],
        "checklist": [
            "Document data subject rights processes",
            "Maintain breach response plans and DPIAs",
            "Review processor agreements for cross-border transfers",
        ],
    },
    "CCPA": {
        "control_focus": ["Consumer rights"],
        "evidence": ["Verified deletion request logs"],
        "checklist": [
            "Provide Do Not Sell/Share options",
            "Validate identity before fulfilling requests",
            "Track response timelines and exceptions",
        ],
    },
}


def load_topic_groups(
    *, groups: Mapping[str, Iterable[str]] = TOPIC_GROUPS
) -> dict[str, list[BiTopic]]:
    """Return roadmap topics for the governance lesson grouped by focus area."""

    grouped = group_topics_by_titles(groups)
    return grouped


def _build_scorecard_frame(
    *,
    entries: Mapping[str, Mapping[str, Iterable[str]]],
    index_label: str,
    column_order: Iterable[str],
) -> pd.DataFrame:
    rows: list[dict[str, str]] = []
    for name, fields in entries.items():
        row: dict[str, str] = {index_label: name}
        for column in column_order:
            values = fields.get(column, [])
            if isinstance(values, str):
                formatted = values
            else:
                formatted = "\n".join(f"- {item}" for item in values)
            row[column] = formatted
        rows.append(row)
    frame = pd.DataFrame(rows, columns=[index_label, *column_order])
    return frame


def build_data_quality_scorecard(
    *,
    checks: Mapping[str, Mapping[str, Iterable[str]]] = DATA_QUALITY_CHECKS,
) -> pd.DataFrame:
    """Return a checklist-style scorecard for BI data quality dimensions."""

    return _build_scorecard_frame(
        entries=checks,
        index_label="dimension",
        column_order=["metric", "threshold", "checklist"],
    )


def build_governance_scorecard(
    *,
    checks: Mapping[str, Mapping[str, Iterable[str]]] = GOVERNANCE_CHECKS,
) -> pd.DataFrame:
    """Return a governance scorecard covering ethics and regulatory controls."""

    return _build_scorecard_frame(
        entries=checks,
        index_label="domain",
        column_order=["control_focus", "evidence", "checklist"],
    )


__all__ = [
    "TOPIC_GROUPS",
    "DATA_QUALITY_CHECKS",
    "GOVERNANCE_CHECKS",
    "build_data_quality_scorecard",
    "build_governance_scorecard",
    "load_topic_groups",
]
