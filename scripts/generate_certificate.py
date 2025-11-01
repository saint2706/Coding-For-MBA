#!/usr/bin/env python3
"""
Generate PDF certificates for phase completion.

Creates professional-looking PDF certificates using WeasyPrint from HTML templates.
Certificates include the learner's name, phase completed, and completion date.

Usage:
    python scripts/generate_certificate.py --name "John Doe" --phase 1
    python scripts/generate_certificate.py --name "Jane Smith" --phase 3 --output certs/
"""

import argparse
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

# Phase names
PHASE_NAMES = {
    1: "Python Foundations",
    2: "Data Workflows & Analytics",
    3: "Machine Learning Fundamentals",
    4: "Advanced ML & MLOps",
    5: "Business Intelligence",
    6: "Advanced BI & Capstone",
    7: "SQL & Database Mastery",
}

CERTIFICATE_HTML_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Certificate of Completion</title>
    <style>
        @page {{
            size: A4 landscape;
            margin: 0;
        }}

        body {{
            margin: 0;
            padding: 0;
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }}

        .certificate {{
            background: white;
            width: 27cm;
            height: 19cm;
            padding: 2cm;
            box-sizing: border-box;
            border: 15px solid #f0f0f0;
            position: relative;
        }}

        .border-inner {{
            border: 2px solid #333;
            padding: 1.5cm;
            height: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }}

        .header {{
            text-align: center;
            margin-bottom: 1cm;
        }}

        .title {{
            font-size: 48pt;
            font-weight: bold;
            color: #2c3e50;
            margin: 0;
            letter-spacing: 2px;
        }}

        .subtitle {{
            font-size: 18pt;
            color: #7f8c8d;
            margin: 10px 0 0 0;
        }}

        .content {{
            text-align: center;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }}

        .presented-to {{
            font-size: 16pt;
            color: #34495e;
            margin-bottom: 20px;
        }}

        .recipient-name {{
            font-size: 36pt;
            font-weight: bold;
            color: #2c3e50;
            margin: 20px 0;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            display: inline-block;
        }}

        .achievement {{
            font-size: 14pt;
            color: #555;
            margin: 30px 0;
            line-height: 1.6;
        }}

        .phase-name {{
            font-size: 24pt;
            font-weight: bold;
            color: #3498db;
            margin: 20px 0;
        }}

        .footer {{
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 2cm;
        }}

        .signature-block {{
            text-align: center;
            flex: 1;
        }}

        .signature-line {{
            border-top: 2px solid #333;
            margin-top: 50px;
            padding-top: 10px;
            font-size: 12pt;
            color: #555;
        }}

        .date {{
            text-align: right;
            font-size: 12pt;
            color: #555;
        }}

        .decoration {{
            position: absolute;
            font-size: 72pt;
            opacity: 0.1;
        }}

        .decoration-tl {{
            top: 10px;
            left: 10px;
        }}

        .decoration-tr {{
            top: 10px;
            right: 10px;
        }}

        .decoration-bl {{
            bottom: 10px;
            left: 10px;
        }}

        .decoration-br {{
            bottom: 10px;
            right: 10px;
        }}
    </style>
</head>
<body>
    <div class="certificate">
        <div class="decoration decoration-tl">🏆</div>
        <div class="decoration decoration-tr">📚</div>
        <div class="decoration decoration-bl">💡</div>
        <div class="decoration decoration-br">✨</div>

        <div class="border-inner">
            <div class="header">
                <h1 class="title">Certificate of Completion</h1>
                <p class="subtitle">Coding for MBA Curriculum</p>
            </div>

            <div class="content">
                <p class="presented-to">This certificate is proudly presented to</p>

                <div class="recipient-name">{name}</div>

                <p class="achievement">
                    For successfully completing<br>
                    <span class="phase-name">Phase {phase}: {phase_name}</span><br>
                    of the Coding for MBA comprehensive curriculum
                </p>

                <p style="font-size: 12pt; color: #7f8c8d; margin-top: 20px;">
                    {lessons_count} lessons • {phase_description}
                </p>
            </div>

            <div class="footer">
                <div class="signature-block">
                    <div class="signature-line">
                        Course Instructor
                    </div>
                </div>

                <div class="date">
                    Date of Completion:<br>
                    <strong>{date}</strong>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
