import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiKeySyncClient } from "../src/ui/api/api-key-sync-client";

function setBridge(bridge: Partial<Window["aiPromptStudio"]> | undefined): void {
  Object.defineProperty(window, "aiPromptStudio", {
    value: bridge,
    configurable: true,
    writable: true,
  });
}

describe("apiKeySyncClient", () => {
  beforeEach(() => {
    setBridge(undefined);
  });

  it("no-ops when the Electron bridge is absent", async () => {
    await expect(apiKeySyncClient.listConfigured()).resolves.toEqual([]);
    await expect(apiKeySyncClient.syncKeys({ gemini: "AIzaSy-test" })).resolves.toBeUndefined();
    await expect(apiKeySyncClient.clearAll()).resolves.toBeUndefined();
  });

  it("delegates configured provider listing and sync actions to the bridge", async () => {
    const bridge = {
      listConfiguredApiKeys: vi.fn().mockResolvedValue({ providerIds: ["gemini"] }),
      setApiKeys: vi.fn().mockResolvedValue(undefined),
      clearAllApiKeys: vi.fn().mockResolvedValue(undefined),
    };
    setBridge(bridge);

    await expect(apiKeySyncClient.listConfigured()).resolves.toEqual(["gemini"]);
    await apiKeySyncClient.syncKeys({ gemini: "AIzaSy-test" });
    await apiKeySyncClient.clearAll();

    expect(bridge.listConfiguredApiKeys).toHaveBeenCalledTimes(1);
    expect(bridge.setApiKeys).toHaveBeenCalledWith({ gemini: "AIzaSy-test" });
    expect(bridge.clearAllApiKeys).toHaveBeenCalledTimes(1);
  });
});
