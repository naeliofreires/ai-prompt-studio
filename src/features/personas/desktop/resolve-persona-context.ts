import { findCustomPersona } from "./custom-personas-store.js";

export function resolvePersonaContext(personaId: string): string | null {
  const custom = findCustomPersona(personaId);
  if (custom) {
    return `${custom.label}\n${custom.role}`;
  }

  return null;
}
