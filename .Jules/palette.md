## 2024-03-22 - Accessibility of Collapsible Regions
**Learning:** Collapsible regions (like solution reveals and mastery checks) often lack semantic connection between the toggle button and the content, making it difficult for screen reader users to understand what the button controls.
**Action:** Always link the toggle button to the content panel using `aria-controls="[ID]"` and ensure the content panel has a unique ID. Additionally, marking the panel as `role="region"` with an `aria-label` aids navigation.

## 2024-05-23 - Dynamic Output Accessibility
**Learning:** Dynamic content updates (like code execution results) are often silent for screen reader users unless explicitly marked.
**Action:** Use `aria-live="polite"` on the output container so screen readers announce the result automatically when it appears or changes.

## 2026-02-23 - Actionable Revealed Content
**Learning:** Revealed content, especially code solutions, often leaves the user stranded without an easy way to use that content (e.g., trying it out).
**Action:** Always include action buttons (like "Copy" or "Try It") within the revealed content area to facilitate immediate interaction, ensuring they are accessible and positioned logically.

## 2026-02-24 - Explicit Action Labels
**Learning:** Relying solely on keyboard shortcuts (like "Shift+Enter") as button labels obscures the primary action ("Run") for users who scan visually or don't know the shortcut.
**Action:** Always pair keyboard shortcuts with explicit text labels and icons for primary actions to ensure discoverability and clarity.

## 2026-02-25 - Dynamic State in Disabled Controls
**Learning:** Disabled controls (like a "Run" button during execution) often retain their static `aria-label`, failing to communicate critical state changes (e.g., "Loading" vs "Running") to screen reader users.
**Action:** Dynamically update the `aria-label` of disabled controls to reflect their current status, ensuring users are informed of background processes even when interaction is blocked.
