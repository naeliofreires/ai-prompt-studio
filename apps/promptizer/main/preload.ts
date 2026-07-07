import { contextBridge, ipcRenderer } from "electron";
import {
  ipcChannels,
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
    ipcRenderer.invoke(ipcChannels.generatePrompt, payload),
  listCustomPersonas: (): Promise<ListCustomPersonasResult> =>
    ipcRenderer.invoke(ipcChannels.listCustomPersonas),
  createCustomPersona: (payload: CreateCustomPersonaInput): Promise<CreateCustomPersonaResult> =>
    ipcRenderer.invoke(ipcChannels.createCustomPersona, payload),
  updateCustomPersona: (payload: UpdateCustomPersonaInput): Promise<UpdateCustomPersonaResult> =>
    ipcRenderer.invoke(ipcChannels.updateCustomPersona, payload),
  deleteCustomPersona: (payload: DeleteCustomPersonaInput): Promise<DeleteCustomPersonaResult> =>
    ipcRenderer.invoke(ipcChannels.deleteCustomPersona, payload),
  listConfiguredApiKeys: (): Promise<ListConfiguredApiKeysResult> =>
    ipcRenderer.invoke(ipcChannels.listConfiguredApiKeys),
  setApiKeys: (keys: Record<string, string>): Promise<void> =>
    ipcRenderer.invoke(ipcChannels.setApiKeys, keys),
  clearAllApiKeys: (): Promise<void> => ipcRenderer.invoke(ipcChannels.clearAllApiKeys),
});
