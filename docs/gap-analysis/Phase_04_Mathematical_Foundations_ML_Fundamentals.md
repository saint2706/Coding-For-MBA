# Gap Analysis — Phase 04: Mathematical Foundations & ML Fundamentals

> Audited against the Phase 1 Quality Bar. See [GAP_ANALYSIS.md](../../GAP_ANALYSIS.md) for the full rubric, gap taxonomy, and severity legend.

## Phase summary

Phase 04 is unusually substantial for a later phase: every lesson has a never-coded bridge, senior insights, labs, mastery checks, and an explained five-question quiz. However, it often teaches by displaying completed code rather than framing a decision, requiring a learner to make it, and showing expected output; the thinnest lessons are Day 45 and the neural-network sequence. Mathematical and model-evaluation choices also need more business intuition, explicit definitions, and justification of defaults.

**Recurring gaps in this phase:**

- Labs are commonly complete worked examples, not exercises with an explicit goal, scenario, steps, and expected output.
- Code comments frequently substitute for what/why preambles; magic numbers and model/CV defaults are rarely justified.
- Tables summarize choices but often omit decision criteria, costs, and failure signals.
- Glossaries and a recurring phase project thread are absent; cross-references are mostly limited to prerequisites and “Tomorrow.”
- Coverage should expand around uncertainty, bias–variance, leakage, class imbalance, interpretability, deployment monitoring, and modern deep-learning alternatives.

**Lessons audited:** 14

---

## Day 37 — Python Review & ML Preparation

**Path:** `content/lessons/Phase_04_Mathematical_Foundations_ML_Fundamentals/Day_37_Conclusion/README.md`

**Assessment:** A strong, practical bridge from Python into ML, with a useful “Data Readiness Checklist,” memory advice, and five explained mastery questions. Yet the lesson races through NumPy, pandas, and visualization as a command catalogue—e.g., “`# First look - always do this`”—without consistently explaining which business question each operation answers. Its labs provide finished solutions rather than learner-facing deliverables and expected outputs.

**Gap task stubs:**

- [ ] [P1][A:Concept] In “NumPy Essentials,” define vectorization, broadcasting, axis, shape, and normalization in plain language; explain why row normalization is appropriate before using “`Normalize each row to sum to 1`.”
- [ ] [P1][B:CodeCtx] Add a what/why preamble before each NumPy, pandas, visualization, and memory-optimization block, replacing comment-only context such as “`# First look - always do this`” with the decision the block supports.
- [ ] [P1][C:Lab] Recast all three exercises as genuine labs with goal, MBA scenario, supplied inputs, numbered tasks, and concrete expected tables/plots; move completed solutions out of the task flow.
- [ ] [P2][M:Coverage] Add coverage of reproducible exploratory analysis, data dictionaries, target leakage checks, and train/test separation during EDA.
- [ ] [P2][O:Glossary] Add a glossary for array, vectorization, broadcasting, dtype, feature, target, cardinality, and correlation.
- [ ] [P2][N:Thread] Introduce a recurring Phase 04 business dataset and decision brief that later math and ML lessons continue.

---

## Day 37B — Probability & Statistics for Machine Learning

**Path:** `content/lessons/Phase_04_Mathematical_Foundations_ML_Fundamentals/Day_37B_Probability_and_Statistics_for_ML/README.md`

**Assessment:** The lesson has clear business examples, a valuable p-value warning, Bayesian/frequentist comparison, and explained mastery checks. Some claims are too absolute—especially “`CLT guarantees this mean is normally distributed → valid confidence intervals!`” and “`p < 0.05 → the new checkout is genuinely better!`”—and risk teaching false certainty. The labs lack explicit expected outputs and the hypothesis-test example does not connect statistical significance to practical value.

**Gap task stubs:**

