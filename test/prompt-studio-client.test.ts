import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GeneratePromptPayload } from "../src/shared";
import { promptStudioClient } from "../src/ui/api/prompt-studio-client";

function setBridge(bridge: Partial<Window["aiPromptStudio"]> | undefined): void {
  Object.defineProperty(window, "aiPromptStudio", {
    value: bridge,
    configurable: true,
    writable: true,
  });
}

describe("promptStudioClient", () => {
  beforeEach(() => {
    setBridge(undefined);
    vi.restoreAllMocks();
  });

  it("1. forwards prompt attachments through the prompt studio client ", () => {
    const bridge = {
      generatePrompt: vi.fn().mockResolvedValue({ ok: true, prompt: "Refined text" }),
    } satisfies Partial<Window["aiPromptStudio"]>;
    setBridge(bridge);

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
