import type { LanguageModelV3 } from "@ai-sdk/provider";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { PROVIDER_IDS, type ProviderId } from "../../shared/domain/provider.js";

const DEFAULT_GLM_BASE_URL = "https://api.z.ai/api/paas/v4/";
const DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

function isProviderId(id: string): id is ProviderId {
  return (PROVIDER_IDS as readonly string[]).includes(id);
}

export function resolveLanguageModel(providerId: string, model: string): LanguageModelV3 {
  if (!isProviderId(providerId)) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  switch (providerId) {
    case "gemini": {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
      if (!apiKey) {
        throw new Error(
          "Missing GOOGLE_GENERATIVE_AI_API_KEY. Set it in the environment or in a .env file for local development.",
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
      const apiKey = process.env.GLM_API_KEY?.trim() ?? process.env.ZHIPU_API_KEY?.trim();
      if (!apiKey) {
        throw new Error(
          "Missing GLM_API_KEY or ZHIPU_API_KEY. Set a Z.ai API key (https://z.ai/manage-apikey/apikey-list) or Zhipu/BigModel credentials in the environment or .env.",
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
      const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
      if (!apiKey) {
        throw new Error(
          "Missing DEEPSEEK_API_KEY. Create a key at https://platform.deepseek.com and set it in the environment or in a .env file for local development.",
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
