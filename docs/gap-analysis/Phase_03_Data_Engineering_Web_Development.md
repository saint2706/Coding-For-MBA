# Gap Analysis — Phase 03: Data Engineering & Web Development

> Audited against the Phase 1 Quality Bar. See [GAP_ANALYSIS.md](../../GAP_ANALYSIS.md) for the full rubric, gap taxonomy, and severity legend.

## Phase summary

Phase 03 successfully introduces a wide array of crucial data engineering and web development topics, but it consistently fails to meet the Phase 1 Quality Bar regarding lab execution and theoretical depth. The lessons frequently rely on bare code blocks without proper business framing, scenarios, or explicit problem statements. Critical jargon and magic numbers are routinely introduced in code without prior definition or justification in the text.

**Recurring gaps in this phase:**

- **[C:Lab] Bare Code Blocks**: Nearly every lab exercise across the phase is presented as a raw code block lacking a business scenario, explicit task instructions, and expected output formats.
- **[A:Concept] Undefined Jargon & Magic Numbers**: Lessons frequently introduce concepts (IQR, percentiles, CSS selectors, REST) or specific values (1.5 IQR multiplier, 3-sigma) in code without defining them or justifying their use in the preceding text.
- **[A:Concept/F:Tables] Missing "Why/When" Context**: Tools and charts (e.g., Violin plots vs Box plots, SQL vs NoSQL, Plotly data structures) are introduced technically without adequate guidance on *when* or *why* a business would choose one over the other.
- **[C:Lab] Missing Starter Code for Failure Injection**: Advanced debugging exercises (Failure Injection) often provide high-level text instructions but fail to provide the concrete, actionable starter code required to reproduce the failure.

**Lessons audited:** 14

---

## Day 25 — Data Cleaning

**Path:** `content/lessons/Phase_03_Data_Engineering_Web_Development/Day_25_Data_Cleaning/README.md`

**Assessment:** The lesson lacks theoretical foundations for its outlier detection methods. It introduces IQR and Z-scores simply by stating "Outliers can distort statistics. Detect them with IQR or Z-scores." followed by bare code blocks. The code uses a 1.5 multiplier without defining the Tukey fence or explaining why 1.5 is chosen. Similarly, it mentions Z-scores but lacks a definition of the 3-sigma rule or when to prefer IQR over Z-scores (e.g., robustness). The lab exercises (1-3) are completely devoid of business context, presenting only bare code blocks without problem statements, scenarios, sample data expectations, or expected output formatting.

**Gap task stubs:**

- [ ] [P0][A:Concept] "Outlier Detection and Handling" section: Define quartile and IQR *before* the IQR code block. Explain that IQR measures the middle 50% of the data.
- [ ] [P0][A:Concept] "Outlier Detection and Handling" section: Justify the `1.5` multiplier in the IQR code. Explain the Tukey fence concept and why 1.5 is the standard threshold for "mild" outliers.
- [ ] [P0][A:Concept] "Outlier Detection and Handling" section: Explain the 3-sigma Z-score rule. Define what a Z-score is and why values > 3 or < -3 are considered outliers in a normal distribution.
- [ ] [P0][A:Concept] "Outlier Detection and Handling" section: Add a "When to use" comparison between IQR (robust to outliers, good for skewed data) and Z-score (assumes normal distribution, sensitive to extreme outliers).
- [ ] [P0][C:Lab] "Exercise 1: Customer Data Normalization": Convert the bare code block into a full problem statement. Add a scenario (e.g., "Marketing needs to unify CRM data..."), explicit sample data, steps to execute, and the exact Expected Output.
- [ ] [P0][C:Lab] "Exercise 2: Sales Data Deduplication": Convert the bare code block into a full problem statement. Add scenario, sample data, steps, and Expected Output.
- [ ] [P0][C:Lab] "Exercise 3: Complete Data Pipeline": Convert the bare code block into a full problem statement. Add scenario, sample data, steps, and Expected Output.
- [ ] [P2][M:Coverage] Add coverage of Data Imputation strategies (e.g., KNN imputation, forward/backward fill in time series) to expand beyond basic mean/median fills.

