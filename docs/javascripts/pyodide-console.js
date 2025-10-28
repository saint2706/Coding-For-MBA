/**
 * Interactive Python Console using Pyodide
 * Provides in-browser Python execution for code examples
 */

class PyodideConsole {
  constructor() {
    this.pyodide = null;
    this.isLoading = false;
    this.isReady = false;
  }

  /**
   * Initialize Pyodide WebAssembly runtime
   */
  async init() {
    if (this.isReady) return this.pyodide;
    if (this.isLoading) {
      // Wait for existing initialization
      while (!this.isReady) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.pyodide;
    }

    this.isLoading = true;
    try {
      console.log('Loading Pyodide...');
      this.pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
      });

      // Pre-load common packages
      await this.pyodide.loadPackage(['numpy', 'pandas', 'matplotlib']);

      this.isReady = true;
      this.isLoading = false;
      console.log('Pyodide ready!');
      return this.pyodide;
    } catch (error) {
      this.isLoading = false;
      console.error('Failed to initialize Pyodide:', error);
      throw error;
    }
  }

  /**
   * Execute Python code and return the result
   * @param {string} code - Python code to execute
   * @returns {Promise<{output: string, error: string|null}>}
   */
  async runCode(code) {
    try {
      if (!this.isReady) {
        await this.init();
      }

      // Capture stdout and stderr
      await this.pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

      // Execute user code
      let result;
      try {
        result = await this.pyodide.runPython(code);
      } catch (execError) {
        const stderr = await this.pyodide.runPython("sys.stderr.getvalue()");
        return {
          output: '',
          error: stderr || execError.toString()
        };
      }

      // Get captured output
      const stdout = await this.pyodide.runPython("sys.stdout.getvalue()");

      // Format result
      let output = stdout;
      if (result !== undefined && result !== null) {
        output += (output ? '\n' : '') + String(result);
      }

      return {
        output: output || '(no output)',
        error: null
      };
    } catch (error) {
      return {
        output: '',
        error: error.toString()
      };
    }
  }

  /**
   * Check if Pyodide is ready
   */
  get ready() {
    return this.isReady;
  }
}

// Global instance
const pyodideConsole = new PyodideConsole();

/**
 * Create an interactive code widget
 * @param {HTMLElement} container - Container element
 * @param {string} initialCode - Initial code to display
 */
function createInteractiveWidget(container, initialCode = '') {
  const widgetId = `widget-${Math.random().toString(36).substr(2, 9)}`;

  container.innerHTML = `
    <div class="interactive-widget" id="${widgetId}">
      <div class="widget-toolbar">
        <button class="run-button" onclick="executeWidget('${widgetId}')"
                aria-label="Run Python code">
          ▶ Run Code
        </button>
        <button class="clear-button" onclick="clearWidgetOutput('${widgetId}')"
                aria-label="Clear output">
          🗑 Clear
        </button>
        <span class="status-indicator" id="${widgetId}-status"></span>
      </div>
      <textarea
        class="code-input"
        id="${widgetId}-input"
        aria-label="Python code editor"
        spellcheck="false"
        rows="5">${initialCode}</textarea>
      <div class="code-output" id="${widgetId}-output"
           role="log"
           aria-live="polite"
           aria-label="Code execution output"></div>
    </div>
  `;
}

/**
 * Execute code in a widget
 * @param {string} widgetId - Widget identifier
 */
async function executeWidget(widgetId) {
  const input = document.getElementById(`${widgetId}-input`);
  const output = document.getElementById(`${widgetId}-output`);
  const status = document.getElementById(`${widgetId}-status`);
  const runButton = document.querySelector(`#${widgetId} .run-button`);

  if (!input || !output) return;

  const code = input.value;
  if (!code.trim()) {
    output.innerHTML = '<div class="output-info">No code to execute</div>';
    return;
  }

  // Update UI
  runButton.disabled = true;
  status.textContent = '⏳ Running...';
  status.className = 'status-indicator status-running';
  output.innerHTML = '<div class="output-info">Executing...</div>';

  try {
    const result = await pyodideConsole.runCode(code);

    if (result.error) {
      output.innerHTML = `<div class="output-error"><strong>Error:</strong>\n${escapeHtml(result.error)}</div>`;
      status.textContent = '❌ Error';
      status.className = 'status-indicator status-error';
    } else {
      output.innerHTML = `<div class="output-success">${escapeHtml(result.output)}</div>`;
      status.textContent = '✓ Success';
      status.className = 'status-indicator status-success';
    }
  } catch (error) {
    output.innerHTML = `<div class="output-error"><strong>Execution failed:</strong>\n${escapeHtml(error.toString())}</div>`;
    status.textContent = '❌ Failed';
    status.className = 'status-indicator status-error';
  } finally {
    runButton.disabled = false;
  }
}

/**
 * Clear widget output
 * @param {string} widgetId - Widget identifier
 */
function clearWidgetOutput(widgetId) {
  const output = document.getElementById(`${widgetId}-output`);
  const status = document.getElementById(`${widgetId}-status`);

  if (output) {
    output.innerHTML = '';
  }
  if (status) {
    status.textContent = '';
    status.className = 'status-indicator';
  }
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initialize all interactive code blocks on the page
 */
function initInteractiveBlocks() {
  // Find all code blocks marked as interactive
  document.querySelectorAll('.interactive-code').forEach(block => {
    const code = block.textContent;
    const container = document.createElement('div');
    block.parentNode.replaceChild(container, block);
    createInteractiveWidget(container, code.trim());
  });
}

/**
 * Add keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to run code in focused widget
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.classList.contains('code-input')) {
      const widgetId = activeElement.id.replace('-input', '');
      executeWidget(widgetId);
      e.preventDefault();
    }
  }
});

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInteractiveBlocks);
} else {
  initInteractiveBlocks();
}

// Export for use in other scripts
window.PyodideConsole = PyodideConsole;
window.pyodideConsole = pyodideConsole;
window.createInteractiveWidget = createInteractiveWidget;
