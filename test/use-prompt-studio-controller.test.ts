import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GeneratePromptAttachment } from "../src/shared";
import { usePromptStudioController } from "../src/ui/app/usePromptStudioController";

type ComposerAttachmentControls = {
  promptAttachments: GeneratePromptAttachment[];
  onPromptAttachmentsChange: (attachments: GeneratePromptAttachment[]) => void;
  onRemovePromptAttachment: (index: number) => void;
};

vi.mock("../src/ui/hooks/useRoles", () => ({
  useRoles: () => ({
    roles: [
      {
        id: "architect",
        title: "Architect",
        description: "You are a software architect.",
        source: "builtin",
      },
    ],
    addRole: vi.fn(),
    deleteRole: vi.fn(),
    isLoading: false,
    error: "",
  }),
}));

vi.mock("../src/ui/hooks/useApiKeySettings", () => ({
  useApiKeySettings: () => ({
    keys: {},
    saveKeys: vi.fn(),
    clearProvider: vi.fn(),
    clearAll: vi.fn(),
    isConfigured: () => true,
  }),
}));

vi.mock("../src/ui/hooks/useCopyWithFeedback", () => ({
  useCopyWithFeedback: () => ({
    isCopied: false,
    copyText: vi.fn(),
    resetCopied: vi.fn(),
  }),
}));

describe("usePromptStudioController", () => {
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
});
