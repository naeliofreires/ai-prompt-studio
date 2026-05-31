import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PERSONAS } from "../src/shared";
import { useRoles } from "../src/ui/hooks/useRoles";

const mocks = vi.hoisted(() => ({
  createCustomPersona: vi.fn(),
  deleteCustomPersona: vi.fn(),
  listCustomPersonas: vi.fn(),
}));

vi.mock("../src/ui/api/persona-client", () => ({
  personaClient: {
    createCustomPersona: mocks.createCustomPersona,
    deleteCustomPersona: mocks.deleteCustomPersona,
    listCustomPersonas: mocks.listCustomPersonas,
  },
}));

const customPersona = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  label: "Architect",
  role: "Design clear module boundaries.",
};

describe("useRoles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listCustomPersonas.mockResolvedValue({ personas: [] });
  });

  it("loads built-in roles plus custom personas", async () => {
    mocks.listCustomPersonas.mockResolvedValue({ personas: [customPersona] });

    const { result } = renderHook(() => useRoles());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("");
    expect(result.current.roles).toEqual([
      ...PERSONAS.map((persona) => ({
        id: persona.id,
        title: persona.label,
        description: persona.role,
        source: "builtin",
      })),
      {
        id: customPersona.id,
        title: customPersona.label,
        description: customPersona.role,
        source: "custom",
      },
    ]);
  });

  it("exposes a load error when custom personas cannot be listed", async () => {
    mocks.listCustomPersonas.mockRejectedValue(new Error("Custom persona bridge unavailable."));

    const { result } = renderHook(() => useRoles());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Custom persona bridge unavailable.");
    expect(result.current.roles).toHaveLength(PERSONAS.length);
  });

  it("adds created custom roles to the role list", async () => {
    mocks.createCustomPersona.mockResolvedValue(customPersona);
    const { result } = renderHook(() => useRoles());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let createdRole: Awaited<ReturnType<typeof result.current.addRole>> | undefined;
    await act(async () => {
      createdRole = await result.current.addRole(" Architect ", " Design clear module boundaries. ");
    });

    expect(mocks.createCustomPersona).toHaveBeenCalledWith({
      label: "Architect",
      role: "Design clear module boundaries.",
    });
    expect(createdRole).toEqual({
      id: customPersona.id,
      title: customPersona.label,
      description: customPersona.role,
      source: "custom",
    });
    expect(result.current.roles).toContainEqual(createdRole);
  });

  it("removes a custom role only when deletion succeeds", async () => {
    mocks.listCustomPersonas.mockResolvedValue({ personas: [customPersona] });
    const { result } = renderHook(() => useRoles());

    await waitFor(() => {
      expect(result.current.roles).toContainEqual(
        expect.objectContaining({ id: customPersona.id }),
      );
    });

    mocks.deleteCustomPersona.mockResolvedValueOnce({ deleted: false });
    let deleted = true;
    await act(async () => {
      deleted = await result.current.deleteRole(customPersona.id);
    });

    expect(deleted).toBe(false);
    expect(result.current.roles).toContainEqual(expect.objectContaining({ id: customPersona.id }));

    mocks.deleteCustomPersona.mockResolvedValueOnce({ deleted: true });
    await act(async () => {
      deleted = await result.current.deleteRole(customPersona.id);
    });

    expect(deleted).toBe(true);
    expect(result.current.roles).not.toContainEqual(
      expect.objectContaining({ id: customPersona.id }),
    );
  });
});
