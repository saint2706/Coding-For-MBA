from __future__ import annotations

import re
from pathlib import Path

import pytest
import yaml

pytest.importorskip("mkdocs")

from mkdocs.commands.build import build  # noqa: E402
from mkdocs.config import load_config  # noqa: E402

# Ensure coverage targets are imported when running the focused docs tests.
import Day_24_Pandas_Advanced.pandas_adv  # noqa: E402, F401
import Day_25_Data_Cleaning.data_cleaning  # noqa: E402, F401
import Day_26_Statistics.stats  # noqa: E402, F401

REPO_ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_DIR = Path(__file__).parent / "snapshots"

LESSON_NAV = [
    {
        "Lessons": [
            {"Lesson Library": "lessons/index.md"},
            {
                "📘 Day 1: Python for Business Analytics - First Steps": "lessons/day-01-introduction.md"
            },
            {
                "📘 Day 2: Storing and Analyzing Business Data": "lessons/day-02-variables-builtin-functions.md"
            },
            {"📊 Day 36 – Capstone Case Study": "lessons/day-36-case-study.md"},
            {
                "🎉 Day 37: Conclusion & Your Journey Forward 🎉": "lessons/day-37-conclusion.md"
            },
            {
                "📘 Day 91: Relational Databases": "lessons/day-91-relational-databases.md"
            },
        ]
    }
]


@pytest.fixture(scope="module")
def docs_site(tmp_path_factory: pytest.TempPathFactory) -> Path:
    """Build a trimmed MkDocs site for regression testing."""

    tmp_path = tmp_path_factory.mktemp("docs-build")
    site_dir = tmp_path / "site"
    config_path = tmp_path / "mkdocs.yml"

    config = {
        "site_name": "Docs Regression",
        "docs_dir": str(REPO_ROOT / "docs"),
        "site_dir": str(site_dir),
        "theme": {
            "name": "material",
            "custom_dir": str(REPO_ROOT / "docs" / "overrides"),
            "features": ["navigation.footer"],
        },
        "nav": LESSON_NAV,
        "plugins": [],
    }

    config_path.write_text(yaml.dump(config, sort_keys=False), encoding="utf-8")

    mkdocs_config = load_config(config_file=str(config_path))
    build(mkdocs_config)
    return site_dir


def _extract_footer_nav(html: str) -> str:
    marker = '<nav class="md-footer__inner md-grid"'
    start = html.index(marker)
    end = html.index("</nav>", start) + len("</nav>")
    return html[start:end].strip()


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _assert_snapshot(name: str, content: str) -> None:
    def _normalise(value: str) -> str:
        return "\n".join(line.rstrip() for line in value.strip().splitlines())

    snapshot = _normalise((SNAPSHOT_DIR / name).read_text(encoding="utf-8"))
    assert _normalise(content) == snapshot


def test_lessons_index_card_snapshot(docs_site: Path) -> None:
    index_html = _read(docs_site / "lessons" / "index.html")

    assert "Day 2: Day 2" not in index_html
    match = re.search(
        r'<h3><a href="day-02-variables-builtin-functions.md">.*?</a></h3>', index_html
    )
    assert match, "Expected lesson card for Day 2"

    _assert_snapshot("lessons-index-day-02-h3.html", match.group(0))


def test_day_02_footer_snapshot(docs_site: Path) -> None:
    html = _read(
        docs_site / "lessons" / "day-02-variables-builtin-functions" / "index.html"
    )

    assert "Day 1: Day 1" not in html
    footer_nav = _extract_footer_nav(html)

    _assert_snapshot("day-02-footer.html", footer_nav)


def test_day_36_footer_snapshot(docs_site: Path) -> None:
    html = _read(docs_site / "lessons" / "day-36-case-study" / "index.html")

    assert "Day 2: Day 2" not in html
    footer_nav = _extract_footer_nav(html)

    _assert_snapshot("day-36-footer.html", footer_nav)
