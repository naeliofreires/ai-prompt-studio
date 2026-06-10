import { beforeEach, describe, expect, it, vi } from "vitest";
import { PERSONAS } from "../apps/promptizer/shared";
import {
  createCustomPersona,
  deleteCustomPersona,
  findCustomPersona,
  listCustomPersonas,
} from "../apps/promptizer/main/store/custom-personas-store";
import { resolvePersonaContext } from "../apps/promptizer/main/utils/resolve-persona-context";
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
    expect(listCustomPersonas()).toEqual([created]);
    expect(findCustomPersona(created.id)).toEqual(created);

    expect(deleteCustomPersona(created.id)).toBe(true);
    expect(listCustomPersonas()).toEqual([]);
    expect(findCustomPersona(created.id)).toBeUndefined();
  });

  it("returns false when deleting an unknown custom persona", () => {
    const created = createCustomPersona({
      label: "Reviewer",
      role: "Review prompts carefully.",
    });

    expect(deleteCustomPersona("550e8400-e29b-41d4-a716-446655440001")).toBe(false);
    expect(listCustomPersonas()).toEqual([created]);
  });
});

describe("resolvePersonaContext", () => {
  beforeEach(() => {
    resetElectronStoreMocks("customPersonas");
  });

  it("resolves built-in persona context", () => {
    const builtin = PERSONAS[0];

    expect(resolvePersonaContext(builtin.id)).toBe(`${builtin.label}\n${builtin.role}`);
  });

  it("resolves custom persona context", () => {
    const custom = createCustomPersona({
      label: "Architect",
      role: "Design clear module boundaries.",
    });

    expect(resolvePersonaContext(custom.id)).toBe("Architect\nDesign clear module boundaries.");
  });

  it("returns null for missing personas", () => {
    expect(resolvePersonaContext("550e8400-e29b-41d4-a716-446655440099")).toBeNull();
  });
});
