import { app, ipcMain } from "electron";
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
  listConfiguredApiKeysResultSchema,
  listCustomPersonasResultSchema,
} from "../../shared/index.js";
import { logger } from "../../shared/utils/logger.js";
import { LLMAdapter } from "../services/LLMAdapter.js";
import { PromptEvaluator } from "../services/PromptEvaluator.js";
import {
  clearAllApiKeys,
  listConfiguredApiKeyProviders,
  setApiKeys,
} from "../services/api-key-manager.js";
import {
  createCustomPersona,
  deleteCustomPersona,
  listCustomPersonas,
} from "../store/custom-personas-store.js";
import { savePromptSession } from "../store/prompt-sessions-store.js";
import { generateRefinedPrompt } from "../application/generate-refined-prompt.js";
import { resolvePersonaContext } from "../utils/resolve-persona-context.js";

const llmAdapter = LLMAdapter({ generateText });
const promptEvaluator = PromptEvaluator({ generateText });

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
    logger.info("createCustomPersona", { hasLabel: Boolean(payload?.label) });
    const parsed = createCustomPersonaInputSchema.parse(payload);
    return createCustomPersonaResultSchema.parse(createCustomPersona(parsed));
  });

  ipcMain.handle(ipcChannels.deleteCustomPersona, (_event, payload) => {
    logger.info("deleteCustomPersona", { id: payload?.id });
    const parsed = deleteCustomPersonaInputSchema.parse(payload);
    return deleteCustomPersonaResultSchema.parse({
      deleted: deleteCustomPersona(parsed.id),
    });
  });

  ipcMain.handle(ipcChannels.listConfiguredApiKeys, () => {
    const providerIds = listConfiguredApiKeyProviders({
      includeEnvironment: !app.isPackaged,
    });
    logger.debug("listConfiguredApiKeys", { providerIds });
    return listConfiguredApiKeysResultSchema.parse({ providerIds });
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
    logger.info("generatePrompt received", {
      personaId: payload.personaId,
      providerId: payload.providerId,
    });

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

    const result = await generateRefinedPrompt(parsed, {
      resolvePersonaContext,
      llmAdapter,
      promptEvaluator,
      savePromptSession,
    });

    return generatePromptIpcResultSchema.parse(result);
  });
}
