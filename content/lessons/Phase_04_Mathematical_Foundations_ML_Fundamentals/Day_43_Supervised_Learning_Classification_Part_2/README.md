---
day: 43
title: "Supervised Learning: Classification Part 2"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "classification-part2"
duration: 55
difficulty: "intermediate"
tags:
  - machine-learning
  - classification
  - decision-trees
  - random-forest
  - hyperparameter-tuning
concepts:
  - "decision trees"
  - "random forests"
  - "feature importance"
  - "hyperparameter tuning"
  - "cross-validation"
prerequisites: [42]
outcomes:
  - "Build and interpret decision trees"
  - "Understand ensemble methods with random forests"
  - "Tune hyperparameters systematically"
  - "Extract feature importance from tree models"
---

# 🎯 Day 43: Supervised Learning—Classification Part 2

> *"Decision trees ask questions. Random forests ask many questions and vote."*

---

## The "Never-Coded" Bridge

**You're a loan officer.** For each applicant, you ask a series of questions: "Is their income above $50K? Yes → Is their credit score above 700? Yes → Approve." This is exactly how a decision tree works—a flowchart of if-then rules learned from data.

**But what if one tree is biased or makes mistakes?** You'd want multiple opinions. That's a Random Forest: many trees voting together, each with a slightly different perspective.

**Tree-based models in industry:**

- **Banks**: Credit scoring and loan approval
- **Insurance**: Risk assessment
- **Healthcare**: Diagnosis decision support
- **E-commerce**: Product recommendations
- **Marketing**: Customer segmentation

---

## The Technical Deep Dive

### Decision Trees: Intuitive Classification

Decision trees split data based on feature thresholds to arrive at predictions.

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Create sample credit approval data
np.random.seed(42)
n = 500

income = np.random.uniform(20000, 150000, n)
credit_score = np.random.randint(300, 850, n)
debt_ratio = np.random.uniform(0, 1, n)
employment_years = np.random.randint(0, 30, n)

# Approval logic
approval_score = (
    0.4 * (income > 50000) +
    0.3 * (credit_score > 650) +
    0.2 * (debt_ratio < 0.4) +
    0.1 * (employment_years > 2)
)
approved = (approval_score + np.random.randn(n) * 0.15 > 0.5).astype(int)

df = pd.DataFrame({
    'income': income,
    'credit_score': credit_score,
    'debt_ratio': debt_ratio,
    'employment_years': employment_years,
    'approved': approved
})

X = df.drop('approved', axis=1)
y = df['approved']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train decision tree
tree_model = DecisionTreeClassifier(max_depth=4, random_state=42)
tree_model.fit(X_train, y_train)

# Visualize the tree
plt.figure(figsize=(20, 10))
plot_tree(tree_model, feature_names=X.columns, class_names=['Denied', 'Approved'],
          filled=True, rounded=True, fontsize=10)
plt.title('Decision Tree: Loan Approval')
plt.tight_layout()
plt.show()

# Evaluate
y_pred = tree_model.predict(X_test)
print("=== Decision Tree Performance ===")
print(f"Accuracy: {accuracy_score(y_test, y_pred):.3f}")
print(classification_report(y_test, y_pred, target_names=['Denied', 'Approved']))
```

### Understanding Tree Decisions

```python
# Feature importance
importance = pd.DataFrame({
    'Feature': X.columns,
    'Importance': tree_model.feature_importances_
}).sort_values('Importance', ascending=False)

print("=== Feature Importance ===")
print(importance.to_string(index=False))

# Visualize importance
plt.figure(figsize=(8, 5))
plt.barh(importance['Feature'], importance['Importance'])
plt.xlabel('Importance')
plt.title('Feature Importance (Decision Tree)')
plt.gca().invert_yaxis()
plt.tight_layout()
plt.show()

# Decision path for a sample
sample = X_test.iloc[[0]]
print(f"\n=== Sample Prediction Path ===")
print(f"Input: {sample.values[0]}")
print(f"Prediction: {'Approved' if tree_model.predict(sample)[0] else 'Denied'}")
print(f"Probability: {tree_model.predict_proba(sample)[0]}")
```

### Random Forests: Wisdom of the Crowd

```python
from sklearn.ensemble import RandomForestClassifier

