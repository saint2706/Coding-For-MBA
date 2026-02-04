---
title: "Day 11: Functions - Creating Reusable Business Tools"
tags:
  - BI
  - Basics
  - Python
---

# Day 11: Functions (Reusable Code & Modularity)

## 🌉 The "Never-Coded" Bridge

Consider how businesses actually work: they don't reinvent processes for every transaction. When a sales rep closes a deal, they don't create a new commission calculation method each time—there's a standard formula that applies universally. When finance calculates quarterly taxes, they use the same procedure repeatedly. When HR evaluates performance bonuses, there's an established rubric. These are all functions in the business sense: defined procedures that take inputs, follow consistent logic, and produce outputs.

In organizations without clear functional definitions, chaos reigns. One manager calculates ROI one way, another uses a different formula, and leadership gets inconsistent metrics. One department prices products with a 30% markup, another uses 25%, and nobody knows which is official. Functions in code solve this exact problem: you define the logic once, name it clearly, and everyone (including your future self) uses the same implementation. When the tax code changes or the commission structure updates, you modify one function instead of hunting through thousands of lines of code.

The leverage is extraordinary. A well-designed function library transforms juniors into productive contributors immediately—they call `calculate_customer_lifetime_value(customer_id)` without understanding the complex retention curves and margin calculations inside. It enables horizontal scaling: your e-commerce platform calls the same pricing function whether processing ten orders or ten million. It creates institutional knowledge that survives employee turnover: the business logic lives in tested, documented functions rather than in someone's head who just gave notice.

## 🔬 The Technical Deep Dive

A Python function is defined with the `def` keyword, followed by a name, parentheses containing optional parameters, a colon, and an indented block of code. The function can optionally return a value using the `return` statement. Functions create their own local scope—variables defined inside exist only while the function runs and don't interfere with variables outside.

```python
# Basic function structure
def calculate_gross_margin(revenue, cost_of_goods_sold):
    """
    Calculate gross margin percentage.
    
    Args:
        revenue: Total sales revenue
        cost_of_goods_sold: Direct costs of producing goods
        
    Returns:
        float: Gross margin as a percentage
    """
    if revenue == 0:
        return 0.0
    
    gross_profit = revenue - cost_of_goods_sold
    margin_percentage = (gross_profit / revenue) * 100
    
    return margin_percentage

# Calling the function
q1_margin = calculate_gross_margin(500000, 325000)
print(f"Q1 Gross Margin: {q1_margin:.2f}%")  # Output: Q1 Gross Margin: 35.00%
```

Parameters make functions flexible—the same function handles different inputs. Python supports default parameter values, allowing you to make some arguments optional. Position matters for positional arguments, but you can also use keyword arguments for clarity. Return values can be any type: numbers, strings, lists, dictionaries, or even other functions.

```python
# Functions with default parameters and multiple return values
def calculate_sales_metrics(revenue, cost, expenses, tax_rate=0.25):
    """
    Calculate comprehensive sales metrics.
    
    Returns multiple values as a dictionary for clarity.
    """
    gross_profit = revenue - cost
    gross_margin = (gross_profit / revenue * 100) if revenue > 0 else 0
    
    operating_profit = gross_profit - expenses
    operating_margin = (operating_profit / revenue * 100) if revenue > 0 else 0
    
    taxes = operating_profit * tax_rate if operating_profit > 0 else 0
    net_profit = operating_profit - taxes
    net_margin = (net_profit / revenue * 100) if revenue > 0 else 0
    
    return {
        'gross_profit': gross_profit,
        'gross_margin': gross_margin,
        'operating_profit': operating_profit,
        'operating_margin': operating_margin,
        'net_profit': net_profit,
        'net_margin': net_margin
    }

# Using the function with default tax rate
results = calculate_sales_metrics(
    revenue=1000000,
    cost=600000,
    expenses=200000
)

print(f"Net Profit: ${results['net_profit']:,.2f}")
print(f"Net Margin: {results['net_margin']:.1f}%")
```

