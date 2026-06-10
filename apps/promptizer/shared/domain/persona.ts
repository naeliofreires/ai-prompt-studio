import { z } from "zod";
import personasRaw from "../../spec/personas.json" with { type: "json" };

const personaRowSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  role: z.string().min(1),
});

const personasArraySchema = z.array(personaRowSchema).min(1);

export const PERSONAS = personasArraySchema.parse(personasRaw);

const ids = PERSONAS.map((p) => p.id);
if (new Set(ids).size !== ids.length) {
  throw new Error("personas.json: duplicate id");
}

function toNonEmptyTuple<T>(items: T[]): [T, ...T[]] {
  const [first, ...rest] = items;
  if (first === undefined) throw new Error("personas.json must list at least one persona");
  return [first, ...rest];
}

export const PERSONA_IDS = toNonEmptyTuple(ids);
export type PersonaId = (typeof PERSONA_IDS)[number];

export interface Persona {
  id: PersonaId;
  label: string;
  role: string;
}
