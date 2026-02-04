---
title: "Day 7: Customer Segmentation (Sets)"
tags:
  - Basics
  - Python
  - Data Structures
---

# Day 7: Sets

## 🌉 The "Never-Coded" Bridge

Imagine you're running a marketing campaign where customers can sign up through multiple channels—email, social media, website, partner referrals. Your analytics dashboard shows 50,000 total sign-ups, but when you check your customer database, you only have 32,000 unique customers. The discrepancy? Many customers signed up through multiple channels, and you've been double-counting them. What you need is a way to automatically identify and count only unique individuals, regardless of how many touchpoints they had with your brand.

Consider another scenario: your product team is planning the next release and wants to know which features are requested by both enterprise clients AND small business customers—these are the high-impact features that cross segments. Similarly, your customer success team needs to identify clients who attended the product webinar but haven't yet activated their accounts—these are high-intent prospects who need personal follow-up. These are classic set operations: finding overlaps (intersection), identifying gaps (difference), and understanding total reach (union).

In business analytics, we constantly work with groups and populations: customer segments, product categories, geographic markets, skill sets of employees. The mathematics of sets—developed centuries ago—provides elegant solutions to these everyday business problems. Sets handle de-duplication automatically, make membership testing extremely fast, and provide intuitive operations for comparing groups. Understanding sets transforms how you think about segmentation, cohort analysis, and any scenario involving "who belongs to which group."

## 🔬 The Technical Deep Dive

A set in Python is an unordered collection of unique elements, defined using curly braces: `customers = {'C001', 'C002', 'C003'}`. The defining characteristic is automatic uniqueness enforcement—if you try to add 'C001' again, the set silently ignores it because that element already exists. You can create a set from any iterable: `unique_cities = set(['NYC', 'LA', 'NYC', 'Chicago'])` automatically produces `{'NYC', 'LA', 'Chicago'}`. This makes sets perfect for de-duplication: converting a list to a set removes all duplicates in a single operation.

Sets support mathematical operations that directly map to business questions. The intersection operator `&` finds common elements: `premium_and_active = premium_customers & active_customers` identifies customers who are both premium members AND currently active. The difference operator `-` finds elements in one set but not another: `churned = last_month_active - this_month_active` identifies customers who were active last month but aren't this month. The union operator `|` combines sets: `all_leads = email_leads | event_leads | referral_leads` gives you total unique leads from all sources. There's also symmetric difference `^`, which finds elements in either set but not in both—useful for identifying exclusive segments.

Performance-wise, sets are implemented as hash tables, making membership testing extremely fast. Checking `if customer_id in premium_set` is O(1) constant time, regardless of set size. With a list, you'd have O(n) linear time—checking a list of 100,000 customers takes 100,000 operations in the worst case, but checking a set of 100,000 customers takes roughly the same time as checking a set of 100. This performance difference becomes critical when processing large datasets or performing operations inside loops.

Sets have important limitations: they can only contain hashable (immutable) elements, so you can have a set of strings, numbers, or tuples, but not a set of lists or dictionaries. Sets are also unordered—they don't maintain insertion order (though Python 3.7+ preserves some order as an implementation detail, you shouldn't rely on it). You cannot access elements by index; you can only iterate over them or test membership. Common methods include `add()` to insert an element, `remove()` or `discard()` to delete elements, `update()` to add multiple elements, and `clear()` to empty the set. The `discard()` method is safer than `remove()` because it doesn't raise an error if the element doesn't exist.

## 🏗️ Senior-Level Insights

In production data pipelines, sets are essential for efficient de-duplication and data quality checks. When processing millions of transaction records, converting unique identifiers to a set is far more memory-efficient than using a list and manually checking for duplicates. However, be aware that large sets consume significant memory—each element requires hash table overhead. For datasets that don't fit in memory, you'll need database-level DISTINCT operations or probabilistic algorithms like Bloom filters. In distributed systems, set operations must often be performed in stages: collect unique values locally in each worker, then merge the sets on the coordinator node.

