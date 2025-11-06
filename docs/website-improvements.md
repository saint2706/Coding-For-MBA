# Website Enhancement Recommendations

## Executive Summary

This document outlines comprehensive recommendations for enhancing the Coding-For-MBA GitHub Pages
website to make it more dynamic, accessible, and interactive. The primary focus is on embedding
Jupyter notebooks with runtime capabilities, improving accessibility, and creating a more engaging
learning experience.

## Current State Analysis

### Strengths

- ✅ MkDocs with Material theme provides excellent foundation
- ✅ Good accessibility CSS already in place
- ✅ Automated build pipeline with GitHub Actions
- ✅ Notebook conversion system exists
- ✅ Clean, organized lesson structure

### Limitations

- ✅ Interactive runtime available via JupyterLite (delivered)
- ❌ Users cannot execute code directly on the website
- ❌ Limited dynamic features
- ❌ No progress tracking or personalization
- ❌ Basic search functionality

## Status Snapshot (April 2024)

- ✅ **JupyterLite build is live** – `tools/integrate_jupyterlite.py` keeps the Lite manifest current and the docs workflows rebuild the assets on every deploy.
- ✅ **Binder badges are automated** – `tools/build_docs.py` injects Binder links for every notebook so lessons link directly to cloud runtimes.
- 🚧 **Pyodide widgets are prototyped** – `docs/javascripts/pyodide-console.js` ships an interactive widget, but no production lessons embed it yet.
- ✅ **Lesson progress tracking shipped** – `docs/javascripts/progress-tracker.js` and the MkDocs override add completion buttons and sidebar stats.
- 🚧 **Accessibility enhancements ongoing** – baseline focus/contrast styles live in `docs/stylesheets/extra.css`, yet skip links and broader ARIA coverage still need wiring.
- ⏳ **Thebe, enhanced search, quizzes, analytics, and feedback widgets** – configuration files and content for these features are not in the repo, so they remain future work.

______________________________________________________________________

## Recommended Improvements

### 1. Interactive Notebook Runtime (HIGH PRIORITY)

#### 1.1 JupyterLite Integration _(Status: ✅ Delivered)_

**What**: JupyterLite is a lightweight JupyterLab distribution that runs entirely in the browser
using WebAssembly.

**Benefits**:

- ✅ No server infrastructure required
- ✅ Works perfectly with GitHub Pages
- ✅ Full Jupyter experience in the browser
- ✅ Pre-installed packages available via Pyodide
- ✅ Can load notebooks from the repository

**Implementation Steps**:

1. **Install JupyterLite**:

   ```bash
   pip install jupyterlite-core jupyterlite-pyodide-kernel
   ```

1. **Create JupyterLite configuration** (`jupyter_lite_config.json`):

   ```json
   {
     "LiteBuildConfig": {
       "contents": ["Day_*/"],
       "ignore_sys_prefix": ["share"]
     },
     "PipliteAddon": {
       "piplite_urls": [
         "https://pypi.org/simple"
       ]
     }
   }
   ```

   > ✅ Update: `tools/integrate_jupyterlite.py` now regenerates the
   > `LiteBuildConfig.contents` manifest from the repository's `Day_*`
   > folders and sanity-checks that the latest lesson is included, so every
   > published lesson automatically appears in the JupyterLite runtime.

1. **Add build step to documentation workflow**:

   ```yaml
   - name: Build JupyterLite
     run: |
       jupyter lite build --contents . --output-dir site/jupyterlite
   ```

   > ℹ️ Automated: The `docs.yml` and `docs-ci.yml` workflows now call
   > `python tools/integrate_jupyterlite.py --build-only` immediately after
   > `mkdocs build --strict`, ensuring the Lite assets persist in the published
   > site.

1. **Add launch buttons to lesson pages**:

   ```markdown
   [🚀 Launch Interactive Notebook](../jupyterlite/lab?path=Day_01_Introduction/introduction.ipynb){ .md-button .md-button--primary }
   ```

