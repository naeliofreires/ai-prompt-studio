import { z } from "zod";
import { PROVIDERS, PROVIDER_IDS, type ProviderId } from "../../providers/contract/provider.js";

export const promptStudioSessionShapeSchema = z
  .object({
    providerId: z.enum(PROVIDER_IDS),
    url: z
      .string()
      .url()
      .refine(
        (value) => {
          try {
            const protocol = new URL(value).protocol;
            return protocol === "http:" || protocol === "https:";
          } catch {
            return false;
          }
        },
        { message: "URL must use http or https." },
      )
      .nullable(),
    model: z.string().min(1),
  })
  .superRefine((session, context) => {
    const provider = PROVIDERS.find((entry) => entry.id === session.providerId);
    if (provider?.defaultBaseUrl && session.url === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["url"],
        message: `${provider.provider} requires a saved URL. Recover the Prompt Studio session to restore its default URL.`,
      });
    }
  });

export const promptStudioSessionSchema = promptStudioSessionShapeSchema.superRefine(
  (session, context) => {
    const provider = PROVIDERS.find((entry) => entry.id === session.providerId);
    if (!provider?.models.includes(session.model)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["model"],
        message: `Model "${session.model}" is not available for ${session.providerId}.`,
      });
    }
  },
);

export interface PromptStudioSession {
  providerId: ProviderId;
  url: string | null;
  model: string;
}

function firstModel(providerId: ProviderId): string {
  const provider = PROVIDERS.find((entry) => entry.id === providerId);
  const model = provider?.models[0];
  if (!provider || !model) {
    throw new Error(`Provider ${providerId} must have at least one model.`);
  }
  return model;
}

export function createPromptStudioSession(
  providerId: ProviderId = PROVIDER_IDS[0],
): PromptStudioSession {
  const provider = PROVIDERS.find((entry) => entry.id === providerId);
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);
  return { providerId, url: provider.defaultBaseUrl ?? null, model: firstModel(providerId) };
}

export function parseStoredPromptStudioSession(value: unknown): PromptStudioSession {
  const parsed = promptStudioSessionShapeSchema.safeParse(value);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "session"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Saved Prompt Studio session is invalid: ${details}`);
  }

  return parsed.data as PromptStudioSession;
}
