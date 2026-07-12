import { describe, expect, it, vi } from "vitest";
import { generateRefinedPrompt } from "../../../src/features/prompt-generation/desktop/generate-refined-prompt.js";

describe("generateRefinedPrompt", () => {
  const payload = {
    rawInput: "Refine this prompt.",
    providerId: "gemini" as const,
    model: "gemini-2.5-pro",
  };

  it("generates with the shared context", async () => {
    const generatePrompt = vi.fn().mockResolvedValue({ prompt: "refined output", tokensUsed: 100 });

    const result = await generateRefinedPrompt(payload, { llmAdapter: { generatePrompt } });

    expect(result).toEqual({ ok: true, prompt: "refined output", tokensUsed: 100 });
    expect(generatePrompt).toHaveBeenCalledWith({ ...payload, attachments: undefined });
  });

  it("evaluates and saves successful generations without deprecated fields", async () => {
    const generatePrompt = vi.fn().mockResolvedValue({ prompt: "refined output" });
    const evaluation = { score: 4, summary: "Clear prompt.", suggestions: ["Add constraints."] };
    const evaluate = vi.fn().mockResolvedValue(evaluation);
    const savePromptSession = vi.fn();

    await generateRefinedPrompt(payload, {
      llmAdapter: { generatePrompt },
      promptEvaluator: { evaluate },
      savePromptSession,
    });

    expect(evaluate).toHaveBeenCalledWith({
      rawInput: payload.rawInput,
      refinedPrompt: "refined output",
    });
    expect(savePromptSession).toHaveBeenCalledWith({
      rawInput: payload.rawInput,
      providerId: payload.providerId,
      model: payload.model,
      generatedPrompt: "refined output",
      evaluation,
    });
  });
});
