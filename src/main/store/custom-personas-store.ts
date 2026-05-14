import Store from "electron-store";
import { randomUUID } from "node:crypto";
import {
  createCustomPersonaInputSchema,
  customPersonaSchema,
  type CreateCustomPersonaInput,
  type CustomPersona,
} from "../../shared/domain/custom-persona.js";

const storeSchema = {
  customPersonas: {
    type: "array",
    default: [],
  },
} as const;

type StoreSchema = {
  customPersonas: CustomPersona[];
};

const store = new Store<StoreSchema>({
  name: "custom-personas",
  schema: storeSchema,
});

function readCustomPersonas(): CustomPersona[] {
  return customPersonaSchema.array().parse(store.get("customPersonas"));
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

export function findCustomPersona(id: string): CustomPersona | undefined {
  return readCustomPersonas().find((persona) => persona.id === id);
}
