#!/bin/bash
# run_quick_audit.sh - Run lesson verification and footer injection
#
# Usage:
#   ./scripts/run_quick_audit.sh           # Dry run (shows what would change)
#   ./scripts/run_quick_audit.sh --apply   # Apply changes

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

MODE="--dry-run"
if [[ "$1" == "--apply" ]]; then
    MODE=""
    echo "Running in APPLY mode - changes will be made"
else
    echo "Running in DRY RUN mode - no changes will be made"
    echo "Use: $0 --apply to apply changes"
fi

echo ""
echo "========================================================================"
echo "QUICK AUDIT: Lesson Verification and Footer Injection"
echo "========================================================================"
echo ""

# Step 1: Run verify_lessons.py
echo "Step 1: Verifying lessons and generating lesson lists..."
echo "------------------------------------------------------------------------"
if [[ -n "$MODE" ]]; then
    python3 scripts/verify_lessons.py $MODE
else
    python3 scripts/verify_lessons.py --apply
fi

echo ""
echo ""

# Step 2: Run inject_footers.py
echo "Step 2: Injecting/updating lesson footers..."
echo "------------------------------------------------------------------------"
python3 scripts/inject_footers.py $MODE

echo ""
echo ""

# Step 3: Show changed files if in apply mode
if [[ -z "$MODE" ]]; then
    echo "Step 3: Changed files..."
    echo "------------------------------------------------------------------------"
    git status --short
    echo ""
    echo "Review the changes above before committing."
fi

echo ""
echo "========================================================================"
echo "QUICK AUDIT COMPLETE"
echo "========================================================================"
