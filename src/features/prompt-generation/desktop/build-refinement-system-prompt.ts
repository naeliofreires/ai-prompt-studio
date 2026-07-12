import { REFINEMENT_INSTRUCTIONS } from "./prompt-instructions.js";

export const GENERIC_REFINEMENT_CONTEXT = REFINEMENT_INSTRUCTIONS;

/**
 * Builds the system string sent to the model for prompt refinement.
 */
export function buildRefinementSystemPrompt(): string {
  return GENERIC_REFINEMENT_CONTEXT;
}
