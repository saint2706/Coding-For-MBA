# %%
"""Day 69 – BI Strategy and Stakeholders classroom script."""

# %%
from __future__ import annotations

import pandas as pd
from Day_69_BI_Strategy_and_Stakeholders import build_topic_dataframe, load_topics

# %%
STRATEGY_GROUPS = load_topics()
STRATEGY_FRAME = build_topic_dataframe()


# %%
def display_strategy_clusters(groups: dict[str, list]) -> None:
    """Print the topic groupings used to facilitate the session."""

    print("\nBI strategy facilitation clusters:\n")
    for section, topics in groups.items():
        titles = ", ".join(topic.title for topic in topics)
        print(f"- {section}: {titles}")


# %%
def preview_topic_matrix(frame: pd.DataFrame) -> None:
    """Show the strategy dataframe as a markdown table for planning."""

    print("\nRoadmap alignment matrix:\n")
    print(frame.to_markdown(index=False))


# %%
def stakeholder_prompt() -> None:
    """Provide prompts that pair stakeholder personas with BI operations."""

    personas = {
        "Marketing director": "Connect campaign pacing dashboards to tactical BI cadences.",
        "Finance controller": "Tie compliance reporting to the key business functions node.",
        "Operations manager": "Map frontline alerts to operational BI service levels.",
        "Executive sponsor": "Use strategic BI discussions to prioritize long-term bets.",
    }
    print("\nStakeholder pairing prompts:\n")
    for persona, guidance in personas.items():
        print(f"- {persona}: {guidance}")


# %%
def main() -> None:
    """Run the classroom demo for Day 69."""

    display_strategy_clusters(STRATEGY_GROUPS)
    preview_topic_matrix(STRATEGY_FRAME)
    stakeholder_prompt()


# %%
if __name__ == "__main__":
    main()
