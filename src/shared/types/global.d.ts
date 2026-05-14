import type {
  CreateCustomPersonaInput,
  CreateCustomPersonaResult,
  DeleteCustomPersonaInput,
  DeleteCustomPersonaResult,
  GeneratePromptIpcResult,
  GeneratePromptPayload,
  ListCustomPersonasResult,
} from "../contracts/ipc";

declare global {
  interface Window {
    aiPromptStudio: {
      generatePrompt: (payload: GeneratePromptPayload) => Promise<GeneratePromptIpcResult>;
      listCustomPersonas: () => Promise<ListCustomPersonasResult>;
      createCustomPersona: (payload: CreateCustomPersonaInput) => Promise<CreateCustomPersonaResult>;
      deleteCustomPersona: (payload: DeleteCustomPersonaInput) => Promise<DeleteCustomPersonaResult>;
    };
  }
}

export {};