Type hints (introduced in Python 3.5+) add clarity and enable better tooling. They don't enforce types at runtime but document expectations and enable IDEs to catch errors early. Modern Python code uses type hints extensively: `def calculate_roi(investment: float, return_value: float) -> float:` clearly communicates that both parameters and the return value should be floats.

```python
from typing import List, Dict, Optional

def filter_high_value_customers(
    customers: List[Dict[str, any]], 
    threshold: float
) -> List[str]:
    """
    Extract names of customers above spending threshold.
    
    Args:
        customers: List of customer dictionaries with 'name' and 'total_spent'
        threshold: Minimum spending to qualify as high-value
        
    Returns:
        List of customer names meeting criteria
    """
    high_value = []
    for customer in customers:
        if customer.get('total_spent', 0) >= threshold:
            high_value.append(customer['name'])
    return high_value

# Type hints make the interface crystal clear
customers_data = [
    {'name': 'Acme Corp', 'total_spent': 150000},
    {'name': 'Small Biz', 'total_spent': 12000},
    {'name': 'Enterprise Inc', 'total_spent': 500000}
]

vip_customers = filter_high_value_customers(customers_data, 100000)
```

## 🏗️ Senior-Level Insights

Function design is where architecture meets implementation. The single responsibility principle applies: each function should do one thing well. A function named `process_customer()` that calculates discounts, updates inventory, sends emails, and logs to the database is a maintenance nightmare. Break it into `calculate_discount()`, `update_inventory()`, `send_confirmation_email()`, and `log_transaction()`—each testable, reusable, and understandable in isolation.

Parameters and side effects determine function quality. Pure functions—those that return the same output for the same inputs without modifying external state—are gold. They're trivially testable, parallelizable, and composable. Functions with side effects (database writes, API calls, file modifications) require careful design: make them explicit, handle errors gracefully, and keep them separate from business logic. The pattern of separating calculation from execution enables testing business logic without touching databases or external services.

Performance considerations emerge with function call overhead and memory allocation. In tight loops processing millions of items, the overhead of function calls matters—Python's dynamic nature makes function calls more expensive than in compiled languages. For performance-critical code, profile first, then consider inlining hot functions or using Cython. However, premature optimization is worse than premature abstraction—write clear, modular code first, measure performance, then optimize the 5% that matters.

Documentation and naming are force multipliers in team environments. A function named `calc()` tells you nothing; `calculate_weighted_average_product_margin()` tells you everything. Docstrings aren't optional in production code—they're the interface contract. Use the Google or NumPy docstring format consistently, document assumptions and edge cases, and include example usage. When someone wakes up at 3 AM to fix a production bug, your docstring might be the difference between a 10-minute fix and a 2-hour debugging session.

## 💻 Hands-on Lab

### Exercise 1: Financial Ratio Calculator
**Problem:** Create a set of functions to calculate key financial ratios that analysts use to evaluate company performance. Build functions for current ratio, quick ratio, and debt-to-equity ratio. Each should handle edge cases like zero denominators.

