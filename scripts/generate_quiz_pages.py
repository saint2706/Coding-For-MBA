#!/usr/bin/env python3
"""
Generate interactive quiz pages from YAML quiz files.

Converts quiz YAML files into HTML pages with embedded JavaScript
for interactive quiz-taking and result tracking.

Usage:
    python scripts/generate_quiz_pages.py --all        # Generate pages for all quizzes
    python scripts/generate_quiz_pages.py --quiz Day_02  # Generate specific quiz
"""

import argparse
import sys
from pathlib import Path
from typing import Dict, Optional

import yaml

QUIZ_HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz: {title}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }}
        .container {{
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        h1 {{ color: #2c3e50; margin-bottom: 0.5rem; }}
        .quiz-info {{ color: #7f8c8d; margin-bottom: 2rem; font-size: 0.9rem; }}
        .question {{
            background: #f8f9fa;
            border-left: 4px solid #3498db;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border-radius: 8px;
        }}
        .question-text {{
            font-size: 1.1rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 1rem;
        }}
        .option {{
            background: white;
            border: 2px solid #e0e0e0;
            padding: 1rem;
            margin: 0.5rem 0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
        }}
        .option:hover {{ border-color: #3498db; background: #f0f8ff; }}
        .option input {{ margin-right: 0.75rem; cursor: pointer; }}
        .option label {{ cursor: pointer; width: 100%; display: inline-block; }}
        .explanation {{
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 8px;
            display: none;
        }}
        .explanation.show {{ display: block; }}
        .submit-btn {{
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-top: 2rem;
        }}
        .submit-btn:hover {{ transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); }}
        .results {{
            background: #f0f8ff;
            border: 2px solid #3498db;
            padding: 2rem;
            border-radius: 12px;
            margin-top: 2rem;
            text-align: center;
            display: none;
        }}
        .results.show {{ display: block; }}
        .score {{ font-size: 2.5rem; font-weight: bold; color: #3498db; margin: 1rem 0; }}
        .correct {{ border-color: #4caf50; background: #e8f5e9; }}
        .incorrect {{ border-color: #f44336; background: #ffebee; }}
        .tags {{
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
        }}
        .tag {{
            background: #3498db;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.85rem;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>📝 {title}</h1>
        <div class="quiz-info">
            {points} points • Passing score: {passing_score}% • ~{estimated_time} minutes
            <div class="tags">
                {tags}
            </div>
        </div>

        <form id="quizForm">
            {questions_html}
            <button type="submit" class="submit-btn">Submit Quiz</button>
        </form>

        <div id="results" class="results">
            <h2>Quiz Results</h2>
            <div class="score" id="scoreDisplay"></div>
            <p id="scoreMessage"></p>
            <button onclick="location.reload()" class="submit-btn" style="margin-top: 1rem; width: auto; padding: 0.75rem 1.5rem;">Retake Quiz</button>
        </div>
    </div>

    <script>
        const quizData = {quiz_data};

        document.getElementById('quizForm').addEventListener('submit', function(e) {{
            e.preventDefault();
            gradeQuiz();
        }});

        function gradeQuiz() {{
            let correct = 0;
            const total = quizData.questions.length;

            quizData.questions.forEach((q, index) => {{
                const selected = document.querySelector(`input[name="q${{index}}"]:checked`);
                const questionDiv = document.getElementById(`question-${{index}}`);
                const explanation = document.getElementById(`explanation-${{index}}`);

                if (selected) {{
                    const answer = parseInt(selected.value);
                    if (answer === q.answer) {{
                        correct++;
                        questionDiv.classList.add('correct');
                    }} else {{
                        questionDiv.classList.add('incorrect');
                    }}

                    if (explanation) {{
                        explanation.classList.add('show');
                    }}
                }}
            }});

            const percentage = Math.round((correct / total) * 100);
            const passed = percentage >= quizData.metadata.passing_score;

            document.getElementById('scoreDisplay').textContent = `${{correct}}/${{total}} (${{percentage}}%)`;
            document.getElementById('scoreMessage').textContent = passed
                ? '🎉 Congratulations! You passed!'
                : '📚 Keep studying and try again!';

            document.getElementById('results').classList.add('show');
            document.getElementById('quizForm').querySelector('.submit-btn').style.display = 'none';

            // Save result to localStorage (or send to learner backend)
            saveResult(percentage);
        }}

        function saveResult(score) {{
            try {{
                const day = {day_number};
                // Send to learner backend
                fetch('/api/v1/progress', {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify({{
                        user_id: 'current',
                        day: day,
                        status: 'completed',
                        quiz_score: score
                    }})
                }});
            }} catch (e) {{
                console.error('Failed to save quiz result:', e);
            }}
        }}
    </script>
</body>
</html>
"""


def load_quiz(quiz_path: Path) -> Optional[Dict]:
    """Load quiz from YAML file."""
    try:
        with open(quiz_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"  ❌ Error loading {quiz_path}: {e}")
        return None


def generate_quiz_html(quiz_data: Dict, day_number: int, title: str) -> str:
    """Generate HTML quiz page."""
    questions_html = []

    for i, q in enumerate(quiz_data["questions"]):
        options_html = []
        for j, option in enumerate(q["options"]):
            options_html.append(
                f"""
                <div class="option">
                    <input type="radio" id="q{i}_o{j}" name="q{i}" value="{j}">
                    <label for="q{i}_o{j}">{option}</label>
                </div>
            """
            )

        explanation_html = ""
        if "explanation" in q:
            explanation_html = f"""
                <div class="explanation" id="explanation-{i}">
                    <strong>💡 Explanation:</strong> {q["explanation"]}
                </div>
            """

        question_html = f"""
            <div class="question" id="question-{i}">
                <div class="question-text">Question {i + 1}: {q["question"]}</div>
                {"".join(options_html)}
                {explanation_html}
            </div>
        """
        questions_html.append(question_html)

    # Generate tags HTML
    tags_html = "".join(
        [
            f'<span class="tag">{tag}</span>'
            for tag in quiz_data["metadata"].get("tags", [])
        ]
    )

    # Convert quiz data to JSON for embedding
    import json

    quiz_json = json.dumps(quiz_data, indent=2)

    html = QUIZ_HTML_TEMPLATE.format(
        title=title,
        points=quiz_data["metadata"].get("points", 0),
        passing_score=quiz_data["metadata"].get("passing_score", 60),
        estimated_time=quiz_data["metadata"].get("estimated_time_minutes", 5),
        tags=tags_html,
        questions_html="".join(questions_html),
        quiz_data=quiz_json,
        day_number=day_number,
    )

    return html


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Generate quiz pages from YAML")
    parser.add_argument(
        "--all", action="store_true", help="Generate pages for all quizzes"
    )
    parser.add_argument(
        "--quiz", type=str, help="Generate specific quiz (e.g., Day_02)"
    )
    parser.add_argument(
        "--output", type=str, default="docs/quizzes", help="Output directory"
    )

    args = parser.parse_args()

    if not args.all and not args.quiz:
        parser.print_help()
        print("\n❌ Error: Specify --all or --quiz Day_XX")
        sys.exit(1)

    repo_root = Path(__file__).parent.parent
    quiz_dir = repo_root / "quizzes"
    output_dir = repo_root / args.output
    output_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("📝 Quiz Page Generator")
    print("=" * 60)

    if args.all:
        quiz_files = sorted(quiz_dir.glob("Day_*_quiz.yml"))
    else:
        quiz_files = [quiz_dir / f"{args.quiz}_quiz.yml"]

    generated = 0
    for quiz_file in quiz_files:
        if not quiz_file.exists():
            print(f"  ⚠️  Quiz not found: {quiz_file}")
            continue

        quiz_data = load_quiz(quiz_file)
        if not quiz_data:
            continue

        # Extract day number
        day_match = quiz_file.stem.split("_")[1]
        day_number = int(day_match)

        # Generate HTML
        title = f"Day {day_number} Quiz"
        html = generate_quiz_html(quiz_data, day_number, title)

        # Save to file
        output_file = output_dir / f"{quiz_file.stem.replace('_quiz', '')}.html"
        output_file.write_text(html, encoding="utf-8")

        print(f"  ✅ Generated: {output_file}")
        generated += 1

    print("\n" + "=" * 60)
    print(f"📊 Summary: {generated} quiz page(s) generated")
    print("=" * 60)


if __name__ == "__main__":
    main()
