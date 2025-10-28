#!/usr/bin/env python3
"""
Add YAML front-matter tags to lesson README.md files.

Uses rule-based heuristics to derive tags from folder names and titles.
Does not overwrite existing tags.
"""

from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path
from typing import Set

import yaml

# Tag mapping rules based on keywords
TAG_RULES = {
    "Python": ["python", "basics", "introduction", "variables", "functions", "classes"],
    "Data": ["data", "pandas", "numpy", "cleaning", "preparation"],
    "Visualization": ["visualization", "plotting", "charts", "dashboard"],
    "SQL": ["sql", "database", "ddl", "dml", "dql", "queries", "joins"],
    "ML": ["machine", "learning", "regression", "classification", "neural", "model"],
    "BI": ["bi", "business", "intelligence", "analytics", "metrics"],
    "MLOps": ["mlops", "deployment", "serving", "monitoring", "pipelines"],
    "Web": ["web", "api", "flask", "scraping", "http"],
    "Advanced": ["advanced", "optimization", "tuning", "performance"],
    "Statistics": ["statistics", "statistical", "probability"],
    "NLP": ["nlp", "natural", "language", "text", "transformers"],
    "Database": ["database", "mongodb", "mysql", "postgresql", "nosql"],
}


def extract_day_number(folder_name: str) -> int | None:
    """Extract day number from folder name."""
    match = re.match(r"Day_(\d{2,3})_", folder_name)
    return int(match.group(1)) if match else None


def detect_tags(folder_name: str, title: str) -> Set[str]:
    """Detect tags based on folder name and title."""
    text = (folder_name + " " + title).lower()
    detected_tags = set()

    for tag, keywords in TAG_RULES.items():
        for keyword in keywords:
            if keyword in text:
                detected_tags.add(tag)
                break

    # Add phase-specific tags based on day number
    day = extract_day_number(folder_name)
    if day:
        if 1 <= day <= 20:
            detected_tags.add("Python")
            detected_tags.add("Basics")
        elif 21 <= day <= 39:
            detected_tags.add("Data")
        elif 40 <= day <= 54:
            detected_tags.add("ML")
        elif 55 <= day <= 67:
            detected_tags.add("Advanced")
        elif 68 <= day <= 84:
            detected_tags.add("BI")
        elif 91 <= day <= 108:
            detected_tags.add("SQL")

    # Ensure at least one tag
    if not detected_tags:
        detected_tags.add("Python")

    return detected_tags


def extract_existing_front_matter(content: str) -> tuple[dict, str]:
    """
    Extract existing YAML front matter and remaining content.
    Returns (front_matter_dict, content_without_front_matter).
    """
    lines = content.split("\n")

    if not lines or lines[0].strip() != "---":
        return {}, content

    # Find closing ---
    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break

    if end_idx is None:
        return {}, content

    # Parse YAML
    try:
        front_matter_text = "\n".join(lines[1:end_idx])
        front_matter = yaml.safe_load(front_matter_text) or {}
    except Exception:
        return {}, content

    # Return parsed front matter and remaining content
    remaining_content = "\n".join(lines[end_idx + 1 :])
    return front_matter, remaining_content


def add_front_matter_to_readme(
    readme_path: Path, folder_name: str, dry_run: bool = False
) -> bool:
    """Add or update front matter tags in a README.md file."""
    try:
        with open(readme_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"    ⚠️  Failed to read {readme_path}: {e}")
        return False

    # Extract existing front matter
    front_matter, body = extract_existing_front_matter(content)

    # Check if tags already exist
    if "tags" in front_matter and front_matter["tags"]:
        print("    ⏭️  Skipped (has existing tags)")
        return False

    # Extract title from content
    title_match = re.search(r"^#+ (.+)$", body, re.MULTILINE)
    title = title_match.group(1) if title_match else folder_name

    # Detect tags
    tags = sorted(detect_tags(folder_name, title))

    # Update front matter
    if "title" not in front_matter:
        # Clean up title
        clean_title = re.sub(r"^#+\s*", "", title)
        clean_title = re.sub(r"[📘🌐📊🎉]", "", clean_title).strip()
        front_matter["title"] = clean_title

    front_matter["tags"] = tags

    if dry_run:
        print(f"    🔍 Would add tags: {tags}")
        return True

    # Backup original
    backup_path = readme_path.with_suffix(".md.bak")
    shutil.copy2(readme_path, backup_path)

    # Create new content
    new_content = "---\n"
    new_content += yaml.dump(front_matter, default_flow_style=False, sort_keys=False)
    new_content += "---\n"
    new_content += body

    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"    ✅ Added tags: {tags}")
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Add YAML front-matter tags to lesson READMEs"
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

    print("🏷️  Adding tags to lesson READMEs...")

    added = 0
    skipped = 0

    for folder in sorted(repo_root.iterdir()):
        if not folder.is_dir() or not folder.name.startswith("Day_"):
            continue

        day_num = extract_day_number(folder.name)
        if day_num is None:
            continue

        readme_path = folder / "README.md"
        if not readme_path.exists():
            continue

        print(f"  {folder.name}:")

        if add_front_matter_to_readme(readme_path, folder.name, dry_run=not args.apply):
            added += 1
        else:
            skipped += 1

    print("\n📊 Summary:")
    print(f"  Added/Updated: {added}")
    print(f"  Skipped: {skipped}")

    if not args.apply:
        print("\n💡 Run with --apply to make changes")
    else:
        print("\n🎉 Tags added successfully!")
        print("  Backups created with .bak extension")


if __name__ == "__main__":
    main()