# Train random forest
rf_model = RandomForestClassifier(
    n_estimators=100,      # Number of trees
    max_depth=10,          # Limit tree depth
    min_samples_split=5,   # Minimum samples to split
    random_state=42
)
rf_model.fit(X_train, y_train)

# Evaluate
y_pred_rf = rf_model.predict(X_test)
print("=== Random Forest Performance ===")
print(f"Accuracy: {accuracy_score(y_test, y_pred_rf):.3f}")

# Compare single tree vs forest
print("\n=== Comparison ===")
print(f"Single Tree Accuracy: {accuracy_score(y_test, y_pred):.3f}")
print(f"Random Forest Accuracy: {accuracy_score(y_test, y_pred_rf):.3f}")

# Feature importance (averaged across all trees)
rf_importance = pd.DataFrame({
    'Feature': X.columns,
    'Importance': rf_model.feature_importances_
}).sort_values('Importance', ascending=False)

print("\n=== RF Feature Importance ===")
print(rf_importance.to_string(index=False))
```

### How Random Forests Work

```
Random Forest (100 trees):
├── Tree 1: Trained on random sample, random features → Vote
├── Tree 2: Trained on different sample, different features → Vote
├── Tree 3: ...
└── Tree 100: ...

Final prediction = Majority vote (or average probability)
```

```python
# See individual tree predictions
sample = X_test.iloc[[0]]
sample_predictions = [tree.predict(sample)[0] for tree in rf_model.estimators_]

print(f"Individual tree votes: {sum(sample_predictions)} Approved, {100-sum(sample_predictions)} Denied")
print(f"Majority vote: {'Approved' if sum(sample_predictions) > 50 else 'Denied'}")
print(f"RF prediction: {'Approved' if rf_model.predict(sample)[0] else 'Denied'}")
```

### Hyperparameter Tuning with GridSearchCV

```python
from sklearn.model_selection import GridSearchCV

# Define parameter grid
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [5, 10, 15, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

# Grid search
grid_search = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    cv=5,                    # 5-fold cross-validation
    scoring='accuracy',      # or 'roc_auc', 'f1'
    n_jobs=-1,               # Use all CPU cores
    verbose=1
)

grid_search.fit(X_train, y_train)

# Best parameters
print("=== Grid Search Results ===")
print(f"Best Parameters: {grid_search.best_params_}")
print(f"Best CV Score: {grid_search.best_score_:.3f}")

# Evaluate best model
best_model = grid_search.best_estimator_
y_pred_best = best_model.predict(X_test)
print(f"Test Accuracy: {accuracy_score(y_test, y_pred_best):.3f}")
```

### Preventing Overfitting in Trees

```python
# Compare overfitting across max_depth values
depths = list(range(1, 20))
train_scores = []
test_scores = []

for depth in depths:
    model = DecisionTreeClassifier(max_depth=depth, random_state=42)
    model.fit(X_train, y_train)
    train_scores.append(model.score(X_train, y_train))
    test_scores.append(model.score(X_test, y_test))

plt.figure(figsize=(10, 5))
plt.plot(depths, train_scores, 'b-', label='Training Accuracy')
plt.plot(depths, test_scores, 'r-', label='Test Accuracy')
plt.xlabel('Max Depth')
plt.ylabel('Accuracy')
plt.title('Decision Tree: Overfitting with Increasing Depth')
plt.legend()
plt.grid(True, alpha=0.3)
plt.axvline(x=depths[np.argmax(test_scores)], color='g', linestyle='--', 
            label=f'Optimal depth: {depths[np.argmax(test_scores)]}')
plt.legend()
plt.show()

