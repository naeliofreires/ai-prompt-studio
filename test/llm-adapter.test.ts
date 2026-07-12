import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LLMAdapter } from "../src/features/prompt-generation/desktop/LLMAdapter.js";

describe("LLMAdapter", () => {
  const envKeys = [
    "GOOGLE_GENERATIVE_AI_API_KEY",
    "GLM_API_KEY",
    "ZHIPU_API_KEY",
    "DEEPSEEK_API_KEY",
    "DEEPSEEK_BASE_URL",
    "OPENCODE_API_KEY",
  ] as const;
  const previousEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));

  beforeEach(() => {
    for (const key of envKeys) delete process.env[key];
  });

  afterEach(() => {
    for (const key of envKeys) {
      const value = previousEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  async function generate(providerId: string, model: string, text = "refined output") {
    const generateText = vi.fn().mockResolvedValue({ text, usage: { totalTokens: 100 } });
    const output = await LLMAdapter({ generateText }).generatePrompt({
      rawInput: "user draft",
      providerId,
      model,
    });
    return { generateText, output };
  }

  it("uses the refinement system context and returns usage for Gemini", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-google-key";
    const { generateText, output } = await generate("gemini", "gemini-2.5-pro");

    expect(output).toEqual({ prompt: "refined output", tokensUsed: 100 });
    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({ prompt: "user draft" }));
    expect(generateText.mock.calls[0][0].system).toContain("refine the user's rough idea");
  });

  it("uses GLM and accepts the ZHIPU_API_KEY alias", async () => {
    process.env.ZHIPU_API_KEY = "zhipu-only";
    const { generateText, output } = await generate("glm", "glm-4.6", "glm result");

    expect(output).toEqual({ prompt: "glm result", tokensUsed: 100 });
    expect(generateText).toHaveBeenCalledTimes(1);
  });

  it("uses DeepSeek with an overridden base URL", async () => {
    process.env.DEEPSEEK_API_KEY = "test-deepseek-key";
    process.env.DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";
    const { generateText, output } = await generate(
      "deepseek",
      "deepseek-reasoner",
      "deepseek result",
    );

    expect(output).toEqual({ prompt: "deepseek result", tokensUsed: 100 });
    expect(generateText).toHaveBeenCalledTimes(1);
  });

  it("uses OpenCode Zen when its key is configured", async () => {
    process.env.OPENCODE_API_KEY = "test-opencode-key";
    const { generateText, output } = await generate("opencode", "big-pickle", "opencode result");

    expect(output).toEqual({ prompt: "opencode result", tokensUsed: 100 });
    expect(generateText).toHaveBeenCalledTimes(1);
  });

  it("rejects unknown providers before calling generateText", async () => {
    const generateText = vi.fn();

    await expect(
      LLMAdapter({ generateText }).generatePrompt({
        rawInput: "in",
        providerId: "anthropic",
        model: "claude-3",
      }),
    ).rejects.toThrow("Unknown provider");
    expect(generateText).not.toHaveBeenCalled();
  });

  it("rejects providers whose API key is missing", async () => {
    const generateText = vi.fn();

    await expect(
      LLMAdapter({ generateText }).generatePrompt({
        rawInput: "in",
        providerId: "opencode",
        model: "big-pickle",
      }),
    ).rejects.toThrow("Missing OPENCODE_API_KEY");
    expect(generateText).not.toHaveBeenCalled();
  });

  it("omits tokensUsed when usage has no totalTokens", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-google-key";
    const generateText = vi.fn().mockResolvedValue({ text: "only text", usage: {} });

    await expect(
      LLMAdapter({ generateText }).generatePrompt({
        rawInput: "in",
        providerId: "gemini",
        model: "gemini-2.5-pro",
      }),
    ).resolves.toEqual({ prompt: "only text" });
  });

  it("includes attachment context in order", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-google-key";
    const generateText = vi.fn().mockResolvedValue({ text: "refined", usage: {} });
    await LLMAdapter({ generateText }).generatePrompt({
      rawInput: "draft",
      providerId: "gemini",
      model: "gemini-2.5-pro",
      attachments: [
        { name: "first.txt", mimeType: "text/plain", sizeBytes: 1, content: "first" },
        { name: "second.md", mimeType: "text/markdown", sizeBytes: 2, content: "second" },
      ],
    });

    const prompt = generateText.mock.calls[0][0].prompt;
    expect(prompt).toContain("first.txt");
    expect(prompt).toContain("second.md");
    expect(prompt.indexOf("first.txt")).toBeLessThan(prompt.indexOf("second.md"));
  });
});
