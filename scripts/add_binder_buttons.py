#!/usr/bin/env python3
"""
Add "Open in Binder" buttons to lesson READMEs that contain Jupyter notebooks.

This script scans lesson directories for .ipynb files and injects a Binder button
into the README.md if one doesn't already exist.

Usage:
    python scripts/add_binder_buttons.py --dry-run  # Preview changes
    python scripts/add_binder_buttons.py --apply    # Apply changes
"""

import argparse
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Tuple


BINDER_BADGE_TEMPLATE = """
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/HEAD?filepath={notebook_path})
"""

REPO_OWNER = "saint2706"
REPO_NAME = "Coding-For-MBA"


def get_repo_root() -> Path:
    """Get the repository root directory."""
    return Path(__file__).parent.parent


def find_lesson_dirs_with_notebooks() -> List[Tuple[Path, List[str]]]:
    """Find lesson directories that contain Jupyter notebooks."""
    repo_root = get_repo_root()
    pattern = re.compile(r"Day_(\d+)_.*")

    results = []
    for item in repo_root.iterdir():
        if item.is_dir() and pattern.match(item.name):
            notebooks = list(item.glob("*.ipynb"))
            if notebooks:
                nb_names = [nb.name for nb in notebooks]
                results.append((item, nb_names))

    results.sort(key=lambda x: int(re.search(r"Day_(\d+)", x[0].name).group(1)))
    return results


def has_binder_button(readme_content: str) -> bool:
    """Check if README already contains a Binder button."""
    return "mybinder.org" in readme_content.lower()


def create_backup(file_path: Path) -> Path:
    """Create a timestamped backup of a file."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = file_path.parent / f"{file_path.name}.bak.{timestamp}"
    backup_path.write_text(file_path.read_text(encoding="utf-8"), encoding="utf-8")
    return backup_path


def inject_binder_button(
    readme_path: Path, notebook_path: str, dry_run: bool = False
) -> bool:
    """Inject Binder button into README.md."""
    content = readme_path.read_text(encoding="utf-8")

    if has_binder_button(content):
        return False  # Already has button

    # Create Binder button markdown
    button = BINDER_BADGE_TEMPLATE.format(notebook_path=notebook_path).strip()

    # Insert after the first heading (usually the title)
    lines = content.split("\n")
    insert_idx = 0

    for i, line in enumerate(lines):
        if line.startswith("# "):
            insert_idx = i + 1
            break

    # Insert button with spacing
    lines.insert(insert_idx, "")
    lines.insert(insert_idx + 1, button)
    lines.insert(insert_idx + 2, "")

    new_content = "\n".join(lines)

    if not dry_run:
        # Create backup
        create_backup(readme_path)
        # Write new content
        readme_path.write_text(new_content, encoding="utf-8")

    return True


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Add Binder buttons to lesson READMEs")
    parser.add_argument(
        "--dry-run", action="store_true", help="Preview changes without modifying files"
    )
    parser.add_argument("--apply", action="store_true", help="Apply changes to files")

    args = parser.parse_args()

    if not args.dry_run and not args.apply:
        parser.print_help()
        print("\n❌ Error: Specify --dry-run or --apply")
        sys.exit(1)

    print("=" * 60)
    print("🔗 Binder Button Injection Tool")
    print("=" * 60)

    if args.dry_run:
        print("\n🔍 DRY RUN MODE - No files will be modified\n")

    lessons_with_notebooks = find_lesson_dirs_with_notebooks()
    print(f"\n📚 Found {len(lessons_with_notebooks)} lessons with notebooks\n")

    modified = 0
    skipped = 0

    for lesson_dir, notebooks in lessons_with_notebooks:
        readme_path = lesson_dir / "README.md"

        if not readme_path.exists():
            print(f"  ⚠️  {lesson_dir.name}: No README.md found")
            continue

        # Use first notebook for button
        notebook_name = notebooks[0]
        notebook_path = f"{lesson_dir.name}/{notebook_name}"

        if inject_binder_button(readme_path, notebook_path, args.dry_run):
            status = "[WOULD ADD]" if args.dry_run else "✅ Added"
            print(f"  {status} Binder button: {lesson_dir.name}")
            modified += 1
        else:
            print(f"  ⏭️  Skipped (already has button): {lesson_dir.name}")
            skipped += 1

    # Summary
    print("\n" + "=" * 60)
    print("📊 Summary")
    print("=" * 60)
    print(f"Modified: {modified}")
    print(f"Skipped: {skipped}")
    print(f"Total: {len(lessons_with_notebooks)}")

    if args.apply and modified > 0:
        print(f"\n💡 Backup files created with .bak.TIMESTAMP extension")
        print(f"💡 Review changes with: git diff")

    print("\n🎉 Done!")


if __name__ == "__main__":
    main()
