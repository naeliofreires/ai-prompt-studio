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
