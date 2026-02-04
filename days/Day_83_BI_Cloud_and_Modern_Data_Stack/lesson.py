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
