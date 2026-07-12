import { contextBridge, ipcRenderer } from "electron";
import {
  type CreateCustomPersonaInput,
  type CreateCustomPersonaResult,
  type DeleteCustomPersonaInput,
  type DeleteCustomPersonaResult,
  type ListCustomPersonasResult,
  type UpdateCustomPersonaInput,
  type UpdateCustomPersonaResult,
} from "../../features/personas/contract/ipc.js";
import { personaIpcChannels } from "../../features/personas/contract/ipc.js";
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
  personas: {
    listCustomPersonas: (): Promise<ListCustomPersonasResult> =>
      ipcRenderer.invoke(personaIpcChannels.listCustomPersonas),
    createCustomPersona: (payload: CreateCustomPersonaInput): Promise<CreateCustomPersonaResult> =>
      ipcRenderer.invoke(personaIpcChannels.createCustomPersona, payload),
    updateCustomPersona: (payload: UpdateCustomPersonaInput): Promise<UpdateCustomPersonaResult> =>
      ipcRenderer.invoke(personaIpcChannels.updateCustomPersona, payload),
    deleteCustomPersona: (payload: DeleteCustomPersonaInput): Promise<DeleteCustomPersonaResult> =>
      ipcRenderer.invoke(personaIpcChannels.deleteCustomPersona, payload),
  },
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
