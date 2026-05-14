import { apiKeyMapSchema, PROVIDER_IDS, type ProviderId } from "../../shared/index.js";

export const STORAGE_KEY = "promptizer:apiKeys:v1";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function readApiKeys(): Partial<Record<ProviderId, string>> {
  const storage = getStorage();
  if (!storage) return {};

  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return {};

  try {
    const parsed = JSON.parse(raw);
    return apiKeyMapSchema.parse(parsed);
  } catch {
    console.warn("Corrupt sessionStorage entry cleared:", STORAGE_KEY);
    storage.removeItem(STORAGE_KEY);
    return {};
  }
}

export function writeApiKeys(patch: Partial<Record<ProviderId, string>>): void {
  const storage = getStorage();
  if (!storage) return;

  const current = readApiKeys();
  for (const [id, value] of Object.entries(patch)) {
    if (!(PROVIDER_IDS as readonly string[]).includes(id)) continue;
    const providerId = id as ProviderId;
    if (typeof value === "string" && value.trim().length > 0) {
      current[providerId] = value.trim();
    } else {
      delete current[providerId];
    }
  }
  storage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function clearApiKeys(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}
