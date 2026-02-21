## 2025-05-23 - Confirmation for Destructive Actions
**Learning:** Destructive actions like "Reset Code" in a learning environment are high-risk because they can wipe out user progress. Users often click "Reset" expecting a soft reset or just exploring the UI.
**Action:** Implement a two-step confirmation pattern (e.g., "Reset" -> "⚠️ Confirm?") with a timeout auto-revert. This reduces accidental data loss without adding the friction of a full modal dialog. Apply this to all irreversible code/content reset actions.
