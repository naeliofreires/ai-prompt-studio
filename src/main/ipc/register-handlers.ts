import { ipcMain } from "electron";
import { generateText } from "ai";
import { ZodError } from "zod";
import {
  createCustomPersonaInputSchema,
  createCustomPersonaResultSchema,
  deleteCustomPersonaInputSchema,
  deleteCustomPersonaResultSchema,
  generatePromptIpcResultSchema,
  generatePromptPayloadSchema,
  ipcChannels,
  listCustomPersonasResultSchema,
} from "../../shared/index.js";
import { logger } from "../../shared/utils/logger.js";
import { LLMAdapter } from "../services/LLMAdapter.js";
import { setApiKeys, clearAllApiKeys } from "../services/api-key-manager.js";
import {
  createCustomPersona,
  deleteCustomPersona,
  listCustomPersonas,
} from "../store/custom-personas-store.js";
import { resolvePersonaContext } from "../utils/resolve-persona-context.js";

const llmAdapter = LLMAdapter({ generateText });

function zodIssuesToMessage(err: ZodError): string {
  return err.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
}

export function registerIpcHandlers(): void {
  ipcMain.handle(ipcChannels.listCustomPersonas, () => {
    logger.debug("listCustomPersonas");
    return listCustomPersonasResultSchema.parse({
      personas: listCustomPersonas(),
    });
  });

  ipcMain.handle(ipcChannels.createCustomPersona, (_event, payload) => {
    logger.info("createCustomPersona", payload);
    const parsed = createCustomPersonaInputSchema.parse(payload);
    return createCustomPersonaResultSchema.parse(createCustomPersona(parsed));
  });

  ipcMain.handle(ipcChannels.deleteCustomPersona, (_event, payload) => {
    logger.info("deleteCustomPersona", payload);
    const parsed = deleteCustomPersonaInputSchema.parse(payload);
    return deleteCustomPersonaResultSchema.parse({
      deleted: deleteCustomPersona(parsed.id),
    });
  });

  ipcMain.handle(ipcChannels.setApiKeys, (_event, keys: Record<string, string>) => {
    logger.debug("setApiKeys", { providers: Object.keys(keys) });
    setApiKeys(keys);
  });

  ipcMain.handle(ipcChannels.clearAllApiKeys, () => {
    logger.debug("clearAllApiKeys");
    clearAllApiKeys();
  });

  ipcMain.handle(ipcChannels.generatePrompt, async (_event, payload) => {
    logger.info("generatePrompt received", { personaId: payload.personaId, providerId: payload.providerId });

    let parsed;
    try {
      parsed = generatePromptPayloadSchema.parse(payload);
    } catch (err) {
      logger.warn("generatePrompt validation failed", err);
      if (err instanceof ZodError) {
        return generatePromptIpcResultSchema.parse({
          ok: false,
          message: zodIssuesToMessage(err),
        });
      }
      throw err;
    }

    const personaContext = resolvePersonaContext(parsed.personaId);
    if (!personaContext) {
      logger.warn("generatePrompt unknown persona", parsed.personaId);
      return generatePromptIpcResultSchema.parse({
        ok: false,
        message: "Unknown persona. Select a built-in persona or create a custom one.",
      });
    }

    logger.debug("generatePrompt resolved persona", { personaContext: personaContext.slice(0, 100) });

    try {
      const out = await llmAdapter.generatePrompt({
        personaContext,
        rawInput: parsed.rawInput,
        providerId: parsed.providerId,
        model: parsed.model,
      });
      logger.info("generatePrompt success", { tokensUsed: out.tokensUsed });
      return generatePromptIpcResultSchema.parse({
        ok: true,
        prompt: out.prompt,
        ...(out.tokensUsed !== undefined ? { tokensUsed: out.tokensUsed } : {}),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prompt generation failed.";
      logger.error("generatePrompt failed", message);
      return generatePromptIpcResultSchema.parse({ ok: false, message });
    }
  });
}