**Estimated Effort**: 4-6 hours **Impact**: HIGH - Enables full interactive coding experience

#### 1.2 Thebe Integration _(Status: ⏳ Not started)_

> **Current state**: There is no Thebe configuration in `mkdocs.yml`, and `docs/javascripts/` only ships Pyodide and progress-tracker scripts. Implementing Thebe would still require adding the CDN assets and config file described below.

**What**: Thebe makes static HTML pages interactive by connecting code cells to a Jupyter kernel
(via Binder).

**Benefits**:

- ✅ Makes existing code blocks executable
- ✅ Less intrusive than full JupyterLite
- ✅ Good for simple examples

**Implementation**:

1. **Add Thebe JavaScript** to MkDocs extra_javascript:

   ```yaml
   extra_javascript:
     - https://unpkg.com/thebe@latest/lib/index.js
     - javascripts/thebe-config.js
   ```

1. **Create Thebe configuration** (`docs/javascripts/thebe-config.js`):

   ```javascript
   thebelab.on("ready", function() {
     thebelab.bootstrap({
       requestKernel: true,
       binderOptions: {
         repo: "saint2706/Coding-For-MBA",
         ref: "main",
       },
       kernelOptions: {
         name: "python3",
         kernelName: "python3",
       },
       selector: "div.executable",
     });
   });
   ```

1. **Mark code blocks as executable** in markdown:

   ````markdown
   <div class="executable" data-executable="true">
   ```python
   print("Hello, World!")
   ````

   </div>
   ```

**Estimated Effort**: 2-3 hours **Impact**: MEDIUM - Good for inline examples

#### 1.3 Binder Integration _(Status: ✅ Delivered)_

> **Current state**: `tools/build_docs.py` now injects Binder, Colab, and JupyterLite links for each notebook, and the generated lesson markdown already includes `[☁️ Run in Binder](https://mybinder.org/...)` buttons.

**What**: Add "Launch Binder" badges to open notebooks in a cloud environment.

**Benefits**:

- ✅ Full computing environment
- ✅ No browser limitations
- ✅ Can handle heavy computations

**Implementation**:

1. **Create Binder configuration files**:

   - `environment.yml` or `requirements.txt` at root
   - `.binder/` directory with configuration

1. **Add Binder badges to lesson pages**:

   ```markdown
   [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_01_Introduction/introduction.ipynb)
   ```

1. **Update build_docs.py** to automatically add badges:

   ```python
   def _add_binder_badge(day_dir: Path, notebook: Path) -> str:
       filepath = notebook.relative_to(ROOT)
       url = f"https://mybinder.org/v2/gh/{repo_slug}/main?filepath={filepath}"
       return f"[![Launch Binder](https://mybinder.org/badge_logo.svg)]({url})"
   ```

**Estimated Effort**: 1-2 hours **Impact**: MEDIUM - Good fallback option

______________________________________________________________________

### 2. Enhanced Interactivity

#### 2.1 Pyodide-based Interactive Code Widgets _(Status: 🚧 Prototype ready)_

> **Current state**: `docs/javascripts/pyodide-console.js` loads Pyodide and exposes `createInteractiveWidget`, but no production lesson under `docs/lessons/` instantiates the widget yet. Additional content updates are needed to roll it out broadly.

**What**: Embed lightweight Python interpreters directly in pages using Pyodide.

**Implementation**:

1. **Add Pyodide loader** (`docs/javascripts/pyodide-console.js`):

   ```javascript
   async function initPyodide() {
     let pyodide = await loadPyodide();
     return pyodide;
   }

   async function runPython(code) {
     const pyodide = await initPyodide();
     try {
       let result = await pyodide.runPython(code);
       return result;
     } catch (err) {
       return `Error: ${err}`;
     }
   }
   ```

1. **Create interactive code widget component**:

   ```html
   <div class="pyodide-console">
     <textarea id="code-input" rows="5"></textarea>
     <button onclick="executeCode()">Run Code</button>
     <pre id="code-output"></pre>
   </div>
   ```

