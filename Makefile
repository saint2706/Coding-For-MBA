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
	ruff check .
	pre-commit run mdformat --all-files
	pre-commit run --all-files --show-diff-on-failure --color=always

format:
	ruff format .
	black .

links:
	lychee --no-progress --exclude-mail ./ --accept 200,429
