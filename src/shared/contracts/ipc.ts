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

const generatePromptTextAttachmentSchema = z.object({
  name: z.string(),
  mimeType: z.union([z.literal("text/plain"), z.literal("text/markdown"), z.literal("")]),
  sizeBytes: z.number(),
  content: z.string(),
}).refine(
  (attachment) =>
    !["text/markdown", ""].includes(attachment.mimeType) || attachment.name.endsWith(".md"),
  {
    message: "Markdown prompt attachments must use a .md filename",
    path: ["name"],
  },
);

const maxPromptAttachmentTotalSizeBytes = 1024 * 1024;

export const generatePromptPayloadSchema = z
  .object({
    rawInput: z.string().trim().min(1),
    personaId: personaSelectionIdSchema,
    providerId: z.enum(PROVIDER_IDS),
    model: z.string().trim().min(1),
    attachments: z.array(generatePromptTextAttachmentSchema).max(5).optional(),
  })
  .refine(
    ({ attachments }) =>
      !attachments ||
      attachments.reduce((totalSizeBytes, attachment) => totalSizeBytes + attachment.sizeBytes, 0) <=
        maxPromptAttachmentTotalSizeBytes,
    {
      message: "Prompt attachments exceed the total size limit",
      path: ["attachments"],
    },
  );

export const ipcChannels = {
  generatePrompt: "prompt:generate",
  listCustomPersonas: "persona:list-custom",
  createCustomPersona: "persona:create-custom",
  deleteCustomPersona: "persona:delete-custom",
  listConfiguredApiKeys: "apiKeys:listConfigured",
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

export const listConfiguredApiKeysResultSchema = z.object({
  providerIds: z.array(z.enum(PROVIDER_IDS)),
});

export type GeneratePromptPayload = z.infer<typeof generatePromptPayloadSchema>;
export type ListCustomPersonasResult = z.infer<typeof listCustomPersonasResultSchema>;
export type CreateCustomPersonaResult = z.infer<typeof createCustomPersonaResultSchema>;
export type DeleteCustomPersonaResult = z.infer<typeof deleteCustomPersonaResultSchema>;
export type ListConfiguredApiKeysResult = z.infer<typeof listConfiguredApiKeysResultSchema>;
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
