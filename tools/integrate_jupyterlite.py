#!/usr/bin/env python3
"""
Integrate JupyterLite into the documentation build.

This script:
1. Collects all notebooks from Day_* directories
2. Builds a JupyterLite distribution
3. Adds launch buttons to lesson pages
4. Configures packages for Pyodide environment

Use ``--build-only`` to skip content updates and just refresh the JupyterLite
assets inside ``site/jupyterlite``.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import List, Optional

ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT / "docs"
LESSONS_DIR = DOCS_DIR / "lessons"
JUPYTERLITE_DIR = ROOT / "site" / "jupyterlite"
JUPYTERLITE_CONFIG = ROOT / "jupyter_lite_config.json"

DAY_DIR_PATTERN = re.compile(r"^Day_(\d+)")


def extract_day_number(day_name: str) -> Optional[int]:
    """Return the numeric portion of a Day_* directory name if present."""

    match = DAY_DIR_PATTERN.match(day_name)
    if match:
        return int(match.group(1))
    return None


def list_day_directories() -> List[Path]:
    """Return a naturally sorted list of Day_* directories."""

    day_dirs = [path for path in ROOT.glob("Day_*") if path.is_dir()]

    def sort_key(path: Path) -> tuple[int, str]:
        number = extract_day_number(path.name)
        # Place numbered folders first by their integer value; fall back to name.
        return (number if number is not None else sys.maxsize, path.name)

    return sorted(day_dirs, key=sort_key)


def update_jupyterlite_manifest(day_dirs: List[Path]) -> List[str]:
    """Ensure the LiteBuildConfig.contents array includes every Day_* folder."""

    if not JUPYTERLITE_CONFIG.exists():
        print(f"ERROR: Missing JupyterLite config at {JUPYTERLITE_CONFIG}")
        sys.exit(1)

    try:
        config_data = json.loads(JUPYTERLITE_CONFIG.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"ERROR: Failed to parse {JUPYTERLITE_CONFIG}: {exc}")
        sys.exit(1)

    lite_config = config_data.setdefault("LiteBuildConfig", {})
    manifest = [f"{day_dir.name}/" for day_dir in day_dirs]
    existing_manifest = lite_config.get("contents", [])

    if existing_manifest != manifest:
        lite_config["contents"] = manifest
        JUPYTERLITE_CONFIG.write_text(
            json.dumps(config_data, indent=2) + "\n", encoding="utf-8"
        )
        print(
            f"✓ Updated LiteBuildConfig.contents with {len(manifest)} Day_* directories"
        )
    else:
        print("✓ LiteBuildConfig.contents is already up-to-date")

    return manifest


def verify_manifest_covers_latest_day(
    manifest: List[str], day_dirs: List[Path]
) -> None:
    """Exit with an error if the manifest omits the latest numbered lesson."""

    if not day_dirs:
        print("WARNING: No Day_* directories found; skipping manifest verification.")
        return

    numbered_dirs = []
    for day_dir in day_dirs:
        number = extract_day_number(day_dir.name)
        if number is not None:
            numbered_dirs.append((number, day_dir))

    if not numbered_dirs:
        print(
            "WARNING: Could not determine numeric Day_* folders; skipping manifest check."
        )
        return

    numbered_dirs.sort(key=lambda item: (item[0], item[1].name))
    highest_number, highest_path = numbered_dirs[-1]
    expected_entry = f"{highest_path.name}/"

    if expected_entry not in manifest:
        print(
            "ERROR: JupyterLite manifest is missing the latest lesson directory "
            f"({expected_entry})."
        )
        sys.exit(1)

    print(
        "✓ Manifest includes latest lesson "
        f"Day_{highest_number:02d} ({expected_entry})"
    )


def find_notebooks() -> List[Path]:
    """Find all Jupyter notebooks in Day_* directories."""
    notebooks = []
    for day_dir in sorted(ROOT.glob("Day_*")):
        if not day_dir.is_dir():
            continue
        for notebook in day_dir.glob("*.ipynb"):
            # Skip checkpoint files
            if ".ipynb_checkpoints" in str(notebook):
                continue
            notebooks.append(notebook)
    return notebooks


def ensure_jupyterlite_installed() -> bool:
    """Check if JupyterLite is installed, return True if available."""
    try:
        result = subprocess.run(
            ["jupyter", "lite", "--version"],
            capture_output=True,
            text=True,
            check=False,
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False


def build_jupyterlite(full_build: bool = True) -> None:
    """Build JupyterLite distribution.

    Args:
        full_build: When ``True`` run a full content build (the default).
            When ``False`` only refresh the assets using ``jupyter lite build``
            with the configured defaults.
    """
    if not ensure_jupyterlite_installed():
        print("ERROR: JupyterLite is not installed.")
        print("Install with: pip install jupyterlite-core jupyterlite-pyodide-kernel")
        sys.exit(1)

    if full_build:
        print("Building JupyterLite with full content refresh...")
    else:
        print("Building JupyterLite assets only (no lesson updates)...")

    # Clean previous build
    if JUPYTERLITE_DIR.exists():
        shutil.rmtree(JUPYTERLITE_DIR)

    # Build JupyterLite with all Day_* directories as content
    cmd = [
        "jupyter",
        "lite",
        "build",
        "--output-dir",
        str(JUPYTERLITE_DIR),
    ]

    if full_build:
        cmd.extend(["--contents", str(ROOT)])

    try:
        subprocess.run(cmd, check=True, cwd=ROOT)
        print(f"✓ JupyterLite built successfully at {JUPYTERLITE_DIR}")
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Failed to build JupyterLite: {e}")
        sys.exit(1)


def add_jupyterlite_buttons_to_lessons() -> None:
    """Add JupyterLite launch buttons to lesson pages."""
    if not LESSONS_DIR.exists():
        print(f"WARNING: Lessons directory not found: {LESSONS_DIR}")
        return

    notebooks = find_notebooks()
    notebook_map = {}

    # Create mapping of lesson pages to notebooks
    for notebook in notebooks:
        day_dir = notebook.parent
        lesson_slug = day_dir.name.lower().replace("_", "-")
        if lesson_slug not in notebook_map:
            notebook_map[lesson_slug] = []
        notebook_map[lesson_slug].append(notebook)

    # Update lesson pages
    updated_count = 0
    for lesson_file in LESSONS_DIR.glob("day-*.md"):
        lesson_slug = lesson_file.stem

        if lesson_slug not in notebook_map:
            continue

        content = lesson_file.read_text(encoding="utf-8")

        # Check if JupyterLite section already exists
        if "## Interactive Notebooks" in content or "🚀 Launch" in content:
            continue

        # Build JupyterLite section
        notebooks_for_lesson = notebook_map[lesson_slug]
        notebook_links = []

        for notebook in notebooks_for_lesson:
            relative_path = notebook.relative_to(ROOT).as_posix()
            notebook_name = notebook.stem
            jupyterlite_url = f"../../jupyterlite/lab?path={relative_path}"

            notebook_links.append(
                f"- [🚀 Launch {notebook_name} in JupyterLite]({jupyterlite_url})"
                "{ .md-button .md-button--primary }"
            )

        if not notebook_links:
            continue

        # Add JupyterLite section before "Additional Materials" or at the end
        jupyterlite_section = (
            "\n\n## Interactive Notebooks\n\n"
            "Run this lesson's code interactively in your browser:\n\n"
            + "\n".join(notebook_links)
            + "\n\n"
            '!!! tip "About JupyterLite"\n'
            "    JupyterLite runs entirely in your browser using WebAssembly. "
            "No installation or server required! "
            "Note: First launch may take a moment to load.\n"
        )

        # Insert before "Additional Materials" if it exists
        if "## Additional Materials" in content:
            content = content.replace(
                "## Additional Materials",
                jupyterlite_section + "## Additional Materials",
            )
        else:
            # Add at the end
            content += jupyterlite_section

        lesson_file.write_text(content, encoding="utf-8")
        updated_count += 1

    print(f"✓ Added JupyterLite buttons to {updated_count} lesson pages")


def add_binder_badges() -> None:
    """Add Binder badges to lesson pages."""
    repo_slug = "saint2706/Coding-For-MBA"
    notebooks = find_notebooks()
    notebook_map = {}

    # Create mapping
    for notebook in notebooks:
        day_dir = notebook.parent
        lesson_slug = day_dir.name.lower().replace("_", "-")
        if lesson_slug not in notebook_map:
            notebook_map[lesson_slug] = []
        notebook_map[lesson_slug].append(notebook)

    updated_count = 0
    for lesson_file in LESSONS_DIR.glob("day-*.md"):
        lesson_slug = lesson_file.stem

        if lesson_slug not in notebook_map:
            continue

        content = lesson_file.read_text(encoding="utf-8")

        # Check if Binder section already exists
        if "mybinder.org" in content:
            continue

        # Build Binder section
        notebooks_for_lesson = notebook_map[lesson_slug]
        binder_badges = []

        for notebook in notebooks_for_lesson:
            relative_path = notebook.relative_to(ROOT).as_posix()
            binder_url = (
                f"https://mybinder.org/v2/gh/{repo_slug}/main?filepath={relative_path}"
            )
            badge_url = "https://mybinder.org/badge_logo.svg"
            notebook_name = notebook.stem

            binder_badges.append(
                f"    [![Launch {notebook_name} in Binder]({badge_url})]({binder_url})"
            )

        if not binder_badges:
            continue

        # Add Binder section after JupyterLite if it exists, otherwise before Additional Materials
        binder_section = (
            "\n\n### Or Launch in Cloud\n\n"
            "Run on Binder (cloud-based Jupyter environment):\n\n"
            + "\n".join(binder_badges)
            + "\n"
        )

        # Insert appropriately
        if "## Interactive Notebooks" in content:
            # Add after the JupyterLite tip
            content = content.replace(
                "    Note: First launch may take a moment to load.\n",
                "    Note: First launch may take a moment to load.\n" + binder_section,
            )
        elif "## Additional Materials" in content:
            content = content.replace(
                "## Additional Materials", binder_section + "\n## Additional Materials"
            )
        else:
            content += binder_section

        lesson_file.write_text(content, encoding="utf-8")
        updated_count += 1

    print(f"✓ Added Binder badges to {updated_count} lesson pages")


def create_jupyterlite_index() -> None:
    """Create a landing page for JupyterLite."""
    index_path = DOCS_DIR / "jupyterlite-guide.md"

    content = """# JupyterLite Interactive Lab

