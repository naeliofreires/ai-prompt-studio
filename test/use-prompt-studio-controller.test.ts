import { act, renderHook, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GeneratePromptAttachment } from "../apps/promptizer/shared";
import { usePromptStudioController } from "../apps/promptizer/ui/app/usePromptStudioController";
import type { PromtizerResponse } from "../apps/promptizer/ui/types/api";

type ComposerAttachmentControls = {
  promptAttachments: GeneratePromptAttachment[];
  onPromptAttachmentsChange: (attachments: GeneratePromptAttachment[]) => void;
  onRemovePromptAttachment: (index: number) => void;
};

const copyText = vi.fn();
const mockRolesState = vi.hoisted(() => ({
  roles: [
    {
      id: "frontend-specialist",
      title: "Frontend Specialist",
      description: "Refines prompts for React.",
      source: "custom" as const,
    },
    {
      id: "backend-specialist",
      title: "Backend Specialist",
      description: "Refines prompts for APIs.",
      source: "custom" as const,
    },
  ],
}));

vi.mock("../apps/promptizer/ui/hooks/useRoles", () => ({
  useRoles: () => ({
    roles: mockRolesState.roles,
    addRole: vi.fn(),
    deleteRole: vi.fn(),
    updateRole: vi.fn(),
    isLoading: false,
    error: "",
  }),
}));

vi.mock("../apps/promptizer/ui/hooks/useApiKeySettings", () => ({
  useApiKeySettings: () => ({
    keys: {},
    saveKeys: vi.fn(),
    clearProvider: vi.fn(),
    clearAll: vi.fn(),
    isConfigured: () => true,
  }),
}));

vi.mock("../apps/promptizer/ui/hooks/useCopyWithFeedback", () => ({
  useCopyWithFeedback: () => ({
    isCopied: false,
    copyText,
    resetCopied: vi.fn(),
  }),
}));

vi.mock("../apps/promptizer/ui/hooks/usePromptGeneration", () => {
  const promtizerResponse: PromtizerResponse = {
    title: "Refined Prompt",
    description: "A concise prompt for a todo app.",
    requirements: ["Must include CRUD operations."],
    expectations: "The assistant should provide a complete implementation plan.",
    goodToGo: true,
  };

  return {
    usePromptGeneration: () => {
      const [promptAttachments, setPromptAttachments] = useState<GeneratePromptAttachment[]>([]);

      return {
        inputIdea: "",
        setInputIdea: vi.fn(),
        isGenerating: false,
        outputPrompt: JSON.stringify(promtizerResponse, null, 2),
        promtizerResponse,
        usage: null,
        evaluation: null,
        generationError: "",
        promptAttachments,
        setPromptAttachments,
        handleGenerate: vi.fn(),
      };
    },
  };
});

describe("usePromptStudioController", () => {
  beforeEach(() => {
    copyText.mockClear();
    mockRolesState.roles = [
      {
        id: "frontend-specialist",
        title: "Frontend Specialist",
        description: "Refines prompts for React.",
        source: "custom",
      },
      {
        id: "backend-specialist",
        title: "Backend Specialist",
        description: "Refines prompts for APIs.",
        source: "custom",
      },
    ];
  });

  it("switches between studio and personas views without losing the selected persona", async () => {
    const { result } = renderHook(() => usePromptStudioController());

    expect(result.current.view).toBe("studio");

    await waitFor(() => {
      expect(result.current.persona.activeRole).toBe("frontend-specialist");
    });

    act(() => {
      result.current.onShowPersonas();
    });

    expect(result.current.view).toBe("personas");

    act(() => {
      result.current.persona.onSelect("backend-specialist");
    });

    act(() => {
      result.current.onShowStudio();
    });

    expect(result.current.view).toBe("studio");
    expect(result.current.persona.activeRole).toBe("backend-specialist");
  });

  it('15. exposes prompt attachment state through the prompt studio controller ', () => {
    const attachment: GeneratePromptAttachment = {
      name: "notes.txt",
      mimeType: "text/plain",
      sizeBytes: 42,
      content: "Use this as context.",
    };
    const { result } = renderHook(() => usePromptStudioController());
    const composer = () => result.current.composer as typeof result.current.composer &
      ComposerAttachmentControls;

    expect(composer().promptAttachments).toEqual([]);

    act(() => {
      composer().onPromptAttachmentsChange([attachment]);
    });

    expect(composer().promptAttachments).toEqual([attachment]);

    act(() => {
      composer().onRemovePromptAttachment(0);
    });

    expect(composer().promptAttachments).toEqual([]);
  });

  it("copies formatted markdown for structured responses", async () => {
    const { result } = renderHook(() => usePromptStudioController());

    await act(async () => {
      await result.current.output.onCopy();
    });

    expect(copyText).toHaveBeenCalledWith(
      expect.stringContaining("# Refined Prompt"),
    );
    expect(copyText).toHaveBeenCalledWith(expect.stringContaining("## Requirements"));
    expect(copyText).not.toHaveBeenCalledWith(expect.stringContaining("\"title\""));
  });

  it("blocks generation controls when no persona is available", () => {
    mockRolesState.roles = [];
    const { result } = renderHook(() => usePromptStudioController());

    expect(result.current.persona.activeRole).toBe("");
    expect(result.current.composer.disabledReason).toBe("Create a persona before generating.");
  });

  it("corrects a stale selected persona id to an available persona", async () => {
    const { result } = renderHook(() => usePromptStudioController());

    await waitFor(() => {
      expect(result.current.persona.activeRole).toBe("frontend-specialist");
    });

    act(() => {
      result.current.persona.onSelect("missing-persona");
    });

    await waitFor(() => {
      expect(result.current.persona.activeRole).toBe("frontend-specialist");
    });
    expect(result.current.composer.disabledReason).toBe("");
  });
});
