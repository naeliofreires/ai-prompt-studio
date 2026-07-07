import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCustomPersona,
  deleteCustomPersona,
  findCustomPersona,
  listCustomPersonas,
  updateCustomPersona,
} from "../apps/promptizer/main/store/custom-personas-store";
import { resolvePersonaContext } from "../apps/promptizer/main/utils/resolve-persona-context";
import { buildRefinementSystemPrompt } from "../apps/promptizer/main/utils/build-refinement-system-prompt";
import { resetElectronStoreMocks } from "./helpers/electron-store";

vi.mock("node:crypto", async () => {
  const { mockNodeCrypto } = await import("./helpers/electron-store");
  return mockNodeCrypto();
});

vi.mock("electron-store", async () => {
  const { mockElectronStore } = await import("./helpers/electron-store");
  return mockElectronStore("customPersonas");
});

describe("custom-personas-store", () => {
  beforeEach(() => {
    resetElectronStoreMocks("customPersonas");
  });

  it("seeds exactly the two editable MVP personas once", () => {
    expect(listCustomPersonas()).toEqual([
      expect.objectContaining({ label: "Frontend Specialist" }),
      expect.objectContaining({ label: "Backend Specialist" }),
    ]);
    expect(listCustomPersonas()).toHaveLength(2);
  });

  it("does not recreate deleted seed personas", () => {
    const [frontend] = listCustomPersonas();

    expect(deleteCustomPersona(frontend.id)).toBe(true);
    expect(listCustomPersonas()).toEqual([
      expect.objectContaining({ label: "Backend Specialist" }),
    ]);
  });

  it("updates seeded personas through the custom persona CRUD path", () => {
    const [frontend] = listCustomPersonas();

    expect(
      updateCustomPersona({
        id: frontend.id,
        label: "Frontend Lead",
        role: "Lead frontend implementation.",
      }),
    ).toEqual({
      id: frontend.id,
      label: "Frontend Lead",
      role: "Lead frontend implementation.",
    });
    expect(findCustomPersona(frontend.id)).toEqual(
      expect.objectContaining({ label: "Frontend Lead" }),
    );
  });

  it("creates, lists, finds, and deletes custom personas", () => {
    const created = createCustomPersona({
      label: " Architect ",
      role: " Design clear module boundaries. ",
    });

    expect(created).toEqual({
      id: "550e8400-e29b-41d4-a716-446655440000",
      label: "Architect",
      role: "Design clear module boundaries.",
    });
    expect(listCustomPersonas()).toEqual([
      expect.objectContaining({ label: "Frontend Specialist" }),
      expect.objectContaining({ label: "Backend Specialist" }),
      created,
    ]);
    expect(findCustomPersona(created.id)).toEqual(created);

    expect(deleteCustomPersona(created.id)).toBe(true);
    expect(listCustomPersonas()).not.toContainEqual(created);
    expect(findCustomPersona(created.id)).toBeUndefined();
  });

  it("returns false when deleting an unknown custom persona", () => {
    const created = createCustomPersona({
      label: "Reviewer",
      role: "Review prompts carefully.",
    });

    expect(deleteCustomPersona("550e8400-e29b-41d4-a716-446655440001")).toBe(false);
    expect(listCustomPersonas()).toContainEqual(created);
  });
});

describe("resolvePersonaContext", () => {
  beforeEach(() => {
    resetElectronStoreMocks("customPersonas");
  });

  it("resolves the current editable persona context", () => {
    const [seeded] = listCustomPersonas();
    updateCustomPersona({
      id: seeded.id,
      label: "Frontend Lead",
      role: "Use the edited frontend description.",
    });

    expect(resolvePersonaContext(seeded.id)).toBe(
      "Frontend Lead\nUse the edited frontend description.",
    );
  });

  it("does not resolve legacy built-in persona ids", () => {
    expect(resolvePersonaContext("frontend")).toBeNull();
  });

  it("returns null for missing personas", () => {
    expect(resolvePersonaContext("550e8400-e29b-41d4-a716-446655440099")).toBeNull();
  });

  it("passes edited editable persona descriptions into the system prompt context", () => {
    const [seeded] = listCustomPersonas();
    updateCustomPersona({
      id: seeded.id,
      label: "Backend Platform Lead",
      role: "Prioritize durable API contracts and database boundaries.",
    });

    const personaContext = resolvePersonaContext(seeded.id);
    expect(personaContext).toBe(
      "Backend Platform Lead\nPrioritize durable API contracts and database boundaries.",
    );

    const systemPrompt = buildRefinementSystemPrompt({ personaContext: personaContext ?? "" });
    expect(systemPrompt).toContain("Persona context:");
    expect(systemPrompt).toContain("Backend Platform Lead");
    expect(systemPrompt).toContain("Prioritize durable API contracts and database boundaries.");
  });
});
