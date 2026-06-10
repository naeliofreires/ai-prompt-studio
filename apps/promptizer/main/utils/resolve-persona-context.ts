import { PERSONAS } from "../../shared/domain/persona.js";
import { findCustomPersona } from "../store/custom-personas-store.js";

export function resolvePersonaContext(personaId: string): string | null {
  const builtin = PERSONAS.find((persona) => persona.id === personaId);
  if (builtin) {
    return `${builtin.label}\n${builtin.role}`;
  }

  const custom = findCustomPersona(personaId);
  if (custom) {
    return `${custom.label}\n${custom.role}`;
  }

  return null;
}
