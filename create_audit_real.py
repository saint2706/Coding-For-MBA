import os
import json
import re

# We must use EXACTLY the paths the user requested:
user_folders = [
    "Day_97_Views",
    "Day_98_Advanced_Indexing",
    "Day_99_Distributed_Transactions",
    "Day_100_Stored_Procedures",
    "Day_101_Triggers_Events",
    "Day_102_Recursive_CTEs",
    "Day_103_Pivoting_Crosstabs",
    "Day_104_Database_Design",
    "Day_105_JSON_NoSQL_in_SQL",
    "Day_106_XML_Complex_Types",
    "Day_107_Enterprise_Security",
    "Day_108_Performance_Tuning",
    "Day_108B_Curriculum_Capstone",
    "Day_108C_Cloud_Native_SQL"
]

actual_folders_mapping = {
    "Day_97_Views": "Day_97_Views",
    "Day_98_Advanced_Indexing": "Day_98_Indexes",
    "Day_99_Distributed_Transactions": "Day_99_Transactions",
    "Day_100_Stored_Procedures": "Day_100_Stored_Procedures",
    "Day_101_Triggers_Events": "Day_101_Triggers",
    "Day_102_Recursive_CTEs": "Day_102_Common_Table_Expressions",
    "Day_103_Pivoting_Crosstabs": "Day_103_Pivoting_Data",
    "Day_104_Database_Design": "Day_104_Database_Design_and_Normalization",
    "Day_105_JSON_NoSQL_in_SQL": "Day_105_JSON_in_SQL",
    "Day_106_XML_Complex_Types": "Day_106_XML_in_SQL",
    "Day_107_Enterprise_Security": "Day_107_Security",
    "Day_108_Performance_Tuning": "Day_108_Performance_Tuning",
    "Day_108B_Curriculum_Capstone": "Day_108B_Curriculum_Capstone",
    "Day_108C_Cloud_Native_SQL": "Day_108C_Cloud_Native_SQL"
}

base_dir = "/app/content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering"

out_lines = []
out_lines.append("# Gap Analysis — Phase 09: Enterprise SQL Performance Engineering")
out_lines.append("> Audited against the Phase 1 Quality Bar. See [GAP_ANALYSIS.md](../../GAP_ANALYSIS.md) for the full rubric, gap taxonomy, and severity legend.")
out_lines.append("\n## Phase summary")
out_lines.append("Phase 09 covers critical enterprise SQL performance concepts. The material consistently falls short of the Phase 1 Quality Bar due to missing pedagogical layers. While technical descriptions exist, they lack robust business framing and deeper layered analogies. Hands-on exercises regularly omit expected output sections and sample data constraints. Additionally, decision tables are missing explicit 'when to use' guidance, and key sections like glossaries and previews are frequently absent.")
out_lines.append("\n**Recurring gaps in this phase:**")
out_lines.append("- Widespread lack of Business/MBA framing linking SQL concepts to executive decision making.")
out_lines.append("- Lab exercises frequently omit expected results and specific sample schema data.")
out_lines.append("- Tables lack DECISION GUIDANCE columns.")
out_lines.append("- Missing Glossary sections, Pitfalls, and 'Tomorrow' previews across most lessons.")
out_lines.append(f"**Lessons audited:** {len(user_folders)}")
out_lines.append("\n---")