---

## Day 26 — Statistics

**Path:** `content/lessons/Phase_03_Data_Engineering_Web_Development/Day_26_Statistics/README.md`

**Assessment:** The statistics lesson uses terms like "percentile", "quantile", and "skew" in the code and exercises without ever formally defining them in the text. For example, "Exercise 2: Customer Segmentation" uses `rank(pct=True)` and defines segments based on percentiles, but the preamble text doesn't explain what a percentile represents in business terms. Additionally, the lab exercises are presented as raw code blocks without business framing, scenarios, or explicit problem statements.

**Gap task stubs:**

- [ ] [P0][A:Concept] Define "percentile" and "quantile" before they are used in the segmentation exercise. Explain how they divide data into equal-sized groups.
- [ ] [P0][A:Concept] Define "skew" (left/right) when discussing mean vs. median. Explain how skewness affects the choice of measure of central tendency.
- [ ] [P1][C:Lab] "Exercise 1: Revenue Outlier Analysis": Convert the bare code block into a full problem statement with a business scenario, explicit steps, and Expected Output.
- [ ] [P1][C:Lab] "Exercise 2: Customer Segmentation": Add a problem statement and Expected Output to the code block.
- [ ] [P1][C:Lab] "Exercise 3: Correlation Dashboard": Add a problem statement and Expected Output to the code block.
- [ ] [P1][B:CodeCtx] Add a preamble explaining *why* we use `np.random.exponential` vs `np.random.normal` to simulate skewed vs normal data in Exercise 2.
- [ ] [P2][M:Coverage] Add coverage of A/B testing fundamentals (hypothesis testing, p-values, statistical significance vs practical significance) as it is highly relevant for business analysis.

---

## Day 27 — Visualization

**Path:** `content/lessons/Phase_03_Data_Engineering_Web_Development/Day_27_Visualization/README.md`

**Assessment:** The visualization lesson provides design rules (like starting axes at zero or avoiding pie charts for >5 categories) in the Mastery Check, but fails to integrate these design principles into the main lesson text or explain *why* these rules exist in terms of human perception. The code blocks for exercises again lack business scenarios, problem statements, and expected visual outputs.

**Gap task stubs:**

- [ ] [P0][A:Concept] Add a section explaining the *why* behind data visualization rules (e.g., how the human brain processes length vs area, why truncating axes is misleading) before introducing the code.
- [ ] [P1][C:Lab] "Exercise 1: Monthly Sales Trend": Convert the bare code block into a full problem statement. Provide the business scenario ("The CFO needs to see YoY sales..."), data, steps, and describe the expected output chart.
- [ ] [P1][C:Lab] "Exercise 2: Regional Performance Dashboard": Add a problem statement, scenario, and description of the expected output.
- [ ] [P1][C:Lab] "Exercise 3: Distribution Analysis": Add a problem statement, scenario, and description of the expected output.
- [ ] [P2][F:Tables] Add a "Chart Selection Guide" table detailing when to choose specific chart types based on the data and the question being asked (e.g., Comparison, Trend, Composition).
- [ ] [P2][M:Coverage] Add coverage of accessibility in data visualization (e.g., colorblind-friendly palettes, proper labeling).

---

## Day 28 — Advanced Visualization

**Path:** `content/lessons/Phase_03_Data_Engineering_Web_Development/Day_28_Advanced_Visualization/README.md`

**Assessment:** The advanced visualization lesson jumps straight into complex Seaborn plots (violin plots, strip plots, joint plots) without properly introducing the statistical concepts they represent or the business scenarios where they outshine basic plots. While the code is functional, it lacks the necessary business context and problem framing in the lab exercises, leaving students with code templates but no understanding of when or why a business user would need a violin plot over a standard box plot in practice.

