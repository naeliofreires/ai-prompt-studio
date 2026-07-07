import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../../shared/utils/error";
import { personaClient } from "../api/persona-client";
import type { Role } from "../types/role";

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCustomPersonas() {
      try {
        const result = await personaClient.listCustomPersonas();
        if (cancelled) return;

        const customRoles: Role[] = result.personas.map((persona) => ({
          id: persona.id,
          title: persona.label,
          description: persona.role,
          source: "custom",
        }));

        setRoles(customRoles);
        setError("");
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Could not load custom personas."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCustomPersonas();

    return () => {
      cancelled = true;
    };
  }, []);

  const addRole = useCallback(async (title: string, description: string) => {
    const persona = await personaClient.createCustomPersona({
      label: title.trim(),
      role: description.trim(),
    });

    const role: Role = {
      id: persona.id,
      title: persona.label,
      description: persona.role,
      source: "custom",
    };

    setRoles((prev) => [...prev, role]);
    return role;
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    const result = await personaClient.deleteCustomPersona({ id });
    if (!result.deleted) {
      return false;
    }

    setRoles((prev) => prev.filter((role) => role.id !== id));
    return true;
  }, []);

  const updateRole = useCallback(async (id: string, patch: { title: string; description: string }) => {
    const trimmedTitle = patch.title.trim();
    const trimmedDescription = patch.description.trim();
    const persona = await personaClient.updateCustomPersona({
      id,
      label: trimmedTitle,
      role: trimmedDescription,
    });

    setRoles((prev) =>
      prev.map((role) =>
        role.id === id
          ? {
              ...role,
              title: persona.label,
              description: persona.role,
            }
          : role,
      ),
    );
  }, []);

  return { roles, addRole, deleteRole, updateRole, isLoading, error };
}
