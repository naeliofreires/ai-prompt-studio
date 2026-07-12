import { ipcMain } from "electron";
import {
  getPromptStudioSessionResultSchema,
  promptStudioIpcChannels,
  savePromptStudioSessionPayloadSchema,
} from "../contract/ipc.js";
import { logger } from "../../../platform/electron/logger.js";
import {
  getPromptStudioSession,
  recoverPromptStudioSession,
  savePromptStudioSession,
} from "./session-store.js";

export function registerPromptStudioSessionHandlers(): void {
  ipcMain.handle(promptStudioIpcChannels.getSession, () => {
    const session = getPromptStudioSession();
    logger.debug("getPromptStudioSession", {
      providerId: session.providerId,
      model: session.model,
    });
    return getPromptStudioSessionResultSchema.parse(session);
  });

  ipcMain.handle(promptStudioIpcChannels.saveSession, (_event, payload: unknown) => {
    const session = savePromptStudioSessionPayloadSchema.parse(payload);
    logger.debug("savePromptStudioSession", {
      providerId: session.providerId,
      model: session.model,
    });
    return savePromptStudioSession(session);
  });

  ipcMain.handle(promptStudioIpcChannels.recoverSession, () => {
    const session = recoverPromptStudioSession();
    logger.warn("recoverPromptStudioSession", { providerId: session.providerId });
    return getPromptStudioSessionResultSchema.parse(session);
  });
}
