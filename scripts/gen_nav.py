#!/usr/bin/env python3
"""
Generate MkDocs navigation with collapsible phase groups.

This script scans lesson folders (Day_XX_*), groups them by phase,
and generates a structured navigation section for mkdocs.yml.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
from pathlib import Path
from typing import Dict, List, Tuple

import yaml

# Default phase ranges (fallback if not detected from docs/index.md)
DEFAULT_PHASES = {
    1: {"range": (1, 20), "name": "Phase 1 • Python Foundations"},
    2: {"range": (21, 39), "name": "Phase 2 • Data Analytics & Workflows"},
    3: {"range": (40, 54), "name": "Phase 3 • Machine Learning Foundations"},
    4: {"range": (55, 67), "name": "Phase 4 • Advanced ML & MLOps"},
    5: {"range": (68, 84), "name": "Phase 5 • Business Intelligence"},
    6: {"range": (85, 90), "name": "Phase 6 • BI Advanced & Capstone"},
    7: {"range": (91, 108), "name": "Phase 7 • SQL & Database Mastery"},
}


def extract_day_number(folder_name: str) -> int | None:
    """Extract day number from folder name like Day_01_Introduction."""
    match = re.match(r"Day_(\d{2,3})_", folder_name)
    return int(match.group(1)) if match else None


def extract_title_from_readme(readme_path: Path) -> str | None:
    """Extract title from first # or ## header in README.md."""
    try:
        with open(readme_path, "r", encoding="utf-8") as f:
            for line in f:
                match = re.match(r"^#+ (.+)$", line.strip())
                if match:
                    return match.group(1)
    except Exception:
        pass
    return None


def scan_lessons(repo_root: Path) -> List[Dict[str, any]]:
    """Scan repository for Day_XX_* folders and extract lesson info."""
    lessons = []

    for folder in sorted(repo_root.iterdir()):
        if not folder.is_dir() or not folder.name.startswith("Day_"):
            continue

        day_num = extract_day_number(folder.name)
        if day_num is None:
            continue

        readme_path = folder / "README.md"
        title = extract_title_from_readme(readme_path)
        if title is None:
            # Fallback to folder name
            title = folder.name.replace("_", " ")

        lessons.append(
            {"day": day_num, "folder": folder.name, "title": title, "path": folder}
        )

    return sorted(lessons, key=lambda x: x["day"])


def detect_phases_from_index(index_path: Path) -> Dict[int, Dict] | None:
    """
    Try to detect phase ranges from docs/index.md curriculum table.
    Returns None if not found, falls back to DEFAULT_PHASES.
    """
    # For now, use default phases since the structure is well-defined
    return None


def group_lessons_by_phase(
    lessons: List[Dict], phases: Dict[int, Dict]
) -> Dict[int, List[Dict]]:
    """Group lessons into phases based on day numbers."""
    grouped = {phase_id: [] for phase_id in phases.keys()}

    for lesson in lessons:
        day = lesson["day"]
        for phase_id, phase_info in phases.items():
            start, end = phase_info["range"]
            if start <= day <= end:
                grouped[phase_id].append(lesson)
                break

    return grouped


def generate_nav_structure(
    grouped_lessons: Dict[int, List[Dict]], phases: Dict[int, Dict]
) -> List:
    """Generate navigation structure for mkdocs.yml."""
    nav = []

    # Add Home
    nav.append({"Home": "index.md"})

    # Add Get Started
    nav.append({"Get Started": "get-started.md"})

    # Add Phases section
    phases_nav = []
    phases_nav.append({"Overview": "phases/overview.md"})

    for phase_id in sorted(phases.keys()):
        phase_info = phases[phase_id]
        phase_name = phase_info["name"]
        # Link to phase overview page
        phases_nav.append({phase_name: f"phases/phase_{phase_id}_overview.md"})

    nav.append({"Phases": phases_nav})

    # Add Lessons section with collapsible phases
    lessons_nav = []
    lessons_nav.append({"All Lessons": "lessons/_index.md"})
    lessons_nav.append({"Lesson Library": "lessons/index.md"})

    for phase_id in sorted(phases.keys()):
        phase_info = phases[phase_id]
        phase_lessons = grouped_lessons.get(phase_id, [])

        if not phase_lessons:
            continue

        phase_name = phase_info["name"]
        phase_items = []

        for lesson in phase_lessons:
            # Convert folder name to lesson markdown path
            lesson_slug = lesson["folder"].lower().replace("_", "-")
            lesson_path = f"lessons/{lesson_slug}.md"

            # Create lesson nav entry
            lesson_title = lesson["title"]
            phase_items.append({lesson_title: lesson_path})

        # Add collapsible phase group
        lessons_nav.append({phase_name: phase_items})

    nav.append({"Lessons": lessons_nav})

    return nav