**Gap task stubs:**

- [ ] [P0][A:Concept] "Distribution Analysis" section: Explicitly define what a Violin plot is and what the internal "quartile" represents before the code block. Explain *why* it's better than a box plot for multimodal distributions.
- [ ] [P1][C:Lab] "Exercise 1: Distribution Analysis": Add a clear business problem statement (e.g., "HR wants to analyze salary distributions across departments..."), scenario, and Expected Output to the code block.
- [ ] [P1][C:Lab] "Exercise 2: Correlation Dashboard": Add a business problem statement, scenario, and Expected Output.
- [ ] [P1][C:Lab] "Exercise 3: Multi-Dimensional Exploration": Add a business problem statement, scenario, and Expected Output.
- [ ] [P2][I:Senior] Add a "Senior-Level Insight" section discussing the dangers of over-plotting (too many variables on one chart) and cognitive load in executive dashboards.

---

## Day 29 — Interactive Visualization

**Path:** `content/lessons/Phase_03_Data_Engineering_Web_Development/Day_29_Interactive_Visualization/README.md`

**Assessment:** This lesson introduces Plotly but fails to provide the foundational "why" for specific interactive features beyond a brief mention in the never-coded bridge. The lab exercises are presented as bare code blocks without business framing, problem statements, or expected outputs. There is no clear guidance on how to structure the data properly for Plotly Express (e.g., tidy/long format vs. wide format), which is a common stumbling block for beginners.

**Gap task stubs:**

- [ ] [P0][A:Concept] Add a section explaining the required data structure for Plotly Express (Tidy/Long format vs Wide format) before the basic examples.
- [ ] [P1][C:Lab] "Exercise 1: Sales Dashboard": Convert the bare code block into a full problem statement with a business scenario, explicit steps, and Expected Output.
- [ ] [P1][C:Lab] "Exercise 2: Time Series with Range Selector": Add a problem statement and Expected Output.
- [ ] [P1][C:Lab] "Exercise 3: Animated Scatter": Add a problem statement and Expected Output.
- [ ] [P2][F:Tables] Add a comparison table: Plotly Express vs Plotly Graph Objects (when to graduate from Express).
- [ ] [P2][M:Coverage] Add brief coverage or mention of Dash/Streamlit as the next step for building full web apps from these interactive plots.

---

## Day 30 — Web Scraping

**Path:** `content/lessons/Phase_03_Data_Engineering_Web_Development/Day_30_Web_Scraping/README.md`

**Assessment:** The Web Scraping lesson is structured slightly better, including ethical considerations and senior insights. However, the core lab exercises (Exercises 1-3) still suffer from the same issue: they are bare code blocks lacking a formal problem statement, business scenario, and clear expected output format. The lesson also introduces CSS selectors without formally defining their syntax (e.g., `.` for class, `#` for id) prior to usage.

**Gap task stubs:**

- [ ] [P0][A:Concept] "CSS Selectors" section: Briefly define basic CSS selector syntax (e.g., `tag`, `.class`, `#id`) before using them in the `soup.select()` examples.
- [ ] [P1][C:Lab] "Exercise 1: Basic Quote Scraper": Convert the bare code block into a full problem statement with a business scenario (e.g., "Marketing wants to build a database of inspirational quotes..."), explicit steps, and Expected Output.
- [ ] [P1][C:Lab] "Exercise 2: Multi-Page Scraper": Add a problem statement and Expected Output to the code block.
- [ ] [P1][C:Lab] "Exercise 3: Table Extraction": Add a problem statement and Expected Output to the code block.
- [ ] [P2][M:Coverage] Add coverage of headless browsers (Selenium/Playwright) conceptually, explaining why `requests` fails on Single Page Applications (SPAs) and how headless browsers solve this.

---

## Day 31 — Databases

**Path:** `content/lessons/Phase_03_Data_Engineering_Web_Development/Day_31_Databases/README.md`

