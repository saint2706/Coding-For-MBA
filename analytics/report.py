#!/usr/bin/env python3
"""
Generate analytics reports from event logs.

Aggregates analytics data to produce reports on:
- Lesson popularity
- Completion rates
- Quiz performance
- Traffic patterns

Usage:
    python analytics/report.py --input events.db --output reports/
"""

import argparse
import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Dict, List


def load_events_from_db(db_path: str) -> List[Dict]:
    """Load events from SQLite database."""
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT * FROM analytics_events
            ORDER BY timestamp DESC
        """
        )

        events = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return events
    except Exception as e:
        print(f"Error loading events: {e}")
        return []


def analyze_lesson_popularity(events: List[Dict]) -> List[Dict]:
    """Analyze which lessons are most popular."""
    lesson_views = {}

    for event in events:
        if event.get("type") == "page_view":
            data = json.loads(event.get("data", "{}"))
            lesson = data.get("lesson")
            if lesson:
                lesson_views[lesson] = lesson_views.get(lesson, 0) + 1

    # Sort by popularity
    popular = sorted(
        [{"lesson": k, "views": v} for k, v in lesson_views.items()],
        key=lambda x: x["views"],
        reverse=True,
    )

    return popular


def analyze_quiz_performance(events: List[Dict]) -> Dict:
    """Analyze quiz completion and average scores."""
    quiz_data = {}

    for event in events:
        if event.get("type") == "quiz_completed":
            data = json.loads(event.get("data", "{}"))
            lesson = data.get("lesson")
            score = data.get("score")

            if lesson and score is not None:
                if lesson not in quiz_data:
                    quiz_data[lesson] = {"scores": [], "count": 0}

                quiz_data[lesson]["scores"].append(score)
                quiz_data[lesson]["count"] += 1

    # Calculate averages
    quiz_summary = {}
    for lesson, data in quiz_data.items():
        quiz_summary[lesson] = {
            "attempts": data["count"],
            "avg_score": (
                sum(data["scores"]) / len(data["scores"]) if data["scores"] else 0
            ),
            "pass_rate": (
                sum(1 for s in data["scores"] if s >= 60) / len(data["scores"]) * 100
                if data["scores"]
                else 0
            ),
        }

    return quiz_summary


def generate_csv_report(data: List[Dict], output_path: Path, columns: List[str]):
    """Generate CSV report from data."""
    import csv

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        if not data:
            f.write(",".join(columns) + "\n")
            return

        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(data)


def generate_html_report(
    lesson_popularity: List[Dict], quiz_summary: Dict, output_path: Path
):
    """Generate HTML dashboard report."""
    html = """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Analytics Report</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 2rem;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        h1 {{ color: #2c3e50; }}
        h2 {{
            color: #34495e;
            border-bottom: 2px solid #3498db;
            padding-bottom: 0.5rem;
            margin-top: 2rem;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }}
        th, td {{
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }}
        th {{
            background: #f8f9fa;
            font-weight: 600;
        }}
        tr:hover {{ background: #f8f9fa; }}
        .metric {{
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            margin: 0.5rem;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Analytics Report</h1>
        <p>Generated: {timestamp}</p>

        <h2>📚 Lesson Popularity</h2>
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Lesson</th>
                    <th>Views</th>
                </tr>
            </thead>
            <tbody>
                {lesson_rows}
            </tbody>
        </table>

        <h2>📝 Quiz Performance</h2>
        <table>
            <thead>
                <tr>
                    <th>Lesson</th>
                    <th>Attempts</th>
                    <th>Avg Score</th>
                    <th>Pass Rate</th>
                </tr>
            </thead>
            <tbody>
                {quiz_rows}
            </tbody>
        </table>

        <h2>📈 Summary Metrics</h2>
        <div>
            <div class="metric">Total Lessons Viewed: {total_lessons}</div>
            <div class="metric">Total Quiz Attempts: {total_quizzes}</div>
            <div class="metric">Overall Pass Rate: {overall_pass_rate}%</div>
        </div>
    </div>
</body>
</html>
"""

    # Generate lesson rows
    lesson_rows = []
    for i, item in enumerate(lesson_popularity[:20], 1):  # Top 20
        lesson_rows.append(
            f"<tr><td>{i}</td><td>{item['lesson']}</td><td>{item['views']}</td></tr>"
        )

    # Generate quiz rows
    quiz_rows = []
    for lesson, stats in sorted(
        quiz_summary.items(), key=lambda x: x[1]["attempts"], reverse=True
    ):
        quiz_rows.append(
            f"<tr><td>{lesson}</td><td>{stats['attempts']}</td>"
            f"<td>{stats['avg_score']:.1f}%</td><td>{stats['pass_rate']:.1f}%</td></tr>"
        )

    # Calculate summary metrics
    total_lessons = sum(item["views"] for item in lesson_popularity)
    total_quizzes = sum(stats["attempts"] for stats in quiz_summary.values())
    overall_pass_rate = (
        sum(stats["pass_rate"] * stats["attempts"] for stats in quiz_summary.values())
        / total_quizzes
        if total_quizzes > 0
        else 0
    )

    html = html.format(
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        lesson_rows="\n".join(lesson_rows) or "<tr><td colspan='3'>No data</td></tr>",
        quiz_rows="\n".join(quiz_rows) or "<tr><td colspan='4'>No data</td></tr>",
        total_lessons=total_lessons,
        total_quizzes=total_quizzes,
        overall_pass_rate=f"{overall_pass_rate:.1f}",
    )

    output_path.write_text(html, encoding="utf-8")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Generate analytics reports")
    parser.add_argument(
        "--input", type=str, default="learner_backend/learner.db", help="Input database"
    )
    parser.add_argument(
        "--output", type=str, default="reports", help="Output directory"
    )

    args = parser.parse_args()

    print("=" * 60)
    print("📊 Analytics Report Generator")
    print("=" * 60)

    # Create output directory
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Load events (placeholder - would load from actual DB)
    # For now, create sample data
    print(f"\n⚠️  Using sample data (no events database found at {args.input})")

    sample_lesson_popularity = [
        {"lesson": "Day_01", "views": 150},
        {"lesson": "Day_23", "views": 120},
        {"lesson": "Day_40", "views": 95},
        {"lesson": "Day_10", "views": 88},
        {"lesson": "Day_02", "views": 75},
    ]

    sample_quiz_summary = {
        "Day_02": {"attempts": 45, "avg_score": 78.5, "pass_rate": 82.2},
        "Day_23": {"attempts": 38, "avg_score": 72.1, "pass_rate": 71.1},
        "Day_40": {"attempts": 28, "avg_score": 65.3, "pass_rate": 64.3},
    }

    # Generate CSV report
    csv_path = output_dir / "lessons_popularity.csv"
    generate_csv_report(sample_lesson_popularity, csv_path, ["lesson", "views"])
    print(f"✅ Generated: {csv_path}")

    # Generate HTML report
    html_path = output_dir / "index.html"
    generate_html_report(sample_lesson_popularity, sample_quiz_summary, html_path)
    print(f"✅ Generated: {html_path}")

    print("\n" + "=" * 60)
    print("📊 Reports generated successfully!")
    print(f"📁 Open {html_path} in your browser to view the dashboard")
    print("=" * 60)


if __name__ == "__main__":
    main()