def backup_file(file_path: Path) -> Path:
    """Create a backup of the file with .bak extension."""
    backup_path = file_path.with_suffix(file_path.suffix + ".bak")
    shutil.copy2(file_path, backup_path)
    return backup_path


def update_mkdocs_yml(mkdocs_path: Path, new_nav: List, dry_run: bool = False) -> None:
    """Update mkdocs.yml with new navigation structure."""
    with open(mkdocs_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    old_nav = config.get("nav", [])

    if dry_run:
        print("🔍 DRY RUN - Would update navigation:")
        print("\nOld nav structure (first 5 items):")
        print(yaml.dump(old_nav[:5], default_flow_style=False, sort_keys=False))
        print("\nNew nav structure (first 5 items):")
        print(yaml.dump(new_nav[:5], default_flow_style=False, sort_keys=False))
        print(f"\nTotal nav items: old={len(old_nav)}, new={len(new_nav)}")
        return

    # Backup original
    backup_path = backup_file(mkdocs_path)
    print(f"✅ Created backup: {backup_path}")

    # Update nav
    config["nav"] = new_nav

    # Write updated config
    with open(mkdocs_path, "w", encoding="utf-8") as f:
        yaml.dump(config, f, default_flow_style=False, sort_keys=False, width=1000)

    print(f"✅ Updated {mkdocs_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Generate MkDocs navigation with phase grouping"
    )
    parser.add_argument(
        "--apply", action="store_true", help="Apply changes (default: dry-run)"
    )
    parser.add_argument(
        "--phases",
        type=str,
        help="JSON file with custom phase definitions (optional)",
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path.cwd(),
        help="Repository root directory",
    )

    args = parser.parse_args()

    repo_root = args.repo_root.resolve()
    mkdocs_path = repo_root / "mkdocs.yml"

    if not mkdocs_path.exists():
        print(f"❌ mkdocs.yml not found at {mkdocs_path}", file=sys.stderr)
        sys.exit(1)

    # Load phase definitions
    phases = DEFAULT_PHASES
    if args.phases:
        with open(args.phases, "r") as f:
            phases = json.load(f)
    else:
        # Try to detect from docs/index.md
        detected = detect_phases_from_index(repo_root / "docs" / "index.md")
        if detected:
            phases = detected

    # Scan lessons
    print(f"📚 Scanning lessons in {repo_root}...")
    lessons = scan_lessons(repo_root)
    print(f"✅ Found {len(lessons)} lessons")

    # Group by phase
    grouped_lessons = group_lessons_by_phase(lessons, phases)
    for phase_id, phase_lessons in sorted(grouped_lessons.items()):
        phase_name = phases[phase_id]["name"]
        print(f"  Phase {phase_id}: {len(phase_lessons)} lessons - {phase_name}")

    # Generate navigation
    new_nav = generate_nav_structure(grouped_lessons, phases)

    # Update mkdocs.yml
    update_mkdocs_yml(mkdocs_path, new_nav, dry_run=not args.apply)

    if not args.apply:
        print("\n💡 Run with --apply to make changes")
    else:
        print("\n🎉 Navigation updated successfully!")


if __name__ == "__main__":
    main()
