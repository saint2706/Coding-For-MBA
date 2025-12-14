---
title: Interactive Learning Platform Demo
description: Try our LeetCode-style interactive Python exercises
---

# 🚀 Interactive Learning Platform

Welcome to the **Interactive Learning Platform** - a LeetCode/HackerRank-style experience for learning Python right in your browser!

## Features

<div class="feature-grid">
  <div class="feature-card">
    <span class="feature-icon">📝</span>
    <h3>Code Editor</h3>
    <p>Syntax highlighting with CodeMirror</p>
  </div>
  <div class="feature-card">
    <span class="feature-icon">🐍</span>
    <h3>Python Runtime</h3>
    <p>Execute Python directly in browser</p>
  </div>
  <div class="feature-card">
    <span class="feature-icon">✅</span>
    <h3>Auto-Grading</h3>
    <p>Instant feedback on your solutions</p>
  </div>
  <div class="feature-card">
    <span class="feature-icon">💡</span>
    <h3>Hints</h3>
    <p>Progressive hints when you're stuck</p>
  </div>
</div>

---

## Try It Out

### Exercise 1: Company Welcome Message

Create a function that generates a welcome message for a company.

<div class="exercise-block" id="demo-exercise-1"></div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Wait for exercise editor to load
  setTimeout(function() {
    if (window.ExerciseEditor) {
      new window.ExerciseEditor(document.getElementById('demo-exercise-1'), {
        exerciseId: 'day01-ex1',
        starterCode: `def welcome_company(company_name):
    """
    Generate a welcome message for a company.

    Args:
        company_name: The name of the company

    Returns:
        A welcome message string
    """
    # Your code here - use an f-string or string concatenation
    pass`,
        testCases: [
          { input: ['InnovateCorp'], expected_return: 'Welcome to InnovateCorp Analytics', function_name: 'welcome_company' },
          { input: ['TechStartup'], expected_return: 'Welcome to TechStartup Analytics', function_name: 'welcome_company' },
          { input: ['Global Solutions'], expected_return: 'Welcome to Global Solutions Analytics', function_name: 'welcome_company' }
        ],
        hints: [
          'Use an f-string: f"Welcome to {company_name} Analytics"',
          'Make sure to return the string, not print it',
          'The format is exactly: "Welcome to " + name + " Analytics"'
        ]
      });
    }
  }, 1000);
});
</script>

---

### Exercise 2: Calculate Gross Profit

Create a function that calculates gross profit from revenue and cost of goods sold (COGS).

**Formula:** Gross Profit = Revenue - COGS

<div class="exercise-block" id="demo-exercise-2"></div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    if (window.ExerciseEditor) {
      new window.ExerciseEditor(document.getElementById('demo-exercise-2'), {
        exerciseId: 'day01-ex2',
        starterCode: `def calculate_gross_profit(revenue, cogs):
    """
    Calculate the gross profit.

    Args:
        revenue: Total sales revenue
        cogs: Cost of Goods Sold

    Returns:
        The gross profit (revenue - cogs)
    """
    # Your code here
    pass`,
        testCases: [
          { input: [500000, 350000], expected_return: '150000', function_name: 'calculate_gross_profit' },
          { input: [100000, 60000], expected_return: '40000', function_name: 'calculate_gross_profit' },
          { input: [1000000, 750000], expected_return: '250000', function_name: 'calculate_gross_profit' }
        ],
        hints: [
          'Gross profit is simply revenue minus COGS',
          'Return the result of the subtraction: return revenue - cogs'
        ]
      });
    }
  }, 1200);
});
</script>

---

### Exercise 3: Calculate Profit Margin

Calculate the gross profit margin percentage, handling the edge case where revenue is 0.

**Formula:** Profit Margin = (Gross Profit / Revenue) × 100

<div class="exercise-block" id="demo-exercise-3"></div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    if (window.ExerciseEditor) {
      new window.ExerciseEditor(document.getElementById('demo-exercise-3'), {
        exerciseId: 'day01-ex3',
        starterCode: `def calculate_profit_margin(gross_profit, revenue):
    """
    Calculate the profit margin as a percentage.

    Args:
        gross_profit: The gross profit amount
        revenue: Total revenue

    Returns:
        The profit margin percentage (0-100)
    """
    # Your code here
    # Remember to handle division by zero!
    pass`,
        testCases: [
          { input: [150000, 500000], expected_return: '30.0', function_name: 'calculate_profit_margin' },
          { input: [40000, 100000], expected_return: '40.0', function_name: 'calculate_profit_margin' },
          { input: [0, 0], expected_return: '0', function_name: 'calculate_profit_margin' }
        ],
        hints: [
          'First check if revenue is 0 to avoid division by zero',
          'Use an if statement: if revenue == 0: return 0',
          'The formula is: (gross_profit / revenue) * 100'
        ]
      });
    }
  }, 1400);
});
</script>

---

## How It Works

```mermaid
flowchart LR
    A[Write Code] --> B[Run Tests]
    B --> C{Pyodide<br/>Python Runtime}
    C --> D[Compare Output]
    D --> E{Pass?}
    E -->|Yes| F[✅ Success!]
    E -->|No| G[❌ Try Again]
    G --> A
```

1. **Write your solution** in the code editor
2. **Click "Run Tests"** or press `Ctrl+Enter`
3. **See instant feedback** with test results
4. **Use hints** if you get stuck

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Run tests |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Tab` | Indent |

---

<div class="next-steps">
  <h3>🎯 Ready for More?</h3>
  <p>Start with <a href="day-01-introduction/">Day 1: Python for Business Analytics</a> and work through all 108 lessons!</p>
</div>

<style>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.feature-card {
  padding: 1.5rem;
  background: var(--md-code-bg-color);
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.feature-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.feature-card h3 {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.feature-card p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.next-steps {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  text-align: center;
  margin: 2rem 0;
}

.next-steps h3 {
  margin-top: 0;
  color: white;
}

.next-steps a {
  color: white;
  font-weight: bold;
  text-decoration: underline;
}
</style>
