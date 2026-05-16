import { create } from "zustand";
import type { ProviderId } from "../../shared/index.js";
import { apiKeySyncClient } from "../api/api-key-sync-client.js";
import { readApiKeys, writeApiKeys, clearApiKeys } from "../config/api-key-storage.js";
import { hasKey } from "../../shared/domain/api-keys.js";

export interface ApiKeyState {
  keys: Partial<Record<ProviderId, string>>;
  mainConfiguredProviders: ProviderId[];
  hydrated: boolean;
  lastUpdatedAt: number | null;
}

export interface ApiKeyActions {
  hydrateFromSession: () => void;
  refreshConfiguredProviders: () => Promise<void>;
  setKeys: (patch: Partial<Record<ProviderId, string>>) => void;
  clearProvider: (id: ProviderId) => void;
  clearAll: () => void;
}

export type ApiKeyStore = ApiKeyState & ApiKeyActions;

function syncKeysToMain(keys: Partial<Record<ProviderId, string>>): Promise<void> {
  return apiKeySyncClient.syncKeys(keys).catch(() => {});
}

function syncClearToMain(): Promise<void> {
  return apiKeySyncClient.clearAll().catch(() => {});
}

export const useApiKeyStore = create<ApiKeyStore>((set, get) => ({
  keys: {},
  mainConfiguredProviders: [],
  hydrated: false,
  lastUpdatedAt: null,

  hydrateFromSession: () => {
    const keys = readApiKeys();
    set({ keys, hydrated: true });
    void syncKeysToMain(keys).then(() => get().refreshConfiguredProviders());
  },

  refreshConfiguredProviders: async () => {
    const providerIds = await apiKeySyncClient.listConfigured().catch(() => []);
    set({ mainConfiguredProviders: providerIds });
  },

  setKeys: (patch) => {
    writeApiKeys(patch);
    const keys = readApiKeys();
    set({ keys, lastUpdatedAt: Date.now() });
    void syncKeysToMain(patch).then(() => get().refreshConfiguredProviders());
  },

  clearProvider: (id) => {
    writeApiKeys({ [id]: "" });
    const keys = readApiKeys();
    set({ keys, lastUpdatedAt: Date.now() });
    void syncKeysToMain({ [id]: "" }).then(() => get().refreshConfiguredProviders());
  },

  clearAll: () => {
    clearApiKeys();
    set({ keys: {}, lastUpdatedAt: Date.now() });
    void syncClearToMain().then(() => get().refreshConfiguredProviders());
  },
}));

export function isProviderConfigured(
  keys: Partial<Record<ProviderId, string>>,
  providerId: ProviderId,
  mainConfiguredProviders: ProviderId[] = [],
): boolean {
  return hasKey(keys, providerId) || mainConfiguredProviders.includes(providerId);
}

export function configuredProviderIds(
  keys: Partial<Record<ProviderId, string>>,
  mainConfiguredProviders: ProviderId[] = [],
): ProviderId[] {
  return Array.from(
    new Set([
      ...(Object.keys(keys) as ProviderId[]).filter((id) => hasKey(keys, id)),
      ...mainConfiguredProviders,
    ]),
  );
}
