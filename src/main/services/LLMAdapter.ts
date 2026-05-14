import type { LanguageModelV3 } from "@ai-sdk/provider";
import type {
  GeneratePromptInput,
  GeneratePromptOutput,
  LlmAdapter,
} from "../../shared/contracts/llm.js";
import { logger } from "../../shared/utils/logger.js";
import { buildRefinementSystemPrompt } from "../utils/build-refinement-system-prompt.js";
import { resolveLanguageModel } from "../utils/resolve-language-model.js";

type GenerateTextFnResponse = Promise<{
  text: string;
  usage: {
    totalTokens?: number;
  };
}>;

export type GenerateTextFn = (args: {
  model: LanguageModelV3;
  system: string;
  prompt: string;
}) => GenerateTextFnResponse;

export interface LLMAdapterOptions {
  generateText: GenerateTextFn;
}

export function LLMAdapter(options: LLMAdapterOptions): LlmAdapter {
  const { generateText } = options;

  return {
    generatePrompt: async (input: GeneratePromptInput): Promise<GeneratePromptOutput> => {
      const personaContext = input.personaContext;

      const system = buildRefinementSystemPrompt({ personaContext });
      const model = resolveLanguageModel(input.providerId, input.model);

      logger.info("generatePrompt input", {
        personaContext,
        model,
        rawInput: input.rawInput,
      });
      logger.debug("system prompt", system);
      const result = await generateText({ model, system, prompt: input.rawInput });

      const tokensUsed = result.usage.totalTokens;

      return {
        prompt: result.text,
        ...(tokensUsed !== undefined ? { tokensUsed } : {}),
      };
    },
  };
}
