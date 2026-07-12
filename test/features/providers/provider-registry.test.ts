import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { chat, chatModel, createOpenAI, createOpenAICompatible } = vi.hoisted(() => {
  const chat = vi.fn(() => ({}));
  const chatModel = vi.fn(() => ({}));
  return {
    chat,
    chatModel,
    createOpenAI: vi.fn(() => ({ chat })),
    createOpenAICompatible: vi.fn(() => ({ chatModel })),
  };
});

vi.mock("@ai-sdk/openai", () => ({ createOpenAI }));
vi.mock("@ai-sdk/openai-compatible", () => ({ createOpenAICompatible }));

import { resolvePromptStudioExecution } from "../../../src/features/providers/desktop/provider-registry";
import {
  clearAllApiKeys,
  setApiKeys,
} from "../../../src/features/providers/desktop/api-key-manager";

const baseUrlKeys = [
  "OPENCODE_ZEN_BASE_URL",
  "OPENCODE_BASE_URL",
  "DEEPSEEK_ZEN_BASE_URL",
  "DEEPSEEK_BASE_URL",
] as const;
const previousEnv = new Map<string, string | undefined>();

describe("provider-registry", () => {
  beforeEach(() => {
    clearAllApiKeys();
    createOpenAI.mockClear();
    createOpenAICompatible.mockClear();
    chat.mockClear();
    chatModel.mockClear();
    setApiKeys({ opencode: "test-key", deepseek: "test-key" });

    for (const key of baseUrlKeys) {
      previousEnv.set(key, process.env[key]);
      delete process.env[key];
    }
  });

  afterEach(() => {
    clearAllApiKeys();
    for (const key of baseUrlKeys) {
      const previous = previousEnv.get(key);
      if (previous === undefined) delete process.env[key];
      else process.env[key] = previous;
    }
  });

  it("uses the saved session URL instead of environment overrides", () => {
    process.env.OPENCODE_ZEN_BASE_URL = "https://zen.example/v1";
    process.env.OPENCODE_BASE_URL = "https://legacy.example/v1";

    resolvePromptStudioExecution({
      providerId: "opencode",
      model: "big-pickle",
      url: "https://saved.example/v1",
    });

    expect(createOpenAICompatible).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: "https://saved.example/v1" }),
    );
  });

  it("uses the saved URL for OpenCode when no environment override is present", () => {
    process.env.OPENCODE_BASE_URL = "https://legacy.example/v1";

    resolvePromptStudioExecution({
      providerId: "opencode",
      model: "big-pickle",
      url: "http://localhost:8080/v1",
    });

    expect(createOpenAICompatible).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: "http://localhost:8080/v1" }),
    );
  });

  it("uses the saved URL for other providers", () => {
    process.env.DEEPSEEK_ZEN_BASE_URL = "https://zen.example/v1";
    process.env.DEEPSEEK_BASE_URL = "https://deepseek.example/v1";

    resolvePromptStudioExecution({
      providerId: "deepseek",
      model: "deepseek-reasoner",
      url: "https://saved.deepseek.example/v1",
    });

    expect(createOpenAI).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: "https://saved.deepseek.example/v1" }),
    );
  });
});
