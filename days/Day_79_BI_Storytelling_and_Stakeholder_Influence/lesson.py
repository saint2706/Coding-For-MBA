"""Day 79 – BI Storytelling and Stakeholder Influence classroom script."""

from __future__ import annotations

import pandas as pd

from Day_79_BI_Storytelling_and_Stakeholder_Influence import (
    build_influence_brief,
    generate_story_arc,
    influence_lever_template,
    load_topics,
    narrative_asset_template,
)

GROUPED_TOPICS = load_topics()
NARRATIVE_TEMPLATE = narrative_asset_template()
INFLUENCE_TEMPLATE = influence_lever_template()


def preview_topic_groups(groups: dict[str, list]) -> None:
    """Print the storytelling and influence groupings."""

    print("\nDay 79 storytelling and influence roadmap clusters\n")
    for section, topics in groups.items():
        titles = ", ".join(topic.title for topic in topics)
        print(f"- {section}: {titles}")


def show_narrative_prompts(template: list[dict[str, str]]) -> None:
    """Display coaching prompts for the narrative assets."""

    frame = pd.DataFrame(template)
    print("\nNarrative asset prompts\n")
    print(frame.to_markdown(index=False))


def show_influence_prompts(template: list[dict[str, str]]) -> None:
    """Display facilitation prompts for the influence levers."""

    frame = pd.DataFrame(template)
    print("\nInfluence lever prompts\n")
    print(frame.to_markdown(index=False))


def walkthrough_storytelling(
    metric: str, insight: str, audience: str, action: str
) -> None:
    """Walk through how to turn metrics into executive-ready narratives."""

    arc = generate_story_arc(metric, insight, audience, action)
    frame = pd.DataFrame(arc["arc"])
    print("\nStory arc walkthrough\n")
    print(frame.to_markdown(index=False))
    print(
        "\nNarrative headline:\n"
        f"For {arc['audience']}, we highlight {arc['insight']} in the {arc['metric']} metric\n"
        f"so they will {arc['call_to_action']}."
    )


def walkthrough_influence_plan(stakeholder: str, objective: str, risk: str) -> None:
    """Demonstrate how to facilitate an influence brief."""

    brief = build_influence_brief(stakeholder, objective, risk)
    frame = pd.DataFrame(brief["plan"])
    print("\nStakeholder influence brief\n")
    print(frame.to_markdown(index=False))
    print(
        "\nFacilitation reminder:\n"
        f"When working with {brief['stakeholder']}, focus on {brief['objective']} while mitigating {brief['change_risk']}."
    )


def main() -> None:
    """Run the Day 79 classroom walkthrough."""

    preview_topic_groups(GROUPED_TOPICS)
    show_narrative_prompts(NARRATIVE_TEMPLATE)
    walkthrough_storytelling(
        metric="net revenue retention",
        insight="a four-point drop driven by APAC churn",
        audience="executive sponsors",
        action="approve the renewal enablement budget",
    )
    show_influence_prompts(INFLUENCE_TEMPLATE)
    walkthrough_influence_plan(
        stakeholder="customer success leadership",
        objective="restore retention within two quarters",
        risk="change fatigue across frontline managers",
    )


if __name__ == "__main__":
    main()
