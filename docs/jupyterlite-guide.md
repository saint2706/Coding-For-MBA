# Interactive Notebooks with JupyterLite

The Coding for MBA site now includes a built-in JupyterLite runtime, letting you open and run lesson notebooks directly in your browser—no installations required. This guide explains how to get the most out of the in-browser lab environment.

## Launching the Runtime

1. Navigate to any lesson page on the site.
2. Scroll to the **Interactive Notebooks** section directly above **Additional Materials**.
3. Select the **🪐 Launch in JupyterLite** button.
   - If the lesson has multiple notebooks, the button opens the first notebook automatically.
   - Otherwise, it opens the lesson folder so you can pick a file from the file browser.

JupyterLite runs entirely in your browser using WebAssembly, so the runtime starts almost instantly.

## Working with Notebooks

- **Saving work:** Changes you make stay in your browser tab until you close it. Use **File → Save Notebook** to keep edits during the session.
- **Downloading results:** Use **File → Download** to save a copy of your notebook locally.
- **Resetting the session:** Refresh the browser tab or close and reopen JupyterLite to reset the environment.
- **Switching notebooks:** Use the file browser (left sidebar) to open additional `.ipynb` files from the repository.

## Installed Packages

The environment comes with the Pyodide Python kernel and popular data-science libraries, including:

- `numpy`
- `pandas`
- `matplotlib`
- `scikit-learn`
- `plotly`

Use the built-in **Terminal** or a notebook cell to install extra pure-Python packages with `micropip` if needed:

```python
import micropip
await micropip.install("packagename")
```

> **Tip:** Package installs happen in memory for the duration of the session.

## Troubleshooting

- **Blank screen:** Clear your browser cache or try a hard refresh. Some browser extensions can block WebAssembly loading.
- **Large datasets:** Loading very large files can exceed browser memory limits. Consider downloading the notebook and running it locally for heavy workloads.
- **Missing package:** Install the package with `micropip` or run the notebook in Colab/Binder using the alternate buttons in the **Additional Materials** section.

## Learn More

For background on JupyterLite and advanced configuration options, visit the [official documentation](https://jupyterlite.readthedocs.io/).