- [ ] [P0][A:Concept] Correct and qualify “`CLT guarantees this mean is normally distributed → valid confidence intervals!`”; explain approximation conditions, independence, sample size, fold dependence, and why CV uncertainty is not automatically a textbook normal CI.
- [ ] [P0][A:Concept] Replace “`p < 0.05 → the new checkout is genuinely better!`” with an explanation of effect size, confidence interval, practical significance, power, and the limits of a p-value.
- [ ] [P1][A:Concept] Define conditional probability, independence, likelihood, prior/posterior, standard error, confidence interval, and Laplace smoothing before use; justify the 0.05 and 95% conventions.
- [ ] [P1][C:Lab] Give each exercise a business goal, numbered steps, and expected numeric output/classification; Exercise 2 must state acceptance criteria for the spam classifier.
- [ ] [P1][M:Coverage] Add multiple testing, statistical power/sample-size planning, base-rate effects, calibration, and correlation-versus-causation.
- [ ] [P2][F:Tables] Expand “Bayesian vs. Frequentist” into decision guidance covering when each approach is preferable, assumptions, stakeholder output, and cost.
- [ ] [P2][O:Glossary] Add a probability/statistics glossary.

---

## Day 37C — Sklearn Pipelines & ColumnTransformer

**Path:** `content/lessons/Phase_04_Mathematical_Foundations_ML_Fundamentals/Day_37C_Sklearn_Pipelines/README.md`

**Assessment:** This is one of the phase’s strongest production-oriented lessons: it motivates leakage, demonstrates mixed-column preprocessing, serialization, CV, and custom-transformer failure modes. Still, statements like “`With Pipeline, this is handled automatically — you can't make this mistake`” overpromise, while choices such as five folds, model settings, imputation, and unsafe pickle serialization receive little justification. Labs again omit expected outputs.

**Gap task stubs:**

- [ ] [P0][A:Concept] Qualify “`you can't make this mistake`” by showing leakage pipelines do not prevent: target-derived features, temporal leakage, precomputed global aggregates, and leakage before pipeline entry.
- [ ] [P1][A:Concept] Explain why each transformer is selected and justify “`5-fold CV`”; discuss when 3, 5, 10, stratified, grouped, or time-based folds are appropriate.
- [ ] [P1][C:Lab] Add expected outputs and pass/fail checks for leakage repair, churn-pipeline CV, serialization/reload parity, and the custom transformer.
- [ ] [P1][I:Senior] Add schema validation, unknown-category handling, feature-name inspection, model/data versioning, pickle trust/security risks, and monitoring of preprocessing drift.
- [ ] [P2][M:Coverage] Add `set_output(transform="pandas")`, metadata routing caveats, pipeline caching, reproducibility, and unit testing custom transformers.
- [ ] [P2][K:Xref] Link explicitly to Day 45’s leakage/CV material and classification lessons where the pipeline should replace manual preprocessing.

---

## Day 38 — Linear Algebra for Machine Learning

**Path:** `content/lessons/Phase_04_Mathematical_Foundations_ML_Fundamentals/Day_38_Linear_Algebra/README.md`

**Assessment:** The lesson layers customer vectors into matrix operations and ML applications effectively, and its numerical-stability and sparse-matrix sections are genuinely useful. Business intuition becomes thin around inverse, determinant, eigendecomposition, and PCA; “`These reveal the "principal directions" of a transformation`” is not enough for a never-coded learner to understand the business consequence. The exercises are mostly solved demonstrations with no expected-output rubric.

**Gap task stubs:**

- [ ] [P0][A:Concept] Expand “`principal directions`,” determinant, inverse, rank, and singularity with visual/business intuition and explain what each helps diagnose in an ML workflow.
- [ ] [P1][A:Concept] Explain scale sensitivity before using raw customer vectors for dot-product/cosine similarity and distinguish dot product, Euclidean distance, and cosine similarity with when-to-use guidance.
- [ ] [P1][C:Lab] Add explicit goals, steps, expected nearest products/weights/PCA variance, and interpretation prompts to all three exercises.
- [ ] [P1][M:Coverage] Add rank, linear dependence, condition number, orthogonality, SVD, and why regularization helps ill-conditioned systems.
- [ ] [P2][F:Tables] Add a decision table mapping operation/similarity measure to business use, assumptions, scaling needs, and failure modes.
- [ ] [P2][O:Glossary] Add a glossary for scalar, vector, matrix, tensor, norm, transpose, rank, eigenvector, sparse, and singular.

---

## Day 39 — Calculus for Machine Learning

