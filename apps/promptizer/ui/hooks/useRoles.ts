import { useCallback, useEffect, useState } from "react";
import { PERSONAS } from "../../shared";
import { getErrorMessage } from "../../shared/utils/error";
import { personaClient } from "../api/persona-client";
import type { Role } from "../types/role";

const BUILTIN_ROLES: Role[] = PERSONAS.map((persona) => ({
  id: persona.id,
  title: persona.label,
  description: persona.role,
  source: "builtin",
}));

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>(BUILTIN_ROLES);
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

        setRoles([...BUILTIN_ROLES, ...customRoles]);
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

  return { roles, addRole, deleteRole, isLoading, error };
}