"""

# Lesson counts and descriptions per phase
PHASE_DETAILS = {
    1: {
        "lessons": 20,
        "description": "Python fundamentals, data structures, and file handling",
    },
    2: {
        "lessons": 19,
        "description": "Data workflows, NumPy, Pandas, databases, APIs, and visualization",
    },
    3: {
        "lessons": 15,
        "description": "Machine learning fundamentals, regression, classification, and neural networks",
    },
    4: {
        "lessons": 13,
        "description": "Advanced ML, time series, transformers, deployment, and monitoring",
    },
    5: {
        "lessons": 17,
        "description": "Business Intelligence strategy, analytics, and career development",
    },
    6: {
        "lessons": 6,
        "description": "Advanced SQL, cloud BI, governance, and capstone project",
    },
    7: {
        "lessons": 18,
        "description": "SQL mastery, database design, optimization, and security",
    },
}


def generate_certificate_html(name: str, phase: int, date: Optional[str] = None) -> str:
    """Generate HTML certificate content."""
    if phase not in PHASE_NAMES:
        raise ValueError(f"Invalid phase: {phase}")

    if date is None:
        date = datetime.now().strftime("%B %d, %Y")

    details = PHASE_DETAILS[phase]

    html = CERTIFICATE_HTML_TEMPLATE.format(
        name=name,
        phase=phase,
        phase_name=PHASE_NAMES[phase],
        lessons_count=details["lessons"],
        phase_description=details["description"],
        date=date,
    )

    return html


def generate_certificate_pdf(
    name: str, phase: int, output_path: Path, date: Optional[str] = None
) -> bool:
    """Generate PDF certificate using WeasyPrint."""
    try:
        from weasyprint import HTML

        html_content = generate_certificate_html(name, phase, date)

        # Create output directory
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Generate PDF
        HTML(string=html_content).write_pdf(output_path)

        return True
    except ImportError:
        print("  ⚠️  WeasyPrint not available. Install with: pip install weasyprint")
        print(
            "  💡 On Linux, you may also need: sudo apt install libpango-1.0-0 libpangoft2-1.0-0"
        )
        return False
    except Exception as e:
        print(f"  ❌ Error generating PDF: {e}")
        return False


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Generate completion certificates")
    parser.add_argument("--name", type=str, required=True, help="Recipient name")
    parser.add_argument(
        "--phase",
        type=int,
        choices=list(PHASE_NAMES.keys()),
        required=True,
        help="Phase number (1-7)",
    )
    parser.add_argument("--date", type=str, help="Completion date (default: today)")
    parser.add_argument(
        "--output",
        type=str,
        default="artifacts/certs",
        help="Output directory (default: artifacts/certs)",
    )

    args = parser.parse_args()

    # Create filename
    safe_name = args.name.replace(" ", "_").replace("/", "_")
    filename = f"{safe_name}_phase_{args.phase}.pdf"
    output_path = Path(args.output) / filename

    print("=" * 60)
    print("📜 Certificate Generator")
    print("=" * 60)
    print(f"Recipient: {args.name}")
    print(f"Phase: {args.phase} - {PHASE_NAMES[args.phase]}")
    print(f"Output: {output_path}")
    print("")

    success = generate_certificate_pdf(args.name, args.phase, output_path, args.date)

    if success:
        size_kb = output_path.stat().st_size / 1024
        print(f"✅ Certificate generated: {output_path} ({size_kb:.1f} KB)")
        print("\n💡 Open the PDF to view your certificate!")
    else:
        print("❌ Certificate generation failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
