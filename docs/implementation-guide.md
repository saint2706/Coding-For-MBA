# Implementation Guide for Website Enhancements

This guide provides step-by-step instructions for implementing the recommended website improvements.

## Quick Start (Essential Features Only)

If you want to implement just the core features (JupyterLite + Progress Tracking), follow these
steps:

### 1. Install Required Dependencies

```bash
# Add to docs/requirements.txt
pip install jupyterlite-core>=0.3.0
pip install jupyterlite-pyodide-kernel>=0.3.0
pip install mkdocs-git-revision-date-localized-plugin
pip install mkdocs-minify-plugin
```

### 2. Integrate Files

Copy these new files to your repository:

- `docs/javascripts/pyodide-console.js` → Interactive Python console
- `docs/javascripts/progress-tracker.js` → Progress tracking
- `docs/stylesheets/interactive-widgets.css` → Styling for widgets
- `jupyter_lite_config.json` → JupyterLite configuration
- `tools/integrate_jupyterlite.py` → Build integration tool

### 3. Update MkDocs Configuration

Add to your `mkdocs.yml`:

```yaml
extra_css:
  - stylesheets/extra.css
  - stylesheets/interactive-widgets.css

extra_javascript:
  - https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js
  - javascripts/pyodide-console.js
  - javascripts/progress-tracker.js
```

### 4. Update GitHub Actions Workflow

Modify `.github/workflows/docs.yml`:

```yaml
- name: Install JupyterLite
  run: |
    pip install jupyterlite-core jupyterlite-pyodide-kernel

- name: Build JupyterLite
  run: python tools/integrate_jupyterlite.py

- name: Build MkDocs site
  run: mkdocs build --strict
```

### 5. Test Locally

```bash
# Build JupyterLite
python tools/integrate_jupyterlite.py

# Serve documentation
mkdocs serve

# Visit http://127.0.0.1:8000
```

______________________________________________________________________

## Phase 1: Interactive Notebooks (Week 1)

### JupyterLite Setup

#### Step 1: Install Dependencies

```bash
pip install jupyterlite-core jupyterlite-pyodide-kernel
```

#### Step 2: Configure JupyterLite

The `jupyter_lite_config.json` file is already created. Review and adjust:

```json
{
  "LiteBuildConfig": {
    "contents": ["Day_01_Introduction/", "Day_02_Variables_Builtin_Functions/", ...],
    "output_dir": "site/jupyterlite"
  }
}
```

#### Step 3: Build JupyterLite

```bash
# Manual build
jupyter lite build --output-dir site/jupyterlite

# Or use the integration script
python tools/integrate_jupyterlite.py
```

#### Step 4: Add Launch Buttons

The integration script automatically adds buttons, or manually add to lesson pages:

```markdown
## Interactive Notebooks

[🚀 Launch in JupyterLite](../../jupyterlite/lab?path=Day_01_Introduction/introduction.ipynb){ .md-button .md-button--primary }
```

#### Step 5: Test

1. Build the site: `mkdocs build`
1. Serve locally: `mkdocs serve`
1. Navigate to a lesson and click the JupyterLite button
1. Verify the notebook loads and runs Python code

### Binder Integration

#### Step 1: Create Binder Configuration

Create `.binder/environment.yml` or use existing `requirements.txt`:

```yaml
# .binder/environment.yml
name: coding-mba
channels:
  - conda-forge
  - defaults
dependencies:
  - python=3.13
  - numpy
  - pandas
  - matplotlib
  - scikit-learn
  - jupyter
```

Or just ensure `requirements.txt` is at the repository root.

#### Step 2: Add Binder Badges

The integration script adds these automatically, or add manually:

```markdown
[![Launch in Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_01_Introduction/introduction.ipynb)
```

#### Step 3: Test Binder

1. Click a Binder badge
1. Wait for environment to build (first time takes 5-10 minutes)
1. Verify notebook launches in JupyterLab

______________________________________________________________________

## Phase 2: Interactive Widgets (Week 2)

