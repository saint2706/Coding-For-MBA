---
title: "Day 80 \u2013 BI Data Quality and Governance"
tags:
- BI
- Data
---

Day 80 fills the roadmap gap on enterprise-grade data quality programmes and governance frameworks.
We build pragmatic scorecards covering the six classic data-quality dimensions while linking them to
ethics, privacy, and regulatory obligations (GDPR/CCPA). The lesson emphasises how these controls
inform BI delivery—from dashboard reliability to stakeholder trust.

## Building Data-Quality Dashboards

1. **Profile reliability signals.** Track accuracy (variance vs source of truth), coherence
   (cross-system consistency), interpretability (metadata coverage), timeliness (pipeline latency),
   relevance (active usage), and accessibility (role-based coverage). The
   `build_data_quality_scorecard` helper converts these dimensions into a reusable checklist/metric
   template.
1. **Instrument operational datasets.** Use the sample orders dataset in `lesson.py` to compute
   dashboard-friendly metrics such as reconciliation accuracy, on-time delivery rates, and adoption
   ratios. The script demonstrates how to convert those metrics into a concise dashboard table with
   status indicators against agreed thresholds.
1. **Close the loop with remediation.** Highlight exception owners, SLAs, and actions in the
   scorecard so remediation workstreams can be prioritised alongside product backlogs.

## Governance and Ethics Frameworks

1. **Map the roadmap.** `load_topic_groups` pulls the Business Intelligence roadmap nodes into two
   groups—data quality dimensions and governance & ethics—to ensure curriculum alignment.
1. **Codify control expectations.** `build_governance_scorecard` translates lineage, privacy,
   ethical use, bias recognition, mitigation strategies, and GDPR/CCPA requirements into a checklist
   with evidence artefacts for audits.
1. **Communicate the operating model.** The lesson script adds a governance highlights table
   summarising current control status, showing how BI teams can brief executives on stewardship,
   compliance, and mitigation programmes.

## How to Use This Lesson

- Run `lesson.py` to print the roadmap groupings, scorecard templates, calculated dashboard metrics,
  and governance status snapshot.
- Adapt the generated pandas DataFrames into your BI platform (Power BI, Tableau, Looker) by wiring
  the metrics to actual data pipelines and linking governance status back to your data catalogue or
  privacy management tool.
- Extend the checklists with your organisation’s specific controls—e.g., SOC2 evidence, ISO/IEC
  27001 clauses, or additional fairness/bias diagnostics for machine-learning products.

## Additional Topic: Visualization Strategy & Storytelling

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the
> [Phase 5 overview](https://github.com/saint2706/Coding-For-MBA/blob/main/docs/bi-curriculum.md) to see how the developer-roadmap topics align across
> Days 68–84.

## Why it matters

Package insights for executive audiences and decision forums.

## Developer-roadmap alignment

- Visualization Best Practices
- Communication & Storytelling
- Stakeholder Identification
- Bias Recognition

## Next steps

- Draft case studies and notebooks that exercise these roadmap nodes.
- Update the Phase 5 cheat sheet with the insights you capture here.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 79 – Day 79 – BI Storytelling and Stakeholder Influence](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_79_BI_Storytelling_and_Stakeholder_Influence/README.md) • **Next:** [Day 81 – Day 81 – BI Architecture and Data Modeling](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_81_BI_Architecture_and_Data_Modeling/README.md)

_You are on lesson 80 of 108._

<!-- LESSON_FOOTER_END -->

## Additional Materials

???+ example "lesson.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_80_BI_Data_Quality_and_Governance/lesson.py)

    ```python title="lesson.py"
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
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_80_BI_Data_Quality_and_Governance/solutions.py)

    ```python title="solutions.py"
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
    ```
