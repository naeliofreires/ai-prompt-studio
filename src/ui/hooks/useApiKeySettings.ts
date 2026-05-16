import { useCallback } from "react";
import type { ProviderId } from "../../shared";
import { hasKey } from "../../shared/domain/api-keys";
import { useApiKeyStore } from "../store/api-key-store";

export function useApiKeySettings() {
  const keys = useApiKeyStore((s) => s.keys);
  const saveKeys = useApiKeyStore((s) => s.setKeys);
  const clearProvider = useApiKeyStore((s) => s.clearProvider);
  const clearAll = useApiKeyStore((s) => s.clearAll);

  const isConfigured = useCallback(
    (providerId: ProviderId) => hasKey(keys, providerId),
    [keys],
  );

  return {
    keys,
    saveKeys,
    clearProvider,
    clearAll,
    isConfigured,
  };
}
