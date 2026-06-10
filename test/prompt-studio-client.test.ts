import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GeneratePromptPayload } from "../apps/promptizer/shared";
import { promptStudioClient } from "../apps/promptizer/ui/api/prompt-studio-client";
import { setAiPromptStudioBridge } from "./helpers/ai-prompt-studio-bridge";

describe("promptStudioClient", () => {
  beforeEach(() => {
    setAiPromptStudioBridge(undefined);
    vi.restoreAllMocks();
  });

  it("1. forwards prompt attachments through the prompt studio client ", () => {
    const bridge = {
      generatePrompt: vi.fn().mockResolvedValue({ ok: true, prompt: "Refined text" }),
    } satisfies Partial<Window["aiPromptStudio"]>;
    setAiPromptStudioBridge(bridge);

    const payload: GeneratePromptPayload = {
      rawInput: "Refine this idea",
      personaId: "frontend",
      providerId: "gemini",
      model: "gemini-2.5-pro",
      attachments: [
        {
          name: "notes.txt",
          mimeType: "text/plain",
          sizeBytes: 42,
          content: "...",
        },
      ],
    };

    return promptStudioClient.generatePrompt(payload).then(() => {
      expect(bridge.generatePrompt).toHaveBeenCalledWith(payload);
    });
  });
});
