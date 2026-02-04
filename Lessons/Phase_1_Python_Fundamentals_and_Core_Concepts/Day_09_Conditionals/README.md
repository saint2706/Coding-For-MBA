---
title: "Day 9: Business Rules (Conditionals)"
tags:
  - Basics
  - Python
  - Logic
---

# Day 9: Conditionals (Business Rules)

## 🌉 The "Never-Coded" Bridge

Think about how a credit analyst evaluates loan applications. They don't approve everyone automatically or reject everyone indiscriminately. Instead, they follow a decision tree: "If credit score exceeds 750 and debt-to-income ratio is below 40%, approve. Else if credit score is between 650 and 750 with a co-signer, escalate to manager review. Otherwise, deny." Every business operates on these branching decision paths—from customer segmentation to pricing strategies to fraud detection.

In your organization, countless decisions follow this pattern. Your marketing team decides which customers receive premium offers versus discount coupons. Your supply chain determines whether to expedite shipping based on order value and customer tier. Your finance department approves expenses based on amount thresholds and departmental budgets. These aren't arbitrary choices—they're systematic rules that, when written down, follow a clear if-this-then-that structure.

The power of conditionals isn't just in automating individual decisions—it's in scaling judgment. When you codify business rules as conditionals, you transform tribal knowledge into executable policy. A seasoned sales manager's intuition about which leads to prioritize becomes an algorithm that can evaluate thousands of prospects consistently. The discount approval process that once required three email chains happens instantly, exactly as your business strategy dictates.

## 🔬 The Technical Deep Dive

Python conditionals use the keywords `if`, `elif` (else-if), and `else` to create branching logic. The basic syntax is remarkably readable: you write the keyword, followed by a condition that evaluates to `True` or `False`, followed by a colon, then an indented block of code that executes only when the condition is met.

```python
# Basic conditional structure
revenue = 150000

if revenue > 100000:
    discount = 0.15  # 15% discount for high-value orders
    priority_shipping = True
elif revenue > 50000:
    discount = 0.10  # 10% discount for mid-tier
    priority_shipping = False
else:
    discount = 0.05  # 5% discount for everyone else
    priority_shipping = False

print(f"Discount: {discount * 100}%, Priority: {priority_shipping}")
```

The condition after `if` or `elif` is a Boolean expression—something that Python can evaluate as true or false. You can use comparison operators (`>`, `<`, `>=`, `<=`, `==` for equals, `!=` for not equals) and logical operators (`and`, `or`, `not`) to build complex conditions. Order matters critically: Python evaluates conditions from top to bottom and executes only the first matching block.

```python
# Complex conditional with multiple criteria
def determine_shipping_cost(country, order_value, is_member):
    if country == "USA" and order_value > 100:
        return 0  # Free shipping for US orders over $100
    elif is_member and order_value > 50:
        return 5.99  # Member discount
    elif country in ["USA", "Canada", "Mexico"]:
        return 8.99  # North America standard
    else:
        return 24.99  # International shipping

cost = determine_shipping_cost("Canada", 75, True)
```

Nested conditionals—putting an `if` statement inside another `if` block—allow you to model hierarchical decision trees. This mirrors how businesses actually make decisions: first segment by customer type, then within each segment apply different rules. However, deep nesting (more than 2-3 levels) quickly becomes unreadable; senior developers refactor complex nested logic into separate functions or use early returns to keep code flat and maintainable.

## 🏗️ Senior-Level Insights

In production systems, conditional logic becomes a critical maintenance concern. What starts as a simple if-else statement inevitably grows into a complex web of business rules as the organization evolves. The most common code smell in enterprise applications is the "mega conditional"—a function with 15+ nested if-elif statements that requires a PhD to understand. Professional developers combat this through several strategies: extracting conditions into well-named variables or functions, using guard clauses (early returns) to reduce nesting, and organizing related conditions into polymorphic classes or strategy patterns when complexity warrants it.

