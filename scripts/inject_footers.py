#!/usr/bin/env python3
"""
Inject footers script - Add prev/next navigation links to lesson READMEs.

This script:
1. Finds all Day_XX folders
2. For each lesson README, computes previous and next lesson links
3. Creates or updates a standardized footer with navigation
4. Uses idempotent markers to avoid duplicating footers
"""

import os
import re
import argparse
from pathlib import Path
from typing import List, Dict, Optional


# Footer markers for idempotent updates
FOOTER_START = "<!-- LESSON_FOOTER_START -->"
FOOTER_END = "<!-- LESSON_FOOTER_END -->"


class LessonInfo:
    """Represents information about a single lesson."""

    def __init__(self, day_num: int, folder_name: str, title: str, readme_path: Path):
        self.day_num = day_num
        self.folder_name = folder_name
        self.title = title
        self.readme_path = readme_path

    def __repr__(self):
        return f"LessonInfo(day={self.day_num}, folder={self.folder_name})"


def find_day_folders(repo_root: Path) -> List[Path]:
    """Find all Day_XX folders in the repository root."""
    day_folders = []
    pattern = re.compile(r"^Day_(\d{2,3})_")

    for item in repo_root.iterdir():
        if item.is_dir() and pattern.match(item.name):
            day_folders.append(item)

    return day_folders


def extract_day_number(folder_name: str) -> Optional[int]:
    """Extract numeric day from folder name like Day_05_Topic."""
    match = re.search(r"Day_(\d{2,3})_", folder_name)
    if match:
        return int(match.group(1))
    return None


def extract_title_from_readme(readme_path: Path) -> str:
    """Extract the first markdown heading from README.md."""
    if not readme_path.exists():
        return readme_path.parent.name

    try:
        with open(readme_path, "r", encoding="utf-8") as f:
            for line in f:
                match = re.match(r"^#{1,2}\s+(.+)$", line.strip())
                if match:
                    title = match.group(1).strip()
                    # Remove emoji and clean up
                    title = re.sub(r"[📘📊🌐🎉]", "", title).strip()
                    return title
    except Exception as e:
        print(f"Warning: Could not read {readme_path}: {e}")

    return readme_path.parent.name


def collect_lessons(repo_root: Path) -> List[LessonInfo]:
    """Collect all lesson information from Day folders."""
    day_folders = find_day_folders(repo_root)
    lessons = []

    for folder in day_folders:
        day_num = extract_day_number(folder.name)
        if day_num is None:
            continue

        readme_path = folder / "README.md"
        if not readme_path.exists():
            print(f"Warning: No README.md found in {folder.name}, skipping")
            continue

        title = extract_title_from_readme(readme_path)
        lessons.append(LessonInfo(day_num, folder.name, title, readme_path))

    # Sort by day number
    lessons.sort(key=lambda x: x.day_num)

    return lessons


def create_footer(
    lesson: LessonInfo,
    prev_lesson: Optional[LessonInfo],
    next_lesson: Optional[LessonInfo],
    total_lessons: int,
) -> str:
    """Create a navigation footer for a lesson."""
    lines = []
    lines.append("")
    lines.append(FOOTER_START)
    lines.append("")
    lines.append("---")
    lines.append("")

    # Navigation links
    nav_parts = []

    if prev_lesson:
        prev_link = f"../{prev_lesson.folder_name}/README.md"
        prev_text = f"Day {prev_lesson.day_num:02d} – {prev_lesson.title}"
        nav_parts.append(f"**Previous:** [{prev_text}]({prev_link})")
    else:
        nav_parts.append("**Previous:** _None (First Lesson)_")

    if next_lesson:
        next_link = f"../{next_lesson.folder_name}/README.md"
        next_text = f"Day {next_lesson.day_num:02d} – {next_lesson.title}"
        nav_parts.append(f"**Next:** [{next_text}]({next_link})")
    else:
        nav_parts.append("**Next:** _None (Last Lesson)_")

    lines.append(" • ".join(nav_parts))
    lines.append("")
    lines.append(f"_You are on lesson {lesson.day_num} of {total_lessons}._")
    lines.append("")
    lines.append(FOOTER_END)

    return "\n".join(lines)


