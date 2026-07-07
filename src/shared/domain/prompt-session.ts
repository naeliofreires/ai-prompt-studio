import { z } from "zod";
import { promptEvaluationSchema } from "./prompt-evaluation.js";
import { PROVIDER_IDS } from "./provider.js";

export const promptSessionUsageSchema = z.object({
  tokensUsed: z.number().int().nonnegative().optional(),
});

export const promptSessionSchema = z.object({
  id: z.string().uuid(),
  rawInput: z.string().trim().min(1),
  personaId: z.string().trim().min(1),
  providerId: z.enum(PROVIDER_IDS),
  model: z.string().trim().min(1),
  generatedPrompt: z.string().trim().min(1),
  usage: promptSessionUsageSchema.optional(),
  evaluation: promptEvaluationSchema.optional(),
  favorite: z.boolean(),
  createdAt: z.string().datetime(),
});

export const savePromptSessionInputSchema = promptSessionSchema.omit({
  id: true,
  favorite: true,
  createdAt: true,
});

export type PromptSessionUsage = z.infer<typeof promptSessionUsageSchema>;
export type PromptSession = z.infer<typeof promptSessionSchema>;
export type SavePromptSessionInput = z.infer<typeof savePromptSessionInputSchema>;