Performance-wise, conditionals in Python are cheap—evaluating a Boolean expression takes nanoseconds. However, the conditions themselves might not be. If your `if` statement checks whether an email exists in a database by running a query every time, you've created a performance bottleneck. Smart developers cache expensive lookups, order conditions to check fast operations first (short-circuit evaluation), and use profiling tools to identify hot paths. In data processing pipelines, vectorized operations in NumPy or Pandas often replace explicit conditionals entirely, processing millions of rows in the time it takes to write one if statement.

The architectural challenge is that business rules encoded as conditionals scatter throughout codebases, making them difficult to audit or change. When your legal team says "we can no longer offer discounts to customers in California," can you find every place that logic lives? Modern architectures address this through rules engines, configuration-driven logic, or feature flags that externalize decisions from code. The conditionals remain, but they evaluate against a centralized source of truth rather than hardcoded constants, enabling business stakeholders to modify rules without redeploying code.

## 💻 Hands-on Lab

### Exercise 1: Customer Segmentation Engine
**Problem:** Build a function that categorizes customers into segments (Premium, Standard, Basic) based on their annual spending. Premium customers spend over $10,000, Standard customers spend $2,500-$10,000, and everyone else is Basic.

**Solution Approach:**
```python
def categorize_customer(annual_spending):
    """
    Segment customers based on annual spending.
    
    Args:
        annual_spending: Total spending in dollars
        
    Returns:
        str: Customer segment (Premium, Standard, or Basic)
    """
    if annual_spending > 10000:
        return "Premium"
    elif annual_spending >= 2500:
        return "Standard"
    else:
        return "Basic"

# Test the function
customers = [
    ("Customer A", 15000),
    ("Customer B", 5000),
    ("Customer C", 1200)
]

for name, spending in customers:
    segment = categorize_customer(spending)
    print(f"{name}: ${spending:,} -> {segment}")

# Output:
# Customer A: $15,000 -> Premium
# Customer B: $5,000 -> Standard
# Customer C: $1,200 -> Basic
```

**Key Learning:** Order matters in elif chains. We check the highest threshold first, then work down. If we reversed the order and checked `>= 2500` first, a $15,000 customer would incorrectly be classified as Standard because that condition would match first.

### Exercise 2: Dynamic Pricing with Multiple Factors
**Problem:** Create a pricing function that calculates the final price based on base price, customer type (member/non-member), and whether it's a holiday sale. Members get 10% off, holidays give 20% off, and both combined should give 25% off (not 30%).

**Solution Approach:**
```python
def calculate_final_price(base_price, is_member, is_holiday):
    """
    Calculate final price with conditional discounts.
    
    Business rules:
    - Members: 10% off
    - Holiday sales: 20% off
    - Members during holidays: 25% off (special combined rate)
    - Non-members on regular days: no discount
    """
    if is_member and is_holiday:
        discount = 0.25  # Special combined discount
    elif is_holiday:
        discount = 0.20  # Holiday-only discount
    elif is_member:
        discount = 0.10  # Member-only discount
    else:
        discount = 0.0  # No discount
    
    final_price = base_price * (1 - discount)
    
    return {
        'base_price': base_price,
        'discount_rate': discount,
        'discount_amount': base_price * discount,
        'final_price': final_price
    }

# Test various scenarios
test_cases = [
    (100, True, True),   # Member during holiday
    (100, False, True),  # Non-member during holiday
    (100, True, False),  # Member on regular day
    (100, False, False)  # Non-member on regular day
]

for base, member, holiday in test_cases:
    result = calculate_final_price(base, member, holiday)
    print(f"Member: {member}, Holiday: {holiday}")
    print(f"  ${result['base_price']:.2f} - ${result['discount_amount']:.2f} "
          f"({result['discount_rate']*100:.0f}% off) = ${result['final_price']:.2f}\n")
```

**Key Learning:** When conditions aren't mutually exclusive, order becomes critical. We check the most specific condition first (`is_member and is_holiday`) before checking the broader conditions. This pattern—checking compound conditions before individual conditions—is essential for correct business logic implementation.

