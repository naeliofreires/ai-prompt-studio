import { type GeneratePromptIpcResult, type GeneratePromptPayload } from "../../shared";
import { getAiPromptStudioBridge, hasBridgeMethod } from "./electron-bridge";

export const promptStudioClient = {
  generatePrompt(payload: GeneratePromptPayload): Promise<GeneratePromptIpcResult> {
    const bridge = getAiPromptStudioBridge();
    if (!hasBridgeMethod(bridge, "generatePrompt")) {
      return Promise.reject(
        new Error("Prompt generation is only available in the Electron desktop app."),
      );
    }

    return bridge.generatePrompt(payload);
  },
};