def has_footer(content: str) -> bool:
    """Check if content already has a footer."""
    return FOOTER_START in content and FOOTER_END in content


def inject_or_update_footer(
    readme_path: Path, footer: str, dry_run: bool = False
) -> str:
    """Inject or update footer in a README file. Returns status: 'appended', 'replaced', 'skipped', or 'error'."""
    try:
        with open(readme_path, "r", encoding="utf-8") as f:
            content = f.read()

        if has_footer(content):
            # Replace existing footer
            pattern = re.escape(FOOTER_START) + r".*?" + re.escape(FOOTER_END)
            new_content = re.sub(pattern, footer.strip(), content, flags=re.DOTALL)
            status = "replaced"
        else:
            # Append new footer
            # Ensure there's a newline before footer
            if not content.endswith("\n"):
                new_content = content + "\n" + footer
            else:
                new_content = content + footer
            status = "appended"

        if dry_run:
            return f"{status}_dryrun"

        with open(readme_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        return status

    except Exception as e:
        print(f"Error processing {readme_path}: {e}")
        return "error"


def inject_all_footers(
    lessons: List[LessonInfo], total_lessons: int, dry_run: bool = False
):
    """Inject footers into all lesson READMEs."""
    stats = {"appended": 0, "replaced": 0, "skipped": 0, "error": 0}

    for i, lesson in enumerate(lessons):
        prev_lesson = lessons[i - 1] if i > 0 else None
        next_lesson = lessons[i + 1] if i < len(lessons) - 1 else None

        footer = create_footer(lesson, prev_lesson, next_lesson, total_lessons)
        status = inject_or_update_footer(lesson.readme_path, footer, dry_run)

        # Count stats (handle dry_run suffix)
        base_status = status.replace("_dryrun", "")
        if base_status in stats:
            stats[base_status] += 1

        # Print progress for verbose mode
        if status.startswith("replaced"):
            symbol = "↻" if not dry_run else "↻[DRY]"
            print(f"{symbol} {lesson.folder_name}/README.md (replaced footer)")
        elif status.startswith("appended"):
            symbol = "✓" if not dry_run else "✓[DRY]"
            print(f"{symbol} {lesson.folder_name}/README.md (appended footer)")
        elif status == "error":
            print(f"✗ {lesson.folder_name}/README.md (error)")

    return stats


def main():
    parser = argparse.ArgumentParser(
        description="Inject prev/next footers into lesson READMEs"
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path("."),
        help="Repository root directory (default: current directory)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without making changes",
    )

    args = parser.parse_args()

    repo_root = args.repo_root.resolve()

    print("=" * 70)
    print("INJECT LESSON FOOTERS")
    print("=" * 70)
    print(f"Repository root: {repo_root}")
    print(f"Mode: {'DRY RUN' if args.dry_run else 'APPLY CHANGES'}")
    print()

    # Collect lessons
    print("Scanning for Day_XX folders...")
    lessons = collect_lessons(repo_root)
    total_lessons = len(lessons)

    print(f"✓ Found {total_lessons} lesson folders with README.md")
    print()

    if total_lessons == 0:
        print("No lessons found. Exiting.")
        return 1

    # Inject footers
    print("Injecting/updating footers...")
    print()
    stats = inject_all_footers(lessons, total_lessons, args.dry_run)

    # Print summary
    print()
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total lessons processed: {total_lessons}")
    print(f"Footers appended: {stats['appended']}")
    print(f"Footers replaced: {stats['replaced']}")
    print(f"Errors: {stats['error']}")
    if args.dry_run:
        print()
        print("Note: This was a DRY RUN. No files were modified.")
        print("Run without --dry-run to apply changes.")
    print("=" * 70)

    return 0


if __name__ == "__main__":
    exit(main())
