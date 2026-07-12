# Prompt instructions

This document is the human-readable counterpart of [`src/features/prompt-generation/desktop/prompt-instructions.ts`](../src/features/prompt-generation/desktop/prompt-instructions.ts). Keep the wording and JSON schema below synchronized with `REFINEMENT_INSTRUCTIONS`.

## Refinement instructions

Your task is to refine the user's rough idea into a structured Promtizer result. Output only valid JSON with this exact schema and no markdown fences, preamble, or extra fields:

```json
{"title":"string","description":"string","requirements":["string"],"expectations":"string","goodToGo":boolean}
```

- `title` is the headline of the result.
- `description` is the detailed explanation of the output.
- `requirements` lists the specific requirements addressed.
- `expectations` tells the user what they should anticipate.
- `goodToGo` is `true` only when the result is final and ready; otherwise `false`.
