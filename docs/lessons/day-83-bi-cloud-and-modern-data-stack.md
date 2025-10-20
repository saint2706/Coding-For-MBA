> This lesson is part of the Phase 5 Business Intelligence specialization. Use the [Phase 5 overview](https://github.com/saint2706/Coding-For-MBA/blob/main/docs/bi-curriculum.md)
to see how the developer-roadmap topics align across Days 68–84.

## Why it matters

Modern BI teams assemble cloud-native tooling that balances time-to-value, governance, and spend. Understanding how the cloud
ecosystem fits together ensures analysts can navigate trade-offs when choosing warehouses, integration layers, and visualization
services.

## Developer-roadmap alignment

- Cloud Computing Basics
- Cloud BI Ecosystem
- Cloud data warehouses
- Providers: AWS, GCP, Azure
- Cloud

## Cloud architecture patterns

| Pattern | Components | Feature focus | Cost trade-off |
| --- | --- | --- | --- |
| Centralized warehouse with semantic layer | Serverless warehouse, ELT pipelines, BI semantic model | Curated metrics exposed through governed BI layers | Reserved capacity discounts exchange flexibility for governance licensing costs |
| Lakehouse with streaming ingestion | Object storage, streaming ingestion, open table formats, SQL endpoints | Unified analytics supporting dashboards and ML on the same platform | Streaming autoscale fees must be balanced against freshness SLAs |
| Composable stack with reverse ETL | Cloud warehouse, transformation service, reverse ETL activations | Operationalizes analytics inside SaaS tools without duplicating logic | Connector-based pricing introduces variable spend per downstream system |

## Provider evaluation checklist

- Confirm the managed warehouse option (Redshift, BigQuery, Synapse) and how it scales.
- Map analytics services (QuickSight, Looker, Power BI) to stakeholder use cases.
- Align orchestration choices (Step Functions, Cloud Composer, Data Factory) with existing engineering standards.
- Capture pricing guardrails, including autosuspend, flat-rate commitments, and hybrid benefits.
- Note governance integrations such as IAM, Dataplex, and Purview for security reviews.

## Next steps

- Use the comparison matrix in `lesson.py` to facilitate vendor shortlists.
- Draft cost scenarios that highlight egress, autoscaling, and reserved capacity for each provider.

## Additional Materials

???+ example "lesson.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_83_BI_Cloud_and_Modern_Data_Stack/lesson.py)

    ```python title="lesson.py"
    # %%
    """Day 83 – BI Cloud and Modern Data Stack classroom script."""

    # %%
    from __future__ import annotations

    from typing import Mapping

    import pandas as pd

    from Day_83_BI_Cloud_and_Modern_Data_Stack import (
        build_cloud_topic_dataframe,
        build_provider_comparison_frame,
        group_cloud_topics,
    )

    # %%
    CLOUD_GROUPS = group_cloud_topics()
    CLOUD_TOPIC_FRAME = build_cloud_topic_dataframe()
    PROVIDER_FRAME = build_provider_comparison_frame()

    CLOUD_ARCHITECTURE_PATTERNS: Mapping[str, Mapping[str, str]] = {
        "Centralized warehouse with semantic layer": {
            "components": "Serverless warehouse, ELT pipelines, BI semantic model",
            "strength": "Balances governed data with curated metrics exposed through BI tools.",
            "cost_trade_off": (
                "Reserved capacity lowers compute rates, but semantic modeling requires "
                "licensing for governance layers."
            ),
        },
        "Lakehouse with streaming ingestion": {
            "components": "Object storage, streaming ingestion, open table formats, SQL endpoints",
            "strength": "Enables near real-time dashboards while supporting ML workloads on the same lake.",
            "cost_trade_off": (
                "Storage remains inexpensive, yet streaming autoscale costs must be tracked "
                "against refresh SLAs."
            ),
        },
        "Composable stack with reverse ETL": {
            "components": "Cloud warehouse, transformation service, reverse ETL activations",
            "strength": "Delivers analytics in operational tools without duplicating governance logic.",
            "cost_trade_off": (
                "SaaS integration fees add up, so teams trade platform simplicity for per-connector charges."
            ),
        },
    }

    COST_OPTIMIZATION_PROMPTS: Mapping[str, str] = {
        "Elastic compute": "How can we use autosuspend and scale-to-zero policies to reduce idle spend?",
        "Storage tiers": "When do we archive historical BI extracts into colder tiers without hurting SLAs?",
        "Data movement": "Which provider-native services offset egress fees through in-platform processing?",
    }


    # %%
    def display_topic_groups(groups: Mapping[str, list]) -> None:
        """Print the grouped roadmap topics for facilitation."""

        print("\nCloud BI roadmap groupings:\n")
        for section, topics in groups.items():
            titles = ", ".join(topic.title for topic in topics)
            print(f"- {section}: {titles}")


    # %%
    def show_cloud_topic_frame(frame: pd.DataFrame) -> None:
        """Display the topic dataframe with descriptions and trade-offs."""

        print("\nLesson overview matrix:\n")
        print(frame.to_markdown(index=False))


    # %%
    def explain_architecture_patterns(patterns: Mapping[str, Mapping[str, str]]) -> None:
        """Describe reference architectures and their cost/feature positioning."""

        print("\nCloud architecture patterns and trade-offs:\n")
        for name, metadata in patterns.items():
            components = metadata.get("components", "")
            strength = metadata.get("strength", "")
            cost_trade_off = metadata.get("cost_trade_off", "")
            print(f"* {name}")
            print(f"  - Components: {components}")
            print(f"  - Strength: {strength}")
            print(f"  - Cost trade-off: {cost_trade_off}\n")


    # %%
    def preview_provider_matrix(frame: pd.DataFrame) -> None:
        """Show the provider comparison matrix across AWS, GCP, and Azure."""

        print("\nProvider capability comparison:\n")
        print(frame.to_markdown(index=False))


    # %%
    def prompt_cost_reviews(prompts: Mapping[str, str]) -> None:
        """Offer facilitation questions that emphasize ongoing cost reviews."""

        print("\nCost optimization prompts:\n")
        for theme, question in prompts.items():
            print(f"- {theme}: {question}")


    # %%
    def main() -> None:
        """Run the Day 83 classroom walkthrough."""

        display_topic_groups(CLOUD_GROUPS)
        show_cloud_topic_frame(CLOUD_TOPIC_FRAME)
        explain_architecture_patterns(CLOUD_ARCHITECTURE_PATTERNS)
        preview_provider_matrix(PROVIDER_FRAME)
        prompt_cost_reviews(COST_OPTIMIZATION_PROMPTS)


    # %%
    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_83_BI_Cloud_and_Modern_Data_Stack/solutions.py)

    ```python title="solutions.py"
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
    ```
