## 2024-03-22 - Accessibility of Collapsible Regions
**Learning:** Collapsible regions (like solution reveals and mastery checks) often lack semantic connection between the toggle button and the content, making it difficult for screen reader users to understand what the button controls.
**Action:** Always link the toggle button to the content panel using `aria-controls="[ID]"` and ensure the content panel has a unique ID. Additionally, marking the panel as `role="region"` with an `aria-label` aids navigation.
