import { promptEvaluationSchema, type PromptEvaluation } from "../contract/prompt-evaluation.js";
import { getErrorMessage } from "../../../shared/lib/error.js";
import { logger } from "../../../platform/electron/logger.js";
import { resolveLanguageModel } from "../../providers/desktop/provider-registry.js";
import type { GenerateTextFn } from "./LLMAdapter.js";

export interface PromptEvaluatorOptions {
  generateText: GenerateTextFn;
}

export interface PromptEvaluatorInput {
  rawInput: string;
  refinedPrompt: string;
  providerId: string;
  model: string;
}

export interface PromptEvaluator {
  evaluate(input: PromptEvaluatorInput): Promise<PromptEvaluation | null>;
}

const evaluationSystemPrompt = [
  "Evaluate the refined prompt for practical usefulness.",
  "Return only valid JSON with this shape:",
  '{"score": number, "summary": string, "suggestions": string[]}',
  "score must be from 0 to 5.",
  "Do not include markdown, prose, or code fences.",
].join("\n");

function buildEvaluationPrompt(input: PromptEvaluatorInput): string {
  return ["Original idea:", input.rawInput, "", "Refined prompt:", input.refinedPrompt].join("\n");
}

function parsePromptEvaluation(text: string): PromptEvaluation {
  return promptEvaluationSchema.parse(JSON.parse(text));
}

export function PromptEvaluator(options: PromptEvaluatorOptions): PromptEvaluator {
  const { generateText } = options;

  return {
    evaluate: async (input: PromptEvaluatorInput): Promise<PromptEvaluation | null> => {
      try {
        const model = resolveLanguageModel(input.providerId, input.model);
        const result = await generateText({
          model,
          system: evaluationSystemPrompt,
          prompt: buildEvaluationPrompt(input),
        });

        return parsePromptEvaluation(result.text);
      } catch (err) {
        const message = getErrorMessage(err, "Prompt evaluation failed.");
        logger.warn("prompt evaluation skipped", message);
        return null;
      }
    },
  };
}
