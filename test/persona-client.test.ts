import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CUSTOM_PERSONAS_STORAGE_KEY,
  readLocalCustomPersonas,
} from "../apps/promptizer/ui/api/custom-persona-local-repository";
import { personaClient } from "../apps/promptizer/ui/api/persona-client";
import { selectPersonaClientMode } from "../apps/promptizer/ui/api/persona-client-mode-policy";
import { setAiPromptStudioBridge } from "./helpers/ai-prompt-studio-bridge";

describe("selectPersonaClientMode", () => {
  it.each([
    [{ hasPromptBridge: true, hasCustomPersonaBridge: true }, "bridge"],
    [{ hasPromptBridge: true, hasCustomPersonaBridge: false }, "unavailable"],
    [{ hasPromptBridge: false, hasCustomPersonaBridge: false }, "local"],
  ] as const)("selects %s as %s", (input, mode) => {
    expect(selectPersonaClientMode(input)).toBe(mode);
  });
});

describe("personaClient", () => {
  beforeEach(() => {
    window.localStorage.clear();
    setAiPromptStudioBridge(undefined);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses local storage when the Electron bridge is absent", async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("550e8400-e29b-41d4-a716-446655440000");

    const created = await personaClient.createCustomPersona({
      label: "Architect",
      role: "Design clear module boundaries.",
    });
    const updated = await personaClient.updateCustomPersona({
      id: created.id,
      label: "Architect",
      role: "Design explicit module boundaries.",
    });
    const listed = await personaClient.listCustomPersonas();
    const deleted = await personaClient.deleteCustomPersona({ id: created.id });

    expect(created).toEqual({
      id: "550e8400-e29b-41d4-a716-446655440000",
      label: "Architect",
      role: "Design clear module boundaries.",
    });
    expect(updated).toEqual({
      id: "550e8400-e29b-41d4-a716-446655440000",
      label: "Architect",
      role: "Design explicit module boundaries.",
    });
    expect(listed.personas).toEqual([
      expect.objectContaining({ label: "Frontend Specialist" }),
      expect.objectContaining({ label: "Backend Specialist" }),
      updated,
    ]);
    expect(deleted).toEqual({ deleted: true });
    expect(readLocalCustomPersonas()).toEqual([
      expect.objectContaining({ label: "Frontend Specialist" }),
      expect.objectContaining({ label: "Backend Specialist" }),
    ]);
  });

  it("does not recreate deleted local seed personas", async () => {
    const listed = await personaClient.listCustomPersonas();
    const frontend = listed.personas.find((persona) => persona.label === "Frontend Specialist");

    expect(frontend).toBeDefined();
    await expect(personaClient.deleteCustomPersona({ id: frontend!.id })).resolves.toEqual({
      deleted: true,
    });
    await expect(personaClient.listCustomPersonas()).resolves.toEqual({
      personas: [expect.objectContaining({ label: "Backend Specialist" })],
    });
  });

  it("delegates to IPC when the custom persona bridge is available", async () => {
    const bridge = {
      generatePrompt: vi.fn(),
      listCustomPersonas: vi.fn().mockResolvedValue({ personas: [] }),
      createCustomPersona: vi.fn().mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        label: "Reviewer",
        role: "Review carefully.",
      }),
      updateCustomPersona: vi.fn().mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        label: "Reviewer",
        role: "Review carefully.",
      }),
      deleteCustomPersona: vi.fn().mockResolvedValue({ deleted: true }),
      setApiKeys: vi.fn(),
      clearAllApiKeys: vi.fn(),
    };
    setAiPromptStudioBridge(bridge);

    await personaClient.listCustomPersonas();
    await personaClient.createCustomPersona({ label: "Reviewer", role: "Review carefully." });
    await personaClient.updateCustomPersona({
      id: "550e8400-e29b-41d4-a716-446655440000",
      label: "Reviewer",
      role: "Review carefully.",
    });
    await personaClient.deleteCustomPersona({ id: "550e8400-e29b-41d4-a716-446655440000" });

    expect(bridge.listCustomPersonas).toHaveBeenCalledTimes(1);
    expect(bridge.createCustomPersona).toHaveBeenCalledWith({
      label: "Reviewer",
      role: "Review carefully.",
    });
    expect(bridge.updateCustomPersona).toHaveBeenCalledWith({
      id: "550e8400-e29b-41d4-a716-446655440000",
      label: "Reviewer",
      role: "Review carefully.",
    });
    expect(bridge.deleteCustomPersona).toHaveBeenCalledWith({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(window.localStorage.getItem(CUSTOM_PERSONAS_STORAGE_KEY)).toBeNull();
  });

  it("reports unavailable custom personas when only prompt generation is bridged", async () => {
    setAiPromptStudioBridge({ generatePrompt: vi.fn() });

    await expect(personaClient.listCustomPersonas()).rejects.toThrow(/load custom personas/i);
    await expect(
      personaClient.createCustomPersona({ label: "Reviewer", role: "Review carefully." }),
    ).rejects.toThrow(/custom persona bridge/i);
    await expect(
      personaClient.updateCustomPersona({
        id: "550e8400-e29b-41d4-a716-446655440000",
        label: "Reviewer",
        role: "Review carefully.",
      }),
    ).rejects.toThrow(/custom persona bridge/i);
  });

  it("uses no-op local storage when window is unavailable", async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("550e8400-e29b-41d4-a716-446655440000");
    vi.stubGlobal("window", undefined);

    await expect(personaClient.listCustomPersonas()).resolves.toEqual({ personas: [] });
    await expect(
      personaClient.createCustomPersona({
        label: "Architect",
        role: "Design clear module boundaries.",
      }),
    ).resolves.toEqual({
      id: "550e8400-e29b-41d4-a716-446655440000",
      label: "Architect",
      role: "Design clear module boundaries.",
    });
    await expect(
      personaClient.deleteCustomPersona({ id: "550e8400-e29b-41d4-a716-446655440000" }),
    ).resolves.toEqual({ deleted: false });
    expect(() =>
      personaClient.updateCustomPersona({
        id: "550e8400-e29b-41d4-a716-446655440000",
        label: "Architect",
        role: "Design clear module boundaries.",
      }),
    ).toThrow(/custom persona not found/i);
  });
});
