import type {
  CreateCustomPersonaInput,
  CreateCustomPersonaResult,
  DeleteCustomPersonaInput,
  DeleteCustomPersonaResult,
  GeneratePromptIpcResult,
  GeneratePromptPayload,
  ListConfiguredApiKeysResult,
  ListCustomPersonasResult,
} from "../contracts/ipc";

declare global {
  interface Window {
    aiPromptStudio: {
      generatePrompt: (payload: GeneratePromptPayload) => Promise<GeneratePromptIpcResult>;
      listCustomPersonas: () => Promise<ListCustomPersonasResult>;
      createCustomPersona: (payload: CreateCustomPersonaInput) => Promise<CreateCustomPersonaResult>;
      deleteCustomPersona: (payload: DeleteCustomPersonaInput) => Promise<DeleteCustomPersonaResult>;
      listConfiguredApiKeys: () => Promise<ListConfiguredApiKeysResult>;
      setApiKeys: (keys: Record<string, string>) => Promise<void>;
      clearAllApiKeys: () => Promise<void>;
    };
  }
}

export {};
