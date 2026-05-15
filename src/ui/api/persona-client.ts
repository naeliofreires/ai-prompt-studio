import {
  createCustomPersonaInputSchema,
  type CreateCustomPersonaInput,
  type CreateCustomPersonaResult,
  type DeleteCustomPersonaInput,
  type DeleteCustomPersonaResult,
  type ListCustomPersonasResult,
} from "../../shared";
import {
  createLocalCustomPersona,
  deleteLocalCustomPersona,
  listLocalCustomPersonas,
} from "./custom-persona-local-repository";

export interface PersonaClient {
  listCustomPersonas: () => Promise<ListCustomPersonasResult>;
  createCustomPersona: (input: CreateCustomPersonaInput) => Promise<CreateCustomPersonaResult>;
  deleteCustomPersona: (input: DeleteCustomPersonaInput) => Promise<DeleteCustomPersonaResult>;
}

type Bridge = Window["aiPromptStudio"];

function getBridge(): Bridge | undefined {
  if (typeof window === "undefined") return undefined;
  return window.aiPromptStudio;
}

function hasBridgeMethod(
  bridge: Bridge | undefined,
  method: keyof Window["aiPromptStudio"],
): bridge is Bridge {
  return typeof bridge?.[method] === "function";
}

function hasCustomPersonaBridge(bridge: Bridge | undefined): bridge is Bridge {
  return (
    hasBridgeMethod(bridge, "listCustomPersonas") &&
    hasBridgeMethod(bridge, "createCustomPersona") &&
    hasBridgeMethod(bridge, "deleteCustomPersona")
  );
}

function createIpcPersonaClient(bridge: Bridge): PersonaClient {
  return {
    listCustomPersonas: () => bridge.listCustomPersonas(),
    createCustomPersona: (input) =>
      bridge.createCustomPersona(createCustomPersonaInputSchema.parse(input)),
    deleteCustomPersona: (input) => bridge.deleteCustomPersona(input),
  };
}

const localPersonaClient: PersonaClient = {
  listCustomPersonas: () => Promise.resolve(listLocalCustomPersonas()),
  createCustomPersona: (input) => Promise.resolve(createLocalCustomPersona(input)),
  deleteCustomPersona: (input) => Promise.resolve(deleteLocalCustomPersona(input)),
};

const unavailablePersonaClient: PersonaClient = {
  listCustomPersonas: () =>
    Promise.reject(new Error("Restart the desktop app to load custom personas.")),
  createCustomPersona: () =>
    Promise.reject(
      new Error("Restart the desktop app to load the latest custom persona bridge."),
    ),
  deleteCustomPersona: () =>
    Promise.reject(
      new Error("Restart the desktop app to load the latest custom persona bridge."),
    ),
};

function resolvePersonaClient(): PersonaClient {
  const bridge = getBridge();
  if (hasCustomPersonaBridge(bridge)) return createIpcPersonaClient(bridge);
  if (hasBridgeMethod(bridge, "generatePrompt")) return unavailablePersonaClient;
  return localPersonaClient;
}

export const personaClient: PersonaClient = {
  listCustomPersonas: () => resolvePersonaClient().listCustomPersonas(),
  createCustomPersona: (input) => resolvePersonaClient().createCustomPersona(input),
  deleteCustomPersona: (input) => resolvePersonaClient().deleteCustomPersona(input),
};
