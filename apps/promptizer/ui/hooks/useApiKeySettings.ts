import { useCallback } from "react";
import type { ProviderId } from "../../shared";
import { isProviderConfigured, useApiKeyStore } from "../store/api-key-store";

export function useApiKeySettings() {
  const keys = useApiKeyStore((s) => s.keys);
  const mainConfiguredProviders = useApiKeyStore((s) => s.mainConfiguredProviders);
  const saveKeys = useApiKeyStore((s) => s.setKeys);
  const clearProvider = useApiKeyStore((s) => s.clearProvider);
  const clearAll = useApiKeyStore((s) => s.clearAll);

  const isConfigured = useCallback(
    (providerId: ProviderId) => isProviderConfigured(keys, providerId, mainConfiguredProviders),
    [keys, mainConfiguredProviders],
  );

  return {
    keys,
    saveKeys,
    clearProvider,
    clearAll,
    isConfigured,
  };
}
