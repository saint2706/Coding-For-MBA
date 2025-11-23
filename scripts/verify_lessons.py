#!/usr/bin/env python3
"""
Verify lessons script - Auto-detect Day folders, extract titles, and generate lesson lists.

This script:
1. Finds all Day_XX folders matching pattern Day_\\d{2,3}_*
2. Parses numeric day from folder names and sorts ascending
3. Extracts first markdown heading from each README.md as lesson title
4. Generates complete lesson list in Markdown format
5. Reports missing day numbers and duplicates
6. Updates landing page files with auto-generated content
"""

import argparse
import re
from pathlib import Path
from typing import Dict, List, Optional


class LessonInfo:
    """Represents information about a single lesson."""

    def __init__(self, day_num: int, folder_name: str, title: str, readme_path: Path):
        self.day_num = day_num
        self.folder_name = folder_name
        self.title = title
        self.readme_path = readme_path

    def __repr__(self):
        return f"LessonInfo(day={self.day_num}, folder={self.folder_name}, title={self.title[:30]}...)"


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
        return readme_path.parent.name  # Fallback to folder name

    try:
        with open(readme_path, "r", encoding="utf-8") as f:
            for line in f:
                # Match # or ## heading
                match = re.match(r"^#{1,2}\s+(.+)$", line.strip())
                if match:
                    title = match.group(1).strip()
                    # Remove emoji and clean up
                    title = re.sub(r"[📘📊🌐🎉]", "", title).strip()
                    return title
    except Exception as e:
        print(f"Warning: Could not read {readme_path}: {e}")

    return readme_path.parent.name  # Fallback to folder name


def collect_lessons(repo_root: Path) -> List[LessonInfo]:
    """Collect all lesson information from Day folders."""
    day_folders = find_day_folders(repo_root)
    lessons = []

    for folder in day_folders:
        day_num = extract_day_number(folder.name)
        if day_num is None:
            print(f"Warning: Could not extract day number from {folder.name}")
            continue

        readme_path = folder / "README.md"
        if not readme_path.exists():
            print(f"Warning: No README.md found in {folder.name}")
            title = folder.name
        else:
            title = extract_title_from_readme(readme_path)

        lessons.append(LessonInfo(day_num, folder.name, title, readme_path))

    # Sort by day number
    lessons.sort(key=lambda x: x.day_num)

    return lessons


def check_for_gaps(lessons: List[LessonInfo]) -> List[int]:
    """Check for missing day numbers in sequence."""
    if not lessons:
        return []

    expected = set(range(1, lessons[-1].day_num + 1))
    actual = set(lesson.day_num for lesson in lessons)
    missing = sorted(expected - actual)

    return missing


def check_for_duplicates(lessons: List[LessonInfo]) -> List[int]:
    """Check for duplicate day numbers."""
    day_counts = {}
    for lesson in lessons:
        day_counts[lesson.day_num] = day_counts.get(lesson.day_num, 0) + 1

    duplicates = [day for day, count in day_counts.items() if count > 1]
    return sorted(duplicates)


def generate_lesson_list_markdown(lessons: List[LessonInfo]) -> str:
    """Generate Markdown list of all lessons."""
    lines = []
    lines.append("<!-- AUTO_ALL_LESSONS_START -->")
    lines.append("")

    for lesson in lessons:
        # Create relative link to lesson folder
        link = f"./{lesson.folder_name}/README.md"
        lines.append(f"- [Day {lesson.day_num:02d} – {lesson.title}]({link})")

    lines.append("")
    lines.append("<!-- AUTO_ALL_LESSONS_END -->")

    return "\n".join(lines) + "\n"


def generate_lesson_table_markdown(lessons: List[LessonInfo]) -> str:
    """Generate Markdown table of all lessons (for docs site)."""
    lines = []
    lines.append("<!-- AUTO_ALL_LESSONS_START -->")
    lines.append("")
    lines.append("| Day | Lesson |")
    lines.append("| --- | --- |")

    for lesson in lessons:
        # For docs site, use docs/lessons/ path
        slug = lesson.folder_name.lower().replace("_", "-")
        link = f"./lessons/{slug}.md"
        lines.append(f"| Day {lesson.day_num:02d} | [📘 {lesson.title}]({link}) |")

    lines.append("")
    lines.append("<!-- AUTO_ALL_LESSONS_END -->")

    return "\n".join(lines) + "\n"