**Solution Approach:**
```python
def calculate_current_ratio(current_assets: float, current_liabilities: float) -> float:
    """
    Calculate current ratio (current assets / current liabilities).
    
    Measures company's ability to pay short-term obligations.
    Ratio > 1.0 indicates good short-term financial health.
    
    Args:
        current_assets: Total current assets
        current_liabilities: Total current liabilities
        
    Returns:
        Current ratio, or 0 if liabilities are zero
    """
    if current_liabilities == 0:
        return float('inf') if current_assets > 0 else 0.0
    return current_assets / current_liabilities


def calculate_quick_ratio(current_assets: float, inventory: float, 
                         current_liabilities: float) -> float:
    """
    Calculate quick ratio ((current assets - inventory) / current liabilities).
    
    More conservative than current ratio; excludes inventory
    as it's not immediately liquid.
    
    Args:
        current_assets: Total current assets
        inventory: Value of inventory
        current_liabilities: Total current liabilities
        
    Returns:
        Quick ratio, or 0 if liabilities are zero
    """
    quick_assets = current_assets - inventory
    if current_liabilities == 0:
        return float('inf') if quick_assets > 0 else 0.0
    return quick_assets / current_liabilities


def calculate_debt_to_equity(total_debt: float, total_equity: float) -> float:
    """
    Calculate debt-to-equity ratio (total debt / total equity).
    
    Measures financial leverage. Higher ratio means more debt financing.
    
    Args:
        total_debt: Total company debt
        total_equity: Total shareholder equity
        
    Returns:
        Debt-to-equity ratio, or -1 if equity is zero (undefined)
    """
    if total_equity == 0:
        return -1.0  # Undefined; company has no equity
    return total_debt / total_equity


def analyze_financial_health(company_name: str, financials: Dict[str, float]) -> Dict:
    """
    Comprehensive financial health analysis using multiple ratios.
    
    Args:
        company_name: Name of the company being analyzed
        financials: Dictionary with financial data
        
    Returns:
        Dictionary with all calculated ratios and interpretations
    """
    current_ratio = calculate_current_ratio(
        financials['current_assets'],
        financials['current_liabilities']
    )
    
    quick_ratio = calculate_quick_ratio(
        financials['current_assets'],
        financials['inventory'],
        financials['current_liabilities']
    )
    
    de_ratio = calculate_debt_to_equity(
        financials['total_debt'],
        financials['total_equity']
    )
    
    # Interpret results
    liquidity_status = "Strong" if current_ratio > 1.5 else "Weak" if current_ratio < 1.0 else "Adequate"
    leverage_status = "High" if de_ratio > 2.0 else "Low" if de_ratio < 0.5 else "Moderate"
    
    return {
        'company': company_name,
        'current_ratio': round(current_ratio, 2),
        'quick_ratio': round(quick_ratio, 2),
        'debt_to_equity': round(de_ratio, 2),
        'liquidity_assessment': liquidity_status,
        'leverage_assessment': leverage_status
    }


# Test with sample company data
company_financials = {
    'current_assets': 500000,
    'current_liabilities': 300000,
    'inventory': 150000,
    'total_debt': 800000,
    'total_equity': 600000
}

analysis = analyze_financial_health("TechCorp Inc", company_financials)

print(f"FINANCIAL ANALYSIS: {analysis['company']}")
print("=" * 50)
print(f"Current Ratio: {analysis['current_ratio']:.2f}")
print(f"Quick Ratio: {analysis['quick_ratio']:.2f}")
print(f"Debt-to-Equity: {analysis['debt_to_equity']:.2f}")
print(f"\nLiquidity: {analysis['liquidity_assessment']}")
print(f"Leverage: {analysis['leverage_assessment']}")
```

**Key Learning:** Notice how we broke the analysis into small, focused functions. Each calculation function does one thing, handles edge cases, and has clear documentation. The main `analyze_financial_health()` function composes these building blocks into a comprehensive analysis. This modularity means we can test each ratio calculation independently and reuse them in different contexts.

### Exercise 2: Customer Lifetime Value Calculator
**Problem:** Build a function that calculates customer lifetime value (CLV) using average purchase value, purchase frequency, and customer lifespan. Add an advanced version that includes discount rate for time-value of money and churn probability.