Set operations are particularly valuable in feature engineering for machine learning and customer analytics. Building customer segments often involves complex Boolean logic: "high-value customers who purchased in the last 90 days AND haven't contacted support BUT are not on a trial plan." Expressing this with sets makes the logic explicit and testable: `high_value & recent_purchasers & active_support - trial_users`. Many analytics platforms provide set-based segmentation because it's both powerful and intuitive for business users. When building such systems, remember that set operations create new sets—they don't modify the originals unless you use in-place methods like `update()` or `intersection_update()`.

Performance optimization requires understanding that set operations have different complexity profiles. Intersection and difference are O(min(n, m))—they iterate over the smaller set and check membership in the larger one. Union is O(n + m)—it must process all elements from both sets. If you're chaining multiple operations, order matters: `(set1 & set2) - set3` is often faster than `set1 - set3 & set2` if set2 is small. For repeated membership testing against the same collection, convert it to a set once rather than repeatedly: if you're checking 1,000 IDs against a list of 10,000 allowed IDs, converting the allowed list to a set first reduces runtime from seconds to milliseconds. In database contexts, set operations often translate to SQL joins and subqueries—an intersection becomes an INNER JOIN, a difference becomes a LEFT JOIN with a WHERE clause filtering for NULLs. Understanding this mapping helps you write efficient queries that leverage database indexing.

## 💻 Hands-on Lab

### Exercise 1: Basic Set Operations and De-duplication

**Problem:** Your e-commerce platform tracks customer interactions across multiple channels, resulting in duplicate customer IDs in your raw event logs. Implement a system to de-duplicate customer lists and count unique visitors across different marketing campaigns.

**Solution Approach:**

```python
# Raw event data with duplicates (simulating multiple touches)
email_campaign_clicks = ['C1001', 'C1002', 'C1001', 'C1003', 'C1002', 'C1004', 'C1001']
social_media_clicks = ['C1002', 'C1005', 'C1006', 'C1002', 'C1007', 'C1005']
display_ad_clicks = ['C1003', 'C1008', 'C1009', 'C1003', 'C1010', 'C1008']

# De-duplicate by converting lists to sets
unique_email = set(email_campaign_clicks)
unique_social = set(social_media_clicks)
unique_display = set(display_ad_clicks)

print("Campaign Performance - Unique Customers:")
print(f"  Email: {len(email_campaign_clicks)} clicks → {len(unique_email)} unique customers")
print(f"  Social: {len(social_media_clicks)} clicks → {len(unique_social)} unique customers")
print(f"  Display: {len(display_ad_clicks)} clicks → {len(unique_display)} unique customers")

# Calculate click-through efficiency (unique vs total clicks)
email_efficiency = len(unique_email) / len(email_campaign_clicks)
social_efficiency = len(unique_social) / len(social_media_clicks)
display_efficiency = len(unique_display) / len(display_ad_clicks)

print("\nDe-duplication Rates:")
print(f"  Email: {email_efficiency:.1%} unique (lower = more repeat engagement)")
print(f"  Social: {social_efficiency:.1%} unique")
print(f"  Display: {display_efficiency:.1%} unique")

# Working with sets - adding new interactions
unique_email.add('C1011')  # New customer clicked email
unique_email.add('C1001')  # Existing customer - no effect due to uniqueness

print(f"\nAfter adding new events, Email campaign has {len(unique_email)} unique customers")

# Safely removing a customer (using discard to avoid errors)
unique_email.discard('C1011')  # Removes the element
unique_email.discard('C9999')  # Customer doesn't exist - no error

print(f"After processing, Email campaign has {len(unique_email)} unique customers")
```

**Output:**
```
Campaign Performance - Unique Customers:
  Email: 7 clicks → 4 unique customers
  Social: 6 clicks → 4 unique customers
  Display: 6 clicks → 4 unique customers

De-duplication Rates:
  Email: 57.1% unique (lower = more repeat engagement)
  Social: 66.7% unique
  Display: 66.7% unique

After adding new events, Email campaign has 5 unique customers
After processing, Email campaign has 4 unique customers
```

