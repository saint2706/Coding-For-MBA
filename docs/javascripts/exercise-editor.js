/**
 * Interactive Exercise Editor using CodeMirror 5 and Pyodide
 * LeetCode/HackerRank-style code editor with auto-grading
 */

class ExerciseEditor {
  constructor(container, options = {}) {
    this.container = container;
    this.exerciseId = options.exerciseId || '';
    this.starterCode = options.starterCode || '';
    this.testCases = options.testCases || [];
    this.hints = options.hints || [];
    this.currentHintIndex = 0;
    this.editor = null;
    this.isRunning = false;

    this.init();
  }

  init() {
    this.render();
    this.setupEditor();
    this.setupEventListeners();
  }

  render() {
    const widgetId = `exercise-${this.exerciseId}-${Math.random().toString(36).substr(2, 9)}`;
    this.widgetId = widgetId;

    this.container.innerHTML = `
      <div class="exercise-widget" id="${widgetId}" data-exercise-id="${this.exerciseId}">
        <div class="exercise-header">
          <div class="exercise-info">
            <span class="exercise-badge">Exercise</span>
            <span class="exercise-id">${this.exerciseId}</span>
          </div>
          <div class="exercise-controls">
            <button class="hint-btn" title="Get a hint">
              💡 Hint
            </button>
            <button class="reset-btn" title="Reset to starter code">
              ↺ Reset
            </button>
          </div>
        </div>
        
        <div class="exercise-body">
          <div class="editor-pane">
            <div class="editor-header">
              <span class="file-tab">
                <span class="file-icon">🐍</span>
                solution.py
              </span>
            </div>
            <div class="code-editor-container" id="${widgetId}-editor"></div>
          </div>
          
          <div class="results-pane">
            <div class="results-header">
              <span>Test Results</span>
              <span class="test-summary" id="${widgetId}-summary"></span>
            </div>
            <div class="test-cases-container" id="${widgetId}-tests">
              <div class="test-placeholder">
                Click <strong>Run Tests</strong> to check your solution
              </div>
            </div>
          </div>
        </div>
        
        <div class="exercise-footer">
          <div class="hint-display" id="${widgetId}-hint" style="display: none;">
            <span class="hint-icon">💡</span>
            <span class="hint-text"></span>
          </div>
          <div class="action-buttons">
            <button class="run-tests-btn" id="${widgetId}-run">
              <span class="run-icon">▶</span>
              Run Tests
              <span class="shortcut">Ctrl+Enter</span>
            </button>
          </div>
        </div>
        
        <div class="loading-overlay" id="${widgetId}-loading" style="display: none;">
          <div class="loading-spinner"></div>
          <div class="loading-text">Running tests...</div>
        </div>
      </div>
    `;
  }

  setupEditor() {
    const editorContainer = document.getElementById(`${this.widgetId}-editor`);

    // Check if CodeMirror 5 is available
    if (typeof CodeMirror !== 'undefined') {
      // Create textarea first
      const textarea = document.createElement('textarea');
      textarea.id = `${this.widgetId}-textarea`;
      textarea.value = this.starterCode;
      editorContainer.appendChild(textarea);

      // Initialize CodeMirror
      const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';

      this.editor = CodeMirror.fromTextArea(textarea, {
        mode: 'python',
        theme: isDark ? 'material-darker' : 'default',
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        extraKeys: {
          'Ctrl-Enter': () => this.runTests(),
          'Cmd-Enter': () => this.runTests(),
          'Tab': (cm) => {
            if (cm.somethingSelected()) {
              cm.indentSelection('add');
            } else {
              cm.replaceSelection('    ', 'end');
            }
          }
        }
      });

      // Set editor size
      this.editor.setSize('100%', '280px');

      this.fallbackMode = false;
    } else {
      // Fallback to textarea
      editorContainer.innerHTML = `
        <textarea class="fallback-editor" id="${this.widgetId}-textarea"
          spellcheck="false" rows="12">${this.starterCode}</textarea>
      `;
      this.fallbackMode = true;
    }
  }

