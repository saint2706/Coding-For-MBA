#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web / remote environments.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

if ! command -v graphify >/dev/null 2>&1; then
  pip install graphifyy -q
fi

npm install