def parse_interactive_lessons(index_path: Path) -> List[Dict[str, str]]:
    """Parse docs/lessons/index.md and extract lesson metadata from cards."""

    if not index_path.exists():
        print(f"Warning: Interactive index not found: {index_path}")
        return []

    card_pattern = re.compile(
        r'<div class="lesson-card"[^>]*data-day="(?P<day>\d+)"[^>]*>.*?<a href="(?P<href>[^"]+)"[^>]*>',
        re.DOTALL,
    )

    lessons = []

    try:
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()

        for match in card_pattern.finditer(content):
            day = match.group("day")
            href = match.group("href")
            lessons.append({"day": int(day), "href": href})

    except Exception as exc:
        print(f"Warning: Could not parse {index_path}: {exc}")
        return []

    return lessons


def generate_docs_index_table(
    lessons: List[LessonInfo],
    interactive_cards: List[Dict[str, str]],
) -> str:
    """Generate the table inserted into docs/lessons/_index.md."""

    lesson_by_day = {lesson.day_num: lesson for lesson in lessons}

    lines: List[str] = []
    lines.append("| Day | Lesson |")
    lines.append("| --- | --- |")

    for card in sorted(interactive_cards, key=lambda entry: entry["day"]):
        day = card["day"]
        lesson = lesson_by_day.get(day)
        if lesson is None:
            raise ValueError(f"Interactive index references missing day: {day}")

        github_url = (
            "https://github.com/saint2706/Coding-For-MBA/blob/main/"
            f"{lesson.folder_name}/README.md"
        )
        lines.append(
            f"| Day {lesson.day_num:02d} | [📘 {lesson.title}]({github_url}) |"
        )

    return "\n".join(lines)


def save_generated_content(
    output_dir: Path, lessons: List[LessonInfo], total_lessons: int
):
    """Save generated content to files."""
    output_dir.mkdir(exist_ok=True)

    # Save lesson list
    list_content = generate_lesson_list_markdown(lessons)
    with open(output_dir / "all_lessons.md", "w", encoding="utf-8") as f:
        f.write(list_content)

    # Save lesson table for docs
    table_content = generate_lesson_table_markdown(lessons)
    with open(output_dir / "all_lessons_table.md", "w", encoding="utf-8") as f:
        f.write(table_content)

    # Save metadata
    with open(output_dir / "lesson_count.txt", "w", encoding="utf-8") as f:
        f.write(str(total_lessons))


def update_file_with_placeholder(
    file_path: Path,
    placeholder_start: str,
    placeholder_end: str,
    new_content: str,
    dry_run: bool = False,
) -> bool:
    """Update a file by replacing content between placeholder markers."""
    if not file_path.exists():
        print(f"Warning: File not found: {file_path}")
        return False

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Check if placeholders exist
        if placeholder_start not in content or placeholder_end not in content:
            print(f"Warning: Placeholders not found in {file_path}")
            return False

        # Replace content between placeholders
        pattern = re.escape(placeholder_start) + r".*?" + re.escape(placeholder_end)
        replacement = (
            placeholder_start + "\n" + new_content.strip() + "\n" + placeholder_end
        )
        new_file_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

        if dry_run:
            print(f"[DRY RUN] Would update {file_path}")
            return True

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_file_content)

        print(f"✓ Updated {file_path}")
        return True

    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False


def update_landing_pages(
    repo_root: Path,
    lessons: List[LessonInfo],
    total_lessons: int,
    interactive_cards: List[Dict[str, str]],
    dry_run: bool = False,
):
    """Update landing page files with generated content."""
    # Update README.md with lesson list
    readme_path = repo_root / "README.md"
    lesson_list = generate_lesson_list_markdown(lessons)
    # Extract just the content without markers for README
    list_lines = [
        line for line in lesson_list.split("\n") if not line.startswith("<!--")
    ]
    clean_list = "\n".join(list_lines).strip()

    # Note: We'll look for the markers, but if not found, just print warning
    if readme_path.exists():
        update_file_with_placeholder(
            readme_path,
            "<!-- AUTO_ALL_LESSONS_START -->",
            "<!-- AUTO_ALL_LESSONS_END -->",
            clean_list,
            dry_run,
        )

    # Update docs/lessons/_index.md with table derived from interactive cards
    docs_index_path = repo_root / "docs" / "lessons" / "_index.md"
    if docs_index_path.exists() and interactive_cards:
        table = generate_docs_index_table(lessons, interactive_cards)
        update_file_with_placeholder(
            docs_index_path,
            "<!-- AUTO_LESSON_TABLE_START -->",
            "<!-- AUTO_LESSON_TABLE_END -->",
            table,
            dry_run,
        )


