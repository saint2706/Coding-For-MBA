# %%
"""Day 71 – BI Data Landscape classroom script."""

# %%
from __future__ import annotations

from pathlib import Path
from typing import Mapping

import pandas as pd

from Day_71_BI_Data_Landscape import (
    SECTION_TOPICS,
    SOURCE_CHANNELS_SECTION,
    build_topic_dataframe,
    load_topic_groups,
)

# %%
REPO_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = REPO_ROOT / "data"

SOURCE_DATASETS: Mapping[str, tuple[str, str]] = {
    "Data Sources": (
        "data/README.md",
        "Directory catalog describing every educational dataset.",
    ),
    "Databases": (
        "data/fortune1000_final.csv",
        "Fortune 1000 extract emulating a warehouse fact table.",
    ),
    "Web": (
        "data/hacker_news.csv",
        "Community discussions captured from the Hacker News website.",
    ),
    "Mobile Apps": (
        "data/result.csv",
        "Usage metrics mirroring analytics exported from a mobile product.",
    ),
    "Cloud": (
        "data/countries_data.json",
        "JSON payload representative of a cloud data lake feed.",
    ),
    "APIs": (
        "data/countries.py",
        "Python client that mirrors consuming an external countries API.",
    ),
    "IoT": (
        "data/weight-height.csv",
        "Telemetry-style body measurements similar to wearable devices.",
    ),
}

# %%
TOPIC_GROUPS = load_topic_groups(SECTION_TOPICS)
TOPIC_FRAME = build_topic_dataframe(sections=SECTION_TOPICS)


# %%
def build_source_asset_table(mapping: Mapping[str, tuple[str, str]]) -> pd.DataFrame:
    """Return metadata about the sample datasets that anchor each source type."""

    records: list[dict[str, object]] = []
    for source, (relative_path, description) in mapping.items():
        candidate = REPO_ROOT / relative_path
        records.append(
            {
                "source": source,
                "dataset": relative_path,
                "format": candidate.suffix.lstrip("."),
                "exists": candidate.exists(),
                "description": description,
            }
        )
    frame = pd.DataFrame(
        records, columns=["source", "dataset", "format", "exists", "description"]
    )
    return frame.sort_values(by="source", kind="stable").reset_index(drop=True)


# %%
def preview_topic_groups(groups: Mapping[str, list]) -> None:
    """Display the roadmap alignment for each section."""

    for section, topics in groups.items():
        titles = ", ".join(topic.title for topic in topics)
        print(f"- {section}: {titles}")


# %%
def preview_source_table(frame: pd.DataFrame) -> None:
    """Print the dataset table that pairs each source channel with repository assets."""

    print("\nSample datasets by source channel:\n")
    print(frame.to_markdown(index=False))


# %%
def main() -> None:
    """Run the Day 71 classroom walkthrough."""

    preview_topic_groups(TOPIC_GROUPS)
    preview_source_table(build_source_asset_table(SOURCE_DATASETS))
    print("\nData classification overview:\n")
    print(
        TOPIC_FRAME[TOPIC_FRAME["section"] != SOURCE_CHANNELS_SECTION].to_markdown(
            index=False
        )
    )


# %%
if __name__ == "__main__":
    main()
