# Picasso UX Learnings

- **Important Correction on Overlays**: Making a modal background overlay a focusable button (e.g., adding `role="button"`, `tabIndex={0}`, and `onKeyDown`) is an accessibility anti-pattern. If the overlay wraps the modal's contents, keyboard events inside the modal will bubble up and incorrectly close the modal. Focus should be trapped inside the modal, and the `Escape` key should be used globally to close it. Overlays should generally remain `role="presentation"` or `aria-hidden="true"`.
- Always add `aria-pressed` or similar state attributes to state-toggling `<button>` elements (e.g. Try Solution, Reset Code).
- Add descriptive `aria-label` attributes to icon-only buttons (like `Get Hint`).
