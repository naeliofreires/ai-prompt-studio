import type { LanguageModelV3 } from "@ai-sdk/provider";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { PROVIDERS, type ProviderId } from "../contract/provider.js";
import { getApiKey } from "./api-key-manager.js";

export function resolveLanguageModel(providerId: string, model: string): LanguageModelV3 {
  const provider = PROVIDERS.find((p) => p.id === providerId);
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  const apiKey = getApiKey(providerId as ProviderId);
  if (!apiKey) {
    const envKeys = provider.envKeys ?? [];
    const envKeyHint = envKeys.length > 0 ? envKeys[0] : "API key";
    throw new Error(
      `Missing ${envKeyHint}. Add your API key in Settings or set the environment variable.`,
    );
  }

  const providerBaseUrl = process.env[`${providerId.toUpperCase()}_BASE_URL`]?.trim();
  const baseUrl = provider.defaultBaseUrl
    ? (providerId === "opencode" && process.env.OPENCODE_ZEN_BASE_URL?.trim()) ||
      providerBaseUrl ||
      provider.defaultBaseUrl
    : undefined;

  let languageModel: LanguageModelV3;

  switch (provider.sdkType) {
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey });
      const m = google.chat(model);
      if (!m) throw new Error(`Unsupported ${provider.provider} model: ${model}`);
      languageModel = m;
      break;
    }
    case "openai": {
      const client = createOpenAI({
        baseURL: baseUrl,
        apiKey,
        name: providerId,
      });
      const m = client.chat(model);
      if (!m) throw new Error(`Unsupported ${provider.provider} model: ${model}`);
      languageModel = m;
      break;
    }
    case "openai-compatible": {
      const client = createOpenAICompatible({
        baseURL: baseUrl!,
        apiKey,
        name: providerId,
      });
      const m = client.chatModel(model);
      if (!m) throw new Error(`Unsupported ${provider.provider} model: ${model}`);
      languageModel = m;
      break;
    }
    default:
      throw new Error(
        `Unhandled SDK type for provider: ${provider.provider} (sdkType: ${provider.sdkType ?? "undefined"})`,
      );
  }

  return languageModel;
}