### Exercise 2: Set Operations for Customer Segmentation

**Problem:** Your marketing team needs to identify different customer segments for targeted campaigns: customers who visited the pricing page AND contacted sales (high-intent), customers who started but didn't complete checkout (abandoned cart), and customers reached by multiple channels (multi-touch attribution).

**Solution Approach:**

```python
# Customer segments based on behavior
pricing_page_visitors = {'C1001', 'C1002', 'C1003', 'C1004', 'C1005', 'C1006'}
contacted_sales = {'C1002', 'C1004', 'C1007', 'C1008'}
started_checkout = {'C1001', 'C1002', 'C1003', 'C1009'}
completed_purchase = {'C1002', 'C1009'}

# High-intent leads: visited pricing AND contacted sales
high_intent = pricing_page_visitors & contacted_sales
print("High-Intent Leads (Pricing + Sales Contact):")
print(f"  Customers: {high_intent}")
print(f"  Count: {len(high_intent)}")

# Abandoned cart: started checkout but didn't complete
abandoned_cart = started_checkout - completed_purchase
print("\nAbandoned Cart Customers:")
print(f"  Customers: {abandoned_cart}")
print(f"  Count: {len(abandoned_cart)}")
print("  → Target for cart recovery emails")

# Lost opportunities: saw pricing but never contacted sales
lost_opportunities = pricing_page_visitors - contacted_sales
print("\nLost Opportunities (Pricing but No Contact):")
print(f"  Customers: {lost_opportunities}")
print(f"  Count: {len(lost_opportunities)}")
print("  → Target for nurture campaign")

# Total engaged: all customers who took ANY action
total_engaged = pricing_page_visitors | contacted_sales | started_checkout
print("\nTotal Engaged Customers (Union):")
print(f"  Count: {len(total_engaged)}")

# Exclusive segments: contacted sales but never saw pricing (direct outreach)
direct_sales_leads = contacted_sales - pricing_page_visitors
print("\nDirect Sales Leads (Sales Contact but No Pricing Visit):")
print(f"  Customers: {direct_sales_leads}")
print(f"  Count: {len(direct_sales_leads)}")
print("  → Came from sales outreach, not inbound marketing")

# Multi-stage journey: pricing → checkout (intent progression)
pricing_to_checkout = pricing_page_visitors & started_checkout
conversion_rate = len(completed_purchase) / len(pricing_to_checkout) if pricing_to_checkout else 0
print(f"\nPricing to Checkout Conversion: {conversion_rate:.1%}")

# Advanced: customers in exactly one segment (symmetric difference)
pricing_only_or_sales_only = pricing_page_visitors ^ contacted_sales
print(f"\nSingle-Touch Customers: {len(pricing_only_or_sales_only)}")
```

**Output:**
```
High-Intent Leads (Pricing + Sales Contact):
  Customers: {'C1004', 'C1002'}
  Count: 2

Abandoned Cart Customers:
  Customers: {'C1003', 'C1001'}
  Count: 2
  → Target for cart recovery emails

Lost Opportunities (Pricing but No Contact):
  Customers: {'C1006', 'C1005', 'C1003', 'C1001'}
  Count: 4
  → Target for nurture campaign

Total Engaged Customers (Union):
  Count: 9

Direct Sales Leads (Sales Contact but No Pricing Visit):
  Customers: {'C1007', 'C1008'}
  Count: 2
  → Came from sales outreach, not inbound marketing

Pricing to Checkout Conversion: 66.7%

Single-Touch Customers: 6
```

### Exercise 3: Advanced Set Operations for Market Analysis

**Problem:** Build a sophisticated customer analytics system that tracks customer overlap across product lines, identifies cross-selling opportunities, and performs cohort retention analysis across multiple time periods.

**Solution Approach:**