**Solution Approach:**
```python
def calculate_clv_simple(avg_purchase_value: float, 
                        purchase_frequency: float, 
                        customer_lifespan_years: float) -> float:
    """
    Calculate basic Customer Lifetime Value.
    
    CLV = Average Purchase Value × Purchase Frequency × Customer Lifespan
    
    Args:
        avg_purchase_value: Average transaction amount
        purchase_frequency: Number of purchases per year
        customer_lifespan_years: Expected years as active customer
        
    Returns:
        Estimated customer lifetime value
    """
    return avg_purchase_value * purchase_frequency * customer_lifespan_years


def calculate_clv_advanced(avg_purchase_value: float,
                          purchase_frequency: float,
                          customer_lifespan_years: int,
                          discount_rate: float = 0.10,
                          annual_churn_rate: float = 0.0) -> Dict[str, float]:
    """
    Calculate Customer Lifetime Value with time-value and churn.
    
    Accounts for:
    - Time value of money (discount rate)
    - Customer churn probability over time
    
    Args:
        avg_purchase_value: Average transaction amount
        purchase_frequency: Purchases per year
        customer_lifespan_years: Analysis period in years
        discount_rate: Annual discount rate (default 10%)
        annual_churn_rate: Probability customer stops buying (default 0%)
        
    Returns:
        Dictionary with CLV breakdown by year and totals
    """
    annual_revenue = avg_purchase_value * purchase_frequency
    retention_rate = 1 - annual_churn_rate
    
    yearly_values = []
    cumulative_clv = 0
    
    for year in range(1, customer_lifespan_years + 1):
        # Calculate probability customer is still active
        retention_probability = retention_rate ** (year - 1)
        
        # Calculate present value of that year's revenue
        present_value = (annual_revenue * retention_probability) / ((1 + discount_rate) ** year)
        
        cumulative_clv += present_value
        yearly_values.append({
            'year': year,
            'retention_prob': round(retention_probability, 3),
            'present_value': round(present_value, 2)
        })
    
    return {
        'total_clv': round(cumulative_clv, 2),
        'simple_clv': round(annual_revenue * customer_lifespan_years, 2),
        'yearly_breakdown': yearly_values,
        'parameters': {
            'annual_revenue': round(annual_revenue, 2),
            'discount_rate': discount_rate,
            'churn_rate': annual_churn_rate
        }
    }


def segment_customers_by_clv(customers: List[Dict], 
                             clv_threshold_premium: float = 5000) -> Dict[str, List]:
    """
    Segment customers based on their CLV.
    
    Args:
        customers: List of customer dictionaries with purchase data
        clv_threshold_premium: CLV threshold for premium segment
        
    Returns:
        Dictionary with segmented customer lists
    """
    premium_customers = []
    standard_customers = []
    
    for customer in customers:
        clv = calculate_clv_simple(
            customer['avg_purchase'],
            customer['annual_frequency'],
            customer['expected_lifespan']
        )
        
        customer_with_clv = customer.copy()
        customer_with_clv['clv'] = round(clv, 2)
        
        if clv >= clv_threshold_premium:
            premium_customers.append(customer_with_clv)
        else:
            standard_customers.append(customer_with_clv)
    
    return {
        'premium': sorted(premium_customers, key=lambda x: x['clv'], reverse=True),
        'standard': sorted(standard_customers, key=lambda x: x['clv'], reverse=True),
        'premium_count': len(premium_customers),
        'standard_count': len(standard_customers)
    }


# Example usage: Simple CLV
basic_clv = calculate_clv_simple(
    avg_purchase_value=100,
    purchase_frequency=4,  # 4 times per year
    customer_lifespan_years=5
)
print(f"Simple CLV: ${basic_clv:,.2f}\n")

# Example usage: Advanced CLV with time-value and churn
advanced_clv = calculate_clv_advanced(
    avg_purchase_value=100,
    purchase_frequency=4,
    customer_lifespan_years=5,
    discount_rate=0.10,
    annual_churn_rate=0.15  # 15% churn per year
)

print("ADVANCED CLV ANALYSIS")
print("=" * 60)
print(f"Simple CLV (no discounting): ${advanced_clv['simple_clv']:,.2f}")
print(f"Present Value CLV: ${advanced_clv['total_clv']:,.2f}")
print(f"\nYearly Breakdown:")
for year_data in advanced_clv['yearly_breakdown']:
    print(f"  Year {year_data['year']}: "
          f"${year_data['present_value']:>8,.2f} "
          f"(retention: {year_data['retention_prob']:.1%})")
```

**Key Learning:** This demonstrates function composition—the advanced function builds on the simple one, and the segmentation function uses both. Notice the progressive complexity: start with a simple, working implementation, then add sophistication. The type hints and docstrings make these functions self-documenting for team members.

