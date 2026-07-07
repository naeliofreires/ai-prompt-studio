import type { LanguageModelV3 } from "@ai-sdk/provider";
import type {
  GeneratePromptInput,
  GeneratePromptOutput,
  LlmAdapter,
} from "../../shared/contracts/llm.js";
import { logger } from "../../shared/utils/logger.js";
import { buildRefinementSystemPrompt } from "../utils/build-refinement-system-prompt.js";
import { resolveLanguageModel } from "./provider-registry.js";

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

function buildPrompt(input: GeneratePromptInput): string {
  if (!input.attachments?.length) {
    return input.rawInput;
  }

  const attachmentsContext = input.attachments
    .map((attachment, index) =>
      [
        `[Attachment ${index + 1}: ${attachment.name}]`,
        `MIME type: ${attachment.mimeType}`,
        `Size bytes: ${attachment.sizeBytes}`,
        "Content:",
        attachment.content,
      ].join("\n"),
    )
    .join("\n\n");

  return `${input.rawInput}\n\nAttachments:\n${attachmentsContext}`;
}

export function LLMAdapter(options: LLMAdapterOptions): LlmAdapter {
  const { generateText } = options;

  return {
    generatePrompt: async (input: GeneratePromptInput): Promise<GeneratePromptOutput> => {
      const personaContext = input.personaContext;
      const prompt = buildPrompt(input);

      const system = buildRefinementSystemPrompt({ personaContext });
      const model = resolveLanguageModel(input.providerId, input.model);

      logger.info("generatePrompt provider request", {
        providerId: input.providerId,
        model: input.model,
        attachmentCount: input.attachments?.length ?? 0,
      });
      const result = await generateText({ model, system, prompt });

      const tokensUsed = result.usage.totalTokens;

      return {
        prompt: result.text,
        ...(tokensUsed !== undefined ? { tokensUsed } : {}),
      };
    },
  };
}
