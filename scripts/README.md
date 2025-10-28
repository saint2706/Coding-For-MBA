# Documentation Generation Scripts

This directory contains Python scripts for generating and maintaining the MkDocs documentation structure.

## Scripts Overview

### 1. `gen_nav.py` - Navigation Generator

Generates collapsible phase-based navigation structure for `mkdocs.yml`.

**Usage:**
```bash
# Dry run (preview changes)
python scripts/gen_nav.py

# Apply changes
python scripts/gen_nav.py --apply

# Use custom phase definitions
python scripts/gen_nav.py --phases phases.json --apply
```

**What it does:**
- Scans all `Day_XX_*` folders
- Groups lessons by phase (1-7)
- Generates structured navigation with collapsible phase groups
- Creates backup of `mkdocs.yml` as `mkdocs.yml.bak`

### 2. `gen_phase_overviews.py` - Phase Overview Generator

Creates overview pages for each curriculum phase.

**Usage:**
```bash
# Dry run
python scripts/gen_phase_overviews.py

# Apply changes
python scripts/gen_phase_overviews.py --apply
```

**What it does:**
- Generates `docs/phases/phase_X_overview.md` for phases 1-7
- Includes phase title, day range, intro, and lesson table
- Extracts lesson titles and descriptions from READMEs

**Output files:**
- `docs/phases/phase_1_overview.md`
- `docs/phases/phase_2_overview.md`
- ... through phase 7

### 3. `add_tags.py` - Tag Metadata Generator

Adds YAML front-matter tags to lesson README files.

**Usage:**
```bash
# Dry run
python scripts/add_tags.py

# Apply changes
python scripts/add_tags.py --apply
```

**What it does:**
- Scans all `Day_XX_*/README.md` files
- Detects tags based on folder name and content
- Adds YAML front-matter with tags if not present
- Creates `.bak` backups of modified files
- Skips files that already have tags

**Tag detection rules:**
- Phase 1 (Days 1-20): Python, Basics
- Phase 2 (Days 21-39): Data
- Phase 3 (Days 40-54): ML
- Phase 4 (Days 55-67): Advanced, ML
- Phase 5 (Days 68-84): BI
- Phase 6 (Days 85-90): BI, Advanced
- Phase 7 (Days 91-108): SQL
- Plus keyword-based detection for specific topics

### 4. `gen_lessons_index.py` - Interactive Lessons Index

Generates an interactive lessons index page with search and filtering.

**Usage:**
```bash
# Dry run
python scripts/gen_lessons_index.py

# Apply changes
python scripts/gen_lessons_index.py --apply
```

**What it does:**
- Creates `docs/lessons/index.md` with all lessons
- Includes client-side JavaScript for:
  - Text search
  - Tag-based filtering
  - Responsive design
- Generates `docs/site_metadata.json` with total lesson count

**Features:**
- Interactive search box
- Clickable tag filters
- Lesson cards with descriptions
- Mobile-responsive layout
- Dark mode support

### 5. `revert_nav_changes.py` - Rollback Tool

Safely reverts changes by restoring `.bak` backup files.

**Usage:**
```bash
# Preview what would be restored
python scripts/revert_nav_changes.py

# Restore backups
python scripts/revert_nav_changes.py --apply
```

**What it does:**
- Finds all `.bak` files in the repository
- Restores them to their original locations
- Removes backup files after restoration (unless `--keep-backups` is used)

## Workflow

### Initial Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements-dev.txt
   ```

2. **Run all scripts in sequence:**
   ```bash
   # Step 1: Add tags to lessons (dry run first)
   python scripts/add_tags.py
   python scripts/add_tags.py --apply
   
   # Step 2: Generate phase overviews
   python scripts/gen_phase_overviews.py
   python scripts/gen_phase_overviews.py --apply
   
   # Step 3: Generate lessons index
   python scripts/gen_lessons_index.py
   python scripts/gen_lessons_index.py --apply
   
   # Step 4: Update navigation (do this last)
   python scripts/gen_nav.py
   python scripts/gen_nav.py --apply
   ```

3. **Build and test:**
   ```bash
   mkdocs build --strict
   mkdocs serve
   ```

### Updating Documentation

When adding new lessons:

1. Create the `Day_XX_*` folder with README.md
2. Run the scripts in the same sequence as above
3. The navigation and indexes will be automatically updated

### Reverting Changes

If something goes wrong:

```bash
# Restore all backups
python scripts/revert_nav_changes.py --apply

