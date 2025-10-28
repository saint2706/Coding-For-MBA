# Phase 1 Cheat Sheet — Python Foundations (Days 01-20)

> Launchpad for business leaders becoming technical operators. Master the Python syntax, patterns,
> and habits you will reuse throughout the 67-day journey.

## Core Outcomes

- Speak Python fluently: variables, expressions, conditionals, loops, functions, and error handling.
- Manipulate essential data structures (lists, tuples, sets, dictionaries) to model business
  scenarios.
- Build reusable utilities with modules, packages, and object-oriented design fundamentals.
- Read, write, and validate structured data from files to support reporting workflows.
- Establish a professional tooling baseline with virtual environments and dependency management.

## Quick Syntax Reference

| Task | Pattern | Example | |------|---------|---------| | Format numbers & currency | f-strings |
`f"Revenue: ${revenue:,.0f}"` | | List comprehension |
`[transform(x) for x in items if predicate(x)]` | `[c.upper() for c in customers if c.active]` | |
Dictionary lookup with defaults | `value = mapping.get(key, fallback)` |
`region = sales_map.get("APAC", 0)` | | Safe file handling |
`with open(path, "r", encoding="utf-8") as f:` | `with open("customers.csv") as f:` | | Custom error
handling | `try/except/else/finally` | `except ValueError as exc:` | | Create reusable module |
`if __name__ == "__main__":` | `if __name__ == "__main__": cli()` |

### Data Structure Spotlight

- **Lists:** ordered, mutable collections — ideal for transaction logs and ETL staging areas.
- **Tuples:** ordered, immutable — perfect for fixed KPI bundles (e.g., `(revenue, margin, churn)`).
- **Sets:** unique membership — detect duplicate customer IDs or SKU codes.
- **Dictionaries:** key-value lookups — central to configuration, dimension tables, and JSON-style
  payloads.

## Business Wins to Target

- Automate weekly metrics: ingest CSV exports, calculate KPIs, and email a summary.
- Prototype decision logic: use conditionals to encode approval rules or lead scoring thresholds.
- Build a reusable workbook helper: script repetitive Excel cleanup tasks (renaming columns,
  filtering rows).
- Create a lightweight CLI that answers a common business question (e.g., break-even analysis).

## Confidence Checklist

Tick these boxes before advancing to Phase 2:

- [ ] Can refactor nested loops into functions with clear docstrings.
- [ ] Comfortable debugging `Traceback` output and writing informative exceptions.
- [ ] Can serialize Python objects to JSON and back without losing fidelity.
- [ ] Have packaged at least one utility into a module that other teammates can import.
- [ ] Able to explain when to choose a list vs. dictionary vs. set in under 30 seconds.

## Tooling & Workflow Habits

- Use `python -m venv .venv` and `pip install -r requirements.txt` for isolated environments.
- Adopt `black` or `ruff format` to keep scripts readable as they grow.
- Pair CLI scripts with argument parsing (`argparse`) to make them reusable across teams.
- Keep a `tests/` scratchpad with simple asserts for critical business rules.

## 30-Minute Refresh Sprint

1. **Warm-up (10 min):** Rebuild a `Customer` class with dunder methods for sorting and
   representation.
1. **Automation drill (10 min):** Write a function that reads `sales.csv`, filters for the current
   quarter, and outputs JSON to `stdout`.
1. **Communication (10 min):** Draft a short Loom or memo explaining how loops and list
   comprehensions accelerate a manual workflow.

______________________________________________________________________

**Next stop:** Phase 2 adds professional data workflows. Bring your clean code habits and packaging
discipline forward.
