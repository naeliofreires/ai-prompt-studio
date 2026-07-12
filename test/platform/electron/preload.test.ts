import { beforeEach, describe, expect, it, vi } from "vitest";
import { promptGenerationIpcChannels, type GeneratePromptPayload } from "../../../src/features/prompt-generation/contract/ipc";
import { providerIpcChannels } from "../../../src/features/providers/contract/ipc";

const mocks = vi.hoisted(() => {
  let exposedApi: any = null;
  return {
    exposeInMainWorld: vi.fn((_key: string, api: any) => { exposedApi = api; }),
    exposedApi: () => exposedApi,
    invoke: vi.fn(),
  };
});

vi.mock("electron", () => ({
  contextBridge: { exposeInMainWorld: mocks.exposeInMainWorld },
  ipcRenderer: { invoke: mocks.invoke },
}));

describe("preload bridge", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.invoke.mockReset().mockResolvedValue({ ok: true, prompt: "refined" });
  });

  it("exposes generation and provider APIs without deprecated CRUD", async () => {
    await import("../../../src/main/preload");
    const api = mocks.exposedApi();
    const payload: GeneratePromptPayload = { rawInput: "Refine this prompt.", providerId: "gemini", model: "gemini-2.5-pro" };

    await api.promptGeneration.generatePrompt(payload);
    expect(mocks.invoke).toHaveBeenLastCalledWith(promptGenerationIpcChannels.generatePrompt, payload);
    expect(Object.keys(api).sort()).toEqual(["promptGeneration", "providers"]);
    await api.providers.clearAllApiKeys();
    expect(mocks.invoke).toHaveBeenLastCalledWith(providerIpcChannels.clearAllApiKeys);
  });
});