**Path:** `content/lessons/Phase_04_Mathematical_Foundations_ML_Fundamentals/Day_39_Calculus/README.md`

**Assessment:** The downhill analogy, visualizations, chain-rule bridge, optimization challenges, and gradient-descent lab form a coherent introduction. However, the toy loss “`L(w) = (w - 3)²`” is not connected strongly enough to a business prediction error, learning rates “`0.01: Too slow` / `0.1: Just right` / `0.9: Too fast`” look universal, and derivative/gradient notation arrives with limited interpretation. Expected outputs and diagnostic criteria are absent from labs.

**Gap task stubs:**

- [ ] [P0][A:Concept] Define loss, derivative, partial derivative, gradient, convexity, local/global minimum, epoch, and convergence before using them; connect each to an observable business/model outcome.
- [ ] [P1][A:Concept] Qualify “`0.1: Just right`” as specific to the toy function and explain how scale, optimizer, batch size, and curvature change a suitable learning rate.
- [ ] [P1][C:Lab] Add expected parameter estimates, loss behavior, plots, and troubleshooting criteria to every lab; require learners to diagnose a diverging run.
- [ ] [P1][M:Coverage] Add finite-difference gradient checking, stochastic/mini-batch gradients, momentum/Adam intuition, saddle points, and regularization gradients.
- [ ] [P2][E:Framing] Replace at least one abstract quadratic with a pricing, demand-forecast, or campaign-allocation objective and interpret the gradient as marginal business impact.
- [ ] [P2][O:Glossary] Add a calculus/optimization glossary.

---

## Day 40 — Introduction to Machine Learning

**Path:** `content/lessons/Phase_04_Mathematical_Foundations_ML_Fundamentals/Day_40_Intro_to_ML/README.md`

**Assessment:** The lesson gives broad visual exposure to supervised/unsupervised learning, splitting, overfitting, metrics, preprocessing, and a complete workflow. Its central weakness is conceptual: it shows train/test behavior without defining generalization or overfitting, and uses conventional choices such as 80/20 and five-fold CV without rationale. Metrics are calculated, but learners receive too little guidance about when MAE versus RMSE, recall, or another metric matches business costs.

**Gap task stubs:**

- [ ] [P0][A:Concept] Add explicit definitions and examples of generalization, overfitting, underfitting, training/validation/test sets, and bias–variance before the split and learning-curve code.
- [ ] [P0][A:Concept] Justify the 80/20 split and five-fold CV choices; explain how dataset size, time ordering, groups, class rarity, and tuning affect the choice.
- [ ] [P0][F:Tables] Add decision guidance for MAE vs RMSE and accuracy vs precision/recall/F1/AUC, tied to asymmetric business costs and outliers.
- [ ] [P1][C:Lab] Add goal/scenario/sample-data/steps/expected-output contracts and require interpretation of whether each model generalizes.
- [ ] [P1][M:Coverage] Add baseline models, leakage, class imbalance, calibration, threshold selection, regularization intuition, and nested CV/test-set discipline.
- [ ] [P1][I:Senior] Add a model-governance checklist: metric ownership, reproducibility, subgroup evaluation, drift, retraining triggers, and go/no-go criteria.
- [ ] [P2][O:Glossary] Add a glossary for core ML workflow and metric terms.

---

## Day 41 — Supervised Learning: Regression

**Path:** `content/lessons/Phase_04_Mathematical_Foundations_ML_Fundamentals/Day_41_Supervised_Learning_Regression/README.md`

**Assessment:** The lesson is broad and practical, spanning linear and polynomial regression, regularization, tree regressors, diagnostics, and comparison. It demonstrates many metrics and models but can encourage leaderboard thinking without enough decision framing: the learner needs clearer explanations of assumptions, residual patterns, coefficient interpretation, uncertainty, and why one error metric fits a business objective. The labs are mostly end-to-end solutions rather than assessed tasks.

**Gap task stubs:**