  setupEventListeners() {
    const widget = document.getElementById(this.widgetId);

    // Run button
    widget.querySelector('.run-tests-btn').addEventListener('click', () => this.runTests());

    // Reset button
    widget.querySelector('.reset-btn').addEventListener('click', () => this.resetCode());

    // Hint button
    widget.querySelector('.hint-btn').addEventListener('click', () => this.showHint());

    // Theme change observer for CodeMirror
    const observer = new MutationObserver(() => {
      if (this.editor && !this.fallbackMode) {
        const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';
        this.editor.setOption('theme', isDark ? 'material-darker' : 'default');
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme']
    });
  }

  getCode() {
    if (this.fallbackMode) {
      return document.getElementById(`${this.widgetId}-textarea`).value;
    }
    return this.editor.getValue();
  }

  setCode(code) {
    if (this.fallbackMode) {
      document.getElementById(`${this.widgetId}-textarea`).value = code;
    } else {
      this.editor.setValue(code);
    }
  }

  resetCode() {
    this.setCode(this.starterCode);
    this.clearResults();
    this.hideHint();
  }

  showHint() {
    if (this.hints.length === 0) return;

    const hintDisplay = document.getElementById(`${this.widgetId}-hint`);
    const hintText = hintDisplay.querySelector('.hint-text');

    hintText.textContent = this.hints[this.currentHintIndex];
    hintDisplay.style.display = 'flex';

    this.currentHintIndex = (this.currentHintIndex + 1) % this.hints.length;
  }

  hideHint() {
    document.getElementById(`${this.widgetId}-hint`).style.display = 'none';
    this.currentHintIndex = 0;
  }

  clearResults() {
    const testsContainer = document.getElementById(`${this.widgetId}-tests`);
    testsContainer.innerHTML = `
      <div class="test-placeholder">
        Click <strong>Run Tests</strong> to check your solution
      </div>
    `;
    document.getElementById(`${this.widgetId}-summary`).textContent = '';
  }

  showLoading(show) {
    document.getElementById(`${this.widgetId}-loading`).style.display = show ? 'flex' : 'none';
    document.getElementById(`${this.widgetId}-run`).disabled = show;
  }

  async runTests() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.showLoading(true);

    const code = this.getCode();
    const results = [];

    try {
      // Ensure Pyodide is ready
      await window.pyodideConsole.init();

      for (let i = 0; i < this.testCases.length; i++) {
        const testCase = this.testCases[i];
        const result = await this.runSingleTest(code, testCase, i);
        results.push(result);
      }

      this.displayResults(results);
    } catch (error) {
      this.displayError(error.toString());
    } finally {
      this.isRunning = false;
      this.showLoading(false);
    }
  }

  async runSingleTest(code, testCase, index) {
    try {
      const functionName = testCase.function_name || 'solution';
      const inputArgs = JSON.stringify(testCase.input || []);

      // Build test execution code
      const testCode = `
${code}

# Test execution
import sys
from io import StringIO

__test_result__ = None
__test_output__ = ""
__test_error__ = None

# Capture stdout
__old_stdout__ = sys.stdout
sys.stdout = StringIO()

try:
    # Call the function with test input
    __test_input__ = ${inputArgs}
    __test_result__ = ${functionName}(*__test_input__)
    __test_output__ = sys.stdout.getvalue()
except Exception as e:
    __test_error__ = str(e)
finally:
    sys.stdout = __old_stdout__

(str(__test_result__) if __test_result__ is not None else "None", __test_output__.strip(), __test_error__)
`;

      const execResult = await window.pyodideConsole.pyodide.runPythonAsync(testCode);
      const resultArray = execResult.toJs();
      const [returnValue, stdout, error] = resultArray;

      if (error) {
        return {
          index,
          passed: false,
          input: testCase.input,
          expected: testCase.expected_return || testCase.expected_output,
          actual: null,
          error: error
        };
      }

      // Compare with expected
      let passed = false;
      let actualOutput = '';
      let expected = '';

      if (testCase.expected_output !== undefined) {
        // Check stdout
        actualOutput = stdout;
        expected = String(testCase.expected_output).trim();
        passed = actualOutput === expected;
      } else if (testCase.expected_return !== undefined) {
        // Check return value
        actualOutput = returnValue;
        expected = String(testCase.expected_return);
        passed = actualOutput === expected;
      }

      return {
        index,
        passed,
        input: testCase.input,
        expected: expected,
        actual: actualOutput,
        error: null
      };
    } catch (error) {
      return {
        index,
        passed: false,
        input: testCase.input,
        expected: testCase.expected_return || testCase.expected_output,
        actual: null,
        error: error.toString()
      };
    }
  }

