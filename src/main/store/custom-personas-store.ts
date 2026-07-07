import Store from "electron-store";
import { randomUUID } from "node:crypto";
import {
  createCustomPersonaInputSchema,
  customPersonaSchema,
  updateCustomPersonaInputSchema,
  type CreateCustomPersonaInput,
  type CustomPersona,
  type UpdateCustomPersonaInput,
  seedCustomPersonas,
} from "../../shared/domain/custom-persona.js";

const storeSchema = {
  customPersonas: {
    type: "array",
    default: [],
  },
  seedPersonasInitialized: {
    type: "boolean",
    default: false,
  },
} as const;

type StoreSchema = {
  customPersonas: CustomPersona[];
  seedPersonasInitialized: boolean;
};

const store = new Store<StoreSchema>({
  name: "custom-personas",
  schema: storeSchema,
});

function readCustomPersonas(): CustomPersona[] {
  ensureSeedPersonasInitialized();
  return customPersonaSchema.array().parse(store.get("customPersonas"));
}

function readStoredCustomPersonas(): CustomPersona[] {
  return customPersonaSchema.array().parse(store.get("customPersonas"));
}

function ensureSeedPersonasInitialized(): void {
  if (store.get("seedPersonasInitialized")) return;

  const personas = readStoredCustomPersonas();
  if (personas.length === 0) {
    store.set("customPersonas", customPersonaSchema.array().parse(seedCustomPersonas));
  }

  store.set("seedPersonasInitialized", true);
}

function writeCustomPersonas(personas: CustomPersona[]): void {
  store.set("customPersonas", customPersonaSchema.array().parse(personas));
}

export function listCustomPersonas(): CustomPersona[] {
  return readCustomPersonas();
}

export function createCustomPersona(input: CreateCustomPersonaInput): CustomPersona {
  const parsed = createCustomPersonaInputSchema.parse(input);
  const persona = customPersonaSchema.parse({
    id: randomUUID(),
    label: parsed.label,
    role: parsed.role,
  });

  writeCustomPersonas([...readCustomPersonas(), persona]);
  return persona;
}

export function deleteCustomPersona(id: string): boolean {
  const personas = readCustomPersonas();
  const next = personas.filter((persona) => persona.id !== id);
  if (next.length === personas.length) {
    return false;
  }

  writeCustomPersonas(next);
  return true;
}

export function updateCustomPersona(input: UpdateCustomPersonaInput): CustomPersona {
  const parsed = updateCustomPersonaInputSchema.parse(input);
  const personas = readCustomPersonas();
  const existing = personas.find((persona) => persona.id === parsed.id);

  if (!existing) {
    throw new Error("Custom persona not found.");
  }

  const updated = customPersonaSchema.parse({
    ...existing,
    label: parsed.label,
    role: parsed.role,
  });

  writeCustomPersonas(
    personas.map((persona) => (persona.id === parsed.id ? updated : persona)),
  );

  return updated;
}

export function findCustomPersona(id: string): CustomPersona | undefined {
  return readCustomPersonas().find((persona) => persona.id === id);
}
