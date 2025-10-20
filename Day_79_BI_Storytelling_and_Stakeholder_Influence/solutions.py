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
