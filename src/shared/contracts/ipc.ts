import { z } from "zod";
import {
  createCustomPersonaInputSchema,
  customPersonaSchema,
  deleteCustomPersonaInputSchema,
} from "../domain/custom-persona.js";
import { PERSONA_IDS } from "../domain/persona.js";
import { PROVIDER_IDS } from "../domain/provider.js";

const builtinPersonaIdSchema = z.enum(PERSONA_IDS);

export const personaSelectionIdSchema = z.union([builtinPersonaIdSchema, z.string().uuid()]);

export const generatePromptPayloadSchema = z.object({
  rawInput: z.string().trim().min(1),
  personaId: personaSelectionIdSchema,
  providerId: z.enum(PROVIDER_IDS),
  model: z.string().trim().min(1),
});

export const ipcChannels = {
  generatePrompt: "prompt:generate",
  listCustomPersonas: "persona:list-custom",
  createCustomPersona: "persona:create-custom",
  deleteCustomPersona: "persona:delete-custom",
  setApiKeys: "apiKeys:set",
  clearAllApiKeys: "apiKeys:clearAll",
} as const;

export const listCustomPersonasResultSchema = z.object({
  personas: z.array(customPersonaSchema),
});

export const createCustomPersonaResultSchema = customPersonaSchema;

export const deleteCustomPersonaResultSchema = z.object({
  deleted: z.boolean(),
});

export type GeneratePromptPayload = z.infer<typeof generatePromptPayloadSchema>;
export type ListCustomPersonasResult = z.infer<typeof listCustomPersonasResultSchema>;
export type CreateCustomPersonaResult = z.infer<typeof createCustomPersonaResultSchema>;
export type DeleteCustomPersonaResult = z.infer<typeof deleteCustomPersonaResultSchema>;
export type { CreateCustomPersonaInput, DeleteCustomPersonaInput } from "../domain/custom-persona.js";
export { createCustomPersonaInputSchema, deleteCustomPersonaInputSchema };

const generatePromptSuccessIpcSchema = z.object({
  ok: z.literal(true),
  prompt: z.string(),
  tokensUsed: z.number().optional(),
});

const generatePromptFailureIpcSchema = z.object({
  ok: z.literal(false),
  message: z.string(),
});

export const generatePromptIpcResultSchema = z.discriminatedUnion("ok", [
  generatePromptSuccessIpcSchema,
  generatePromptFailureIpcSchema,
]);

export type GeneratePromptIpcResult = z.infer<typeof generatePromptIpcResultSchema>;
