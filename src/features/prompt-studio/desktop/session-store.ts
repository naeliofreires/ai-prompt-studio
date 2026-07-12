import Store from "electron-store";
import {
  createPromptStudioSession,
  parseStoredPromptStudioSession,
  type PromptStudioSession,
} from "../contract/session.js";

interface PromptStudioSessionStore {
  session: PromptStudioSession;
}

const store = new Store<PromptStudioSessionStore>({
  name: "prompt-studio-session",
  defaults: { session: createPromptStudioSession() },
});

export function getPromptStudioSession(): PromptStudioSession {
  const saved = store.get("session");
  return parseStoredPromptStudioSession(saved);
}

export function recoverPromptStudioSession(): PromptStudioSession {
  const session = createPromptStudioSession();
  store.set("session", session);
  return session;
}

export function savePromptStudioSession(session: PromptStudioSession): PromptStudioSession {
  store.set("session", session);
  return session;
}
