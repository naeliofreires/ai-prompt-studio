import { z } from "zod";

export const customPersonaSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1),
  role: z.string().min(1),
});

export type CustomPersona = z.infer<typeof customPersonaSchema>;

export const createCustomPersonaInputSchema = z.object({
  label: z.string().trim().min(1),
  role: z.string().trim().min(1),
});

export type CreateCustomPersonaInput = z.infer<typeof createCustomPersonaInputSchema>;

export const deleteCustomPersonaInputSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteCustomPersonaInput = z.infer<typeof deleteCustomPersonaInputSchema>;

export const updateCustomPersonaInputSchema = z.object({
  id: z.string().uuid(),
  label: z.string().trim().min(1),
  role: z.string().trim().min(1),
});

export type UpdateCustomPersonaInput = z.infer<typeof updateCustomPersonaInputSchema>;