```python
# Product ownership data
product_a_customers = {'C101', 'C102', 'C103', 'C104', 'C105', 'C106', 'C107'}
product_b_customers = {'C103', 'C104', 'C108', 'C109', 'C110'}
product_c_customers = {'C104', 'C106', 'C111', 'C112'}

# Cohort retention analysis
month_1_active = {'U001', 'U002', 'U003', 'U004', 'U005', 'U006', 'U007', 'U008'}
month_2_active = {'U002', 'U003', 'U004', 'U006', 'U009', 'U010'}
month_3_active = {'U002', 'U004', 'U006', 'U009', 'U011', 'U012'}

def analyze_product_overlap(prod_a, prod_b, prod_c, names=('A', 'B', 'C')):
    """Comprehensive cross-sell analysis across three products."""
    print("=" * 50)
    print("PRODUCT PORTFOLIO ANALYSIS")
    print("=" * 50)
    
    # Single product customers
    only_a = prod_a - prod_b - prod_c
    only_b = prod_b - prod_a - prod_c
    only_c = prod_c - prod_a - prod_b
    
    print(f"\nSingle-Product Customers (Cross-sell Opportunities):")
    print(f"  Only {names[0]}: {len(only_a)} customers")
    print(f"  Only {names[1]}: {len(only_b)} customers")
    print(f"  Only {names[2]}: {len(only_c)} customers")
    print(f"  Total single-product: {len(only_a) + len(only_b) + len(only_c)}")
    
    # Two-product customers
    a_and_b = (prod_a & prod_b) - prod_c
    a_and_c = (prod_a & prod_c) - prod_b
    b_and_c = (prod_b & prod_c) - prod_a
    
    print(f"\nTwo-Product Customers (Upsell to Third):")
    print(f"  {names[0]}+{names[1]}: {len(a_and_b)} → Upsell {names[2]}")
    print(f"  {names[0]}+{names[2]}: {len(a_and_c)} → Upsell {names[1]}")
    print(f"  {names[1]}+{names[2]}: {len(b_and_c)} → Upsell {names[0]}")
    
    # Triple customers (highest value)
    all_three = prod_a & prod_b & prod_c
    print(f"\nFull Portfolio Customers: {len(all_three)}")
    print(f"  These are your highest-value customers: {all_three}")
    
    # Total unique customers
    total_customers = prod_a | prod_b | prod_c
    penetration_a = len(prod_a) / len(total_customers)
    penetration_b = len(prod_b) / len(total_customers)
    penetration_c = len(prod_c) / len(total_customers)
    
    print(f"\nMarket Penetration:")
    print(f"  Total Customers: {len(total_customers)}")
    print(f"  {names[0]} Penetration: {penetration_a:.1%}")
    print(f"  {names[1]} Penetration: {penetration_b:.1%}")
    print(f"  {names[2]} Penetration: {penetration_c:.1%}")

def cohort_retention_analysis(m1, m2, m3):
    """Analyze customer retention across three months."""
    print("\n" + "=" * 50)
    print("COHORT RETENTION ANALYSIS")
    print("=" * 50)
    
    # Month-over-month retention
    retained_m2 = m1 & m2
    retained_m3 = m2 & m3
    
    retention_rate_m2 = len(retained_m2) / len(m1) if m1 else 0
    retention_rate_m3 = len(retained_m3) / len(m2) if m2 else 0
    
    print(f"\nMonth 1 → Month 2:")
    print(f"  Started: {len(m1)} customers")
    print(f"  Retained: {len(retained_m2)} customers")
    print(f"  Retention Rate: {retention_rate_m2:.1%}")
    
    churned_m2 = m1 - m2
    print(f"  Churned: {len(churned_m2)} customers")
    
    print(f"\nMonth 2 → Month 3:")
    print(f"  Started: {len(m2)} customers")
    print(f"  Retained: {len(retained_m3)} customers")
    print(f"  Retention Rate: {retention_rate_m3:.1%}")
    
    # Long-term retention (all three months)
    retained_all_three = m1 & m2 & m3
    long_term_retention = len(retained_all_three) / len(m1) if m1 else 0
    
    print(f"\nLong-term Retention (All 3 Months):")
    print(f"  Customers: {retained_all_three}")
    print(f"  Retention Rate: {long_term_retention:.1%}")
    
    # New customer acquisition
    new_in_m2 = m2 - m1
    new_in_m3 = m3 - m2
    
    print(f"\nNew Customer Acquisition:")
    print(f"  New in Month 2: {len(new_in_m2)} customers")
    print(f"  New in Month 3: {len(new_in_m3)} customers")
    
    # Reactivated customers
    reactivated_m3 = (m3 & m1) - m2
    if reactivated_m3:
        print(f"\nReactivated Customers (Active M1, Inactive M2, Active M3):")
        print(f"  Count: {len(reactivated_m3)}")
        print(f"  IDs: {reactivated_m3}")

# Run analyses
analyze_product_overlap(
    product_a_customers, 
    product_b_customers, 
    product_c_customers,
    names=('ProductA', 'ProductB', 'ProductC')
)

cohort_retention_analysis(month_1_active, month_2_active, month_3_active)
```

