import { beforeEach, describe, expect, it, vi } from "vitest";
import { ipcChannels, type GeneratePromptPayload } from "../apps/promptizer/shared";

const mocks = vi.hoisted(() => {
  let exposedApi: any = null;

  return {
    exposeInMainWorld: vi.fn((_key: string, api: any) => {
      exposedApi = api;
    }),
    exposedApi: () => exposedApi,
    resetExposedApi: () => {
      exposedApi = null;
    },
    invoke: vi.fn(),
  };
});

vi.mock("electron", () => ({
  contextBridge: {
    exposeInMainWorld: mocks.exposeInMainWorld,
  },
  ipcRenderer: {
    invoke: mocks.invoke,
  },
}));

describe("preload bridge", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.resetExposedApi();
    mocks.exposeInMainWorld.mockClear();
    mocks.invoke.mockReset().mockResolvedValue({ ok: true, prompt: "refined" });
  });

  it("exposes the aiPromptStudio API and maps methods to IPC channels", async () => {
    await import("../apps/promptizer/main/preload");

    expect(mocks.exposeInMainWorld).toHaveBeenCalledWith(
      "aiPromptStudio",
      expect.any(Object),
    );

    const api = mocks.exposedApi();
    expect(api).not.toBeNull();
    if (!api) throw new Error("aiPromptStudio API was not exposed");

    const generatePayload: GeneratePromptPayload = {
      rawInput: "Refine this prompt.",
      personaId: "frontend",
      providerId: "gemini",
      model: "gemini-2.5-pro",
    };

    await api.generatePrompt(generatePayload);
    expect(mocks.invoke).toHaveBeenLastCalledWith(ipcChannels.generatePrompt, generatePayload);

    await api.listCustomPersonas();
    expect(mocks.invoke).toHaveBeenLastCalledWith(ipcChannels.listCustomPersonas);

    await api.createCustomPersona({
      label: "Reviewer",
      role: "Review prompts carefully.",
    });
    expect(mocks.invoke).toHaveBeenLastCalledWith(ipcChannels.createCustomPersona, {
      label: "Reviewer",
      role: "Review prompts carefully.",
    });

    await api.updateCustomPersona({
      id: "550e8400-e29b-41d4-a716-446655440000",
      label: "Reviewer",
      role: "Review prompts carefully.",
    });
    expect(mocks.invoke).toHaveBeenLastCalledWith(ipcChannels.updateCustomPersona, {
      id: "550e8400-e29b-41d4-a716-446655440000",
      label: "Reviewer",
      role: "Review prompts carefully.",
    });

    await api.deleteCustomPersona({ id: "550e8400-e29b-41d4-a716-446655440000" });
    expect(mocks.invoke).toHaveBeenLastCalledWith(ipcChannels.deleteCustomPersona, {
      id: "550e8400-e29b-41d4-a716-446655440000",
    });

    await api.listConfiguredApiKeys();
    expect(mocks.invoke).toHaveBeenLastCalledWith(ipcChannels.listConfiguredApiKeys);

    await api.setApiKeys({ gemini: "AIzaSy-test" });
    expect(mocks.invoke).toHaveBeenLastCalledWith(ipcChannels.setApiKeys, {
      gemini: "AIzaSy-test",
    });

    await api.clearAllApiKeys();
    expect(mocks.invoke).toHaveBeenLastCalledWith(ipcChannels.clearAllApiKeys);
  });
});
