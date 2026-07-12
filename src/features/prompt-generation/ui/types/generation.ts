import type { PromptEvaluation } from "../../contract/prompt-evaluation";

export type GenerationUsage = {
  tokensUsed?: number;
};

export type GenerationEvaluation = PromptEvaluation;
