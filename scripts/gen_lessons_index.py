#!/usr/bin/env python3
"""
Generate an interactive lessons index page with client-side search and tag filtering.

Creates docs/lessons/index.md with all lessons listed as cards,
including embedded JavaScript for filtering.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Dict, List

import yaml

DAY_PREFIX_PATTERN = re.compile(
    r"^(?P<label>Day)\s+0*(?P<num>\d+)(?P<sep>\s*[.:\-\u2013\u2014\u00b7\u2022]?)\s*(?P<rest>.*)$",
    re.IGNORECASE,
)


def normalize_display_title(raw_title: str) -> str:
    """Return a cleaned title with a single day prefix."""

    if not raw_title:
        return ""

    title = re.sub(r"^#+\s*", "", raw_title)
    title = re.sub(r"[📘🌐📊🎉]", "", title).strip()

    match = DAY_PREFIX_PATTERN.match(title)
    if not match:
        return title

    day_num = int(match.group("num"))
    remainder = match.group("rest").strip()

    if remainder:
        duplicate_pattern = re.compile(
            rf"^(?:Day\s+0*{day_num}\s*[.:\-\u2013\u2014\u00b7\u2022]?\s*)+",
            re.IGNORECASE,
        )
        remainder = duplicate_pattern.sub("", remainder).strip()

    sep_token = match.group("sep") or ":"

    if remainder:
        if any(char in sep_token for char in "\u2013\u2014-"):
            separator = " – "
        elif any(char in sep_token for char in "\u00b7\u2022"):
            separator = " · "
        elif ":" in sep_token:
            separator = ": "
        else:
            separator = ": "
        cleaned = f"Day {day_num}{separator}{remainder}"
    else:
        cleaned = f"Day {day_num}"

    return cleaned


def extract_day_number(folder_name: str) -> int | None:
    """Extract day number from folder name."""
    match = re.match(r"Day_(\d{2,3})_", folder_name)
    return int(match.group(1)) if match else None


def extract_lesson_metadata(readme_path: Path, folder_name: str) -> Dict:
    """Extract metadata from lesson README."""
    metadata = {
        "title": folder_name.replace("_", " "),
        "tags": [],
        "description": "No description available",
    }

    try:
        with open(readme_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract front matter
        lines = content.split("\n")
        if lines and lines[0].strip() == "---":
            end_idx = None
            for i in range(1, len(lines)):
                if lines[i].strip() == "---":
                    end_idx = i
                    break

            if end_idx:
                front_matter_text = "\n".join(lines[1:end_idx])
                front_matter = yaml.safe_load(front_matter_text) or {}

                if "title" in front_matter:
                    metadata["title"] = front_matter["title"]
                if "tags" in front_matter:
                    metadata["tags"] = front_matter["tags"]

                # Get description from body
                body = "\n".join(lines[end_idx + 1 :])
            else:
                body = content
        else:
            body = content

        # Extract title if not in front matter
        if metadata["title"] == folder_name.replace("_", " "):
            title_match = re.search(r"^#+ (.+)$", body, re.MULTILINE)
            if title_match:
                metadata["title"] = title_match.group(1)

        # Extract description
        for line in body.split("\n"):
            stripped = line.strip()
            # Skip empty lines, headers, and YAML-like lines
            if not stripped or stripped.startswith("#"):
                continue
            # Skip YAML-like lines (key: value)
            if ":" in stripped and len(stripped.split(":")[0]) < 30:
                continue
            if len(stripped) > 30:
                metadata["description"] = stripped[:200]
                if len(stripped) > 200:
                    metadata["description"] += "..."
                break

    except Exception as e:
        print(f"    ⚠️  Failed to extract metadata: {e}")

    return metadata


def scan_all_lessons(repo_root: Path) -> List[Dict]:
    """Scan all lessons and extract metadata."""
    lessons = []

    for folder in sorted(repo_root.iterdir()):
        if not folder.is_dir() or not folder.name.startswith("Day_"):
            continue

        day_num = extract_day_number(folder.name)
        if day_num is None:
            continue

        readme_path = folder / "README.md"
        if not readme_path.exists():
            continue

        metadata = extract_lesson_metadata(readme_path, folder.name)

        lesson_slug = folder.name.lower().replace("_", "-")
        lesson_path = f"{lesson_slug}.md"

        lessons.append(
            {
                "day": day_num,
                "folder": folder.name,
                "slug": lesson_slug,
                "path": lesson_path,
                "title": metadata["title"],
                "tags": metadata["tags"],
                "description": metadata["description"],
            }
        )

    return sorted(lessons, key=lambda x: x["day"])


def generate_lessons_index(lessons: List[Dict], total_lessons: int) -> str:
    """Generate the lessons index markdown with embedded JavaScript."""

    # Collect all unique tags
    all_tags = set()
    for lesson in lessons:
        all_tags.update(lesson["tags"])
    sorted_tags = sorted(all_tags)

    content = """---
title: "All Lessons - Interactive Index"
---

# 📚 All Lessons

Browse all **{total}** lessons in the curriculum. Use the search box and tag filters below to find specific topics.

<div class="lesson-controls">
  <input type="text" id="lessonSearch" placeholder="🔍 Search lessons..." style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">

  <div id="tagFilters" style="margin-bottom: 20px;">
    <strong>Filter by tag:</strong>
    <button class="tag-filter active" data-tag="all" style="margin: 5px; padding: 5px 12px; border: 1px solid #ddd; border-radius: 15px; background: #007bff; color: white; cursor: pointer;">All</button>
