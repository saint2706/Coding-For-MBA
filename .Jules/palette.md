## 2024-05-22 - Semantic Stats

**Learning:** Dashboard statistics (Key-Value pairs) are often implemented as `div` soup. Using `<dl>`, `<dt>`, and `<dd>` provides native semantic association between the label and the value, which is automatically announced by screen readers without extra ARIA glue.
**Action:** Use `<dl>` for any Key-Value data display like user stats, file details, or configuration settings.

## 2026-01-18 - Dynamic Greetings vs Static Status
**Learning:** Replacing static status indicators (like "Logged in") with dynamic, personalized greetings adds delight but risks hiding system state. Preserving the original status in `title` and `aria-label` attributes ensures power users and screen readers still access the technical details while keeping the visual interface friendly.
**Action:** When softening technical UI text, always preserve the technical detail in accessible attributes.
