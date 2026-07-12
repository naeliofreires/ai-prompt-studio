import { ipcMain } from "electron";
import {
  createCustomPersonaInputSchema,
  createCustomPersonaResultSchema,
  deleteCustomPersonaInputSchema,
  deleteCustomPersonaResultSchema,
  listCustomPersonasResultSchema,
  personaIpcChannels,
  updateCustomPersonaInputSchema,
  updateCustomPersonaResultSchema,
} from "../contract/ipc.js";
import { logger } from "../../../platform/electron/logger.js";
import {
  createCustomPersona,
  deleteCustomPersona,
  listCustomPersonas,
  updateCustomPersona,
} from "./custom-personas-store.js";

export function registerPersonaHandlers(): void {
  ipcMain.handle(personaIpcChannels.listCustomPersonas, () => {
    logger.debug("listCustomPersonas");
    return listCustomPersonasResultSchema.parse({ personas: listCustomPersonas() });
  });

  ipcMain.handle(personaIpcChannels.createCustomPersona, (_event, payload) => {
    logger.info("createCustomPersona", { hasLabel: Boolean(payload?.label) });
    return createCustomPersonaResultSchema.parse(
      createCustomPersona(createCustomPersonaInputSchema.parse(payload)),
    );
  });

  ipcMain.handle(personaIpcChannels.deleteCustomPersona, (_event, payload) => {
    logger.info("deleteCustomPersona", { id: payload?.id });
    const parsed = deleteCustomPersonaInputSchema.parse(payload);
    return deleteCustomPersonaResultSchema.parse({ deleted: deleteCustomPersona(parsed.id) });
  });

  ipcMain.handle(personaIpcChannels.updateCustomPersona, (_event, payload) => {
    logger.info("updateCustomPersona", { id: payload?.id });
    return updateCustomPersonaResultSchema.parse(
      updateCustomPersona(updateCustomPersonaInputSchema.parse(payload)),
    );
  });
}
