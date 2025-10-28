#!/usr/bin/env python3
"""
Generate downloadable PDFs and ZIP bundles of the curriculum.

This script converts lesson markdown files to paginated PDFs using markdown2 and weasyprint.
It generates:
- artifacts/curriculum_full.pdf (all lessons)
- artifacts/curriculum_phase_{n}.pdf (per-phase PDFs)
- artifacts/bundles/phase_{n}.zip (markdown + notebooks per phase)

Usage:
    python scripts/generate_pdfs.py --all          # Generate all PDFs and bundles
    python scripts/generate_pdfs.py --phase 1      # Generate Phase 1 only
    python scripts/generate_pdfs.py --dry-run      # Preview what would be generated
"""

import argparse
import os
import re
import shutil
import sys
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple

import markdown2

# Phase mapping based on curriculum structure
PHASE_MAPPING = {
    1: (1, 20),  # Python foundations
    2: (21, 39),  # Data workflows
    3: (40, 54),  # ML fundamentals
    4: (55, 67),  # Advanced ML & MLOps
    5: (68, 84),  # Business Intelligence
    6: (85, 90),  # Advanced BI & capstone
    7: (91, 108),  # SQL & database mastery
}

PHASE_NAMES = {
    1: "Python Foundations",
    2: "Data Workflows & Analytics",
    3: "Machine Learning Fundamentals",
    4: "Advanced ML & MLOps",
    5: "Business Intelligence",
    6: "Advanced BI & Capstone",
    7: "SQL & Database Mastery",
}


def get_repo_root() -> Path:
    """Get the repository root directory."""
    return Path(__file__).parent.parent


def find_lesson_dirs() -> List[Path]:
    """Find all Day_XX lesson directories."""
    repo_root = get_repo_root()
    pattern = re.compile(r"Day_(\d+)_.*")

    lesson_dirs = []
    for item in repo_root.iterdir():
        if item.is_dir() and pattern.match(item.name):
            lesson_dirs.append(item)

    # Sort by day number
    lesson_dirs.sort(key=lambda d: int(re.search(r"Day_(\d+)", d.name).group(1)))
    return lesson_dirs


def get_phase_for_day(day_num: int) -> int:
    """Get the phase number for a given day."""
    for phase, (start, end) in PHASE_MAPPING.items():
        if start <= day_num <= end:
            return phase
    return 0  # Unknown phase


def get_lessons_for_phase(phase: int) -> List[Path]:
    """Get all lesson directories for a specific phase."""
    all_lessons = find_lesson_dirs()
    start, end = PHASE_MAPPING[phase]

    phase_lessons = []
    for lesson_dir in all_lessons:
        day_num = int(re.search(r"Day_(\d+)", lesson_dir.name).group(1))
        if start <= day_num <= end:
            phase_lessons.append(lesson_dir)

    return phase_lessons


def read_readme(lesson_dir: Path) -> str:
    """Read the README.md from a lesson directory."""
    readme_path = lesson_dir / "README.md"
    if readme_path.exists():
        return readme_path.read_text(encoding="utf-8")
    return f"# {lesson_dir.name}\n\nNo README.md found."


