"""Topic helpers for the Day 83 BI Cloud and Modern Data Stack lesson."""

from __future__ import annotations

from typing import Dict, List, Mapping, Sequence

import pandas as pd
from mypackage.bi_curriculum import BiTopic, group_topics_by_titles, topics_by_titles

CLOUD_TITLES: Sequence[str] = (
    "Cloud BI Ecosystem",
    "Cloud Computing Basics",
    "Cloud data warehouses",
    "Providers: AWS, GCP, Azure",
    "Cloud",
)

CLOUD_TOPIC_GROUPS: Mapping[str, Sequence[str]] = {
    "Cloud foundations": (
        "Cloud Computing Basics",
        "Cloud",
    ),
    "Analytics ecosystem": (
        "Cloud BI Ecosystem",
        "Cloud data warehouses",
    ),
    "Provider landscape": ("Providers: AWS, GCP, Azure",),
}

CLOUD_TOPIC_DESCRIPTIONS: Mapping[str, str] = {
    "Cloud Computing Basics": (
        "Baseline students on elasticity, shared responsibility, and on-demand "
        "pricing so BI teams can evaluate managed services."
    ),
    "Cloud": (
        "Frame cloud operating models and the relationship between regions, "
        "availability zones, and compliance domains."
    ),
    "Cloud BI Ecosystem": (
        "Connect ingestion, warehousing, transformation, and visualization "
        "services into an integrated reference architecture."
    ),
    "Cloud data warehouses": (
        "Compare serverless warehouses and managed clusters for scale, query "
        "performance, and workload isolation."
    ),
    "Providers: AWS, GCP, Azure": (
        "Guide students through evaluating vendor strengths, default tooling, and "
        "partner ecosystems."
    ),
}

CLOUD_COST_CONSIDERATIONS: Mapping[str, str] = {
    "Cloud Computing Basics": "Variable compute and storage pricing favors bursty BI workloads.",
    "Cloud": "Networking egress and compliance guardrails become the dominant cost drivers.",
    "Cloud BI Ecosystem": "Managed services reduce admin labor but require budgeting for integration tiers.",
    "Cloud data warehouses": "Scale-to-zero options curb idle spend while reserved capacity lowers steady-state cost.",
    "Providers: AWS, GCP, Azure": "Marketplace commitments can trade flexibility for discounts across the stack.",
}

PROVIDER_COMPARISON: Mapping[str, Mapping[str, str]] = {
    "AWS": {
        "managed_warehouse": "Amazon Redshift Serverless with RA3 scaling tiers",
        "analytics_services": "QuickSight, Athena, Glue, Lake Formation",
        "orchestration": "Managed Airflow, Step Functions, and event-driven Lambda",
        "pricing_highlight": "Granular per-second billing with savings plans for reserved throughput",
        "notable_integration": "Tight coupling with S3 data lake and security via IAM",
    },
    "GCP": {
        "managed_warehouse": "BigQuery with autoscaling slots and data lake federation",
        "analytics_services": "Looker, Data Studio, Dataflow, Dataproc",
        "orchestration": "Cloud Composer, Workflows, and Cloud Functions",
        "pricing_highlight": "Serverless query pricing plus flat-rate commitments for enterprise teams",
        "notable_integration": "Unified governance through Dataplex and Vertex AI integrations",
    },
    "Azure": {
        "managed_warehouse": "Azure Synapse with serverless SQL pools and dedicated nodes",
        "analytics_services": "Power BI, Azure Data Factory, Databricks",
        "orchestration": "Data Factory pipelines, Logic Apps, and Functions",
        "pricing_highlight": "Hybrid benefits with reserved capacity discounts and spot compute tiers",
        "notable_integration": "Deep integration with Microsoft 365 security and Purview governance",
    },
}


def load_cloud_topics(titles: Sequence[str] = CLOUD_TITLES) -> List[BiTopic]:
    """Return the BI roadmap topics for the cloud and modern data stack lesson."""

    return list(topics_by_titles(titles))


def group_cloud_topics(
    groups: Mapping[str, Sequence[str]] = CLOUD_TOPIC_GROUPS,
) -> Dict[str, List[BiTopic]]:
    """Return grouped cloud topics covering foundations, ecosystem, and providers."""

    return {
        section: topics for section, topics in group_topics_by_titles(groups).items()
    }


def build_cloud_topic_dataframe(
    *,
    groups: Mapping[str, Sequence[str]] = CLOUD_TOPIC_GROUPS,
    descriptions: Mapping[str, str] = CLOUD_TOPIC_DESCRIPTIONS,
    cost_notes: Mapping[str, str] = CLOUD_COST_CONSIDERATIONS,
) -> pd.DataFrame:
    """Create a dataframe summarizing lesson sections, descriptions, and trade-offs."""

    grouped = group_cloud_topics(groups=groups)
    records: list[dict[str, str]] = []
    for section, topics in grouped.items():
        for topic in topics:
            records.append(
                {
                    "section": section,
                    "title": topic.title,
                    "description": descriptions.get(topic.title, ""),
                    "cost_trade_off": cost_notes.get(topic.title, ""),
                }
            )
    return pd.DataFrame(
        records,
        columns=["section", "title", "description", "cost_trade_off"],
    )


def build_provider_comparison_frame(
    comparisons: Mapping[str, Mapping[str, str]] = PROVIDER_COMPARISON,
) -> pd.DataFrame:
    """Return a provider feature matrix for AWS, GCP, and Azure offerings."""

    rows: list[dict[str, str]] = []
    columns = [
        "provider",
        "managed_warehouse",
        "analytics_services",
        "orchestration",
        "pricing_highlight",
        "notable_integration",
    ]
    for provider, features in comparisons.items():
        row = {"provider": provider}
        row.update(features)
        rows.append(row)
    frame = pd.DataFrame(rows, columns=columns)
    return frame.sort_values("provider").reset_index(drop=True)


__all__ = [
    "CLOUD_TITLES",
    "build_cloud_topic_dataframe",
    "build_provider_comparison_frame",
    "group_cloud_topics",
    "load_cloud_topics",
]