### Exercise 3: Pricing Strategy Engine
**Problem:** Create a flexible pricing function that applies different strategies: cost-plus, competitive, value-based, and dynamic (time/demand-based). The function should take a product, context, and strategy type, returning the recommended price with justification.

**Solution Approach:**
```python
from typing import Literal, Optional
from datetime import datetime

def calculate_cost_plus_price(cost: float, markup_percentage: float) -> float:
    """Calculate price using cost-plus pricing."""
    return cost * (1 + markup_percentage)


def calculate_competitive_price(competitor_prices: List[float], 
                               position: Literal['premium', 'match', 'undercut']) -> float:
    """
    Calculate price based on competitive positioning.
    
    Args:
        competitor_prices: List of competitor prices for similar products
        position: Pricing position strategy
        
    Returns:
        Recommended price based on competitive analysis
    """
    if not competitor_prices:
        return 0.0
    
    avg_competitor_price = sum(competitor_prices) / len(competitor_prices)
    
    if position == 'premium':
        return avg_competitor_price * 1.15  # 15% above market
    elif position == 'match':
        return avg_competitor_price
    else:  # undercut
        return avg_competitor_price * 0.95  # 5% below market


def calculate_value_based_price(perceived_value: float, 
                                value_capture_rate: float = 0.50) -> float:
    """
    Calculate price based on customer perceived value.
    
    Args:
        perceived_value: What customer believes product is worth
        value_capture_rate: Percentage of value to capture as price
        
    Returns:
        Price that captures portion of perceived value
    """
    return perceived_value * value_capture_rate


def calculate_dynamic_price(base_price: float,
                           demand_level: Literal['low', 'medium', 'high'],
                           time_of_day: Optional[int] = None,
                           day_of_week: Optional[str] = None) -> float:
    """
    Calculate price with dynamic adjustments for demand and timing.
    
    Args:
        base_price: Starting price before adjustments
        demand_level: Current demand level
        time_of_day: Hour (0-23) for time-based pricing
        day_of_week: Day name for day-based pricing
        
    Returns:
        Dynamically adjusted price
    """
    price = base_price
    
    # Demand-based adjustment
    demand_multipliers = {'low': 0.85, 'medium': 1.0, 'high': 1.25}
    price *= demand_multipliers.get(demand_level, 1.0)
    
    # Time-of-day adjustment (premium during peak hours)
    if time_of_day is not None:
        if 9 <= time_of_day <= 11 or 17 <= time_of_day <= 19:  # Peak hours
            price *= 1.10
    
    # Day-of-week adjustment (premium on weekends)
    if day_of_week in ['Saturday', 'Sunday']:
        price *= 1.15
    
    return price


def determine_optimal_price(
    product: Dict,
    context: Dict,
    strategy: Literal['cost_plus', 'competitive', 'value_based', 'dynamic']
) -> Dict:
    """
    Comprehensive pricing engine that applies selected strategy.
    
    Args:
        product: Dictionary with product details (cost, perceived_value, etc.)
        context: Dictionary with market context (competitors, demand, time, etc.)
        strategy: Pricing strategy to apply
        
    Returns:
        Dictionary with recommended price and justification
    """
    if strategy == 'cost_plus':
        price = calculate_cost_plus_price(
            product['cost'],
            context.get('markup_percentage', 0.30)
        )
        justification = f"Cost (${product['cost']}) + {context.get('markup_percentage', 0.30):.0%} markup"
        
    elif strategy == 'competitive':
        price = calculate_competitive_price(
            context.get('competitor_prices', []),
            context.get('position', 'match')
        )
        avg_comp = sum(context.get('competitor_prices', [0])) / len(context.get('competitor_prices', [1]))
        justification = f"{context.get('position', 'match').title()} strategy vs. avg competitor price ${avg_comp:.2f}"
        
    elif strategy == 'value_based':
        price = calculate_value_based_price(
            product.get('perceived_value', 0),
            context.get('value_capture_rate', 0.50)
        )
        justification = f"Capturing {context.get('value_capture_rate', 0.50):.0%} of ${product.get('perceived_value', 0):.2f} perceived value"
        
    else:  # dynamic
        base_price = product.get('base_price', product['cost'] * 1.30)
        price = calculate_dynamic_price(
            base_price,
            context.get('demand_level', 'medium'),
            context.get('time_of_day'),
            context.get('day_of_week')
        )
        justification = f"Dynamic pricing: {context.get('demand_level', 'medium')} demand, base ${base_price:.2f}"
    
    return {
        'product_name': product['name'],
        'recommended_price': round(price, 2),
        'strategy_used': strategy,
        'justification': justification,
        'cost': product.get('cost', 0),
        'margin': round(((price - product.get('cost', 0)) / price * 100), 2) if price > 0 else 0
    }


# Test all pricing strategies
product = {
    'name': 'Premium Widget',
    'cost': 50.00,
    'base_price': 75.00,
    'perceived_value': 120.00
}

# Test cost-plus pricing
cost_plus_context = {'markup_percentage': 0.40}
cost_plus_result = determine_optimal_price(product, cost_plus_context, 'cost_plus')

# Test competitive pricing
competitive_context = {
    'competitor_prices': [70.00, 75.00, 72.00, 78.00],
    'position': 'premium'
}
competitive_result = determine_optimal_price(product, competitive_context, 'competitive')

# Test value-based pricing
value_context = {'value_capture_rate': 0.60}
value_result = determine_optimal_price(product, value_context, 'value_based')

# Test dynamic pricing
now = datetime.now()
dynamic_context = {
    'demand_level': 'high',
    'time_of_day': now.hour,
    'day_of_week': now.strftime('%A')
}
dynamic_result = determine_optimal_price(product, dynamic_context, 'dynamic')

# Display all results
print("PRICING STRATEGY COMPARISON")
print("=" * 70)
for result in [cost_plus_result, competitive_result, value_result, dynamic_result]:
    print(f"\nStrategy: {result['strategy_used'].upper().replace('_', ' ')}")
    print(f"Recommended Price: ${result['recommended_price']:.2f}")
    print(f"Margin: {result['margin']:.1f}%")
    print(f"Justification: {result['justification']}")
```

