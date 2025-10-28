#!/usr/bin/env python3
"""
Generate phase overview pages for the documentation.

Creates docs/phases/phase_X_overview.md files with:
- Phase title and day range
- Short auto-generated intro
- Table of lessons with descriptions
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Dict, List

# Phase configuration
PHASES = {
    1: {
        "range": (1, 20),
        "name": "Phase 1: Python Foundations",
        "intro": "Master Python fundamentals from first principles. Build a solid foundation in syntax, data structures, and control flow essential for business analytics.",
    },
    2: {
        "range": (21, 39),
        "name": "Phase 2: Data Analytics & Workflows",
        "intro": "Learn to manipulate, visualize, and analyze data using industry-standard libraries like NumPy, Pandas, and Matplotlib. Connect to databases and APIs.",
    },
    3: {
        "range": (40, 54),
        "name": "Phase 3: Machine Learning Foundations",
        "intro": "Dive into supervised and unsupervised learning, neural networks, and NLP. Build and evaluate predictive models for business applications.",
    },
    4: {
        "range": (55, 67),
        "name": "Phase 4: Advanced ML & MLOps",
        "intro": "Explore advanced ML techniques including time series forecasting, transformers, and production deployment patterns with MLOps best practices.",
    },
    5: {
        "range": (68, 84),
        "name": "Phase 5: Business Intelligence",
        "intro": "Develop BI expertise from strategy to execution. Learn data visualization, dashboard design, stakeholder communication, and domain analytics.",
    },
    6: {
        "range": (85, 90),
        "name": "Phase 6: BI Advanced & Capstone",
        "intro": "Apply advanced BI concepts in cloud platforms and data governance. Complete a comprehensive capstone project synthesizing your learning.",
    },
    7: {
        "range": (91, 108),
        "name": "Phase 7: SQL & Database Mastery",
        "intro": "Master SQL from DDL/DML fundamentals to advanced features like stored procedures, triggers, CTEs, and performance tuning for production systems.",
    },
}


def extract_day_number(folder_name: str) -> int | None:
    """Extract day number from folder name."""
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


def extract_description_from_readme(readme_path: Path) -> str:
    """Extract first non-header paragraph as description."""
    try:
        with open(readme_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            in_content = False

            for line in lines:
                stripped = line.strip()

                # Skip front matter
                if stripped == "---":
                    in_content = not in_content
                    continue
                if not in_content and stripped.startswith("---"):
                    continue

                # Skip headers and empty lines
                if not stripped or stripped.startswith("#"):
                    continue

                # Found first paragraph
                if len(stripped) > 20:  # Reasonable description length
                    # Clean up and truncate
                    desc = stripped[:150]
                    if len(stripped) > 150:
                        desc += "..."
                    return desc

    except Exception:
        pass

    return "No description provided"


def scan_lessons_for_phase(
    repo_root: Path, phase_id: int, phase_info: Dict
) -> List[Dict]:
    """Scan lessons for a specific phase."""
    start_day, end_day = phase_info["range"]
    lessons = []

    for folder in sorted(repo_root.iterdir()):
        if not folder.is_dir() or not folder.name.startswith("Day_"):
            continue

        day_num = extract_day_number(folder.name)
        if day_num is None or not (start_day <= day_num <= end_day):
            continue

        readme_path = folder / "README.md"
        title = extract_title_from_readme(readme_path)
        description = extract_description_from_readme(readme_path)

        if title is None:
            title = folder.name.replace("_", " ")

        lessons.append(
            {
                "day": day_num,
                "folder": folder.name,
                "title": title,
                "description": description,
            }
        )

    return sorted(lessons, key=lambda x: x["day"])


def generate_phase_overview(
    phase_id: int, phase_info: Dict, lessons: List[Dict]
) -> str:
    """Generate markdown content for a phase overview page."""
    start_day, end_day = phase_info["range"]
    name = phase_info["name"]
    intro = phase_info["intro"]

    content = f"""---
title: "{name}"
---

# {name}

**Days {start_day}–{end_day}** | **{len(lessons)} Lessons**

{intro}

---

## Lessons in This Phase

| Day | Title | Description |
|-----|-------|-------------|
"""

    for lesson in lessons:
        day = lesson["day"]
        title = lesson["title"].replace("|", "\\|")
        desc = lesson["description"].replace("|", "\\|")
        # Create relative link to lesson
        lesson_slug = lesson["folder"].lower().replace("_", "-")
        lesson_link = f"../lessons/{lesson_slug}.md"

        content += f"| {day} | [{title}]({lesson_link}) | {desc} |\n"

    content += """
---

## Navigation

- [← Back to All Phases](overview.md)
- [View All Lessons](../lessons/index.md)
"""

    return content


def main():
    parser = argparse.ArgumentParser(
        description="Generate phase overview pages"
    )
    parser.add_argument(
        "--apply", action="store_true", help="Apply changes (default: dry-run)"
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path.cwd(),
        help="Repository root directory",
    )

    args = parser.parse_args()

    repo_root = args.repo_root.resolve()
    phases_dir = repo_root / "docs" / "phases"

    if not phases_dir.exists():
        print(f"❌ Phases directory not found: {phases_dir}", file=sys.stderr)
        sys.exit(1)

    print(f"📚 Generating phase overviews...")

    for phase_id, phase_info in sorted(PHASES.items()):
        lessons = scan_lessons_for_phase(repo_root, phase_id, phase_info)
        print(f"  Phase {phase_id}: {len(lessons)} lessons")

        if not lessons:
            print(f"    ⚠️  No lessons found for phase {phase_id}")
            continue

        content = generate_phase_overview(phase_id, phase_info, lessons)
        output_path = phases_dir / f"phase_{phase_id}_overview.md"

        if args.apply:
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"    ✅ Created {output_path}")
        else:
            print(f"    🔍 Would create {output_path}")

    if not args.apply:
        print("\n💡 Run with --apply to create files")
    else:
        print("\n🎉 Phase overview pages generated successfully!")


if __name__ == "__main__":
    main()
