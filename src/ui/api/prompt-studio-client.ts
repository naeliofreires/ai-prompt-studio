import {
  type GeneratePromptIpcResult,
  type GeneratePromptPayload,
} from "../../shared";

function hasBridgeMethod(method: keyof Window["aiPromptStudio"]): boolean {
  return typeof window.aiPromptStudio?.[method] === "function";
}

export const promptStudioClient = {
  generatePrompt(payload: GeneratePromptPayload): Promise<GeneratePromptIpcResult> {
    if (!hasBridgeMethod("generatePrompt")) {
      return Promise.reject(
        new Error("Prompt generation is only available in the Electron desktop app."),
      );
    }

    return window.aiPromptStudio.generatePrompt(payload);
  },
};