# Then rebuild
mkdocs build --strict
```

## Safety Features

- **Dry run by default**: All scripts preview changes before applying
- **Automatic backups**: Modified files are backed up with `.bak` extension
- **Idempotent**: Scripts can be run multiple times safely
- **Rollback support**: `revert_nav_changes.py` can restore all backups

## Configuration

### Phase Definitions

Default phase ranges are defined in the scripts:

- Phase 1: Days 1-20 (Python Foundations)
- Phase 2: Days 21-39 (Data Analytics)
- Phase 3: Days 40-54 (ML Foundations)
- Phase 4: Days 55-67 (Advanced ML)
- Phase 5: Days 68-84 (Business Intelligence)
- Phase 6: Days 85-90 (BI Advanced & Capstone)
- Phase 7: Days 91-108 (SQL Mastery)

To override, create a JSON file:

```json
{
  "1": {
    "range": [1, 20],
    "name": "Custom Phase Name"
  }
}
```

Then run:
```bash
python scripts/gen_nav.py --phases custom_phases.json --apply
```

## Dependencies

- Python 3.10+
- PyYAML >= 6.0
- Jinja2 >= 3.1 (for future template extensions)

All dependencies are in `requirements-dev.txt`.

## Troubleshooting

### "No lessons found"

- Ensure you're running from repository root
- Check that `Day_XX_*` folders exist
- Verify folder names match pattern `Day_\d{2,3}_*`

### "mkdocs.yml not found"

- Run scripts from repository root: `python scripts/gen_nav.py`
- Or specify path: `python scripts/gen_nav.py --repo-root /path/to/repo`

### Navigation looks wrong

- Restore backup: `python scripts/revert_nav_changes.py --apply`
- Check `mkdocs.yml.bak` for comparison
- Re-run `gen_nav.py` with `--apply`

### Tags not appearing

- Ensure lesson READMEs exist
- Check that `add_tags.py` ran successfully
- Verify YAML front-matter format is correct
- Check `.bak` files to compare before/after

## Output Files

Scripts create/modify these files:

- `mkdocs.yml` - Updated navigation structure
- `docs/phases/phase_X_overview.md` - Phase overview pages (7 files)
- `docs/lessons/index.md` - Interactive lessons index
- `docs/site_metadata.json` - Metadata for progress tracker
- `Day_XX_*/README.md` - Updated with YAML front-matter tags
- Various `.bak` files - Backups of modified files

## Contributing

When modifying scripts:

1. Maintain idempotent behavior
2. Always create backups before modifying files
3. Support `--apply` flag for dry-run mode
4. Update this README with changes
5. Test with `--apply` on a clean clone

## High-Effort Feature Scripts

### 6. `generate_pdfs.py` - PDF & Bundle Generator

Generates downloadable PDFs and ZIP bundles of the curriculum.

**Usage:**
```bash
# Dry run (preview)
python scripts/generate_pdfs.py --all --dry-run

# Generate all PDFs and bundles
python scripts/generate_pdfs.py --all

# Generate specific phase
python scripts/generate_pdfs.py --phase 1
```

**What it does:**
- Converts markdown lessons to paginated PDFs using WeasyPrint
- Generates `artifacts/curriculum_full.pdf` (all lessons)
- Creates per-phase PDFs: `artifacts/curriculum_phase_N.pdf`
- Creates ZIP bundles with markdown + notebooks: `artifacts/bundles/phase_N.zip`

**Requirements:**
- WeasyPrint (`pip install weasyprint`)
- System dependencies for PDF generation (see script for details)

### 7. `add_binder_buttons.py` - Binder Integration

Adds "Open in Binder" buttons to lesson READMEs containing Jupyter notebooks.

**Usage:**
```bash
# Preview changes
python scripts/add_binder_buttons.py --dry-run

# Apply changes
python scripts/add_binder_buttons.py --apply
```

**What it does:**
- Scans for lessons with `.ipynb` files
- Injects Binder button markdown into README
- Creates backup files before modifying
- Skips lessons that already have Binder buttons

### 8. `generate_badge.py` - Badge Generator

Creates SVG badges for phase completion.

**Usage:**
```bash
# Generate specific phase badge
python scripts/generate_badge.py --phase 1

# Generate all badges
python scripts/generate_badge.py --all

# Custom output directory
python scripts/generate_badge.py --all --output custom/path/
```

**What it does:**
- Creates colorful SVG badges for each phase (1-7)
- Uses phase-specific colors and names
- Outputs to `generated/badges/` by default
- Shields.io-style design

### 9. `generate_certificate.py` - Certificate Generator

Generates PDF certificates for phase completion.

**Usage:**
```bash
# Generate certificate
python scripts/generate_certificate.py --name "John Doe" --phase 1

# With custom date
python scripts/generate_certificate.py --name "Jane Smith" --phase 3 --date "2024-02-15"