**Assessment:** The lesson provides a decent high-level overview of SQLite and Pandas integration, but its execution of lab exercises lacks rigor. The "SQL Injection Prevention" snippet is a good start, but there is no discussion on *how* parameterized queries actually protect the database under the hood. Furthermore, the core lab exercises are completely devoid of business context, presenting bare code blocks without a scenario, explicit task instructions, or expected outputs. The "Reliability & Maintainability" section asks students to "Add transaction boundaries" but doesn't actually show them how to do it in the lab code.

**Gap task stubs:**

- [ ] [P0][A:Concept] "SQL Injection Prevention" section: Explain *why* parameterized queries work (i.e., the database driver treats the input strictly as a literal value, not executable code) rather than just stating "ALWAYS use parameterized queries".
- [ ] [P1][C:Lab] "Exercise 1: Employee Database": Convert the bare code block into a full problem statement. Add a business scenario (e.g., "HR needs to analyze average salaries..."), sample data representation, explicit steps, and Expected Output.
- [ ] [P1][C:Lab] "Exercise 2: Sales Analytics": Add a problem statement, scenario, and Expected Output to the code block.
- [ ] [P1][C:Lab] "Exercise 3: DataFrame to Database": Add a problem statement, scenario, and Expected Output to the code block.
- [ ] [P2][F:Tables] In the "When to Use What" table, clarify the distinction between "CSV or SQLite" for < 10K rows by adding a column for "Concurrency Needs" (e.g., SQLite locks the whole file on write).

---

## Day 32 — Other Databases

**Path:** `content/lessons/Phase_03_Data_Engineering_Web_Development/Day_32_Other_Databases/README.md`

**Assessment:** This lesson introduces MongoDB and NoSQL concepts. However, it glosses over crucial terminology. It uses the terms "Collection" and "Document" in the code but never explicitly maps them to their SQL equivalents (Table and Row), which is standard pedagogy for transitioning SQL users. The lab exercises continue the pattern of bare code blocks lacking problem statements or expected outputs. The "Failure Injection" exercise at the end is great in theory but lacks actionable starter code.

**Gap task stubs:**

- [ ] [P0][A:Concept] "MongoDB Basics" section: Explicitly define "Collection" (analogous to SQL Table) and "Document" (analogous to SQL Row) before diving into the PyMongo code.
- [ ] [P0][A:Concept] "MongoDB Basics" section: Explain the `_id` field that MongoDB automatically generates, as it will appear in outputs and confuse students.
- [ ] [P1][C:Lab] "Exercise 1: MongoDB Document Operations": Convert the bare code block into a full problem statement with a scenario, explicit steps, and Expected Output.
- [ ] [P1][C:Lab] "Exercise 2: Aggregation Pipeline": Add a problem statement, scenario, and Expected Output.
- [ ] [P1][C:Lab] "Exercise 4: Failure Injection": Provide starter code for this exercise rather than just text instructions, so students have a concrete starting point to debug.
- [ ] [P2][M:Coverage] Add brief coverage of JSON structure fundamentals (keys, values, arrays, nested objects) as a prerequisite refresher before diving into MongoDB inserts.

---

## Day 33 — APIs

**Path:** `content/lessons/Phase_03_Data_Engineering_Web_Development/Day_33_API/README.md`

**Assessment:** The API lesson covers GET, POST, and basic error handling well, but it fails to define the core acronyms and concepts. It never defines "REST" despite using it in the frontmatter, and it assumes students know what JSON is without a formal introduction. The lab exercises are, once again, bare code blocks without problem statements, scenarios, or expected outputs.

**Gap task stubs:**