def convert_markdown_to_html(markdown_text: str, title: str = "") -> str:
    """Convert markdown to HTML with basic styling."""
    html_content = markdown2.markdown(
        markdown_text,
        extras=["fenced-code-blocks", "tables", "header-ids", "code-friendly"],
    )

    # Wrap in HTML document with styling
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{title}</title>
    <style>
        @page {{
            size: A4;
            margin: 2cm;
        }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
        }}
        h1 {{
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 0.3em;
            page-break-after: avoid;
        }}
        h2 {{
            color: #34495e;
            border-bottom: 2px solid #95a5a6;
            padding-bottom: 0.2em;
            page-break-after: avoid;
            margin-top: 1.5em;
        }}
        h3 {{
            color: #555;
            page-break-after: avoid;
        }}
        code {{
            background-color: #f4f4f4;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }}
        pre {{
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 1em;
            overflow-x: auto;
            page-break-inside: avoid;
        }}
        pre code {{
            background: none;
            padding: 0;
        }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
            page-break-inside: avoid;
        }}
        th, td {{
            border: 1px solid #ddd;
            padding: 0.5em;
            text-align: left;
        }}
        th {{
            background-color: #f2f2f2;
            font-weight: bold;
        }}
        .lesson-header {{
            background-color: #3498db;
            color: white;
            padding: 1em;
            margin-bottom: 1em;
            border-radius: 5px;
        }}
        .page-break {{
            page-break-after: always;
        }}
    </style>
</head>
<body>
    {html_content}
</body>
</html>
"""
    return html


def generate_pdf_from_html(
    html_content: str, output_path: Path, dry_run: bool = False
) -> Tuple[bool, int]:
    """Generate PDF from HTML content using WeasyPrint."""
    if dry_run:
        print(f"  [DRY RUN] Would generate: {output_path}")
        return True, 0

    try:
        from weasyprint import HTML, CSS
        from weasyprint.text.fonts import FontConfiguration

        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Create PDF
        font_config = FontConfiguration()
        html_obj = HTML(string=html_content)
        html_obj.write_pdf(output_path, font_config=font_config)

        size_kb = output_path.stat().st_size / 1024
        return True, int(size_kb)
    except ImportError:
        print("  ⚠️  WeasyPrint not available. Install with: pip install weasyprint")
        return False, 0
    except Exception as e:
        print(f"  ❌ Error generating PDF: {e}")
        return False, 0


def generate_phase_pdf(phase: int, dry_run: bool = False) -> Tuple[bool, str]:
    """Generate a PDF for a specific phase."""
    print(f"\n📄 Generating Phase {phase} PDF: {PHASE_NAMES[phase]}")

    lessons = get_lessons_for_phase(phase)
    if not lessons:
        print(f"  ⚠️  No lessons found for Phase {phase}")
        return False, "No lessons found"

    print(f"  📚 Found {len(lessons)} lessons")

    # Build combined markdown
    combined_md = f"# Coding for MBA - Phase {phase}\n\n"
    combined_md += f"## {PHASE_NAMES[phase]}\n\n"
    combined_md += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    combined_md += "---\n\n"

    for lesson_dir in lessons:
        readme_content = read_readme(lesson_dir)
        combined_md += f"<div class='page-break'></div>\n\n{readme_content}\n\n"

    # Convert to HTML
    html_content = convert_markdown_to_html(
        combined_md, title=f"Phase {phase} - {PHASE_NAMES[phase]}"
    )

    # Generate PDF
    output_path = get_repo_root() / "artifacts" / f"curriculum_phase_{phase}.pdf"
    success, size = generate_pdf_from_html(html_content, output_path, dry_run)

    if success and not dry_run:
        print(f"  ✅ Generated: {output_path} ({size} KB)")
        return True, str(output_path)
    elif success and dry_run:
        return True, str(output_path)
    else:
        return False, ""


def generate_full_pdf(dry_run: bool = False) -> Tuple[bool, str]:
    """Generate a PDF containing all lessons."""
    print(f"\n📘 Generating Full Curriculum PDF")

    all_lessons = find_lesson_dirs()
    print(f"  📚 Found {len(all_lessons)} total lessons")

    # Build combined markdown with phase sections
    combined_md = "# Coding for MBA - Complete Curriculum\n\n"
    combined_md += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    combined_md += "## All Phases (Days 1-108)\n\n"
    combined_md += "---\n\n"

    current_phase = 0
    for lesson_dir in all_lessons:
        day_num = int(re.search(r"Day_(\d+)", lesson_dir.name).group(1))
        phase = get_phase_for_day(day_num)

        # Add phase header when phase changes
        if phase != current_phase and phase > 0:
            combined_md += f"<div class='page-break'></div>\n\n"
            combined_md += f"# Phase {phase}: {PHASE_NAMES[phase]}\n\n---\n\n"
            current_phase = phase

        readme_content = read_readme(lesson_dir)
        combined_md += f"{readme_content}\n\n<div class='page-break'></div>\n\n"

    # Convert to HTML
    html_content = convert_markdown_to_html(
        combined_md, title="Coding for MBA - Complete Curriculum"
    )

    # Generate PDF
    output_path = get_repo_root() / "artifacts" / "curriculum_full.pdf"
    success, size = generate_pdf_from_html(html_content, output_path, dry_run)

    if success and not dry_run:
        print(f"  ✅ Generated: {output_path} ({size} KB)")
        return True, str(output_path)
    elif success and dry_run:
        return True, str(output_path)
    else:
        return False, ""


def create_phase_bundle(phase: int, dry_run: bool = False) -> Tuple[bool, str]:
    """Create a ZIP bundle for a phase containing markdown and notebooks."""
    print(f"\n📦 Creating Phase {phase} Bundle")

    lessons = get_lessons_for_phase(phase)
    if not lessons:
        print(f"  ⚠️  No lessons found for Phase {phase}")
        return False, ""

    output_path = get_repo_root() / "artifacts" / "bundles" / f"phase_{phase}.zip"

    if dry_run:
        print(f"  [DRY RUN] Would create: {output_path}")
        print(f"  [DRY RUN] Would include {len(lessons)} lessons")
        return True, str(output_path)

    output_path.parent.mkdir(parents=True, exist_ok=True)

    file_count = 0
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for lesson_dir in lessons:
            # Add README.md
            readme = lesson_dir / "README.md"
            if readme.exists():
                arcname = f"phase_{phase}/{lesson_dir.name}/README.md"
                zipf.write(readme, arcname)
                file_count += 1

            # Add all .py files
            for py_file in lesson_dir.glob("*.py"):
                arcname = f"phase_{phase}/{lesson_dir.name}/{py_file.name}"
                zipf.write(py_file, arcname)
                file_count += 1

            # Add all .ipynb files
            for nb_file in lesson_dir.glob("*.ipynb"):
                arcname = f"phase_{phase}/{lesson_dir.name}/{nb_file.name}"
                zipf.write(nb_file, arcname)
                file_count += 1

    size_kb = output_path.stat().st_size / 1024
    print(f"  ✅ Created: {output_path} ({int(size_kb)} KB, {file_count} files)")
    return True, str(output_path)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Generate curriculum PDFs and ZIP bundles"
    )
    parser.add_argument(
        "--all", action="store_true", help="Generate all PDFs and bundles"
    )
    parser.add_argument(
        "--phase",
        type=int,
        choices=list(PHASE_MAPPING.keys()),
        help="Generate PDF and bundle for a specific phase",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview what would be generated without creating files",
    )

    args = parser.parse_args()

    if not args.all and args.phase is None:
        parser.print_help()
        print("\n❌ Error: Specify --all or --phase N")
        sys.exit(1)

    print("=" * 60)
    print("📚 Coding for MBA - PDF & Bundle Generator")
    print("=" * 60)

    if args.dry_run:
        print("\n🔍 DRY RUN MODE - No files will be created\n")

    results = {"pdfs": [], "bundles": [], "errors": []}

    # Generate PDFs and bundles
    if args.all:
        # Full curriculum PDF
        success, path = generate_full_pdf(args.dry_run)
        if success:
            results["pdfs"].append(path)
        else:
            results["errors"].append("Full curriculum PDF")

        # All phase PDFs and bundles
        for phase in PHASE_MAPPING.keys():
            success, path = generate_phase_pdf(phase, args.dry_run)
            if success:
                results["pdfs"].append(path)
            else:
                results["errors"].append(f"Phase {phase} PDF")

            success, path = create_phase_bundle(phase, args.dry_run)
            if success:
                results["bundles"].append(path)
            else:
                results["errors"].append(f"Phase {phase} bundle")

    elif args.phase:
        success, path = generate_phase_pdf(args.phase, args.dry_run)
        if success:
            results["pdfs"].append(path)
        else:
            results["errors"].append(f"Phase {args.phase} PDF")

        success, path = create_phase_bundle(args.phase, args.dry_run)
        if success:
            results["bundles"].append(path)
        else:
            results["errors"].append(f"Phase {args.phase} bundle")

    # Summary
    print("\n" + "=" * 60)
    print("📊 Summary")
    print("=" * 60)
    print(f"✅ PDFs generated: {len(results['pdfs'])}")
    for pdf in results["pdfs"]:
        print(f"   - {pdf}")
    print(f"\n✅ Bundles created: {len(results['bundles'])}")
    for bundle in results["bundles"]:
        print(f"   - {bundle}")

    if results["errors"]:
        print(f"\n❌ Errors: {len(results['errors'])}")
        for error in results["errors"]:
            print(f"   - {error}")
        sys.exit(1)

    print("\n🎉 All done!")


if __name__ == "__main__":
    main()
