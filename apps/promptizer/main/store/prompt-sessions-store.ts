import Store from "electron-store";
import { randomUUID } from "node:crypto";
import {
  promptSessionSchema,
  savePromptSessionInputSchema,
  type PromptSession,
  type SavePromptSessionInput,
} from "../../shared/domain/prompt-session.js";

const storeSchema = {
  promptSessions: {
    type: "array",
    default: [],
  },
} as const;

type StoreSchema = {
  promptSessions: PromptSession[];
};

const store = new Store<StoreSchema>({
  name: "prompt-sessions",
  schema: storeSchema,
});

function readPromptSessions(): PromptSession[] {
  return promptSessionSchema.array().parse(store.get("promptSessions") ?? []);
}

function writePromptSessions(sessions: PromptSession[]): void {
  store.set("promptSessions", promptSessionSchema.array().parse(sessions));
}

export function listPromptSessions(): PromptSession[] {
  return readPromptSessions();
}

export function savePromptSession(input: SavePromptSessionInput): PromptSession {
  const parsed = savePromptSessionInputSchema.parse(input);
  const session = promptSessionSchema.parse({
    ...parsed,
    id: randomUUID(),
    favorite: false,
    createdAt: new Date().toISOString(),
  });

  writePromptSessions([...readPromptSessions(), session]);
  return session;
}

export function togglePromptSessionFavorite(id: string): PromptSession | null {
  const sessions = readPromptSessions();
  const existing = sessions.find((session) => session.id === id);
  if (!existing) {
    return null;
  }

  const updated = {
    ...existing,
    favorite: !existing.favorite,
  };

  writePromptSessions(sessions.map((session) => (session.id === id ? updated : session)));
  return updated;
}