**Key Learning:** This showcases modular function design at scale. Each pricing strategy is its own function with a clear interface. The main `determine_optimal_price()` function acts as a router, selecting the appropriate strategy function based on input. This architecture makes it trivial to add new pricing strategies, test each independently, and compose them in complex ways (e.g., choosing the minimum of competitive and value-based pricing).

## ✅ Mastery Check

1. **Basic Understanding:** Explain the difference between parameters and arguments. What happens to variables created inside a function after the function finishes executing?

2. **Intermediate Design:** Write a function that takes a list of transactions and returns both the total and the count. Should this return two separate values, a tuple, or a dictionary? Justify your choice.

3. **Business Application:** You need to calculate employee bonuses based on performance rating (1-5), department (Sales, Engineering, Operations), and years of service. Design the function signature—what parameters would you include, what would you return, and how would you handle edge cases?

4. **Debugging & Refactoring:** What's wrong with this function, and how would you improve it?
   ```python
   def process(data, x, y, z=None):
       result = []
       for item in data:
           if x:
               temp = item * y
           else:
               temp = item + y
           if z:
               temp = temp - z
           result.append(temp)
       return result
   ```

5. **Advanced Architecture:** You're building a financial modeling system where calculations need to be auditable (who ran what calculation, with what inputs, at what time). How would you design your functions to support this requirement without littering every function with logging code? Consider decorators, context managers, or other architectural patterns.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 10 – Day 10: Loops - Automating Repetitive Business Tasks](../Day_10_Loops/README.md) • **Next:** [Day 12 – Day 12: List Comprehension - Elegant Data Manipulation](../Day_12_List_Comprehension/README.md)

_You are on lesson 11 of 108._

<!-- LESSON_FOOTER_END -->
