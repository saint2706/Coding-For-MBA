"""Command-line entry point for running the Day 35 Flask app."""

from __future__ import annotations

import os

from . import create_app


def main() -> None:
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)


if __name__ == "__main__":
    main()
