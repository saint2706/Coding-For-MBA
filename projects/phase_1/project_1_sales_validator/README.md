# Project 1: Sales Data Validator

## Business Case

Your company processes hundreds of sales transactions daily through manual data entry. Recent audits revealed significant errors in the data, leading to inaccurate reports and lost revenue. You've been tasked with creating a Python-based validation system to catch errors before they enter the database.

## Learning Objectives

By completing this project, you will:

- Apply Python fundamentals (variables, data types, conditionals)
- Use functions to organize code
- Implement data validation logic
- Handle exceptions and edge cases
- Create user-friendly output and error messages

## Dataset

**File:** `data/sales_transactions.csv`

Sample data includes:

- Transaction ID
- Date (YYYY-MM-DD format)
- Product Code
- Quantity (must be positive integer)
- Unit Price (must be positive number)
- Customer ID
- Region

## Requirements

### Must Validate:

1. **Date format**: Must be valid YYYY-MM-DD
1. **Product codes**: Must match pattern (e.g., PRD-XXXX where X is digit)
1. **Quantities**: Must be positive integers
1. **Prices**: Must be positive numbers with max 2 decimal places
1. **Customer IDs**: Must be 6-digit numbers
1. **Regions**: Must be one of: North, South, East, West

### Output:

- Summary of validation results
- List of errors with row numbers and descriptions
- Statistics: total rows, valid rows, error rows
- Save clean data to `validated_sales.csv`

## Evaluation Rubric

| Criteria          | Points | Description                                  |
| ----------------- | ------ | -------------------------------------------- |
| Code Organization | 20     | Functions, clear variable names, comments    |
| Validation Logic  | 30     | All 6 validation rules correctly implemented |
| Error Handling    | 20     | Graceful handling of edge cases              |
| Output Quality    | 15     | Clear, informative reports                   |
| Code Efficiency   | 15     | Reasonable performance                       |

**Total: 100 points** • **Passing: 70+ points**

## Difficulty: 🟢 Beginner