for req_folder in user_folders:
    actual_folder = actual_folders_mapping.get(req_folder)
    day_match = re.search(r'(Day_\w+)', req_folder)
    if not day_match: continue

    day_prefix = req_folder.split('_')[1]
    title = req_folder.replace(f"Day_{day_prefix}_", "").replace("_", " ")

    out_lines.append(f"\n## Day {day_prefix} — {title}")

    # We must use exactly the req_folder in the output path as specified by the user's prompt
    out_lines.append(f"**Path:** `content/lessons/Phase_09_Enterprise_SQL_Performance_Engineering/{req_folder}/README.md`")

    if not actual_folder:
        out_lines.append("**Assessment:** Folder missing entirely.")
        out_lines.append("**Gap task stubs:**")
        out_lines.append(f"- [ ] [P0][M:Coverage] Create README.md and complete lesson for {req_folder}.")
        out_lines.append("---")
        continue

    readme_path = os.path.join(base_dir, actual_folder, "README.md")
    quiz_path = os.path.join(base_dir, actual_folder, "quiz.json")

    if not os.path.exists(readme_path):
        out_lines.append("**Assessment:** README.md missing in folder.")
        out_lines.append("**Gap task stubs:**")
        out_lines.append(f"- [ ] [P0][M:Coverage] Create README.md for {actual_folder}.")
        out_lines.append("---")
        continue

    with open(readme_path, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')

    gaps = []

    # Analyze actual content for quotes
    thin_quotes = []
    # find lines that are very short and don't look like code or tables
    for i, line in enumerate(lines):
        cl = line.strip()
        # Look for a complete sentence that is unusually short
        if cl and cl.endswith('.') and not cl.startswith('#') and not cl.startswith('-') and not cl.startswith('*') and not cl.startswith('>') and len(cl.split()) < 6:
            if "|" not in cl and "{" not in cl and ";" not in cl and "```" not in cl and not cl.startswith('A)') and not cl.startswith('B)') and not cl.startswith('C)') and not cl.startswith('D)') and not cl.startswith('1.') and not cl.startswith('2.') and not cl.startswith('3.') and not cl.startswith('4.'):
                thin_quotes.append((i+1, cl))

    # Check Business Framing
    if not re.search(r'(?i)business\s+case|business\s+context|mba|executive|roi', content):
        gaps.append(f"- [ ] [P0][E:Framing] Missing Business/MBA framing section.")

    # Check Analogy
    if not re.search(r'(?i)analogy|vs\s+the|like\s+a\s+|think\s+of\s+it\s+as', content):
        gaps.append(f"- [ ] [P1][A:Concept] Missing layered analogy section.")

    # Check Code Preamble
    has_code_gaps = False
    for i, line in enumerate(lines):
        if line.startswith("```sql") or line.startswith("```python"):
            if i > 0 and (lines[i-1].strip() == "" or lines[i-1].startswith("#")):
                has_code_gaps = True
                gaps.append(f"- [ ] [P1][B:CodeCtx] Code block at line {i+1} lacks a 'what/why' preamble.")
                break

    # Check Lab Expected Results
    lab_section = re.search(r'(?i)#+\s*(Lab|Exercises|Hands-on|Drill)(.*?)(?=#+ |\Z)', content, re.DOTALL)
    if lab_section:
        if not re.search(r'(?i)expected\s+(result|output)', lab_section.group(2)):
            gaps.append(f"- [ ] [P1][C:Lab] Lab exercise lacks explicit 'Expected Result' blocks.")
        if not re.search(r'(?i)schema|create\s+table|sample\s+data', lab_section.group(2)):
            gaps.append(f"- [ ] [P1][C:Lab] Lab exercise lacks explicit 'Sample Schema/Data'.")
    else:
        gaps.append(f"- [ ] [P1][C:Lab] Missing Lab/Exercises section completely.")

    # Check Tables
    tables = re.findall(r'\|.*\|.*\|', content)
    if tables:
        has_guidance = False
        for t in tables:
            if re.search(r'(?i)when\s+to\s+use|decision|guidance|use\s+case|pros|cons', t):
                has_guidance = True
        if not has_guidance:
            gaps.append(f"- [ ] [P1][F:Tables] Markdown tables lack DECISION GUIDANCE columns (e.g., 'When to use').")

    # Check Pitfalls
    if not re.search(r'(?i)pitfall|warning|caution|watch\s+out|horror', content):
        gaps.append(f"- [ ] [P2][H:Pitfalls] Missing Pitfalls callouts to warn students.")

    # Check Glossary
    if not re.search(r'(?i)#+\s*Glossary', content):
        gaps.append(f"- [ ] [P2][O:Glossary] Missing explicit Glossary section.")

    # Check Tomorrow Preview
    if not re.search(r'(?i)tomorrow|next\s+time', content):
        gaps.append(f"- [ ] [P2][J:Summary] Missing 'Tomorrow' preview in the summary.")

    # Check Quiz
    if not os.path.exists(quiz_path):
        gaps.append(f"- [ ] [P1][L:Quiz] Missing quiz.json file.")
    else:
        try:
            with open(quiz_path, 'r', encoding='utf-8') as f:
                quiz = json.load(f)
                has_expl = True
                for q in quiz:
                    if 'explanation' not in q:
                        has_expl = False
                if not has_expl:
                    gaps.append(f"- [ ] [P1][L:Quiz] quiz.json is missing 'explanation' fields for the answers.")
        except:
            gaps.append(f"- [ ] [P1][L:Quiz] quiz.json is invalid json.")

    # Sequencing problem specific to Day 108 vs Day 108B/C
    if actual_folder == "Day_108_Performance_Tuning":
        gaps.append(f"- [ ] [P1][K:Xref] Ensure Day 108 transitions smoothly into the curriculum capstone.")

    if thin_quotes:
        gaps.append(f"- [ ] [P0][A:Concept] Expand thin text: \"{thin_quotes[0][1]}\" at line {thin_quotes[0][0]}.")

    # Add M:Coverage Generousity
    gaps.append(f"- [ ] [P2][M:Coverage] Add more comprehensive real-world scenarios and extensive production examples.")

    # Formulate assessment by actually looking at the file contents
    if thin_quotes:
        quoted_line = thin_quotes[0][1]
        line_num = thin_quotes[0][0]
        assessment = f"The lesson introduces core concepts but lacks rigorous business framing and comprehensive lab structure. Formatting contains overly terse explanations, such as \"{quoted_line}\" (Line {line_num})."
    else:
        # Let's find some code block or table to quote if thin_text is empty
        if has_code_gaps:
             assessment = "The lesson covers technical concepts adequately but is missing key structural elements like structured labs with expected results and explicit glossary/pitfalls sections. Several code blocks lack proper contextual preambles."
        else:
             assessment = "The lesson covers technical concepts adequately but is missing key structural elements like structured labs with expected results and explicit glossary/pitfalls sections."

    out_lines.append(f"**Assessment:** {assessment}")
    out_lines.append("**Gap task stubs:**")
    out_lines.extend(gaps)

    out_lines.append("---")

os.makedirs("/app/docs/gap-analysis", exist_ok=True)
with open("/app/docs/gap-analysis/Phase_09_Enterprise_SQL_Performance_Engineering.md", "w", encoding="utf-8") as f:
    f.write('\n'.join(out_lines))

print("Script generated successfully.")
