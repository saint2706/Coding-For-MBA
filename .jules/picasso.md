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
\n- Added `aria-label` to phase filter buttons in `ConceptGraphPage.tsx` because they only display 'P1', 'P2' etc. which lacks context for screen reader users. The `aria-label` now explicitly states 'Filter by Phase X: [Phase Name]'.

### Decorative Emojis Accessibility
* **Observation**: Found many places (CopyButton, Sidebar streak, ProgressDashboard stats, Curriculum stats) where emojis were placed next to text strings or inside descriptive wrappers but not explicitly hidden from screen readers.
* **Fix**: Wrapped these emojis in `<span aria-hidden="true">` to prevent screen readers from redundantly calling out "Chart showing upward trend" when the label says "Completed".
* **Rule**: When an emoji is purely decorative and its meaning is already conveyed via text or an `aria-label`, always hide it using `aria-hidden="true"`.

### Sidebar Close Button Accessibility
**Date:** 2024-05-20
**Goal:** Enhance keyboard and screen reader accessibility for the sidebar close button.
**Changes Made:**
- Added `aria-expanded={isOpen}` and `aria-controls="app-sidebar"` to the close button in `src/components/Sidebar.tsx`.
**Learning:** To maintain strict screen reader accessibility for collapsible UI regions (like sidebars or menus), always apply `aria-expanded={isOpen}` and `aria-controls="target-id"` to their respective toggle or close buttons.
Added aria-hidden='true' wrapper to decorative emojis across navigation and heading elements (Sidebar, SidebarPhaseGroup, Exercises) to prevent screen readers from reading them out verbatim.

### Fixed Missing Accessible Wrapping
**Date:** 2024-05-20
**Goal:** Enhance screen reader accessibility for decorative emojis inside CaseStudies, Navbar, and Sidebar.
**Changes Made:**
- Added `<span aria-hidden="true">` to `↗` in `Navbar.tsx`.
- Added `<span aria-hidden="true">` to `🏢` and `🔨` in `CaseStudies.tsx` tab buttons.
**Learning:** Always use `<span aria-hidden="true">` around decorative emojis to prevent screen readers from redundantly reading out their unicode representations (e.g. "building", "hammer") which distracts from the core button text.
Learned that missing aria labels for decorative emojis in React can be fixed by wrapping them with <span aria-hidden='true'></span> and fixing text assertions in React Testing Library using getByRole instead of getByText
