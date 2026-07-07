import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  usePromptGeneration,
  type UsePromptGenerationArgs,
} from "../src/renderer/hooks/usePromptGeneration";
import type { PromtizerResponse } from "../src/renderer/types/api";
import type { Role } from "../src/renderer/types/role";

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

  it("sets output and usage on success", async () => {
    const structuredResponse: PromtizerResponse = {
      title: "Refined Prompt",
      description: "A concise prompt for a todo app.",
      requirements: ["Must include CRUD operations."],
      expectations: "The assistant should provide a complete implementation plan.",
      goodToGo: true,
    };
    const generatePrompt = vi.fn().mockResolvedValue({
      ok: true,
      prompt: JSON.stringify(structuredResponse),
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
    expect(result.current.promtizerResponse).toEqual(structuredResponse);
    expect(result.current.outputPrompt).toBe(JSON.stringify(structuredResponse, null, 2));
    expect(result.current.usage).toEqual({ tokensUsed: 42 });
    expect(result.current.generationError).toBe("");
  });

  it("AC11 sets evaluation when prompt generation returns prompt feedback", async () => {
    const structuredResponse: PromtizerResponse = {
      title: "Refined Prompt",
      description: "A concise prompt for a todo app.",
      requirements: ["Must include CRUD operations."],
      expectations: "The assistant should provide a complete implementation plan.",
      goodToGo: true,
    };
    const generatePrompt = vi.fn().mockResolvedValue({
      ok: true,
      prompt: JSON.stringify(structuredResponse),
      tokensUsed: 42,
      evaluation: {
        score: 4,
        summary: "Clear prompt with a focused goal.",
        suggestions: ["Add input constraints."],
      },
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

    expect(result.current.evaluation).toEqual({
      score: 4,
      summary: "Clear prompt with a focused goal.",
      suggestions: ["Add input constraints."],
    });
  });

  it("does not set evaluation when the provider only returns token usage", async () => {
    const structuredResponse: PromtizerResponse = {
      title: "Refined Prompt",
      description: "A concise prompt for a todo app.",
      requirements: ["Must include CRUD operations."],
      expectations: "The assistant should provide a complete implementation plan.",
      goodToGo: true,
    };
    const generatePrompt = vi.fn().mockResolvedValue({
      ok: true,
      prompt: JSON.stringify(structuredResponse),
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

    expect(result.current.usage).toEqual({ tokensUsed: 42 });
    expect(result.current.evaluation).toBeNull();
  });

  it('6. sends selected attachments when prompt generation runs ', () => {
    const attachments = [
      {
        name: "notes.txt",
        mimeType: "text/plain" as const,
        sizeBytes: 42,
        content: "Use this as context.",
      },
    ];
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
      result.current.setPromptAttachments(attachments);
    });

    return act(async () => {
      await result.current.handleGenerate();
    }).then(() => {
      expect(generatePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          rawInput: "Build a todo app",
          personaId: "architect",
          providerId: "gemini",
          model: "gemini-2.5-pro",
          attachments,
        }),
      );
    });
  });

  it('7. sends the full visible attachment list when prompt generation runs ', () => {
    const visibleAttachments = [
      {
        name: "brief.txt",
        mimeType: "text/plain" as const,
        sizeBytes: 23,
        content: "Use this brief.",
      },
      {
        name: "requirements.md",
        mimeType: "text/markdown" as const,
        sizeBytes: 39,
        content: "# Requirements\n\nKeep these constraints.",
      },
      {
        name: "notes.txt",
        mimeType: "text/plain" as const,
        sizeBytes: 31,
        content: "Additional notes.",
      },
    ];
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
      result.current.setPromptAttachments(visibleAttachments);
    });

    return act(async () => {
      await result.current.handleGenerate();
    }).then(() => {
      expect(generatePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          rawInput: "Build a todo app",
          attachments: visibleAttachments,
        }),
      );
    });
  });

  it('7. still requires raw prompt text when attachments are present ', () => {
    const attachments = [
      {
        name: "notes.txt",
        mimeType: "text/plain" as const,
        sizeBytes: 42,
        content: "Use this as context.",
      },
    ];
    const generatePrompt = vi.fn();

    const { result } = renderHook(() =>
      usePromptGeneration(
        baseArgs({
          generatePrompt,
        }),
      ),
    );

    act(() => {
      result.current.setInputIdea("   ");
      result.current.setPromptAttachments(attachments);
    });

    return act(async () => {
      await result.current.handleGenerate();
    }).then(() => {
      expect(generatePrompt).not.toHaveBeenCalled();
      expect(result.current.generationError).toMatch(/Enter an idea/i);
    });
  });

  it('9. sends selected markdown attachments when prompt generation runs ', () => {
    const attachments = [
      {
        name: "notes.md",
        mimeType: "text/markdown" as const,
        sizeBytes: 42,
        content: "# Notes\n\nUse this as context.",
      },
    ];
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
      result.current.setPromptAttachments(attachments);
    });

    return act(async () => {
      await result.current.handleGenerate();
    }).then(() => {
      expect(generatePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          rawInput: "Build a todo app",
          personaId: "architect",
          providerId: "gemini",
          model: "gemini-2.5-pro",
          attachments,
        }),
      );
    });
  });

  it('10. still requires raw prompt text when markdown attachments are present ', () => {
    const attachments = [
      {
        name: "notes.md",
        mimeType: "text/markdown" as const,
        sizeBytes: 42,
        content: "# Notes\n\nUse this as context.",
      },
    ];
    const generatePrompt = vi.fn();

    const { result } = renderHook(() =>
      usePromptGeneration(
        baseArgs({
          generatePrompt,
        }),
      ),
    );

    act(() => {
      result.current.setInputIdea("   ");
      result.current.setPromptAttachments(attachments);
    });

    return act(async () => {
      await result.current.handleGenerate();
    }).then(() => {
      expect(generatePrompt).not.toHaveBeenCalled();
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.generationError).toMatch(/Enter an idea/i);
    });
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
