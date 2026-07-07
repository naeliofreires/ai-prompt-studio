import { z } from "zod";

export const customPersonaSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1),
  role: z.string().min(1),
});

export type CustomPersona = z.infer<typeof customPersonaSchema>;

export const seedCustomPersonas: CustomPersona[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    label: "Frontend Specialist",
    role: "Refines prompts for React, TypeScript, browser APIs, and client-side architecture.",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    label: "Backend Specialist",
    role: "Refines prompts for APIs, databases, distributed systems, and server-side design.",
  },
];

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