def replace_84_day_references(
    repo_root: Path, total_lessons: int, dry_run: bool = False
):
    """Replace occurrences of '84-day' with actual lesson count in markdown files."""
    md_files = [
        repo_root / "docs" / "index.md",
        repo_root / "docs" / "cheatsheets" / "index.md",
        repo_root / "docs" / "lessons" / "index.md",
    ]

    pattern = re.compile(r"\b84[-\s]day(s)?\b", re.IGNORECASE)
    replacement = f"{total_lessons}-day"

    replacements_made = 0

    for file_path in md_files:
        if not file_path.exists():
            continue

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            new_content, count = pattern.subn(replacement, content)

            if count > 0:
                if dry_run:
                    print(
                        f"[DRY RUN] Would replace {count} occurrence(s) in {file_path}"
                    )
                else:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(
                        f"✓ Replaced {count} occurrence(s) of '84-day' in {file_path}"
                    )

                replacements_made += count

        except Exception as e:
            print(f"Error processing {file_path}: {e}")

    return replacements_made


def main():
    parser = argparse.ArgumentParser(
        description="Verify lessons and generate lesson lists"
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path("."),
        help="Repository root directory (default: current directory)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("./generated"),
        help="Output directory for generated files (default: ./generated)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without making changes",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply changes to files (update landing pages)",
    )

    args = parser.parse_args()

    repo_root = args.repo_root.resolve()
    output_dir = args.output_dir

    print("=" * 70)
    print("LESSON VERIFICATION AND GENERATION")
    print("=" * 70)
    print(f"Repository root: {repo_root}")
    print(f"Output directory: {output_dir}")
    print()

    # Collect lessons
    print("Scanning for Day_XX folders...")
    lessons = collect_lessons(repo_root)
    total_lessons = len(lessons)

    print(f"✓ Found {total_lessons} lesson folders")
    print()

    # Check for issues
    missing = check_for_gaps(lessons)
    duplicates = check_for_duplicates(lessons)

    has_errors = False

    if missing:
        print(f"⚠ Missing day numbers: {missing}")
        has_errors = True
    else:
        print("✓ No missing day numbers")

    if duplicates:
        print(f"⚠ Duplicate day numbers: {duplicates}")
        has_errors = True
    else:
        print("✓ No duplicate day numbers")

    print()

    # Show lesson range
    if lessons:
        print(
            f"Lesson range: Day_{lessons[0].day_num:02d} to Day_{lessons[-1].day_num:02d}"
        )
        print()

    # Save generated content
    print(f"Generating lesson lists in {output_dir}/...")
    save_generated_content(output_dir, lessons, total_lessons)
    print(f"✓ Generated {output_dir}/all_lessons.md ({total_lessons} entries)")
    print(f"✓ Generated {output_dir}/all_lessons_table.md")
    print(f"✓ Generated {output_dir}/lesson_count.txt")
    print()

    # Parse interactive lessons index
    interactive_index_path = repo_root / "docs" / "lessons" / "index.md"
    interactive_cards = parse_interactive_lessons(interactive_index_path)

    if interactive_cards:
        print(
            f"✓ Parsed {len(interactive_cards)} lesson cards from {interactive_index_path.relative_to(repo_root)}"
        )
        interactive_days = sorted(card["day"] for card in interactive_cards)
        lesson_days = sorted(lesson.day_num for lesson in lessons)
        if interactive_days != lesson_days:
            print("⚠ Interactive lesson cards do not match lesson folders")
            missing_from_cards = sorted(set(lesson_days) - set(interactive_days))
            extra_in_cards = sorted(set(interactive_days) - set(lesson_days))
            if missing_from_cards:
                print(f"   Missing from cards: {missing_from_cards}")
            if extra_in_cards:
                print(f"   Extra in cards: {extra_in_cards}")
            has_errors = True
    else:
        print("⚠ Could not parse interactive lessons index; skipping sync checks")
        has_errors = True

    # Update files if --apply flag is set
    if args.apply:
        print("Updating landing pages...")
        update_landing_pages(
            repo_root, lessons, total_lessons, interactive_cards, args.dry_run
        )
        print()

        print("Replacing '84-day' references...")
        count = replace_84_day_references(repo_root, total_lessons, args.dry_run)
        print(f"✓ Replaced {count} total occurrence(s)")
        print()

    # Print summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total lessons: {total_lessons}")
    print(f"Missing days: {len(missing)}")
    print(f"Duplicate days: {len(duplicates)}")
    print(f"Generated files: {output_dir}/")
    if args.apply:
        print("Changes applied to landing pages: YES")
    else:
        print("Changes applied to landing pages: NO (use --apply to update)")
    print("=" * 70)

    return 0 if not has_errors else 1


if __name__ == "__main__":
    exit(main())
