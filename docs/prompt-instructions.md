# Prompt instructions

This file is the **human-editable source** for system prompts and other instruction text used by the main process (e.g. `LLMAdapter`). Runtime code loads strings from [`apps/promptizer/main/services/prompt-instructions.ts`](../apps/promptizer/main/services/prompt-instructions.ts); when you change instruction text here, update that module so behavior stays in sync.

## Conventions

- Use one `##` section per instruction, with a stable **slug-style** heading (e.g. `refinement_prompt`, `summarize_context`).
- Put the **full instruction body** in plain paragraphs under the heading (no code fences unless the model must see literal markdown).
- Prefer short, imperative copy the model can follow as a system message.

---

## refinement_prompt

Your task is to refine the user's rough idea into a single, clear, actionable prompt they can paste into an LLM. Output only the refined prompt text, without preamble or explanation.
