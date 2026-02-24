## 2025-05-23 - Confirmation for Destructive Actions
**Learning:** Destructive actions like "Reset Code" in a learning environment are high-risk because they can wipe out user progress. Users often click "Reset" expecting a soft reset or just exploring the UI.
**Action:** Implement a two-step confirmation pattern (e.g., "Reset" -> "⚠️ Confirm?") with a timeout auto-revert. This reduces accidental data loss without adding the friction of a full modal dialog. Apply this to all irreversible code/content reset actions.

## 2025-05-23 - Focus Management in Long-Form Content
**Learning:** Single-page applications often break expected browser behavior for in-page navigation (like Table of Contents). Without explicit focus management, clicking a TOC link scrolls the viewport but leaves keyboard focus on the navigation link, forcing users to tab through all intermediate content.
**Action:** When implementing custom scroll-to-anchor behavior (e.g., smooth scrolling), always pair it with `element.focus({ preventScroll: true })` and ensure target elements have `tabIndex="-1"`. This restores the native browser behavior where navigation moves both viewport and focus.

## 2025-05-24 - Accessible Search Results
**Learning:** When implementing a custom search palette or combobox, using semantic `<button>` elements inside a `role="listbox"` can be confusing for screen readers if focus management is handled via `aria-activedescendant`.
**Action:** Use `<div>` elements with `role="option"` and `aria-selected` for result items. Ensure `onClick` handlers are attached to these non-interactive elements to support mouse users, while keyboard navigation is managed by the input element.

## 2025-05-24 - Visual Indicators for Active Items
**Learning:** Relying solely on background color changes for active/hover states in lists can be insufficient for visibility, especially in dark mode or for users with visual impairments.
**Action:** Add a high-contrast indicator, such as a left border (`border-left: 3px solid var(--accent-primary)`), to active items. This provides a clear, structural visual cue that persists regardless of color perception.

## 2025-05-24 - Icon Consistency and Accessibility
**Learning:** Using emojis for UI controls (like theme toggles) can lead to inconsistent rendering across platforms and lack scalability.
**Action:** Replace emoji icons with SVG icons (`<svg aria-hidden="true">`) to ensure consistent visual style. Always include `aria-label` on the button or interactive container, and `.sr-only` text for external links to clarify behavior (e.g., "opens in a new tab").
