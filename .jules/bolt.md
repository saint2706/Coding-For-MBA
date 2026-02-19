## 2025-05-18 - O(N^2) String Slicing in Markdown Glossary
**Learning:** The glossary tooltip feature used repetitive string slicing (`remaining.slice`) inside a loop to find terms. For large markdown content, this results in O(N^2) behavior due to repeated string copying and searching.
**Action:** Use `regex.exec` with the global `g` flag to iterate matches on the original string, using `lastIndex` to identify non-matching segments. This is O(N) and significantly faster.
