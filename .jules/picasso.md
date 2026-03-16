# Picasso UX/Accessibility Learnings

## Discovery and Prioritization
* **CopyButton**: Identified that static `aria-label`s on buttons with dynamic states ("Copy" -> "Copied") prevent screen readers from announcing state changes.
* **SidebarPhaseGroup**: Identified that putting a static `aria-label` on a button with rich internal `sr-only` content (like "5 of 10 completed") overrides the detailed internal text, reducing accessibility context.
* **AiStudyPanel**: Identified that modal background overlays with `onClick` handlers need `role="presentation"` or `aria-hidden="true"` so screen readers don't misinterpret them as interactive content, while still allowing pointer users to click them to close the modal.
* **Sidebar**: Identified that the mobile sidebar navigation `<aside>` lacked an `id` and the close button lacked an `aria-expanded` and `aria-controls` attribute, hindering screen reader users' understanding of the sidebar state.
* **SearchPalette**: Identified that the search `<input>` lacked an `aria-expanded` attribute to indicate when search results were active and visible.

## Implementations
* **Dynamic ARIA Labels**: Always tie `aria-label` to the component's state if the text intent changes (e.g., `aria-label={copied ? 'Code copied to clipboard' : label}`).
* **Avoid ARIA Overrides**: Do not use `aria-label` when a button already contains detailed visible or `sr-only` text that perfectly describes its function and state. Let the screen reader read the DOM content.
* **Presentation Roles**: Applied `role="presentation"` to `div` elements that act as click-to-close backdrops for modals to satisfy accessibility guidelines without adding redundant keyboard handlers to decorative elements.
* **Accessibility Controls**: Added `aria-expanded` to toggleable UI components (e.g., `Sidebar.tsx` close button, `SearchPalette.tsx` input) and explicitly linked controllers to their regions using `id` and `aria-controls` to improve screen reader navigation.

## Verification
* Verified changes via visual UI tests (Playwright) and unit tests (`npm run test`).
* Ensured no linting or build regressions were introduced.

### Decorative Emojis Accessibility
* **Observation**: Found many places (CopyButton, Sidebar streak, ProgressDashboard stats, Curriculum stats) where emojis were placed next to text strings or inside descriptive wrappers but not explicitly hidden from screen readers.
* **Fix**: Wrapped these emojis in `<span aria-hidden="true">` to prevent screen readers from redundantly calling out "Chart showing upward trend" when the label says "Completed".
* **Rule**: When an emoji is purely decorative and its meaning is already conveyed via text or an `aria-label`, always hide it using `aria-hidden="true"`.