print(f"Optimal max_depth: {depths[np.argmax(test_scores)]}")
print(f"Best test accuracy: {max(test_scores):.3f}")
```

---

## Senior-Level Insights

### Decision Tree vs Random Forest

| Aspect                 | Decision Tree        | Random Forest          |
| ---------------------- | -------------------- | ---------------------- |
| **Interpretability**   | High (can visualize) | Lower (many trees)     |
| **Accuracy**           | Lower                | Higher (ensemble)      |
| **Overfitting**        | Prone                | Resistant              |
| **Training time**      | Fast                 | Slower                 |
| **Feature importance** | Single tree          | Averaged (more stable) |

### Hyperparameter Guide

| Parameter           | What It Controls   | Increase to...                           | Decrease to...     |
| ------------------- | ------------------ | ---------------------------------------- | ------------------ |
| `n_estimators`      | Number of trees    | Better performance (diminishing returns) | Faster training    |
| `max_depth`         | Tree complexity    | Capture complex patterns                 | Reduce overfitting |
| `min_samples_split` | Split threshold    | Reduce overfitting                       | Capture details    |
| `min_samples_leaf`  | Leaf size          | Reduce overfitting                       | Capture rare cases |
| `max_features`      | Features per split | (rarely adjusted)                        | Reduce correlation |

### When to Use Tree Models

```python
# Use Decision Trees when:
# - You need interpretable rules
# - Stakeholders need to understand decisions
# - You're building a baseline model

# Use Random Forests when:
# - Accuracy matters more than interpretability
# - You have mixed feature types
# - You want robust feature importance

# Consider Gradient Boosting when:
# - You need maximum accuracy
# - You have time for tuning
# - Memory isn't a constraint
```

---

## Hands-on Lab

### Exercise 1: Complete Tree Classification Pipeline

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt

# Create customer churn dataset
np.random.seed(42)
n = 1000

data = pd.DataFrame({
    'tenure': np.random.exponential(24, n).clip(1, 72),
    'monthly_charges': np.random.uniform(20, 100, n),
    'total_charges': np.random.uniform(100, 5000, n),
    'contract_length': np.random.choice([1, 12, 24], n, p=[0.5, 0.3, 0.2]),
    'support_calls': np.random.poisson(2, n),
    'online_security': np.random.choice([0, 1], n, p=[0.6, 0.4]),
})

# Churn logic
churn_score = (
    -0.04 * data['tenure'] +
    0.02 * data['monthly_charges'] +
    0.4 * data['support_calls'] -
    0.3 * data['online_security'] +
    0.8 * (data['contract_length'] == 1)
)
data['churn'] = (np.random.random(n) < 1/(1 + np.exp(-churn_score))).astype(int)

print(f"Churn rate: {data['churn'].mean():.1%}")

# Prepare data
X = data.drop('churn', axis=1)
y = data['churn']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

# Compare models
models = {
    'Decision Tree (depth=3)': DecisionTreeClassifier(max_depth=3, random_state=42),
    'Decision Tree (depth=10)': DecisionTreeClassifier(max_depth=10, random_state=42),
    'Random Forest (50 trees)': RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42),
    'Random Forest (200 trees)': RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42),
}

results = []
for name, model in models.items():
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc')
    model.fit(X_train, y_train)
    test_score = model.score(X_test, y_test)
    results.append({
        'Model': name,
        'CV AUC': cv_scores.mean(),
        'CV Std': cv_scores.std(),
        'Test Accuracy': test_score
    })

results_df = pd.DataFrame(results)
print("=== Model Comparison ===")
print(results_df.to_string(index=False))

# Feature importance from best model
best_rf = models['Random Forest (200 trees)']
importance = pd.DataFrame({
    'Feature': X.columns,
    'Importance': best_rf.feature_importances_
}).sort_values('Importance', ascending=False)

print("\n=== Feature Importance ===")
print(importance.to_string(index=False))
```

---

### Exercise 2: Hyperparameter Optimization

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint

# Random search is faster than grid search for large parameter spaces
param_distributions = {
    'n_estimators': randint(50, 300),
    'max_depth': [5, 10, 15, 20, None],
    'min_samples_split': randint(2, 20),
    'min_samples_leaf': randint(1, 10),
    'max_features': ['sqrt', 'log2', None]
}

random_search = RandomizedSearchCV(
    RandomForestClassifier(random_state=42),
    param_distributions,
    n_iter=50,              # Number of random combinations to try
    cv=5,
    scoring='roc_auc',
    n_jobs=-1,
    random_state=42,
    verbose=1
)

