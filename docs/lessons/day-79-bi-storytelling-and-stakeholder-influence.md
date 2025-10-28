---
title: Day 79 – BI Storytelling and Stakeholder Influence
tags:
  - BI
---

Day 79 teaches analysts how to weave together storytelling craft and change leadership so executive
audiences commit to action. The roadmap entries covering narrative assets, stakeholder dynamics, and
soft skills are turned into facilitation-ready walkthroughs that demonstrate how to convert metrics
into persuasive executive narratives.

## Learning goals

- Combine storytelling frameworks, executive summaries, and presentation design into reusable
  narrative assets.
- Translate BI metrics into audience-aware story arcs that call for a specific executive action.
- Map stakeholder, change, and project management levers into a single influence brief that supports
  adoption.
- Coach facilitators on the soft skills that sustain trust while guiding critical thinking in the
  room.

## Classroom flow

1. **Roadmap orientation** – Introduce the narrative asset and influence lever groupings so learners
   understand how the roadmap nodes reinforce one another.
1. **Story arc lab** – Walk teams through transforming a lagging metric into an executive-ready
   narrative, highlighting when to deploy storytelling, presentation, and dashboard assets.
1. **Influence brief build** – Co-create a stakeholder plan that pairs change management tactics
   with project milestones and business acumen talking points.
1. **Facilitation retro** – Reflect on which soft skills and critical thinking prompts kept the
   discussion grounded in outcomes.

## Storytelling walkthroughs

Use the `lesson.py` script to practice translating metrics into narratives:

- Showcase how a four-point drop in net revenue retention becomes a story arc with clear tension,
  decision, and reinforcement moments.
- Demonstrate the executive summary headline that links the insight to a concrete call to action.
- Connect the dashboard follow-up plan so leaders know how they will monitor progress post-meeting.

## Facilitation tips

- Start every walkthrough by clarifying the audience and the business question the metric answers
  before building slides.
