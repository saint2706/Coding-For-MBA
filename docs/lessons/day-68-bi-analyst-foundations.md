> This lesson is part of the Phase 5 Business Intelligence specialization. Use the [Phase 5 overview](https://github.com/saint2706/Coding-For-MBA/blob/main/docs/bi-curriculum.md)
> to see how the developer-roadmap topics align across Days 68–84.

## Why it matters

Ground the cohort in the responsibilities and strategic value of the BI Analyst role before
moving into tooling, governance, and storytelling modules.

## Developer-roadmap alignment

- Introduction
- What is BI?
- Why BI Matters?
- Responsibilities
- Skills
- BI Analyst vs Other Roles

## Classroom flow

1. Use `lesson.py` to preview the "Foundations" grouping sourced from the roadmap dataset.
2. Facilitate a discussion around the markdown table to surface learner experiences with the
   listed responsibilities and skills.
3. Capture open questions about cross-functional collaboration to revisit during Days 69–72.

## Next steps

- Expand the demo notebook with scenario prompts for each responsibility.
- Update the Phase 5 cheat sheet with language that differentiates BI Analysts from
  neighboring roles.

## Additional Materials

???+ example "lesson.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_68_BI_Analyst_Foundations/lesson.py)

    ```python title="lesson.py"
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
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_68_BI_Analyst_Foundations/solutions.py)

    ```python title="solutions.py"
    """Utilities for the Day 68 BI Analyst Foundations lesson."""

    from __future__ import annotations

    from typing import Dict, List, Mapping

    import pandas as pd

    from mypackage.bi_curriculum import BiTopic, topics_by_titles

    FOUNDATION_SECTION = "Foundations"
    FOUNDATION_TITLES: List[str] = [
        "Introduction",
        "What is BI?",
        "Why BI Matters?",
        "Responsibilities",
        "Skills",
        "BI Analyst vs Other Roles",
    ]

    TOPIC_DESCRIPTIONS: Mapping[str, str] = {
        "Introduction": (
            "Orient the cohort to the BI Analyst roadmap and how Day 68 frames the "
            "rest of Phase 5."
        ),
        "What is BI?": (
            "Define business intelligence as the practice of transforming raw data into "
            "insights for operational and strategic decisions."
        ),
        "Why BI Matters?": (
            "Summarize the business value of BI for growth, efficiency, and governance "
            "initiatives."
        ),
        "Responsibilities": (
            "Outline the day-to-day analyst duties across discovery, modeling, "
            "reporting, and stakeholder alignment."
        ),
        "Skills": (
            "Call out the technical, analytical, and communication skills required to "
            "deliver BI outcomes."
        ),
        "BI Analyst vs Other Roles": (
            "Contrast the analyst role with data scientists, engineers, and product "
            "managers to clarify collaboration touchpoints."
        ),
    }


    def load_topics(*, section: str = FOUNDATION_SECTION) -> Dict[str, List[BiTopic]]:
        """Return BI roadmap topics grouped under the requested section name."""

        topics = topics_by_titles(FOUNDATION_TITLES)
        return {section: topics}


    def build_topic_dataframe(
        *,
        section: str = FOUNDATION_SECTION,
        descriptions: Mapping[str, str] = TOPIC_DESCRIPTIONS,
    ) -> pd.DataFrame:
        """Return a pandas DataFrame describing the BI foundations topics."""

        grouped_topics = load_topics(section=section)
        records: list[dict[str, str]] = []
        for group, topics in grouped_topics.items():
            for topic in topics:
                records.append(
                    {
                        "section": group,
                        "title": topic.title,
                        "description": descriptions.get(topic.title, ""),
                    }
                )
        return pd.DataFrame(records, columns=["section", "title", "description"])


    __all__ = ["build_topic_dataframe", "load_topics"]
    ```
