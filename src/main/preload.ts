import { contextBridge, ipcRenderer } from "electron";
import {
  ipcChannels,
  type GeneratePromptIpcResult,
  type GeneratePromptPayload,
} from "../shared/index.js";

contextBridge.exposeInMainWorld("aiPromptStudio", {
  generatePrompt: (payload: GeneratePromptPayload): Promise<GeneratePromptIpcResult> =>
    ipcRenderer.invoke(ipcChannels.generatePrompt, payload),
});