# Custom output directory
python scripts/generate_certificate.py --name "User" --phase 5 --output certs/
```

**What it does:**
- Creates professional PDF certificates using WeasyPrint
- Includes learner name, phase, and completion date
- Landscape A4 format with decorative elements
- Outputs to `artifacts/certs/` by default

**Requirements:**
- WeasyPrint for PDF generation

### 10. `generate_quiz_pages.py` - Quiz Page Generator

Generates interactive HTML quiz pages from YAML quiz files.

**Usage:**
```bash
# Generate all quiz pages
python scripts/generate_quiz_pages.py --all

# Generate specific quiz
python scripts/generate_quiz_pages.py --quiz Day_02

# Custom output directory
python scripts/generate_quiz_pages.py --all --output docs/quizzes/
```

**What it does:**
- Converts `quizzes/Day_XX_quiz.yml` to interactive HTML
- Embeds JavaScript for quiz functionality
- Tracks scores and sends results to learner backend
- Outputs to `docs/quizzes/` by default

**Quiz YAML Format:**
```yaml
questions:
  - question: "Question text?"
    options:
      - "Option A"
      - "Option B"
      - "Option C"
    answer: 0  # Correct option index
    explanation: "Why this is correct"

metadata:
  points: 5
  passing_score: 60
  tags: [python, fundamentals]
```

### 11. `extract_i18n.py` - Internationalization Extractor

Extracts translatable strings from lessons and docs for internationalization.

**Usage:**
```bash
# Extract to JSON format
python scripts/extract_i18n.py --output locales/en --format json

# Extract to POT format
python scripts/extract_i18n.py --output locales/en --format pot
```

**What it does:**
- Scans all lesson READMEs and docs for translatable text
- Excludes code blocks and technical content
- Generates locale templates (JSON or POT format)
- Creates Spanish template as example
- Outputs to `locales/en/messages.json` (or `.pot`)

### 12. `revert_high_effort.sh` - Rollback Script

Safely reverts all high-effort feature changes and restores backups.

**Usage:**
```bash
# Run from repository root
./scripts/revert_high_effort.sh
```

**What it does:**
- Restores all `.bak.*` backup files
- Removes generated directories (learner_backend, analytics, etc.)
- Removes generated files (PDFs, badges, certificates)
- Provides summary of reverted changes
- Idempotent and safe to run multiple times

## Analytics Scripts

### `analytics/report.py` - Analytics Report Generator

Generates reports from analytics events.

**Usage:**
```bash
# Generate reports from learner backend database
python analytics/report.py --input learner_backend/learner.db --output reports/

# View HTML report
open reports/index.html
```

**What it does:**
- Analyzes lesson popularity (page views)
- Calculates quiz performance (average scores, pass rates)
- Generates CSV report: `reports/lessons_popularity.csv`
- Creates HTML dashboard: `reports/index.html`

## Workflow for High-Effort Features

### Complete Setup

1. **Install all dependencies:**
   ```bash
   pip install -r requirements-dev.txt
   ```

2. **Generate PDFs and bundles:**
   ```bash
   python scripts/generate_pdfs.py --all
   ```

3. **Add Binder buttons:**
   ```bash
   python scripts/add_binder_buttons.py --apply
   ```

4. **Generate badges:**
   ```bash
   python scripts/generate_badge.py --all
   ```

5. **Generate sample certificate:**
   ```bash
   python scripts/generate_certificate.py --name "Sample User" --phase 1
   ```

6. **Create quiz pages:**
   ```bash
   python scripts/generate_quiz_pages.py --all
   ```

7. **Extract i18n strings:**
   ```bash
   python scripts/extract_i18n.py
   ```

8. **Start learner backend:**
   ```bash
   cd learner_backend
   python -m learner_backend.main
   ```

### Validation

Before committing:

```bash
# Check formatting
make format

# Run tests
pytest

# Build documentation
mkdocs build --strict

# Verify artifacts
ls -lh artifacts/*.pdf
ls -lh generated/badges/*.svg
ls -lh artifacts/certs/*.pdf
```

### Rollback

If needed, revert all changes:

```bash
./scripts/revert_high_effort.sh
```

## Dependencies Summary

### Core Scripts
- PyYAML >= 6.0
- Jinja2 >= 3.1

### High-Effort Features
- WeasyPrint >= 60.0 (PDFs and certificates)
- markdown2 >= 2.4.10 (Markdown to HTML)
- fastapi >= 0.104.0 (Learner backend)
- uvicorn >= 0.24.0 (ASGI server)

All dependencies are in `requirements-dev.txt`.

## License

Same as parent repository.
