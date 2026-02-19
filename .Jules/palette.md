## 2024-05-24 - Semantic Progress Indicators
**Learning:** Visual shorthand like "5/10 · 🧠 2" is concise for sighted users but meaningless for screen readers ("five slash ten bullet brain two").
**Action:** Always wrap visual shorthand in `aria-hidden="true"` and provide a robust `sr-only` description (e.g., "5 of 10 lessons completed, 2 reviews due").
