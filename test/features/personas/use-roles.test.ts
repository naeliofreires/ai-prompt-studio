import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRoles } from "../../../src/features/personas/ui/useRoles";

const mocks = vi.hoisted(() => ({
  createCustomPersona: vi.fn(),
  deleteCustomPersona: vi.fn(),
  listCustomPersonas: vi.fn(),
  updateCustomPersona: vi.fn(),
}));

vi.mock("../../../src/features/personas/ui/persona-client", () => ({
  personaClient: {
    createCustomPersona: mocks.createCustomPersona,
    deleteCustomPersona: mocks.deleteCustomPersona,
    listCustomPersonas: mocks.listCustomPersonas,
    updateCustomPersona: mocks.updateCustomPersona,
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

  it("loads editable personas from the persona client", async () => {
    mocks.listCustomPersonas.mockResolvedValue({ personas: [customPersona] });

    const { result } = renderHook(() => useRoles());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("");
    expect(result.current.roles).toEqual([
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
    expect(result.current.roles).toEqual([]);
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

  it("updates roles through the custom persona client", async () => {
    mocks.listCustomPersonas.mockResolvedValue({ personas: [customPersona] });
    mocks.updateCustomPersona.mockResolvedValue({
      id: customPersona.id,
      label: "Frontend Lead",
      role: "Lead frontend implementation.",
    });
    const { result } = renderHook(() => useRoles());

    await waitFor(() => {
      expect(result.current.roles).toContainEqual(expect.objectContaining({ id: customPersona.id }));
    });

    await act(async () => {
      await result.current.updateRole(customPersona.id, {
        title: " Frontend Lead ",
        description: " Lead frontend implementation. ",
      });
    });

    expect(mocks.updateCustomPersona).toHaveBeenCalledWith({
      id: customPersona.id,
      label: "Frontend Lead",
      role: "Lead frontend implementation.",
    });
    expect(result.current.roles).toContainEqual({
      id: customPersona.id,
      title: "Frontend Lead",
      description: "Lead frontend implementation.",
      source: "custom",
    });
  });
});