""".format(total=total_lessons)

    for tag in sorted_tags:
        content += f'    <button class="tag-filter" data-tag="{tag}" style="margin: 5px; padding: 5px 12px; border: 1px solid #ddd; border-radius: 15px; background: white; color: #333; cursor: pointer;">{tag}</button>\n'

    content += """  </div>
</div>

<div id="lessonList">
"""

    # Generate lesson cards
    for lesson in lessons:
        day = lesson["day"]
        raw_title = lesson["title"]
        clean_title = normalize_display_title(raw_title)
        safe_title = clean_title.replace("|", "\\|")
        desc = lesson["description"].replace("|", "\\|")
        tags = lesson["tags"]
        path = lesson["path"]

        tag_badges = " ".join([f'<span class="tag-badge">{tag}</span>' for tag in tags])

        content += f"""
<div class="lesson-card" data-day="{day}" data-tags='{json.dumps(tags)}' data-title="{clean_title.lower()}" data-desc="{desc.lower()}">
  <h3><a href="{path}">{safe_title}</a></h3>
  <p>{desc}</p>
  <div class="lesson-tags">{tag_badges}</div>
</div>
"""

    content += """
</div>

<div id="noResults" style="display: none; padding: 40px; text-align: center; color: #999;">
  <p>No lessons found matching your criteria.</p>
</div>

<style>
.lesson-card {
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  transition: transform 0.2s, box-shadow 0.2s;
}

.lesson-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.lesson-card h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.lesson-card h3 a {
  color: #007bff;
  text-decoration: none;
}

.lesson-card h3 a:hover {
  text-decoration: underline;
}

.lesson-tags {
  margin-top: 10px;
}

.tag-badge {
  display: inline-block;
  padding: 3px 8px;
  margin-right: 5px;
  margin-top: 5px;
  background: #e0e0e0;
  border-radius: 3px;
  font-size: 12px;
  color: #333;
}

.tag-filter.active {
  background: #007bff !important;
  color: white !important;
  font-weight: bold;
}

@media (prefers-color-scheme: dark) {
  .lesson-card {
    background: #2d2d2d;
    border-color: #444;
  }

  .tag-badge {
    background: #444;
    color: #ddd;
  }

  .tag-filter {
    background: #333 !important;
    color: #ddd !important;
    border-color: #555 !important;
  }
}
</style>

<script>
(function() {
  const searchBox = document.getElementById('lessonSearch');
  const tagButtons = document.querySelectorAll('.tag-filter');
  const lessonCards = document.querySelectorAll('.lesson-card');
  const lessonList = document.getElementById('lessonList');
  const noResults = document.getElementById('noResults');

  let currentTag = 'all';
  let currentSearch = '';

  function filterLessons() {
    let visibleCount = 0;

    lessonCards.forEach(card => {
      const tags = JSON.parse(card.getAttribute('data-tags'));
      const title = card.getAttribute('data-title');
      const desc = card.getAttribute('data-desc');

      // Check tag filter
      const tagMatch = currentTag === 'all' || tags.includes(currentTag);

      // Check search filter
      const searchMatch = !currentSearch ||
                         title.includes(currentSearch.toLowerCase()) ||
                         desc.includes(currentSearch.toLowerCase());

      if (tagMatch && searchMatch) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Show/hide no results message
    if (visibleCount === 0) {
      lessonList.style.display = 'none';
      noResults.style.display = 'block';
    } else {
      lessonList.style.display = 'block';
      noResults.style.display = 'none';
    }
  }

  // Search box event
  searchBox.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    filterLessons();
  });

  // Tag filter events
  tagButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active state
      tagButtons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');

      currentTag = button.getAttribute('data-tag');
      filterLessons();
    });
  });

  // Initial filter
  filterLessons();
})();
</script>
"""

    return content


def generate_site_metadata(total_lessons: int, output_dir: Path, dry_run: bool = False):
    """Generate site_metadata.json for progress tracker."""
    metadata = {"total_lessons": total_lessons}

    output_path = output_dir / "site_metadata.json"

    if dry_run:
        print(f"    🔍 Would create {output_path}")
        print(f"       Content: {metadata}")
        return

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"    ✅ Created {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Generate interactive lessons index page"
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
    lessons_dir = repo_root / "docs" / "lessons"
    docs_dir = repo_root / "docs"

    if not lessons_dir.exists():
        print(f"❌ Lessons directory not found: {lessons_dir}", file=sys.stderr)
        sys.exit(1)

    print("📚 Scanning lessons...")
    lessons = scan_all_lessons(repo_root)
    print(f"✅ Found {len(lessons)} lessons")

    # Collect unique tags
    all_tags = set()
    for lesson in lessons:
        all_tags.update(lesson["tags"])
    print(f"  {len(all_tags)} unique tags: {sorted(all_tags)}")

    content = generate_lessons_index(lessons, len(lessons))
    output_path = lessons_dir / "index.md"

    if args.apply:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ Created {output_path}")

        # Also generate site metadata
        generate_site_metadata(len(lessons), docs_dir, dry_run=False)
    else:
        print(f"🔍 Would create {output_path}")
        print("  Content preview (first 500 chars):")
        print(content[:500])

        generate_site_metadata(len(lessons), docs_dir, dry_run=True)

    if not args.apply:
        print("\n💡 Run with --apply to create files")
    else:
        print("\n🎉 Lessons index generated successfully!")


if __name__ == "__main__":
    main()
