---
title: Day 76 – BI Platforms and Automation Tools
tags:
  - BI
---

Day 76 explores the major BI delivery platforms alongside the scripting and standardisation
practices that keep report refreshes trustworthy. We contrast Power BI, Tableau, Qlik, Looker, and
Excel with the Python/R automation surface that analysts lean on for orchestration.

## Roadmap groupings

| Section | Titles | | --- | --- | | BI platforms | Power BI, Tableau, Qlik, Looker, BI Platforms |
| Scripting & standards | Python, R, Standardisation, Excel |

## Platform comparison matrix

| Platform | Deployment | Export formats | Automation | Scripting hooks | Notes | | --- | --- | ---
| --- | --- | --- | | Power BI | Cloud & desktop | PBIX, PDF, PowerPoint, Excel, CSV | Power
Automate, REST API, Azure Data Factory | Python, R, DAX | Microsoft ecosystem integration with
strong scheduling via Power Automate and dataset refresh APIs. | | Tableau | Cloud & server | TWBX,
PDF, PowerPoint, Image, CSV | Tableau Prep, Tableau Server Client, REST API | Python, R, Tableau
Extensions | Flexible embedding with Tableau Server Client (TSC) for scripted publishes and
extracts. | | Qlik | Cloud & on-premises | QVF, PDF, Excel, CSV | Qlik Application Automation, REST
API | Python, R, Qlik Script | Associative engine excels at governed self-service and scripted
reload tasks. | | Looker | Cloud | Looks, PDF, Google Sheets, CSV | Looker API, Scheduled
Deliveries, Cloud Composer | Python, LookML, SQL | Model-driven semantic layer with strong API
orchestration via Python SDKs. | | Excel | Desktop & cloud | XLSX, CSV, PDF | Power Query, Office
Scripts, VBA | Python, R, VBA | Ubiquitous analysis surface; serves as bridge between BI exports and
finance modelling. |

## Python ↔ R interop for refresh automation

```python
import pathlib
import subprocess

DATA_EXPORT = pathlib.Path("exports/daily_metrics.csv")

# 1. Kick off the platform refresh via Python.
trigger_refresh()

# 2. Use R for statistical QA once the export lands.
subprocess.run(
    ["Rscript", "qa_checks.R", DATA_EXPORT.as_posix()],
    check=True,
)

# 3. Back in Python, notify the analytics channel once tests pass.
notify_slack(channel="#bi-ops", message="Daily metrics refreshed with QA ✅")
```

The snippet mirrors the helper utilities in `solutions.py`: schedule a refresh via Python, execute
R-based QA, and send downstream notifications after successfully validating exports.

## Additional Topic: Exploratory Diagnostics

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the
> [Phase 5 overview](https://github.com/saint2706/Coding-For-MBA/blob/main/docs/bi-curriculum.md) to see how the developer-roadmap topics align across
> Days 68–84.

## Why it matters

Reveal why metrics move using diagnostic analytics.

## Developer-roadmap alignment

- Exploratory Data Analysis (EDA)
- Correlation Analysis
- Cohort Analysis

## Next steps

- Draft case studies and notebooks that exercise these roadmap nodes.
- Update the Phase 5 cheat sheet with the insights you capture here.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 75 – Day 75 – BI Visualization and Dashboard Principles](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_75_BI_Visualization_and_Dashboard_Principles/README.md) • **Next:** [Day 77 – Day 77 – BI Domain Analytics and Value Drivers](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_77_BI_Domain_Analytics_and_Value_Drivers/README.md)

_You are on lesson 76 of 108._

<!-- LESSON_FOOTER_END -->

## Interactive Notebooks

Run this lesson's notebooks directly in your browser with the built-in JupyterLite runtime.

[🪐 Launch in JupyterLite](/jupyterlite/lab?path=Day_76_BI_Platforms_and_Automation_Tools){ .md-button .md-button--primary }

## Additional Materials

???+ example "lesson.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_76_BI_Platforms_and_Automation_Tools/lesson.py)

````
```python title="lesson.py"
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
```
````

???+ example "solutions.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_76_BI_Platforms_and_Automation_Tools/solutions.py)

