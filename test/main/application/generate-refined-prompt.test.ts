import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { generateRefinedPrompt } from "../../../src/main/application/generate-refined-prompt.js";

describe("generateRefinedPrompt", () => {
  const payload = {
    rawInput: "Refine this prompt.",
    personaId: "frontend",
    providerId: "gemini" as const,
    model: "gemini-2.5-pro",
    attachments: [
      {
        name: "notes.txt",
        mimeType: "text/plain" as const,
        sizeBytes: 42,
        content: "Use this as context.",
      },
    ],
  };

  it("does not depend on IPC result or payload contracts", async () => {
    const source = await readFile(
      `${process.cwd()}/src/main/application/generate-refined-prompt.ts`,
      "utf8"
    );

    expect(source).not.toContain("shared/contracts/ipc");
    expect(source).not.toContain("GeneratePromptIpcResult");
    expect(source).not.toContain("GeneratePromptPayload");
  });

  it("resolves the persona context and calls the LLM adapter", async () => {
    const resolvePersonaContext = vi.fn().mockReturnValue("Frontend Expert\nRefines React prompts.");
    const generatePrompt = vi.fn().mockResolvedValue({
      prompt: "refined output",
      tokensUsed: 100,
    });

    const result = await generateRefinedPrompt(payload, {
      resolvePersonaContext,
      llmAdapter: { generatePrompt },
    });

    expect(result).toEqual({
      ok: true,
      prompt: "refined output",
      tokensUsed: 100,
    });
    expect(resolvePersonaContext).toHaveBeenCalledWith("frontend");
    expect(generatePrompt).toHaveBeenCalledWith({
      personaContext: "Frontend Expert\nRefines React prompts.",
      rawInput: "Refine this prompt.",
      providerId: "gemini",
      model: "gemini-2.5-pro",
      attachments: payload.attachments,
    });
  });

  it("AC10 includes evaluation when the evaluator succeeds", async () => {
    const resolvePersonaContext = vi.fn().mockReturnValue("Frontend Expert\nRefines React prompts.");
    const generatePrompt = vi.fn().mockResolvedValue({
      prompt: "refined output",
      tokensUsed: 100,
    });
    const evaluate = vi.fn().mockResolvedValue({
      score: 4,
      summary: "Clear prompt with a focused role.",
      suggestions: ["Add output constraints."],
    });

    const result = await generateRefinedPrompt(payload, {
      resolvePersonaContext,
      llmAdapter: { generatePrompt },
      promptEvaluator: { evaluate },
    });

    expect(result).toEqual({
      ok: true,
      prompt: "refined output",
      tokensUsed: 100,
      evaluation: {
        score: 4,
        summary: "Clear prompt with a focused role.",
        suggestions: ["Add output constraints."],
      },
    });
    expect(evaluate).toHaveBeenCalledWith({
      personaContext: "Frontend Expert\nRefines React prompts.",
      rawInput: "Refine this prompt.",
      refinedPrompt: "refined output",
      providerId: "gemini",
      model: "gemini-2.5-pro",
    });
  });

  it("AC13 saves a successful generation snapshot with usage and evaluation", async () => {
    const resolvePersonaContext = vi.fn().mockReturnValue("Frontend Expert\nRefines React prompts.");
    const generatePrompt = vi.fn().mockResolvedValue({
      prompt: "refined output",
      tokensUsed: 100,
    });
    const evaluation = {
      score: 4,
      summary: "Clear prompt with a focused role.",
      suggestions: ["Add output constraints."],
    };
    const evaluate = vi.fn().mockResolvedValue(evaluation);
    const savePromptSession = vi.fn();

    const result = await generateRefinedPrompt(payload, {
      resolvePersonaContext,
      llmAdapter: { generatePrompt },
      promptEvaluator: { evaluate },
      savePromptSession,
    });

    expect(result).toEqual({
      ok: true,
      prompt: "refined output",
      tokensUsed: 100,
      evaluation,
    });
    expect(savePromptSession).toHaveBeenCalledTimes(1);
    expect(savePromptSession).toHaveBeenCalledWith({
      rawInput: "Refine this prompt.",
      personaId: "frontend",
      providerId: "gemini",
      model: "gemini-2.5-pro",
      generatedPrompt: "refined output",
      usage: {
        tokensUsed: 100,
      },
      evaluation,
    });
  });

  it("AC10 returns the generated prompt when evaluation fails", async () => {
    const resolvePersonaContext = vi.fn().mockReturnValue("Frontend Expert\nRefines React prompts.");
    const generatePrompt = vi.fn().mockResolvedValue({
      prompt: "refined output",
      tokensUsed: 100,
    });
    const evaluate = vi.fn().mockRejectedValue(new Error("Invalid evaluation JSON"));

    const result = await generateRefinedPrompt(payload, {
      resolvePersonaContext,
      llmAdapter: { generatePrompt },
      promptEvaluator: { evaluate },
    });

    expect(result).toEqual({
      ok: true,
      prompt: "refined output",
      tokensUsed: 100,
    });
  });

  it("returns a controlled error for unknown personas without calling the LLM adapter", async () => {
    const resolvePersonaContext = vi.fn().mockReturnValue(null);
    const generatePrompt = vi.fn();
    const savePromptSession = vi.fn();

    const result = await generateRefinedPrompt(payload, {
      resolvePersonaContext,
      llmAdapter: { generatePrompt },
      savePromptSession,
    });

    expect(result).toEqual({
      ok: false,
      message: "Unknown persona. Create or select a persona before generating.",
    });
    expect(generatePrompt).not.toHaveBeenCalled();
    expect(savePromptSession).not.toHaveBeenCalled();
  });

  it("returns a controlled error when the LLM adapter fails", async () => {
    const resolvePersonaContext = vi.fn().mockReturnValue("Frontend Expert\nRefines React prompts.");
    const generatePrompt = vi.fn().mockRejectedValue(new Error("Provider unavailable"));
    const savePromptSession = vi.fn();

    const result = await generateRefinedPrompt(payload, {
      resolvePersonaContext,
      llmAdapter: { generatePrompt },
      savePromptSession,
    });

    expect(result).toEqual({
      ok: false,
      message: "Provider unavailable",
    });
    expect(savePromptSession).not.toHaveBeenCalled();
  });
});
