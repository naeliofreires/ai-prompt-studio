import { act, renderHook, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GeneratePromptAttachment } from "../src/shared";
import { usePromptStudioController } from "../src/renderer/app/prompt-studio/usePromptStudioController";
import type { PromtizerResponse } from "../src/renderer/types/api";

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
  addRole: vi.fn(),
  deleteRole: vi.fn(),
  updateRole: vi.fn(),
}));
const mockApiKeyState = vi.hoisted(() => ({
  configuredProviders: new Set(["gemini", "glm", "deepseek", "opencode"]),
  keys: {},
  saveKeys: vi.fn(),
  clearProvider: vi.fn(),
  clearAll: vi.fn(),
}));

vi.mock("../src/renderer/hooks/useRoles", () => ({
  useRoles: () => ({
    roles: mockRolesState.roles,
    addRole: mockRolesState.addRole,
    deleteRole: mockRolesState.deleteRole,
    updateRole: mockRolesState.updateRole,
    isLoading: false,
    error: "",
  }),
}));

vi.mock("../src/renderer/hooks/useApiKeyRepository", () => ({
  useApiKeyRepository: () => ({
    keys: mockApiKeyState.keys,
    saveKeys: mockApiKeyState.saveKeys,
    clearProvider: mockApiKeyState.clearProvider,
    clearAll: mockApiKeyState.clearAll,
    isConfigured: (providerId: string) => mockApiKeyState.configuredProviders.has(providerId),
    configuredProviderIds: Array.from(mockApiKeyState.configuredProviders),
  }),
}));

vi.mock("../src/renderer/hooks/useCopyWithFeedback", () => ({
  useCopyWithFeedback: () => ({
    isCopied: false,
    copyText,
    resetCopied: vi.fn(),
  }),
}));

vi.mock("../src/renderer/hooks/usePromptGeneration", () => {
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
    mockRolesState.addRole.mockReset();
    mockRolesState.deleteRole.mockReset();
    mockRolesState.updateRole.mockReset();
    mockRolesState.addRole.mockImplementation(async (title: string, description: string) => {
      const role = {
        id: title.toLowerCase().replaceAll(" ", "-"),
        title,
        description,
        source: "custom" as const,
      };
      mockRolesState.roles = [...mockRolesState.roles, role];
      return role;
    });
    mockRolesState.deleteRole.mockImplementation(async (id: string) => {
      const nextRoles = mockRolesState.roles.filter((role) => role.id !== id);
      const deleted = nextRoles.length < mockRolesState.roles.length;
      mockRolesState.roles = nextRoles;
      return deleted;
    });
    mockApiKeyState.configuredProviders = new Set(["gemini", "glm", "deepseek", "opencode"]);
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

  it("activates a newly created persona", async () => {
    const { result } = renderHook(() => usePromptStudioController());

    await act(async () => {
      await result.current.personasPage.onCreate("Systems Thinker", "Frames prompts as systems.");
    });

    expect(result.current.persona.activeRole).toBe("systems-thinker");
    expect(result.current.persona.roles).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "systems-thinker" })]),
    );
  });

  it("selects another persona after deleting the active persona", async () => {
    const { result } = renderHook(() => usePromptStudioController());

    await waitFor(() => {
      expect(result.current.persona.activeRole).toBe("frontend-specialist");
    });

    await act(async () => {
      await result.current.personasPage.onDelete("frontend-specialist");
    });

    expect(result.current.persona.activeRole).toBe("backend-specialist");
  });

  it("shows configured providers and resets the model when provider changes", () => {
    mockApiKeyState.configuredProviders = new Set(["gemini", "glm"]);
    const { result } = renderHook(() => usePromptStudioController());

    expect(result.current.composer.providers.map((entry) => entry.id)).toEqual(["gemini", "glm"]);

    act(() => {
      result.current.composer.onProviderChange("glm");
    });

    expect(result.current.composer.provider).toBe("glm");
    expect(result.current.composer.model).toBe(result.current.composer.selectedProvider.models[0]);
  });

  it("updates configured provider visibility after key changes", () => {
    mockApiKeyState.configuredProviders = new Set(["gemini"]);
    mockApiKeyState.saveKeys.mockImplementation((patch: Record<string, string>) => {
      for (const [providerId, key] of Object.entries(patch)) {
        if (key.trim().length > 0) {
          mockApiKeyState.configuredProviders.add(providerId);
        }
      }
    });
    mockApiKeyState.clearProvider.mockImplementation((providerId: string) => {
      mockApiKeyState.configuredProviders.delete(providerId);
    });
    const { result, rerender } = renderHook(() => usePromptStudioController());

    expect(result.current.composer.providers.map((entry) => entry.id)).toEqual(["gemini"]);

    act(() => {
      result.current.settingsModal.onSaveKeys({ glm: "glm-key" });
    });
    rerender();

    expect(result.current.composer.providers.map((entry) => entry.id)).toEqual(["gemini", "glm"]);

    act(() => {
      result.current.settingsModal.onClearProvider("gemini");
    });
    rerender();

    expect(result.current.composer.providers.map((entry) => entry.id)).toEqual(["glm"]);
  });
});
