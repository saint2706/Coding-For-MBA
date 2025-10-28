# Binder Configuration for Coding for MBA

This directory contains configuration files for running the curriculum notebooks on [Binder](https://mybinder.org/).

## What is Binder?

Binder allows you to run Jupyter notebooks in an executable environment directly from GitHub without any local installation.

## Using Binder

Click the "Open in Binder" badge in any lesson's README.md to launch that specific notebook in an interactive environment.

## Configuration Files

- `environment.yml` - Conda environment specification with all required dependencies
- `postBuild` - Optional post-installation script for additional setup

## Local Testing

To test the Binder environment locally:

```bash
# Install repo2docker
pip install jupyter-repo2docker

# Build and run the environment
repo2docker --editable .
```

## Custom Configuration

The environment includes all packages from `requirements.txt` plus Jupyter-specific tools:

- JupyterLab
- Jupyter Notebook
- ipywidgets for interactive widgets
- nbconvert for notebook conversion

## Resources

- [Binder Documentation](https://mybinder.readthedocs.io/)
- [repo2docker Documentation](https://repo2docker.readthedocs.io/)
- [Example Repositories](https://github.com/binder-examples)
