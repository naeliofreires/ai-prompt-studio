import type { PromptEvaluation } from "../../shared";

export type GenerationUsage = {
  tokensUsed?: number;
};

export type GenerationEvaluation = PromptEvaluation;
