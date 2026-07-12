import { ipcMain } from "electron";
import { ZodError } from "zod";
import {
  generatePromptIpcResultSchema,
  generatePromptPayloadSchema,
  promptGenerationIpcChannels,
} from "../contract/ipc.js";
import { logger } from "../../../platform/electron/logger.js";
import { generateRefinedPrompt } from "./generate-refined-prompt.js";
import { LLMAdapter, type GenerateTextFn } from "./LLMAdapter.js";
import { PromptEvaluator } from "./PromptEvaluator.js";
import { resolvePromptStudioExecution } from "../../providers/desktop/provider-registry.js";
import { getPromptStudioSession } from "../../prompt-studio/desktop/session-store.js";

function zodIssuesToMessage(err: ZodError): string {
  return err.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
}

export function registerPromptGenerationHandlers({
  generateText,
}: {
  generateText: GenerateTextFn;
}): void {
  ipcMain.handle(promptGenerationIpcChannels.generatePrompt, async (_event, payload) => {
    logger.info("generatePrompt received", {
      providerId: payload.providerId,
    });
    let parsed;
    try {
      parsed = generatePromptPayloadSchema.parse(payload);
    } catch (err) {
      logger.warn("generatePrompt validation failed", err);
      if (err instanceof ZodError) {
        return generatePromptIpcResultSchema.parse({ ok: false, message: zodIssuesToMessage(err) });
      }
      throw err;
    }

    let execution;
    try {
      execution = resolvePromptStudioExecution(getPromptStudioSession());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not resolve the saved Prompt Studio session.";
      logger.warn("generatePrompt session validation failed", message);
      return generatePromptIpcResultSchema.parse({ ok: false, message });
    }

    const result = await generateRefinedPrompt(
      { ...parsed, providerId: execution.providerId, model: execution.model },
      {
        llmAdapter: LLMAdapter({
          generateText,
          languageModel: execution.languageModel,
          providerId: execution.providerId,
          model: execution.model,
        }),
        promptEvaluator: PromptEvaluator({ generateText, languageModel: execution.languageModel }),
      },
    );
    return generatePromptIpcResultSchema.parse(result);
  });
}
