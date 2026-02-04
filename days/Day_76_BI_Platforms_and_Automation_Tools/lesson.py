"""Day 76 – BI Platforms and Automation Tools classroom script."""

from __future__ import annotations

import pandas as pd
from Day_76_BI_Platforms_and_Automation_Tools import (
    build_platform_matrix,
    compare_export_formats,
    load_topics,
    simulate_refresh_workflow,
)

TOPIC_GROUPS = load_topics()
PLATFORM_MATRIX = build_platform_matrix()
EXPORT_MATRIX = compare_export_formats(
    include_formats=("PDF", "PowerPoint", "Excel", "CSV", "Google Sheets")
)

PYTHON_R_SNIPPET = """\
```python
import pathlib
import subprocess

DATA_EXPORT = pathlib.Path("exports/daily_metrics.csv")

trigger_refresh()  # Python orchestration
subprocess.run(["Rscript", "qa_checks.R", DATA_EXPORT.as_posix()], check=True)
notify_slack(channel="#bi-ops", message="Daily metrics refreshed with QA ✅")
```
"""


def preview_groupings() -> None:
    """Print the roadmap groupings for discussion."""

    rows: list[dict[str, str]] = []
    for section, topics in TOPIC_GROUPS.items():
        rows.append(
            {"Section": section, "Titles": ", ".join(topic.title for topic in topics)}
        )
    frame = pd.DataFrame(rows)
    print("\nDay 76 roadmap groupings\n")
    print(frame.to_markdown(index=False))


def show_platform_matrix() -> None:
    """Display the platform comparison matrix."""

    print("\nPlatform comparison matrix\n")
    print(PLATFORM_MATRIX.to_markdown(index=False))


def contrast_export_formats() -> None:
    """Highlight export format coverage across platforms."""

    print("\nExport format coverage\n")
    coverage = EXPORT_MATRIX.assign(
        **{
            column: EXPORT_MATRIX[column].map(lambda value: "✅" if value else "⬜")
            for column in EXPORT_MATRIX.columns
            if column != "platform"
        }
    )
    print(coverage.to_markdown(index=False))


def demonstrate_refresh_playbook() -> None:
    """Print an automation walkthrough that mixes Python and R."""

    plan = simulate_refresh_workflow("Power BI", languages=("Python", "R"))
    print("\nAutomation walkthrough\n")
    print(f"Platform: {plan['platform']} | Schedule: {plan['schedule']}")
    for step_number, step in enumerate(plan["steps"], start=1):
        print(f"{step_number}. {step}")
    print("\nPython ↔ R hand-off example\n")
    print(PYTHON_R_SNIPPET)


def main() -> None:
    """Run the Day 76 classroom walkthrough."""

    preview_groupings()
    show_platform_matrix()
    contrast_export_formats()
    demonstrate_refresh_playbook()


if __name__ == "__main__":
    main()