### Pyodide Console Setup

#### Step 1: Add JavaScript Files

Files already created:

- `docs/javascripts/pyodide-console.js`

#### Step 2: Add to MkDocs Config

```yaml
extra_javascript:
  - https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js
  - javascripts/pyodide-console.js
```

#### Step 3: Use in Lesson Pages

Mark code blocks as interactive:

````markdown
<div class="interactive-code">
```python
# This code will be executable!
print("Hello from Pyodide!")
````

</div>
```

Or use the widget directly:

```html
<div id="my-widget"></div>
<script>
  createInteractiveWidget(
    document.getElementById('my-widget'),
    'print("Interactive Python!")'
  );
</script>
```

#### Step 4: Test

1. Rebuild site
1. Visit a page with interactive code
1. Verify "Run Code" button appears
1. Click and verify code executes

### Progress Tracking Setup

#### Step 1: Add JavaScript

File already created:

- `docs/javascripts/progress-tracker.js`

#### Step 2: Add to MkDocs Config

```yaml
extra_javascript:
  - javascripts/progress-tracker.js
```

#### Step 3: Add CSS

File already created:

- `docs/stylesheets/interactive-widgets.css`

#### Step 4: Test

1. Rebuild and serve site
1. Navigate to any lesson page
1. Look for:
   - Progress widget in sidebar
   - "Mark as Complete" button
   - Progress percentage
1. Click "Mark as Complete"
1. Verify progress is saved (check localStorage in browser dev tools)
1. Refresh page and verify progress persists

______________________________________________________________________

## Phase 3: Enhanced Features (Week 3-4)

### Enhanced Search

#### Step 1: Update Search Plugin

```yaml
plugins:
  - search:
      lang: en
      separator: '[\s\-\.,;:!?\(\)\[\]\{\}]+'
      prebuild_index: true
      indexing: 'full'
```

#### Step 2: Index Notebook Content

Add to `tools/build_docs.py`:

```python
def extract_notebook_content(notebook_path: Path) -> str:
    """Extract searchable content from notebook."""
    import nbformat

    with open(notebook_path) as f:
        nb = nbformat.read(f, as_version=4)

    content = []
    for cell in nb.cells:
        if cell.cell_type in ('markdown', 'code'):
            content.append(cell.source)

    return '\n\n'.join(content)
```

### Git Revision Dates

#### Step 1: Install Plugin

```bash
pip install mkdocs-git-revision-date-localized-plugin
```

#### Step 2: Add to Config

```yaml
plugins:
  - git-revision-date-localized:
      enable_creation_date: true
      type: timeago
```

### Minification

#### Step 1: Install Plugin

```bash
pip install mkdocs-minify-plugin
```

#### Step 2: Add to Config

```yaml
plugins:
  - minify:
      minify_html: true
      minify_js: true
      minify_css: true
```

______________________________________________________________________

## Phase 4: Advanced Features (Week 5-6)

### Social Cards

```bash
pip install pillow cairosvg
```

```yaml
plugins:
  - social:
      cards: true
      cards_color:
        fill: "#667eea"
        text: "#FFFFFF"
```

### Tags System

```yaml
plugins:
  - tags:
      tags_file: tags.md
```

Add to lesson frontmatter:

```yaml
---
tags:
  - python-basics
  - data-structures
---
```

### Analytics (Privacy-Friendly)

For Plausible Analytics:

```html
<!-- Add to docs/overrides/main.html -->
<script defer data-domain="saint2706.github.io"
        src="https://plausible.io/js/script.js"></script>
```

______________________________________________________________________

## Testing Checklist

### Functional Testing

- [ ] JupyterLite launches successfully
- [ ] Notebooks load in JupyterLite
- [ ] Code executes in JupyterLite
- [ ] Binder badges work
- [ ] Pyodide console runs code
- [ ] Progress tracking saves/loads
- [ ] Progress persists across page loads
- [ ] Mark complete button works
- [ ] Interactive widgets display correctly

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announces interactive elements
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] ARIA labels are present
- [ ] Skip links work

