## 2024-10-24 - Optimize scroll handler performance
**Learning:** Documenting cache target in refs is an important performance optimization to prevent constant queries during high-frequency events.
**Action:** Always check high frequency events (like scroll/resize) for DOM queries and extract them or cache them appropriately.
