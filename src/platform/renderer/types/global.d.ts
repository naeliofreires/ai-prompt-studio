import type {
  CreateCustomPersonaInput,
  CreateCustomPersonaResult,
  DeleteCustomPersonaInput,
  DeleteCustomPersonaResult,
  ListCustomPersonasResult,
  UpdateCustomPersonaInput,
  UpdateCustomPersonaResult,
} from "../../../features/personas/contract/ipc";
import type {
  GeneratePromptIpcResult,
  GeneratePromptPayload,
} from "../../../features/prompt-generation/contract/ipc";
import type {
  ListConfiguredApiKeysResult,
  SetApiKeysPayload,
} from "../../../features/providers/contract/ipc";

declare global {
  interface Window {
    aiPromptStudio: {
      personas: {
        listCustomPersonas: () => Promise<ListCustomPersonasResult>;
        createCustomPersona: (
          payload: CreateCustomPersonaInput,
        ) => Promise<CreateCustomPersonaResult>;
        updateCustomPersona: (
          payload: UpdateCustomPersonaInput,
        ) => Promise<UpdateCustomPersonaResult>;
        deleteCustomPersona: (
          payload: DeleteCustomPersonaInput,
        ) => Promise<DeleteCustomPersonaResult>;
      };
      providers: {
        listConfiguredApiKeys: () => Promise<ListConfiguredApiKeysResult>;
        setApiKeys: (keys: SetApiKeysPayload) => Promise<void>;
        clearAllApiKeys: () => Promise<void>;
      };
      promptGeneration: {
        generatePrompt: (payload: GeneratePromptPayload) => Promise<GeneratePromptIpcResult>;
      };
    };
  }
}

export {};
