import { z } from "zod";
import {
  createCustomPersonaInputSchema,
  customPersonaSchema,
  deleteCustomPersonaInputSchema,
  updateCustomPersonaInputSchema,
} from "./custom-persona.js";
import { PERSONA_IDS } from "./persona.js";

const builtinPersonaIdSchema = z.enum(PERSONA_IDS);

export const personaSelectionIdSchema = z.union([builtinPersonaIdSchema, z.string().uuid()]);

export const personaIpcChannels = {
  listCustomPersonas: "persona:list-custom",
  createCustomPersona: "persona:create-custom",
  updateCustomPersona: "persona:update-custom",
  deleteCustomPersona: "persona:delete-custom",
} as const;

export const listCustomPersonasResultSchema = z.object({
  personas: z.array(customPersonaSchema),
});
export const createCustomPersonaResultSchema = customPersonaSchema;
export const updateCustomPersonaResultSchema = customPersonaSchema;
export const deleteCustomPersonaResultSchema = z.object({ deleted: z.boolean() });

export type ListCustomPersonasResult = z.infer<typeof listCustomPersonasResultSchema>;
export type CreateCustomPersonaResult = z.infer<typeof createCustomPersonaResultSchema>;
export type UpdateCustomPersonaResult = z.infer<typeof updateCustomPersonaResultSchema>;
export type DeleteCustomPersonaResult = z.infer<typeof deleteCustomPersonaResultSchema>;
export type {
  CreateCustomPersonaInput,
  DeleteCustomPersonaInput,
  UpdateCustomPersonaInput,
} from "./custom-persona.js";
export {
  createCustomPersonaInputSchema,
  deleteCustomPersonaInputSchema,
  updateCustomPersonaInputSchema,
};
