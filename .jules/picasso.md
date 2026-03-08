# Picasso UX/Accessibility Learnings

## Discovery and Prioritization
* **CopyButton**: Identified that static `aria-label`s on buttons with dynamic states ("Copy" -> "Copied") prevent screen readers from announcing state changes.
* **SidebarPhaseGroup**: Identified that putting a static `aria-label` on a button with rich internal `sr-only` content (like "5 of 10 completed") overrides the detailed internal text, reducing accessibility context.
* **AiStudyPanel**: Identified that modal background overlays with `onClick` handlers need `role="presentation"` or `aria-hidden="true"` so screen readers don't misinterpret them as interactive content, while still allowing pointer users to click them to close the modal.

## Implementations
* **Dynamic ARIA Labels**: Always tie `aria-label` to the component's state if the text intent changes (e.g., `aria-label={copied ? 'Code copied to clipboard' : label}`).
* **Avoid ARIA Overrides**: Do not use `aria-label` when a button already contains detailed visible or `sr-only` text that perfectly describes its function and state. Let the screen reader read the DOM content.
* **Presentation Roles**: Applied `role="presentation"` to `div` elements that act as click-to-close backdrops for modals to satisfy accessibility guidelines without adding redundant keyboard handlers to decorative elements.

## Verification
* Verified changes via visual UI tests (Playwright) and unit tests (`npm run test`).
* Ensured no linting or build regressions were introduced.
