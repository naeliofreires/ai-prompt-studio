import type { PersonaId } from "./persona.js";
import type { ProviderId } from "./provider.js";

export interface PromptSession {
  id: string;
  rawInput: string;
  personaId: PersonaId;
  providerId: ProviderId;
  model: string;
  generatedPrompt: string;
  rating?: number;
  feedback?: string[];
  createdAt: string;
}
