import { useEffect } from "react";
import { useApiKeyStore } from "../store/api-key-store";

/**
 * Hydrates API keys from session storage on mount and when the tab becomes visible again.
 */
export function useApiKeySessionSync(): void {
  const hydrateFromSession = useApiKeyStore((s) => s.hydrateFromSession);
  const hydrated = useApiKeyStore((s) => s.hydrated);

  useEffect(() => {
    hydrateFromSession();
  }, [hydrateFromSession]);

  useEffect(() => {
    if (!hydrated) return;

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        hydrateFromSession();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [hydrated, hydrateFromSession]);
}
