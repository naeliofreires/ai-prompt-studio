import { contextBridge, ipcRenderer } from "electron";
import {
  providerIpcChannels,
  type ListConfiguredApiKeysResult,
  type SetApiKeysPayload,
} from "../../features/providers/contract/ipc.js";
import {
  promptGenerationIpcChannels,
  type GeneratePromptIpcResult,
  type GeneratePromptPayload,
} from "../../features/prompt-generation/contract/ipc.js";

contextBridge.exposeInMainWorld("aiPromptStudio", {
  providers: {
    listConfiguredApiKeys: (): Promise<ListConfiguredApiKeysResult> =>
      ipcRenderer.invoke(providerIpcChannels.listConfiguredApiKeys),
    setApiKeys: (keys: SetApiKeysPayload): Promise<void> =>
      ipcRenderer.invoke(providerIpcChannels.setApiKeys, keys),
    clearAllApiKeys: (): Promise<void> => ipcRenderer.invoke(providerIpcChannels.clearAllApiKeys),
  },
  promptGeneration: {
    generatePrompt: (payload: GeneratePromptPayload): Promise<GeneratePromptIpcResult> =>
      ipcRenderer.invoke(promptGenerationIpcChannels.generatePrompt, payload),
  },
});
