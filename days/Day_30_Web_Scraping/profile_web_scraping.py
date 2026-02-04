"""Profile the book scraping workflow used in the web scraping lesson."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Callable

try:
    from mypackage.profiling import print_report, profile_callable
except ImportError:
    PROJECT_ROOT = Path(__file__).resolve().parents[1]
    if str(PROJECT_ROOT) not in sys.path:
        sys.path.append(str(PROJECT_ROOT))
    from mypackage.profiling import print_report, profile_callable

try:  # pragma: no cover - runtime guard for direct execution
    from .web_scraping import URL, process_book_data, scrape_books
except ImportError:  # pragma: no cover - allows ``python profile_web_scraping.py``
    CURRENT_DIR = Path(__file__).resolve().parent
    if str(CURRENT_DIR) not in sys.path:
        sys.path.append(str(CURRENT_DIR))
    from web_scraping import URL, process_book_data, scrape_books  # type: ignore


def build_pipeline(url: str, html_path: Path | None) -> Callable[[], None]:
    """Return a callable that performs the scraping workflow."""

    if html_path is not None:
        html_bytes = html_path.read_bytes()

        def pipeline() -> None:
            process_book_data(html_bytes)

    else:

        def pipeline() -> None:
            scrape_books(url)

    return pipeline


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--mode",
        choices=("cprofile", "timeit"),
        default="cprofile",
        help="Profiling backend to use (default: cprofile)",
    )
    parser.add_argument(
        "--url",
        default=URL,
        help="Target URL to scrape when not using --local-html",
    )
    parser.add_argument(
        "--local-html",
        type=Path,
        help="Optional path to a saved HTML page for offline profiling",
    )
    parser.add_argument(
        "--repeat",
        type=int,
        default=5,
        help="Number of timing repeats when --mode=timeit",
    )
    parser.add_argument(
        "--number",
        type=int,
        default=1,
        help="Number of calls per repeat when --mode=timeit",
    )
    args = parser.parse_args()

    if args.mode == "timeit" and args.local_html is None:
        raise SystemExit(
            "--mode=timeit requires --local-html to avoid repeated network calls"
        )

    pipeline = build_pipeline(url=args.url, html_path=args.local_html)
    profile_report, timing_report = profile_callable(
        pipeline,
        mode=args.mode,
        repeat=args.repeat,
        number=args.number,
    )
    print_report(profile_report=profile_report, timing_report=timing_report)


if __name__ == "__main__":
    main()
