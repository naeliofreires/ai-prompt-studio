import type { GeneratePromptIpcResult, GeneratePromptPayload } from "../../contract/ipc";
import {
  getAiPromptStudioBridge,
  hasBridgeMethod,
} from "../../../../platform/renderer/api/electron-bridge";

export const promptStudioClient = {
  generatePrompt(payload: GeneratePromptPayload): Promise<GeneratePromptIpcResult> {
    const bridge = getAiPromptStudioBridge();
    if (!hasBridgeMethod(bridge?.promptGeneration, "generatePrompt")) {
      return Promise.reject(
        new Error("Prompt generation is only available in the Electron desktop app."),
      );
    }

    return bridge.promptGeneration.generatePrompt(payload);
  },
};
