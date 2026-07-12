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

function zodIssuesToMessage(err: ZodError): string {
  return err.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
}

export function registerPromptGenerationHandlers({
  generateText,
}: {
  generateText: GenerateTextFn;
}): void {
  const llmAdapter = LLMAdapter({ generateText });
  const promptEvaluator = PromptEvaluator({ generateText });

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

    const result = await generateRefinedPrompt(parsed, {
      llmAdapter,
      promptEvaluator,
    });
    return generatePromptIpcResultSchema.parse(result);
  });
}
