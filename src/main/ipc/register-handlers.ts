import { ipcMain } from "electron";
import { generateText } from "ai";
import { ZodError } from "zod";
import {
  generatePromptIpcResultSchema,
  generatePromptPayloadSchema,
  ipcChannels,
} from "../../shared/index.js";
import { PERSONAS } from "../../shared/domain/persona.js";
import { LLMAdapter } from "../services/LLMAdapter.js";

const llmAdapter = LLMAdapter({ generateText });

function zodIssuesToMessage(err: ZodError): string {
  return err.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
}

export function registerIpcHandlers(): void {
  ipcMain.handle(ipcChannels.generatePrompt, async (_event, payload) => {
    let parsed;
    try {
      parsed = generatePromptPayloadSchema.parse(payload);
    } catch (err) {
      if (err instanceof ZodError) {
        return generatePromptIpcResultSchema.parse({
          ok: false,
          message: zodIssuesToMessage(err),
        });
      }
      throw err;
    }

    const persona = PERSONAS.find((p) => p.id === parsed.personaId);
    if (!persona) {
      return generatePromptIpcResultSchema.parse({
        ok: false,
        message: "Unknown persona. This should not happen with a valid client.",
      });
    }

    const personaContext = `${persona.label}\n${persona.role}`;

    try {
      const out = await llmAdapter.generatePrompt({
        personaContext,
        rawInput: parsed.rawInput,
        providerId: parsed.providerId,
        model: parsed.model,
      });
      return generatePromptIpcResultSchema.parse({
        ok: true,
        prompt: out.prompt,
        ...(out.tokensUsed !== undefined ? { tokensUsed: out.tokensUsed } : {}),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prompt generation failed.";
      return generatePromptIpcResultSchema.parse({ ok: false, message });
    }
  });
}
