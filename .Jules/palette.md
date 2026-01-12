## 2024-05-22 - Semantic Stats
**Learning:** Dashboard statistics (Key-Value pairs) are often implemented as `div` soup. Using `<dl>`, `<dt>`, and `<dd>` provides native semantic association between the label and the value, which is automatically announced by screen readers without extra ARIA glue.
**Action:** Use `<dl>` for any Key-Value data display like user stats, file details, or configuration settings.
