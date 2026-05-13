import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LLMAdapter } from "../src/main/services/LLMAdapter.js";

describe("LLMAdapter", () => {
  const prevGemini = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const prevGlm = process.env.GLM_API_KEY;
  const prevZhipu = process.env.ZHIPU_API_KEY;
  const prevDeepseekKey = process.env.DEEPSEEK_API_KEY;
  const prevDeepseekBase = process.env.DEEPSEEK_BASE_URL;

  beforeEach(() => {
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GLM_API_KEY;
    delete process.env.ZHIPU_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;
    delete process.env.DEEPSEEK_BASE_URL;
  });

  afterEach(() => {
    if (prevGemini === undefined) delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    else process.env.GOOGLE_GENERATIVE_AI_API_KEY = prevGemini;
    if (prevGlm === undefined) delete process.env.GLM_API_KEY;
    else process.env.GLM_API_KEY = prevGlm;
    if (prevZhipu === undefined) delete process.env.ZHIPU_API_KEY;
    else process.env.ZHIPU_API_KEY = prevZhipu;
    if (prevDeepseekKey === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = prevDeepseekKey;
    if (prevDeepseekBase === undefined) delete process.env.DEEPSEEK_BASE_URL;
    else process.env.DEEPSEEK_BASE_URL = prevDeepseekBase;
  });

  it("calls generateText with persona in system and raw input as prompt for gemini", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-google-key";
    const generateText = vi.fn().mockResolvedValue({
      text: "refined output",
      usage: { totalTokens: 100 },
    });
    const adapter = LLMAdapter({ generateText });

    const out = await adapter.generatePrompt({
      personaContext: "Frontend Expert\nRefines prompts for React.",
      rawInput: "user draft",
      providerId: "gemini",
      model: "gemini-2.5-pro",
    });

    expect(out.prompt).toBe("refined output");
    expect(out.tokensUsed).toBe(100);
    expect(generateText).toHaveBeenCalledTimes(1);
    const args = generateText.mock.calls[0][0];
    expect(args.system).toContain("Persona context:");
    expect(args.system).toContain("Frontend Expert");
    expect(args.prompt).toBe("user draft");
    expect(args.model).toBeDefined();
  });

  it("uses GLM when provider is glm", async () => {
    process.env.GLM_API_KEY = "test-glm-key";
    const generateText = vi.fn().mockResolvedValue({
      text: "glm result",
      usage: { totalTokens: 50 },
    });
    const adapter = LLMAdapter({ generateText });

    const out = await adapter.generatePrompt({
      personaContext: "p",
      rawInput: "in",
      providerId: "glm",
      model: "glm-4.6",
    });

    expect(out.prompt).toBe("glm result");
    expect(out.tokensUsed).toBe(50);
    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: "in" })
    );
  });

  it("accepts ZHIPU_API_KEY when GLM_API_KEY is unset", async () => {
    process.env.ZHIPU_API_KEY = "zhipu-only";
    const generateText = vi.fn().mockResolvedValue({
      text: "ok",
      usage: {},
    });
    const adapter = LLMAdapter({ generateText });

    await adapter.generatePrompt({
      personaContext: "p",
      rawInput: "in",
      providerId: "glm",
      model: "glm-4.6",
    });

    expect(generateText).toHaveBeenCalled();
  });

  it("rejects unknown provider before calling generateText", async () => {
    const generateText = vi.fn();
    const adapter = LLMAdapter({ generateText });

    await expect(
      adapter.generatePrompt({
        personaContext: "p",
        rawInput: "in",
        providerId: "anthropic",
        model: "claude-3",
      })
    ).rejects.toThrow("Unknown provider");

    expect(generateText).not.toHaveBeenCalled();
  });

  it("uses DeepSeek when provider is deepseek", async () => {
    process.env.DEEPSEEK_API_KEY = "test-deepseek-key";
    const generateText = vi.fn().mockResolvedValue({
      text: "deepseek result",
      usage: { totalTokens: 42 },
    });
    const adapter = LLMAdapter({ generateText });

    const out = await adapter.generatePrompt({
      personaContext: "p",
      rawInput: "in",
      providerId: "deepseek",
      model: "deepseek-chat",
    });

    expect(out.prompt).toBe("deepseek result");
    expect(out.tokensUsed).toBe(42);
    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: "in" })
    );
  });

  it("honors DEEPSEEK_BASE_URL when set", async () => {
    process.env.DEEPSEEK_API_KEY = "k";
    process.env.DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";
    const generateText = vi.fn().mockResolvedValue({
      text: "ok",
      usage: {},
    });
    const adapter = LLMAdapter({ generateText });

    await adapter.generatePrompt({
      personaContext: "p",
      rawInput: "in",
      providerId: "deepseek",
      model: "deepseek-chat",
    });

    expect(generateText).toHaveBeenCalled();
  });

  it("omits tokensUsed when usage has no totalTokens", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "k";
    const generateText = vi.fn().mockResolvedValue({
      text: "only text",
      usage: { totalTokens: undefined },
    });
    const adapter = LLMAdapter({ generateText });

    const out = await adapter.generatePrompt({
      personaContext: "p",
      rawInput: "in",
      providerId: "gemini",
      model: "gemini-2.5-pro",
    });

    expect(out.prompt).toBe("only text");
    expect(out.tokensUsed).toBeUndefined();
  });
});
