import { useState } from "react";
import { PERSONAS } from "../../shared";

export interface Role {
  id: string;
  title: string;
  description: string;
}

const DEFAULT_ROLES: Role[] = PERSONAS.map((persona) => ({
  id: persona.id,
  title: persona.label,
  description: persona.role,
}));

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);

  const addRole = (title: string, description: string) => {
    setRoles((prev) => [...prev, { id: crypto.randomUUID(), title, description }]);
  };

  const deleteRole = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  return { roles, addRole, deleteRole };
}
