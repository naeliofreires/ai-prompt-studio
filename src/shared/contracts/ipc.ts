import { z } from "zod";
import { PERSONA_IDS } from "../domain/persona.js";
import { PROVIDER_IDS } from "../domain/provider.js";

export const generatePromptPayloadSchema = z.object({
  rawInput: z.string().trim().min(1),
  personaId: z.enum(PERSONA_IDS),
  providerId: z.enum(PROVIDER_IDS),
  model: z.string().trim().min(1),
});

export const ipcChannels = {
  generatePrompt: "prompt:generate",
} as const;

export type GeneratePromptPayload = z.infer<typeof generatePromptPayloadSchema>;

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
