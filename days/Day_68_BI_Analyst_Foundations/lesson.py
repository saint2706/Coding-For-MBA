# %%
"""Day 68 – BI Analyst Foundations classroom script."""

# %%
from __future__ import annotations

import pandas as pd

from Day_68_BI_Analyst_Foundations import build_topic_dataframe, load_topics

# %%
FOUNDATION_GROUPS = load_topics()
FOUNDATION_DF = build_topic_dataframe()


# %%
def preview_foundation_topics(frame: pd.DataFrame) -> None:
    """Print a markdown table of the foundational topics for discussion."""

    print("\nBI Analyst Foundations overview:\n")
    print(frame.to_markdown(index=False))


# %%
def outline_facilitation_plan(groups: dict[str, list]) -> None:
    """Display how the roadmap nodes cluster for classroom facilitation."""

    for section, topics in groups.items():
        formatted = ", ".join(topic.title for topic in topics)
        print(f"- {section}: {formatted}")


# %%
def main() -> None:
    """Run the classroom demo for Day 68."""

    outline_facilitation_plan(FOUNDATION_GROUPS)
    preview_foundation_topics(FOUNDATION_DF)


# %%
if __name__ == "__main__":
    main()
