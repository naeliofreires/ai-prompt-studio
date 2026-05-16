import type { ProviderId } from "../../shared/index.js";

export interface ApiKeySyncClient {
  listConfigured: () => Promise<ProviderId[]>;
  syncKeys: (keys: Partial<Record<ProviderId, string>>) => Promise<void>;
  clearAll: () => Promise<void>;
}

function getBridge(): Window["aiPromptStudio"] | undefined {
  if (typeof window === "undefined") return undefined;
  return window.aiPromptStudio;
}

export const apiKeySyncClient: ApiKeySyncClient = {
  async listConfigured() {
    const bridge = getBridge();
    if (!bridge?.listConfiguredApiKeys) {
      return [];
    }

    const result = await bridge.listConfiguredApiKeys();
    return result.providerIds;
  },

  async syncKeys(keys) {
    const bridge = getBridge();
    if (bridge?.setApiKeys) {
      await bridge.setApiKeys(keys as Record<string, string>);
    }
  },

  async clearAll() {
    const bridge = getBridge();
    if (bridge?.clearAllApiKeys) {
      await bridge.clearAllApiKeys();
    }
  },
};
