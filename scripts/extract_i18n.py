#!/usr/bin/env python3
"""
Extract translatable strings from lesson READMEs and docs pages.

Creates locale templates (POT files) for internationalization.

Usage:
    python scripts/extract_i18n.py --output locales/en/
"""

import argparse
import json
import re
from pathlib import Path
from typing import List, Set


def extract_markdown_text(md_content: str) -> List[str]:
    """Extract translatable text from markdown, excluding code blocks."""
    translatable = []

    # Remove code blocks
    md_content = re.sub(r"```.*?```", "", md_content, flags=re.DOTALL)
    md_content = re.sub(r"`[^`]+`", "", md_content)

    # Extract headings
    for match in re.finditer(r"^#+\s+(.+)$", md_content, re.MULTILINE):
        text = match.group(1).strip()
        if text and not text.startswith("["):
            translatable.append(text)

    # Extract paragraphs
    paragraphs = re.split(r"\n\s*\n", md_content)
    for para in paragraphs:
        para = para.strip()
        if para and not para.startswith("#") and not para.startswith("|"):
            # Clean up markdown formatting
            para = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", para)  # Remove links
            para = re.sub(r"[*_]{1,2}([^*_]+)[*_]{1,2}", r"\1", para)  # Remove emphasis
            if len(para) > 10:  # Skip very short lines
                translatable.append(para[:200])  # Truncate long paragraphs

    return translatable


def extract_from_lesson(lesson_dir: Path) -> Set[str]:
    """Extract strings from a lesson's README."""
    readme = lesson_dir / "README.md"
    if not readme.exists():
        return set()

    content = readme.read_text(encoding="utf-8")
    return set(extract_markdown_text(content))


def generate_pot_file(strings: Set[str], output_path: Path):
    """Generate a POT (Portable Object Template) file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    pot_content = """# Coding for MBA - Translation Template
# Copyright (C) 2024
# This file is distributed under the same license as the Coding for MBA package.
#
msgid ""
msgstr ""
"Project-Id-Version: Coding for MBA 1.0\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: 2024-01-01 12:00+0000\\n"
"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"
"Last-Translator: FULL NAME <EMAIL@ADDRESS>\\n"
"Language-Team: LANGUAGE <LL@li.org>\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

"""

    for string in sorted(strings):
        # Escape quotes and newlines
        escaped = string.replace('"', '\\"').replace("\n", "\\n")
        pot_content += f'msgid "{escaped}"\nmsgstr ""\n\n'

    output_path.write_text(pot_content, encoding="utf-8")


def generate_json_locale(strings: Set[str], output_path: Path):
    """Generate a JSON locale file (simpler alternative to POT)."""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    locale_data = {
        "metadata": {"language": "en", "version": "1.0", "last_updated": "2024-01-01"},
        "strings": {s: s for s in sorted(strings)},  # English as base
    }

    output_path.write_text(
        json.dumps(locale_data, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Extract translatable strings")
    parser.add_argument(
        "--output", type=str, default="locales/en", help="Output directory"
    )
    parser.add_argument(
        "--format", choices=["pot", "json"], default="json", help="Output format"
    )

    args = parser.parse_args()

    repo_root = Path(__file__).parent.parent
    output_dir = repo_root / args.output

    print("=" * 60)
    print("🌍 i18n String Extraction Tool")
    print("=" * 60)

    all_strings = set()

    # Extract from lessons
    print("\n📚 Scanning lesson READMEs...")
    lesson_pattern = re.compile(r"Day_(\d+)_.*")
    for item in repo_root.iterdir():
        if item.is_dir() and lesson_pattern.match(item.name):
            strings = extract_from_lesson(item)
            all_strings.update(strings)
            if strings:
                print(f"  ✓ {item.name}: {len(strings)} strings")

    # Extract from docs
    print("\n📄 Scanning docs...")
    docs_dir = repo_root / "docs"
    if docs_dir.exists():
        for md_file in docs_dir.glob("*.md"):
            content = md_file.read_text(encoding="utf-8")
            strings = set(extract_markdown_text(content))
            all_strings.update(strings)
            if strings:
                print(f"  ✓ {md_file.name}: {len(strings)} strings")

    # Generate output
    print(f"\n📝 Generating {args.format.upper()} file...")

    if args.format == "pot":
        output_path = output_dir / "messages.pot"
        generate_pot_file(all_strings, output_path)
    else:  # json
        output_path = output_dir / "messages.json"
        generate_json_locale(all_strings, output_path)

    print(f"✅ Created: {output_path}")
    print(f"📊 Total strings: {len(all_strings)}")

    # Create Spanish template
    if args.format == "json":
        es_path = repo_root / "locales/es/messages.json"
        es_path.parent.mkdir(parents=True, exist_ok=True)

        es_data = {
            "metadata": {
                "language": "es",
                "version": "1.0",
                "last_updated": "2024-01-01",
                "translation_status": "incomplete",
            },
            "strings": {
                s: "" for s in sorted(list(all_strings)[:10])
            },  # Sample: first 10 strings
        }

        es_path.write_text(
            json.dumps(es_data, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        print(f"✅ Created Spanish template: {es_path}")

    print("\n" + "=" * 60)
    print("🎉 Extraction complete!")
    print("=" * 60)
    print("\n💡 Next steps:")
    print(f"   1. Review {output_path}")
    print("   2. Translate strings in locales/es/messages.json")
    print("   3. Configure mkdocs.yml for i18n plugin")
    print("   4. See docs/i18n.md for full workflow")


if __name__ == "__main__":
    main()
