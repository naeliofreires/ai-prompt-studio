import type { LlmAdapter } from "../contract/llm.js";
import type { PromptEvaluation } from "../contract/prompt-evaluation.js";
import type { ProviderId } from "../../providers/contract/provider.js";
import type { SavePromptSessionInput } from "../contract/prompt-session.js";
import { getErrorMessage } from "../../../shared/lib/error.js";
import { logger } from "../../../platform/electron/logger.js";

export interface GenerateRefinedPromptAttachment {
  name: string;
  mimeType: string;
  sizeBytes: number;
  content: string;
}

export interface GenerateRefinedPromptInput {
  rawInput: string;
  providerId: ProviderId;
  model: string;
  attachments?: GenerateRefinedPromptAttachment[];
}

export type GenerateRefinedPromptResult =
  | {
      ok: true;
      prompt: string;
      tokensUsed?: number;
      evaluation?: PromptEvaluation;
      evaluationWarning?: string;
    }
  | {
      ok: false;
      message: string;
    };

export interface PromptEvaluatorInput {
  rawInput: string;
  refinedPrompt: string;
}

export interface PromptEvaluator {
  evaluate(input: PromptEvaluatorInput): Promise<PromptEvaluation>;
}

export interface GenerateRefinedPromptDependencies {
  llmAdapter: LlmAdapter;
  promptEvaluator?: PromptEvaluator;
  savePromptSession?: (input: SavePromptSessionInput) => unknown | Promise<unknown>;
}

export async function generateRefinedPrompt(
  input: GenerateRefinedPromptInput,
  dependencies: GenerateRefinedPromptDependencies,
): Promise<GenerateRefinedPromptResult> {
  try {
    const out = await dependencies.llmAdapter.generatePrompt({
      rawInput: input.rawInput,
      providerId: input.providerId,
      model: input.model,
      attachments: input.attachments,
    });

    const result: GenerateRefinedPromptResult = {
      ok: true,
      prompt: out.prompt,
      ...(out.tokensUsed !== undefined ? { tokensUsed: out.tokensUsed } : {}),
    };

    const evaluationResult = await evaluatePromptIfAvailable(input, out.prompt, dependencies);
    if (evaluationResult.evaluation) {
      result.evaluation = evaluationResult.evaluation;
    }
    if (evaluationResult.warning) {
      result.evaluationWarning = evaluationResult.warning;
    }

    await savePromptSessionIfAvailable(
      input,
      out.prompt,
      evaluationResult.evaluation,
      out.tokensUsed,
      dependencies,
    );

    logger.info("generatePrompt success", {
      tokensUsed: out.tokensUsed,
      hasEvaluation: Boolean(result.evaluation),
    });

    return result;
  } catch (err) {
    const message = getErrorMessage(err, "Prompt generation failed.");
    logger.error("generatePrompt failed", message);
    return { ok: false, message };
  }
}

async function savePromptSessionIfAvailable(
  input: GenerateRefinedPromptInput,
  generatedPrompt: string,
  evaluation: PromptEvaluation | undefined,
  tokensUsed: number | undefined,
  dependencies: GenerateRefinedPromptDependencies,
): Promise<void> {
  if (!dependencies.savePromptSession) {
    return;
  }

  try {
    await dependencies.savePromptSession({
      rawInput: input.rawInput,
      providerId: input.providerId,
      model: input.model,
      generatedPrompt,
      ...(tokensUsed !== undefined ? { usage: { tokensUsed } } : {}),
      ...(evaluation ? { evaluation } : {}),
    });
  } catch (err) {
    const message = getErrorMessage(err, "Prompt session could not be saved.");
    logger.warn("prompt session save skipped", message);
  }
}

async function evaluatePromptIfAvailable(
  input: GenerateRefinedPromptInput,
  refinedPrompt: string,
  dependencies: GenerateRefinedPromptDependencies,
): Promise<{ evaluation?: PromptEvaluation; warning?: string }> {
  if (!dependencies.promptEvaluator) {
    return {};
  }

  try {
    const evaluation = await dependencies.promptEvaluator.evaluate({
      rawInput: input.rawInput,
      refinedPrompt,
    });

    return { evaluation };
  } catch (err) {
    const message = getErrorMessage(err, "Prompt evaluation failed.");
    logger.warn("prompt evaluation skipped", message);
    return { warning: `Prompt refined, but evaluation was unavailable: ${message}` };
  }
}