- [ ] [P0][A:Concept] Define regression assumptions, residuals, multicollinearity, heteroscedasticity, extrapolation, and regularization; explain their business consequences before diagnostics/model selection.
- [ ] [P1][F:Tables] Expand model/metric comparisons into when-to-choose guidance for MAE, MSE/RMSE, MAPE, and R², including zero targets, outliers, units, and cost asymmetry.
- [ ] [P1][C:Lab] Add expected metric ranges, residual-plot interpretations, and a final recommendation memo requirement to each lab.
- [ ] [P1][M:Coverage] Add prediction intervals versus confidence intervals, transformed-target bias, robust/quantile regression, time-aware regression validation, and leakage in target-derived features.
- [ ] [P1][I:Senior] Add coefficient/feature-importance caveats, subgroup error analysis, drift monitoring, and a baseline-versus-complexity deployment gate.
- [ ] [P2][N:Thread] Reuse the phase’s recurring business dataset and carry the chosen metric/model into later evaluation lessons.

---

## Day 42 — Supervised Learning: Classification Part 1

**Path:** `content/lessons/Phase_04_Mathematical_Foundations_ML_Fundamentals/Day_42_Supervised_Learning_Classification_Part_1/README.md`

**Assessment:** This is a strong business-aware classification lesson, especially the churn-cost threshold exercise and explained accuracy-trap mastery check. Nevertheless, it uses generated labels and a clean pipeline that understate class imbalance, probability calibration, leakage, and operational consequences. The fixed “`Cost of FN ... $500`” and “`Cost of FP ... $50`” are useful but not justified or sensitivity-tested.

**Gap task stubs:**

- [ ] [P0][A:Concept] Define decision threshold, score/probability, calibration, prevalence/base rate, and class imbalance before metric and threshold optimization code.
- [ ] [P1][A:Concept] Explain how to estimate and validate the “`$500`” FN and “`$50`” FP costs; add sensitivity analysis instead of presenting them as fixed truth.
- [ ] [P1][C:Lab] Add explicit expected confusion matrices/metric ranges and require a stakeholder-facing threshold recommendation with assumptions.
- [ ] [P1][M:Coverage] Add PR-AUC, calibration curves/Brier score, stratification, resampling/class weights, multiclass metrics, and fairness across subgroups.
- [ ] [P1][I:Senior] Explain why threshold selection must use validation data rather than the final test set and how production prevalence shifts affect it.
- [ ] [P2][F:Tables] Add a metric decision table based on error cost, class balance, ranking versus probability needs, and stakeholder use.

---

## Day 43 — Supervised Learning: Classification Part 2

**Path:** `content/lessons/Phase_04_Mathematical_Foundations_ML_Fundamentals/Day_43_Supervised_Learning_Classification_Part_2/README.md`

**Assessment:** The lesson gives intuitive tree/forest explanations, useful overfitting visuals, tuning comparisons, and business-rule extraction. Some guidance is too categorical—“`Use Random Forests when: Accuracy matters more than interpretability`” and “`Consider Gradient Boosting when ... Memory isn't a constraint`”—without discussing latency, calibration, explainability, or data size. Tuning code does not sufficiently explain nested evaluation or search-space rationale.

**Gap task stubs:**

- [ ] [P0][A:Concept] Explain impurity, split gain, bagging, feature subsampling, out-of-bag evaluation, and why forests reduce variance before presenting model code.
- [ ] [P1][F:Tables] Replace categorical model advice with a decision table covering accuracy, interpretability, latency, memory, calibration, tuning cost, and dataset constraints.
- [ ] [P1][A:Concept] Justify every grid/random-search range and explain why tuning on a held-out test set is invalid.
- [ ] [P1][C:Lab] Add expected outputs, selection criteria, and a requirement to validate extracted business rules against unseen data.
- [ ] [P1][M:Coverage] Add gradient boosting at a conceptual level, permutation importance/SHAP caveats, correlated-feature importance bias, monotonic constraints, and class imbalance.
- [ ] [P1][I:Senior] Add nested CV, reproducible parallel tuning, inference-latency measurement, and governance risks of converting a model into policy rules.

---

## Day 44 — Unsupervised Learning

**Path:** `content/lessons/Phase_04_Mathematical_Foundations_ML_Fundamentals/Day_44_Unsupervised_Learning/README.md`

