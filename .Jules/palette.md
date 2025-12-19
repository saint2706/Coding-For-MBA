# Palette's Journal

## 2025-02-20 - Accessible State Indicators
**Learning:** Visual-only state indicators (like grayed-out badges) are invisible to screen readers. Color alone should not convey meaning.
**Action:** Always add `aria-label` or hidden text to explicitly state the status (e.g., "Locked", "Completed") when using visual styles to denote state.

## 2025-02-20 - Broken Dependency on HttpOnly Cookies
**Learning:** The dashboard frontend attempts to read the `learner_user_id` cookie to fetch progress, but the backend sets this cookie as `HttpOnly`. This causes the dashboard to fail loading (`getUserId()` returns null).
**Action:** Future fix required: Backend should return the `user_id` in the `POST /progress` response body, or provide a `/me` endpoint. As a UX agent, I cannot modify the backend, so the dashboard remains currently non-functional without this fix.