````
```python title="solutions.py"
"""Utilities for the Day 76 BI Platforms and Automation Tools lesson."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Mapping, Sequence

import pandas as pd

from mypackage.bi_curriculum import BiTopic, group_topics_by_titles

# --- Roadmap groupings ----------------------------------------------------

TOPIC_GROUP_TITLES: Mapping[str, Sequence[str]] = {
    "BI platforms": (
        "Power BI",
        "Tableau",
        "Qlik",
        "Looker",
        "BI Platforms",
    ),
    "Scripting & standards": (
        "Python",
        "R",
        "Standardisation",
        "Excel",
    ),
}


@dataclass(frozen=True, slots=True)
class PlatformProfile:
    """Curated details about a BI platform for classroom comparisons."""

    name: str
    deployment: str
    export_formats: tuple[str, ...]
    automation_connectors: tuple[str, ...]
    scripting_hooks: tuple[str, ...]
    notes: str


PLATFORM_PROFILES: Mapping[str, PlatformProfile] = {
    profile.name: profile
    for profile in (
        PlatformProfile(
            name="Power BI",
            deployment="Cloud & desktop",
            export_formats=("PBIX", "PDF", "PowerPoint", "Excel", "CSV"),
            automation_connectors=(
                "Power Automate",
                "REST API",
                "Azure Data Factory",
            ),
            scripting_hooks=("Python", "R", "DAX"),
            notes=(
                "Microsoft ecosystem integration with strong scheduling via Power "
                "Automate and dataset refresh APIs."
            ),
        ),
        PlatformProfile(
            name="Tableau",
            deployment="Cloud & server",
            export_formats=("TWBX", "PDF", "PowerPoint", "Image", "CSV"),
            automation_connectors=("Tableau Prep", "Tableau Server Client", "REST API"),
            scripting_hooks=("Python", "R", "Tableau Extensions"),
            notes=(
                "Flexible embedding with Tableau Server Client (TSC) for scripted "
                "publishes and extracts."
            ),
        ),
        PlatformProfile(
            name="Qlik",
            deployment="Cloud & on-premises",
            export_formats=("QVF", "PDF", "Excel", "CSV"),
            automation_connectors=("Qlik Application Automation", "REST API"),
            scripting_hooks=("Python", "R", "Qlik Script"),
            notes=(
                "Associative engine excels at governed self-service and scripted "
                "reload tasks."
            ),
        ),
        PlatformProfile(
            name="Looker",
            deployment="Cloud",
            export_formats=("Looks", "PDF", "Google Sheets", "CSV"),
            automation_connectors=(
                "Looker API",
                "Scheduled Deliveries",
                "Cloud Composer",
            ),
            scripting_hooks=("Python", "LookML", "SQL"),
            notes=(
                "Model-driven semantic layer with strong API orchestration via "
                "Python SDKs."
            ),
        ),
        PlatformProfile(
            name="Excel",
            deployment="Desktop & cloud",
            export_formats=("XLSX", "CSV", "PDF"),
            automation_connectors=("Power Query", "Office Scripts", "VBA"),
            scripting_hooks=("Python", "R", "VBA"),
            notes=(
                "Ubiquitous analysis surface; serves as bridge between BI exports "
                "and finance modelling."
            ),
        ),
    )
}


# --- Roadmap helpers ------------------------------------------------------


def load_topics(
    groups: Mapping[str, Sequence[str]] = TOPIC_GROUP_TITLES,
) -> dict[str, list[BiTopic]]:
    """Return roadmap topics grouped by the requested sections."""

    return group_topics_by_titles(groups)


# --- Platform metadata helpers -------------------------------------------


def build_platform_matrix(
    profiles: Mapping[str, PlatformProfile] = PLATFORM_PROFILES,
) -> pd.DataFrame:
    """Return a comparison matrix for BI platforms and scripting touchpoints."""

    records: list[dict[str, object]] = []
    for profile in profiles.values():
        records.append(
            {
                "platform": profile.name,
                "deployment": profile.deployment,
                "export_formats": ", ".join(profile.export_formats),
                "automation": ", ".join(profile.automation_connectors),
                "scripting_hooks": ", ".join(profile.scripting_hooks),
                "notes": profile.notes,
            }
        )
    frame = pd.DataFrame(
        records,
        columns=[
            "platform",
            "deployment",
            "export_formats",
            "automation",
            "scripting_hooks",
            "notes",
        ],
    )
    return frame.sort_values("platform").reset_index(drop=True)


def compare_export_formats(
    profiles: Mapping[str, PlatformProfile] = PLATFORM_PROFILES,
    *,
    include_formats: Iterable[str] | None = None,
) -> pd.DataFrame:
    """Return a boolean matrix contrasting common export targets."""

    exports = set(include_formats or ())
    if not exports:
        for profile in profiles.values():
            exports.update(profile.export_formats)
    ordered_formats = sorted(exports)
    records: list[dict[str, object]] = []
    for profile in profiles.values():
        row = {"platform": profile.name}
        for export in ordered_formats:
            row[export] = export in profile.export_formats
        records.append(row)
    frame = pd.DataFrame(records)
    return frame.sort_values("platform").reset_index(drop=True)


def simulate_refresh_workflow(
    platform: str,
    *,
    languages: Sequence[str] = ("Python", "R"),
    schedule: str = "Daily",
    profiles: Mapping[str, PlatformProfile] = PLATFORM_PROFILES,
) -> dict[str, object]:
    """Return an automation playbook for refreshing a BI report."""

    try:
        profile = profiles[platform]
    except KeyError as exc:  # pragma: no cover - defensive branch
        raise KeyError(f"Unknown platform: {platform}") from exc

    normalized_languages = tuple(dict.fromkeys(languages))
    primary = normalized_languages[0]
    steps: list[str] = [
        f"Authenticate with {profile.automation_connectors[0]} to queue a refresh",
        f"Use {primary} to call the {profile.automation_connectors[1]} or relevant API",
    ]
    if len(normalized_languages) > 1:
        secondary = normalized_languages[1]
        steps.append(
            f"Invoke {secondary} for post-refresh QA (e.g., statistical tests on exported data)"
        )
    steps.append("Notify stakeholders with the latest export via preferred channel")

    return {
        "platform": profile.name,
        "schedule": schedule,
        "languages": normalized_languages,
        "connectors": profile.automation_connectors,
        "steps": steps,
    }


__all__ = [
    "PLATFORM_PROFILES",
    "PlatformProfile",
    "TOPIC_GROUP_TITLES",
    "build_platform_matrix",
    "compare_export_formats",
    "load_topics",
    "simulate_refresh_workflow",
]
```
````