**Assessment:** The lesson is rich in customer segmentation, anomaly detection, PCA, stability, and production considerations. It still treats several judgment calls as givens: the elbow is drawn at K=3, “`Flag top 10% by distance as potential anomalies`” is arbitrary, and the PCA chart uses a 95% threshold without explaining business tradeoffs. Cluster naming risks turning exploratory patterns into unsupported customer truths.

**Gap task stubs:**

- [ ] [P0][A:Concept] Explain that clusters are model-dependent constructs, not discovered ground truth; add safeguards against overinterpreting or stereotyping segments.
- [ ] [P1][A:Concept] Justify or sensitivity-test K, the “`top 10%`” anomaly cutoff, and “`95% threshold`”; tie each to operational capacity and error costs.
- [ ] [P1][C:Lab] Add expected cluster profiles/metrics, acceptance criteria, and a business-action validation plan to each lab.
- [ ] [P1][M:Coverage] Add DBSCAN, hierarchical clustering, Gaussian mixtures, outlier-specific methods, PCA leakage, component interpretation, and nonlinear reduction caveats.
- [ ] [P1][I:Senior] Expand cluster drift/stability into monitoring, reassignment/versioning policy, human validation, and online scoring concerns.
- [ ] [P2][F:Tables] Expand “PCA vs Other Reduction Techniques” into decision guidance for modeling, visualization, interpretability, scale, and new-point transformation.

---

## Day 45 — Feature Engineering and Evaluation

**Path:** `content/lessons/Phase_04_Mathematical_Foundations_ML_Fundamentals/Day_45_Feature_Engineering_and_Evaluation/README.md`

**Assessment:** At only a compact survey relative to neighboring lessons, Day 45 is the phase’s clearest coverage gap. It introduces transformations, encoding, CV, leakage, and pipelines, and its “`Leakage detection protocol`” is valuable, but many sections are code-first and abbreviated. It lacks robust business framing, expected outputs, a full metric/evaluation decision framework, and enough treatment of feature availability and validation design.

**Gap task stubs:**

- [ ] [P0][M:Coverage] Expand evaluation coverage to bias–variance, learning/validation curves, baseline selection, nested CV, confidence intervals, threshold tuning, calibration, subgroup/fairness checks, and statistical comparison of models.
- [ ] [P0][A:Concept] Define leakage categories, nominal versus ordinal variables, skew, scaling, interaction, and feature availability at prediction time before code.
- [ ] [P1][B:CodeCtx] Add what/why preambles to every transformation, encoding, CV, leakage, and pipeline block; explain the business decision each supports.
- [ ] [P1][C:Lab] Rebuild all three exercises with scenarios, sample data, numbered tasks, expected outputs, and explicit leakage/evaluation acceptance criteria.
- [ ] [P1][M:Coverage] Add rare/unseen categories, high-cardinality encoding and leakage risks, missingness indicators, outliers, feature selection, temporal/grouped CV, and feature stores.
- [ ] [P1][I:Senior] Add train/serve skew, feature lineage, point-in-time correctness, drift, reproducibility, and feature-governance review.
- [ ] [P2][F:Tables] Expand the “CV Strategy Guide” with dataset patterns, leakage risks, tradeoffs, and concrete when-not-to-use guidance.
- [ ] [P2][O:Glossary] Add a glossary and explicit cross-links back to Day 37C pipelines and forward to neural-network evaluation.

---

## Day 46 — Introduction to Neural Networks

**Path:** `content/lessons/Phase_04_Mathematical_Foundations_ML_Fundamentals/Day_46_Intro_to_Neural_Networks/README.md`

**Assessment:** The lesson offers an accessible neuron analogy, Keras workflow, backpropagation explanation, architecture guide, and overfitting controls. It moves too quickly from a toy neuron into an unexplained architecture and compile choices, while the “Common Hyperparameters” guidance does not justify values or discuss compute/business tradeoffs. Labs provide implementation shells but no expected outcomes or baseline comparison.

**Gap task stubs:**