**Estimated Effort**: 4-5 hours **Impact**: HIGH - Great for quick examples

#### 2.2 Interactive Quizzes and Exercises _(Status: ⏳ Not started)_

> **Current state**: MkDocs is not configured with a quiz plugin, and there is no `docs/quizzes/` content yet.

**What**: Add self-assessment tools to lessons.

**Implementation**:

1. **Use MkDocs plugins**:

   ```yaml
   plugins:
     - quiz:
         questions_dir: docs/quizzes
   ```

1. **Create quiz files** in YAML format:

   ```yaml
   questions:
     - question: "What is the output of `print(2 + 2)`?"
       answers:
         - "4"
         - "22"
         - "Error"
       correct: 0
       explanation: "Python evaluates 2 + 2 as 4"
   ```

**Estimated Effort**: 6-8 hours (including content creation) **Impact**: MEDIUM - Improves learning
outcomes

#### 2.3 Progress Tracking _(Status: ✅ Delivered)_

> **Current state**: `docs/javascripts/progress-tracker.js` injects a completion button and sidebar widget on lesson pages, and `docs/overrides/main.html` ensures the script is loaded site-wide.

**What**: Track lesson completion using localStorage.

**Implementation**:

1. **Add progress tracking JavaScript** (`docs/javascripts/progress-tracker.js`):

   ```javascript
   class ProgressTracker {
     constructor() {
       this.storageKey = 'coding-mba-progress';
     }

     markComplete(lessonId) {
       let progress = this.getProgress();
       progress[lessonId] = {
         completed: true,
         timestamp: Date.now()
       };
       localStorage.setItem(this.storageKey, JSON.stringify(progress));
       this.updateUI();
     }

     getProgress() {
       return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
     }

     calculatePercentage() {
       const total = 67; // Total lessons
       const completed = Object.keys(this.getProgress()).length;
       return Math.round((completed / total) * 100);
     }
   }
   ```

1. **Add UI elements**:

   ```html
   <div class="progress-badge">
     <span id="progress-percentage">0%</span> Complete
   </div>
   <button onclick="progressTracker.markComplete(currentLesson)">
     ✓ Mark as Complete
   </button>
   ```

**Estimated Effort**: 3-4 hours **Impact**: MEDIUM - Motivates learners

______________________________________________________________________

### 3. Accessibility Enhancements

#### 3.1 ARIA Labels and Semantic HTML _(Status: 🚧 Partial)_

> **Current state**: Interactive scripts add targeted ARIA attributes, but layout overrides do not yet inject skip links or broader semantic wrappers.

**Current**: Good foundation exists in `extra.css`

**Enhancements**:

1. **Add ARIA labels to interactive elements**:

   ```html
   <button
     aria-label="Run Python code in browser"
     aria-describedby="code-output">
     Run Code
   </button>
   ```

1. **Enhance keyboard navigation**:

   ```javascript
   // Add keyboard shortcuts
   document.addEventListener('keydown', (e) => {
     if (e.ctrlKey && e.key === 'Enter') {
       executeCode();
     }
   });
   ```

1. **Add skip links for interactive components**:

   ```html
   <a href="#main-content" class="skip-link">
     Skip to main content
   </a>
   <a href="#interactive-console" class="skip-link">
     Skip to interactive console
   </a>
   ```

**Estimated Effort**: 2-3 hours **Impact**: HIGH - Legal compliance and inclusivity

#### 3.2 Screen Reader Support _(Status: 🚧 Partial)_

> **Current state**: The Pyodide widget exposes `aria-live="polite"` output regions, yet dedicated status containers and descriptive labelling for notebook embeds still need to be added.

**Implementation**:

1. **Add live regions for dynamic content**:

   ```html
   <div role="status" aria-live="polite" aria-atomic="true" id="code-status">
     <!-- Status messages appear here -->
   </div>
   ```