Welcome to the interactive coding environment for Coding for MBA!

## What is JupyterLite?

JupyterLite is a full-featured Jupyter environment that runs **entirely in your browser** using WebAssembly.
No installation required, no server needed - everything runs on your computer!

## Features

✅ **Full Python Support**: Run Python code with NumPy, Pandas, Matplotlib, and more
✅ **No Setup**: Works immediately in any modern browser
✅ **Private**: All code runs locally - nothing is sent to a server
✅ **Persistent**: Your work is saved in your browser
✅ **Fast**: After initial load, everything is instant

## Getting Started

1. **Click any "Launch in JupyterLite" button** on a lesson page
2. **Wait for the environment to load** (first time takes ~30 seconds)
3. **Start coding!** All lesson notebooks are pre-loaded

## Tips

!!! tip "First Launch"
    The first time you launch JupyterLite, it needs to download the Python runtime (~50MB).
    Be patient! Subsequent launches will be much faster.

!!! note "Browser Support"
    JupyterLite requires a modern browser:

    - ✅ Chrome/Edge 90+
    - ✅ Firefox 88+
    - ✅ Safari 14+
    - ❌ Internet Explorer (not supported)

!!! warning "Limitations"
    Some features have limitations in the browser environment:

    - File system operations may not work
    - Some packages may not be available
    - Network requests may be restricted

    For full functionality, use the Binder option or run locally.

