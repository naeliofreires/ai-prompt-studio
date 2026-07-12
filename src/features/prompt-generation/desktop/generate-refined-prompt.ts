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
  personaId: string;
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
    }
  | {
      ok: false;
      message: string;
    };

export interface PromptEvaluatorInput {
  personaContext: string;
  rawInput: string;
  refinedPrompt: string;
  providerId: ProviderId;
  model: string;
}

export interface PromptEvaluator {
  evaluate(input: PromptEvaluatorInput): Promise<PromptEvaluation | null>;
}

export interface GenerateRefinedPromptDependencies {
  resolvePersonaContext: (personaId: string) => string | null;
  llmAdapter: LlmAdapter;
  promptEvaluator?: PromptEvaluator;
  savePromptSession?: (input: SavePromptSessionInput) => unknown | Promise<unknown>;
}

export async function generateRefinedPrompt(
  input: GenerateRefinedPromptInput,
  dependencies: GenerateRefinedPromptDependencies,
): Promise<GenerateRefinedPromptResult> {
  const personaContext = dependencies.resolvePersonaContext(input.personaId);
  if (!personaContext) {
    logger.warn("generatePrompt unknown persona", input.personaId);
    return {
      ok: false,
      message: "Unknown persona. Create or select a persona before generating.",
    };
  }

  logger.debug("generatePrompt resolved persona", { personaId: input.personaId });

  try {
    const out = await dependencies.llmAdapter.generatePrompt({
      personaContext,
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

    const evaluation = await evaluatePromptIfAvailable(
      input,
      personaContext,
      out.prompt,
      dependencies,
    );
    if (evaluation) {
      result.evaluation = evaluation;
    }

    await savePromptSessionIfAvailable(
      input,
      out.prompt,
      result.evaluation,
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
      personaId: input.personaId,
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
  personaContext: string,
  refinedPrompt: string,
  dependencies: GenerateRefinedPromptDependencies,
): Promise<PromptEvaluation | undefined> {
  if (!dependencies.promptEvaluator) {
    return undefined;
  }

  try {
    const evaluation = await dependencies.promptEvaluator.evaluate({
      personaContext,
      rawInput: input.rawInput,
      refinedPrompt,
      providerId: input.providerId,
      model: input.model,
    });

    return evaluation ?? undefined;
  } catch (err) {
    const message = getErrorMessage(err, "Prompt evaluation failed.");
    logger.warn("prompt evaluation skipped", message);
    return undefined;
  }
}
