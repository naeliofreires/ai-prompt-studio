import { app, ipcMain } from "electron";
import {
  listConfiguredApiKeysResultSchema,
  providerIpcChannels,
  setApiKeysPayloadSchema,
} from "../contract/ipc.js";
import { logger } from "../../../platform/electron/logger.js";
import { clearAllApiKeys, listConfiguredApiKeyProviders, setApiKeys } from "./api-key-manager.js";

export function registerProviderHandlers(): void {
  ipcMain.handle(providerIpcChannels.listConfiguredApiKeys, () => {
    const providerIds = listConfiguredApiKeyProviders({ includeEnvironment: !app.isPackaged });
    logger.debug("listConfiguredApiKeys", { providerIds });
    return listConfiguredApiKeysResultSchema.parse({ providerIds });
  });

  ipcMain.handle(providerIpcChannels.setApiKeys, (_event, payload: unknown) => {
    const keys = setApiKeysPayloadSchema.parse(payload);
    logger.debug("setApiKeys", { providers: Object.keys(keys) });
    setApiKeys(keys);
  });

  ipcMain.handle(providerIpcChannels.clearAllApiKeys, () => {
    logger.debug("clearAllApiKeys");
    clearAllApiKeys();
  });
}
