import { REFINEMENT_INSTRUCTIONS } from "../services/prompt-instructions.js";

/** Input for assembling the refinement system prompt; extend with optional fields as features grow. */
export type BuildRefinementSystemPromptInput = {
  personaContext: string;
};

/**
 * Builds the system string sent to the model for prompt refinement.
 * Sections are composed explicitly so new blocks (tone, locale, etc.) can be added without changing call sites much.
 */
export function buildRefinementSystemPrompt(input: BuildRefinementSystemPromptInput): string {
  const sections: string[] = [REFINEMENT_INSTRUCTIONS, `Persona context:\n${input.personaContext}`];
  return sections.join("\n\n");
}
