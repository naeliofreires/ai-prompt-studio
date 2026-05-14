import type { LanguageModelV3 } from "@ai-sdk/provider";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { PROVIDER_IDS, type ProviderId } from "../../shared/domain/provider.js";
import { getApiKey } from "../services/api-key-manager.js";

const DEFAULT_GLM_BASE_URL = "https://api.z.ai/api/paas/v4/";
const DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

function isProviderId(id: string): id is ProviderId {
  return (PROVIDER_IDS as readonly string[]).includes(id);
}

function resolveApiKey(providerId: string, envKeys: string[]): string | undefined {
  const runtimeKey = getApiKey(providerId)?.trim();
  if (runtimeKey) return runtimeKey;
  for (const envKey of envKeys) {
    const val = process.env[envKey]?.trim();
    if (val) return val;
  }
  return undefined;
}

export function resolveLanguageModel(providerId: string, model: string): LanguageModelV3 {
  if (!isProviderId(providerId)) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  switch (providerId) {
    case "gemini": {
      const apiKey = resolveApiKey(providerId, ["GOOGLE_GENERATIVE_AI_API_KEY"]);
      if (!apiKey) {
        throw new Error(
          "Missing GOOGLE_GENERATIVE_AI_API_KEY. Add your API key in Settings or set the environment variable.",
        );
      }
      const google = createGoogleGenerativeAI({ apiKey });
      const languageModel = google.chat(model);
      if (!languageModel) {
        throw new Error(`Unsupported Gemini model: ${model}`);
      }
      return languageModel;
    }

    case "glm": {
      const apiKey = resolveApiKey(providerId, ["GLM_API_KEY", "ZHIPU_API_KEY"]);
      if (!apiKey) {
        throw new Error(
          "Missing GLM_API_KEY or ZHIPU_API_KEY. Add your API key in Settings or set the environment variable.",
        );
      }
      const baseURL = process.env.GLM_BASE_URL?.trim() || DEFAULT_GLM_BASE_URL;
      const glm = createOpenAI({
        baseURL,
        apiKey,
        name: "glm",
      });
      const languageModel = glm.chat(model);
      if (!languageModel) {
        throw new Error(`Unsupported GLM model: ${model}`);
      }
      return languageModel;
    }

    case "deepseek": {
      const apiKey = resolveApiKey(providerId, ["DEEPSEEK_API_KEY"]);
      if (!apiKey) {
        throw new Error(
          "Missing DEEPSEEK_API_KEY. Add your API key in Settings or set the environment variable.",
        );
      }
      const baseURL = process.env.DEEPSEEK_BASE_URL?.trim() || DEFAULT_DEEPSEEK_BASE_URL;
      const deepseek = createOpenAI({
        baseURL,
        apiKey,
        name: "deepseek",
      });
      const languageModel = deepseek.chat(model);
      if (!languageModel) {
        throw new Error(`Unsupported DeepSeek model: ${model}`);
      }
      return languageModel;
    }
  }

  throw new Error(`Unhandled provider: ${String(providerId)}`);
}
