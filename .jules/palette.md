## 2025-05-23 - Confirmation for Destructive Actions
**Learning:** Destructive actions like "Reset Code" in a learning environment are high-risk because they can wipe out user progress. Users often click "Reset" expecting a soft reset or just exploring the UI.
**Action:** Implement a two-step confirmation pattern (e.g., "Reset" -> "⚠️ Confirm?") with a timeout auto-revert. This reduces accidental data loss without adding the friction of a full modal dialog. Apply this to all irreversible code/content reset actions.

## 2025-05-23 - Focus Management in Long-Form Content
**Learning:** Single-page applications often break expected browser behavior for in-page navigation (like Table of Contents). Without explicit focus management, clicking a TOC link scrolls the viewport but leaves keyboard focus on the navigation link, forcing users to tab through all intermediate content.
**Action:** When implementing custom scroll-to-anchor behavior (e.g., smooth scrolling), always pair it with `element.focus({ preventScroll: true })` and ensure target elements have `tabIndex="-1"`. This restores the native browser behavior where navigation moves both viewport and focus.
