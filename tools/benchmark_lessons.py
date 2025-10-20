"""Performance benchmarks for data-heavy lessons."""

from __future__ import annotations

import argparse
import json
import statistics
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Dict, Iterable, List, Tuple

import pandas as pd


@dataclass
class BenchmarkResult:
    """Container for timing and memory metrics."""

    name: str
    mean_runtime: float
    stdev_runtime: float
    max_runtime: float
    mean_peak_kib: float
    stdev_peak_kib: float
    max_peak_kib: float
    sample_metadata: Dict[str, object]

    def to_dict(self) -> Dict[str, object]:
        return {
            "name": self.name,
            "mean_runtime_seconds": round(self.mean_runtime, 4),
            "stdev_runtime_seconds": round(self.stdev_runtime, 4),
            "max_runtime_seconds": round(self.max_runtime, 4),
            "mean_peak_memory_kib": round(self.mean_peak_kib, 2),
            "stdev_peak_memory_kib": round(self.stdev_peak_kib, 2),
            "max_peak_memory_kib": round(self.max_peak_kib, 2),
            "sample_metadata": self.sample_metadata,
        }


def _fortune_1000_sector_rollup(data_dir: Path) -> Dict[str, object]:
    df = pd.read_csv(data_dir / "fortune1000_final.csv", encoding="latin1").rename(
        columns={"Sector": "sector", "Profits ($M)": "profits"}
    )
    df["profits"] = pd.to_numeric(df["profits"], errors="coerce").fillna(0.0)
    grouped = (
        df.groupby("sector", observed=True)["profits"]
        .sum()
        .sort_values(ascending=False)
    )
    top5 = grouped.head(5)
    return {
        "rows": len(df),
        "columns": list(df.columns),
        "top_sector": top5.index[0],
        "top_sector_profit": float(top5.iloc[0]),
    }


def _hn_keyword_engagement(data_dir: Path) -> Dict[str, object]:
    df = pd.read_csv(data_dir / "HN_posts_year_to_Sep_26_2016.csv")
    keywords = ["python", "business", "data"]
    filtered = df[df["title"].str.contains("|".join(keywords), case=False, na=False)]
    summary = (
        filtered.assign(
            year=pd.to_datetime(filtered["created_at"], errors="coerce").dt.year
        )
        .groupby("year", dropna=True)["num_comments"]
        .agg(["count", "mean", "max"])
        .reset_index()
        .sort_values("year")
    )
    max_comments = float(summary["max"].max()) if not summary.empty else 0.0
    return {
        "rows": len(df),
        "filtered_rows": len(filtered),
        "years": summary["year"].tolist(),
        "max_comments": max_comments,
    }


def _load_scenarios(
    repo_root: Path,
) -> List[Tuple[str, Callable[[Path], Dict[str, object]]]]:
    data_dir = repo_root / "data"
    return [
        ("fortune1000_sector_rollup", lambda: _fortune_1000_sector_rollup(data_dir)),
        ("hn_keyword_engagement", lambda: _hn_keyword_engagement(data_dir)),
    ]


def _run_scenario(
    name: str, fn: Callable[[], Dict[str, object]], repeats: int
) -> BenchmarkResult:
    runtimes: List[float] = []
    peaks: List[float] = []
    metadata: Dict[str, object] | None = None
    for _ in range(repeats):
        start = time.perf_counter()
        result = fn()
        elapsed = time.perf_counter() - start
        runtimes.append(elapsed)
        if metadata is None:
            metadata = result
        elif isinstance(result, dict):
            metadata = {**metadata, **result}
        peaks.append(_estimate_peak_memory(result))
    assert metadata is not None
    return BenchmarkResult(
        name=name,
        mean_runtime=statistics.mean(runtimes),
        stdev_runtime=statistics.pstdev(runtimes) if len(runtimes) > 1 else 0.0,
        max_runtime=max(runtimes),
        mean_peak_kib=statistics.mean(peaks),
        stdev_peak_kib=statistics.pstdev(peaks) if len(peaks) > 1 else 0.0,
        max_peak_kib=max(peaks),
        sample_metadata=metadata,
    )


def _estimate_peak_memory(result: Dict[str, object]) -> float:
    payload = json.dumps(result).encode("utf-8")
    return len(payload) / 1024


def run_benchmarks(repo_root: Path, repeats: int) -> List[BenchmarkResult]:
    scenarios = _load_scenarios(repo_root)
    results: List[BenchmarkResult] = []
    for name, factory in scenarios:
        results.append(_run_scenario(name, factory, repeats))
    return results


def _print_summary(results: Iterable[BenchmarkResult]) -> None:
    print("Lesson Performance Benchmarks")
    print("=" * 32)
    for result in results:
        print(f"• {result.name}")
        print(
            f"  runtime: mean {result.mean_runtime:.4f}s ± {result.stdev_runtime:.4f}s (max {result.max_runtime:.4f}s)"
        )
        print(
            f"  peak memory: mean {result.mean_peak_kib:.2f} KiB ± {result.stdev_peak_kib:.2f} KiB (max {result.max_peak_kib:.2f} KiB)"
        )
        print(
            f"  sample metadata: {json.dumps(result.sample_metadata, indent=2)[:200]}\n"
        )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Benchmark data-heavy lesson workloads."
    )
    parser.add_argument(
        "--repeats", type=int, default=3, help="How many times to repeat each scenario"
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("benchmark-results.json"),
        help="Path to write JSON results",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]
    pd.options.mode.copy_on_write = True

    results = run_benchmarks(repo_root=repo_root, repeats=args.repeats)
    _print_summary(results)

    payload = {
        "benchmarks": [result.to_dict() for result in results],
        "repeats": args.repeats,
    }
    args.output.write_text(json.dumps(payload, indent=2))
    print(f"Benchmark results written to {args.output.resolve()}")


if __name__ == "__main__":
    main()
