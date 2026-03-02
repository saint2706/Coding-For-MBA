# 🚛 Case Study 09: Supply Chain Inventory Optimisation

> **Phases covered**: Phase 4 (Mathematical Foundations)
> **Difficulty**: Intermediate → Advanced
> **Estimated time**: 8–10 hours

---

## 🎯 Case Overview

**LogiFlow Manufacturing** operates 5 distribution centres (DCs) supplying
200 retailers across the country. Inventory holding costs are **$14 M/year**,
and stockout losses are **$8 M/year**. The COO wants an **inventory
optimisation system** that determines how much of each product to hold at
each DC to minimise total cost (holding + stockout + ordering) while
meeting a 95% service level target.

Your mission: formulate the problem as a Linear Program (LP), solve it,
then build a Monte Carlo simulation to validate the solution under demand
uncertainty.

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Distribution centres | 5 |
| Retailers served | 200 |
| SKUs managed | 500 |
| Annual holding cost | $14 M |
| Annual stockout cost | $8 M |
| Target service level | 95% |
| Annual ordering cost | $3 M |

**Key question:** *How much inventory should each DC hold for each product
to minimise total cost while meeting service levels?*

---

## 🗂️ Project Structure

```
09_supply_chain_inventory/
├── README.md           ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs
└── data_generator.py   ← creates synthetic supply chain dataset
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 4 | Linear programming, optimisation fundamentals |
| Phase 4 | Monte Carlo simulation, probability distributions |
| Phase 37B | Normal distribution, safety stock calculations |
| Phase 2 | Pandas for data wrangling, NumPy for numerical computation |

---

## 🤝 Hand-Holding Walkthrough

### Step 1 — Generate & Explore Supply Chain Data

**What:** Create a synthetic dataset with product demand forecasts,
lead times, holding costs, stockout costs, and ordering costs for
50 products across 5 DCs.

**Why:** Real supply chain data involves complex ERP systems. Our
synthetic data preserves the essential structure: stochastic demand,
variable lead times, and product-specific cost parameters.

**How:**

```python
python data_generator.py          # creates supply_chain.csv
df = pd.read_csv("supply_chain.csv")
print(df.shape)
print(df[["holding_cost_unit", "stockout_cost_unit", "order_cost"]].describe())
print(f"Products: {df['product_id'].nunique()}")
print(f"DCs: {df['dc_id'].nunique()}")
```

**✅ Checkpoint:** 50 products × 5 DCs = 250 rows. Stockout cost should be
3–5× holding cost (typical ratio).

---

### Step 2 — Economic Order Quantity (EOQ)

**What:** Calculate the classic EOQ for each product-DC combination as a
baseline.

**Why:** EOQ is the closed-form solution for the simplest inventory model.
It's rarely optimal in practice (assumes constant demand, no stockouts),
but it provides a useful starting point.

**How:**

```python
def calculate_eoq(demand_annual, order_cost, holding_cost):
    """Classic Economic Order Quantity formula."""
    return np.sqrt(2 * demand_annual * order_cost / holding_cost)

df["eoq"] = calculate_eoq(
    df["demand_annual"],
    df["order_cost"],
    df["holding_cost_unit"]
)
print(df[["product_id", "dc_id", "eoq"]].head(10))
```

**✅ Checkpoint:** EOQ values should range from 50–500 units. Compare
total cost under EOQ vs. current ordering policy.

---

### Step 3 — Safety Stock Calculation

**What:** Calculate safety stock for each product-DC to achieve the 95%
service level target.

**Why:** Demand is uncertain. Safety stock is the extra inventory held
to buffer against demand variability during lead time. The 95% service
level means we want to fulfil 95% of orders without a stockout.

**How:**

```python
from scipy.stats import norm

SERVICE_LEVEL = 0.95
z_score = norm.ppf(SERVICE_LEVEL)  # 1.645

df["demand_std_leadtime"] = df["demand_daily_std"] * np.sqrt(df["lead_time_days"])
df["safety_stock"] = z_score * df["demand_std_leadtime"]
df["reorder_point"] = df["demand_daily_mean"] * df["lead_time_days"] + df["safety_stock"]

print(f"Average safety stock: {df['safety_stock'].mean():.0f} units")
print(f"Average reorder point: {df['reorder_point'].mean():.0f} units")
```

**✅ Checkpoint:** Safety stock should represent 15–30% of average
inventory. Higher-variability products need more safety stock.

---

### Step 4 — Linear Programming Optimisation

**What:** Formulate and solve a Linear Program that minimises total
inventory cost subject to service level constraints and DC capacity.

**Why:** LP provides the mathematically optimal solution when costs are
linear and constraints are well-defined. In practice, LP is used by
companies like Amazon and Walmart for inventory allocation.

**How:**

```python
from scipy.optimize import linprog

# Decision variables: inventory level for each product-DC (250 variables)
n = len(df)