random_search.fit(X_train, y_train)

print("=== Random Search Results ===")
print(f"Best Parameters: {random_search.best_params_}")
print(f"Best CV AUC: {random_search.best_score_:.3f}")

# Evaluate
best_model = random_search.best_estimator_
y_pred = best_model.predict(X_test)
y_prob = best_model.predict_proba(X_test)[:, 1]

print(f"\nTest Performance:")
print(classification_report(y_test, y_pred, target_names=['Stay', 'Churn']))

# Visualize search results
results_cv = pd.DataFrame(random_search.cv_results_)
plt.figure(figsize=(10, 6))
plt.scatter(results_cv['param_n_estimators'], results_cv['mean_test_score'], 
            c=results_cv['param_max_depth'].fillna(25), cmap='viridis', alpha=0.6)
plt.colorbar(label='max_depth')
plt.xlabel('n_estimators')
plt.ylabel('Mean CV AUC')
plt.title('Hyperparameter Search Results')
plt.show()
```

---

### Exercise 3: Extracting Business Rules from Trees

```python
from sklearn.tree import DecisionTreeClassifier, export_text

# Train interpretable tree (shallow for business rules)
rule_tree = DecisionTreeClassifier(max_depth=3, random_state=42)
rule_tree.fit(X_train, y_train)

# Extract rules as text
rules = export_text(rule_tree, feature_names=list(X.columns))
print("=== Business Rules (Decision Tree) ===")
print(rules)

# Custom rule extraction
def extract_rules(tree, feature_names, class_names=['Stay', 'Churn']):
    """Extract human-readable rules from a decision tree."""
    tree_ = tree.tree_
    feature_name = [
        feature_names[i] if i != -2 else "undefined!"
        for i in tree_.feature
    ]
    
    rules = []
    
    def recurse(node, rule_so_far=""):
        if tree_.feature[node] != -2:  # Not a leaf
            name = feature_name[node]
            threshold = tree_.threshold[node]
            
            # Left branch (<=)
            left_rule = f"{rule_so_far}IF {name} <= {threshold:.2f}"
            recurse(tree_.children_left[node], left_rule + " AND ")
            
            # Right branch (>)
            right_rule = f"{rule_so_far}IF {name} > {threshold:.2f}"
            recurse(tree_.children_right[node], right_rule + " AND ")
        else:
            # Leaf node - get prediction
            class_idx = np.argmax(tree_.value[node])
            samples = tree_.n_node_samples[node]
            confidence = tree_.value[node][0][class_idx] / samples
            
            clean_rule = rule_so_far.rstrip(" AND ")
            rules.append({
                'rule': clean_rule,
                'prediction': class_names[class_idx],
                'samples': samples,
                'confidence': confidence
            })
    
    recurse(0)
    return pd.DataFrame(rules)

rules_df = extract_rules(rule_tree, list(X.columns))
print("\n=== Extracted Rules ===")
for _, row in rules_df.iterrows():
    print(f"Prediction: {row['prediction']} (confidence: {row['confidence']:.1%}, samples: {row['samples']})")
    print(f"  {row['rule']}")
    print()
