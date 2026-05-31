import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useApiKeySessionSync } from "../src/ui/hooks/useApiKeySessionSync";

const mocks = vi.hoisted(() => {
  const state = {
    hydrated: false,
    hydrateFromSession: vi.fn(),
  };

  return {
    state,
    useApiKeyStore: vi.fn((selector: (state: typeof state) => unknown) => selector(state)),
  };
});

vi.mock("../src/ui/store/api-key-store", () => ({
  useApiKeyStore: mocks.useApiKeyStore,
}));

function setVisibilityState(value: DocumentVisibilityState): void {
  Object.defineProperty(document, "visibilityState", {
    value,
    configurable: true,
  });
}

describe("useApiKeySessionSync", () => {
  beforeEach(() => {
    mocks.state.hydrated = false;
    mocks.state.hydrateFromSession.mockClear();
    mocks.useApiKeyStore.mockClear();
    setVisibilityState("visible");
  });

  it("hydrates API keys on mount", () => {
    renderHook(() => useApiKeySessionSync());

    expect(mocks.state.hydrateFromSession).toHaveBeenCalledTimes(1);
  });

  it("rehydrates when an already hydrated tab becomes visible", () => {
    mocks.state.hydrated = true;
    renderHook(() => useApiKeySessionSync());

    setVisibilityState("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(mocks.state.hydrateFromSession).toHaveBeenCalledTimes(1);

    setVisibilityState("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(mocks.state.hydrateFromSession).toHaveBeenCalledTimes(2);
  });
});
