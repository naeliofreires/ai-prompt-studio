import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiKeySyncClient } from "../src/ui/api/api-key-sync-client";
import { readApiKeys } from "../src/ui/config/api-key-storage";
import { useApiKeyStore } from "../src/ui/store/api-key-store";

vi.mock("../src/ui/api/api-key-sync-client", () => ({
  apiKeySyncClient: {
    syncKeys: vi.fn().mockResolvedValue(undefined),
    clearAll: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("api-key-store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    useApiKeyStore.setState({
      keys: {},
      hydrated: false,
      lastUpdatedAt: null,
    });
  });

  it("persists keys locally and delegates sync to the API key client", () => {
    useApiKeyStore.getState().setKeys({ gemini: "AIzaSy-test" });

    expect(readApiKeys()).toEqual({ gemini: "AIzaSy-test" });
    expect(useApiKeyStore.getState().keys).toEqual({ gemini: "AIzaSy-test" });
    expect(apiKeySyncClient.syncKeys).toHaveBeenCalledWith({ gemini: "AIzaSy-test" });
  });

  it("clears local keys and delegates clear to the API key client", () => {
    useApiKeyStore.getState().setKeys({ gemini: "AIzaSy-test" });
    vi.clearAllMocks();

    useApiKeyStore.getState().clearAll();

    expect(readApiKeys()).toEqual({});
    expect(useApiKeyStore.getState().keys).toEqual({});
    expect(apiKeySyncClient.clearAll).toHaveBeenCalledTimes(1);
  });
});