```

---

## Mastery Check

### Question 1: Single Tree vs Forest

Why does a Random Forest typically outperform a single Decision Tree?

<details>
<summary>Click for Answer</summary>

**Answer:** Random Forests reduce **variance** through averaging many diverse trees.

**How it works:**

1. **Bagging**: Each tree is trained on a random sample (with replacement)
2. **Feature randomization**: Each split considers only a random subset of features
3. **Averaging**: Final prediction averages across all trees

**Result:**

- Individual trees may overfit, but their errors are uncorrelated
- Averaging cancels out random errors
- The forest is more stable and generalizes better

**Analogy:** Asking 100 experts and taking the majority vote vs. asking one expert.

</details>

---

### Question 2: Feature Importance Interpretation

In your Random Forest, `credit_score` has importance 0.35 and `income` has importance 0.25. What does this mean?

<details>
<summary>Click for Answer</summary>

**Answer:** These importances measure how much each feature contributes to **reducing impurity** (Gini or entropy) across all trees.

**Interpretation:**

- `credit_score` accounts for 35% of the total impurity reduction
- `income` accounts for 25%
- Together, they explain 60% of the model's predictive power

**Caveats:**

1. Importance is relative (sums to 1)
2. Correlated features share importance (may underestimate each)
3. Doesn't indicate direction (positive or negative effect)
4. High cardinality features may be favored artificially

**For direction**, check partial dependence plots or SHAP values.

</details>

---

### Question 3: Overfitting Diagnosis

Your decision tree has 100% training accuracy but 70% test accuracy. How do you fix this?

<details>
<summary>Click for Answer</summary>

**Answer:** The tree is **overfitting**. It memorized the training data.

**Solutions (in order of preference):**

1. **Limit depth**: `max_depth=5` or tune via CV
2. **Minimum samples**: `min_samples_split=10`, `min_samples_leaf=5`
3. **Pruning**: Let tree grow fully, then prune back
4. **Use Random Forest**: Ensemble averaging reduces overfitting
5. **More data**: Harder to memorize larger datasets

```python
# Before
tree = DecisionTreeClassifier()  # No limits → overfits

# After
tree = DecisionTreeClassifier(
    max_depth=6,
    min_samples_split=10,
    min_samples_leaf=5
)
```

Use cross-validation to find optimal values.

</details>

---

### Question 4: Grid vs Random Search

When would you prefer RandomizedSearchCV over GridSearchCV?

<details>
<summary>Click for Answer</summary>

**Answer:** Use RandomizedSearchCV when:

1. **Large parameter space**: Grid search is exponential; random samples efficiently
2. **Diminishing returns**: Many combinations give similar results
3. **Time constraints**: Random search finds good solutions faster
4. **Continuous parameters**: Can sample from distributions

**Comparison:**

| Aspect          | GridSearch            | RandomSearch          |
| --------------- | --------------------- | --------------------- |
| Coverage        | All combinations      | Random sample         |
| Time            | Exponential in params | Controllable (n_iter) |
| Finding optimum | Guaranteed            | Probabilistic         |
| Best for        | Small grids           | Large spaces          |

**Rule of thumb:** For 3-4 parameters with few values each, use Grid. For larger spaces, use Random with n_iter=50-100.

</details>

---

### Question 5: Interpreting Tree Rules

A decision tree for loan approval says: "IF credit_score > 700 AND income > 50000 THEN Approve." How confident should you be in this rule?

<details>
<summary>Click for Answer</summary>

**Answer:** Confidence depends on several factors:

1. **Sample size**: How many training examples fell into this leaf?
   - 1000 samples → very confident
   - 10 samples → not reliable

2. **Purity**: What percentage of samples were actually approved?
   - 95% approved → high confidence
   - 55% approved → essentially a coin flip

3. **Test performance**: Does the rule generalize?
   - High cross-validation accuracy → trustworthy
   - Large train-test gap → may not generalize

4. **Domain alignment**: Does it make business sense?
   - Credit score and income affecting approval → reasonable
   - Bizarre rules → may be spurious correlations

**Best practice:** Always report sample count and purity with business rules.

</details>

---

## Math-to-Debug Tasks

1. **Tree/forest confusion-matrix deep dive**: Compare confusion matrices across depth settings and explain how bias-variance tradeoffs alter error types under the assumption that training and production class mix are similar.
2. **Why-model-failed case (classification)**: Random forest recall collapses after deployment. Explain conceptually *why the model failed* (distribution shift + overfit leaf rules), then take corrective action with re-stratified validation, probability calibration, depth/min-samples constraints, and retraining on fresher data.

---

## Summary

Today you learned:

- ✅ Decision trees split data using if-then rules
- ✅ Trees are interpretable but prone to overfitting
- ✅ Random Forests combine many trees for better accuracy
- ✅ Feature importance shows which variables matter most
- ✅ GridSearchCV and RandomizedSearchCV tune hyperparameters
- ✅ Limiting depth and samples prevents overfitting
- ✅ Business rules can be extracted from shallow trees

**Tomorrow**: Unsupervised Learning—clustering and dimensionality reduction.
