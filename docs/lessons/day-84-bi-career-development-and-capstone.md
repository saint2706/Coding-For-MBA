---
title: Day 84 – BI Career Development and Capstone
tags:
  - BI
---

> This lesson closes Phase 5 by converting the roadmap insights into a polished career narrative.
> Pair it with
> [Day 83 – BI Cloud and Modern Data Stack](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_83_BI_Cloud_and_Modern_Data_Stack/README.md) and
> the planning prompts in this lesson.

## Why it matters

A strong capstone bridges your project experience with employer expectations. Using the roadmap
ensures that the assets you build speak the language of BI hiring managers and stakeholders.

## Capstone workflow

1. **Frame the business objective** – state the business question, success metrics, and stakeholder
   audience that will anchor your presentation.
1. **Design the solution storyline** – outline the analytics flow, highlight how each roadmap title
   becomes a tangible artifact, and document the collaboration or research you will showcase.
1. **Deliver and rehearse** – package the assets, rehearse the pitch, and prepare follow-up material
   such as interview responses or stakeholder FAQs.

## Career assets checklist

Use these roadmap-aligned prompts to plan the artifacts that demonstrate your value.

- [ ] Building Your Portfolio – curate 2–3 projects that reflect the BI stack you want to be hired
  for and verify the links work end to end.
- [ ] Portfolio presentation – craft a live walkthrough or video demo that emphasizes the business
  outcomes, not just the dashboards.
- [ ] Open-Source Projects – contribute a small feature or documentation update to a BI tool and
  capture screenshots or pull requests.
- [ ] BI Competitions – summarize results, lessons learned, and ranking; link to notebooks or
  dashboards.
- [ ] BI Communities – list the meetups, Slack groups, or forums where you discuss trends and what
  you have learned.
- [ ] Conferences & Webinars – log the events you attend, the insights gained, and how they
  influence your projects.
- [ ] Networking – schedule outreach conversations with analysts or hiring managers and document the
  advice you receive.
- [ ] Professional Development – document the courses, workshops, or mentoring sessions that
  sharpened your BI skills.
- [ ] Certifications – track progress toward credentials, exam dates, and renewal plans.

## Job readiness checklist

Focus your interview preparation with these roadmap tasks.

- [ ] Resume optimization – align bullets with BI metrics, tools, and quantified outcomes.
- [ ] Interview preparation – rehearse portfolio walkthroughs, stakeholder stories, and challenge
  questions that link to the capstone.
- [ ] Salary negotiation strategies – research compensation benchmarks, benefits, and cost-of-living
  adjustments.
- [ ] Job Preparation – outline your 30/60/90-day plan, onboarding priorities, and key relationships
  to build once you land the role.

## Next steps

- Run `python Day_84_BI_Career_Development_and_Capstone/lesson.py` to print the capstone phases and
  generate checklist templates.
- Export the JSON checklist to your project management tool and update it as you complete each
  roadmap milestone.

## Additional Topic: Strategic Roadmapping & Next Steps

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the
> [Phase 5 overview](https://github.com/saint2706/Coding-For-MBA/blob/main/docs/bi-curriculum.md) to see how the developer-roadmap topics align across
> Days 68–84.

## Why it matters

Synthesize the specialization into ongoing strategic roadmaps.

## Developer-roadmap alignment

- Professional Development
- Key Business Functions
- Types of BI Operations
- Metrics and KPIs

## Next steps

- Draft case studies and notebooks that exercise these roadmap nodes.
- Update the Phase 5 cheat sheet with the insights you capture here.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 83 – Day 83 – BI Cloud and Modern Data Stack](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_83_BI_Cloud_and_Modern_Data_Stack/README.md) • **Next:** [Day 85 – Day 85 – Advanced SQL and Performance Tuning](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_85_Advanced_SQL/README.md)

_You are on lesson 84 of 108._

<!-- LESSON_FOOTER_END -->

## Additional Materials

