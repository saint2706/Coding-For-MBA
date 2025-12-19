# Palette's Journal - Critical Learnings

This journal records critical UX/accessibility learnings, surprising user behaviors, and reusable patterns.

## 2024-05-23 - Backend Constraints vs UX
**Learning:** The `learner_backend` sets the `learner_user_id` cookie as `HttpOnly=True`, preventing the frontend from accessing it. This breaks the dashboard initialization which relies on `document.cookie`.
**Action:** Future frontend improvements must handle this limitation, perhaps by requesting a backend change through the appropriate channels, as modifying backend logic directly is forbidden for Palette.
