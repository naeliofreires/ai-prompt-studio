import { z } from "zod";
import { PROVIDER_IDS } from "../../providers/contract/provider.js";
import { promptEvaluationSchema } from "./prompt-evaluation.js";

const generatePromptTextAttachmentSchema = z
  .object({
    name: z.string(),
    mimeType: z.union([z.literal("text/plain"), z.literal("text/markdown"), z.literal("")]),
    sizeBytes: z.number(),
    content: z.string(),
  })
  .refine(
    (attachment) =>
      !["text/markdown", ""].includes(attachment.mimeType) || attachment.name.endsWith(".md"),
    { message: "Markdown prompt attachments must use a .md filename", path: ["name"] },
  );

const maxPromptAttachmentTotalSizeBytes = 1024 * 1024;

export const generatePromptPayloadSchema = z
  .object({
    rawInput: z.string().trim().min(1),
    providerId: z.enum(PROVIDER_IDS),
    model: z.string().trim().min(1),
    attachments: z.array(generatePromptTextAttachmentSchema).max(5).optional(),
  })
  .refine(
    ({ attachments }) =>
      !attachments ||
      attachments.reduce(
        (totalSizeBytes, attachment) => totalSizeBytes + attachment.sizeBytes,
        0,
      ) <= maxPromptAttachmentTotalSizeBytes,
    { message: "Prompt attachments exceed the total size limit", path: ["attachments"] },
  );

export const promptGenerationIpcChannels = { generatePrompt: "prompt:generate" } as const;

export type GeneratePromptPayload = z.infer<typeof generatePromptPayloadSchema>;
export type GeneratePromptAttachment = NonNullable<GeneratePromptPayload["attachments"]>[number];

export const generatePromptIpcResultSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    prompt: z.string(),
    tokensUsed: z.number().optional(),
    evaluation: promptEvaluationSchema.optional(),
  }),
  z.object({ ok: z.literal(false), message: z.string() }),
]);

export type GeneratePromptIpcResult = z.infer<typeof generatePromptIpcResultSchema>;