- Pair each influence lever with a question that uncovers hidden risks (e.g., "What change fatigue
  might surface if we accelerate this project?").
- Encourage note-takers to capture the exact language stakeholders use; it becomes source material
  for executive summaries and follow-up communications.
- Close sessions by rehearsing the call to action aloud so facilitators hear whether the ask is
  compelling and achievable.

## Additional Topic: Self-Service Dashboards

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the
> [Phase 5 overview](https://github.com/saint2706/Coding-For-MBA/blob/main/docs/bi-curriculum.md) to see how the developer-roadmap topics align across
> Days 68–84.

## Why it matters

Build hands-on fluency with spreadsheet and dashboard tooling.

## Developer-roadmap alignment

- Excel
- Calculated Fields & Measures
- Visualization Fundamentals
- Chart Categories

## Next steps

- Draft case studies and notebooks that exercise these roadmap nodes.
- Update the Phase 5 cheat sheet with the insights you capture here.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 78 – Day 78 – BI Experimentation and Predictive Insights](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_78_BI_Experimentation_and_Predictive_Insights/README.md) • **Next:** [Day 80 – Day 80 – BI Data Quality and Governance](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_80_BI_Data_Quality_and_Governance/README.md)

_You are on lesson 79 of 108._

<!-- LESSON_FOOTER_END -->

## Additional Materials

???+ example "lesson.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_79_BI_Storytelling_and_Stakeholder_Influence/lesson.py)

````
```python title="lesson.py"
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
```
````

???+ example "solutions.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_79_BI_Storytelling_and_Stakeholder_Influence/solutions.py)

````
```python title="solutions.py"
"""Storytelling helpers for the Day 79 BI Storytelling and Stakeholder Influence lesson."""

from __future__ import annotations

from typing import Dict, List, Mapping, Sequence

from mypackage.bi_curriculum import BiTopic, group_topics_by_titles

NARRATIVE_ASSETS_SECTION = "Narrative assets"
INFLUENCE_LEVERS_SECTION = "Influence levers"

TOPIC_GROUPS: Mapping[str, Sequence[str]] = {
    NARRATIVE_ASSETS_SECTION: [
        "Storytelling Framework",
        "Communication & Storytelling",
        "Presentation Design",
        "Writing Executive Summaries",
        "Dashboard Design",
    ],
    INFLUENCE_LEVERS_SECTION: [
        "Stakeholder Management",
        "Change Management",
        "Project Management",
        "Business Acumen",
        "Critical Thinking",
        "Soft Skills",
    ],
}

NARRATIVE_PROMPTS: Mapping[str, str] = {
    "Storytelling Framework": (
        "Anchor the narrative arc around the business question your metric answers."
    ),
    "Communication & Storytelling": (
        "Translate the numbers into human stakes so the audience feels the urgency."
    ),
    "Presentation Design": (
        "Sequence slides so each visual escalates the story toward the decision moment."
    ),
    "Writing Executive Summaries": (
        "Condense the narrative into a skimmable brief that opens with the headline insight."
    ),
    "Dashboard Design": (
        "Highlight the follow-up dashboards that let leaders monitor the commitment."
    ),
}

INFLUENCE_PROMPTS: Mapping[str, str] = {
    "Stakeholder Management": (
        "List the decision makers, influencers, and challengers tied to the objective."
    ),
    "Change Management": (
        "Document adoption risks, communication cadences, and reinforcement tactics."
    ),
    "Project Management": (
        "Track milestones, owners, and success criteria that keep the initiative moving."
    ),
    "Business Acumen": (
        "Connect the ask to revenue, cost, or risk levers that resonate with leadership."
    ),
    "Critical Thinking": (
        "Pressure-test the recommendation with counter-metrics and alternative scenarios."
    ),
    "Soft Skills": (
        "Prepare facilitation moves—questions, pauses, and empathy cues—that sustain trust."
    ),
}

STORY_ARC_STAGES: Sequence[tuple[str, str]] = (
    ("Opening", "Storytelling Framework"),
    ("Tension", "Communication & Storytelling"),
    ("Visualization", "Presentation Design"),
    ("Decision", "Writing Executive Summaries"),
    ("Reinforcement", "Dashboard Design"),
)

INFLUENCE_SEQUENCE: Sequence[str] = (
    "Stakeholder Management",
    "Change Management",
    "Project Management",
    "Business Acumen",
    "Critical Thinking",
    "Soft Skills",
)


def load_topics(
    *, groups: Mapping[str, Sequence[str]] = TOPIC_GROUPS
) -> Dict[str, List[BiTopic]]:
    """Return roadmap topics grouped into narrative and influence collections."""

    return {group: topics for group, topics in group_topics_by_titles(groups).items()}


def narrative_asset_template(
    *,
    groups: Mapping[str, Sequence[str]] = TOPIC_GROUPS,
    prompts: Mapping[str, str] = NARRATIVE_PROMPTS,
) -> list[dict[str, str]]:
    """Provide facilitation prompts for each narrative asset roadmap topic."""

    grouped_topics = load_topics(groups=groups)
    template: list[dict[str, str]] = []
    for topic in grouped_topics[NARRATIVE_ASSETS_SECTION]:
        template.append(
            {
                "title": topic.title,
                "coaching_prompt": prompts.get(topic.title, ""),
            }
        )
    return template


def influence_lever_template(
    *,
    groups: Mapping[str, Sequence[str]] = TOPIC_GROUPS,
    prompts: Mapping[str, str] = INFLUENCE_PROMPTS,
) -> list[dict[str, str]]:
    """Provide briefing prompts for each influence lever roadmap topic."""

    grouped_topics = load_topics(groups=groups)
    template: list[dict[str, str]] = []
    for topic in grouped_topics[INFLUENCE_LEVERS_SECTION]:
        template.append(
            {
                "title": topic.title,
                "coaching_prompt": prompts.get(topic.title, ""),
            }
        )
    return template


def generate_story_arc(
    metric_name: str,
    insight: str,
    audience: str,
    call_to_action: str,
    *,
    stages: Sequence[tuple[str, str]] = STORY_ARC_STAGES,
    prompts: Mapping[str, str] = NARRATIVE_PROMPTS,
    groups: Mapping[str, Sequence[str]] = TOPIC_GROUPS,
) -> dict[str, object]:
    """Return a storyboard outline linking each phase to the roadmap topics."""

    grouped_topics = load_topics(groups=groups)
    valid_titles = {topic.title for topic in grouped_topics[NARRATIVE_ASSETS_SECTION]}
    arc: list[dict[str, str]] = []
    for stage, topic_title in stages:
        if topic_title not in valid_titles:
            raise KeyError(f"Unknown narrative topic: {topic_title}")
        arc.append(
            {
                "stage": stage,
                "linked_topic": topic_title,
                "guidance": prompts.get(
                    topic_title,
                    "",
                ),
            }
        )
    return {
        "metric": metric_name,
        "audience": audience,
        "insight": insight,
        "call_to_action": call_to_action,
        "arc": arc,
    }


def build_influence_brief(
    stakeholder: str,
    objective: str,
    change_risk: str,
    *,
    sequence: Sequence[str] = INFLUENCE_SEQUENCE,
    prompts: Mapping[str, str] = INFLUENCE_PROMPTS,
    groups: Mapping[str, Sequence[str]] = TOPIC_GROUPS,
) -> dict[str, object]:
    """Return a facilitation brief connecting influence levers to a stakeholder plan."""

    grouped_topics = load_topics(groups=groups)
    valid_titles = {topic.title for topic in grouped_topics[INFLUENCE_LEVERS_SECTION]}
    plan: list[dict[str, str]] = []
    for title in sequence:
        if title not in valid_titles:
            raise KeyError(f"Unknown influence topic: {title}")
        plan.append(
            {
                "lever": title,
                "guidance": prompts.get(title, ""),
            }
        )
    return {
        "stakeholder": stakeholder,
        "objective": objective,
        "change_risk": change_risk,
        "plan": plan,
    }


__all__ = [
    "build_influence_brief",
    "generate_story_arc",
    "influence_lever_template",
    "load_topics",
    "narrative_asset_template",
]
```
````
