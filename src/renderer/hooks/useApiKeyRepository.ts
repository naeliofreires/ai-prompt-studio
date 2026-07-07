import { useCallback, useEffect, useState } from "react";
import type { ProviderId } from "../../shared/index.js";
import { apiKeyRepository } from "../api/api-key-repository";

export function useApiKeyRepository() {
  const [keys, setKeysState] = useState<Partial<Record<ProviderId, string>>>({});
  const [configuredProviderIds, setConfiguredProviderIds] = useState<ProviderId[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    const k = apiKeyRepository.getKeys();
    setKeysState(k);
    await apiKeyRepository.refreshConfiguredProviders();
    setConfiguredProviderIds(apiKeyRepository.configuredProviderIds());
  }, []);

  useEffect(() => {
    refresh().then(() => {
      apiKeyRepository.hydrateFromSession();
      setHydrated(true);
    });
  }, [refresh]);

  useEffect(() => {
    if (!hydrated) return;
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        refresh().then(() => apiKeyRepository.hydrateFromSession());
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [hydrated, refresh]);

  const isConfigured = useCallback(
    (providerId: ProviderId) =>
      apiKeyRepository.isConfigured(providerId),
    [],
  );

  const saveKeys = useCallback(
    (patch: Partial<Record<ProviderId, string>>) => {
      apiKeyRepository.setKeys(patch);
      setKeysState(apiKeyRepository.getKeys());
      setConfiguredProviderIds(apiKeyRepository.configuredProviderIds());
      void apiKeyRepository.refreshConfiguredProviders().then(() => {
        setConfiguredProviderIds(apiKeyRepository.configuredProviderIds());
      });
    },
    [],
  );

  const clearProvider = useCallback(
    (id: ProviderId) => {
      apiKeyRepository.clearProvider(id);
      setKeysState(apiKeyRepository.getKeys());
      setConfiguredProviderIds(apiKeyRepository.configuredProviderIds());
      void apiKeyRepository.refreshConfiguredProviders().then(() => {
        setConfiguredProviderIds(apiKeyRepository.configuredProviderIds());
      });
    },
    [],
  );

  const clearAll = useCallback(() => {
    apiKeyRepository.clearAll();
    setKeysState({});
    setConfiguredProviderIds(apiKeyRepository.configuredProviderIds());
    void apiKeyRepository.refreshConfiguredProviders().then(() => {
      setConfiguredProviderIds(apiKeyRepository.configuredProviderIds());
    });
  }, []);

  return {
    keys,
    saveKeys,
    clearProvider,
    clearAll,
    isConfigured,
    configuredProviderIds,
  };
}