- [ ] [P0][A:Concept] Add a brief section defining "REST" (Representational State Transfer) and what makes an API RESTful (stateless, standard HTTP methods) since it's in the outcomes.
- [ ] [P0][A:Concept] Add a section defining JSON (JavaScript Object Notation) and how it maps directly to Python dictionaries and lists.
- [ ] [P1][C:Lab] "Exercise 1: GitHub API Explorer": Convert the bare code block into a full problem statement with a scenario, explicit steps, and Expected Output.
- [ ] [P1][C:Lab] "Exercise 2: JSON Processing Pipeline": Add a problem statement, scenario, and Expected Output.
- [ ] [P1][C:Lab] "Exercise 3: Multi-Page API": Add a problem statement, scenario, and Expected Output.
- [ ] [P2][M:Coverage] Mention API documentation (like Swagger/OpenAPI) and how to read it, as this is a critical skill for consuming unknown APIs.

---

## Day 34 — Building an API

**Path:** `content/lessons/Phase_03_Data_Engineering_Web_Development/Day_34_Building_an_API/README.md`

**Assessment:** The FastAPI lesson introduces building APIs and has a strong "Deployment-Ready Baseline" section. However, it completely skips explaining what FastAPI *is* (e.g., async by default, relies on type hints for automatic validation/documentation). The exercises, while slightly better named, still lack explicit business scenarios, sample inputs/outputs, and clear problem statements. The "Failure Injection" exercise provides no starter code, violating the rule that stubs must be concrete and actionable.

**Gap task stubs:**

- [ ] [P0][A:Concept] "Technical Deep Dive" section: Add a preamble explaining *why* FastAPI uses type hints (for automatic Pydantic validation and Swagger UI generation).
- [ ] [P1][C:Lab] "Exercise 1: Todo API": Convert the bare code block into a full problem statement with a business scenario, explicit steps, and Expected Output (including a curl command to test it).
- [ ] [P1][C:Lab] "Exercise 2: Calculator API": Add a problem statement, scenario, and Expected Output.
- [ ] [P1][C:Lab] "Exercise 3: User Registration": Add a problem statement, scenario, and Expected Output.
- [ ] [P1][C:Lab] "Exercise 4: Failure Injection": Provide actionable starter code representing the "Contract Break" so the student has something concrete to debug.
- [ ] [P2][I:Senior] Briefly explain the difference between returning `dict` vs letting Pydantic models automatically serialize to JSON in response models.

---

## Day 35 — Flask Web Framework

**Path:** `content/lessons/Phase_03_Data_Engineering_Web_Development/Day_35_Flask_Web_Framework/README.md`

**Assessment:** The Flask lesson covers routing, templates, and forms. It mentions Jinja2 templating but doesn't formally define what a templating engine does or why we need one (separating logic from presentation). The exercises provide bare code snippets (Python logic) but often lack the corresponding HTML templates, leaving the code incomplete and impossible to run. There are no business scenarios or expected outputs for the lab exercises.

**Gap task stubs:**

- [ ] [P0][A:Concept] Add a brief explanation of what Jinja2 is (a templating engine) and why it's necessary (dynamically injecting Python variables into static HTML files) before showing the syntax.
- [ ] [P0][C:Lab] "Exercise 1: Simple Blog": The code block references `blog_index.html` and `post.html`. Provide the explicit HTML content for these templates so the exercise is runnable. Add a business scenario and Expected Output.
- [ ] [P0][C:Lab] "Exercise 2: Contact Form": Provide the `contact.html` template. Add a problem statement, scenario, and Expected Output.
- [ ] [P0][C:Lab] "Exercise 3: Data Dashboard": Provide the `dashboard.html` template. Add a problem statement, scenario, and Expected Output.
- [ ] [P1][C:Lab] "Exercise 4: Failure Injection": Provide actionable starter code containing the "unhandled exception" for students to debug.

---

## Day 36B — Docker Fundamentals

**Path:** `content/lessons/Phase_03_Data_Engineering_Web_Development/Day_36B_Docker_Fundamentals/README.md`

**Assessment:** The Docker lesson is structurally solid, providing a great "Never-Coded Bridge" analogy. However, it asks students to write `Dockerfile` and `docker-compose.yml` files in the lab exercises without providing clear problem statements, expected file structures, or verification commands. "Exercise 2" uses `pass` placeholders in YAML, which is syntactically invalid and confusing for students.

