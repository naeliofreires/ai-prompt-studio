import {
  createCustomPersonaInputSchema,
  customPersonaSchema,
  type CreateCustomPersonaInput,
  type CreateCustomPersonaResult,
  type DeleteCustomPersonaInput,
  type DeleteCustomPersonaResult,
  type GeneratePromptIpcResult,
  type GeneratePromptPayload,
  type ListCustomPersonasResult,
} from "../../shared";

const STORAGE_KEY = "promptizer.custom-personas";

type CustomPersonaBackend = "ipc" | "local" | "unavailable";

function hasBridgeMethod(method: keyof Window["aiPromptStudio"]): boolean {
  return typeof window.aiPromptStudio?.[method] === "function";
}

function hasCustomPersonaBridge(): boolean {
  return (
    hasBridgeMethod("listCustomPersonas") &&
    hasBridgeMethod("createCustomPersona") &&
    hasBridgeMethod("deleteCustomPersona")
  );
}

function getCustomPersonaBackend(): CustomPersonaBackend {
  if (hasCustomPersonaBridge()) return "ipc";
  if (hasBridgeMethod("generatePrompt")) return "unavailable";
  return "local";
}

function readLocalCustomPersonas(): ListCustomPersonasResult["personas"] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return customPersonaSchema.array().parse(JSON.parse(raw));
}

function writeLocalCustomPersonas(personas: ListCustomPersonasResult["personas"]): void {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(customPersonaSchema.array().parse(personas)),
  );
}

export function isCustomPersonaBridgeUnavailable(): boolean {
  return getCustomPersonaBackend() === "unavailable";
}

export const promptStudioClient = {
  listCustomPersonas(): Promise<ListCustomPersonasResult> {
    const backend = getCustomPersonaBackend();
    if (backend === "ipc") {
      return window.aiPromptStudio.listCustomPersonas();
    }

    if (backend === "local") {
      return Promise.resolve({ personas: readLocalCustomPersonas() });
    }

    return Promise.resolve({ personas: [] });
  },

  createCustomPersona(input: CreateCustomPersonaInput): Promise<CreateCustomPersonaResult> {
    const parsed = createCustomPersonaInputSchema.parse(input);
    const backend = getCustomPersonaBackend();

    if (backend === "ipc") {
      return window.aiPromptStudio.createCustomPersona(parsed);
    }

    if (backend === "local") {
      const persona = customPersonaSchema.parse({
        id: crypto.randomUUID(),
        label: parsed.label,
        role: parsed.role,
      });

      writeLocalCustomPersonas([...readLocalCustomPersonas(), persona]);
      return Promise.resolve(persona);
    }

    return Promise.reject(
      new Error("Restart the desktop app to load the latest custom persona bridge."),
    );
  },

  deleteCustomPersona(input: DeleteCustomPersonaInput): Promise<DeleteCustomPersonaResult> {
    const backend = getCustomPersonaBackend();

    if (backend === "ipc") {
      return window.aiPromptStudio.deleteCustomPersona(input);
    }

    if (backend === "local") {
      const personas = readLocalCustomPersonas();
      const next = personas.filter((persona) => persona.id !== input.id);
      const deleted = next.length < personas.length;

      if (deleted) {
        writeLocalCustomPersonas(next);
      }

      return Promise.resolve({ deleted });
    }

    return Promise.reject(
      new Error("Restart the desktop app to load the latest custom persona bridge."),
    );
  },

  generatePrompt(payload: GeneratePromptPayload): Promise<GeneratePromptIpcResult> {
    if (!hasBridgeMethod("generatePrompt")) {
      return Promise.reject(
        new Error("Prompt generation is only available in the Electron desktop app."),
      );
    }

    return window.aiPromptStudio.generatePrompt(payload);
  },
};
