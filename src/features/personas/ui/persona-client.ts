import {
  createCustomPersonaInputSchema,
  type CreateCustomPersonaInput,
  type CreateCustomPersonaResult,
  type DeleteCustomPersonaInput,
  type DeleteCustomPersonaResult,
  type ListCustomPersonasResult,
  updateCustomPersonaInputSchema,
  type UpdateCustomPersonaInput,
  type UpdateCustomPersonaResult,
} from "../contract/ipc";
import { customPersonaSchema, seedCustomPersonas } from "../contract/custom-persona";
import {
  getAiPromptStudioBridge,
  hasBridgeMethod,
  type AiPromptStudioBridge,
} from "../../../platform/renderer/api/electron-bridge";
import { getBrowserStorage } from "../../../platform/renderer/storage/browser-storage";
import { selectPersonaClientMode } from "./persona-client-mode-policy";

export const CUSTOM_PERSONAS_STORAGE_KEY = "promptizer.custom-personas";
export const CUSTOM_PERSONAS_SEED_MARKER_KEY = "promptizer.custom-personas.seeded";

function ensureLocalSeedPersonasInitialized(): void {
  const storage = getBrowserStorage();
  if (!storage) return;

  if (storage.getItem(CUSTOM_PERSONAS_SEED_MARKER_KEY) === "true") return;

  const raw = storage.getItem(CUSTOM_PERSONAS_STORAGE_KEY);
  const personas = raw ? customPersonaSchema.array().parse(JSON.parse(raw)) : [];
  if (personas.length === 0) {
    storage.setItem(CUSTOM_PERSONAS_STORAGE_KEY, JSON.stringify(seedCustomPersonas));
  }

  storage.setItem(CUSTOM_PERSONAS_SEED_MARKER_KEY, "true");
}

export function readLocalCustomPersonas(): ListCustomPersonasResult["personas"] {
  const storage = getBrowserStorage();
  if (!storage) return [];

  ensureLocalSeedPersonasInitialized();

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

function createLocalCustomPersona(input: CreateCustomPersonaInput): CreateCustomPersonaResult {
  const parsed = createCustomPersonaInputSchema.parse(input);
  const persona = customPersonaSchema.parse({
    id: crypto.randomUUID(),
    label: parsed.label,
    role: parsed.role,
  });

  writeLocalCustomPersonas([...readLocalCustomPersonas(), persona]);
  return persona;
}

function deleteLocalCustomPersona(input: DeleteCustomPersonaInput): DeleteCustomPersonaResult {
  const personas = readLocalCustomPersonas();
  const next = personas.filter((persona) => persona.id !== input.id);
  const deleted = next.length < personas.length;

  if (deleted) {
    writeLocalCustomPersonas(next);
  }

  return { deleted };
}

function updateLocalCustomPersona(input: UpdateCustomPersonaInput): UpdateCustomPersonaResult {
  const parsed = updateCustomPersonaInputSchema.parse(input);
  const personas = readLocalCustomPersonas();
  const existing = personas.find((persona) => persona.id === parsed.id);

  if (!existing) {
    throw new Error("Custom persona not found.");
  }

  const updated = customPersonaSchema.parse({
    ...existing,
    label: parsed.label,
    role: parsed.role,
  });

  writeLocalCustomPersonas(
    personas.map((persona) => (persona.id === parsed.id ? updated : persona)),
  );

  return updated;
}

export interface PersonaClient {
  listCustomPersonas: () => Promise<ListCustomPersonasResult>;
  createCustomPersona: (input: CreateCustomPersonaInput) => Promise<CreateCustomPersonaResult>;
  updateCustomPersona: (input: UpdateCustomPersonaInput) => Promise<UpdateCustomPersonaResult>;
  deleteCustomPersona: (input: DeleteCustomPersonaInput) => Promise<DeleteCustomPersonaResult>;
}

type CustomPersonaBridge = Pick<
  AiPromptStudioBridge["personas"],
  "listCustomPersonas" | "createCustomPersona" | "updateCustomPersona" | "deleteCustomPersona"
>;

function hasCustomPersonaBridge(
  bridge: Partial<AiPromptStudioBridge> | undefined,
): bridge is AiPromptStudioBridge & { personas: CustomPersonaBridge } {
  return (
    hasBridgeMethod(bridge?.personas, "listCustomPersonas") &&
    hasBridgeMethod(bridge?.personas, "createCustomPersona") &&
    hasBridgeMethod(bridge?.personas, "updateCustomPersona") &&
    hasBridgeMethod(bridge?.personas, "deleteCustomPersona")
  );
}

function createIpcPersonaClient(bridge: CustomPersonaBridge): PersonaClient {
  return {
    listCustomPersonas: () => bridge.listCustomPersonas(),
    createCustomPersona: (input) =>
      bridge.createCustomPersona(createCustomPersonaInputSchema.parse(input)),
    updateCustomPersona: (input) =>
      bridge.updateCustomPersona(updateCustomPersonaInputSchema.parse(input)),
    deleteCustomPersona: (input) => bridge.deleteCustomPersona(input),
  };
}

const localPersonaClient: PersonaClient = {
  listCustomPersonas: () => Promise.resolve({ personas: readLocalCustomPersonas() }),
  createCustomPersona: (input) => Promise.resolve(createLocalCustomPersona(input)),
  updateCustomPersona: (input) => Promise.resolve(updateLocalCustomPersona(input)),
  deleteCustomPersona: (input) => Promise.resolve(deleteLocalCustomPersona(input)),
};

const unavailablePersonaClient: PersonaClient = {
  listCustomPersonas: () =>
    Promise.reject(new Error("Restart the desktop app to load custom personas.")),
  createCustomPersona: () =>
    Promise.reject(new Error("Restart the desktop app to load the latest custom persona bridge.")),
  updateCustomPersona: () =>
    Promise.reject(new Error("Restart the desktop app to load the latest custom persona bridge.")),
  deleteCustomPersona: () =>
    Promise.reject(new Error("Restart the desktop app to load the latest custom persona bridge.")),
};

function resolvePersonaClient(): PersonaClient {
  const bridge = getAiPromptStudioBridge();
  const hasCustomBridge = hasCustomPersonaBridge(bridge);
  const mode = selectPersonaClientMode({
    hasPromptBridge: hasBridgeMethod(bridge?.promptGeneration, "generatePrompt"),
    hasCustomPersonaBridge: hasCustomBridge,
  });

  if (mode === "bridge" && hasCustomBridge) return createIpcPersonaClient(bridge.personas);
  if (mode === "unavailable") return unavailablePersonaClient;
  return localPersonaClient;
}

export const personaClient: PersonaClient = {
  listCustomPersonas: () => resolvePersonaClient().listCustomPersonas(),
  createCustomPersona: (input) => resolvePersonaClient().createCustomPersona(input),
  updateCustomPersona: (input) => resolvePersonaClient().updateCustomPersona(input),
  deleteCustomPersona: (input) => resolvePersonaClient().deleteCustomPersona(input),
};
