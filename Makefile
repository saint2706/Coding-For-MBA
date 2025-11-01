.PHONY: setup dev docs docs-serve test lint format links

setup:
	python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

dev:
	pip install -r requirements-dev.txt

docs:
	pip install -r docs/requirements-docs.txt && mkdocs build --strict

docs-serve:
	mkdocs serve -a 0.0.0.0:8000

test:
	pytest -q

lint:
	# Run ruff to check code quality
	ruff check .
	# Run all pre-commit hooks to verify formatting and style
	# This should pass if all files are properly formatted (run 'make format' locally first)
	# CI failure reference: job 54250104465, ref cc99c9b22bfef4de3f843e61580019f6ceaba913
	pre-commit run --all-files --show-diff-on-failure --color=always

format:
	# Format Python code with ruff and black
	ruff format .
	black .
	# Run all pre-commit hooks to auto-format files (mdformat, trailing whitespace, etc.)
	# Note: pre-commit may exit with code 1 if it modifies files, but that's expected
	pre-commit run --all-files || true

links:
	lychee --no-progress --exclude-mail ./ --accept 200,429