1. **Add descriptive labels to code blocks**:

   ````markdown
   ```python title="Example: Calculate Business Metrics" aria-label="Python code example showing calculation of revenue metrics"
   revenue = 1000000
   costs = 750000
   profit = revenue - costs
   ````

   ```

   ```

**Estimated Effort**: 2 hours **Impact**: MEDIUM - Improves screen reader experience

#### 3.3 Color Contrast and Visual Improvements _(Status: 🚧 Partial)_

> **Current state**: `docs/stylesheets/extra.css` improves focus states and code contrast, but a high-contrast palette toggle has not been configured in `mkdocs.yml`.

**Enhancements**:

1. **Add high-contrast theme option**:

   ```yaml
   theme:
     palette:
       - scheme: slate-high-contrast
         primary: blue
         accent: yellow
   ```

1. **Improve code block contrast** in `extra.css`:

   ```css
   /* High contrast mode for code blocks */
   @media (prefers-contrast: high) {
     .md-typeset code {
       background-color: #000;
       color: #fff;
       border: 2px solid #fff;
     }
   }
   ```

**Estimated Effort**: 1-2 hours **Impact**: MEDIUM - Helps visually impaired users

______________________________________________________________________

### 4. Search and Discovery Improvements

#### 4.1 Enhanced Search with Notebook Content _(Status: ⏳ Not started)_

> **Current state**: `mkdocs.yml` still uses the default `search` plugin configuration, and no preprocessing scripts extract notebook cell text for indexing.

**What**: Index notebook content in search.

**Implementation**:

1. **Add search plugin with custom configuration**:

   ```yaml
   plugins:
     - search:
         lang: en
         separator: '[\s\-\.]+'
         indexing: 'full'
         prebuild_index: true
   ```

1. **Index notebook cells during build**:

   ````python
   def extract_searchable_content(notebook_path: Path) -> str:
       """Extract text from notebook cells for search indexing."""
       with open(notebook_path) as f:
           nb = nbformat.read(f, as_version=4)

       content = []
       for cell in nb.cells:
           if cell.cell_type == 'markdown':
               content.append(cell.source)
           elif cell.cell_type == 'code':
               content.append(f"```python\n{cell.source}\n```")

       return "\n\n".join(content)
   ````

**Estimated Effort**: 3-4 hours **Impact**: HIGH - Better content discovery

#### 4.2 Advanced Search Filters

**What**: Add filters for lesson type, difficulty, topics.

**Implementation**:

1. **Add metadata to lesson pages**:

   ```yaml
   ---
   tags:
     - python-basics
     - data-structures
   difficulty: beginner
   estimated_time: 30min
   ---
   ```

1. **Create search UI with filters**:

   ```javascript
   class SearchFilter {
     filterByTag(tag) {
       // Filter search results by tag
     }

     filterByDifficulty(level) {
       // Filter by difficulty
     }
   }
   ```

**Estimated Effort**: 4-5 hours **Impact**: MEDIUM - Improved navigation

______________________________________________________________________

### 5. Dynamic Features and User Experience

#### 5.1 Estimated Reading/Completion Time _(Status: ⏳ Not started)_

> **Current state**: `tools/build_docs.py` does not yet estimate or surface reading time metadata.

**What**: Show estimated time for each lesson.

**Implementation**:

1. **Calculate during build**:

   ```python
   def estimate_reading_time(content: str) -> int:
       """Estimate reading time in minutes."""
       words = len(content.split())
       # Average reading speed: 200-250 words per minute
       return max(1, words // 225)
   ```

1. **Add to lesson metadata**:

   ```markdown
   !!! info "Lesson Overview"
       **Estimated Time**: 25 minutes
       **Difficulty**: Intermediate
       **Prerequisites**: Day 22 (NumPy)
   ```

**Estimated Effort**: 1-2 hours **Impact**: LOW - Nice to have

#### 5.2 Related Lessons and Prerequisites _(Status: ⏳ Not started)_

> **Current state**: No prerequisite graph or navigation injections exist in the build pipeline today.

**What**: Show lesson relationships and prerequisites.

**Implementation**:

1. **Define relationships in config**:

   ```python
   LESSON_PREREQS = {
       "Day_23_Pandas": ["Day_22_NumPy"],
       "Day_24_Pandas_Advanced": ["Day_23_Pandas"],
   }
   ```

1. **Generate navigation links**:

   ```markdown
   ## Prerequisites
   - [Day 22: NumPy](day-22-numpy.md)

   ## What's Next
   - [Day 24: Advanced Pandas](day-24-pandas-advanced.md)
   ```

**Estimated Effort**: 2-3 hours **Impact**: MEDIUM - Better learning path

#### 5.3 Code Playground Sidebar _(Status: ⏳ Not started)_

> **Current state**: Only the Pyodide widget is available; there is no persistent sidebar implementation in the overrides.

**What**: Persistent code playground sidebar for experimentation.

**Implementation**:

1. **Add sidebar widget**:

   ```html
   <div class="playground-sidebar">
     <h3>Quick Playground</h3>
     <textarea id="playground-code"></textarea>
     <button onclick="runPlayground()">Run</button>
     <pre id="playground-output"></pre>
   </div>
   ```

1. **Make it sticky**:

   ```css
   .playground-sidebar {
     position: sticky;
     top: 80px;
     max-height: calc(100vh - 100px);
     overflow-y: auto;
   }
   ```

**Estimated Effort**: 3-4 hours **Impact**: MEDIUM - Encourages experimentation

#### 5.4 Export/Share Features _(Status: ⏳ Not started)_

> **Current state**: Aside from the progress-tracker export/import utilities, there are no share buttons or code exporters yet.

**What**: Allow users to export code snippets or share lessons.

**Implementation**:

1. **Add export buttons**:

   ```javascript
   function exportCode() {
     const code = document.getElementById('code-input').value;
     const blob = new Blob([code], { type: 'text/x-python' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = 'my_code.py';
     a.click();
   }
   ```

1. **Add share buttons**:

   ```html
   <button onclick="shareLesson()">
     Share this lesson
   </button>
   ```

**Estimated Effort**: 2 hours **Impact**: LOW - Social features

______________________________________________________________________

### 6. Analytics and Feedback

#### 6.1 Anonymous Usage Analytics _(Status: ⏳ Not started)_

> **Current state**: No analytics provider is configured in `mkdocs.yml`, and no tracking snippet is present in the overrides.

**What**: Track which lessons are most popular (privacy-respecting).

**Implementation**:

1. **Use Plausible or similar privacy-friendly analytics**:

   ```yaml
   extra:
     analytics:
       provider: custom
       property: plausible
   ```

1. **Add to site**:

   ```html
   <script defer data-domain="saint2706.github.io"
           src="https://plausible.io/js/script.js"></script>
   ```

**Estimated Effort**: 1 hour **Impact**: LOW - Helps improve content

#### 6.2 Feedback Widget _(Status: ⏳ Not started)_

> **Current state**: There is no feedback UI in the overrides or JavaScript assets yet.

**What**: Allow users to provide feedback on lessons.

**Implementation**:

1. **Add simple feedback form**:

   ```html
   <div class="feedback-widget">
     <p>Was this lesson helpful?</p>
     <button onclick="submitFeedback('yes')">👍 Yes</button>
     <button onclick="submitFeedback('no')">👎 No</button>
   </div>
   ```

1. **Store in GitHub Issues or external service**:

   ```javascript
   async function submitFeedback(rating) {
     const lesson = getCurrentLesson();
     // Send to backend or create GitHub issue
   }
   ```

**Estimated Effort**: 2-3 hours **Impact**: MEDIUM - Helps content improvement

______________________________________________________________________

## Implementation Priorities

### Phase 1: Essential (Week 1-2)

- ✅ **JupyterLite integration** – automated via `tools/integrate_jupyterlite.py` and the `docs.yml` workflow.
- ✅ **Binder badges** – generated by `tools/build_docs.py` across all lessons.
- 🚧 **Accessibility improvements** – base focus/contrast styles exist, but skip links and semantic wrappers are pending.
- ✅ **Progress tracking** – live through `docs/javascripts/progress-tracker.js` and the MkDocs override hook.

**Estimated Total**: 12-16 hours

### Phase 2: Enhanced Experience (Week 3-4)

- ⏳ **Thebe integration** – awaiting configuration and asset wiring.
- 🚧 **Pyodide code widgets** – runtime shipped, lesson adoption still outstanding.
- ⏳ **Enhanced search** – notebook indexing and plugin tuning not yet started.
- ⏳ **Related lessons navigation** – prerequisite graph generation still to do.

**Estimated Total**: 12-15 hours

### Phase 3: Nice to Have (Week 5-6)

- ⏳ **Interactive quizzes** – quiz content and plugin configuration remain TODO.
- ⏳ **Code playground sidebar** – no persistent sidebar or styling implemented yet.
- ⏳ **Analytics and feedback** – instrumentation and feedback widget still outstanding.
- ⏳ **Export/share features** – beyond progress export/import, sharing utilities are not implemented.

**Estimated Total**: 12-15 hours

______________________________________________________________________

## Technical Requirements

### Dependencies to Add

**Python packages** (`docs/requirements.txt`):

```txt
mkdocs-material>=9.5.16
jupyterlite-core>=0.3.0
jupyterlite-pyodide-kernel>=0.3.0
mkdocs-jupyter>=0.24.0
```

**JavaScript libraries** (via CDN):

```yaml
extra_javascript:
  - https://unpkg.com/thebe@latest/lib/index.js
  - https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js
  - javascripts/pyodide-console.js
  - javascripts/thebe-config.js
  - javascripts/progress-tracker.js
```

**MkDocs plugins**:

```yaml
plugins:
  - search:
      lang: en
      indexing: 'full'
  - mkdocs-jupyter:
      include_source: true
      execute: false
```

______________________________________________________________________

## Maintenance Considerations

### 1. JupyterLite Updates

- **Frequency**: Quarterly
- **Effort**: 1-2 hours
- **Tasks**: Update Pyodide packages, rebuild lite distribution

### 2. Content Updates

- **Frequency**: As lessons are added/modified
- **Effort**: Automatic via CI/CD
- **Tasks**: Ensure new notebooks are properly indexed

### 3. Dependency Management

- **Frequency**: Monthly
- **Effort**: 1 hour
- **Tasks**: Update JavaScript libraries, Python packages

### 4. Analytics Review

- **Frequency**: Monthly
- **Effort**: 1 hour
- **Tasks**: Review usage patterns, identify popular content

______________________________________________________________________

## Cost Analysis

### Infrastructure Costs

- **GitHub Pages**: FREE ✅
- **JupyterLite**: FREE ✅ (runs client-side)
- **Binder**: FREE ✅ (open service)
- **CDN for JavaScript**: FREE ✅
- **Total**: $0/month

### Development Costs

- **Phase 1**: 12-16 hours
- **Phase 2**: 12-15 hours
- **Phase 3**: 12-15 hours
- **Total**: 36-46 hours initial development

### Maintenance Costs

- **Monthly**: 2-3 hours
- **Quarterly**: 5-6 hours (includes updates)

______________________________________________________________________

## Success Metrics

> Instrumentation for these metrics is pending; treat them as target measurements once analytics and feedback tooling are in place.

### User Engagement (targets)

- ⏳ Time spent on lesson pages
- ⏳ Number of code executions
- ⏳ Lesson completion rate
- ⏳ Return visitor rate

### Technical Metrics (current monitoring)

- ✅ Page load time (\<3 seconds)
- 🚧 Interactive runtime initialization (\<5 seconds) – measure once Pyodide widgets roll out.
- 🚧 Accessibility score (>95 on Lighthouse) – depends on completing the accessibility backlog.
- ⏳ Search response time (\<1 second) – enhanced indexing not yet implemented.

### Learning Outcomes (targets)

- ⏳ Lesson completion rate (requires progress tracker analytics export)
- ⏳ Quiz scores (awaits quiz rollout)
- ⏳ User feedback ratings (awaits feedback widget)
- ✅ GitHub repository stars/forks

______________________________________________________________________

## Accessibility Compliance Status

Current coverage:

- 🚧 **WCAG 2.1 Level AA** – focus/contrast improvements exist, but skip links and comprehensive labelling still need to land.
- 🚧 **Section 508** – underlying Material theme support is strong; the remaining tasks mirror the WCAG gaps above.
- 🚧 **ARIA 1.2** – interactive widgets add ARIA attributes, yet additional structural roles remain TODO.
- ✅ **Keyboard navigation support** – baseline keyboard navigation works via MkDocs Material, with focus states enhanced in `extra.css`.
- 🚧 **Screen reader compatibility** – dynamic content exposes polite live regions, but page-level status summaries still need to be added.

______________________________________________________________________

## Browser Compatibility

### Supported Browsers

- ✅ Chrome/Edge 90+ (JupyterLite requires modern browsers)
- ✅ Firefox 88+
- ✅ Safari 14+
- ❌ Internet Explorer (not supported)

### Fallbacks

- Static HTML for unsupported browsers
- Binder links as alternative
- Download notebook option

______________________________________________________________________

## Next Steps

### Immediate Actions

- Validate the existing JupyterLite build, Binder badges, and progress tracker UX on production.
- Document outstanding accessibility gaps (skip links, semantic regions) and prioritise fixes.
- Review the Pyodide widget prototype and decide on the first lessons that should embed it.
- Confirm ownership and timeline for the remaining roadmap items (Thebe, search, analytics).

### Short Term (1-2 weeks)

- Decide whether to proceed with Thebe and, if so, add the required assets/configuration.
- Embed the Pyodide widget into a pilot set of lessons and gather learner feedback.
- Finish the accessibility work: skip links, ARIA labelling, and keyboard shortcuts.
- Design the data structures needed for enhanced search and related-lesson navigation.

### Medium Term (3-4 weeks)

- Implement notebook-aware search indexing and prerequisite mapping in the docs build.
- Stand up analytics/feedback instrumentation (e.g., Plausible + lightweight feedback widget).
- Finalise quiz tooling/content strategy and prepare the first batch of assessments.
- Run targeted user testing on the new interactive experiences.

### Long Term (5-6 weeks)

- Build optional enhancements such as the code playground sidebar and sharing/export utilities.
- Launch quizzes and related-lesson navigation across the curriculum.
- Review analytics data to drive continuous improvement of interactive content.
- Establish an ongoing cadence for UX/accessibility audits and feature iterations.

______________________________________________________________________

## Resources and References

### JupyterLite

- Documentation: https://jupyterlite.readthedocs.io/
- Examples: https://jupyterlite.github.io/demo/
- GitHub: https://github.com/jupyterlite/jupyterlite

### Thebe

- Documentation: https://thebe.readthedocs.io/
- Examples: https://thebe.readthedocs.io/en/stable/examples.html

### Binder

- Documentation: https://mybinder.org/
- Example repository: https://github.com/binder-examples/

### Accessibility

- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Practices: https://www.w3.org/WAI/ARIA/apg/

### MkDocs Material

- Documentation: https://squidfunk.github.io/mkdocs-material/
- Plugins: https://github.com/mkdocs/catalog

______________________________________________________________________

## Conclusion

These recommendations provide a comprehensive roadmap for transforming the Coding-For-MBA
documentation site into an interactive, accessible, and engaging learning platform. The phased
approach allows for incremental improvements while maintaining the current functionality.

**Key Benefits**:

- 🚀 Interactive notebooks run directly in the browser
- ♿ Enhanced accessibility for all learners
- 📊 Better tracking and personalization
- 🎯 Improved learning outcomes
- 💰 Zero infrastructure costs

**Next step**: Review this proposal and decide which features to prioritize for implementation.
