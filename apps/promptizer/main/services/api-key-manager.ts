// In-memory key store for the Electron main process.
// Keys arrive from the renderer via IPC (apiKeys:set) and are merged here.
// For production deployments, prefer a server-side proxy that holds keys outside
// the renderer process and enforces auth, rate limits, and allowed models.
// This client-held-key approach is suitable for local-only tools and BYOK use
// cases with explicit risk disclosure in the settings UI.
import { PROVIDER_IDS, type ProviderId } from "../../shared/domain/provider.js";

const keyMap = new Map<string, string>();

export const PROVIDER_API_KEY_ENV_KEYS: Record<string, readonly string[]> = {
  gemini: ["GOOGLE_GENERATIVE_AI_API_KEY"],
  glm: ["GLM_API_KEY", "ZHIPU_API_KEY"],
  deepseek: ["DEEPSEEK_API_KEY"],
};

export function setApiKeys(keys: Record<string, string>): void {
  for (const [id, value] of Object.entries(keys)) {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      keyMap.set(id, trimmed);
    } else {
      keyMap.delete(id);
    }
  }
}

export function clearAllApiKeys(): void {
  keyMap.clear();
}

export function getRuntimeApiKey(providerId: string): string | undefined {
  return keyMap.get(providerId);
}

export function getEnvironmentApiKey(providerId: ProviderId): string | undefined {
  for (const envKey of PROVIDER_API_KEY_ENV_KEYS[providerId] ?? []) {
    const value = process.env[envKey]?.trim();
    if (value) return value;
  }

  return undefined;
}

export function getApiKey(providerId: ProviderId): string | undefined {
  return getRuntimeApiKey(providerId)?.trim() || getEnvironmentApiKey(providerId);
}

export function listConfiguredApiKeyProviders(options: {
  includeEnvironment: boolean;
}): ProviderId[] {
  return PROVIDER_IDS.filter((providerId) => {
    if (getRuntimeApiKey(providerId)?.trim()) return true;
    return options.includeEnvironment && Boolean(getEnvironmentApiKey(providerId));
  });
}
