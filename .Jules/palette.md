## 2024-03-24 - Accessibility and Feedback
**Learning:** Transient UI states (like "Copied!" feedback) can create race conditions if users interact rapidly.
**Action:** When implementing temporary success states with `setTimeout`, always clear any existing timeout (`clearTimeout`) before setting a new one to prevent the revert action from triggering prematurely.

## 2024-03-24 - Semantic HTML and ARIA
**Learning:** Using semantic HTML elements like `<header>`, `<main>`, `<footer>`, `<nav>` and appropriate ARIA roles significantly improves accessibility.
**Action:** Ensure all major page sections are wrapped in semantic tags. Add `role="status"` or `aria-live="polite"` to dynamic content areas.

## 2024-03-25 - Progress Bar Visibility
**Learning:** Progress bars with text inside often fail accessibility/visibility checks at low percentages (e.g., 0%) due to clipping by the container or poor contrast against the empty track.
**Action:** Decouple progress text from the bar element. Position it centrally in the container (using absolute positioning and z-index) to ensure consistent visibility and contrast regardless of the bar's width.
