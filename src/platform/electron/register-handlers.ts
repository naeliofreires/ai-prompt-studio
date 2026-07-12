import type { GenerateTextFn } from "../../features/prompt-generation/desktop/LLMAdapter.js";
import { registerPromptGenerationHandlers } from "../../features/prompt-generation/desktop/register-prompt-generation-handlers.js";
import { registerProviderHandlers } from "../../features/providers/desktop/register-provider-handlers.js";
import { registerPromptStudioSessionHandlers } from "../../features/prompt-studio/desktop/register-session-handlers.js";

export interface RegisterHandlersOptions {
  generateText: GenerateTextFn;
}

export function registerIpcHandlers(options: RegisterHandlersOptions): void {
  registerProviderHandlers();
  registerPromptStudioSessionHandlers();
  registerPromptGenerationHandlers({ generateText: options.generateText });
}
