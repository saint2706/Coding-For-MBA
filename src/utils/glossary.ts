/**
 * Glossary Module
 *
 * Provides a comprehensive glossary of technical terms with short definitions
 * for hover tooltips throughout the application. Terms cover Python, data science,
 * machine learning, SQL, web development, and statistics concepts.
 */

/**
 * Glossary of technical terms with short definitions for hover tooltips.
 *
 * Maps technical terms (as keys) to their concise definitions (as values).
 * Used for providing contextual help throughout the learning platform.
 */
export const glossaryTerms: Record<string, string> = {
  // Python fundamentals
  variable: 'A named container that stores a value in memory.',
  function: 'A reusable block of code that performs a specific task.',
  parameter:
    'A variable listed in a function definition that receives a value when the function is called.',
  argument: 'A value passed to a function when it is called.',
  recursion: 'A technique where a function calls itself to solve smaller sub-problems.',
  'list comprehension':
    'A concise way to create lists using a single line of code with an embedded loop.',
  decorator: 'A function that modifies the behavior of another function using @syntax.',
  generator: 'A function that yields values one at a time using the yield keyword, saving memory.',
  lambda: 'An anonymous, single-expression function defined with the lambda keyword.',
  tuple: 'An immutable ordered collection of elements.',
  dictionary: 'A key-value data structure for fast lookups.',
  class: 'A blueprint for creating objects that bundles data and behavior together.',
  module: 'A file containing Python code that can be imported and reused.',
  exception: 'An error that occurs during program execution and can be caught and handled.',
  iterator: 'An object that produces values one at a time when iterated over.',

  // Data science
  DataFrame: 'A 2D labeled data structure in pandas, like a spreadsheet or SQL table.',
  'missing data': 'Absent values in a dataset, represented as NaN or None.',
  'data cleaning': 'The process of fixing errors, inconsistencies, and gaps in raw data.',
  normalization: 'Scaling data to a standard range (e.g., 0–1) for fair comparison.',
  'feature engineering': 'Creating new input variables from raw data to improve model performance.',
  'exploratory data analysis':
    'Summarizing and visualizing data to discover patterns before modeling.',
  outlier: 'A data point that differs significantly from other observations.',
  correlation: 'A statistical measure of how two variables move together.',
  'star schema':
    'A BI data model with a central fact table connected to denormalized dimension tables.',
  'slowly changing dimension':
    'A dimension-management approach for tracking how descriptive attributes change over time.',
  'data lineage':
    'Documentation of where data comes from, how it changes, and where it is consumed.',
  'data governance':
    'Policies, ownership, and controls that ensure data is trustworthy, secure, and compliant.',

  // Machine learning
  'machine learning': 'Algorithms that learn patterns from data to make predictions or decisions.',
  'supervised learning': 'ML where the model learns from labeled examples with known answers.',
  'unsupervised learning': 'ML where the model finds hidden patterns in data without labels.',
  overfitting: 'When a model memorizes training data and fails to generalize to new data.',
  'gradient descent':
    'An optimization algorithm that iteratively adjusts parameters to minimize error.',
  'neural network': 'A computing system inspired by biological neurons, used for deep learning.',
  'deep learning': 'ML using multi-layered neural networks to learn complex representations.',
  regression: 'Predicting a continuous numerical value (e.g., price, temperature).',
  classification: 'Predicting a discrete category (e.g., spam/not-spam, positive/negative).',
  'random forest': 'An ensemble of decision trees that vote on predictions for better accuracy.',
  'cross-validation': 'Evaluating a model by splitting data into multiple train/test folds.',
  AUC: 'Area Under the ROC Curve — a threshold-independent measure of classification ranking quality.',
  RMSE: 'Root Mean Squared Error — a regression metric that penalizes larger prediction errors.',
  MAE: 'Mean Absolute Error — a regression metric averaging absolute prediction differences.',
  SHAP: 'SHapley Additive exPlanations — a method for attributing model predictions to features.',
  LSTM: 'Long Short-Term Memory network — an RNN architecture designed for long-range sequence patterns.',
  transformer:
    'A neural architecture that relies on attention mechanisms to model relationships in sequences.',

  // SQL & databases
  SQL: 'Structured Query Language — the standard language for querying relational databases.',
  JOIN: 'A SQL operation that combines rows from two or more tables based on a related column.',
  INDEX: 'A database structure that speeds up row retrieval at the cost of extra storage.',
  'primary key': 'A column (or set of columns) that uniquely identifies each row in a table.',
  'foreign key':
    'A column that references the primary key of another table, creating a relationship.',
  transaction: 'A unit of database work that is committed completely or rolled back entirely.',
  ACID: 'Atomicity, Consistency, Isolation, Durability — properties that ensure reliable database transactions.',
  CTE: 'Common Table Expression — a named temporary result set defined with WITH for clearer SQL queries.',
  MVCC: 'Multi-Version Concurrency Control — a technique that lets readers and writers work with minimal blocking.',
  WAL: 'Write-Ahead Logging — recording changes before applying them to support crash recovery.',
  'query plan':
    'The execution strategy chosen by the database optimizer for running a SQL statement.',
  vacuum:
    'A maintenance process (notably in PostgreSQL) that reclaims storage and updates table statistics.',
  JSONB:
    'A binary JSON type in PostgreSQL that supports indexing and efficient semi-structured queries.',
  XML: 'Extensible Markup Language — a tagged text format used for hierarchical structured data.',

  // Web & engineering
  API: 'Application Programming Interface — a set of rules for software components to communicate.',
  REST: 'An architectural style for web APIs using standard HTTP methods (GET, POST, PUT, DELETE).',
  JSON: 'JavaScript Object Notation — a lightweight text format for structured data exchange.',
  ETL: 'Extract, Transform, Load — a pipeline pattern for moving data between systems.',
  ELT: 'Extract, Load, Transform — a pipeline pattern where transformations run after loading data.',
  KPI: 'Key Performance Indicator — a metric tied to business goals and performance tracking.',
  SLA: 'Service Level Agreement — a formal commitment for system availability or response expectations.',
  RBAC: 'Role-Based Access Control — permission management based on roles rather than individual users.',

  // Statistics
  'standard deviation': 'A measure of how spread out values are from the mean.',
  'p-value':
    'The probability that observed results occurred by chance; low values suggest significance.',
  'hypothesis testing': 'A statistical method for deciding whether data supports a specific claim.',
  'confidence interval':
    'A range of values within which the true population parameter likely falls.',
  'p-hacking':
    'Manipulating analyses or repeated testing to force statistically significant-looking results.',
  'false positive': 'An incorrect positive prediction (Type I error).',
  'false negative': 'An incorrect negative prediction (Type II error).',
}

/**
 * Builds a case-insensitive regex that matches any glossary term at word boundaries.
 *
 * Terms are sorted longest-first to ensure multi-word terms match before
 * single-word sub-terms (e.g., "machine learning" before "machine").
 *
 * @returns Regular expression for matching glossary terms in text
 */
export function getGlossaryRegex(): RegExp {
  const escaped = Object.keys(glossaryTerms)
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'i')
}
