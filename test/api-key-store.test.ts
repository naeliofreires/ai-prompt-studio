import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiKeySyncClient } from "../src/ui/api/api-key-sync-client";
import { readApiKeys } from "../src/ui/config/api-key-storage";
import { isProviderConfigured, useApiKeyStore } from "../src/ui/store/api-key-store";

vi.mock("../src/ui/api/api-key-sync-client", () => ({
  apiKeySyncClient: {
    listConfigured: vi.fn().mockResolvedValue([]),
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
      mainConfiguredProviders: [],
      hydrated: false,
      lastUpdatedAt: null,
    });
    vi.mocked(apiKeySyncClient.listConfigured).mockResolvedValue([]);
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

  it("treats providers reported by main as configured without storing their keys", async () => {
    vi.mocked(apiKeySyncClient.listConfigured).mockResolvedValue(["gemini"]);

    await useApiKeyStore.getState().refreshConfiguredProviders();

    const state = useApiKeyStore.getState();
    expect(readApiKeys()).toEqual({});
    expect(state.mainConfiguredProviders).toEqual(["gemini"]);
    expect(isProviderConfigured(state.keys, "gemini", state.mainConfiguredProviders)).toBe(true);
  });

  it("keeps environment provider status after clearing local keys", async () => {
    vi.mocked(apiKeySyncClient.listConfigured).mockResolvedValue(["gemini"]);
    useApiKeyStore.getState().setKeys({ gemini: "local-gemini" });

    useApiKeyStore.getState().clearAll();

    await waitFor(() => {
      expect(useApiKeyStore.getState().mainConfiguredProviders).toEqual(["gemini"]);
    });
    expect(readApiKeys()).toEqual({});
    expect(useApiKeyStore.getState().keys).toEqual({});
    expect(
      isProviderConfigured(
        useApiKeyStore.getState().keys,
        "gemini",
        useApiKeyStore.getState().mainConfiguredProviders,
      ),
    ).toBe(true);
  });
});