# Objective: minimise holding cost
c = df["holding_cost_unit"].values

# Constraints:
# 1. Inventory >= reorder_point (service level)
# 2. Total inventory per DC <= DC capacity
# 3. Inventory >= 0

# Service level constraint: x_i >= reorder_point_i
# In standard form: -x_i <= -reorder_point_i
A_ub = -np.eye(n)
b_ub = -df["reorder_point"].values

# DC capacity constraints
dc_capacity = {"DC_1": 10000, "DC_2": 8000, "DC_3": 12000, "DC_4": 7000, "DC_5": 9000}
A_cap = []
b_cap = []
for dc, cap in dc_capacity.items():
    row = (df["dc_id"] == dc).astype(float).values
    A_cap.append(row)
    b_cap.append(cap)

A_ub = np.vstack([A_ub, A_cap])
b_ub = np.concatenate([b_ub, b_cap])

result = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=[(0, None)] * n, method="highs")
df["optimal_inventory"] = result.x
print(f"Optimal total cost: ${result.fun:,.0f}")
```

**✅ Checkpoint:** Total cost under LP should be 15–25% lower than under
EOQ. All service level constraints should be satisfied.

---

### Step 5 — Monte Carlo Simulation

**What:** Simulate 10,000 demand scenarios to validate the LP solution
and estimate the distribution of actual service levels and costs.

**Why:** LP assumes demand is deterministic. Monte Carlo tells us "given
our optimal inventory levels, what is the *probability distribution* of
costs and service levels under real demand uncertainty?"

**How:**

```python
N_SIMULATIONS = 10_000
results = []

for sim in range(N_SIMULATIONS):
    # Sample random demand for each product-DC
    demand = np.random.normal(
        df["demand_daily_mean"].values * 30,  # monthly demand
        df["demand_daily_std"].values * np.sqrt(30)
    ).clip(0)

    inventory = df["optimal_inventory"].values
    stockouts = np.maximum(demand - inventory, 0)
    holding = np.maximum(inventory - demand, 0)

    total_cost = (
        (holding * df["holding_cost_unit"].values).sum()
        + (stockouts * df["stockout_cost_unit"].values).sum()
    )
    service_level = (stockouts == 0).mean()
    results.append({"cost": total_cost, "service_level": service_level})

sim_df = pd.DataFrame(results)
print(f"Mean cost: ${sim_df['cost'].mean():,.0f}")
print(f"Mean service level: {sim_df['service_level'].mean():.1%}")
print(f"P(service level >= 95%): {(sim_df['service_level'] >= 0.95).mean():.1%}")
```

**✅ Checkpoint:** Mean service level should be ≥ 95%. Plot the cost
distribution histogram.

---

### Step 6 — Sensitivity Analysis & Recommendations

**What:** Test how the optimal solution changes as parameters vary.

**Why:** The COO needs to understand: "What if demand increases by 20%?"
or "What if lead times double?"

**How:**

```python
scenarios = {
    "Base": 1.0,
    "Demand +20%": 1.2,
    "Demand -20%": 0.8,
    "Lead time 2×": 2.0,  # affects safety stock
}

for name, factor in scenarios.items():
    modified_demand = df["demand_daily_mean"] * factor
    modified_safety = z_score * df["demand_daily_std"] * np.sqrt(
        df["lead_time_days"] * (factor if "Lead" in name else 1.0)
    )
    total_inv = (modified_demand * df["lead_time_days"] + modified_safety).sum()
    cost = (total_inv * df["holding_cost_unit"]).sum()
    print(f"{name}: Total inventory = {total_inv:,.0f}, Cost = ${cost:,.0f}")
```

**✅ Checkpoint:** Doubling lead times should increase safety stock
by ~40% (√2 factor). Document the sensitivity table.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | EOQ baseline analysis | Jupyter / .py |
| 2 | LP optimisation solution | .py |
| 3 | Monte Carlo simulation results | .py + histogram PNG |
| 4 | Sensitivity analysis table | Markdown |
| 5 | Executive summary for COO | Markdown |

---

## 🏆 Stretch Goals

- [ ] Add multi-echelon inventory optimisation (DCs + warehouses)
- [ ] Implement a (s, S) policy with simulation comparison
- [ ] Build a Streamlit inventory dashboard
- [ ] Add demand forecasting integration (link to Case Study 06)
- [ ] Formulate as a Mixed-Integer Program (MIP) with batch ordering

---

## 📚 Reference Lessons

- Day 37–42: Mathematical foundations — linear algebra, optimisation (Phase 4)
- Day 37B: Probability — normal distribution, confidence intervals
- Day 43–48: Modelling fundamentals — problem formulation (Phase 4)
- Day 132: Capstone Cloud Data Pipeline — data integration concepts (Phase 11)

---

*This case study demonstrates quantitative optimisation skills — highly
valued in operations research, consulting, and supply chain analytics roles.*
