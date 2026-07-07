import { contextBridge, ipcRenderer } from "electron";
import {
  ipcChannels as promptizerChannels,
  type CreateCustomPersonaInput,
  type CreateCustomPersonaResult,
  type DeleteCustomPersonaInput,
  type DeleteCustomPersonaResult,
  type GeneratePromptIpcResult,
  type GeneratePromptPayload,
  type ListConfiguredApiKeysResult,
  type ListCustomPersonasResult,
  type UpdateCustomPersonaInput,
  type UpdateCustomPersonaResult,
} from "../shared/index.js";

contextBridge.exposeInMainWorld("aiPromptStudio", {
  generatePrompt: (payload: GeneratePromptPayload): Promise<GeneratePromptIpcResult> =>
    ipcRenderer.invoke(promptizerChannels.generatePrompt, payload),
  listCustomPersonas: (): Promise<ListCustomPersonasResult> =>
    ipcRenderer.invoke(promptizerChannels.listCustomPersonas),
  createCustomPersona: (payload: CreateCustomPersonaInput): Promise<CreateCustomPersonaResult> =>
    ipcRenderer.invoke(promptizerChannels.createCustomPersona, payload),
  updateCustomPersona: (payload: UpdateCustomPersonaInput): Promise<UpdateCustomPersonaResult> =>
    ipcRenderer.invoke(promptizerChannels.updateCustomPersona, payload),
  deleteCustomPersona: (payload: DeleteCustomPersonaInput): Promise<DeleteCustomPersonaResult> =>
    ipcRenderer.invoke(promptizerChannels.deleteCustomPersona, payload),
  listConfiguredApiKeys: (): Promise<ListConfiguredApiKeysResult> =>
    ipcRenderer.invoke(promptizerChannels.listConfiguredApiKeys),
  setApiKeys: (keys: Record<string, string>): Promise<void> =>
    ipcRenderer.invoke(promptizerChannels.setApiKeys, keys),
  clearAllApiKeys: (): Promise<void> => ipcRenderer.invoke(promptizerChannels.clearAllApiKeys),
});
