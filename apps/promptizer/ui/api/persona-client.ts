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
import {
  getAiPromptStudioBridge,
  hasBridgeMethod,
  type AiPromptStudioBridge,
} from "./electron-bridge";

export interface PersonaClient {
  listCustomPersonas: () => Promise<ListCustomPersonasResult>;
  createCustomPersona: (input: CreateCustomPersonaInput) => Promise<CreateCustomPersonaResult>;
  deleteCustomPersona: (input: DeleteCustomPersonaInput) => Promise<DeleteCustomPersonaResult>;
}

type CustomPersonaBridge = Pick<
  AiPromptStudioBridge,
  "listCustomPersonas" | "createCustomPersona" | "deleteCustomPersona"
>;

function hasCustomPersonaBridge(
  bridge: Partial<AiPromptStudioBridge> | undefined,
): bridge is CustomPersonaBridge {
  return (
    hasBridgeMethod(bridge, "listCustomPersonas") &&
    hasBridgeMethod(bridge, "createCustomPersona") &&
    hasBridgeMethod(bridge, "deleteCustomPersona")
  );
}

function createIpcPersonaClient(bridge: CustomPersonaBridge): PersonaClient {
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
    Promise.reject(new Error("Restart the desktop app to load the latest custom persona bridge.")),
  deleteCustomPersona: () =>
    Promise.reject(new Error("Restart the desktop app to load the latest custom persona bridge.")),
};

function resolvePersonaClient(): PersonaClient {
  const bridge = getAiPromptStudioBridge();
  if (hasCustomPersonaBridge(bridge)) return createIpcPersonaClient(bridge);
  if (hasBridgeMethod(bridge, "generatePrompt")) return unavailablePersonaClient;
  return localPersonaClient;
}

export const personaClient: PersonaClient = {
  listCustomPersonas: () => resolvePersonaClient().listCustomPersonas(),
  createCustomPersona: (input) => resolvePersonaClient().createCustomPersona(input),
  deleteCustomPersona: (input) => resolvePersonaClient().deleteCustomPersona(input),
};