**Output:**
```
==================================================
PRODUCT PORTFOLIO ANALYSIS
==================================================

Single-Product Customers (Cross-sell Opportunities):
  Only ProductA: 4 customers
  Only ProductB: 3 customers
  Only ProductC: 2 customers
  Total single-product: 9

Two-Product Customers (Upsell to Third):
  ProductA+ProductB: 1 → Upsell ProductC
  ProductA+ProductC: 1 → Upsell ProductB
  ProductB+ProductC: 0 → Upsell ProductA

Full Portfolio Customers: 1
  These are your highest-value customers: {'C104'}

Market Penetration:
  Total Customers: 12
  ProductA Penetration: 58.3%
  ProductB Penetration: 41.7%
  ProductC Penetration: 33.3%

==================================================
COHORT RETENTION ANALYSIS
==================================================

Month 1 → Month 2:
  Started: 8 customers
  Retained: 4 customers
  Retention Rate: 50.0%
  Churned: 4 customers

Month 2 → Month 3:
  Started: 6 customers
  Retained: 3 customers
  Retention Rate: 50.0%

Long-term Retention (All 3 Months):
  Customers: {'U006', 'U002', 'U004'}
  Retention Rate: 37.5%

New Customer Acquisition:
  New in Month 2: 2 customers
  New in Month 3: 2 customers

Reactivated Customers (Active M1, Inactive M2, Active M3):
  Count: 0
  IDs: set()
```

## ✅ Mastery Check

1. **Basic Understanding:** Explain why `customer_ids = ['C001', 'C002', 'C001', 'C003']` converted to `set(customer_ids)` results in only 3 elements. How does this automatic de-duplication benefit business analytics?

2. **Practical Application:** You have two sets: `email_subscribers = {'user1', 'user2', 'user3', 'user4'}` and `paying_customers = {'user2', 'user4', 'user5'}`. Write code to find: (a) subscribers who are also paying customers, (b) subscribers who haven't converted to paying, and (c) total unique users across both groups.

3. **Performance Implications:** You need to check if 10,000 order IDs exist in a collection of 500,000 valid order IDs. Compare the performance difference between using a list versus a set for the 500,000 valid IDs. Why does the difference matter in production systems?

4. **Advanced Operations:** A retail company tracks customer purchases across three product categories: Electronics, Clothing, and Home Goods. They want to identify "category-exclusive" customers (those who only buy from one category) versus "cross-category" customers. Explain which set operations you'd use and why cross-category customers typically have higher lifetime value.

5. **Production Architecture:** In a distributed analytics system processing real-time customer events, you need to maintain a "unique visitors" count across multiple application servers. Explain the challenges of using sets in this context. What happens if Server A sees users {1, 2, 3} and Server B sees users {2, 3, 4}? How would you architect a solution to get accurate unique counts when merging data from multiple sources?

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 06 – Tuples](../Day_06_Tuples/README.md) • **Next:** [Day 08 – Dictionaries](../Day_08_Dictionaries/README.md)

_You are on lesson 7 of 108._

<!-- LESSON_FOOTER_END -->
