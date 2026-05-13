import type { GeneratePromptIpcResult, GeneratePromptPayload } from "../contracts/ipc";

declare global {
  interface Window {
    aiPromptStudio: {
      generatePrompt: (payload: GeneratePromptPayload) => Promise<GeneratePromptIpcResult>;
    };
  }
}

export {};
