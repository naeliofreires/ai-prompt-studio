import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerIpcHandlers } from "../../../src/platform/electron/register-handlers.js";
import { promptGenerationIpcChannels } from "../../../src/features/prompt-generation/contract/ipc.js";

type IpcHandler = (_event: unknown, payload: unknown) => unknown;

const mocks = vi.hoisted(() => {
  const handlers = new Map<string, IpcHandler>();

  return {
    app: { isPackaged: false, getName: () => "Promptizer Test" },
    generateText: vi.fn(),
    handlers,
    ipcMain: {
      handle: vi.fn((channel: string, handler: IpcHandler) => {
        handlers.set(channel, handler);
      }),
    },
  };
});

vi.mock("electron", () => ({
  app: mocks.app,
  ipcMain: mocks.ipcMain,
}));

vi.mock("ai", () => ({
  generateText: mocks.generateText,
}));

vi.mock("../../../src/features/prompt-studio/desktop/session-store.js", () => ({
  getPromptStudioSession: () => ({ providerId: "gemini", model: "gemini-2.5-pro", url: null }),
}));

describe("registerIpcHandlers", () => {
  const prevGemini = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  beforeEach(() => {
    mocks.handlers.clear();
    mocks.app.isPackaged = false;
    mocks.ipcMain.handle.mockClear();
    mocks.generateText.mockReset().mockResolvedValue({ text: "refined", usage: {} });
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-google-key";
  });

  afterEach(() => {
    if (prevGemini === undefined) delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    else process.env.GOOGLE_GENERATIVE_AI_API_KEY = prevGemini;
  });

  it("11. forwards markdown attachments from IPC payload to LLM generation ", () => {
    const attachments = [
      {
        name: "notes.md",
        mimeType: "text/markdown",
        sizeBytes: 42,
        content: "# Notes\nUse this as markdown context.",
      },
    ];
    const generatePrompt = vi.fn().mockResolvedValue({ prompt: "refined" });

    vi.resetModules();
    vi.doMock("../../../src/features/prompt-generation/desktop/LLMAdapter.js", () => ({
      LLMAdapter: vi.fn(() => ({ generatePrompt })),
    }));

    return import("../../../src/platform/electron/register-handlers.js")
      .then(({ registerIpcHandlers: registerHandlersWithMockAdapter }) => {
        registerHandlersWithMockAdapter({ generateText: mocks.generateText });
        const handler = mocks.handlers.get(promptGenerationIpcChannels.generatePrompt);

        expect(handler).toBeDefined();
        if (!handler) throw new Error("generatePrompt handler was not registered");

        return Promise.resolve(
          handler(
            {},
            {
              providerId: "gemini",
              model: "gemini-2.5-pro",
              rawInput: "Refine this prompt.",
              attachments,
            },
          ),
        );
      })
      .then(() => {
        expect(generatePrompt).toHaveBeenCalledWith(
          expect.objectContaining({
            attachments,
          }),
        );
      })
      .finally(() => {
        vi.doUnmock("../../../src/features/prompt-generation/desktop/LLMAdapter.js");
      });
  });

  it("13. forwards prompt attachments from IPC payload to LLM generation ", () => {
    const evaluation = {
      score: 4,
      summary: "Clear prompt with a focused goal.",
      suggestions: ["Add input constraints."],
    };

    mocks.generateText
      .mockResolvedValueOnce({ text: "refined", usage: {} })
      .mockResolvedValueOnce({ text: JSON.stringify(evaluation), usage: {} });

    registerIpcHandlers({ generateText: mocks.generateText });
    const handler = mocks.handlers.get(promptGenerationIpcChannels.generatePrompt);

    expect(handler).toBeDefined();
    if (!handler) throw new Error("generatePrompt handler was not registered");

    return Promise.resolve(
      handler(
        {},
        {
          providerId: "gemini",
          model: "gemini-2.5-pro",
          rawInput: "Refine this prompt.",
          attachments: [
            {
              name: "notes.txt",
              mimeType: "text/plain",
              sizeBytes: 42,
              content: "Use this as context.",
            },
          ],
        },
      ),
    ).then((result) => {
      expect(result).toEqual({
        ok: true,
        prompt: "refined",
        evaluation,
      });
      expect(mocks.generateText).toHaveBeenCalledTimes(2);
      const prompt = mocks.generateText.mock.calls[0][0].prompt;
      const evaluationPrompt = mocks.generateText.mock.calls[1][0].prompt;

      expect(prompt).toContain("notes.txt");
      expect(prompt).toContain("Use this as context.");
      expect(evaluationPrompt).toContain("Refined prompt:");
      expect(evaluationPrompt).toContain("refined");
    });
  });
});
