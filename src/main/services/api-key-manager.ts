// In-memory key store for the Electron main process.
// Keys arrive from the renderer via IPC (apiKeys:set) and are merged here.
// For production deployments, prefer a server-side proxy that holds keys outside
// the renderer process and enforces auth, rate limits, and allowed models.
// This client-held-key approach is suitable for local-only tools and BYOK use
// cases with explicit risk disclosure in the settings UI.
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

export function getApiKey(providerId: string): string | undefined {
  return keyMap.get(providerId);
}