???+ example "lesson.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_84_BI_Career_Development_and_Capstone/lesson.py)

    ```python title="lesson.py"
    # %%
    """Day 84 – BI Career Development and Capstone classroom script."""

    # %%
    from __future__ import annotations

    from textwrap import indent

    from Day_84_BI_Career_Development_and_Capstone import (
        generate_checklists,
        serialize_checklists,
    )

    # %%
    CAPSTONE_PHASES: list[tuple[str, str]] = [
        (
            "Phase 1 – Frame the business objective",
            (
                "Summarize the business question, BI success metrics, and stakeholders. "
                "Anchor your narrative in the developer-roadmap nodes you plan to demonstrate."
            ),
        ),
        (
            "Phase 2 – Design the solution storyline",
            (
                "Sketch a walkthrough that highlights your analytics workflow, decision checkpoints, "
                "and how you will showcase portfolio artifacts such as dashboards or notebooks."
            ),
        ),
        (
            "Phase 3 – Deliverables and rehearsal",
            (
                "Map roadmap titles to concrete deliverables, rehearse the presentation, and prepare "
                "supporting assets for interviews or stakeholder reviews."
            ),
        ),
    ]

    # %%
    CHECKLISTS = generate_checklists()


    # %%
    def outline_capstone(phases: list[tuple[str, str]] = CAPSTONE_PHASES) -> None:
        """Print the recommended capstone phases and guidance."""

        print("\nDay 84 capstone planning guide\n")
        for phase, description in phases:
            print(f"{phase}\n{indent(description, '  ')}\n")


    # %%
    def display_checklists(checklists=CHECKLISTS) -> None:
        """Print actionable checklists for learners."""

        print("Roadmap-aligned checklists\n")
        for group, items in checklists.items():
            print(f"## {group}")
            for item in items:
                print(f"- [ ] {item.title}")
            print()


    # %%
    def main() -> None:
        """Guide the learner through the Day 84 facilitation."""

        outline_capstone()
        display_checklists()
        print("Serialized checklist template (copy into your notes tool):\n")
        print(serialize_checklists(CHECKLISTS))


    # %%
    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_84_BI_Career_Development_and_Capstone/solutions.py)

    ```python title="solutions.py"
    """Utilities for Day 84 – BI Career Development and Capstone."""

    from __future__ import annotations

    import json
    from dataclasses import dataclass
    from pathlib import Path
    from typing import Iterable, Mapping, MutableMapping

    from mypackage.bi_curriculum import BiTopic, group_topics_by_titles

    CAREER_ASSET_TITLES: list[str] = [
        "Building Your Portfolio",
        "Portfolio presentation",
        "Open-Source Projects",
        "BI Competitions",
        "BI Communities",
        "Conferences & Webinars",
        "Networking",
        "Professional Development",
        "Certifications",
    ]

    JOB_READINESS_TITLES: list[str] = [
        "Resume optimization",
        "Interview preparation",
        "Salary negotiation strategies",
        "Job Preparation",
    ]

    ROADMAP_GROUPS: Mapping[str, list[str]] = {
        "Career assets": CAREER_ASSET_TITLES,
        "Job readiness": JOB_READINESS_TITLES,
    }


    @dataclass(slots=True)
    class ChecklistItem:
        """A simple representation of a learner checklist item."""

        title: str
        status: str = "Not started"
        notes: str = ""

        def to_dict(self) -> dict[str, str]:
            """Return a serializable representation of the checklist item."""

            return {"title": self.title, "status": self.status, "notes": self.notes}


    def load_career_topics(
        *, groups: Mapping[str, Iterable[str]] = ROADMAP_GROUPS
    ) -> dict[str, list[BiTopic]]:
        """Return the roadmap topics grouped for the capstone."""

        return group_topics_by_titles(groups)


    def _build_checklist(topics: Iterable[BiTopic]) -> list[ChecklistItem]:
        """Create checklist items from BI topics."""

        return [ChecklistItem(title=topic.title) for topic in topics]


    def generate_checklists(
        *, groups: Mapping[str, Iterable[str]] = ROADMAP_GROUPS
    ) -> dict[str, list[ChecklistItem]]:
        """Return checklist templates for career assets and job readiness."""

        grouped_topics = load_career_topics(groups=groups)
        return {group: _build_checklist(topics) for group, topics in grouped_topics.items()}


    def _checklists_to_serializable(
        checklists: Mapping[str, Iterable[ChecklistItem]],
    ) -> dict[str, list[dict[str, str]]]:
        """Convert checklist dataclasses into JSON serializable dictionaries."""

        payload: MutableMapping[str, list[dict[str, str]]] = {}
        for group, items in checklists.items():
            payload[group] = [item.to_dict() for item in items]
        return dict(payload)


    def serialize_checklists(
        checklists: Mapping[str, Iterable[ChecklistItem]] | None = None,
        *,
        groups: Mapping[str, Iterable[str]] = ROADMAP_GROUPS,
        path: str | Path | None = None,
        indent: int = 2,
    ) -> str:
        """Return JSON for the grouped checklists and optionally persist it."""

        resolved = (
            checklists if checklists is not None else generate_checklists(groups=groups)
        )
        serializable = _checklists_to_serializable(resolved)
        json_text = json.dumps(serializable, indent=indent)
        if path is not None:
            destination = Path(path)
            destination.write_text(json_text, encoding="utf-8")
        return json_text


    __all__ = [
        "CAREER_ASSET_TITLES",
        "JOB_READINESS_TITLES",
        "ChecklistItem",
        "generate_checklists",
        "load_career_topics",
        "serialize_checklists",
    ]
    ```
