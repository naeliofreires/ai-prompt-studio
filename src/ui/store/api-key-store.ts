import { create } from "zustand";
import type { ProviderId } from "../../shared/index.js";
import { readApiKeys, writeApiKeys, clearApiKeys } from "../config/api-key-storage.js";
import { hasKey } from "../../shared/domain/api-keys.js";

export interface ApiKeyState {
  keys: Partial<Record<ProviderId, string>>;
  hydrated: boolean;
  lastUpdatedAt: number | null;
}

export interface ApiKeyActions {
  hydrateFromSession: () => void;
  setKeys: (patch: Partial<Record<ProviderId, string>>) => void;
  clearProvider: (id: ProviderId) => void;
  clearAll: () => void;
}

export type ApiKeyStore = ApiKeyState & ApiKeyActions;

function syncKeysToMain(keys: Partial<Record<ProviderId, string>>): void {
  const bridge = window.aiPromptStudio;
  if (bridge?.setApiKeys) {
    bridge.setApiKeys(keys as Record<string, string>).catch(() => {});
  }
}

function syncClearToMain(): void {
  const bridge = window.aiPromptStudio;
  if (bridge?.clearAllApiKeys) {
    bridge.clearAllApiKeys().catch(() => {});
  }
}

export const useApiKeyStore = create<ApiKeyStore>((set, get) => ({
  keys: {},
  hydrated: false,
  lastUpdatedAt: null,

  hydrateFromSession: () => {
    const keys = readApiKeys();
    set({ keys, hydrated: true });
    syncKeysToMain(keys);
  },

  setKeys: (patch) => {
    writeApiKeys(patch);
    const keys = readApiKeys();
    set({ keys, lastUpdatedAt: Date.now() });
    syncKeysToMain(patch);
  },

  clearProvider: (id) => {
    writeApiKeys({ [id]: "" });
    const keys = readApiKeys();
    set({ keys, lastUpdatedAt: Date.now() });
    syncKeysToMain({ [id]: "" });
  },

  clearAll: () => {
    clearApiKeys();
    set({ keys: {}, lastUpdatedAt: Date.now() });
    syncClearToMain();
  },
}));

export function isProviderConfigured(
  keys: Partial<Record<ProviderId, string>>,
  providerId: ProviderId,
): boolean {
  return hasKey(keys, providerId);
}

export function configuredProviderIds(
  keys: Partial<Record<ProviderId, string>>,
): ProviderId[] {
  return (Object.keys(keys) as ProviderId[]).filter((id) => hasKey(keys, id));
}
