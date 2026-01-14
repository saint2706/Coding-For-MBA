## 2024-05-22 - Semantic Stats

**Learning:** Dashboard statistics (Key-Value pairs) are often implemented as `div` soup. Using `<dl>`, `<dt>`, and `<dd>` provides native semantic association between the label and the value, which is automatically announced by screen readers without extra ARIA glue.
**Action:** Use `<dl>` for any Key-Value data display like user stats, file details, or configuration settings.

## 2024-05-23 - Focus Management on Async Load

**Learning:** When main content loads asynchronously (replacing a loading spinner), screen reader focus often remains lost at the top of the body or on the previous element. Programmatically moving focus to the new container using `tabindex="-1"` and `.focus()` ensures users are immediately aware of the context change.
**Action:** Always implement focus management for significant DOM replacements or route changes in SPAs.
