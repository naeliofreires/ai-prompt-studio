import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CUSTOM_PERSONAS_STORAGE_KEY,
  readLocalCustomPersonas,
} from "../src/ui/api/custom-persona-local-repository";
import { personaClient } from "../src/ui/api/persona-client";

function setBridge(bridge: Partial<Window["aiPromptStudio"]> | undefined): void {
  Object.defineProperty(window, "aiPromptStudio", {
    value: bridge,
    configurable: true,
    writable: true,
  });
}

describe("personaClient", () => {
  beforeEach(() => {
    window.localStorage.clear();
    setBridge(undefined);
    vi.restoreAllMocks();
  });

  it("uses local storage when the Electron bridge is absent", async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("550e8400-e29b-41d4-a716-446655440000");

    const created = await personaClient.createCustomPersona({
      label: "Architect",
      role: "Design clear module boundaries.",
    });
    const listed = await personaClient.listCustomPersonas();
    const deleted = await personaClient.deleteCustomPersona({ id: created.id });

    expect(created).toEqual({
      id: "550e8400-e29b-41d4-a716-446655440000",
      label: "Architect",
      role: "Design clear module boundaries.",
    });
    expect(listed.personas).toEqual([created]);
    expect(deleted).toEqual({ deleted: true });
    expect(readLocalCustomPersonas()).toEqual([]);
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
      deleteCustomPersona: vi.fn().mockResolvedValue({ deleted: true }),
      setApiKeys: vi.fn(),
      clearAllApiKeys: vi.fn(),
    } satisfies Window["aiPromptStudio"];
    setBridge(bridge);

    await personaClient.listCustomPersonas();
    await personaClient.createCustomPersona({ label: "Reviewer", role: "Review carefully." });
    await personaClient.deleteCustomPersona({ id: "550e8400-e29b-41d4-a716-446655440000" });

    expect(bridge.listCustomPersonas).toHaveBeenCalledTimes(1);
    expect(bridge.createCustomPersona).toHaveBeenCalledWith({
      label: "Reviewer",
      role: "Review carefully.",
    });
    expect(bridge.deleteCustomPersona).toHaveBeenCalledWith({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(window.localStorage.getItem(CUSTOM_PERSONAS_STORAGE_KEY)).toBeNull();
  });

  it("reports unavailable custom personas when only prompt generation is bridged", async () => {
    setBridge({ generatePrompt: vi.fn() });

    await expect(personaClient.listCustomPersonas()).rejects.toThrow(/load custom personas/i);
    await expect(
      personaClient.createCustomPersona({ label: "Reviewer", role: "Review carefully." }),
    ).rejects.toThrow(/custom persona bridge/i);
  });
});