## Alternative: Binder

If JupyterLite doesn't work for you, try Binder:

[![Launch Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main)

Binder provides a cloud-based Jupyter environment with full Python support.

## Need Help?

- [JupyterLite Documentation](https://jupyterlite.readthedocs.io/)
- [Report an Issue](https://github.com/saint2706/Coding-For-MBA/issues)

---

[🚀 Launch JupyterLite Now](../jupyterlite/lab){ .md-button .md-button--primary }
"""

    index_path.write_text(content, encoding="utf-8")
    print(f"✓ Created JupyterLite guide at {index_path}")


def parse_args(argv: List[str] | None = None) -> argparse.Namespace:
    """Parse command-line arguments for the integration tool."""

    parser = argparse.ArgumentParser(
        description="Integrate JupyterLite content and assets into the docs site."
    )
    parser.add_argument(
        "--build-only",
        action="store_true",
        help="Only build the JupyterLite assets and skip documentation updates.",
    )

    return parser.parse_args(argv)


def main(argv: List[str] | None = None) -> None:
    """Main integration workflow."""
    args = parse_args(argv)

    print("=" * 60)
    print("JupyterLite Integration Tool")
    print("=" * 60)

    day_dirs = list_day_directories()
    manifest = update_jupyterlite_manifest(day_dirs)
    verify_manifest_covers_latest_day(manifest, day_dirs)

    if args.build_only:
        print("\n[1/1] Building JupyterLite distribution (assets only)...")
        build_jupyterlite(full_build=False)
        print("\n" + "=" * 60)
        print("✓ JupyterLite asset build complete!")
        print("=" * 60)
        return

    # Step 1: Build JupyterLite
    print("\n[1/4] Building JupyterLite distribution...")
    build_jupyterlite()

    # Step 2: Add launch buttons
    print("\n[2/4] Adding JupyterLite launch buttons to lessons...")
    add_jupyterlite_buttons_to_lessons()

    # Step 3: Add Binder badges
    print("\n[3/4] Adding Binder badges...")
    add_binder_badges()

    # Step 4: Create guide
    print("\n[4/4] Creating JupyterLite guide...")
    create_jupyterlite_index()

    print("\n" + "=" * 60)
    print("✓ JupyterLite integration complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Review the updated lesson pages")
    print("2. Test JupyterLite functionality")
    print("3. Deploy to GitHub Pages")


if __name__ == "__main__":
    main(sys.argv[1:])
