#!/usr/bin/env bash
#
# Rollback script for high-effort product features
# Restores .bak files and removes generated artifacts
# Must be run from repository root
#

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "🔄 High-Effort Feature Rollback Script"
echo "========================================"
echo ""

# Verify we're in the repo root
if [[ ! -f "mkdocs.yml" ]] || [[ ! -d ".git" ]]; then
    echo "❌ Error: Must run from repository root"
    exit 1
fi

echo "📂 Working directory: $REPO_ROOT"
echo ""

# Counter for restored files
RESTORED=0
REMOVED_DIRS=0
REMOVED_FILES=0

# Restore .bak files
echo "🔍 Looking for backup files..."
if find . -name "*.bak.*" -type f | grep -q .; then
    while IFS= read -r backup_file; do
        original_file=$(echo "$backup_file" | sed 's/\.bak\.[0-9]*$//')
        if [[ -f "$original_file" ]]; then
            echo "  ↩️  Restoring: $original_file"
            cp "$backup_file" "$original_file"
            rm "$backup_file"
            ((RESTORED++))
        else
            echo "  ⚠️  Original not found, keeping backup: $backup_file"
        fi
    done < <(find . -name "*.bak.*" -type f)
else
    echo "  ℹ️  No backup files found"
fi

echo ""
echo "🗑️  Removing generated directories..."

# List of directories to remove
DIRS_TO_REMOVE=(
    "learner_backend"
    "binder"
    "jupyterlite"
    "analytics"
    "locales"
    "projects"
    "quizzes"
    "artifacts/bundles"
    "generated/badges"
    "reports"
)

for dir in "${DIRS_TO_REMOVE[@]}"; do
    if [[ -d "$dir" ]]; then
        echo "  🗑️  Removing: $dir"
        rm -rf "$dir"
        ((REMOVED_DIRS++))
    fi
done

echo ""
echo "🗑️  Removing generated files..."

# List of files to remove
FILES_TO_REMOVE=(
    "artifacts/curriculum_full.pdf"
    "artifacts/curriculum_phase_1.pdf"
    "artifacts/curriculum_phase_2.pdf"
    "artifacts/curriculum_phase_3.pdf"
    "artifacts/curriculum_phase_4.pdf"
    "artifacts/curriculum_phase_5.pdf"
    "artifacts/curriculum_phase_6.pdf"
    "artifacts/curriculum_phase_7.pdf"
    ".github/workflows/docs-ci.yml"
    ".github/workflows/deploy-certs.yml"
    "docs/assets/js/notebook-links.js"
    "docs/dashboard/README.md"
    "docs/analytics.md"
    "docs/i18n.md"
    "docs/index.es.md"
)

for file in "${FILES_TO_REMOVE[@]}"; do
    if [[ -f "$file" ]]; then
        echo "  🗑️  Removing: $file"
        rm "$file"
        ((REMOVED_FILES++))
    fi
done

# Remove generated scripts (keep this script)
GENERATED_SCRIPTS=(
    "scripts/generate_pdfs.py"
    "scripts/add_binder_buttons.py"
    "scripts/generate_badge.py"
    "scripts/generate_certificate.py"
    "scripts/generate_quiz_pages.py"
    "scripts/adaptive_engine.py"
    "scripts/extract_i18n.py"
)

for script in "${GENERATED_SCRIPTS[@]}"; do
    if [[ -f "$script" ]]; then
        echo "  🗑️  Removing: $script"
        rm "$script"
        ((REMOVED_FILES++))
    fi
done

echo ""
echo "✅ Rollback complete!"
echo "   Restored files: $RESTORED"
echo "   Removed directories: $REMOVED_DIRS"
echo "   Removed files: $REMOVED_FILES"
echo ""
echo "💡 Next steps:"
echo "   1. Review the changes: git status"
echo "   2. If satisfied, commit: git add -A && git commit -m 'Revert high-effort features'"
echo "   3. Push changes: git push"
echo ""