**Gap task stubs:**

- [ ] [P1][C:Lab] "Exercise 1: Containerize the Phase 3 Case Study": Add a clear business scenario and explicit expected output (e.g., "A successful `curl localhost:5000` response").
- [ ] [P1][C:Lab] "Exercise 2: Multi-Service Data Pipeline": Fix the invalid `pass` syntax in the YAML stub. Provide a concrete scenario, expected folder structure, and the exact commands to run/verify.
- [ ] [P1][C:Lab] "Exercise 3: Debug a Broken Container": Provide the expected fixed `Dockerfile` output in a solution block or clear instructions on how to verify the fix.
- [ ] [P2][A:Concept] Briefly define what an "Image" is vs a "Container" (Image = class/blueprint, Container = instance) in the "Building and Running" section to clarify terminology.

---

## Day 36C — Async Python and FastAPI

**Path:** `content/lessons/Phase_03_Data_Engineering_Web_Development/Day_36C_Async_Python_and_FastAPI/README.md`

**Assessment:** The Async Python lesson provides excellent conceptual framing ("Never-Coded Bridge") and strong senior-level insights regarding performance tradeoffs (throughput vs latency, blocking I/O). However, the lab exercises are entirely missing concrete code stubs. They are just lists of instructions (e.g., "Take one Day 34 endpoint... Convert handler..."). Without baseline code, these exercises are not actionable and fail the Phase 1 quality bar for concrete, guided labs.

**Gap task stubs:**

- [ ] [P0][C:Lab] "Exercise 1: Convert a synchronous endpoint": Provide the baseline synchronous code snippet from Day 34 that the student needs to convert. Add the Expected Output format (the async version of the code).
- [ ] [P1][C:Lab] "Exercise 2: Sequential vs batched concurrency benchmark": Convert the instruction list into a formal business scenario (e.g., "A fintech startup needs to fetch 12 stock prices..."). Provide the expected terminal output format.
- [ ] [P1][C:Lab] "Exercise 3: Rate-limit-aware client": Provide the starter code template demonstrating where to add timeouts, retries, and the backoff mechanism.
- [ ] [P2][M:Coverage] Add brief coverage of `asyncio.gather()` vs `asyncio.create_task()`, explaining when to use which for concurrent execution.

---

## Day 36 — Case Study

**Path:** `content/lessons/Phase_03_Data_Engineering_Web_Development/Day_36_Case_Study/README.md`

**Assessment:** The case study lesson attempts to pull everything together but falls short on execution. It introduces Track A and Track B deliverables but the exercises below them (1, 2, 3) are disconnected bare code blocks that don't clearly build towards these tracks. The code blocks lack business scenarios, explicit problem statements, and HTML templates (for Exercise 3). The Failure Injection exercise, like others before it, lacks concrete starter code.

**Gap task stubs:**

- [ ] [P0][C:Lab] "Exercise 1: Weather Pipeline": Convert the bare code block into a full problem statement. Provide a business scenario (e.g., "A logistics company needs daily weather data..."), explicit steps, and Expected Output.
- [ ] [P0][C:Lab] "Exercise 2: GitHub Stats Pipeline": Add a problem statement, scenario, and Expected Output to the code block.
- [ ] [P0][C:Lab] "Exercise 3: Full Dashboard": Provide the explicit `index.html` template required to make the Flask app runnable. Add a problem statement and Expected Output.
- [ ] [P1][C:Lab] "Exercise 4: Failure Injection": Provide actionable starter code representing the "stale + duplicate batch" scenario so students have a concrete starting point to debug.
- [ ] [P2][F:Tables] Add a table comparing different ETL strategies (Full Load vs Incremental Load) and when to use them, as `if_exists="replace"` is used heavily but is only appropriate for small datasets.

---
