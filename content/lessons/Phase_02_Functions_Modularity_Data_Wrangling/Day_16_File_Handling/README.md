---
day: 16
title: "File Handling"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "file-handling"
duration: 50
difficulty: "intermediate"
tags:
  - python
  - files
  - io
  - csv-json
concepts:
  - "reading and writing files"
  - "context managers"
  - "CSV and JSON handling"
  - "file paths"
prerequisites: [4, 15]
outcomes:
  - "Read and write text files"
  - "Handle CSV and JSON data"
  - "Use context managers for safe file operations"
---

# 🎯 Day 16: File Handling

> *"Data lives in files. Mastering file I/O is essential for any real application."*

---

## The "Never-Coded" Bridge

**Every business works with files:**

- Sales reports in CSV format
- Configuration in JSON
- Logs in text files
- Customer data exports

Your programs need to read these files, process the data, and write results. This is the bridge between your code and the real world.

```python
# Load yesterday's sales, calculate totals, save report
with open("sales.csv") as f:
    # Process data
    pass
with open("report.txt", "w") as f:
    f.write("Revenue: $50,000")
```

---

## The Technical Deep Dive

### Reading Files

```python
# Basic read
with open("data.txt") as f:
    content = f.read()  # Entire file as string

# Read as lines
with open("data.txt") as f:
    lines = f.readlines()  # List of lines

# Read line by line (memory-efficient)
with open("data.txt") as f:
    for line in f:
        print(line.strip())
```

### Writing Files

```python
# Write (overwrites existing)
with open("output.txt", "w") as f:
    f.write("Line 1\n")
    f.write("Line 2\n")

# Append (adds to existing)
with open("log.txt", "a") as f:
    f.write("New log entry\n")

# Write multiple lines
lines = ["Line 1", "Line 2", "Line 3"]
with open("output.txt", "w") as f:
    f.writelines(line + "\n" for line in lines)
```

### File Modes

| Mode | Description                      |
| ---- | -------------------------------- |
| `r`  | Read (default)                   |
| `w`  | Write (truncates)                |
| `a`  | Append                           |
| `r+` | Read and write                   |
| `b`  | Binary mode (add to other modes) |

### Working with CSV

```python
import csv

# Reading CSV
with open("sales.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f"{row['product']}: ${row['price']}")

# Writing CSV
data = [
    {"product": "Laptop", "price": 999},
    {"product": "Mouse", "price": 29}
]

with open("products.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["product", "price"])
    writer.writeheader()
    writer.writerows(data)
```

### Working with JSON

```python
import json

# Reading JSON
with open("config.json") as f:
    config = json.load(f)

# Writing JSON
data = {"name": "Alice", "scores": [95, 87, 92]}
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

# String conversion
json_string = json.dumps(data)
parsed = json.loads(json_string)
```

### Path Handling

```python
from pathlib import Path

# Create path objects
data_dir = Path("data")
file_path = data_dir / "sales.csv"

# Check existence
if file_path.exists():
    content = file_path.read_text()

# Common operations
file_path.name        # "sales.csv"
file_path.stem        # "sales"
file_path.suffix      # ".csv"
file_path.parent      # Path("data")

# Create directories
Path("output/reports").mkdir(parents=True, exist_ok=True)
```

---

## Senior-Level Insights

### Large File Processing

```python
# Don't load entire file in memory
# Bad for large files:
data = open("huge.txt").read()

# Process line by line:
with open("huge.txt") as f:
    for line in f:
        process(line)

# Or in chunks:
with open("huge.bin", "rb") as f:
    while chunk := f.read(8192):
        process(chunk)
```

### Encoding Issues

```python
# Always specify encoding for text files
with open("data.txt", encoding="utf-8") as f:
    content = f.read()

# Handle encoding errors
with open("data.txt", encoding="utf-8", errors="ignore") as f:
    content = f.read()
```

### Atomic Writes

```python
from pathlib import Path
import tempfile
import shutil

def atomic_write(path, content):
    """Write that won't corrupt file on crash."""
    path = Path(path)
    with tempfile.NamedTemporaryFile(
        mode='w', 
        dir=path.parent, 
        delete=False
    ) as tmp:
        tmp.write(content)
        temp_path = tmp.name
    shutil.move(temp_path, path)
```

---

## Hands-on Lab

### Exercise 1: Log File Analyzer

```python
from collections import Counter
from datetime import datetime

def analyze_log(log_path):
    """Analyze a log file for patterns."""
    errors = []
    status_counts = Counter()
    
    with open(log_path) as f:
        for line in f:
            # Parse: 2024-01-15 10:30:45 ERROR Database connection failed
            parts = line.strip().split(" ", 3)
            if len(parts) >= 4:
                date, time, level, message = parts
                status_counts[level] += 1
                if level == "ERROR":
                    errors.append({"time": f"{date} {time}", "message": message})
    
    return {
        "total_lines": sum(status_counts.values()),
        "by_level": dict(status_counts),
        "errors": errors
    }

# Simulate log file
log_content = """2024-01-15 10:30:45 INFO Server started
2024-01-15 10:31:02 ERROR Database connection failed
2024-01-15 10:31:15 INFO Retrying connection
2024-01-15 10:31:20 INFO Connected successfully
2024-01-15 10:32:00 WARNING High memory usage"""

with open("app.log", "w") as f:
    f.write(log_content)

report = analyze_log("app.log")
print(f"Total: {report['total_lines']} lines")
print(f"Errors: {len(report['errors'])}")
```

---

### Exercise 2: Configuration Manager

