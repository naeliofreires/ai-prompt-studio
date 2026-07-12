import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GeneratePromptAttachment } from "../../../src/features/prompt-generation/contract/ipc";
import { usePromptStudioViewModel } from "../../../src/features/prompt-studio/ui/usePromptStudioViewModel";
import type { PromtizerResponse } from "../../../src/features/prompt-generation/ui/types/api";

const copyText = vi.fn();
const apiKeys = vi.hoisted(() => ({
  configured: new Set(["gemini", "glm"]),
  saveKeys: vi.fn(),
  clearProvider: vi.fn(),
  clearAll: vi.fn(),
}));

vi.mock("../../../src/features/providers/ui/useApiKeyRepository", () => ({
  useApiKeyRepository: () => ({
    keys: {},
    saveKeys: apiKeys.saveKeys,
    clearProvider: apiKeys.clearProvider,
    clearAll: apiKeys.clearAll,
    isConfigured: (id: string) => apiKeys.configured.has(id),
    configuredProviderIds: Array.from(apiKeys.configured),
  }),
}));

vi.mock("../../../src/features/prompt-generation/ui/hooks/useCopyWithFeedback", () => ({
  useCopyWithFeedback: () => ({ isCopied: false, copyText, resetCopied: vi.fn() }),
}));

vi.mock("../../../src/features/prompt-generation/ui/hooks/usePromptGeneration", () => ({
  usePromptGeneration: () => {
    const response: PromtizerResponse = {
      title: "Refined Prompt",
      description: "A concise prompt.",
      requirements: ["Include requirements."],
      expectations: "Return a plan.",
      goodToGo: true,
    };
    const [promptAttachments, setPromptAttachments] = useState<GeneratePromptAttachment[]>([]);
    return {
      inputIdea: "",
      setInputIdea: vi.fn(),
      isGenerating: false,
      outputPrompt: JSON.stringify(response),
      promtizerResponse: response,
      usage: null,
      evaluation: null,
      generationError: "",
      promptAttachments,
      setPromptAttachments,
      handleGenerate: vi.fn(),
    };
  },
}));

describe("usePromptStudioViewModel", () => {
  beforeEach(() => {
    copyText.mockClear();
    apiKeys.configured = new Set(["gemini", "glm"]);
  });

  it("exposes and removes prompt attachments", () => {
    const attachment: GeneratePromptAttachment = {
      name: "notes.txt",
      mimeType: "text/plain",
      sizeBytes: 42,
      content: "Context",
    };
    const { result } = renderHook(() => usePromptStudioViewModel());

    act(() => result.current.composer.onPromptAttachmentsChange([attachment]));
    expect(result.current.composer.promptAttachments).toEqual([attachment]);

    act(() => result.current.composer.onRemovePromptAttachment(0));
    expect(result.current.composer.promptAttachments).toEqual([]);
  });

  it("copies the structured response as markdown", async () => {
    const { result } = renderHook(() => usePromptStudioViewModel());
    await act(() => result.current.output.onCopy());
    expect(copyText).toHaveBeenCalledWith(expect.stringContaining("# Refined Prompt"));
    expect(copyText).toHaveBeenCalledWith(expect.stringContaining("## Requirements"));
  });

  it("shows configured providers and resets the model when provider changes", () => {
    const { result } = renderHook(() => usePromptStudioViewModel());
    expect(result.current.composer.providers.map(({ id }) => id)).toEqual(["gemini", "glm"]);

    act(() => result.current.composer.onProviderChange("glm"));
    expect(result.current.composer.provider).toBe("glm");
    expect(result.current.composer.model).toBe(result.current.composer.selectedProvider.models[0]);
  });
});
