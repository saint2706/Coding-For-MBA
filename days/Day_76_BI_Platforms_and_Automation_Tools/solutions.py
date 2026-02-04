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
