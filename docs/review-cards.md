# Review Card Generation Rules

The review system generates cards client-side from each lesson `README.md` at build/runtime via `contentLoader.ts`.

## Sources

For each lesson, cards are created from:

1. **Frontmatter `concepts`**
   - One card per concept.
   - Prompt asks the learner to explain the concept.
2. **Markdown headings (`##` + `###`)**
   - Every H2/H3 in lesson content creates one card.
   - Prompt asks for the key idea of that section.
3. **Exercises (`### Exercise N:` blocks)**
   - Reuses existing exercise extraction.
   - Prompt asks how to solve the exercise.
   - Answer guide uses `**Goal**` text when available.

## Determinism

- Card IDs are deterministic: `d{day}-{sourceType}-{normalized-text}`.
- Normalization lowercases and slugifies text to keep IDs stable.
- Review state stays in localStorage and is mapped by card ID.

## Scheduling

- Uses a simple SM-2 style scheduler with ratings: Again / Hard / Good / Easy.
- Entirely client-side; no network calls.
