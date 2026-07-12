import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  promptGenerationIpcChannels,
  type GeneratePromptPayload,
} from "../../../src/features/prompt-generation/contract/ipc";
import { personaIpcChannels } from "../../../src/features/personas/contract/ipc";
import { providerIpcChannels } from "../../../src/features/providers/contract/ipc";

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
    await import("../../../src/main/preload");

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

    await api.promptGeneration.generatePrompt(generatePayload);
    expect(mocks.invoke).toHaveBeenLastCalledWith(
      promptGenerationIpcChannels.generatePrompt,
      generatePayload,
    );

    await api.personas.listCustomPersonas();
    expect(mocks.invoke).toHaveBeenLastCalledWith(personaIpcChannels.listCustomPersonas);

    await api.personas.createCustomPersona({
      label: "Reviewer",
      role: "Review prompts carefully.",
    });
    expect(mocks.invoke).toHaveBeenLastCalledWith(personaIpcChannels.createCustomPersona, {
      label: "Reviewer",
      role: "Review prompts carefully.",
    });

    await api.personas.updateCustomPersona({
      id: "550e8400-e29b-41d4-a716-446655440000",
      label: "Reviewer",
      role: "Review prompts carefully.",
    });
    expect(mocks.invoke).toHaveBeenLastCalledWith(personaIpcChannels.updateCustomPersona, {
      id: "550e8400-e29b-41d4-a716-446655440000",
      label: "Reviewer",
      role: "Review prompts carefully.",
    });

    await api.personas.deleteCustomPersona({ id: "550e8400-e29b-41d4-a716-446655440000" });
    expect(mocks.invoke).toHaveBeenLastCalledWith(personaIpcChannels.deleteCustomPersona, {
      id: "550e8400-e29b-41d4-a716-446655440000",
    });

    await api.providers.listConfiguredApiKeys();
    expect(mocks.invoke).toHaveBeenLastCalledWith(providerIpcChannels.listConfiguredApiKeys);

    await api.providers.setApiKeys({ gemini: "AIzaSy-test" });
    expect(mocks.invoke).toHaveBeenLastCalledWith(providerIpcChannels.setApiKeys, {
      gemini: "AIzaSy-test",
    });

    await api.providers.clearAllApiKeys();
    expect(mocks.invoke).toHaveBeenLastCalledWith(providerIpcChannels.clearAllApiKeys);
  });
});
