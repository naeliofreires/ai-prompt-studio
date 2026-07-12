import type { LanguageModelV3 } from "@ai-sdk/provider";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { PROVIDERS, type ProviderId } from "../contract/provider.js";
import type { PromptStudioSession } from "../../prompt-studio/contract/session.js";
import { getApiKey } from "./api-key-manager.js";

interface PromptStudioExecution {
  readonly providerId: ProviderId;
  readonly model: string;
  readonly url: string | null;
  readonly languageModel: LanguageModelV3;
}

export function resolvePromptStudioExecution(session: PromptStudioSession): PromptStudioExecution {
  const provider = PROVIDERS.find((p) => p.id === session.providerId);
  if (!provider) {
    throw new Error(`Unknown provider: ${session.providerId}`);
  }
  if (!provider.models.includes(session.model)) {
    throw new Error(`Model "${session.model}" is not available for ${provider.provider}.`);
  }
  if (provider.defaultBaseUrl && !session.url) {
    throw new Error(
      `${provider.provider} requires a saved URL. Recover the Prompt Studio session to restore its default URL.`,
    );
  }

  const apiKey = getApiKey(session.providerId);
  if (!apiKey) {
    const envKeys = provider.envKeys ?? [];
    const envKeyHint = envKeys.length > 0 ? envKeys[0] : "API key";
    throw new Error(
      `Missing ${envKeyHint}. Add your API key in Settings or set the environment variable.`,
    );
  }

  const baseUrl = session.url ?? undefined;

  let languageModel: LanguageModelV3;

  switch (provider.sdkType) {
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey, baseURL: baseUrl });
      const m = google.chat(session.model);
      if (!m) throw new Error(`Unsupported ${provider.provider} model: ${session.model}`);
      languageModel = m;
      break;
    }
    case "openai": {
      const client = createOpenAI({
        baseURL: baseUrl,
        apiKey,
        name: session.providerId,
      });
      const m = client.chat(session.model);
      if (!m) throw new Error(`Unsupported ${provider.provider} model: ${session.model}`);
      languageModel = m;
      break;
    }
    case "openai-compatible": {
      const client = createOpenAICompatible({
        baseURL: baseUrl!,
        apiKey,
        name: session.providerId,
      });
      const m = client.chatModel(session.model);
      if (!m) throw new Error(`Unsupported ${provider.provider} model: ${session.model}`);
      languageModel = m;
      break;
    }
    default:
      throw new Error(
        `Unhandled SDK type for provider: ${provider.provider} (sdkType: ${provider.sdkType ?? "undefined"})`,
      );
  }

  return Object.freeze({
    providerId: session.providerId,
    model: session.model,
    url: session.url,
    languageModel,
  });
}
