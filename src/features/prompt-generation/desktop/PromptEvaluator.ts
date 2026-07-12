import { promptEvaluationSchema, type PromptEvaluation } from "../contract/prompt-evaluation.js";
import type { GenerateTextFn } from "./LLMAdapter.js";
import type { LanguageModelV3 } from "@ai-sdk/provider";

interface PromptEvaluatorOptions {
  generateText: GenerateTextFn;
  languageModel: LanguageModelV3;
}

export interface PromptEvaluatorInput {
  rawInput: string;
  refinedPrompt: string;
}

export interface PromptEvaluator {
  evaluate(input: PromptEvaluatorInput): Promise<PromptEvaluation>;
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
  const { generateText, languageModel } = options;

  return {
    evaluate: async (input: PromptEvaluatorInput): Promise<PromptEvaluation> => {
      const result = await generateText({
        model: languageModel,
        system: evaluationSystemPrompt,
        prompt: buildEvaluationPrompt(input),
      });

      return parsePromptEvaluation(result.text);
    },
  };
}
