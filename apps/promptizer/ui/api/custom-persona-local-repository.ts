import {
  createCustomPersonaInputSchema,
  type CreateCustomPersonaInput,
  type CreateCustomPersonaResult,
  type DeleteCustomPersonaInput,
  type DeleteCustomPersonaResult,
  type ListCustomPersonasResult,
} from "../../shared";
import { customPersonaSchema } from "../../shared/domain/custom-persona";
import { getBrowserStorage } from "../utils/browser-storage";

export const CUSTOM_PERSONAS_STORAGE_KEY = "promptizer.custom-personas";

export function readLocalCustomPersonas(): ListCustomPersonasResult["personas"] {
  const storage = getBrowserStorage();
  if (!storage) return [];

  const raw = storage.getItem(CUSTOM_PERSONAS_STORAGE_KEY);
  if (!raw) return [];

  return customPersonaSchema.array().parse(JSON.parse(raw));
}

function writeLocalCustomPersonas(personas: ListCustomPersonasResult["personas"]): void {
  const storage = getBrowserStorage();
  if (!storage) return;

  storage.setItem(
    CUSTOM_PERSONAS_STORAGE_KEY,
    JSON.stringify(customPersonaSchema.array().parse(personas)),
  );
}

export function listLocalCustomPersonas(): ListCustomPersonasResult {
  return { personas: readLocalCustomPersonas() };
}

export function createLocalCustomPersona(
  input: CreateCustomPersonaInput,
): CreateCustomPersonaResult {
  const parsed = createCustomPersonaInputSchema.parse(input);
  const persona = customPersonaSchema.parse({
    id: crypto.randomUUID(),
    label: parsed.label,
    role: parsed.role,
  });

  writeLocalCustomPersonas([...readLocalCustomPersonas(), persona]);
  return persona;
}

export function deleteLocalCustomPersona(
  input: DeleteCustomPersonaInput,
): DeleteCustomPersonaResult {
  const personas = readLocalCustomPersonas();
  const next = personas.filter((persona) => persona.id !== input.id);
  const deleted = next.length < personas.length;

  if (deleted) {
    writeLocalCustomPersonas(next);
  }

  return { deleted };
}
