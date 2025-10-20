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