- [ ] [P0][A:Concept] Define logits, loss, batch, epoch, optimizer, validation set, parameter, and backpropagation before Keras code; explain why the selected output activation/loss pair is valid.
- [ ] [P1][A:Concept] Justify hidden-layer sizes, epochs, batch size, validation split, optimizer, and learning rate rather than presenting magic defaults.
- [ ] [P1][C:Lab] Add expected metric ranges/curves, a non-neural baseline, compute budget, and interpretation/debug tasks to all labs.
- [ ] [P1][M:Coverage] Add normalization, initialization, batch normalization, vanishing/exploding gradients, reproducibility, calibration, and when neural networks are a poor tabular-data choice.
- [ ] [P1][I:Senior] Add GPU/CPU and latency/cost tradeoffs, experiment tracking, checkpointing, model size, monitoring, and responsible deployment.
- [ ] [P2][F:Tables] Turn architecture/hyperparameter lists into decision guidance with symptom → likely cause → intervention.

---

## Day 47 — Convolutional Neural Networks

**Path:** `content/lessons/Phase_04_Mathematical_Foundations_ML_Fundamentals/Day_47_Convolutional_Neural_Networks/README.md`

**Assessment:** The lesson clearly introduces filters, pooling, MNIST, augmentation, and transfer learning, with concise mastery explanations. It is thin on the business case and on why architectural choices work: the code jumps to 32/64 filters, 3×3 kernels, pooling, epochs, and ImageNet transfer without justification. Labs lack problem contracts and expected output, and production image risks are barely covered.

**Gap task stubs:**

- [ ] [P0][A:Concept] Define channel, kernel/filter, stride, padding, receptive field, feature map, pooling, and translation equivariance before CNN code.
- [ ] [P1][A:Concept] Justify 3×3 kernels, 32/64 filters, pooling, normalization, epochs, and frozen transfer-learning layers; show how choices affect shape, compute, and accuracy.
- [ ] [P1][C:Lab] Add business scenarios, expected accuracy/confusion outputs, error-analysis requirements, and baseline comparisons to all exercises.
- [ ] [P1][M:Coverage] Add multiclass imbalance, augmentation validity, fine-tuning strategy, image leakage/near-duplicates, object detection/segmentation overview, and vision transformers as a modern alternative.
- [ ] [P1][I:Senior] Add dataset licensing/privacy, subgroup performance, adversarial/domain-shift risks, model size/latency, and human review workflows.
- [ ] [P2][N:Thread] Connect the CNN exercise to a recurring business decision rather than standalone MNIST digits.

---

## Day 48 — Recurrent Neural Networks

**Path:** `content/lessons/Phase_04_Mathematical_Foundations_ML_Fundamentals/Day_48_Recurrent_Neural_Networks/README.md`

**Assessment:** The sequence-processing analogy, RNN/LSTM/GRU comparison, masking, bidirectionality caveat, and multi-step forecasting lab provide a useful introduction. The lesson’s sine-wave example makes forecasting look cleaner than business time series, and its simple chronological split does not teach backtesting, seasonality, leakage, or baseline comparison. It also ends without the standard “Tomorrow” preview, and modern sequence alternatives are absent.

**Gap task stubs:**

- [ ] [P0][A:Concept] Define hidden state, timestep, sequence window, horizon, vanishing gradient, gate, teacher forcing, and autoregressive forecasting before model code.
- [ ] [P0][M:Coverage] Add time-series backtesting/walk-forward validation, naive and seasonal baselines, leakage-safe scaling/windowing, seasonality, uncertainty intervals, and forecast metrics.
- [ ] [P1][A:Concept] Justify the 10-step window, architecture sizes, epochs, split point, padding length, and multi-step strategy; connect each to a business forecast horizon.
- [ ] [P1][C:Lab] Add expected plots/metric ranges, baseline comparisons, rolling-origin evaluation, and error analysis for each exercise.
- [ ] [P1][M:Coverage] Add transformers/attention, temporal CNNs, encoder-decoder models, covariates, direct versus recursive multi-step forecasting, and concept drift.
- [ ] [P1][I:Senior] Add latency/state management, retraining cadence, late-arriving data, monitoring by horizon, and why bidirectional models cannot serve causal real-time forecasts.
- [ ] [P2][J:Summary] Add the missing “Tomorrow”/phase-transition preview and a capstone synthesis of when to choose classical ML, CNNs, RNNs, or modern alternatives.
- [ ] [P2][O:Glossary] Add a sequence-modeling and forecasting glossary.
