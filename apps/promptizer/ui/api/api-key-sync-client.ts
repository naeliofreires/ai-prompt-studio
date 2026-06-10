import type { ProviderId } from "../../shared/index.js";
import { getAiPromptStudioBridge, hasBridgeMethod } from "./electron-bridge";

export interface ApiKeySyncClient {
  listConfigured: () => Promise<ProviderId[]>;
  syncKeys: (keys: Partial<Record<ProviderId, string>>) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const apiKeySyncClient: ApiKeySyncClient = {
  async listConfigured() {
    const bridge = getAiPromptStudioBridge();
    if (!hasBridgeMethod(bridge, "listConfiguredApiKeys")) {
      return [];
    }

    const result = await bridge.listConfiguredApiKeys();
    return result.providerIds;
  },

  async syncKeys(keys) {
    const bridge = getAiPromptStudioBridge();
    if (hasBridgeMethod(bridge, "setApiKeys")) {
      await bridge.setApiKeys(keys as Record<string, string>);
    }
  },

  async clearAll() {
    const bridge = getAiPromptStudioBridge();
    if (hasBridgeMethod(bridge, "clearAllApiKeys")) {
      await bridge.clearAllApiKeys();
    }
  },
};
