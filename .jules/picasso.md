# UX and Accessibility Improvements Log

## 2024-03-07: Component ARIA Label Audit
* **Goal**: Improve screen reader navigation by ensuring all icon-only or state-toggling buttons have descriptive, dynamic labels.
* **Changes**:
  * `TableOfContents.tsx`: Added dynamic `aria-label` to the compact mode toggle button depending on `isCompactOpen`.
  * `ExerciseWidget.tsx`: Added `aria-hidden="true"` to the decorative lightbulb emoji in the hint button to prevent screen readers from reading "lightbulb Get Hint", allowing the dynamic text to stand alone.
  * `SidebarPhaseGroup.tsx`: Added explicit `aria-label` to the phase toggle button including the phase number and title.
  * `AiStudyPanel.tsx`: Refactored custom tab buttons to use correct `role="tablist"`, `role="tab"`, `role="tabpanel"`, and `aria-selected` attributes. Hid decorative emojis inside tabs with `aria-hidden="true"`.
* **Impact**: Improved navigation for keyboard and screen reader users, satisfying WCAG guidelines for interactive elements without disrupting visual design.