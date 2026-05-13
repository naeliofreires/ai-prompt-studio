/**
 * Instruction strings used by LLM-facing code in the main process.
 * Canonical copy for humans: docs/prompt-instructions.md — keep in sync when editing.
 */

/** System instructions for refining a rough user idea into a paste-ready prompt. */
export const REFINEMENT_INSTRUCTIONS =
  "Your task is to refine the user's rough idea into a single, clear, actionable prompt they can paste into an LLM. Output only the refined prompt text, without preamble or explanation.";
