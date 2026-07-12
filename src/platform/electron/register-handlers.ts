import type { GenerateTextFn } from "../../features/prompt-generation/desktop/LLMAdapter.js";
import { registerPromptGenerationHandlers } from "../../features/prompt-generation/desktop/register-prompt-generation-handlers.js";
import { registerPersonaHandlers } from "../../features/personas/desktop/register-persona-handlers.js";
import { registerProviderHandlers } from "../../features/providers/desktop/register-provider-handlers.js";

export interface RegisterHandlersOptions {
  generateText: GenerateTextFn;
}

export function registerIpcHandlers(options: RegisterHandlersOptions): void {
  registerPersonaHandlers();
  registerProviderHandlers();
  registerPromptGenerationHandlers({ generateText: options.generateText });
}
