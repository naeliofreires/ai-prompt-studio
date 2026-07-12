import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearAllApiKeys,
  getApiKey,
  listConfiguredApiKeyProviders,
  setApiKeys,
} from "../../../src/features/providers/desktop/api-key-manager";

const envKeys = [
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "GLM_API_KEY",
  "ZHIPU_API_KEY",
  "DEEPSEEK_API_KEY",
  "OPENCODE_API_KEY",
] as const;

const previousEnv = new Map<string, string | undefined>();

describe("api-key-manager", () => {
  beforeEach(() => {
    clearAllApiKeys();
    previousEnv.clear();

    for (const key of envKeys) {
      previousEnv.set(key, process.env[key]);
      delete process.env[key];
    }
  });

  afterEach(() => {
    clearAllApiKeys();

    for (const key of envKeys) {
      const previous = previousEnv.get(key);
      if (previous === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous;
      }
    }
  });

  it("resolves runtime keys before environment keys", () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "env-gemini";
    setApiKeys({ gemini: "runtime-gemini" });

    expect(getApiKey("gemini")).toBe("runtime-gemini");
  });

  it("resolves provider keys from environment variables", () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "env-gemini";
    process.env.DEEPSEEK_API_KEY = "env-deepseek";
    process.env.OPENCODE_API_KEY = "env-opencode";

    expect(getApiKey("gemini")).toBe("env-gemini");
    expect(getApiKey("deepseek")).toBe("env-deepseek");
    expect(getApiKey("opencode")).toBe("env-opencode");
  });

  it("resolves GLM from GLM_API_KEY or ZHIPU_API_KEY", () => {
    process.env.ZHIPU_API_KEY = "env-zhipu";
    expect(getApiKey("glm")).toBe("env-zhipu");

    process.env.GLM_API_KEY = "env-glm";
    expect(getApiKey("glm")).toBe("env-glm");
  });

  it("lists configured providers with optional environment fallback", () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "env-gemini";
    setApiKeys({ deepseek: "runtime-deepseek" });

    expect(listConfiguredApiKeyProviders({ includeEnvironment: false })).toEqual(["deepseek"]);
    expect(listConfiguredApiKeyProviders({ includeEnvironment: true })).toEqual([
      "gemini",
      "deepseek",
    ]);
  });
});
