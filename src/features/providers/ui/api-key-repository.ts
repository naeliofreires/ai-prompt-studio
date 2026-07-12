import type { ProviderId } from "../contract/provider.js";
import { apiKeyMapSchema, hasKey } from "../contract/api-keys.js";
import { PROVIDER_IDS } from "../contract/provider.js";
import {
  getAiPromptStudioBridge,
  hasBridgeMethod,
} from "../../../platform/renderer/api/electron-bridge";
import { getBrowserStorage } from "../../../platform/renderer/storage/browser-storage";

const STORAGE_KEY = "promptizer:apiKeys:v1";

let mainConfiguredProviders: ProviderId[] = [];

export interface ApiKeyRepository {
  getKeys(): Partial<Record<ProviderId, string>>;
  setKeys(patch: Partial<Record<ProviderId, string>>): void;
  clearProvider(id: ProviderId): void;
  clearAll(): void;
  isConfigured(providerId: ProviderId): boolean;
  configuredProviderIds(): ProviderId[];
  hydrateFromSession(): void;
  refreshConfiguredProviders(): Promise<void>;
  getMainConfiguredProviders(): ProviderId[];
}

function readApiKeys(): Partial<Record<ProviderId, string>> {
  const storage = getBrowserStorage();
  if (!storage) return {};
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return {};
  try {
    const parsed = JSON.parse(raw);
    return apiKeyMapSchema.parse(parsed);
  } catch {
    console.warn("Corrupt localStorage entry cleared:", STORAGE_KEY);
    storage.removeItem(STORAGE_KEY);
    return {};
  }
}

function writeApiKeys(patch: Partial<Record<ProviderId, string>>): void {
  const storage = getBrowserStorage();
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

function clearApiKeys(): void {
  const storage = getBrowserStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}

async function syncKeysToMain(keys: Partial<Record<ProviderId, string>>): Promise<void> {
  const bridge = getAiPromptStudioBridge();
  if (hasBridgeMethod(bridge?.providers, "setApiKeys")) {
    await bridge.providers.setApiKeys(keys as Record<string, string>);
  }
}

async function syncClearToMain(): Promise<void> {
  const bridge = getAiPromptStudioBridge();
  if (hasBridgeMethod(bridge?.providers, "clearAllApiKeys")) {
    await bridge.providers.clearAllApiKeys();
  }
}

async function listConfiguredFromMain(): Promise<ProviderId[]> {
  const bridge = getAiPromptStudioBridge();
  if (hasBridgeMethod(bridge?.providers, "listConfiguredApiKeys")) {
    const result = await bridge.providers.listConfiguredApiKeys();
    return result.providerIds;
  }
  return [];
}

export const apiKeyRepository: ApiKeyRepository = {
  getKeys: () => readApiKeys(),

  setKeys(patch) {
    writeApiKeys(patch);
    void syncKeysToMain(patch).then(() => apiKeyRepository.refreshConfiguredProviders());
  },

  clearProvider(id) {
    writeApiKeys({ [id]: "" });
    void syncKeysToMain({ [id]: "" }).then(() => apiKeyRepository.refreshConfiguredProviders());
  },

  clearAll() {
    clearApiKeys();
    void syncClearToMain().then(() => apiKeyRepository.refreshConfiguredProviders());
  },

  isConfigured(providerId) {
    const keys = readApiKeys();
    return hasKey(keys, providerId) || mainConfiguredProviders.includes(providerId);
  },

  configuredProviderIds() {
    const keys = readApiKeys();
    return Array.from(
      new Set([
        ...(Object.keys(keys) as ProviderId[]).filter((id) => hasKey(keys, id)),
        ...mainConfiguredProviders,
      ]),
    );
  },

  hydrateFromSession() {
    const keys = readApiKeys();
    void syncKeysToMain(keys).then(() => apiKeyRepository.refreshConfiguredProviders());
  },

  async refreshConfiguredProviders() {
    try {
      mainConfiguredProviders = await listConfiguredFromMain();
    } catch {
      mainConfiguredProviders = [];
    }
  },

  getMainConfiguredProviders() {
    return mainConfiguredProviders;
  },
};
