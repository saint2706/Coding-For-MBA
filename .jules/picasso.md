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
- Added `aria-hidden='true'` to the decorative phase icon in `ExerciseCard.tsx`.
- Added `focus-visible` utility classes to the close button in `KeyboardShortcutsOverlay.tsx` to improve keyboard navigation.
>> Added aria-labels to SidebarPhaseGroup and ExerciseWidget toggle buttons to improve accessibility for screen readers.
\n### ErrorBoundary Accessibility Fix\n**Date:** 2024-05-20\n**Goal:** Improve keyboard accessibility for ErrorBoundary fallback UI.\n**Changes Made:**\n- Added `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2` to the retry and reload buttons in `src/components/ErrorBoundary.tsx`.\n**Learning:** To ensure keyboard accessibility for custom interactive elements (e.g., buttons lacking default focus states), apply standard Tailwind utility classes to maintain visual consistency across the application.
>> 2026-04-07 - Added standard focus-visible styles to interactive button elements across the application to improve keyboard accessibility.
* **ExerciseWidget**: Added an explicit `ariaLabel` to the `CopyButton` to improve context for screen reader users when copying solutions.
- Added focus-visible accessibility classes to all custom interactive elements (buttons) across pages.

## Case Studies Page
- Added aria-controls to link the Case Studies and Projects tabs to the main cs-panel tab panel grid.
- Linked the detailed view Expand/Collapse button to its content motion.div using aria-controls.
- Replaced text-based arrows with aria-hidden spans on the expand button so screen readers don't read "Black up-pointing triangle".

## Review Page
- Wrapped the answer reveal section in an aria-live="polite" region so screen readers announce it when revealed.

### Button Accessibility Enhancements
**Date:** 2026-04-16
**Goal:** Improve accessibility by adding ARIA labels to buttons across multiple components.
**Changes Made:**
- Added specific `aria-label` attributes to buttons in `ErrorBoundary`, `MasteryCheck`, `CaseStudies`, `ProgressDashboard`, `Review`, and `Lesson` components to provide better context for screen readers, especially where button text changes dynamically or relies on visual cues.
**Learning:** When adding ARIA labels, ensure they dynamically reflect the current state of the button if its function or text changes (e.g., 'Hide Answer' vs 'Show Answer'). Avoid redundantly placing ARIA labels if the button already has perfectly descriptive static text, though doing so does not actively harm accessibility.
Added focus-visible outlines to sidebar close, navbar hamburger, and navbar search clear buttons for better keyboard accessibility.

- Added role="presentation" to the sidebar overlay to prevent screen readers from interpreting the click background layer incorrectly.

## Focus-Visible for Map List Toggle
- Added `focus-visible` styles to the `.map-list-toggle-btn` class in `src/styles/home.css`.
- Ensures proper keyboard accessibility and visible focus indication for the toggle segmented control used to switch between lists and map views.

### Dynamic ARIA Labels Enhancements
**Date:** 2024-05-20
**Goal:** Improve accessibility by making dynamic aria-labels reflect state and adding focus-visible.
**Changes Made:**
- Updated `ExerciseWidget` solution toggle button to have a dynamic `aria-label` that reflects its state instead of a static "Toggle solution".
- Added `focus-visible` to `MapListToggle` button for keyboard accessibility.
**Learning:** When adding ARIA labels, ensure they dynamically reflect the current state of the button if its function or text changes (e.g., "Hide Answer" vs "Show Answer").

- Added missing aria-labels to buttons in MapListToggle and MarkdownRenderer
- 🎨 Picasso: Added missing focus-visible classes to buttons in MarkdownRenderer for better keyboard navigation.

### Accessibility Enhancements for Emojis and Focus States
**Date:** 2024-05-20
**Goal:** Ensure decorative emojis are hidden from screen readers and interactive buttons have visible focus states.
**Changes Made:**
- Added `<span aria-hidden="true">` wrappers to decorative emojis in `CodePlayground.tsx`, `RelatedLessons.tsx`, and `ConceptGraphPage.tsx` to prevent redundant screen reader announcements.
- Added `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2` to the `lesson-complete-btn` in `Lesson.tsx`.
**Learning:** Always verify that even minor interactive elements (like the complete button on lessons) have standard keyboard focus styling applied, and continue to aggressively wrap text-adjacent decorative emojis in `aria-hidden`.