  displayResults(results) {
    const testsContainer = document.getElementById(`${this.widgetId}-tests`);
    const summary = document.getElementById(`${this.widgetId}-summary`);

    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const allPassed = passed === total;

    summary.textContent = `${passed}/${total} passed`;
    summary.className = `test-summary ${allPassed ? 'all-passed' : 'some-failed'}`;

    testsContainer.innerHTML = results.map((result, i) => `
      <div class="test-case ${result.passed ? 'passed' : 'failed'}">
        <div class="test-case-header">
          <span class="test-status">
            ${result.passed ? '✅' : '❌'}
          </span>
          <span class="test-name">Test Case ${i + 1}</span>
        </div>
        <div class="test-case-body">
          <div class="test-row">
            <span class="test-label">Input:</span>
            <code class="test-value">${this.formatValue(result.input)}</code>
          </div>
          <div class="test-row">
            <span class="test-label">Expected:</span>
            <code class="test-value expected">${this.escapeHtml(result.expected)}</code>
          </div>
          <div class="test-row">
            <span class="test-label">Actual:</span>
            <code class="test-value ${result.passed ? 'correct' : 'incorrect'}">
              ${result.error ? `<span class="error-text">${this.escapeHtml(result.error)}</span>` : this.escapeHtml(result.actual)}
            </code>
          </div>
        </div>
      </div>
    `).join('');

    // Show celebration for all passed
    if (allPassed) {
      this.showSuccess();
    }
  }

  formatValue(value) {
    if (value === null || value === undefined) return 'None';
    if (Array.isArray(value)) return JSON.stringify(value);
    return String(value);
  }

  escapeHtml(text) {
    if (text === null || text === undefined) return 'None';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  displayError(error) {
    const testsContainer = document.getElementById(`${this.widgetId}-tests`);
    testsContainer.innerHTML = `
      <div class="test-error">
        <span class="error-icon">⚠️</span>
        <div class="error-content">
          <strong>Execution Error</strong>
          <pre>${this.escapeHtml(error)}</pre>
        </div>
      </div>
    `;
  }

  showSuccess() {
    const widget = document.getElementById(this.widgetId);
    widget.classList.add('success-animation');

    // Create confetti effect
    const confetti = document.createElement('div');
    confetti.className = 'confetti-container';
    confetti.innerHTML = Array(20).fill(0).map(() =>
      `<div class="confetti" style="--x: ${Math.random()}; --delay: ${Math.random() * 0.5}s;"></div>`
    ).join('');
    widget.appendChild(confetti);

    setTimeout(() => {
      widget.classList.remove('success-animation');
      confetti.remove();
    }, 2000);
  }
}

// Exercise loader - parses exercise blocks in markdown
class ExerciseLoader {
  constructor() {
    this.exercises = new Map();
  }

  async loadExercises(exerciseDefinitions) {
    for (const [id, data] of Object.entries(exerciseDefinitions)) {
      this.exercises.set(id, data);
    }
  }

  initExercise(container, exerciseId) {
    const data = this.exercises.get(exerciseId);
    if (!data) {
      console.error(`Exercise not found: ${exerciseId}`);
      return null;
    }

    return new ExerciseEditor(container, {
      exerciseId,
      starterCode: data.starter_code,
      testCases: data.test_cases,
      hints: data.hints || []
    });
  }
}

// Initialize exercise blocks on page load
function initExerciseBlocks() {
  document.querySelectorAll('.exercise-block').forEach(block => {
    const exerciseId = block.dataset.exerciseId;
    if (exerciseId && window.exerciseLoader) {
      window.exerciseLoader.initExercise(block, exerciseId);
    }
  });
}

// Global exports
window.ExerciseEditor = ExerciseEditor;
window.ExerciseLoader = ExerciseLoader;
window.exerciseLoader = new ExerciseLoader();

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExerciseBlocks);
} else {
  initExerciseBlocks();
}

console.log('Exercise Editor loaded successfully');
