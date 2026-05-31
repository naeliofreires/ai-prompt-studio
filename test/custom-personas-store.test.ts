import { beforeEach, describe, expect, it, vi } from "vitest";
import { PERSONAS } from "../src/shared";
import {
  createCustomPersona,
  deleteCustomPersona,
  findCustomPersona,
  listCustomPersonas,
} from "../src/main/store/custom-personas-store";
import { resolvePersonaContext } from "../src/main/utils/resolve-persona-context";

const mocks = vi.hoisted(() => ({
  randomUUID: vi.fn(() => "550e8400-e29b-41d4-a716-446655440000"),
  values: new Map<string, unknown>(),
}));

vi.mock("node:crypto", () => ({
  default: {
    randomUUID: mocks.randomUUID,
  },
  randomUUID: mocks.randomUUID,
}));

vi.mock("electron-store", () => ({
  default: class MockStore {
    constructor() {
      if (!mocks.values.has("customPersonas")) {
        mocks.values.set("customPersonas", []);
      }
    }

    get(key: string): unknown {
      return mocks.values.get(key);
    }

    set(key: string, value: unknown): void {
      mocks.values.set(key, value);
    }
  },
}));

describe("custom-personas-store", () => {
  beforeEach(() => {
    mocks.values.clear();
    mocks.values.set("customPersonas", []);
    mocks.randomUUID.mockReturnValue("550e8400-e29b-41d4-a716-446655440000");
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
    mocks.values.clear();
    mocks.values.set("customPersonas", []);
    mocks.randomUUID.mockReturnValue("550e8400-e29b-41d4-a716-446655440000");
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