### Exercise 3: Credit Approval System with Business Logic
**Problem:** Design a loan approval function that considers credit score, income, existing debt, and employment status. The rules: Score > 750 with income > $50k = auto-approve. Score 650-750 with income > $75k and debt-to-income < 0.4 = approve. Score 650-750 with income $50k-$75k and employment_years > 3 = manual review. All others = deny.

**Solution Approach:**
```python
def evaluate_loan_application(credit_score, annual_income, 
                              monthly_debt, employment_years):
    """
    Comprehensive loan approval system with realistic business rules.
    
    Returns:
        dict: Contains decision (approved/denied/review) and reasoning
    """
    # Calculate debt-to-income ratio
    monthly_income = annual_income / 12
    debt_to_income = monthly_debt / monthly_income if monthly_income > 0 else 1.0
    
    # Decision tree mirrors real lending criteria
    if credit_score > 750 and annual_income > 50000:
        decision = "APPROVED"
        reason = "Excellent credit and sufficient income"
        
    elif 650 <= credit_score <= 750:
        if annual_income > 75000 and debt_to_income < 0.4:
            decision = "APPROVED"
            reason = "Good credit with strong income and low debt ratio"
        elif 50000 <= annual_income < 75000 and employment_years > 3:
            decision = "MANUAL_REVIEW"
            reason = "Borderline case requires underwriter review"
        else:
            decision = "DENIED"
            reason = "Insufficient income or high debt-to-income ratio"
            
    else:  # credit_score < 650
        decision = "DENIED"
        reason = "Credit score below minimum threshold"
    
    return {
        'decision': decision,
        'reason': reason,
        'credit_score': credit_score,
        'annual_income': annual_income,
        'debt_to_income_ratio': round(debt_to_income, 2)
    }

# Test comprehensive scenarios
applications = [
    (780, 60000, 1200, 5),    # Strong applicant
    (720, 80000, 2000, 6),    # Good with low DTI
    (700, 55000, 1500, 4),    # Needs review
    (700, 55000, 2000, 2),    # Weak employment
    (620, 100000, 1000, 10)   # Low score despite high income
]

print("LOAN APPLICATION RESULTS")
print("=" * 70)

for score, income, debt, years in applications:
    result = evaluate_loan_application(score, income, debt, years)
    print(f"\nCredit Score: {result['credit_score']}")
    print(f"Income: ${result['annual_income']:,}")
    print(f"DTI Ratio: {result['debt_to_income_ratio']:.2%}")
    print(f"Decision: {result['decision']}")
    print(f"Reason: {result['reason']}")
```

**Key Learning:** Real business logic often requires computed intermediate values (like debt-to-income ratio) before making decisions. This example shows how to structure complex, nested conditionals to remain readable: calculate derived metrics first, then use clear hierarchical logic. Notice how we use early classification (checking credit score ranges) to create manageable sub-trees rather than one massive conditional expression.

## ✅ Mastery Check

1. **Basic Understanding:** What's the difference between `==` and `=` in Python, and why does this matter in conditional statements?

2. **Intermediate Logic:** Write a conditional that determines if a business day is a "high priority shipping day" based on: day of week (Monday-Friday), not a holiday, and current hour between 9 AM and 3 PM.

3. **Business Rules:** A company offers tiered support: free for all, email support for orders > $50, phone support for orders > $200 or any Premium members, and dedicated account manager for orders > $1000 and Premium members. Write this as a conditional that returns the support level.

4. **Debugging:** What's wrong with this code, and how would you fix it?
   ```python
   if revenue > 50000:
       discount = 0.15
   if revenue > 100000:
       discount = 0.20
   ```

5. **Advanced Architecture:** In a production system processing millions of transactions daily, you have a function with 50+ conditional checks for different business rules. What architectural patterns would you use to make this maintainable and performant?

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 08 – Dictionaries](../Day_08_Dictionaries/README.md) • **Next:** [Day 10 – Loops](../Day_10_Loops/README.md)

_You are on lesson 9 of 108._

<!-- LESSON_FOOTER_END -->