### Performance Testing

- [ ] Page load time \< 3 seconds
- [ ] JupyterLite loads \< 30 seconds (first time)
- [ ] Search responds \< 1 second
- [ ] No console errors
- [ ] Mobile responsive

### Browser Testing

Test in:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

______________________________________________________________________

## Troubleshooting

### JupyterLite Won't Load

**Problem**: JupyterLite shows blank page or errors

**Solutions**:

1. Check browser console for errors
1. Verify browser supports WebAssembly
1. Clear browser cache
1. Try different browser
1. Check that `pyodide.js` CDN is accessible

### Notebooks Not Found in JupyterLite

**Problem**: Notebooks don't appear in JupyterLite file browser

**Solutions**:

1. Verify notebooks are in `Day_*` directories
1. Check `jupyter_lite_config.json` includes correct paths
1. Rebuild JupyterLite: `python tools/integrate_jupyterlite.py`
1. Verify notebooks are committed to git

### Progress Not Saving

**Problem**: Progress resets after page refresh

**Solutions**:

1. Check browser allows localStorage
1. Verify JavaScript is enabled
1. Check browser console for errors
1. Try different browser
1. Check if in private/incognito mode

### Pyodide Console Errors

**Problem**: Code won't execute in Pyodide console

**Solutions**:

1. Check code syntax
1. Verify required packages are available in Pyodide
1. Check browser console for specific errors
1. Some packages (like database connectors) won't work in browser
1. Try simpler code to verify Pyodide is working

### Build Fails

**Problem**: `mkdocs build` or JupyterLite build fails

**Solutions**:

1. Check all dependencies are installed
1. Verify Python version (3.11+ for JupyterLite)
1. Check for syntax errors in config files
1. Run with `--verbose` flag for detailed errors
1. Clear build cache: `rm -rf site/`

______________________________________________________________________

## Maintenance

### Regular Tasks (Monthly)

1. **Update dependencies**:

   ```bash
   pip install --upgrade jupyterlite-core jupyterlite-pyodide-kernel mkdocs-material
   ```

1. **Test JupyterLite**:

   - Launch a few notebooks
   - Verify common packages work
   - Check for console errors

1. **Review analytics**:

   - Check which lessons are popular
   - Identify issues from error logs
   - Review user feedback

### Quarterly Tasks

1. **Update Pyodide version**:

   - Check for new Pyodide releases
   - Update CDN URL in `mkdocs.yml`
   - Test thoroughly

1. **Review accessibility**:

   - Run Lighthouse audit
   - Test with screen reader
   - Check keyboard navigation

1. **Optimize performance**:

   - Review page load times
   - Optimize images
   - Minify assets

### Annual Tasks

1. **Major version updates**:

   - Update MkDocs Material
   - Update JupyterLite
   - Review breaking changes

1. **Comprehensive testing**:

   - Test all features
   - Check all browsers
   - Mobile testing

______________________________________________________________________

## Getting Help

### Resources

- **JupyterLite Docs**: https://jupyterlite.readthedocs.io/
- **MkDocs Material**: https://squidfunk.github.io/mkdocs-material/
- **Pyodide Docs**: https://pyodide.org/
- **Repository Issues**: https://github.com/saint2706/Coding-For-MBA/issues

### Community Support

- Open an issue on GitHub
- Check existing discussions
- Review documentation thoroughly

### Professional Support

For complex implementations, consider:

- Hiring a web developer familiar with MkDocs
- Consulting with JupyterLite community
- Using professional services for accessibility audits

______________________________________________________________________

## Next Steps

1. ✅ Review the recommendations document
1. ✅ Test sample implementations locally
1. ✅ Choose which features to implement first
1. ✅ Follow this guide for implementation
1. ✅ Test thoroughly before deploying
1. ✅ Deploy to GitHub Pages
1. ✅ Monitor and iterate based on feedback

Good luck with your implementation! 🚀
