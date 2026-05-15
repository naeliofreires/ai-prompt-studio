import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  usePromptGeneration,
  type UsePromptGenerationArgs,
} from "../src/ui/hooks/usePromptGeneration";
import type { Role } from "../src/ui/types/role";

const geminiProvider = {
  id: "gemini" as const,
  provider: "Google Gemini",
  models: ["gemini-2.5-pro"],
};

const builtinRole: Role = {
  id: "architect",
  title: "Architect",
  description: "You are a software architect.",
  source: "builtin",
};

function baseArgs(overrides: Partial<UsePromptGenerationArgs> = {}) {
  return {
    selectedRole: builtinRole,
    provider: "gemini" as const,
    model: "gemini-2.5-pro",
    keyMissing: false,
    selectedProvider: geminiProvider,
    generatePrompt: vi.fn(),
    ...overrides,
  };
}

describe("usePromptGeneration", () => {
  it("sets validation error when input is empty and does not call generatePrompt", async () => {
    const generatePrompt = vi.fn();
    const { result } = renderHook(() =>
      usePromptGeneration(
        baseArgs({
          generatePrompt,
        }),
      ),
    );

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(generatePrompt).not.toHaveBeenCalled();
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generationError).toMatch(/Enter an idea/i);
  });

  it("sets validation error when model is blank", async () => {
    const generatePrompt = vi.fn();
    const { result } = renderHook(() =>
      usePromptGeneration(
        baseArgs({
          model: "   ",
          generatePrompt,
        }),
      ),
    );

    act(() => {
      result.current.setInputIdea("Build a todo app");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(generatePrompt).not.toHaveBeenCalled();
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generationError).toMatch(/Select a model/i);
  });

  it("blocks when API key is missing", async () => {
    const generatePrompt = vi.fn();
    const { result } = renderHook(() =>
      usePromptGeneration(
        baseArgs({
          keyMissing: true,
          generatePrompt,
        }),
      ),
    );

    act(() => {
      result.current.setInputIdea("Build a todo app");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(generatePrompt).not.toHaveBeenCalled();
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generationError).toMatch(/API key/i);
  });

  it("does not leave isGenerating true when persona is missing", async () => {
    const generatePrompt = vi.fn();
    const { result } = renderHook(() =>
      usePromptGeneration(
        baseArgs({
          selectedRole: undefined,
          generatePrompt,
        }),
      ),
    );

    act(() => {
      result.current.setInputIdea("Build a todo app");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(generatePrompt).not.toHaveBeenCalled();
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generationError).toMatch(/persona/i);
  });

  it("clears isGenerating after ok: false result", async () => {
    const generatePrompt = vi.fn().mockResolvedValue({
      ok: false,
      message: "Rate limited",
    });

    const { result } = renderHook(() =>
      usePromptGeneration(
        baseArgs({
          generatePrompt,
        }),
      ),
    );

    act(() => {
      result.current.setInputIdea("Build a todo app");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generationError).toBe("Rate limited");
  });

  it("sets output and evaluation on success", async () => {
    const generatePrompt = vi.fn().mockResolvedValue({
      ok: true,
      prompt: "You are…",
      tokensUsed: 42,
    });

    const { result } = renderHook(() =>
      usePromptGeneration(
        baseArgs({
          generatePrompt,
        }),
      ),
    );

    act(() => {
      result.current.setInputIdea("Build a todo app");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.outputPrompt).toBe("You are…");
    expect(result.current.evaluation).toEqual({ tokensUsed: 42 });
    expect(result.current.generationError).toBe("");
  });

  it("invokes onGenerateStart when generation runs", async () => {
    const generatePrompt = vi.fn().mockResolvedValue({
      ok: true,
      prompt: "ok",
      tokensUsed: 1,
    });
    const onGenerateStart = vi.fn();

    const { result } = renderHook(() =>
      usePromptGeneration(
        baseArgs({
          generatePrompt,
          onGenerateStart,
        }),
      ),
    );

    act(() => {
      result.current.setInputIdea("idea");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(onGenerateStart).toHaveBeenCalledTimes(1);
  });

  it("does not invoke onGenerateStart on validation failure", async () => {
    const generatePrompt = vi.fn();
    const onGenerateStart = vi.fn();

    const { result } = renderHook(() =>
      usePromptGeneration(
        baseArgs({
          generatePrompt,
          onGenerateStart,
        }),
      ),
    );

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(onGenerateStart).not.toHaveBeenCalled();
  });

  it("clears isGenerating when generatePrompt rejects", async () => {
    const generatePrompt = vi.fn().mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() =>
      usePromptGeneration(
        baseArgs({
          generatePrompt,
        }),
      ),
    );

    act(() => {
      result.current.setInputIdea("idea");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    await waitFor(() => expect(result.current.isGenerating).toBe(false));
    expect(result.current.generationError).toMatch(/network down/);
  });
});
