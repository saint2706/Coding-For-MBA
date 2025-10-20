Day 69 extends the BI Analyst roadmap by pairing strategic constructs with the humans who bring them to life. The lesson gives participants a toolkit for translating the roadmap nodes into facilitation plans, stakeholder engagement tactics, and action-oriented guidance.

## Learning goals

- Differentiate operating model topics such as BI operations, stakeholder identification, and key business functions.
- Contrast operational, tactical, and strategic BI activities to align expectations and investment.
- Practice mapping stakeholder personas to the BI operating model that best reflects their needs.
- Capture facilitation notes and coaching prompts you can re-use across client engagements.

## Classroom flow

1. **Operating model orientation** – Facilitate a discussion on how BI teams structure the work, using the roadmap topics as anchors.
2. **Stakeholder mapping exercise** – Break cohorts into pairs to match stakeholder personas with the BI operations that unlock their outcomes.
3. **Strategy tier decisions** – Lead a dialogue about when to apply operational vs tactical vs strategic BI and what artifacts each requires.
4. **Action planning** – Summarize the commitments and metrics each stakeholder group should own after the session.

## Stakeholder mapping exercise

Use the following prompts during the exercise:

- *Marketing director*: Which BI operation clarifies campaign performance? Why?
- *Finance controller*: Which BI function keeps recurring reporting accurate and compliant?
- *Operations manager*: How does BI support day-to-day execution and exception handling?
- *Executive sponsor*: What strategic BI questions keep them focused on long-term growth?

Encourage learners to map each persona to the operating model and strategy tier that best serves their needs, then capture one actionable insight per persona.

## Facilitation tips

- Reinforce that operating models exist to keep stakeholders coordinated, not to create bureaucracy.
- Encourage participants to co-design escalation paths for when insights conflict with intuition.
- Close the session with a commitment from each stakeholder persona: what decision will they make differently because of the BI strategy?

## Additional Materials

???+ example "lesson.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_69_BI_Strategy_and_Stakeholders/lesson.py)

    ```python title="lesson.py"
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
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_69_BI_Strategy_and_Stakeholders/solutions.py)

    ```python title="solutions.py"
    """Topic helpers for the Day 69 BI Strategy and Stakeholders lesson."""

    from __future__ import annotations

    from typing import Dict, List, Mapping, Sequence

    import pandas as pd

    from mypackage.bi_curriculum import BiTopic, group_topics_by_titles

    OPERATING_MODEL_SECTION = "Operating models"
    STRATEGY_TIER_SECTION = "Strategy tiers"

    TOPIC_GROUPS: Mapping[str, Sequence[str]] = {
        OPERATING_MODEL_SECTION: [
            "Types of BI Operations",
            "Stakeholder Identification",
            "Key Business Functions",
        ],
        STRATEGY_TIER_SECTION: [
            "Operational BI",
            "Tactical BI",
            "Strategic BI",
        ],
    }

    TOPIC_DESCRIPTIONS: Mapping[str, str] = {
        "Types of BI Operations": (
            "Frame how BI teams deliver value across centralized, federated, and hybrid "
            "operating models."
        ),
        "Stakeholder Identification": (
            "Coach analysts to document personas, influence levels, and decision rights "
            "before building artifacts."
        ),
        "Key Business Functions": (
            "Highlight finance, marketing, operations, and executive rhythms that rely "
            "on BI insights."
        ),
        "Operational BI": (
            "Align dashboards and alerts with frontline managers who need real-time "
            "support."
        ),
        "Tactical BI": (
            "Equip business partners with weekly and monthly reviews that translate "
            "performance into initiatives."
        ),
        "Strategic BI": (
            "Focus leadership on long-range bets, portfolio management, and scenario "
            "planning."
        ),
    }


    def load_topics(
        *, groups: Mapping[str, Sequence[str]] = TOPIC_GROUPS
    ) -> Dict[str, List[BiTopic]]:
        """Return roadmap topics grouped into BI operating and strategy tiers."""

        return {group: topics for group, topics in group_topics_by_titles(groups).items()}


    def build_topic_dataframe(
        *,
        groups: Mapping[str, Sequence[str]] = TOPIC_GROUPS,
        descriptions: Mapping[str, str] = TOPIC_DESCRIPTIONS,
    ) -> pd.DataFrame:
        """Create a DataFrame summarizing Day 69 BI strategy topics."""

        grouped_topics = load_topics(groups=groups)
        records: list[dict[str, str]] = []
        for section, topics in grouped_topics.items():
            for topic in topics:
                records.append(
                    {
                        "section": section,
                        "title": topic.title,
                        "description": descriptions.get(topic.title, ""),
                    }
                )
        return pd.DataFrame(records, columns=["section", "title", "description"])


    __all__ = ["build_topic_dataframe", "load_topics"]
    ```
