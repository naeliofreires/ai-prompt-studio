import { PROVIDERS, type ProviderId } from "../../shared/domain/provider.js";

const keyMap = new Map<string, string>();

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
  const provider = PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return undefined;

  for (const envKey of provider.envKeys ?? []) {
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
  return PROVIDERS.filter((p) => {
    if (getRuntimeApiKey(p.id)?.trim()) return true;
    return options.includeEnvironment && Boolean(getEnvironmentApiKey(p.id));
  }).map((p) => p.id);
}
