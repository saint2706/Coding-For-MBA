"""Command-line helpers for profiling the Pandas advanced lesson."""

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

try:  # pragma: no cover - runtime guard for script execution
    from .pandas_adv import (
        filter_by_high_revenue,
        filter_by_product_and_region,
        handle_missing_data,
        load_sales_data,
    )
except ImportError:  # pragma: no cover - allows ``python profile_pandas_adv.py``
    CURRENT_DIR = Path(__file__).resolve().parent
    if str(CURRENT_DIR) not in sys.path:
        sys.path.append(str(CURRENT_DIR))
    from pandas_adv import (  # type: ignore  # pylint: disable=import-error
        filter_by_high_revenue,
        filter_by_product_and_region,
        handle_missing_data,
        load_sales_data,
    )


def build_pipeline(
    data_path: Path, threshold: float, product: str, region: str, missing_strategy: str
) -> Callable[[], None]:
    """Return a callable that executes the common lesson workflow."""

    def pipeline() -> None:
        df = load_sales_data(str(data_path))
        if df is None or df.empty:
            raise ValueError(
                f"Sales data could not be loaded from {data_path}. Ensure the CSV exists"
                " and contains data."
            )

        filter_by_high_revenue(df, threshold)
        filter_by_product_and_region(df, product, region)
        handle_missing_data(df, strategy=missing_strategy)

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
        "--threshold",
        type=float,
        default=50_000,
        help="Revenue threshold used in filter_by_high_revenue",
    )
    parser.add_argument(
        "--product",
        default="Laptop",
        help="Product name used for filter_by_product_and_region",
    )
    parser.add_argument(
        "--region",
        default="North",
        help="Region used for filter_by_product_and_region",
    )
    parser.add_argument(
        "--missing-strategy",
        choices=("drop", "fill"),
        default="fill",
        help="Strategy used when calling handle_missing_data",
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

    data_path = Path(__file__).resolve().parent / "sales_data.csv"
    pipeline = build_pipeline(
        data_path=data_path,
        threshold=args.threshold,
        product=args.product,
        region=args.region,
        missing_strategy=args.missing_strategy,
    )

    profile_report, timing_report = profile_callable(
        pipeline,
        mode=args.mode,
        repeat=args.repeat,
        number=args.number,
    )
    print_report(profile_report=profile_report, timing_report=timing_report)


if __name__ == "__main__":
    main()
