/**
 * Instruction strings used by LLM-facing code in the main process.
 * Canonical copy for humans: docs/prompt-instructions.md — keep in sync when editing.
 */

/** System instructions for refining a rough user idea into a paste-ready prompt. */
export const REFINEMENT_INSTRUCTIONS = [
  "Your task is to refine the user's rough idea into a structured Promtizer result.",
  "Output only valid JSON with this exact schema and no markdown fences, preamble, or extra fields:",
  '{"title":"string","description":"string","requirements":["string"],"expectations":"string","goodToGo":boolean}',
  "title is the headline of the result.",
  "description is the detailed explanation of the output.",
  "requirements lists the specific requirements addressed.",
  "expectations tells the user what they should anticipate.",
  "goodToGo is true only when the result is final and ready; otherwise false.",
].join(" ");