```python
import json
from pathlib import Path

class ConfigManager:
    def __init__(self, config_path):
        self.path = Path(config_path)
        self.config = self._load()
    
    def _load(self):
        if self.path.exists():
            return json.loads(self.path.read_text())
        return {}
    
    def get(self, key, default=None):
        return self.config.get(key, default)
    
    def set(self, key, value):
        self.config[key] = value
        self._save()
    
    def _save(self):
        self.path.write_text(json.dumps(self.config, indent=2))

# Usage
config = ConfigManager("app_config.json")
config.set("theme", "dark")
config.set("language", "en")
print(config.get("theme"))  # "dark"
```

---

### Exercise 3: CSV Data Transformer

```python
import csv

def transform_sales_data(input_path, output_path):
    """Transform raw sales data with calculations."""
    with open(input_path) as infile:
        reader = csv.DictReader(infile)
        rows = list(reader)
    
    # Add calculated fields
    for row in rows:
        price = float(row["price"])
        quantity = int(row["quantity"])
        row["revenue"] = price * quantity
        row["tax"] = row["revenue"] * 0.08
        row["total"] = row["revenue"] + row["tax"]
    
    # Write enhanced data
    fieldnames = list(rows[0].keys())
    with open(output_path, "w", newline="") as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    return len(rows)

# Create sample data
sample = """product,price,quantity
Laptop,999,5
Mouse,29,50
Keyboard,79,30"""

with open("sales_raw.csv", "w") as f:
    f.write(sample)

count = transform_sales_data("sales_raw.csv", "sales_enhanced.csv")
print(f"Processed {count} rows")
```

---

## Mastery Check

### Question 1: Context Manager

Why use `with` for file operations?

<details>
<summary>Click for Answer</summary>

The `with` statement ensures the file is properly closed even if an exception occurs. Without it, you risk:

- File handles leaking
- Data not being flushed to disk
- Resource exhaustion

</details>

---

### Question 2: File Modes

What's the difference between `w` and `a`?

<details>
<summary>Click for Answer</summary>

- `w` (write): Creates new file or **truncates** existing file
- `a` (append): Creates new file or **adds to end** of existing file

Use `a` for logs; use `w` for reports you regenerate.

</details>

---

### Question 3: JSON vs CSV

When would you choose JSON over CSV?

<details>
<summary>Click for Answer</summary>

**JSON**: Nested/hierarchical data, config files, API responses
**CSV**: Tabular data, spreadsheet compatibility, large datasets

```python
# CSV is better for:
products = [{"name": "A", "price": 10}, ...]

# JSON is better for:
config = {"database": {"host": "...", "port": 5432}}
```

</details>

---

### Question 4: Path Handling

Build a path for `data/2024/january/sales.csv`:

<details>
<summary>Click for Answer</summary>

```python
from pathlib import Path

path = Path("data") / "2024" / "january" / "sales.csv"
# or
path = Path("data/2024/january/sales.csv")
```

</details>

---

### Question 5: Design Scenario

**Scenario**: Build a backup system that:

1. Reads all `.json` files in a directory
2. Combines them into one backup file
3. Adds a timestamp to the backup filename

<details>
<summary>Click for Answer</summary>

```python
import json
from pathlib import Path
from datetime import datetime

def backup_json_files(source_dir, backup_dir):
    source = Path(source_dir)
    backup = Path(backup_dir)
    backup.mkdir(exist_ok=True)
    
    # Collect all data
    combined = {}
    for json_file in source.glob("*.json"):
        data = json.loads(json_file.read_text())
        combined[json_file.stem] = data
    
    # Create timestamped backup
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup / f"backup_{timestamp}.json"
    backup_file.write_text(json.dumps(combined, indent=2))
    
    return backup_file

# Usage
backup_path = backup_json_files("config/", "backups/")
print(f"Created: {backup_path}")
```

</details>

---

## Summary

Today you learned:

- ✅ Use `with` for safe file operations
- ✅ Read and write text files
- ✅ Handle CSV with the `csv` module
- ✅ Handle JSON with the `json` module
- ✅ Use `pathlib` for cross-platform paths

**Tomorrow**: We'll explore **regular expressions**—powerful pattern matching for text.

---

## Task Block (Core / Stretch / Expert)

### Core

- Complete one end-to-end task that applies today’s main concept to realistic business data.
- Add basic validation (assertions or checks) for normal and edge-case inputs.

### Stretch

- Refactor for modularity: split logic into reusable helper functions or modules.
- Add one additional scenario that tests robustness under imperfect data.

### Expert

- Generalize your solution for reuse across datasets or teams.
- Document key tradeoffs and why your implementation is maintainable.

## Common Grading Rubric (applies every day)

| Criterion | 1 - Emerging | 2 - Developing | 3 - Proficient | 4 - Strong |
|---|---|---|---|---|
| Correctness | Major logic errors; results frequently wrong. | Core path works but multiple inaccuracies remain. | Outputs are correct for expected inputs and checked with examples. | Outputs are consistently correct, including tricky cases and clear verification. |
| Robustness | Breaks on minor input changes or missing values. | Handles some variation but fails on common edge cases. | Handles expected edge cases with explicit guards/validation. | Gracefully handles unexpected data, with informative failures and recovery paths. |
| Readability | Hard to follow; unclear naming/structure. | Partially clear but inconsistent style or organization. | Clear naming, structure, and comments/docstrings where needed. | Highly readable, well-organized, and easy for teammates to extend quickly. |
| Reuse | One-off script with duplicated logic. | Some modularization, limited reuse. | Reusable functions/classes with sensible boundaries. | Well-factored components with clean interfaces and minimal duplication. |
