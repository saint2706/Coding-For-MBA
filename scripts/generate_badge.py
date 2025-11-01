#!/usr/bin/env python3
"""
Generate SVG badge images for phase completion.

Creates colorful, shields.io-style badges for each phase that can be displayed
on the dashboard or downloaded by learners.

Usage:
    python scripts/generate_badge.py --phase 1           # Generate Phase 1 badge
    python scripts/generate_badge.py --all               # Generate all phase badges
    python scripts/generate_badge.py --output badges/    # Custom output directory
"""

import argparse
import sys
from pathlib import Path

# Phase names and colors
PHASE_INFO = {
    1: {"name": "Python Foundations", "color": "#3498db"},
    2: {"name": "Data Workflows", "color": "#2ecc71"},
    3: {"name": "ML Fundamentals", "color": "#9b59b6"},
    4: {"name": "Advanced ML & MLOps", "color": "#e74c3c"},
    5: {"name": "Business Intelligence", "color": "#f39c12"},
    6: {"name": "Advanced BI", "color": "#1abc9c"},
    7: {"name": "SQL & Database Mastery", "color": "#34495e"},
}

SVG_TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="28">
  <defs>
    <linearGradient id="grad{phase}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:{color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{color_dark};stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="{width}" height="28" rx="4" fill="url(#grad{phase})"/>

  <!-- Shadow -->
  <rect x="2" y="2" width="{width}" height="24" rx="3" fill="black" opacity="0.1"/>

  <!-- Badge content -->
  <g>
    <!-- Icon -->
    <text x="14" y="19" font-family="Arial, sans-serif" font-size="18" fill="white">🏆</text>

    <!-- Phase label -->
    <text x="38" y="19" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white">
      Phase {phase}
    </text>

    <!-- Phase name -->
    <text x="{name_x}" y="19" font-family="Arial, sans-serif" font-size="11" fill="white" opacity="0.9">
      {name}
    </text>
  </g>

  <!-- Checkmark -->
  <circle cx="{check_x}" cy="14" r="8" fill="white" opacity="0.3"/>
  <text x="{check_x}" y="18" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">✓</text>
</svg>"""


def darken_color(hex_color: str, factor: float = 0.8) -> str:
    """Darken a hex color for gradient effect."""
    hex_color = hex_color.lstrip("#")
    r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
    r, g, b = int(r * factor), int(g * factor), int(b * factor)
    return f"#{r:02x}{g:02x}{b:02x}"


def generate_badge_svg(phase: int) -> str:
    """Generate SVG badge for a specific phase."""
    if phase not in PHASE_INFO:
        raise ValueError(f"Invalid phase: {phase}")

    info = PHASE_INFO[phase]
    name = info["name"]
    color = info["color"]
    color_dark = darken_color(color)

    # Calculate width based on text length
    base_width = 110
    text_width = len(name) * 6.5
    width = int(base_width + text_width)

    # Calculate positions
    name_x = 95
    check_x = width - 20

    svg = SVG_TEMPLATE.format(
        width=width,
        phase=phase,
        color=color,
        color_dark=color_dark,
        name=name,
        name_x=name_x,
        check_x=check_x,
    )

    return svg


def save_badge(phase: int, output_dir: Path) -> Path:
    """Generate and save a badge to file."""
    output_dir.mkdir(parents=True, exist_ok=True)

    svg_content = generate_badge_svg(phase)
    output_path = output_dir / f"phase_{phase}_badge.svg"
    output_path.write_text(svg_content, encoding="utf-8")

    return output_path


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Generate phase completion badges")
    parser.add_argument(
        "--phase", type=int, choices=list(PHASE_INFO.keys()), help="Phase number (1-7)"
    )
    parser.add_argument("--all", action="store_true", help="Generate all phase badges")
    parser.add_argument(
        "--output",
        type=str,
        default="generated/badges",
        help="Output directory (default: generated/badges)",
    )

    args = parser.parse_args()

    if not args.all and args.phase is None:
        parser.print_help()
        print("\n❌ Error: Specify --phase N or --all")
        sys.exit(1)

    output_dir = Path(args.output)

    print("=" * 60)
    print("🏆 Badge Generator")
    print("=" * 60)

    generated = []

    if args.all:
        for phase in PHASE_INFO.keys():
            output_path = save_badge(phase, output_dir)
            size_kb = output_path.stat().st_size / 1024
            print(
                f"✅ Generated Phase {phase}: {output_path} ({size_kb:.1f} KB) - {PHASE_INFO[phase]['name']}"
            )
            generated.append(str(output_path))
    else:
        output_path = save_badge(args.phase, output_dir)
        size_kb = output_path.stat().st_size / 1024
        print(
            f"✅ Generated Phase {args.phase}: {output_path} ({size_kb:.1f} KB) - {PHASE_INFO[args.phase]['name']}"
        )
        generated.append(str(output_path))

    print("\n" + "=" * 60)
    print(f"📊 Summary: {len(generated)} badge(s) generated")
    print("=" * 60)
    print("\n💡 View badges by opening the SVG files in a browser")


if __name__ == "__main__":
    main()
