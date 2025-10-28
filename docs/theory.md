# Machine Learning Theory and Mathematical Foundations

This document provides a comprehensive reference for the mathematical and theoretical concepts
underlying the machine learning curriculum (Days 38-67). Each section builds from first principles
to practical applications in modern ML systems.

______________________________________________________________________

## Table of Contents

1. [Linear Algebra Foundations](#1-linear-algebra-foundations)
1. [Calculus and Optimization](#2-calculus-and-optimization)
1. [Probability and Statistics](#3-probability-and-statistics)
1. [Supervised Learning Theory](#4-supervised-learning-theory)
1. [Neural Networks and Deep Learning](#5-neural-networks-and-deep-learning)
1. [Regularization Techniques](#6-regularization-techniques)
1. [Ensemble Methods](#7-ensemble-methods)
1. [Unsupervised Learning](#8-unsupervised-learning)
1. [Probabilistic Modeling](#9-probabilistic-modeling)
1. [Time Series Analysis](#10-time-series-analysis)
1. [Advanced Deep Learning](#11-advanced-deep-learning)
1. [Model Evaluation and Selection](#12-model-evaluation-and-selection)

______________________________________________________________________

## 1. Linear Algebra Foundations

Linear algebra provides the mathematical language for representing and manipulating data in machine
learning.

### 1.1 Vectors

A **vector** is an ordered collection of numbers that can represent:

- A data point with multiple features
- A direction and magnitude in space
- A point in n-dimensional space

**Notation:** A vector **v** in ℝⁿ is written as:

```
v = [v₁, v₂, ..., vₙ]ᵀ
```

**Key Operations:**

- **Vector Addition:** (v + w)ᵢ = vᵢ + wᵢ
- **Scalar Multiplication:** (αv)ᵢ = αvᵢ
- **Dot Product:** v · w = Σᵢ vᵢwᵢ = ||v|| ||w|| cos(θ)
- **Norm (Length):** ||v|| = √(Σᵢ vᵢ²)

**ML Application:** Feature vectors represent observations; dot products measure similarity between
data points.

### 1.2 Matrices

A **matrix** is a rectangular array of numbers with dimensions m × n (m rows, n columns).

**Notation:**

```
A = [aᵢⱼ] where i ∈ {1,...,m}, j ∈ {1,...,n}
```

**Key Operations:**

- **Matrix Addition:** (A + B)ᵢⱼ = aᵢⱼ + bᵢⱼ
- **Matrix Multiplication:** (AB)ᵢⱼ = Σₖ aᵢₖbₖⱼ
- **Transpose:** (Aᵀ)ᵢⱼ = aⱼᵢ
- **Inverse:** AA⁻¹ = A⁻¹A = I (when A is square and non-singular)

**ML Application:** Datasets are stored as matrices where rows are observations and columns are
features. Matrix multiplication implements linear transformations and neural network layers.

### 1.3 Eigenvalues and Eigenvectors

For a square matrix A, an **eigenvector** v and **eigenvalue** λ satisfy:

```
Av = λv
```

This means A stretches v by a factor of λ without changing its direction.

**Eigendecomposition:**

```
A = QΛQᵀ
```

where Q contains eigenvectors and Λ is a diagonal matrix of eigenvalues.

**ML Application:**

- **Principal Component Analysis (PCA):** Uses eigenvectors of the covariance matrix to find
  directions of maximum variance
- **Dimensionality Reduction:** Project data onto top-k eigenvectors to reduce dimensions while
  preserving variance
- **Spectral Clustering:** Uses eigenvectors of graph Laplacian matrices

### 1.4 Singular Value Decomposition (SVD)

For any m × n matrix A:

```
A = UΣVᵀ
```

where:

- U (m × m): Left singular vectors
- Σ (m × n): Diagonal matrix of singular values
- V (n × n): Right singular vectors

**ML Application:**

- Generalization of eigendecomposition to non-square matrices
- Used in recommender systems (matrix factorization)
- Basis for PCA and low-rank approximations

______________________________________________________________________

## 2. Calculus and Optimization

Calculus enables us to find optimal model parameters by following gradients of loss functions.

### 2.1 Derivatives

The **derivative** measures the rate of change of a function:

```
f'(x) = lim(h→0) [f(x + h) - f(x)] / h
```

**Common Derivatives:**

- d/dx \[xⁿ\] = nxⁿ⁻¹
- d/dx \[eˣ\] = eˣ
- d/dx \[ln(x)\] = 1/x
- d/dx \[sin(x)\] = cos(x)

**ML Application:** Derivatives tell us how much the loss changes when we adjust a parameter.

### 2.2 Partial Derivatives and Gradients

For multivariate functions f(x₁, x₂, ..., xₙ), the **partial derivative** with respect to xᵢ is:

```
∂f/∂xᵢ = lim(h→0) [f(..., xᵢ + h, ...) - f(..., xᵢ, ...)] / h
```

The **gradient** is the vector of all partial derivatives:

```
∇f = [∂f/∂x₁, ∂f/∂x₂, ..., ∂f/∂xₙ]ᵀ
```

**Properties:**

- Gradient points in the direction of steepest ascent
- Negative gradient points toward steepest descent
- Gradient is zero at local minima, maxima, and saddle points

**ML Application:** Gradient descent algorithms follow -∇L(θ) to minimize the loss function L with
respect to parameters θ.

### 2.3 Chain Rule

The **chain rule** enables differentiation of composite functions:

```
d/dx [f(g(x))] = f'(g(x)) · g'(x)
```

For multivariate compositions:

```
∂z/∂x = (∂z/∂y)(∂y/∂x)
```

**ML Application:** Backpropagation in neural networks repeatedly applies the chain rule to compute
gradients through multiple layers.

### 2.4 Gradient Descent

**Gradient Descent** is an iterative optimization algorithm:

```
θₜ₊₁ = θₜ - α∇L(θₜ)
```

where:

- θₜ: Parameters at iteration t
- α: Learning rate (step size)
- ∇L(θₜ): Gradient of loss function at θₜ

**Variants:**

1. **Batch Gradient Descent:** Uses entire dataset to compute gradient

   ```
   ∇L(θ) = (1/n)Σᵢ ∇Lᵢ(θ)
   ```

1. **Stochastic Gradient Descent (SGD):** Uses single random example

   ```
   θₜ₊₁ = θₜ - α∇Lᵢ(θₜ)
   ```

1. **Mini-batch Gradient Descent:** Uses small batch of examples

   ```
   ∇L(θ) = (1/|B|)Σᵢ∈B ∇Lᵢ(θ)
   ```

**Advanced Optimizers:**

- **Momentum:** Accumulates velocity to smooth updates

  ```
  vₜ = βvₜ₋₁ + ∇L(θₜ)
  θₜ₊₁ = θₜ - αvₜ
  ```

- **Adam:** Adaptive learning rates with momentum

  ```
  mₜ = β₁mₜ₋₁ + (1-β₁)∇L(θₜ)
  vₜ = β₂vₜ₋₁ + (1-β₂)(∇L(θₜ))²
  θₜ₊₁ = θₜ - α·mₜ/(√vₜ + ε)
  ```

### 2.5 Convexity

A function f is **convex** if:

```
f(λx + (1-λ)y) ≤ λf(x) + (1-λ)f(y) for all λ ∈ [0,1]
```

**Properties:**

- Local minimum is also global minimum
- Gradient descent converges to global optimum
- Examples: Linear regression, logistic regression (with convex regularization)

**ML Application:** Many ML loss functions are convex, guaranteeing convergence to optimal
solutions.

______________________________________________________________________

## 3. Probability and Statistics

Probability theory provides the foundation for reasoning about uncertainty in data and predictions.

### 3.1 Probability Fundamentals

**Probability Axioms:**

1. P(A) ≥ 0 for any event A
1. P(Ω) = 1 (total probability)
1. P(A ∪ B) = P(A) + P(B) if A and B are disjoint

**Conditional Probability:**

```
P(A|B) = P(A ∩ B) / P(B)
```

**Bayes' Theorem:**

```
P(A|B) = P(B|A)P(A) / P(B)
```

**ML Application:** Bayesian inference, Naive Bayes classifiers, probabilistic modeling.

### 3.2 Random Variables and Distributions

A **random variable** X maps outcomes to real numbers.

**Expectation (Mean):**

```
E[X] = Σᵢ xᵢP(X = xᵢ)  (discrete)
E[X] = ∫ xf(x)dx        (continuous)
```

**Variance:**

```
Var(X) = E[(X - E[X])²] = E[X²] - (E[X])²
```

**Common Distributions:**

1. **Normal (Gaussian):**

   ```
   f(x) = (1/√(2πσ²))exp(-(x-μ)²/(2σ²))
   ```

   - Used in: Linear regression errors, Gaussian processes

1. **Bernoulli:**

   ```
   P(X = 1) = p, P(X = 0) = 1-p
   ```

   - Used in: Binary classification

1. **Multinomial:**

   ```
   P(X = k) = pₖ where Σₖ pₖ = 1
   ```

   - Used in: Multi-class classification

1. **Poisson:**

   ```
   P(X = k) = (λᵏe⁻ᵏ) / k!
   ```

   - Used in: Count data (arrivals, events)

### 3.3 Maximum Likelihood Estimation (MLE)

Find parameters θ that maximize the likelihood of observed data:

```
θ̂_MLE = argmax_θ L(θ|x) = argmax_θ P(x|θ)
```

Often use **log-likelihood** for convenience:

```
θ̂_MLE = argmax_θ log L(θ|x) = argmax_θ Σᵢ log P(xᵢ|θ)
```

**ML Application:** Training most ML models is MLE under specific distributional assumptions.

### 3.4 Statistical Inference

**Hypothesis Testing:**

- Null hypothesis H₀ vs. alternative H₁
- p-value: Probability of observing data at least as extreme as observed, given H₀
- Significance level α (typically 0.05)
- Reject H₀ if p-value \< α

**Confidence Intervals:**

```
CI = θ̂ ± z_(α/2) · SE(θ̂)
```

where SE is the standard error.

**ML Application:** Evaluating model significance, A/B testing, feature selection.

______________________________________________________________________

## 4. Supervised Learning Theory

Supervised learning involves learning a mapping from inputs X to outputs Y given labeled training
data.

### 4.1 Problem Formulation

**Training Data:** {(x₁, y₁), (x₂, y₂), ..., (xₙ, yₙ)}

**Goal:** Learn function f: X → Y such that f(x) ≈ y

**Types:**

- **Regression:** Y is continuous (e.g., price, temperature)
- **Classification:** Y is discrete (e.g., spam/not spam, digit 0-9)

### 4.2 Linear Regression

**Model:**

```
ŷ = θ₀ + θ₁x₁ + θ₂x₂ + ... + θₚxₚ = θᵀx
```

**Loss Function (Mean Squared Error):**

```
L(θ) = (1/n)Σᵢ (yᵢ - θᵀxᵢ)²
```

**Normal Equation (Closed Form):**

```
θ̂ = (XᵀX)⁻¹Xᵀy
```

**Gradient:**

```
∇L(θ) = (2/n)Xᵀ(Xθ - y)
```

**Assumptions:**

1. Linearity: True relationship is linear
1. Independence: Observations are independent
1. Homoscedasticity: Constant variance of errors
1. Normality: Errors follow normal distribution

**Coefficient Interpretation:**

- θⱼ represents the change in y for a unit change in xⱼ, holding other features constant

### 4.3 Logistic Regression

**Model (Binary Classification):**

```
P(y = 1|x) = σ(θᵀx) = 1 / (1 + e⁻ᶿᵀˣ)
```

where σ is the **sigmoid function**.

**Decision Boundary:**

```
Predict y = 1 if P(y = 1|x) ≥ 0.5
⟺ θᵀx ≥ 0
```

**Loss Function (Binary Cross-Entropy):**

```
L(θ) = -(1/n)Σᵢ [yᵢ log(ŷᵢ) + (1-yᵢ)log(1-ŷᵢ)]
```

**Gradient:**

```
∇L(θ) = (1/n)Xᵀ(σ(Xθ) - y)
```

**Multi-class Extension (Softmax):**

```
P(y = k|x) = exp(θₖᵀx) / Σⱼ exp(θⱼᵀx)
```

### 4.4 Support Vector Machines (SVM)

**Goal:** Find hyperplane that maximally separates classes with largest margin.

**Hard Margin SVM:**

```
minimize (1/2)||w||²
subject to yᵢ(wᵀxᵢ + b) ≥ 1 for all i
```

**Soft Margin SVM (with slack variables ξᵢ):**

```
minimize (1/2)||w||² + C·Σᵢ ξᵢ
subject to yᵢ(wᵀxᵢ + b) ≥ 1 - ξᵢ, ξᵢ ≥ 0
```

**Kernel Trick:** Map data to higher dimensions using kernel functions:

- Linear: K(x, x') = xᵀx'
- Polynomial: K(x, x') = (xᵀx' + c)ᵈ
- RBF (Gaussian): K(x, x') = exp(-γ||x - x'||²)

**ML Application:** Effective for high-dimensional spaces, memory-efficient (uses support vectors
only).

### 4.5 Decision Trees

**Splitting Criterion:**

For regression, use **Mean Squared Error**:

```
MSE = (1/n)Σᵢ (yᵢ - ȳ)²
```

For classification, use **Gini Impurity** or **Entropy**:

```
Gini = 1 - Σₖ pₖ²
Entropy = -Σₖ pₖ log(pₖ)
```

**Information Gain:**

```
IG = H(parent) - Σ(|child|/|parent|)H(child)
```

**Algorithm:**

1. Start with all data at root
1. For each feature, find best split that maximizes information gain
1. Recursively split until stopping criterion met
1. Assign leaf prediction (majority class or mean value)

**Advantages:**

- Interpretable
- Handles non-linear relationships
- No feature scaling needed

**Disadvantages:**

- Prone to overfitting
- Unstable (small data changes cause different trees)

______________________________________________________________________

## 5. Neural Networks and Deep Learning

Neural networks are compositions of simple non-linear functions that can approximate complex
mappings.

### 5.1 Perceptron

The basic building block:

```
z = Σᵢ wᵢxᵢ + b = wᵀx + b
a = g(z)
```

where:

- w: weights
- b: bias
- g: activation function
- a: output activation

### 5.2 Activation Functions

**Purpose:** Introduce non-linearity (without them, deep networks collapse to linear models).

**Common Activations:**

1. **Sigmoid:**

   ```
   σ(z) = 1 / (1 + e⁻ᶻ)
   σ'(z) = σ(z)(1 - σ(z))
   ```

   - Range: (0, 1)
   - Issues: Vanishing gradients, not zero-centered

1. **Tanh:**

   ```
   tanh(z) = (eᶻ - e⁻ᶻ) / (eᶻ + e⁻ᶻ)
   tanh'(z) = 1 - tanh²(z)
   ```

   - Range: (-1, 1)
   - Zero-centered, but still vanishing gradients

1. **ReLU (Rectified Linear Unit):**

   ```
   ReLU(z) = max(0, z)
   ReLU'(z) = 1 if z > 0, else 0
   ```

   - Most popular for hidden layers
   - Computationally efficient
   - Issues: "Dying ReLU" (neurons can permanently output 0)

1. **Leaky ReLU:**

   ```
   LeakyReLU(z) = max(αz, z) where α ≈ 0.01
   ```

   - Prevents dying ReLU problem

1. **Softmax (Output Layer for Multi-class):**

   ```
   softmax(zᵢ) = exp(zᵢ) / Σⱼ exp(zⱼ)
   ```

### 5.3 Multi-Layer Perceptron (MLP)

**Architecture:**

```
Layer 1: a⁽¹⁾ = g⁽¹⁾(W⁽¹⁾x + b⁽¹⁾)
Layer 2: a⁽²⁾ = g⁽²⁾(W⁽²⁾a⁽¹⁾ + b⁽²⁾)
...
Output: ŷ = a⁽ᴸ⁾
```

**Universal Approximation Theorem:** A neural network with a single hidden layer and enough neurons
can approximate any continuous function arbitrarily well.

### 5.4 Backpropagation

**Forward Pass:** Compute predictions layer by layer.

**Backward Pass:** Compute gradients using chain rule.

**Output Layer Gradient:**

```
δ⁽ᴸ⁾ = ∂L/∂z⁽ᴸ⁾ = (a⁽ᴸ⁾ - y) ⊙ g'(z⁽ᴸ⁾)
```

**Hidden Layer Gradient:**

```
δ⁽ˡ⁾ = (W⁽ˡ⁺¹⁾ᵀδ⁽ˡ⁺¹⁾) ⊙ g'(z⁽ˡ⁾)
```

**Parameter Gradients:**

```
∂L/∂W⁽ˡ⁾ = δ⁽ˡ⁾a⁽ˡ⁻¹⁾ᵀ
∂L/∂b⁽ˡ⁾ = δ⁽ˡ⁾
```

**Update Rule:**

```
W⁽ˡ⁾ ← W⁽ˡ⁾ - α(∂L/∂W⁽ˡ⁾)
b⁽ˡ⁾ ← b⁽ˡ⁾ - α(∂L/∂b⁽ˡ⁾)
```

### 5.5 Common Loss Functions

**Regression:**

1. **Mean Squared Error (MSE):**

   ```
   L = (1/n)Σᵢ (yᵢ - ŷᵢ)²
   ```

1. **Mean Absolute Error (MAE):**

   ```
   L = (1/n)Σᵢ |yᵢ - ŷᵢ|
   ```

**Classification:**

1. **Binary Cross-Entropy:**

   ```
   L = -(1/n)Σᵢ [yᵢ log(ŷᵢ) + (1-yᵢ)log(1-ŷᵢ)]
   ```

1. **Categorical Cross-Entropy:**

   ```
   L = -(1/n)Σᵢ Σₖ yᵢₖ log(ŷᵢₖ)
   ```

### 5.6 Initialization Strategies

**Problem:** Poor initialization can cause vanishing/exploding gradients.

**Xavier/Glorot Initialization:**

```
W ~ U[-√(6/(nᵢₙ + nₒᵤₜ)), √(6/(nᵢₙ + nₒᵤₜ))]
```

**He Initialization (for ReLU):**

```
W ~ N(0, 2/nᵢₙ)
```

### 5.7 Batch Normalization

Normalize activations within each mini-batch:

```
x̂ᵢ = (xᵢ - μ_B) / √(σ²_B + ε)
yᵢ = γx̂ᵢ + β
```

**Benefits:**

- Faster training
- Higher learning rates possible
- Reduces sensitivity to initialization
- Acts as regularization

______________________________________________________________________

## 6. Regularization Techniques

Regularization prevents overfitting by constraining model complexity.

### 6.1 L2 Regularization (Ridge)

**Modified Loss:**

```
L_ridge(θ) = L(θ) + λ||θ||₂² = L(θ) + λΣⱼ θⱼ²
```

**Effect:**

- Shrinks coefficients toward zero
- Never exactly zero (all features retained)
- Closed-form solution exists for linear regression:
  ```
  θ̂ = (XᵀX + λI)⁻¹Xᵀy
  ```

**Bayesian Interpretation:** Equivalent to placing Gaussian prior on parameters.

### 6.2 L1 Regularization (Lasso)

**Modified Loss:**

```
L_lasso(θ) = L(θ) + λ||θ||₁ = L(θ) + λΣⱼ |θⱼ|
```

**Effect:**

- Produces sparse solutions (many coefficients exactly zero)
- Automatic feature selection
- No closed-form solution (requires iterative methods)

**Bayesian Interpretation:** Equivalent to placing Laplace prior on parameters.

### 6.3 Elastic Net

**Combines L1 and L2:**

```
L_elastic(θ) = L(θ) + λ₁||θ||₁ + λ₂||θ||₂²
```

**Advantages:**

- Sparse solutions like Lasso
- Better than Lasso when features are correlated
- More stable than Lasso

### 6.4 Dropout

**Training:** Randomly set a fraction p of neurons to zero in each iteration.

**Effect:**

- Prevents co-adaptation of neurons
- Approximates ensemble of exponentially many networks
- Acts as strong regularizer

**Inference:** Scale activations by (1-p) or train with inverted dropout.

### 6.5 Early Stopping

**Method:** Monitor validation loss during training; stop when it starts increasing.

**Equivalent to:** Implicit regularization by limiting model capacity to fit training data.

### 6.6 Data Augmentation

**Increase effective dataset size** by applying transformations:

- Images: rotation, flipping, cropping, color jitter
- Text: synonym replacement, back-translation
- Time series: jittering, scaling, window slicing

**Effect:** Regularizes by exposing model to variations.

______________________________________________________________________

## 7. Ensemble Methods

Ensemble methods combine multiple models to achieve better performance than individual models.

### 7.1 Bagging (Bootstrap Aggregating)

**Algorithm:**

1. Create m bootstrap samples (sample with replacement)
1. Train model on each bootstrap sample
1. Aggregate predictions (vote for classification, average for regression)

**Prediction:**

```
ŷ = (1/m)Σᵢ fᵢ(x)  (regression)
ŷ = mode{f₁(x), ..., fₘ(x)}  (classification)
```

**Random Forest:** Bagging with decision trees + random feature selection at each split.

**Feature Importance:**

```
Importance(xⱼ) = Σ_trees Σ_splits ΔImpurity(xⱼ)
```

**Out-of-Bag (OOB) Error:**

- Each tree uses ~63% of data for training
- Remaining ~37% used for validation (OOB samples)
- OOB error provides unbiased performance estimate

### 7.2 Boosting

**Idea:** Train models sequentially, each correcting errors of previous ones.

**AdaBoost (Adaptive Boosting):**

1. Initialize weights: wᵢ = 1/n for all i
1. For t = 1 to T:
   - Train classifier fₜ on weighted data
   - Compute error: εₜ = Σᵢ wᵢ · I(yᵢ ≠ fₜ(xᵢ))
   - Compute weight: αₜ = (1/2)log((1-εₜ)/εₜ)
   - Update weights: wᵢ ← wᵢ · exp(-αₜyᵢfₜ(xᵢ))
   - Normalize weights
1. Final prediction: F(x) = sign(Σₜ αₜfₜ(x))

**Gradient Boosting:**

General framework for boosting any differentiable loss function.

1. Initialize: F₀(x) = argmin_γ Σᵢ L(yᵢ, γ)
1. For t = 1 to T:
   - Compute pseudo-residuals:
     ```
     rᵢₜ = -∂L(yᵢ, F(xᵢ))/∂F(xᵢ) |_(F=Fₜ₋₁)
     ```
   - Fit base learner hₜ to residuals
   - Find optimal step size:
     ```
     γₜ = argmin_γ Σᵢ L(yᵢ, Fₜ₋₁(xᵢ) + γhₜ(xᵢ))
     ```
   - Update: Fₜ(x) = Fₜ₋₁(x) + γₜhₜ(x)

**XGBoost (Extreme Gradient Boosting):**

Adds regularization to gradient boosting:

```
Obj = Σᵢ L(yᵢ, ŷᵢ) + Σₜ Ω(fₜ)
```

where Ω(f) = γT + (1/2)λ||w||² (T = number of leaves)

### 7.3 Stacking (Stacked Generalization)

**Two-Level Architecture:**

**Level 0 (Base Models):**

- Train diverse models (e.g., random forest, SVM, neural network)
- Generate out-of-fold predictions on training set

**Level 1 (Meta-Model):**

- Train on base model predictions as features
- Learn optimal way to combine base model predictions

**Algorithm:**

1. Split data into K folds
1. For each base model:
   - Train on K-1 folds, predict on held-out fold (repeat K times)
   - Train on full training set, predict on test set
1. Train meta-model on out-of-fold predictions
1. Meta-model predicts on base model test predictions

______________________________________________________________________

## 8. Unsupervised Learning

Unsupervised learning discovers patterns in unlabeled data.

### 8.1 K-Means Clustering

**Objective:** Minimize within-cluster variance:

```
minimize Σₖ Σ_{xᵢ∈Cₖ} ||xᵢ - μₖ||²
```

**Algorithm (Lloyd's Algorithm):**

1. Initialize k centroids randomly
1. Repeat until convergence:
   - **Assignment:** Assign each point to nearest centroid
     ```
     Cₖ = {xᵢ : ||xᵢ - μₖ|| ≤ ||xᵢ - μⱼ|| for all j}
     ```
   - **Update:** Recompute centroids
     ```
     μₖ = (1/|Cₖ|)Σ_{xᵢ∈Cₖ} xᵢ
     ```

**Choosing k:**

- Elbow method: Plot inertia vs k, look for "elbow"
- Silhouette score: Measures cluster cohesion and separation
- Domain knowledge

**Limitations:**

- Assumes spherical clusters
- Sensitive to initialization
- Must specify k in advance

### 8.2 Hierarchical Clustering

**Agglomerative (Bottom-Up):**

1. Start with each point as its own cluster
1. Repeatedly merge closest clusters
1. Stop when all points in one cluster

**Linkage Criteria:**

- **Single:** min distance between any pair
- **Complete:** max distance between any pair
- **Average:** average distance between all pairs
- **Ward:** minimize within-cluster variance

**Dendrogram:** Tree diagram showing merge sequence.

### 8.3 DBSCAN (Density-Based Spatial Clustering)

**Parameters:**

- ε: Maximum radius of neighborhood
- MinPts: Minimum points to form dense region

**Point Types:**

- **Core Point:** Has ≥ MinPts neighbors within ε
- **Border Point:** In neighborhood of core point but not core itself
- **Noise Point:** Neither core nor border

**Advantages:**

- Discovers clusters of arbitrary shape
- Robust to outliers
- No need to specify number of clusters

### 8.4 Principal Component Analysis (PCA)

**Goal:** Find orthogonal directions of maximum variance.

**Mathematical Formulation:**

1. Center data: X_centered = X - X̄
1. Compute covariance matrix:
   ```
   Σ = (1/n)X_centeredᵀX_centered
   ```
1. Compute eigendecomposition:
   ```
   Σ = QΛQᵀ
   ```
1. Principal components are eigenvectors (columns of Q)
1. Project data:
   ```
   Z = X_centered · Q[:, :k]  (keep top k components)
   ```

**Variance Explained:**

```
Variance explained by PC_j = λⱼ / Σᵢ λᵢ
```

**Applications:**

- Dimensionality reduction
- Data visualization (project to 2D/3D)
- Noise reduction
- Feature extraction

### 8.5 t-SNE (t-Distributed Stochastic Neighbor Embedding)

**Goal:** Preserve local structure in low-dimensional embedding.

**Algorithm:**

1. Compute pairwise similarities in high-dimensional space:

   ```
   p_{j|i} = exp(-||xᵢ - xⱼ||²/(2σᵢ²)) / Σₖ≠ᵢ exp(-||xᵢ - xₖ||²/(2σᵢ²))
   ```

1. Compute symmetrized similarities:

   ```
   pᵢⱼ = (p_{j|i} + p_{i|j}) / (2n)
   ```

1. Define similarities in low-dimensional space using t-distribution:

   ```
   qᵢⱼ = (1 + ||yᵢ - yⱼ||²)⁻¹ / Σₖ≠ˡ (1 + ||yₖ - yˡ||²)⁻¹
   ```

1. Minimize KL divergence using gradient descent:

   ```
   KL(P||Q) = Σᵢ Σⱼ pᵢⱼ log(pᵢⱼ/qᵢⱼ)
   ```

**Properties:**

- Excellent for visualization
- Non-parametric (cannot embed new points directly)
- Stochastic (different runs give different results)

### 8.6 UMAP (Uniform Manifold Approximation and Projection)

Similar to t-SNE but:

- Faster
- Better preserves global structure
- Can project new points
- Based on manifold theory and topological data analysis

______________________________________________________________________

## 9. Probabilistic Modeling

Probabilistic models explicitly represent uncertainty using probability distributions.

### 9.1 Naive Bayes

**Assumption:** Features are conditionally independent given class:

```
P(x₁, ..., xₚ | y) = ∏ⱼ P(xⱼ | y)
```

**Classification Rule:**

```
ŷ = argmax_y P(y) ∏ⱼ P(xⱼ | y)
```

**Variants:**

- **Gaussian Naive Bayes:** P(xⱼ|y) ~ N(μⱼᵧ, σ²ⱼᵧ)
- **Multinomial Naive Bayes:** For count data (e.g., text)
- **Bernoulli Naive Bayes:** For binary features

**Advantages:**

- Fast training and prediction
- Works well with high-dimensional data
- Often surprisingly effective despite strong independence assumption

### 9.2 Gaussian Mixture Models (GMM)

**Model:** Data generated from mixture of k Gaussian distributions:

```
p(x) = Σₖ πₖ N(x | μₖ, Σₖ)
```

where πₖ are mixing coefficients (Σₖ πₖ = 1).

**Latent Variable:** zᵢ indicates which Gaussian generated xᵢ.

**Complete-Data Likelihood:**

```
p(x, z | θ) = ∏ᵢ ∏ₖ [πₖ N(xᵢ | μₖ, Σₖ)]^{zᵢₖ}
```

### 9.3 Expectation-Maximization (EM) Algorithm

**General Framework for Latent Variable Models:**

Maximize: p(x | θ) = Σ_z p(x, z | θ)

**E-Step:** Compute posterior over latents:

```
Q(θ | θ⁽ᵗ⁾) = E_{z|x,θ⁽ᵗ⁾}[log p(x, z | θ)]
```

**M-Step:** Maximize expected complete-data log-likelihood:

```
θ⁽ᵗ⁺¹⁾ = argmax_θ Q(θ | θ⁽ᵗ⁾)
```

**For GMM:**

**E-Step (Responsibility):**

```
γᵢₖ = πₖ N(xᵢ | μₖ, Σₖ) / Σⱼ πⱼ N(xᵢ | μⱼ, Σⱼ)
```

**M-Step:**

```
Nₖ = Σᵢ γᵢₖ
πₖ = Nₖ / n
μₖ = (1/Nₖ)Σᵢ γᵢₖxᵢ
Σₖ = (1/Nₖ)Σᵢ γᵢₖ(xᵢ - μₖ)(xᵢ - μₖ)ᵀ
```

### 9.4 Hidden Markov Models (HMM)

**Components:**

- States: S = {s₁, ..., sₙ}
- Observations: O = {o₁, ..., oₘ}
- Initial probabilities: π
- Transition probabilities: A (aᵢⱼ = P(sₜ₊₁=j | sₜ=i))
- Emission probabilities: B (bⱼ(oₜ) = P(oₜ | sₜ=j))

**Forward Algorithm (Compute Likelihood):**

```
α_t(i) = P(o₁, ..., oₜ, sₜ=i)
α_t(j) = [Σᵢ α_{t-1}(i)aᵢⱼ]bⱼ(oₜ)
p(O) = Σᵢ α_T(i)
```

**Viterbi Algorithm (Most Likely State Sequence):**

```
δ_t(i) = max_{s₁,...,s_{t-1}} P(s₁,...,s_{t-1},sₜ=i,o₁,...,oₜ)
δ_t(j) = [maxᵢ δ_{t-1}(i)aᵢⱼ]bⱼ(oₜ)
```

**Applications:**

- Speech recognition
- Part-of-speech tagging
- Gene prediction

### 9.5 Bayesian Inference

**Bayes' Theorem for Parameters:**

```
p(θ | D) = p(D | θ)p(θ) / p(D)
```

where:

- p(θ): Prior distribution
- p(D | θ): Likelihood
- p(θ | D): Posterior distribution
- p(D): Marginal likelihood (evidence)

**Posterior Predictive Distribution:**

```
p(x_new | D) = ∫ p(x_new | θ)p(θ | D)dθ
```

**Maximum A Posteriori (MAP) Estimation:**

```
θ̂_MAP = argmax_θ p(θ | D) = argmax_θ [p(D | θ)p(θ)]
```

**Conjugate Priors:** Prior and posterior have same functional form.

Examples:

- Beta prior + Binomial likelihood → Beta posterior
- Dirichlet prior + Multinomial likelihood → Dirichlet posterior
- Normal prior + Normal likelihood → Normal posterior

______________________________________________________________________

## 10. Time Series Analysis

Time series data consists of observations ordered in time, exhibiting temporal dependencies.

### 10.1 Time Series Components

**Decomposition:**

```
Y_t = T_t + S_t + R_t
```

where:

- T_t: Trend (long-term direction)
- S_t: Seasonality (periodic patterns)
- R_t: Residual (irregular component)

**Multiplicative Model:**

```
Y_t = T_t × S_t × R_t
```

### 10.2 Stationarity

A time series is **stationary** if:

1. Constant mean: E\[Y_t\] = μ
1. Constant variance: Var(Y_t) = σ²
1. Autocovariance depends only on lag: Cov(Y_t, Y\_{t+k}) = γ_k

**Tests:**

- **Augmented Dickey-Fuller (ADF):** Tests for unit root
- **KPSS:** Tests for stationarity

**Making Non-Stationary Data Stationary:**

- Differencing: ΔY_t = Y_t - Y\_{t-1}
- Log transformation: log(Y_t)
- Seasonal differencing: Y_t - Y\_{t-s}

### 10.3 Autocorrelation

**Autocorrelation Function (ACF):**

```
ρ_k = Cov(Y_t, Y_{t-k}) / Var(Y_t)
```

**Partial Autocorrelation Function (PACF):**

Correlation between Y_t and Y\_{t-k} after removing linear dependence on Y\_{t-1}, ..., Y\_{t-k+1}.

### 10.4 ARIMA Models

**AR(p) - Autoregressive:**

```
Y_t = c + Σᵢ φᵢY_{t-i} + ε_t
```

**MA(q) - Moving Average:**

```
Y_t = μ + ε_t + Σᵢ θᵢε_{t-i}
```

**ARMA(p,q):**

```
Y_t = c + Σᵢ φᵢY_{t-i} + Σⱼ θⱼε_{t-j} + ε_t
```

**ARIMA(p,d,q):** ARMA on differenced series (d differences)

**Model Selection:**

- Use ACF/PACF plots
- Use information criteria (AIC, BIC)
- Grid search over (p,d,q)

### 10.5 Seasonal ARIMA (SARIMAX)

**SARIMA(p,d,q)(P,D,Q)\_s:**

Combines non-seasonal and seasonal components:

```
φ(B)Φ(Bˢ)(1-B)ᵈ(1-Bˢ)ᴰY_t = θ(B)Θ(Bˢ)ε_t
```

where:

- (p,d,q): Non-seasonal orders
- (P,D,Q): Seasonal orders
- s: Seasonal period
- B: Backshift operator (BY_t = Y\_{t-1})

**SARIMAX:** SARIMA + exogenous variables

### 10.6 Exponential Smoothing

**Simple Exponential Smoothing:**

```
ŷ_{t+1} = αy_t + (1-α)ŷ_t
```

**Holt's Linear Trend:**

```
Level: ℓ_t = αy_t + (1-α)(ℓ_{t-1} + b_{t-1})
Trend: b_t = β(ℓ_t - ℓ_{t-1}) + (1-β)b_{t-1}
Forecast: ŷ_{t+h} = ℓ_t + hb_t
```

**Holt-Winters (Seasonal):**

Adds seasonal component:

```
Level: ℓ_t = α(y_t - s_{t-m}) + (1-α)(ℓ_{t-1} + b_{t-1})
Trend: b_t = β(ℓ_t - ℓ_{t-1}) + (1-β)b_{t-1}
Season: s_t = γ(y_t - ℓ_t) + (1-γ)s_{t-m}
Forecast: ŷ_{t+h} = ℓ_t + hb_t + s_{t+h-m}
```

### 10.7 Prophet

**Additive Model:**

```
y(t) = g(t) + s(t) + h(t) + ε_t
```

where:

- g(t): Piecewise linear or logistic growth
- s(t): Fourier series for seasonality
- h(t): Holiday effects
- ε_t: Error term

**Advantages:**

- Handles missing data and outliers
- Intuitive hyperparameters
- Automatic seasonality detection
- Works well with irregular data

### 10.8 Evaluation Metrics

**Mean Absolute Error (MAE):**

```
MAE = (1/n)Σ|y_t - ŷ_t|
```

**Root Mean Squared Error (RMSE):**

```
RMSE = √[(1/n)Σ(y_t - ŷ_t)²]
```

**Mean Absolute Percentage Error (MAPE):**

```
MAPE = (100/n)Σ|y_t - ŷ_t|/|y_t|
```

**Symmetric MAPE (sMAPE):**

```
sMAPE = (100/n)Σ 2|y_t - ŷ_t|/(|y_t| + |ŷ_t|)
```

______________________________________________________________________

## 11. Advanced Deep Learning

### 11.1 Convolutional Neural Networks (CNNs)

**Convolution Operation:**

```
(f * g)[i,j] = ΣₘΣₙ f[m,n]g[i-m, j-n]
```

**Convolutional Layer:**

```
Output[i,j,k] = σ(Σₘ Σₙ Σ_c Input[i+m, j+n, c] × Kernel[m,n,c,k] + Bias[k])
```

**Key Concepts:**

- **Filters/Kernels:** Small matrices that slide over input
- **Feature Maps:** Outputs of applying filters
- **Stride:** Step size for sliding kernel
- **Padding:** Adding zeros around input to control output size

**Pooling Layers:**

**Max Pooling:**

```
Output[i,j] = max_{m,n ∈ window} Input[i×s+m, j×s+n]
```

**Average Pooling:**

```
Output[i,j] = mean_{m,n ∈ window} Input[i×s+m, j×s+n]
```

**Architecture Patterns:**

```
Input → [Conv → ReLU → Pool]×N → Flatten → [FC → ReLU]×M → Output
```

**Classic Architectures:**

- **LeNet-5:** Early CNN for digit recognition
- **AlexNet:** First deep CNN to win ImageNet (2012)
- **VGGNet:** Very deep with small 3×3 filters
- **ResNet:** Skip connections enable training very deep networks
- **Inception:** Multi-scale processing with parallel paths

### 11.2 Recurrent Neural Networks (RNNs)

**Vanilla RNN:**

```
h_t = tanh(W_hh h_{t-1} + W_xh x_t + b_h)
y_t = W_hy h_t + b_y
```

**Problems:**

- Vanishing gradients: Gradients shrink exponentially with sequence length
- Exploding gradients: Gradients grow exponentially

**Gradient Flow:**

```
∂L/∂h_0 = ∂L/∂h_T × ∏_{t=1}^T ∂h_t/∂h_{t-1}
```

### 11.3 Long Short-Term Memory (LSTM)

**Gates:**

```
Forget gate: f_t = σ(W_f[h_{t-1}, x_t] + b_f)
Input gate:  i_t = σ(W_i[h_{t-1}, x_t] + b_i)
Output gate: o_t = σ(W_o[h_{t-1}, x_t] + b_o)

Cell candidate: C̃_t = tanh(W_C[h_{t-1}, x_t] + b_C)
Cell state: C_t = f_t ⊙ C_{t-1} + i_t ⊙ C̃_t
Hidden state: h_t = o_t ⊙ tanh(C_t)
```

**Key Innovation:** Cell state C_t provides uninterrupted gradient flow.

### 11.4 Gated Recurrent Unit (GRU)

**Simplified LSTM with fewer parameters:**

```
Reset gate: r_t = σ(W_r[h_{t-1}, x_t])
Update gate: z_t = σ(W_z[h_{t-1}, x_t])

Candidate: h̃_t = tanh(W[r_t ⊙ h_{t-1}, x_t])
Hidden state: h_t = (1 - z_t) ⊙ h_{t-1} + z_t ⊙ h̃_t
```

### 11.5 Attention Mechanism

**Problem:** Fixed-length context vector is information bottleneck.

**Solution:** Allow decoder to "attend" to different parts of input.

**Attention Scores:**

```
e_{t,i} = score(h_t, h̄_i) = h_t^T W h̄_i  (or dot product, or MLP)
```

**Attention Weights (via softmax):**

```
α_{t,i} = exp(e_{t,i}) / Σⱼ exp(e_{t,j})
```

**Context Vector:**

```
c_t = Σᵢ α_{t,i} h̄_i
```

**Decoder with Attention:**

```
h_t = RNN(h_{t-1}, [y_{t-1}; c_t])
```

### 11.6 Transformers

**Core Idea:** Replace recurrence with self-attention.

**Scaled Dot-Product Attention:**

```
Attention(Q, K, V) = softmax(QK^T / √d_k)V
```

where:

- Q: Query matrix
- K: Key matrix
- V: Value matrix
- d_k: Key dimension (for scaling)

**Multi-Head Attention:**

```
MultiHead(Q,K,V) = Concat(head₁, ..., head_h)W^O

where head_i = Attention(QW^Q_i, KW^K_i, VW^V_i)
```

**Transformer Block:**

```
1. Multi-head self-attention
2. Add & Normalize (residual connection)
3. Feed-forward network (2-layer MLP)
4. Add & Normalize
```

**Positional Encoding:**

Since no recurrence, inject position information:

```
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```

**Advantages:**

- Parallelizable (unlike RNNs)
- Captures long-range dependencies
- State-of-the-art on many tasks

**Popular Models:**

- **BERT:** Bidirectional encoder for understanding
- **GPT:** Autoregressive decoder for generation
- **T5:** Encoder-decoder for text-to-text tasks
- **Vision Transformer (ViT):** Applies transformers to images

### 11.7 Generative Models

**Variational Autoencoders (VAE):**

**Encoder (Recognition Model):**

```
q_φ(z|x) ≈ p(z|x)
```

**Decoder (Generative Model):**

```
p_θ(x|z)
```

**Loss (ELBO - Evidence Lower Bound):**

```
L = E_q[log p_θ(x|z)] - KL(q_φ(z|x) || p(z))
```

Reconstruction loss + Regularization term

**Reparameterization Trick:**

```
z = μ + σ ⊙ ε where ε ~ N(0, I)
```

Allows backpropagation through sampling.

**Generative Adversarial Networks (GANs):**

**Two Networks:**

- Generator G: Generates fake samples from noise
- Discriminator D: Distinguishes real from fake

**Minimax Game:**

```
min_G max_D E_x[log D(x)] + E_z[log(1 - D(G(z)))]
```

**Training:**

1. Train D to maximize discriminator accuracy
1. Train G to maximize discriminator's mistakes

**Challenges:**

- Mode collapse
- Training instability
- Vanishing gradients

**Improvements:**

- Wasserstein GAN (WGAN)
- Spectral normalization
- Progressive growing

______________________________________________________________________

## 12. Model Evaluation and Selection

### 12.1 Bias-Variance Tradeoff

**Prediction Error Decomposition:**

```
E[(y - ŷ)²] = Bias² + Variance + Irreducible Error
```

**Bias:** Error from approximating complex functions with simple models

- High bias → Underfitting
- Examples: Linear model for non-linear data

**Variance:** Error from sensitivity to training set fluctuations

- High variance → Overfitting
- Examples: Deep decision tree, high-degree polynomial

**Tradeoff:** Increasing model complexity reduces bias but increases variance.

### 12.2 Cross-Validation

**K-Fold Cross-Validation:**

1. Split data into K folds
1. For k = 1 to K:
   - Train on K-1 folds
   - Validate on fold k
1. Average performance across folds

**Stratified K-Fold:** Maintain class proportions in each fold.

**Leave-One-Out (LOO):** K = n (expensive but low-bias estimate)

**Time Series Split:** Respect temporal ordering

```
Fold 1: Train[1:100], Test[101:150]
Fold 2: Train[1:150], Test[151:200]
...
```

### 12.3 Classification Metrics

**Confusion Matrix:**

```
                Predicted
              Pos    Neg
Actual  Pos   TP     FN
        Neg   FP     TN
```

**Metrics:**

**Accuracy:**

```
Accuracy = (TP + TN) / (TP + TN + FP + FN)
```

**Precision (Positive Predictive Value):**

```
Precision = TP / (TP + FP)
```

**Recall (Sensitivity, True Positive Rate):**

```
Recall = TP / (TP + FN)
```

**F1 Score (Harmonic Mean of Precision and Recall):**

```
F1 = 2 × (Precision × Recall) / (Precision + Recall)
```

**Specificity (True Negative Rate):**

```
Specificity = TN / (TN + FP)
```

### 12.4 ROC and AUC

**ROC Curve:** Plot TPR vs FPR at various thresholds

```
TPR = TP / (TP + FN)  (y-axis)
FPR = FP / (FP + TN)  (x-axis)
```

**AUC (Area Under Curve):**

- Perfect classifier: AUC = 1.0
- Random classifier: AUC = 0.5
- Interpretation: Probability that model ranks random positive higher than random negative

**Precision-Recall Curve:** Better for imbalanced datasets

### 12.5 Regression Metrics

**Mean Squared Error (MSE):**

```
MSE = (1/n)Σ(yᵢ - ŷᵢ)²
```

**Root Mean Squared Error (RMSE):**

```
RMSE = √MSE
```

**Mean Absolute Error (MAE):**

```
MAE = (1/n)Σ|yᵢ - ŷᵢ|
```

**R² Score (Coefficient of Determination):**

```
R² = 1 - SS_res/SS_tot = 1 - Σ(yᵢ - ŷᵢ)²/Σ(yᵢ - ȳ)²
```

- R² = 1: Perfect predictions
- R² = 0: Model as good as mean baseline
- R² \< 0: Model worse than mean baseline

**Adjusted R²:**

```
R²_adj = 1 - (1 - R²)(n - 1)/(n - p - 1)
```

Penalizes adding features that don't improve fit.

### 12.6 Model Selection Criteria

**Akaike Information Criterion (AIC):**

```
AIC = 2k - 2log(L̂)
```

where k = number of parameters, L̂ = maximum likelihood

**Bayesian Information Criterion (BIC):**

```
BIC = k·log(n) - 2log(L̂)
```

Stronger penalty for model complexity than AIC.

**Principle:** Lower is better. Balance fit quality with model simplicity.

### 12.7 Hyperparameter Tuning

**Grid Search:**

- Define grid of hyperparameter values
- Evaluate all combinations via cross-validation
- Select combination with best performance

**Random Search:**

- Sample hyperparameter combinations randomly
- Often more efficient than grid search
- Better explores high-dimensional spaces

**Bayesian Optimization:**

- Build probabilistic model of objective function
- Use model to select promising hyperparameters
- Update model with new evaluations
- More sample-efficient than grid/random search

**Learning Curves:**

Plot training and validation performance vs:

- Training set size: Diagnose bias/variance
- Training iterations: Detect convergence/overfitting

______________________________________________________________________

## Conclusion

This theory document covers the mathematical foundations underlying the ML curriculum from Days
38-67. Each concept builds on previous ones, forming a coherent framework for understanding modern
machine learning:

1. **Linear Algebra** provides the language for representing data and transformations
1. **Calculus** enables optimization through gradient-based methods
1. **Probability** allows reasoning about uncertainty
1. **Supervised Learning** applies these foundations to learn mappings from inputs to outputs
1. **Deep Learning** extends linear models with non-linear compositions
1. **Regularization** prevents overfitting through various constraint mechanisms
1. **Ensembles** combine models for robust predictions
1. **Unsupervised Learning** discovers structure in unlabeled data
1. **Probabilistic Models** explicitly represent uncertainty
1. **Time Series** handles temporal dependencies
1. **Advanced Deep Learning** tackles complex patterns in images, sequences, and text
1. **Evaluation** ensures models generalize beyond training data

For practical implementations of these concepts, refer to the corresponding lesson days (38-67) in
the curriculum. Each lesson provides executable code, worked examples, and exercises to solidify
understanding.

______________________________________________________________________

## Further Reading

### Books

- **Linear Algebra:**

  - Gilbert Strang, *Linear Algebra and Its Applications*
  - Sheldon Axler, *Linear Algebra Done Right*

- **Calculus and Optimization:**

  - Stephen Boyd & Lieven Vandenberghe, *Convex Optimization*
  - Jorge Nocedal & Stephen Wright, *Numerical Optimization*

- **Probability and Statistics:**

  - Larry Wasserman, *All of Statistics*
  - Dimitri Bertsekas & John Tsitsiklis, *Introduction to Probability*

- **Machine Learning:**

  - Christopher Bishop, *Pattern Recognition and Machine Learning*
  - Trevor Hastie et al., *The Elements of Statistical Learning*
  - Kevin Murphy, *Probabilistic Machine Learning: An Introduction*

- **Deep Learning:**

  - Ian Goodfellow et al., *Deep Learning*
  - François Chollet, *Deep Learning with Python*

### Online Resources

- **Stanford CS229:** Machine Learning (Andrew Ng)
- **Stanford CS231n:** Convolutional Neural Networks
- **Stanford CS224n:** Natural Language Processing with Deep Learning
- **Fast.ai:** Practical Deep Learning for Coders
- **Distill.pub:** Interactive visual explanations

### Papers

- Rumelhart et al. (1986): "Learning representations by back-propagating errors"
- Hochreiter & Schmidhuber (1997): "Long Short-Term Memory"
- Vaswani et al. (2017): "Attention Is All You Need"
- Kingma & Ba (2014): "Adam: A Method for Stochastic Optimization"
- He et al. (2015): "Deep Residual Learning for Image Recognition"

______________________________________________________________________

*This theory document is maintained as part of the Coding for MBA curriculum. For questions or
suggestions, please open an issue on the
[GitHub repository](https://github.com/saint2706/Coding-For-MBA).*
